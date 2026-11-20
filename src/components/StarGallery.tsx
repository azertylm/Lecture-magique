import React, { useState } from 'react';
import { WORDS_DATABASE, WORLDS_CONFIG } from '../data/words';
import { WordItem, WorldId, VisualMode } from '../types';
import { WordCard } from './WordCard';
import { Trophy, Star, Sparkles, Award } from 'lucide-react';

interface StarGalleryProps {
  totalStars: number;
  discoveredWordIds: Set<string>;
  highlightVowels: boolean;
}

interface Badge {
  id: string;
  title: string;
  emoji: string;
  desc: string;
  isUnlocked: (stars: number, words: Set<string>) => boolean;
}

const BADGES: Badge[] = [
  {
    id: 'first_word',
    title: 'Premier Mot Déchiffré',
    emoji: '🌱',
    desc: 'Tu as découvert ton premier mot avec Lumo !',
    isUnlocked: (_stars, words) => words.size >= 1
  },
  {
    id: 'star_collector',
    title: 'Chasseur d\'Étoiles',
    emoji: '⭐',
    desc: 'Tu as récolté au moins 10 étoiles d\'or.',
    isUnlocked: (stars) => stars >= 10
  },
  {
    id: 'syllable_master',
    title: 'Maître des Syllabes',
    emoji: '🧪',
    desc: 'Tu as exploré 15 mots différents.',
    isUnlocked: (_stars, words) => words.size >= 15
  },
  {
    id: 'animal_friend',
    title: 'Ami des Animaux',
    emoji: '🐾',
    desc: 'Tu connais les animaux de la forêt et de la jungle.',
    isUnlocked: (_stars, words) => {
      const anims = WORDS_DATABASE.filter(w => w.world === 'animaux');
      return anims.filter(w => words.has(w.id)).length >= 5;
    }
  },
  {
    id: 'story_lover',
    title: 'Petit Poète',
    emoji: '📖',
    desc: 'Tu aimes lire et écouter des histoires magiques.',
    isUnlocked: (stars) => stars >= 20
  },
  {
    id: 'grand_champion',
    title: 'Grand Champion de la Lecture',
    emoji: '👑',
    desc: 'Tu as dépassé les 35 étoiles d\'or ! Bravo !',
    isUnlocked: (stars) => stars >= 35
  }
];

