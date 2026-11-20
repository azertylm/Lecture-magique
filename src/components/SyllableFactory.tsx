import React, { useState } from 'react';
import { sound } from '../services/sound';
import { WORDS_DATABASE, getFullWordText } from '../data/words';
import { Sparkles, Volume2, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';

interface SyllableMatch {
  syllable: string;
  exampleWord: string;
  emoji: string;
  article: string;
}

const CONSONANTS = [
  { letter: 'B', soundName: 'beu' },
  { letter: 'P', soundName: 'peu' },
  { letter: 'L', soundName: 'leu' },
  { letter: 'M', soundName: 'meu' },
  { letter: 'T', soundName: 'teu' },
  { letter: 'R', soundName: 'reu' },
  { letter: 'D', soundName: 'deu' },
  { letter: 'S', soundName: 'seu' },
  { letter: 'V', soundName: 'veu' },
  { letter: 'N', soundName: 'neu' },
  { letter: 'F', soundName: 'feu' },
  { letter: 'C', soundName: 'keu' },
  { letter: 'G', soundName: 'gueu' },
  { letter: 'J', soundName: 'jeu' },
  { letter: 'CH', soundName: 'cheu' },
];

const VOWELS = [
  { letter: 'A', soundName: 'a' },
  { letter: 'E', soundName: 'eu' },
  { letter: 'I', soundName: 'i' },
  { letter: 'O', soundName: 'o' },
  { letter: 'U', soundName: 'u' },
  { letter: 'É', soundName: 'é' },
  { letter: 'OU', soundName: 'ou' },
  { letter: 'ON', soundName: 'on' },
  { letter: 'OI', soundName: 'oi' },
  { letter: 'AN', soundName: 'an' },
  { letter: 'IN', soundName: 'un' },
  { letter: 'AU', soundName: 'ô' },
];

const SYLLABLE_DICTIONARY: Record<string, SyllableMatch> = {
  'BA': { syllable: 'BA', exampleWord: 'banane', emoji: '🍌', article: 'la' },
  'BE': { syllable: 'BE', exampleWord: 'beurre', emoji: '🧈', article: 'le' },
  'BI': { syllable: 'BI', exampleWord: 'biscuit', emoji: '🍪', article: 'le' },
  'BO': { syllable: 'BO', exampleWord: 'bol', emoji: '🥣', article: 'le' },
  'BU': { syllable: 'BU', exampleWord: 'bus', emoji: '🚌', article: 'le' },
  'BÉ': { syllable: 'BÉ', exampleWord: 'bébé', emoji: '👶', article: 'le' },
  'BOU': { syllable: 'BOU', exampleWord: 'bougie', emoji: '🕯️', article: 'la' },
  'BON': { syllable: 'BON', exampleWord: 'bonbon', emoji: '🍬', article: 'le' },
  'BOI': { syllable: 'BOI', exampleWord: 'boîte', emoji: '📦', article: 'la' },
  'BAN': { syllable: 'BAN', exampleWord: 'bambou', emoji: '🎋', article: 'le' },
  'BIN': { syllable: 'BIN', exampleWord: 'bain', emoji: '🛁', article: 'le' },
  'BAU': { syllable: 'BAU', exampleWord: 'bateau', emoji: '⛵', article: 'le' },

  'PA': { syllable: 'PA', exampleWord: 'papillon', emoji: '🦋', article: 'le' },
  'PE': { syllable: 'PE', exampleWord: 'petit', emoji: '🐥', article: 'le' },
  'PI': { syllable: 'PI', exampleWord: 'pizza', emoji: '🍕', article: 'la' },
  'PO': { syllable: 'PO', exampleWord: 'pomme', emoji: '🍎', article: 'la' },
  'PU': { syllable: 'PU', exampleWord: 'puzzle', emoji: '🧩', article: 'le' },
  'PÉ': { syllable: 'PÉ', exampleWord: 'pêche', emoji: '🍑', article: 'la' },
  'POU': { syllable: 'POU', exampleWord: 'poule', emoji: '🐔', article: 'la' },
  'PON': { syllable: 'PON', exampleWord: 'pont', emoji: '🌉', article: 'le' },
  'POI': { syllable: 'POI', exampleWord: 'poire', emoji: '🍐', article: 'la' },
  'PAN': { syllable: 'PAN', exampleWord: 'panda', emoji: '🐼', article: 'le' },
  'PIN': { syllable: 'PIN', exampleWord: 'pinceau', emoji: '🖌️', article: 'le' },
  'PAU': { syllable: 'PAU', exampleWord: 'paume', emoji: '✋', article: 'la' },

  'LA': { syllable: 'LA', exampleWord: 'lapin', emoji: '🐰', article: 'le' },
  'LE': { syllable: 'LE', exampleWord: 'levier', emoji: '🕹️', article: 'le' },
  'LI': { syllable: 'LI', exampleWord: 'lit', emoji: '🛏️', article: 'le' },
  'LO': { syllable: 'LO', exampleWord: 'lotus', emoji: '🪷', article: 'le' },
  'LU': { syllable: 'LU', exampleWord: 'lune', emoji: '🌙', article: 'la' },
  'LÉ': { syllable: 'LÉ', exampleWord: 'lézard', emoji: '🦎', article: 'le' },
  'LOU': { syllable: 'LOU', exampleWord: 'loup', emoji: '🐺', article: 'le' },
  'LON': { syllable: 'LON', exampleWord: 'violon', emoji: '🎻', article: 'le' },
  'LOI': { syllable: 'LOI', exampleWord: 'loir', emoji: '🐹', article: 'le' },
  'LAN': { syllable: 'LAN', exampleWord: 'lampe', emoji: '💡', article: 'la' },
  'LIN': { syllable: 'LIN', exampleWord: 'moulin', emoji: '🏡', article: 'le' },
  'LAU': { syllable: 'LAU', exampleWord: 'laurier', emoji: '🌿', article: 'le' },

  'MA': { syllable: 'MA', exampleWord: 'maison', emoji: '🏠', article: 'la' },
  'ME': { syllable: 'ME', exampleWord: 'melon', emoji: '🍈', article: 'le' },
  'MI': { syllable: 'MI', exampleWord: 'miel', emoji: '🍯', article: 'le' },
  'MO': { syllable: 'MO', exampleWord: 'moto', emoji: '🏍️', article: 'la' },
  'MU': { syllable: 'MU', exampleWord: 'musique', emoji: '🎵', article: 'la' },
  'MÉ': { syllable: 'MÉ', exampleWord: 'méduse', emoji: '🪼', article: 'la' },
  'MOU': { syllable: 'MOU', exampleWord: 'mouton', emoji: '🐑', article: 'le' },
  'MON': { syllable: 'MON', exampleWord: 'montagne', emoji: '⛰️', article: 'la' },
  'MOI': { syllable: 'MOI', exampleWord: 'moineau', emoji: '🐦', article: 'le' },
  'MAN': { syllable: 'MAN', exampleWord: 'mangue', emoji: '🥭', article: 'la' },
  'MIN': { syllable: 'MIN', exampleWord: 'main', emoji: '✋', article: 'la' },
  'MAU': { syllable: 'MAU', exampleWord: 'manteau', emoji: '🧥', article: 'le' },

  'TA': { syllable: 'TA', exampleWord: 'tapis', emoji: '🧶', article: 'le' },
  'TE': { syllable: 'TE', exampleWord: 'terre', emoji: '🌍', article: 'la' },
  'TI': { syllable: 'TI', exampleWord: 'tigre', emoji: '🐯', article: 'le' },
  'TO': { syllable: 'TO', exampleWord: 'tortue', emoji: '🐢', article: 'la' },
  'TU': { syllable: 'TU', exampleWord: 'tulipe', emoji: '🌷', article: 'la' },
  'TÉ': { syllable: 'TÉ', exampleWord: 'télévision', emoji: '📺', article: 'la' },
  'TOU': { syllable: 'TOU', exampleWord: 'toupie', emoji: '🪀', article: 'la' },
  'TON': { syllable: 'TON', exampleWord: 'mouton', emoji: '🐑', article: 'le' },
  'TOI': { syllable: 'TOI', exampleWord: 'étoile', emoji: '⭐', article: "l'" },
  'TAN': { syllable: 'TAN', exampleWord: 'tente', emoji: '⛺', article: 'la' },
  'TIN': { syllable: 'TIN', exampleWord: 'lutin', emoji: '🧝', article: 'le' },
  'TAU': { syllable: 'TAU', exampleWord: 'gâteau', emoji: '🍰', article: 'le' },

  'RA': { syllable: 'RA', exampleWord: 'radis', emoji: '🫜', article: 'le' },
  'RE': { syllable: 'RE', exampleWord: 'renard', emoji: '🦊', article: 'le' },
  'RI': { syllable: 'RI', exampleWord: 'riz', emoji: '🍚', article: 'le' },
  'RO': { syllable: 'RO', exampleWord: 'robot', emoji: '🤖', article: 'le' },
  'RU': { syllable: 'RU', exampleWord: 'ruche', emoji: '🐝', article: 'la' },
  'RÉ': { syllable: 'RÉ', exampleWord: 'réveil', emoji: '⏰', article: 'le' },
  'ROU': { syllable: 'ROU', exampleWord: 'roue', emoji: '🛞', article: 'la' },
  'RON': { syllable: 'RON', exampleWord: 'couronne', emoji: '👑', article: 'la' },
  'ROI': { syllable: 'ROI', exampleWord: 'roi', emoji: '🤴', article: 'le' },
  'RAN': { syllable: 'RAN', exampleWord: 'orange', emoji: '🍊', article: "l'" },
  'RIN': { syllable: 'RIN', exampleWord: 'sapin', emoji: '🎄', article: 'le' },
  'RAU': { syllable: 'RAU', exampleWord: 'radeau', emoji: '🪵', article: 'le' },

  'DA': { syllable: 'DA', exampleWord: 'panda', emoji: '🐼', article: 'le' },
  'DE': { syllable: 'DE', exampleWord: 'dent', emoji: '🦷', article: 'la' },
  'DI': { syllable: 'DI', exampleWord: 'dinosaure', emoji: '🦖', article: 'le' },
  'DO': { syllable: 'DO', exampleWord: 'docteur', emoji: '🧑‍⚕️', article: 'le' },
  'DU': { syllable: 'DU', exampleWord: 'dune', emoji: '🏜️', article: 'la' },
  'DÉ': { syllable: 'DÉ', exampleWord: 'dé', emoji: '🎲', article: 'le' },
  'DOU': { syllable: 'DOU', exampleWord: 'douche', emoji: '🚿', article: 'la' },
  'DON': { syllable: 'DON', exampleWord: 'dindon', emoji: '🦃', article: 'le' },
  'DOI': { syllable: 'DOI', exampleWord: 'doigt', emoji: '👆', article: 'le' },
  'DAN': { syllable: 'DAN', exampleWord: 'dent', emoji: '🦷', article: 'la' },
  'DIN': { syllable: 'DIN', exampleWord: 'dindon', emoji: '🦃', article: 'le' },
  'DAU': { syllable: 'DAU', exampleWord: 'dauphin', emoji: '🐬', article: 'le' },

  'SA': { syllable: 'SA', exampleWord: 'sapin', emoji: '🎄', article: 'le' },
  'SE': { syllable: 'SE', exampleWord: 'serpent', emoji: '🐍', article: 'le' },
  'SI': { syllable: 'SI', exampleWord: 'sirène', emoji: '🧜‍♀️', article: 'la' },
  'SO': { syllable: 'SO', exampleWord: 'soleil', emoji: '☀️', article: 'le' },
  'SU': { syllable: 'SU', exampleWord: 'sucette', emoji: '🍭', article: 'la' },
  'SÉ': { syllable: 'SÉ', exampleWord: 'fusée', emoji: '🚀', article: 'la' },
  'SOU': { syllable: 'SOU', exampleWord: 'souris', emoji: '🐭', article: 'la' },
  'SON': { syllable: 'SON', exampleWord: 'poisson', emoji: '🐟', article: 'le' },
  'SOI': { syllable: 'SOI', exampleWord: 'soir', emoji: '🌙', article: 'le' },
  'SAN': { syllable: 'SAN', exampleWord: 'sandwich', emoji: '🥪', article: 'le' },
  'SIN': { syllable: 'SIN', exampleWord: 'singe', emoji: '🐵', article: 'le' },
  'SAU': { syllable: 'SAU', exampleWord: 'seau', emoji: '🪣', article: 'le' },

  'VA': { syllable: 'VA', exampleWord: 'vache', emoji: '🐮', article: 'la' },
  'VE': { syllable: 'VE', exampleWord: 'verre', emoji: '🥛', article: 'le' },
  'VI': { syllable: 'VI', exampleWord: 'violon', emoji: '🎻', article: 'le' },
  'VO': { syllable: 'VO', exampleWord: 'volcan', emoji: '🌋', article: 'le' },
  'VU': { syllable: 'VU', exampleWord: 'fusée', emoji: '🚀', article: 'la' },
  'VÉ': { syllable: 'VÉ', exampleWord: 'vélo', emoji: '🚲', article: 'le' },
  'VOU': { syllable: 'VOU', exampleWord: 'voûte', emoji: '🌌', article: 'la' },
  'VON': { syllable: 'VON', exampleWord: 'savon', emoji: '🧼', article: 'le' },
  'VOI': { syllable: 'VOI', exampleWord: 'voiture', emoji: '🚗', article: 'la' },
  'VAN': { syllable: 'VAN', exampleWord: 'vent', emoji: '🌬️', article: 'le' },
  'VIN': { syllable: 'VIN', exampleWord: 'raisin', emoji: '🍇', article: 'le' },
  'VAU': { syllable: 'VAU', exampleWord: 'veau', emoji: '🐮', article: 'le' },

  'CHA': { syllable: 'CHA', exampleWord: 'chat', emoji: '🐱', article: 'le' },
  'CHE': { syllable: 'CHE', exampleWord: 'cheval', emoji: '🐴', article: 'le' },
  'CHI': { syllable: 'CHI', exampleWord: 'chien', emoji: '🐶', article: 'le' },
  'CHO': { syllable: 'CHO', exampleWord: 'chocolat', emoji: '🍫', article: 'le' },
  'CHU': { syllable: 'CHU', exampleWord: 'parachute', emoji: '🪂', article: 'le' },
  'CHÉ': { syllable: 'CHÉ', exampleWord: 'rocher', emoji: '🪨', article: 'le' },
  'CHOU': { syllable: 'CHOU', exampleWord: 'chouette', emoji: '🦉', article: 'la' },
  'CHON': { syllable: 'CHON', exampleWord: 'cochon', emoji: '🐷', article: 'le' },
  'CHOI': { syllable: 'CHOI', exampleWord: 'choix', emoji: '🎯', article: 'le' },
  'CHAN': { syllable: 'CHAN', exampleWord: 'chanteur', emoji: '🧑‍🎤', article: 'le' },
  'CHIN': { syllable: 'CHIN', exampleWord: 'chien', emoji: '🐶', article: 'le' },
  'CHAU': { syllable: 'CHAU', exampleWord: 'chaussette', emoji: '🧦', article: 'la' },
};

export const SyllableFactory: React.FC<{ onStarEarned?: () => void }> = ({ onStarEarned }) => {
  const [selectedConsonant, setSelectedConsonant] = useState<{ letter: string; soundName: string }>(CONSONANTS[14]); // CH
  const [selectedVowel, setSelectedVowel] = useState<{ letter: string; soundName: string }>(VOWELS[0]); // A
  const [isMerging, setIsMerging] = useState(false);

  const merged = `${selectedConsonant.letter}${selectedVowel.letter}`;
  const lowerMerged = merged.toLowerCase();

  // Trouver jusqu'à 6 mots de la grande banque de 420 mots qui contiennent cette syllabe ou commencent par elle
  const matchingWords = WORDS_DATABASE.filter(
    (w) =>
      w.word.toLowerCase().includes(lowerMerged) ||
      w.syllables.some((s) => s.toLowerCase().includes(lowerMerged))
  ).slice(0, 6);

  const primaryMatch = SYLLABLE_DICTIONARY[merged] || (matchingWords[0] ? {
    syllable: merged,
    exampleWord: matchingWords[0].word,
    emoji: matchingWords[0].emoji,
    article: matchingWords[0].art
  } : {
    syllable: merged,
    exampleWord: lowerMerged,
    emoji: '✨',
    article: 'la'
  });

  const handleSelectConsonant = (c: { letter: string; soundName: string }) => {
    setSelectedConsonant(c);
    sound.playSyllableTap(1.1);
    sound.speak(c.soundName, { isSyllable: true });
  };

  const handleSelectVowel = (v: { letter: string; soundName: string }) => {
    setSelectedVowel(v);
    sound.playSyllableTap(1.3);
    sound.speak(v.soundName, { isSyllable: true });
  };

  const handleMergeAction = () => {
    setIsMerging(true);
    sound.playPop();

    const speech = `${selectedConsonant.soundName}, plus ${selectedVowel.soundName}, ça fait ${lowerMerged} ! Comme dans ${primaryMatch.article} ${primaryMatch.exampleWord} !`;

    sound.speak(speech, {
      onEnd: () => {
        setIsMerging(false);
      }
    });

    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#ffd600', '#4ecdc4', '#a78bfa', '#ff6b6b']
    });

    onStarEarned?.();
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center gap-6 p-4 sm:p-6 select-none">
      {/* Title & Owl Mascot */}
      <div className="flex flex-col items-center text-center gap-2">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/15 border border-purple-400/30 text-purple-700 dark:text-purple-300 font-bold text-xs">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Le Laboratoire des Sons • CP / CE1</span>
        </div>
        <h2 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
          L'Usine à Syllabes Magiques 🧪
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-md">
          Choisis une consonne (en bleu) et une voyelle ou un son (en rouge). Écoute comment ils fusionnent !
        </p>
      </div>

      {/* Main Fusion Chamber */}
      <div className="w-full bg-gradient-to-b from-purple-900/10 via-indigo-900/20 to-purple-900/10 dark:from-purple-950/40 dark:to-indigo-950/40 border-2 border-purple-400/30 rounded-3xl p-6 sm:p-8 flex flex-col items-center shadow-xl backdrop-blur-md">
        
        {/* Equation row */}
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 my-4">
          {/* Consonant Tile */}
          <div className="flex flex-col items-center gap-1">
            <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Consonne</span>
            <button
              onClick={() => handleSelectConsonant(selectedConsonant)}
              className="w-16 h-16 sm:w-24 sm:h-24 rounded-2xl bg-blue-500/15 dark:bg-blue-500/20 border-3 border-blue-500 flex items-center justify-center text-3xl sm:text-5xl font-black text-blue-600 dark:text-blue-400 shadow-md transform hover:scale-105 transition-transform cursor-pointer"
            >
              {selectedConsonant.letter}
            </button>
          </div>

          <span className="text-2xl sm:text-4xl font-black text-purple-600 dark:text-purple-400">+</span>

          {/* Vowel Tile */}
          <div className="flex flex-col items-center gap-1">
            <span className="text-[11px] font-bold text-red-600 dark:text-red-400 uppercase tracking-wider">Voyelle / Son</span>
            <button
              onClick={() => handleSelectVowel(selectedVowel)}
              className="w-16 h-16 sm:w-24 sm:h-24 rounded-2xl bg-red-500/15 dark:bg-red-500/20 border-3 border-red-500 flex items-center justify-center text-3xl sm:text-5xl font-black text-red-600 dark:text-red-400 shadow-md transform hover:scale-105 transition-transform cursor-pointer"
            >
              {selectedVowel.letter}
            </button>
          </div>

          <ArrowRight className="w-6 h-6 sm:w-10 sm:h-10 text-amber-500 animate-pulse" />

          {/* Merged Result Box */}
          <div className="flex flex-col items-center gap-1">
            <span className="text-[11px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">Syllabe</span>
            <button
              onClick={() => sound.speak(lowerMerged, { isSyllable: true })}
              className={`w-24 h-16 sm:w-32 sm:h-24 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 border-3 border-amber-400 flex items-center justify-center text-3xl sm:text-5xl font-black text-white shadow-xl cursor-pointer ${isMerging ? 'scale-115 rotate-3' : ''} transition-all`}
            >
              {merged}
            </button>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={handleMergeAction}
          className="mt-4 px-8 py-3.5 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 active:scale-95 text-white font-extrabold text-lg sm:text-xl shadow-lg hover:shadow-purple-500/30 flex items-center gap-3 transition-all cursor-pointer border border-purple-300/30"
        >
          <Volume2 className="w-6 h-6" />
          <span>Fusionner et Écouter !</span>
          <Sparkles className="w-5 h-5 text-amber-300" />
        </button>

        {/* Primary Example Word + Additional Matching Words */}
        <div className="mt-6 w-full flex flex-col items-center gap-4">
          <div
            onClick={() => sound.speak(`${primaryMatch.article} ${primaryMatch.exampleWord}`)}
            className="flex items-center gap-4 px-6 py-4 rounded-2xl bg-white/95 dark:bg-slate-900/95 border-2 border-purple-400/40 shadow-lg cursor-pointer hover:scale-105 transition-transform"
          >
            <span className="text-5xl select-none">{primaryMatch.emoji}</span>
            <div>
              <div className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-bold">Mot vedette (touche pour écouter) :</div>
              <div className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white flex items-center gap-2 tracking-wide">
                <span>
                  <span className="text-purple-600 dark:text-purple-400">{primaryMatch.article} </span>
                  {primaryMatch.exampleWord}
                </span>
                <Volume2 className="w-6 h-6 text-purple-500" />
              </div>
            </div>
          </div>

          {matchingWords.length > 0 && (
            <div className="w-full pt-2">
              <div className="text-center text-sm font-extrabold text-slate-600 dark:text-slate-300 mb-3">
                Autres mots avec ce son à lire et écouter :
              </div>
              <div className="flex flex-wrap items-center justify-center gap-2.5">
                {matchingWords.map((mw) => (
                  <button
                    key={mw.id}
                    onClick={() => {
                      sound.playPop();
                      sound.speak(getFullWordText(mw));
                    }}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/90 dark:bg-slate-800/95 border-2 border-purple-400/30 hover:border-purple-400 text-lg sm:text-2xl font-black text-slate-900 dark:text-slate-100 shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer tracking-wide"
                  >
                    <span className="text-2xl">{mw.emoji}</span>
                    <span>{getFullWordText(mw)}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Selectors Grid */}
      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Consonants list */}
        <div className="bg-white/70 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-extrabold text-blue-600 dark:text-blue-400 text-sm sm:text-base flex items-center gap-2">
              <span>🔵</span> 15 Consonnes ({CONSONANTS.length})
            </h3>
            <span className="text-xs text-slate-600 dark:text-slate-300">Touche une lettre</span>
          </div>
          <div className="grid grid-cols-5 gap-2">
            {CONSONANTS.map((c) => {
              const active = selectedConsonant.letter === c.letter;
              return (
                <button
                  key={c.letter}
                  onClick={() => handleSelectConsonant(c)}
                  className={`h-12 rounded-xl font-black text-lg transition-all cursor-pointer ${
                    active
                      ? 'bg-blue-600 text-white shadow-md scale-105 border-2 border-white'
                      : 'bg-blue-50 dark:bg-slate-800 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-slate-700 border border-blue-200 dark:border-slate-700'
                  }`}
                >
                  {c.letter}
                </button>
              );
            })}
          </div>
        </div>

        {/* Vowels list */}
        <div className="bg-white/70 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-extrabold text-red-600 dark:text-red-400 text-sm sm:text-base flex items-center gap-2">
              <span>🔴</span> 12 Voyelles & Sons ({VOWELS.length})
            </h3>
            <span className="text-xs text-slate-600 dark:text-slate-300">Touche un son</span>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {VOWELS.map((v) => {
              const active = selectedVowel.letter === v.letter;
              return (
                <button
                  key={v.letter}
                  onClick={() => handleSelectVowel(v)}
                  className={`h-12 rounded-xl font-black text-lg transition-all cursor-pointer ${
                    active
                      ? 'bg-red-600 text-white shadow-md scale-105 border-2 border-white'
                      : 'bg-red-50 dark:bg-slate-800 text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-slate-700 border border-red-200 dark:border-slate-700'
                  }`}
                >
                  {v.letter}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
