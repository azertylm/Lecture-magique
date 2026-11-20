import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));

// Cache mémoire pour une lecture vocale instantanée (0 ms au rejeu)
const ttsCache = new Map<string, { audioBase64: string; mimeType: string }>();

/**
 * Découpe un texte long en segments de <= 180 caractères pour Google Neural TTS
 */
function splitTextIntoChunks(text: string, maxLen = 180): string[] {
  const cleaned = text.replace(/\s+/g, ' ').trim();
  if (cleaned.length <= maxLen) return [cleaned];

  const sentences = cleaned.split(/(?<=[.!?…])\s+/);
  const chunks: string[] = [];
  let current = '';

  for (const sentence of sentences) {
    if ((current + ' ' + sentence).trim().length <= maxLen) {
      current = (current + ' ' + sentence).trim();
    } else {
      if (current) chunks.push(current);
      if (sentence.length <= maxLen) {
        current = sentence;
      } else {
        // Split by words
        const words = sentence.split(' ');
        current = '';
        for (const w of words) {
          if ((current + ' ' + w).trim().length <= maxLen) {
            current = (current + ' ' + w).trim();
          } else {
            if (current) chunks.push(current);
            current = w;
          }
        }
      }
    }
  }
  if (current) chunks.push(current);
  return chunks;
}

/**
 * Récupère la voix neuronale naturelle de Google (MP3 haute clarté)
 */
async function fetchGoogleNeuralMp3(text: string, locale = 'fr', slow = false): Promise<string> {
  const chunks = splitTextIntoChunks(text);
  const buffers: Buffer[] = [];
  const speedParam = slow ? '0.24' : '1';

  for (const chunk of chunks) {
    const url = `https://translate.googleapis.com/translate_tts?ie=UTF-8&client=gtx&tl=${encodeURIComponent(
      locale
    )}&ttsspeed=${speedParam}&q=${encodeURIComponent(chunk)}`;

    const response = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        Referer: 'https://translate.google.com/',
      },
    });

    if (!response.ok) {
      throw new Error(`Google Neural TTS status ${response.status}`);
    }

    const arrayBuf = await response.arrayBuffer();
    buffers.push(Buffer.from(arrayBuf));
  }

  return Buffer.concat(buffers).toString('base64');
}

/**
 * Endpoint de Synthèse Vocale Haute Fidélité Google
 * Combine Google Neural TTS (instantané, ultra-naturel, sans robotisation)
 * et Gemini 3.8 Flash Lite TTS lorsque la clé Gemini est active.
 */
