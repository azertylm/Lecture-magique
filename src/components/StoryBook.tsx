import React, { useState } from 'react';
import { StoryBookItem, StorySentence } from '../types';
import { BUILTIN_STORIES, generateCustomStory } from '../services/aiStory';
import { sound } from '../services/sound';
import { BookOpen, Sparkles, Volume2, Play, RotateCcw, ChevronRight, ChevronLeft, Wand2 } from 'lucide-react';
import confetti from 'canvas-confetti';

interface StoryBookProps {
  onStarEarned?: () => void;
}

export const StoryBook: React.FC<StoryBookProps> = ({ onStarEarned }) => {
  const [stories, setStories] = useState<StoryBookItem[]>(BUILTIN_STORIES);
  const [selectedStoryIndex, setSelectedStoryIndex] = useState(0);
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);
  const [activeWordIndex, setActiveWordIndex] = useState<number | null>(null);
  const [isReadingStory, setIsReadingStory] = useState(false);
  const [selectedWordDetail, setSelectedWordDetail] = useState<{
    raw: string;
    clean: string;
    syllables?: string[];
    emoji?: string;
  } | null>(null);

  // Custom AI story modal
  const [showAiModal, setShowAiModal] = useState(false);
  const [heroInput, setHeroInput] = useState('Un petit panda malicieux');
  const [actionInput, setActionInput] = useState('qui mange du bambou sucré');
  const [isGenerating, setIsGenerating] = useState(false);

  const activeStory = stories[selectedStoryIndex] || stories[0];
  const activeSentence: StorySentence | undefined = activeStory.sentences[currentSentenceIndex];

  const handleSelectStory = (idx: number) => {
    sound.playPop();
    sound.cancelSpeech();
    setSelectedStoryIndex(idx);
    setCurrentSentenceIndex(0);
    setActiveWordIndex(null);
    setSelectedWordDetail(null);
    setIsReadingStory(false);
  };

  const handleReadCurrentSentence = () => {
    if (!activeSentence) return;
    sound.playPop();
    setIsReadingStory(true);
    setActiveWordIndex(null);

    sound.speak(activeSentence.text, {
      rate: 0.82,
      onEnd: () => {
        setIsReadingStory(false);
        setActiveWordIndex(null);
      }
    });
  };

  const handleWordClick = (word: { raw: string; clean: string; syllables?: string[]; emoji?: string }, idx: number) => {
    sound.playSyllableTap(1.1);
    setActiveWordIndex(idx);
    setSelectedWordDetail(word);
    sound.speak(word.clean);
  };

  const handleNextSentence = () => {
    sound.playPop();
    sound.cancelSpeech();
    setActiveWordIndex(null);
    setSelectedWordDetail(null);

    if (currentSentenceIndex < activeStory.sentences.length - 1) {
      setCurrentSentenceIndex(prev => prev + 1);
    } else {
      // Completed story celebration!
      sound.playSuccess();
      sound.speak(`Bravo ! Tu as lu toute l'histoire "${activeStory.title}" !`);
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#ffd600', '#4ecdc4', '#a78bfa', '#ff6b6b']
      });
      onStarEarned?.();
    }
  };

  const handlePrevSentence = () => {
    sound.playPop();
    sound.cancelSpeech();
    setActiveWordIndex(null);
    setSelectedWordDetail(null);
    if (currentSentenceIndex > 0) {
      setCurrentSentenceIndex(prev => prev - 1);
    }
  };

  const handleCreateCustomStory = async () => {
    if (!heroInput.trim()) return;
    setIsGenerating(true);
    sound.playPop();

    try {
      const generated = await generateCustomStory(heroInput, actionInput);
      setStories(prev => [generated, ...prev]);
      setSelectedStoryIndex(0);
      setCurrentSentenceIndex(0);
      setShowAiModal(false);
      sound.playSuccess();
      sound.speak(`Voici ta nouvelle histoire magique : ${generated.title} !`);
    } catch {
      // ignore
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center gap-6 p-4 sm:p-6 select-none">
      {/* Header */}
      <div className="flex flex-col items-center text-center gap-2">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/15 border border-purple-400/30 text-purple-700 dark:text-purple-300 font-bold text-xs">
          <BookOpen className="w-4 h-4 text-purple-500" />
          <span>Histoires Déchiffrables • CP / CE1</span>
        </div>
        <h2 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
          Le Grimoire d'Histoires de Lumo 📖
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-lg">
          Lis à ton rythme ! Clique sur n'importe quel mot pour l'écouter et voir ses syllabes.
        </p>
      </div>

      {/* Story Tabs + AI Generator Button */}
      <div className="w-full flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex flex-wrap items-center gap-2">
          {stories.map((st, i) => {
            const active = i === selectedStoryIndex;
            return (
              <button
                key={st.id}
                onClick={() => handleSelectStory(i)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  active
                    ? 'bg-purple-600 text-white shadow-md scale-105'
                    : 'bg-white/80 dark:bg-slate-900/80 text-slate-700 dark:text-slate-300 hover:bg-purple-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700'
                }`}
              >
                <span>{st.coverEmoji}</span>
                <span>{st.title}</span>
              </button>
            );
          })}
        </div>

        <button
          onClick={() => setShowAiModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-gradient-to-r from-amber-500 to-rose-500 text-white font-black text-xs shadow-md hover:scale-105 transition-all cursor-pointer"
        >
          <Wand2 className="w-3.5 h-3.5" />
          <span>Créer mon Histoire avec l'IA ✨</span>
        </button>
      </div>

      {/* Main Reading Stage */}
      <div className="w-full bg-white/95 dark:bg-slate-900/95 border-2 border-purple-400/30 rounded-3xl p-6 sm:p-10 shadow-xl flex flex-col items-center justify-between min-h-[340px] relative backdrop-blur-md">
        
        {/* Story Title & Progress */}
        <div className="w-full flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <span className="text-3xl sm:text-4xl">{activeStory.coverEmoji}</span>
            <div>
              <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white leading-tight">
                {activeStory.title}
              </h3>
              <span className="text-[11px] font-bold text-purple-600 dark:text-purple-400">
                Phrase {currentSentenceIndex + 1} sur {activeStory.sentences.length}
              </span>
            </div>
          </div>

          <button
            onClick={handleReadCurrentSentence}
            title="Écouter la phrase"
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95 cursor-pointer"
          >
            <Volume2 className="w-4 h-4" />
            <span>Lire à haute voix</span>
          </button>
        </div>

        {/* Big Interactive Words Text */}
        <div className="my-8 flex flex-wrap items-center justify-center gap-2.5 sm:gap-4 px-4 max-w-3xl">
          {activeSentence?.words.map((w, idx) => {
            const isWordActive = activeWordIndex === idx;
            return (
              <button
                key={idx}
                onClick={() => handleWordClick(w, idx)}
                className={`font-black text-3xl sm:text-5xl px-3.5 py-2 rounded-2xl transition-all cursor-pointer relative tracking-wide ${
                  isWordActive
                    ? 'bg-amber-400 text-slate-950 scale-110 shadow-lg ring-3 ring-amber-300'
                    : 'hover:bg-purple-100 dark:hover:bg-purple-900/40 text-slate-900 dark:text-white'
                }`}
              >
                {w.raw}
                {w.emoji && (
                  <span className="text-lg sm:text-2xl ml-1.5 align-top opacity-90">
                    {w.emoji}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Selected Word Syllables Inspector Banner */}
        {selectedWordDetail && (
          <div className="w-full bg-purple-50 dark:bg-purple-950/40 border-2 border-purple-300 dark:border-purple-600/40 rounded-2xl p-4 flex flex-wrap items-center justify-center gap-3.5 animate-in fade-in">
            <span className="text-sm sm:text-base font-extrabold text-purple-700 dark:text-purple-300">
              Syllabes de « {selectedWordDetail.clean} » :
            </span>
            <div className="flex flex-wrap items-center gap-2.5">
              {selectedWordDetail.syllables && selectedWordDetail.syllables.length > 0 ? (
                selectedWordDetail.syllables.map((s, si) => (
                  <button
                    key={si}
                    onClick={() => {
                      sound.playSyllableTap(1 + si * 0.15);
                      sound.speak(s, { isSyllable: true });
                    }}
                    className="px-4 py-1.5 bg-white dark:bg-purple-900 border-2 border-purple-400 rounded-xl text-purple-900 dark:text-purple-100 font-black text-xl sm:text-2xl tracking-wider hover:scale-105 active:scale-95 cursor-pointer shadow-sm"
                  >
                    {s}
                  </button>
                ))
              ) : (
                <span className="font-black text-xl sm:text-2xl text-purple-800 dark:text-purple-200">
                  {selectedWordDetail.clean}
                </span>
              )}
            </div>
            <button
              onClick={() => sound.speak(selectedWordDetail.clean)}
              className="text-sm bg-purple-600 text-white px-3.5 py-1.5 rounded-xl font-black flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Volume2 className="w-4 h-4" />
              <span>Répéter</span>
            </button>
          </div>
        )}

        {/* Pagination Navigation Footer */}
        <div className="w-full flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-4 mt-4">
          <button
            onClick={handlePrevSentence}
            disabled={currentSentenceIndex === 0}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs sm:text-sm hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none cursor-pointer transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Précédent</span>
          </button>

          {/* Dots progress indicator */}
          <div className="flex items-center gap-2">
            {activeStory.sentences.map((_, i) => (
              <span
                key={i}
                className={`w-3 h-3 rounded-full transition-all ${
                  i === currentSentenceIndex
                    ? 'w-6 bg-purple-600 shadow-sm'
                    : i < currentSentenceIndex
                    ? 'bg-emerald-500'
                    : 'bg-slate-300 dark:bg-slate-700'
                }`}
              />
            ))}
          </div>

          <button
            onClick={handleNextSentence}
            className="flex items-center gap-1.5 px-5 py-2 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs sm:text-sm shadow-md transition-all active:scale-95 cursor-pointer"
          >
            <span>{currentSentenceIndex < activeStory.sentences.length - 1 ? 'Suivant' : 'J\'ai terminé ! 🏆'}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* AI Story Generator Modal */}
      {showAiModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl bg-slate-900 border-2 border-purple-500/40 p-6 text-white shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🪄</span>
                <h3 className="font-extrabold text-base text-purple-200">
                  Fabrique ton Histoire Magique !
                </h3>
              </div>
              <button
                onClick={() => setShowAiModal(false)}
                className="text-slate-400 hover:text-white text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="py-4 space-y-4 text-xs sm:text-sm">
              <p className="text-slate-300">
                Choisis ton héros et ce qu'il fait. Lumo et l'IA vont inventer une histoire courte rien que pour toi !
              </p>

              <div>
                <label className="block font-bold text-purple-300 mb-1">
                  1. Quel est ton héros ?
                </label>
                <input
                  type="text"
                  value={heroInput}
                  onChange={(e) => setHeroInput(e.target.value)}
                  placeholder="ex: Un petit dragon bleu, Une princesse magicienne..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white outline-none focus:border-purple-400"
                />
              </div>

              <div>
                <label className="block font-bold text-purple-300 mb-1">
                  2. Que fait-il ? Que découvre-t-il ?
                </label>
                <input
                  type="text"
                  value={actionInput}
                  onChange={(e) => setActionInput(e.target.value)}
                  placeholder="ex: qui trouve un gâteau aux fraises, qui voyage sur un nuage..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white outline-none focus:border-purple-400"
                />
              </div>

              {/* Quick suggestions */}
              <div className="flex flex-wrap gap-2 pt-1">
                <span className="text-[11px] text-slate-400 w-full">Idées rigolotes :</span>
                {[
                  { h: 'Un dinosaure timide', a: 'qui joue de la guitare' },
                  { h: 'Une petite souris astronaute', a: 'qui mange du fromage sur la lune' },
                  { h: 'Un renard avec des lunettes', a: 'qui lit un livre secret' }
                ].map((sug, si) => (
                  <button
                    key={si}
                    onClick={() => {
                      setHeroInput(sug.h);
                      setActionInput(sug.a);
                    }}
                    className="text-[11px] bg-slate-800 hover:bg-slate-700 text-purple-300 px-2.5 py-1 rounded-lg border border-slate-700 cursor-pointer"
                  >
                    {sug.h}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                onClick={() => setShowAiModal(false)}
                className="px-4 py-2 rounded-xl text-slate-400 hover:text-white text-xs cursor-pointer"
              >
                Annuler
              </button>
              <button
                onClick={handleCreateCustomStory}
                disabled={isGenerating || !heroInput.trim()}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-sm shadow-lg flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <Sparkles className="w-4 h-4 animate-spin text-amber-300" />
                    <span>Lumo écrit ton histoire...</span>
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4 text-amber-300" />
                    <span>Créer mon Histoire !</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
