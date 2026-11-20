/**
 * Types pour Lecture Magique
 */

export type WorldId = 'animaux' | 'aliments' | 'nature' | 'maison' | 'transports' | 'ecole' | 'metiers';

export type VisualMode = 'drawing' | 'photo' | 'duo';

export interface SyllablePart {
  text: string;
  isSilent?: boolean; // ex: 't' in 'chat'
  colorIndex?: number;
}

export interface WordItem {
  id: string;
  emoji: string;
  art: 'le' | 'la' | "l'" | 'les';
  word: string;
  syllables: string[]; // ['gre', 'nouille']
  silentLetter?: string; // 't', 'p', 'd', 's'
  phonemeHelp?: string; // "[ch]", "[ou]", "[on]"
  photoQuery?: string; // Base noun for encyclopedic photo lookup
  preferPhoto?: boolean; // Automatically show real photo when emoji is too generic
  distractors: string[];
  world: WorldId;
}

export type GameModeType = 
  | 'find_word'       // Trouve l'image correspondant au mot écrit/prononcé
  | 'which_one'       // C'est X ou Y ?
  | 'intruder'        // L'intrus (différent)
  | 'audio_hunt'      // Écoute bien et clique
  | 'syllable_puzzle' // Recompose le mot en ordonnant les syllabes
  | 'first_sound';    // Quel mot commence par ce son ?

export interface GameQuestion {
  mode: GameModeType;
  item: WordItem;
  subjectEmoji?: string | null;
  promptText: string;
  speechText: string;
  choices: {
    id: string;
    emoji?: string;
    label: string;
    syllables?: string[];
    wordItem?: WordItem;
    isCorrect: boolean;
  }[];
  syllablePieces?: string[]; // for syllable_puzzle
  successText: string;
  hintText: string;
}

export interface StorySentence {
  text: string;
  words: {
    raw: string;
    clean: string;
    syllables?: string[];
    emoji?: string;
  }[];
}

export interface StoryBookItem {
  id: string;
  title: string;
  coverEmoji: string;
  theme: string;
  sentences: StorySentence[];
}

export interface UserStats {
  totalStars: number;
  wordsDiscovered: string[];
  sessionsCompleted: number;
  streakDays: number;
}
