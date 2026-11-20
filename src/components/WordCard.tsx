import React from 'react';
import { WordItem, getFullWordText } from '../data/words';
import { VisualMode } from '../types';
import { sound } from '../services/sound';
import { WordIllustration } from './WordIllustration';
import { Volume2 } from 'lucide-react';

interface WordCardProps {
  item: WordItem;
  visualMode?: VisualMode;
  showSyllables?: boolean;
  highlightVowels?: boolean;
  showSilentLetters?: boolean;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onSelect?: () => void;
  className?: string;
}

const SYLLABLE_COLORS = [
  'text-purple-600 dark:text-purple-300 bg-purple-100 dark:bg-purple-900/40 border-purple-300 dark:border-purple-600/40',
  'text-teal-600 dark:text-teal-300 bg-teal-100 dark:bg-teal-900/40 border-teal-300 dark:border-teal-600/40',
  'text-amber-600 dark:text-amber-300 bg-amber-100 dark:bg-amber-900/40 border-amber-300 dark:border-amber-600/40',
  'text-rose-600 dark:text-rose-300 bg-rose-100 dark:bg-rose-900/40 border-rose-300 dark:border-rose-600/40'
];

const VOWELS = new Set(['a', 'e', 'i', 'o', 'u', 'y', 'é', 'è', 'ê', 'ë', 'à', 'â', 'î', 'ï', 'ô', 'ù', 'û']);

export const WordCard: React.FC<WordCardProps> = ({
  item,
  visualMode = 'drawing',
  showSyllables = true,
  highlightVowels = false,
  showSilentLetters = true,
  size = 'md',
  onSelect,
  className = ''
}) => {
  const fullText = getFullWordText(item);

  const handleSpeakWord = (e: React.MouseEvent) => {
    e.stopPropagation();
    sound.playPop();
    sound.speak(fullText);
  };

  const handleSpeakSyllable = (syl: string, idx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    sound.playSyllableTap(1 + idx * 0.15);
    sound.speak(syl, { isSyllable: true });
  };

  const handleSpeakPhoneme = (phoneme: string, e: React.MouseEvent) => {
    e.stopPropagation();
    sound.playPop();
    sound.speak(phoneme, { isSyllable: true });
  };

  const renderColoredLetters = (text: string) => {
    return text.split('').map((char, i) => {
      const lower = char.toLowerCase();
      const isVowel = VOWELS.has(lower);
      return (
        <span
          key={i}
          className={
            highlightVowels
              ? isVowel
                ? 'text-red-500 font-extrabold'
                : 'text-blue-600 dark:text-blue-400 font-bold'
              : ''
          }
        >
          {char}
        </span>
      );
    });
  };

  const sizeClasses = {
    sm: {
      wrap: 'p-4 rounded-3xl',
      art: 'text-base sm:text-xl',
      word: 'text-2xl sm:text-3xl',
      syl: 'text-base sm:text-lg px-2.5 py-1'
    },
    md: {
      wrap: 'p-5 rounded-3xl',
      art: 'text-lg sm:text-2xl',
      word: 'text-3xl sm:text-4xl',
      syl: 'text-lg sm:text-xl px-3 py-1'
    },
    lg: {
      wrap: 'p-6 sm:p-8 rounded-3xl',
      art: 'text-xl sm:text-3xl',
      word: 'text-4xl sm:text-5xl',
      syl: 'text-xl sm:text-2xl px-4 py-1.5'
    }
  }[size];

  return (
    <div
      onClick={onSelect || handleSpeakWord}
      className={`relative flex flex-col items-center justify-between border-2 transition-all cursor-pointer ${
        sizeClasses.wrap
      } bg-white/95 dark:bg-slate-900/95 border-slate-200 dark:border-purple-500/25 shadow-lg hover:shadow-xl hover:border-purple-400 dark:hover:border-purple-400 group ${className}`}
      style={{
        backdropFilter: 'blur(8px)'
      }}
    >
      {/* Speaker button in corner */}
      <button
        onClick={handleSpeakWord}
        title="Écouter le mot complet"
        className="absolute top-2.5 right-2.5 z-20 w-9 h-9 rounded-full bg-purple-100 dark:bg-purple-900/60 hover:bg-purple-200 dark:hover:bg-purple-800 text-purple-700 dark:text-purple-300 flex items-center justify-center transition-transform active:scale-90 shadow-xs"
      >
        <Volume2 className="w-4 h-4" />
      </button>

      {/* Rich Visual Representation (Drawing Scene, Real Photo, or Duo) */}
      <div className="my-1.5">
        <WordIllustration item={item} visualMode={visualMode} size={size} showControls={true} />
      </div>

      {/* Article + Word — LARGE FOR YOUNG READERS */}
      <div className="flex flex-col items-center gap-2 w-full text-center mt-1.5">
        <div className="flex flex-wrap items-baseline justify-center gap-2">
          <span className={`text-purple-600 dark:text-purple-400 font-bold ${sizeClasses.art}`}>
            {item.art}
          </span>
          <span className={`font-black tracking-wide leading-tight ${sizeClasses.word} text-slate-900 dark:text-white`}>
            {highlightVowels ? (
              renderColoredLetters(item.word)
            ) : showSilentLetters && item.silentLetter && item.word.endsWith(item.silentLetter) ? (
              <>
                {item.word.slice(0, -item.silentLetter.length)}
                <span className="opacity-40 underline decoration-dotted decoration-purple-400" title="Lettre muette">
                  {item.silentLetter}
                </span>
              </>
            ) : (
              item.word
            )}
          </span>
        </div>

        {/* Syllables breakdown pills */}
        {showSyllables && item.syllables && item.syllables.length > 0 && (
          <div className="flex flex-wrap items-center justify-center gap-1.5 mt-1 pt-2 border-t border-slate-100 dark:border-slate-800 w-full">
            {item.syllables.map((syl: string, i: number) => {
              const colorClass = SYLLABLE_COLORS[i % SYLLABLE_COLORS.length];
              return (
                <button
                  key={i}
                  onClick={(e) => handleSpeakSyllable(syl, i, e)}
                  title={`Écouter la syllabe "${syl}"`}
                  className={`font-black rounded-xl border tracking-wider transition-transform hover:scale-105 active:scale-95 cursor-pointer shadow-sm ${sizeClasses.syl} ${colorClass}`}
                >
                  {syl}
                </button>
              );
            })}
          </div>
        )}

        {/* Clickable Phoneme helper if present */}
        {item.phonemeHelp && (
          <button
            type="button"
            onClick={(e) => handleSpeakPhoneme(item.phonemeHelp!, e)}
            title={`Écouter le son [${item.phonemeHelp}]`}
            className="mt-0.5 px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-100 dark:hover:bg-purple-900 border border-purple-200/80 dark:border-purple-700/50 text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-300 transition-transform hover:scale-105 active:scale-95 cursor-pointer"
          >
            Son vedette : <span className="text-purple-600 dark:text-purple-400 font-black">[{item.phonemeHelp}] 🔊</span>
          </button>
        )}
      </div>
    </div>
  );
};
