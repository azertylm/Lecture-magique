import { StoryBookItem } from '../types';

export const BUILTIN_STORIES: StoryBookItem[] = [
  {
    id: 'chat_curieux',
    title: 'Le Petit Chat Curieux',
    coverEmoji: '🐱',
    theme: 'Animaux',
    sentences: [
      {
        text: 'Mimi est un petit chat tout roux.',
        words: [
          { raw: 'Mimi', clean: 'mimi', syllables: ['mi', 'mi'] },
          { raw: 'est', clean: 'est' },
          { raw: 'un', clean: 'un' },
          { raw: 'petit', clean: 'petit', syllables: ['pe', 'tit'] },
          { raw: 'chat', clean: 'chat', syllables: ['chat'], emoji: '🐱' },
          { raw: 'tout', clean: 'tout' },
          { raw: 'roux.', clean: 'roux' }
        ]
      },
      {
        text: 'Il saute sur le grand lit douillet.',
        words: [
          { raw: 'Il', clean: 'il' },
          { raw: 'saute', clean: 'saute', syllables: ['sau', 'te'] },
          { raw: 'sur', clean: 'sur' },
          { raw: 'le', clean: 'le' },
          { raw: 'grand', clean: 'grand' },
          { raw: 'lit', clean: 'lit', syllables: ['lit'], emoji: '🛏️' },
          { raw: 'douillet.', clean: 'douillet' }
        ]
      },
      {
        text: 'Il boit du bon lait frais dans son bol.',
        words: [
          { raw: 'Il', clean: 'il' },
          { raw: 'boit', clean: 'boit' },
          { raw: 'du', clean: 'du' },
          { raw: 'bon', clean: 'bon' },
          { raw: 'lait', clean: 'lait', syllables: ['lait'], emoji: '🥛' },
          { raw: 'frais', clean: 'frais' },
          { raw: 'dans', clean: 'dans' },
          { raw: 'son', clean: 'son' },
          { raw: 'bol.', clean: 'bol', emoji: '🥣' }
        ]
      },
      {
        text: 'Puis Mimi dort et ronronne sous la lune.',
        words: [
          { raw: 'Puis', clean: 'puis' },
          { raw: 'Mimi', clean: 'mimi' },
          { raw: 'dort', clean: 'dort' },
          { raw: 'et', clean: 'et' },
          { raw: 'ronronne', clean: 'ronronne', syllables: ['ron', 'ron', 'ne'] },
          { raw: 'sous', clean: 'sous' },
          { raw: 'la', clean: 'la' },
          { raw: 'lune.', clean: 'lune', syllables: ['lu', 'ne'], emoji: '🌙' }
        ]
      }
    ]
  },
  {
    id: 'fusee_lumo',
    title: 'La Fusée Étoilée',
    coverEmoji: '🚀',
    theme: 'Espace',
    sentences: [
      {
        text: 'Lumo la chouette monte dans la fusée.',
        words: [
          { raw: 'Lumo', clean: 'lumo', syllables: ['lu', 'mo'], emoji: '🦉' },
          { raw: 'la', clean: 'la' },
          { raw: 'chouette', clean: 'chouette', syllables: ['chou', 'et', 'te'] },
          { raw: 'monte', clean: 'monte', syllables: ['mon', 'te'] },
          { raw: 'dans', clean: 'dans' },
          { raw: 'la', clean: 'la' },
          { raw: 'fusée.', clean: 'fusée', syllables: ['fu', 'sée'], emoji: '🚀' }
        ]
      },
      {
        text: 'Cinq, quatre, trois, deux, un... Décollage !',
        words: [
          { raw: 'Cinq,', clean: 'cinq' },
          { raw: 'quatre,', clean: 'quatre' },
          { raw: 'trois,', clean: 'trois' },
          { raw: 'deux,', clean: 'deux' },
          { raw: 'un...', clean: 'un' },
          { raw: 'Décollage', clean: 'décollage', syllables: ['dé', 'col', 'la', 'ge'] },
          { raw: '!', clean: '!' }
        ]
      },
      {
        text: 'La fusée vole vite vers le soleil et la lune.',
        words: [
          { raw: 'La', clean: 'la' },
          { raw: 'fusée', clean: 'fusée', syllables: ['fu', 'sée'] },
          { raw: 'vole', clean: 'vole' },
          { raw: 'vite', clean: 'vite' },
          { raw: 'vers', clean: 'vers' },
          { raw: 'le', clean: 'le' },
          { raw: 'soleil', clean: 'soleil', syllables: ['so', 'leil'], emoji: '☀️' },
          { raw: 'et', clean: 'et' },
          { raw: 'la', clean: 'la' },
          { raw: 'lune.', clean: 'lune', syllables: ['lu', 'ne'], emoji: '🌙' }
        ]
      },
      {
        text: 'Lumo récolte une jolie étoile en or.',
        words: [
          { raw: 'Lumo', clean: 'lumo' },
          { raw: 'récolte', clean: 'récolte', syllables: ['ré', 'col', 'te'] },
          { raw: 'une', clean: 'une' },
          { raw: 'jolie', clean: 'jolie', syllables: ['jo', 'lie'] },
          { raw: 'étoile', clean: 'étoile', syllables: ['é', 'toi', 'le'], emoji: '⭐' },
          { raw: 'en', clean: 'en' },
          { raw: 'or.', clean: 'or' }
        ]
      }
    ]
  },
  {
    id: 'fete_fruits',
    title: 'Le Pique-Nique Gourmand',
    coverEmoji: '🍓',
    theme: 'Aliments',
    sentences: [
      {
        text: 'Dans le grand panier vert, il y a une pomme.',
        words: [
          { raw: 'Dans', clean: 'dans' },
          { raw: 'le', clean: 'le' },
          { raw: 'grand', clean: 'grand' },
          { raw: 'panier', clean: 'panier', syllables: ['pa', 'nier'] },
          { raw: 'vert,', clean: 'vert' },
          { raw: 'il', clean: 'il' },
          { raw: 'y', clean: 'y' },
          { raw: 'a', clean: 'a' },
          { raw: 'une', clean: 'une' },
          { raw: 'pomme.', clean: 'pomme', syllables: ['pom', 'me'], emoji: '🍎' }
        ]
      },
      {
        text: 'Le petit lapin apporte une belle fraise rouge.',
        words: [
          { raw: 'Le', clean: 'le' },
          { raw: 'petit', clean: 'petit' },
          { raw: 'lapin', clean: 'lapin', syllables: ['la', 'pin'], emoji: '🐰' },
          { raw: 'apporte', clean: 'apporte' },
          { raw: 'une', clean: 'une' },
          { raw: 'belle', clean: 'belle' },
          { raw: 'fraise', clean: 'fraise', syllables: ['frai', 'se'], emoji: '🍓' },
          { raw: 'rouge.', clean: 'rouge' }
        ]
      },
      {
        text: 'Tous les amis mangent un gros morceau de gâteau.',
        words: [
          { raw: 'Tous', clean: 'tous' },
          { raw: 'les', clean: 'les' },
          { raw: 'amis', clean: 'amis', syllables: ['a', 'mis'] },
          { raw: 'mangent', clean: 'mangent' },
          { raw: 'un', clean: 'un' },
          { raw: 'gros', clean: 'gros' },
          { raw: 'morceau', clean: 'morceau', syllables: ['mor', 'ceau'] },
          { raw: 'de', clean: 'de' },
          { raw: 'gâteau.', clean: 'gâteau', syllables: ['gâ', 'teau'], emoji: '🍰' }
        ]
      }
    ]
  }
];

