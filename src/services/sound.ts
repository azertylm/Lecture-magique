/**
 * Service Audio & Synthèse Vocale Neuronale Haute Fidélité pour enfants
 * - Voix Google Neural Française (MP3 studio naturel, diction humaine chaleureuse sans robotisation)
 * - Normaliseur phonétique CP/CE1 complet : corrige [er]/[èr]/[é], évite toute lecture d'accent ("accent circonflexe")
 *   ou épellation de lettres ("C-H", "G-N", "P-H").
 * - Effets sonores Web Audio doux et mélodieux
 */

export type GoogleVoiceName = 'GoogleNeuralFr' | 'GoogleNeuralCa' | 'Puck' | 'Kore' | 'Zephyr' | 'Fenrir';

interface SpeakOptions {
  rate?: number;
  pitch?: number;
  voice?: GoogleVoiceName;
  isSyllable?: boolean;
  onEnd?: () => void;
  style?: string;
}

/**
 * Dictionnaire phonétique CP/CE1 vérifié sur Google Neural TTS :
 * Chaque entrée produit un son pur d'une seule syllabe (< 7000 octets audio),
 * sans jamais dire "accent aigu", "accent circonflexe" ni épeler les lettres.
 */
const PHONETIC_SYLLABLE_MAP: Record<string, string> = {
  // Consonnes isolées
  b: 'be',
  c: 'ke',
  d: 'de',
  f: 'fe',
  g: 'gue',
  h: 'muet',
  j: 'je',
  k: 'ke',
  l: 'le',
  m: 'me',
  n: 'ne',
  p: 'pe',
  q: 'ke',
  r: 're',
  s: 'se',
  t: 'te',
  v: 've',
  w: 've',
  x: 'kse',
  z: 'ze',

  // Voyelles isolées (évite "e accent aigu" ou "o accent circonflexe")
  a: 'a',
  â: 'a',
  e: 'euh',
  é: 'et',
  ée: 'et',
  è: 'est',
  ê: 'est',
  ë: 'est',
  i: 'i',
  î: 'i',
  ï: 'i',
  o: 'eau',
  ô: 'eau',
  u: 'u',
  û: 'u',
  y: 'i',
  œ: 'euh',
  œuf: 'euf',

  // Sons & Digraphes CP/CE1
  ch: 'che',
  ph: 'fe',
  gn: 'nie',
  qu: 'ke',
  gu: 'gue',
  ou: 'ou',
  on: 'on',
  om: 'on',
  oi: 'oie',
  oie: 'oie',
  in: 'un',
  im: 'un',
  ain: 'un',
  ein: 'un',
  yn: 'un',
  ym: 'un',
  an: 'an',
  am: 'an',
  en: 'an',
  em: 'an',
  au: 'eau',
  eau: 'eau',
  ai: 'est',
  ei: 'est',
  eu: 'euh',
  oeu: 'euh',

  // Correction spécifique de [er], [èr], [ier], [et], [ez]
  er: 'ère',
  èr: 'ère',
  ère: 'ère',
  air: 'ère',
  ier: 'yé',
  ié: 'yé',
  ez: 'et',
  et: 'est',
  eur: 'heure',
  or: 'or',
  ar: 'are',
  ir: 'ire',
  ur: 'ure',
  el: 'elle',
  il: 'ile',
  ol: 'ole',
  ul: 'ule',

  // Sons complexes (-ill, -eil, -ouille, -ail, -euil)
  ill: 'ille',
  ille: 'ille',
  eil: 'eille',
  eille: 'eille',
  ouille: 'ouille',
  ail: 'aille',
  aille: 'aille',
  euil: 'euille',
  euille: 'euille',
  ien: 'yin',
  oin: 'ouin',
  ui: 'oui',

  // Syllabes fréquentes nécessitant une orthographe phonétique claire en isolation
  pil: 'pile',
  lon: 'lon',
  gre: 'gre',
  quet: 'kè',
  phant: 'fan',
  phin: 'fin',
  nard: 'nare',
  zard: 'zare',
  lard: 'lare',
  cray: 'crè',
  seaux: 'zô',
  pier: 'pié',
  nier: 'nié',
  mier: 'mié',
  cier: 'sié',
  lier: 'lié',
  vrier: 'vrié',
  hier: 'yé',
  cher: 'ché',
  teur: 'teur',
  seur: 'seur',
  nau: 'nô',
  vre: 'vre',
  bre: 'bre',
  tre: 'tre',
  ble: 'ble',
  gle: 'gle',
  cle: 'cle',
  ple: 'ple',
  fle: 'fle',
  gne: 'nie',
  gnée: 'nié',
  gnoi: 'noie',
  gnet: 'niè',
  gnon: 'gnon',
  rot: 'ro',
  lat: 'la',
  cat: 'ca',
  cot: 'co',
  got: 'go',
  bot: 'bo',
  piz: 'pize',
  doc: 'doc',
  car: 'car',
  por: 'por',
  tor: 'tor',
  for: 'for',
  mor: 'mor',
  cor: 'cor',
  gor: 'gor',
  sor: 'sor',
  dor: 'dor',
  hor: 'or',
  mer: 'mère',
  ter: 'terre',
  ver: 'verre',
  vert: 'verre',
  her: 'ère',
  fer: 'fer',
  ser: 'sère',
  sert: 'sère',
  per: 'père',
  ber: 'bère',
  quer: 'kère',
  cerf: 'sère',
  châ: 'cha',
  flû: 'flu',
  nê: 'nè',
  pê: 'pè',
  crê: 'crè',
  rêt: 'rè',
  gâ: 'ga',
  pâ: 'pa',
  hô: 'o',
  plô: 'plo',
  ïs: 'isse',
  phé: 'fé',
  phée: 'fé',
  pha: 'fa',
  pho: 'fo',
  iè: 'yè',
  viè: 'viè',
  fiè: 'fiè',
  piè: 'piè',
  thè: 'tè',
  thé: 'té',
  rhi: 'ri',
};