app.post('/api/tts', async (req: Request, res: Response) => {
  const { text, voice = 'GoogleNeuralFr', slow = false } = req.body;

  if (!text || typeof text !== 'string') {
    res.status(400).json({ error: 'Text parameter is required' });
    return;
  }

  const cleanText = text.trim();
  const cacheKey = `${voice}_${slow ? 'slow' : 'norm'}_${cleanText}`;

  if (ttsCache.has(cacheKey)) {
    const cached = ttsCache.get(cacheKey)!;
    res.json({
      success: true,
      audioBase64: cached.audioBase64,
      mimeType: cached.mimeType,
      cached: true,
    });
    return;
  }

  const clientApiKey = (req.headers['x-api-key'] as string) || process.env.GEMINI_API_KEY || '';
  const hasValidGeminiKey = Boolean(clientApiKey && clientApiKey !== 'MY_GEMINI_API_KEY' && clientApiKey.length > 15);

  // Si l'utilisateur choisit explicitement une voix Gemini Studio et qu'une clé valide est présente
  if (hasValidGeminiKey && ['Puck', 'Kore', 'Zephyr', 'Fenrir'].includes(voice)) {
    try {
      const aiClient = new GoogleGenAI({
        apiKey: clientApiKey,
        httpOptions: {
          headers: { 'User-Agent': 'aistudio-build' },
        },
      });

      const response = await aiClient.models.generateContent({
        model: 'gemini-3.8-flash-lite-tts',
        contents: cleanText,
        config: {
          responseModalities: ['AUDIO'],
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio) {
        ttsCache.set(cacheKey, { audioBase64: base64Audio, mimeType: 'audio/wav' });
        res.json({
          success: true,
          audioBase64: base64Audio,
          mimeType: 'audio/wav',
        });
        return;
      }
    } catch {
      // Bascule transparente sur Google Neural TTS ci-dessous
    }
  }

  // Voix Neuronale Google (France fr ou Canada fr-CA)
  try {
    const locale = voice === 'GoogleNeuralCa' ? 'fr-CA' : 'fr';
    const mp3Base64 = await fetchGoogleNeuralMp3(cleanText, locale, Boolean(slow));
    ttsCache.set(cacheKey, { audioBase64: mp3Base64, mimeType: 'audio/mpeg' });

    res.json({
      success: true,
      audioBase64: mp3Base64,
      mimeType: 'audio/mpeg',
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erreur TTS';
    res.json({
      success: false,
      fallback: true,
      message: msg,
    });
  }
});

/**
 * Endpoint de génération d'histoire déchiffrable personnalisée pour enfants
 */
app.post('/api/stories/generate', async (req: Request, res: Response) => {
  const { hero, actionOrObject } = req.body;
  const clientApiKey = (req.headers['x-api-key'] as string) || process.env.GEMINI_API_KEY || '';

  if (!clientApiKey || clientApiKey === 'MY_GEMINI_API_KEY') {
    res.status(503).json({ error: 'GEMINI_API_KEY not configured' });
    return;
  }

  try {
    const ai = new GoogleGenAI({
      apiKey: clientApiKey,
      httpOptions: {
        headers: { 'User-Agent': 'aistudio-build' },
      },
    });

    const prompt = `Crée une très courte histoire magique en français pour un enfant en train d'apprendre à lire (niveau CP/CE1).
Héros : ${hero || 'Un petit chat'}
Élément / Action : ${actionOrObject || 'qui découvre une étoile'}
Longueur : 4 phrases simples, joyeuses et encourageantes.
Vocabulaire simple, sons clairs, phrases affirmatives faciles à décoder.

Réponds STRICTEMENT sous forme de JSON valide avec cette structure :
{
  "title": "Titre court et mignon",
  "coverEmoji": "Emoji représentatif",
  "sentences": [
    "Phrase 1 simple",
    "Phrase 2 simple",
    "Phrase 3 simple",
    "Phrase 4 simple"
  ]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Erreur génération histoire';
    res.status(500).json({ error: errorMsg });
  }
});

const photoCache = new Map<string, string | null>();

/**
 * Endpoint de recherche de photographie réelle encyclopédique pour un mot français
 */
app.get('/api/photo', async (req: Request, res: Response) => {
  const rawWord = (req.query.word as string) || '';
  const clean = rawWord.replace(/^(le |la |l'|les |un |une |des )/i, '').trim().toLowerCase();

  if (!clean) {
    res.json({ url: null });
    return;
  }

  if (photoCache.has(clean)) {
    res.json({ url: photoCache.get(clean) });
    return;
  }

  try {
    // 1. Essai direct via Wikipedia FR summary
    const title = clean.charAt(0).toUpperCase() + clean.slice(1);
    const summaryUrl = `https://fr.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`;
    const sumRes = await fetch(summaryUrl, {
      headers: { 'User-Agent': 'LectureMagique/1.0 (https://alphabette.fr)' },
    });

    if (sumRes.ok) {
      const sumData = (await sumRes.json()) as { thumbnail?: { source?: string } };
      if (sumData.thumbnail?.source) {
        photoCache.set(clean, sumData.thumbnail.source);
        res.json({ url: sumData.thumbnail.source });
        return;
      }
    }

    // 2. Fallback recherche pageimages sur Wikipedia FR
    const searchUrl = `https://fr.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(
      clean
    )}&gsrlimit=4&prop=pageimages&pithumbsize=400&format=json`;
    const searchRes = await fetch(searchUrl, {
      headers: { 'User-Agent': 'LectureMagique/1.0 (https://alphabette.fr)' },
    });

    if (searchRes.ok) {
      const searchData = (await searchRes.json()) as {
        query?: { pages?: Record<string, { thumbnail?: { source?: string } }> };
      };
      const pages = Object.values(searchData.query?.pages || {});
      const pageWithImg = pages.find((p) => p.thumbnail?.source);
      if (pageWithImg?.thumbnail?.source) {
        photoCache.set(clean, pageWithImg.thumbnail.source);
        res.json({ url: pageWithImg.thumbnail.source });
        return;
      }
    }

    photoCache.set(clean, null);
    res.json({ url: null });
  } catch {
    res.json({ url: null });
  }
});

async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        host: '0.0.0.0',
        port: 3000,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist/index.html'));
    });
  }

  app.listen(Number(port), '0.0.0.0', () => {
    console.log(`Lecture Magique server running on http://localhost:${port}`);
  });
}

startServer();