export async function generateCustomStory(hero: string, actionOrObject: string): Promise<StoryBookItem> {
  try {
    const res = await fetch('/api/stories/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hero, actionOrObject }),
    });

    if (res.ok) {
      const parsed = await res.json();
      if (parsed.sentences && Array.isArray(parsed.sentences)) {
        return formatGeneratedStory(
          parsed.title || `L'aventure de ${hero}`,
          parsed.coverEmoji || '✨',
          parsed.sentences
        );
      }
    }
  } catch (err) {
    console.warn('API story generation fallback:', err);
  }

  return generateLocalStory(hero, actionOrObject);
}

function generateLocalStory(hero: string, item: string): StoryBookItem {
  const h = hero.trim() || 'Le petit renard';
  const it = item.trim() || 'une étoile magique';
  const sentences = [
    `${h} se promène sous le beau soleil doré.`,
    `Soudain, il aperçoit ${it} au bord du chemin.`,
    `Il fait un grand sourire et invite ses amis à jouer !`
  ];
  return formatGeneratedStory(`L'histoire de ${h}`, '📖', sentences);
}

function formatGeneratedStory(title: string, coverEmoji: string, sentenceStrings: string[]): StoryBookItem {
  return {
    id: 'custom_' + Date.now(),
    title,
    coverEmoji,
    theme: 'Personnalisée',
    sentences: sentenceStrings.map(st => {
      const words = st.split(' ').map(w => {
        const clean = w.replace(/[.,!?;:]/g, '');
        return {
          raw: w,
          clean,
          syllables: guessSyllables(clean)
        };
      });
      return { text: st, words };
    })
  };
}

function guessSyllables(word: string): string[] {
  if (word.length <= 4) return [word];
  // Simple heuristic for 2 chunks
  const mid = Math.floor(word.length / 2);
  return [word.slice(0, mid), word.slice(mid)];
}