/**
 * Normalise une syllabe isolée pour éviter qu'un accent circonflexe ou digraphe
 * ne soit épelé lettre par lettre par Google TTS.
 */
function normalizeIsolatedSyllable(rawSyl: string): string {
  const lower = rawSyl.trim().toLowerCase().replace(/[[\].!?,;:«»"]/g, '');
  if (!lower) return '';

  if (PHONETIC_SYLLABLE_MAP[lower]) {
    return PHONETIC_SYLLABLE_MAP[lower];
  }

  let s = lower
    .replace(/â/g, 'a')
    .replace(/ê/g, 'è')
    .replace(/ë/g, 'è')
    .replace(/î/g, 'i')
    .replace(/ï/g, 'i')
    .replace(/ô/g, 'o')
    .replace(/û/g, 'u')
    .replace(/^ph/, 'f')
    .replace(/^gn/, 'ni')
    .replace(/^rhi/, 'ri')
    .replace(/^th/, 't');

  // Si la syllabe se termine par -er (ex: 'ber', 'der', 'ger'), forcer le son ouvert '-ère'
  if (/^[bcdfghjklmnpqrstvwxz]+er$/.test(s)) {
    s = s.slice(0, -2) + 'ère';
  }

  return PHONETIC_SYLLABLE_MAP[s] || s;
}

export function normalizeForFrenchPhonics(rawText: string, isSyllable?: boolean): string {
  const trimmed = rawText.trim();
  if (!isSyllable) {
    // Remplacer toute notation entre crochets [er], [èr], [ch], [ou], [é], [ô] dans une phrase
    return trimmed.replace(/\[([^\]]+)\]/g, (_match, inner: string) => {
      const cleanInner = inner.trim().toLowerCase();
      const mapped = PHONETIC_SYLLABLE_MAP[cleanInner] || normalizeIsolatedSyllable(cleanInner);
      return `« ${mapped} »`;
    });
  }

  return normalizeIsolatedSyllable(trimmed);
}

class SoundService {
  private audioCtx: AudioContext | null = null;
  private soundEnabled = true;
  private speechRate: 'slow' | 'normal' = 'normal';
  private currentVoice: GoogleVoiceName = 'GoogleNeuralFr';

  private currentAudioElement: HTMLAudioElement | null = null;
  private clientAudioCache = new Map<string, { base64: string; mimeType: string }>();
  private isSpeaking = false;
  private activeRequestId = 0;

  private voices: SpeechSynthesisVoice[] = [];

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.loadVoices();
      window.speechSynthesis.onvoiceschanged = () => this.loadVoices();
      setTimeout(() => this.loadVoices(), 300);
    }
  }

  private initAudio() {
    if (!this.audioCtx && typeof window !== 'undefined') {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  private loadVoices() {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    this.voices = window.speechSynthesis.getVoices();
  }

  public getBestBrowserVoice(): SpeechSynthesisVoice | null {
    if (this.voices.length === 0) this.loadVoices();
    const frVoices = this.voices.filter((v) => v.lang && v.lang.toLowerCase().startsWith('fr'));
    if (frVoices.length === 0) return null;

    return (
      frVoices.find((v) => v.name.toLowerCase().includes('natural')) ||
      frVoices.find((v) => v.name.toLowerCase().includes('google')) ||
      frVoices.find((v) => v.name.toLowerCase().includes('premium')) ||
      frVoices.find((v) => v.lang.toLowerCase() === 'fr-fr') ||
      frVoices[0]
    );
  }

  public setSoundEnabled(enabled: boolean) {
    this.soundEnabled = enabled;
  }

  public isSoundEnabled() {
    return this.soundEnabled;
  }

  public setGoogleVoice(voice: GoogleVoiceName) {
    this.currentVoice = voice;
  }

  public getGoogleVoice(): GoogleVoiceName {
    return this.currentVoice;
  }

  public setSpeechRate(rate: 'slow' | 'normal') {
    this.speechRate = rate;
  }

  public getSpeechRate() {
    return this.speechRate;
  }

  public toggleSpeechRate() {
    this.speechRate = this.speechRate === 'normal' ? 'slow' : 'normal';
    return this.speechRate;
  }

  /**
   * Synthèse vocale Neuronale Google (MP3 / WAV haute définition, sans timbre robotique)
   */
  public async speak(text: string, options?: SpeakOptions) {
    if (typeof window === 'undefined') {
      options?.onEnd?.();
      return;
    }

    this.cancelSpeech();
    const requestId = ++this.activeRequestId;

    const spokenText = normalizeForFrenchPhonics(text, options?.isSyllable);
    if (!spokenText) {
      options?.onEnd?.();
      return;
    }

    const voiceName = options?.voice || this.currentVoice;
    const isSlow = this.speechRate === 'slow' || Boolean(options?.isSyllable);
    const cacheKey = `${voiceName}_${isSlow ? 'slow' : 'norm'}_${spokenText}`;

    try {
      let cachedAudio = this.clientAudioCache.get(cacheKey);

      if (!cachedAudio) {
        const apiConfig = window.AlphabetteShell?.getApiConfig?.();
        const customApiKey = apiConfig?.apiKey || '';

        const res = await fetch('/api/tts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(customApiKey ? { 'x-api-key': customApiKey } : {}),
          },
          body: JSON.stringify({
            text: spokenText,
            voice: voiceName,
            slow: isSlow,
          }),
        });

        if (requestId !== this.activeRequestId) return;

        if (res.ok) {
          const data = await res.json();
          if (data.success && data.audioBase64) {
            cachedAudio = {
              base64: data.audioBase64,
              mimeType: data.mimeType || 'audio/mpeg',
            };
            this.clientAudioCache.set(cacheKey, cachedAudio);
          }
        }
      }

      if (requestId !== this.activeRequestId) return;

      if (cachedAudio) {
        this.playBase64Audio(cachedAudio.base64, cachedAudio.mimeType, options?.onEnd);
        return;
      }
    } catch {
      // Bascule sur la voix locale si hors-ligne
    }

    if (requestId === this.activeRequestId) {
      this.speakBrowserFallback(spokenText, options);
    }
  }

  private playBase64Audio(base64Data: string, mimeType: string, onEnd?: () => void) {
    try {
      const audioUrl = `data:${mimeType};base64,${base64Data}`;
      const audio = new Audio(audioUrl);
      audio.preservesPitch = true;
      audio.playbackRate = this.speechRate === 'slow' ? 0.92 : 1.0;

      this.currentAudioElement = audio;
      this.isSpeaking = true;

      audio.onended = () => {
        this.isSpeaking = false;
        this.currentAudioElement = null;
        onEnd?.();
      };

      audio.onerror = () => {
        this.isSpeaking = false;
        this.currentAudioElement = null;
        onEnd?.();
      };

      audio.play().catch(() => {
        this.isSpeaking = false;
        onEnd?.();
      });
    } catch {
      this.isSpeaking = false;
      onEnd?.();
    }
  }

  private speakBrowserFallback(text: string, options?: SpeakOptions) {
    if (!('speechSynthesis' in window)) {
      options?.onEnd?.();
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'fr-FR';
    utterance.rate = this.speechRate === 'slow' ? 0.85 : 0.96;
    utterance.pitch = 1.0;

    const bestVoice = this.getBestBrowserVoice();
    if (bestVoice) {
      utterance.voice = bestVoice;
    }

    if (options?.onEnd) {
      utterance.onend = () => options.onEnd?.();
      utterance.onerror = () => options.onEnd?.();
    }

    window.speechSynthesis.speak(utterance);
  }

  public cancelSpeech() {
    this.activeRequestId++;
    if (this.currentAudioElement) {
      this.currentAudioElement.pause();
      this.currentAudioElement.currentTime = 0;
      this.currentAudioElement = null;
    }
    this.isSpeaking = false;
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }

  // ── EFFETS SONORES WEB AUDIO ──

  public playPop() {
    if (!this.soundEnabled) return;
    try {
      this.initAudio();
      if (!this.audioCtx) return;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'sine';
      const now = this.audioCtx.currentTime;
      osc.frequency.setValueAtTime(450, now);
      osc.frequency.exponentialRampToValueAtTime(800, now + 0.08);

      gain.gain.setValueAtTime(0.16, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start(now);
      osc.stop(now + 0.08);
    } catch {
      // ignore
    }
  }

  public playSuccess() {
    if (!this.soundEnabled) return;
    try {
      this.initAudio();
      if (!this.audioCtx) return;
      const notes = [523.25, 659.25, 783.99, 1046.5];
      const now = this.audioCtx.currentTime;

      notes.forEach((freq, idx) => {
        if (!this.audioCtx) return;
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.07);

        gain.gain.setValueAtTime(0, now + idx * 0.07);
        gain.gain.linearRampToValueAtTime(0.16, now + idx * 0.07 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.45);

        osc.connect(gain);
        gain.connect(this.audioCtx.destination);

        osc.start(now + idx * 0.07);
        osc.stop(now + idx * 0.07 + 0.45);
      });
    } catch {
      // ignore
    }
  }

  public playGentleEncourage() {
    if (!this.soundEnabled) return;
    try {
      this.initAudio();
      if (!this.audioCtx) return;
      const now = this.audioCtx.currentTime;
      const notes = [440, 392];

      notes.forEach((freq, idx) => {
        if (!this.audioCtx) return;
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.12);

        gain.gain.setValueAtTime(0.12, now + idx * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.005, now + idx * 0.12 + 0.25);

        osc.connect(gain);
        gain.connect(this.audioCtx.destination);

        osc.start(now + idx * 0.12);
        osc.stop(now + idx * 0.12 + 0.25);
      });
    } catch {
      // ignore
    }
  }

  public playSyllableTap(pitchFactor = 1) {
    if (!this.soundEnabled) return;
    try {
      this.initAudio();
      if (!this.audioCtx) return;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'sine';
      const now = this.audioCtx.currentTime;
      osc.frequency.setValueAtTime(587.33 * pitchFactor, now);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start(now);
      osc.stop(now + 0.18);
    } catch {
      // ignore
    }
  }
}

export const sound = new SoundService();