export const StarGallery: React.FC<StarGalleryProps & { visualMode?: VisualMode }> = ({
  totalStars,
  discoveredWordIds,
  highlightVowels,
  visualMode = 'drawing'
}) => {
  const [selectedWorld, setSelectedWorld] = useState<WorldId | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(48);

  const filteredWords = WORDS_DATABASE.filter(w => {
    const matchesWorld = selectedWorld === 'all' || w.world === selectedWorld;
    if (!matchesWorld) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.trim().toLowerCase();
    return (
      w.word.toLowerCase().includes(q) ||
      w.syllables.some(s => s.toLowerCase().includes(q)) ||
      (w.phonemeHelp && w.phonemeHelp.toLowerCase().includes(q))
    );
  });

  const visibleWords = filteredWords.slice(0, visibleCount);

  const handleSelectWorld = (world: WorldId | 'all') => {
    setSelectedWorld(world);
    setVisibleCount(48);
  };

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col items-center gap-6 p-4 sm:p-6 select-none">
      {/* Trophy Header */}
      <div className="flex flex-col items-center text-center gap-2">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/15 border border-amber-400/30 text-amber-700 dark:text-amber-300 font-bold text-xs">
          <Trophy className="w-4 h-4 text-amber-500" />
          <span>Ton Grand Dictionnaire Visuel, Dessins & Photos</span>
        </div>
        <h2 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
          Le Carnet des {WORDS_DATABASE.length} Mots Magiques 🏆
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-lg">
          Explore les {WORDS_DATABASE.length} mots avec leurs <strong>dessins illustrés</strong>, leurs <strong>vraies photos</strong> et ton <strong>ardoise à dessin</strong> ! Clique sur un mot ou une syllabe pour l'écouter.
        </p>

        {/* Counter Badge */}
        <div className="flex flex-wrap items-center justify-center gap-4 mt-2">
          <div className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-amber-500 text-slate-950 font-black text-lg sm:text-xl shadow-lg ring-3 ring-amber-300">
            <Star className="w-6 h-6 fill-slate-950" />
            <span>{totalStars} Étoiles d'or</span>
          </div>

          <div className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-purple-600 text-white font-black text-lg sm:text-xl shadow-lg">
            <Sparkles className="w-5 h-5 text-amber-300" />
            <span>{discoveredWordIds.size} / {WORDS_DATABASE.length} Mots découverts</span>
          </div>
        </div>
      </div>

      {/* Badges Section */}
      <div className="w-full bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm">
        <h3 className="text-sm font-extrabold text-purple-700 dark:text-purple-300 uppercase tracking-wider mb-3 flex items-center gap-2">
          <Award className="w-4 h-4" />
          <span>Tes Badges de Lecteur</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {BADGES.map(badge => {
            const unlocked = badge.isUnlocked(totalStars, discoveredWordIds);
            return (
              <div
                key={badge.id}
                className={`flex flex-col items-center text-center p-3 rounded-2xl border transition-all ${
                  unlocked
                    ? 'bg-amber-50 dark:bg-amber-950/20 border-amber-300 dark:border-amber-500/40 shadow-sm scale-102'
                    : 'bg-slate-100/60 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 opacity-40 grayscale'
                }`}
              >
                <span className="text-3xl mb-1">{badge.emoji}</span>
                <span className="font-extrabold text-xs text-slate-900 dark:text-white leading-tight">
                  {badge.title}
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                  {badge.desc}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Theme Filters & Search */}
      <div className="w-full flex flex-col items-center gap-3 pt-2">
        <div className="w-full flex items-center justify-center flex-wrap gap-2">
          <button
            onClick={() => handleSelectWorld('all')}
            className={`px-3.5 py-1.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
              selectedWorld === 'all'
                ? 'bg-purple-600 text-white shadow-md scale-105'
                : 'bg-white/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-purple-50 dark:hover:bg-slate-700'
            }`}
          >
            🌟 Tous ({WORDS_DATABASE.length})
          </button>

          {(Object.keys(WORLDS_CONFIG) as WorldId[]).map(wid => {
            const cfg = WORLDS_CONFIG[wid];
            const active = selectedWorld === wid;
            const count = WORDS_DATABASE.filter(w => w.world === wid).length;
            return (
              <button
                key={wid}
                onClick={() => handleSelectWorld(wid)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
                  active
                    ? 'bg-purple-600 text-white shadow-md scale-105'
                    : 'bg-white/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-purple-50 dark:hover:bg-slate-700'
                }`}
              >
                <span>{cfg.icon}</span>
                <span>{cfg.label} ({count})</span>
              </button>
            );
          })}
        </div>

        {/* Search by word or phoneme */}
        <div className="w-full max-w-md flex items-center gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setVisibleCount(48);
            }}
            placeholder="Chercher parmi 4 200+ mots ou sons (ex: èr, ier, ou, ch, eau, gn)..."
            className="w-full px-4 py-2 rounded-2xl bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-purple-500/30 text-xs sm:text-sm font-bold text-slate-800 dark:text-white outline-none focus:border-purple-500"
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('');
                setVisibleCount(48);
              }}
              className="px-3 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-xs font-bold cursor-pointer"
            >
              Effacer
            </button>
          )}
        </div>

        <div className="text-xs font-bold text-slate-500 dark:text-slate-400">
          Affichage de {visibleWords.length} sur {filteredWords.length} mots
        </div>
      </div>

      {/* Words Grid */}
      <div className="w-full grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {visibleWords.map((word) => {
          const isDiscovered = discoveredWordIds.has(word.id);
          return (
            <div key={word.id} className="relative">
              <WordCard
                item={word}
                visualMode={visualMode}
                size="sm"
                highlightVowels={highlightVowels}
                className={isDiscovered ? 'ring-2 ring-amber-400/60' : 'opacity-95'}
              />
              {isDiscovered && (
                <div className="absolute -top-1.5 -left-1.5 z-20 bg-amber-400 text-slate-950 font-black text-[10px] px-2 py-0.5 rounded-full shadow-md flex items-center gap-0.5">
                  ⭐ Appris
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Load More Button */}
      {visibleCount < filteredWords.length && (
        <button
          onClick={() => setVisibleCount(prev => prev + 48)}
          className="px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-sm shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer"
        >
          Afficher 48 mots supplémentaires ({filteredWords.length - visibleCount} restants)
        </button>
      )}
    </div>
  );
};
