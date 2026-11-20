import React, { useState, useEffect } from 'react';
import { WordItem, WorldId, GameQuestion, GameModeType, VisualMode } from '../types';
import { WORDS_DATABASE, WORLDS_CONFIG, getWordsByWorld, getFullWordText } from '../data/words';
import { sound } from '../services/sound';
import { WordIllustration } from './WordIllustration';
import { Volume2, ArrowLeft, RotateCcw, Home, Star } from 'lucide-react';
import confetti from 'canvas-confetti';

interface MainGameProps {
  initialWorld?: WorldId;
  visualMode?: VisualMode;
  highlightVowels?: boolean;
  onStarEarned: () => void;
  onWordDiscovered: (wordId: string) => void;
  onGoHome: () => void;
}

const TOTAL_ROUNDS = 8;

const SYLLABLE_BADGE_COLORS = [
  'text-purple-700 dark:text-purple-200 bg-purple-100 dark:bg-purple-900/50 border-purple-300 dark:border-purple-600/50',
  'text-teal-700 dark:text-teal-200 bg-teal-100 dark:bg-teal-900/50 border-teal-300 dark:border-teal-600/50',
  'text-amber-700 dark:text-amber-200 bg-amber-100 dark:bg-amber-900/50 border-amber-300 dark:border-amber-600/50',
  'text-rose-700 dark:text-rose-200 bg-rose-100 dark:bg-rose-900/50 border-rose-300 dark:border-rose-600/50'
];

const VOWELS_SET = new Set(['a', 'e', 'i', 'o', 'u', 'y', 'é', 'è', 'ê', 'ë', 'à', 'â', 'î', 'ï', 'ô', 'ù', 'û']);

export const MainGame: React.FC<MainGameProps> = ({
  initialWorld = 'animaux',
  visualMode = 'drawing',
  highlightVowels = false,
  onStarEarned,
  onWordDiscovered,
  onGoHome
}) => {
  const [selectedWorld, setSelectedWorld] = useState<WorldId>(initialWorld);
  const [roundIndex, setRoundIndex] = useState(0);
  const [sessionStars, setSessionStars] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState<GameQuestion | null>(null);
  const [isLocked, setIsLocked] = useState(false);
  const [selectedAnswerIndex, setSelectedAnswerIndex] = useState<number | null>(null);
  const [answerStatus, setAnswerStatus] = useState<'correct' | 'wrong' | null>(null);
  const [isVictory, setIsVictory] = useState(false);
  
  // For syllable puzzle mode:
  const [assembledSyllables, setAssembledSyllables] = useState<string[]>([]);
  const [availableSyllablePieces, setAvailableSyllablePieces] = useState<string[]>([]);

  // Speech bubble text
  const [spokenBubbleText, setSpokenBubbleText] = useState('...');

  // Start new round
  useEffect(() => {
    startNewGame();
  }, [selectedWorld]);

  const startNewGame = () => {
    setRoundIndex(0);
    setSessionStars(0);
    setIsVictory(false);
    loadQuestion(0);
  };

  const generateQuestion = (stepIndex: number): GameQuestion => {
    const allWorldWords = getWordsByWorld(selectedWorld);
    // Privilégier les noms concrets de base (sans variante adjectivale) pour que l'image soit 100% évidente
    const coreWords = allWorldWords.filter(w => !w.id.includes('_var_'));
    const pool = coreWords.length >= 20 ? coreWords : allWorldWords;
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    const targetItem = shuffled[stepIndex % shuffled.length];

    // Helper pour sélectionner des distracteurs ayant tous une illustration/emoji différente
    const pickDistinctWrongs = (count: number, extraFilter?: (w: WordItem) => boolean): WordItem[] => {
      const usedEmojis = new Set<string>([targetItem.emoji]);
      const usedQueries = new Set<string>([(targetItem.photoQuery || targetItem.word).toLowerCase()]);
      const picked: WordItem[] = [];

      for (const candidate of shuffled) {
        if (candidate.id === targetItem.id) continue;
        if (extraFilter && !extraFilter(candidate)) continue;
        const q = (candidate.photoQuery || candidate.word).toLowerCase();
        if (usedEmojis.has(candidate.emoji) && !candidate.preferPhoto) continue;
        if (usedQueries.has(q)) continue;

        usedEmojis.add(candidate.emoji);
        usedQueries.add(q);
        picked.push(candidate);
        if (picked.length >= count) break;
      }
      return picked;
    };

    // Determine mode based on progression
    const modesCycle: GameModeType[] = [
      'find_word',       // 0
      'which_one',       // 1
      'syllable_puzzle', // 2 - syllabic assembly
      'first_sound',     // 3 - phonological
      'audio_hunt',      // 4
      'intruder',        // 5
      'find_word',       // 6
      'syllable_puzzle'  // 7
    ];
    const mode = modesCycle[stepIndex % modesCycle.length];

    if (mode === 'syllable_puzzle' && targetItem.syllables && targetItem.syllables.length >= 2) {
      const pieces = [...targetItem.syllables].sort(() => Math.random() - 0.5);
      return {
        mode: 'syllable_puzzle',
        item: targetItem,
        subjectEmoji: targetItem.emoji,
        promptText: `Recompose le mot : ${getFullWordText(targetItem)} !`,
        speechText: `Recompose le mot ${getFullWordText(targetItem)} avec les syllabes !`,
        syllablePieces: pieces,
        choices: [],
        successText: `Magnifique ! Tu as bien assemblé : ${getFullWordText(targetItem)} !`,
        hintText: `Les morceaux de syllabes forment ${getFullWordText(targetItem)} !`
      };
    }

    if (mode === 'which_one') {
      const wrong = pickDistinctWrongs(1)[0] || shuffled[1] || shuffled[0];
      const choices = [
        { id: targetItem.id, emoji: targetItem.emoji, label: getFullWordText(targetItem), syllables: targetItem.syllables, wordItem: targetItem, isCorrect: true },
        { id: wrong.id, emoji: wrong.emoji, label: getFullWordText(wrong), syllables: wrong.syllables, wordItem: wrong, isCorrect: false }
      ].sort(() => Math.random() - 0.5);

      return {
        mode: 'which_one',
        item: targetItem,
        subjectEmoji: targetItem.emoji,
        promptText: `C'est ${getFullWordText(targetItem)} ou ${getFullWordText(wrong)} ?`,
        speechText: `Regarde bien l'image. C'est ${getFullWordText(targetItem)} ou ${getFullWordText(wrong)} ?`,
        choices,
        successText: `Oui ! C'est bien ${getFullWordText(targetItem)} ! Trop fort !`,
        hintText: `Non, c'est ${getFullWordText(targetItem)} !`
      };
    }

    if (mode === 'first_sound' && targetItem.phonemeHelp) {
      const wrongPool = pickDistinctWrongs(2, w => w.phonemeHelp !== targetItem.phonemeHelp);
      const choices = [
        { id: targetItem.id, emoji: targetItem.emoji, label: getFullWordText(targetItem), syllables: targetItem.syllables, wordItem: targetItem, isCorrect: true },
        ...wrongPool.map(w => ({ id: w.id, emoji: w.emoji, label: getFullWordText(w), syllables: w.syllables, wordItem: w, isCorrect: false }))
      ].sort(() => Math.random() - 0.5);

      return {
        mode: 'first_sound',
        item: targetItem,
        subjectEmoji: null,
        promptText: `Quel mot contient le son [${targetItem.phonemeHelp}] ?`,
        speechText: `Quel mot fait le son [${targetItem.phonemeHelp}] ? Écoute bien les mots !`,
        choices,
        successText: `Génial ! Dans ${getFullWordText(targetItem)}, on entend bien [${targetItem.phonemeHelp}] !`,
        hintText: `C'était ${getFullWordText(targetItem)} !`
      };
    }

    if (mode === 'intruder') {
      // 3 items from this world, 1 intruder from another world
      const sameGroup = pickDistinctWrongs(2);
      const otherWorlds = WORDS_DATABASE.filter(w => w.world !== selectedWorld && !w.id.includes('_var_'));
      const intruderWord = otherWorlds[Math.floor(Math.random() * otherWorlds.length)] || targetItem;
      const choices = [
        { id: 'intruder', emoji: intruderWord.emoji, label: getFullWordText(intruderWord), syllables: intruderWord.syllables, wordItem: intruderWord, isCorrect: true },
        { id: targetItem.id, emoji: targetItem.emoji, label: getFullWordText(targetItem), syllables: targetItem.syllables, wordItem: targetItem, isCorrect: false },
        { id: sameGroup[0].id, emoji: sameGroup[0].emoji, label: getFullWordText(sameGroup[0]), syllables: sameGroup[0].syllables, wordItem: sameGroup[0], isCorrect: false },
        { id: sameGroup[1].id, emoji: sameGroup[1].emoji, label: getFullWordText(sameGroup[1]), syllables: sameGroup[1].syllables, wordItem: sameGroup[1], isCorrect: false },
      ].sort(() => Math.random() - 0.5);

      return {
        mode: 'intruder',
        item: targetItem,
        subjectEmoji: null,
        promptText: `Trouve l'intrus qui n'est pas dans "${WORLDS_CONFIG[selectedWorld].label}" !`,
        speechText: `Lequel est différent des autres ? Trouve l'intrus !`,
        choices,
        successText: `Bravo ! Tu as trouvé l'intrus : ${getFullWordText(intruderWord)} !`,
        hintText: `L'intrus était ${getFullWordText(intruderWord)} !`
      };
    }

    if (mode === 'audio_hunt') {
      const wrongs = pickDistinctWrongs(2);
      const choices = [
        { id: targetItem.id, emoji: targetItem.emoji, label: getFullWordText(targetItem), syllables: targetItem.syllables, wordItem: targetItem, isCorrect: true },
        ...wrongs.map(w => ({ id: w.id, emoji: w.emoji, label: getFullWordText(w), syllables: w.syllables, wordItem: w, isCorrect: false }))
      ].sort(() => Math.random() - 0.5);

      return {
        mode: 'audio_hunt',
        item: targetItem,
        subjectEmoji: null,
        promptText: `Écoute et lis : ${getFullWordText(targetItem)} !`,
        speechText: `Écoute bien... ${getFullWordText(targetItem)} ! Montre-le moi !`,
        choices,
        successText: `Super ! Tu as bien reconnu ${getFullWordText(targetItem)} !`,
        hintText: `C'était ${getFullWordText(targetItem)} !`
      };
    }

    // Default mode: find_word (4 choices)
    const wrongs = pickDistinctWrongs(3);
    const choices = [
      { id: targetItem.id, emoji: targetItem.emoji, label: getFullWordText(targetItem), syllables: targetItem.syllables, wordItem: targetItem, isCorrect: true },
      ...wrongs.map(w => ({ id: w.id, emoji: w.emoji, label: getFullWordText(w), syllables: w.syllables, wordItem: w, isCorrect: false }))
    ].sort(() => Math.random() - 0.5);

    return {
      mode: 'find_word',
      item: targetItem,
      subjectEmoji: null,
      promptText: `Lis et trouve : ${getFullWordText(targetItem)} !`,
      speechText: `Trouve ${getFullWordText(targetItem)} !`,
      choices,
      successText: `Bravo ! C'est bien ${getFullWordText(targetItem)} !`,
      hintText: `Non... C'est ${getFullWordText(targetItem)} ! Regarde bien !`
    };
  };

  const loadQuestion = (step: number) => {
    setIsLocked(false);
    setSelectedAnswerIndex(null);
    setAnswerStatus(null);

    const q = generateQuestion(step);
    setCurrentQuestion(q);
    setSpokenBubbleText(q.promptText);

    if (q.mode === 'syllable_puzzle' && q.syllablePieces) {
      setAvailableSyllablePieces(q.syllablePieces);
      setAssembledSyllables([]);
    }

    // Speak prompt after brief delay
    setTimeout(() => {
      sound.speak(q.speechText);
    }, 450);
  };

  const handleReplaySpeech = () => {
    if (!currentQuestion) return;
    sound.playPop();
    sound.speak(currentQuestion.speechText);
  };

  const handleAnswerChoice = (index: number, isCorrect: boolean) => {
    if (isLocked || !currentQuestion) return;
    setIsLocked(true);
    setSelectedAnswerIndex(index);

    if (isCorrect) {
      setAnswerStatus('correct');
      sound.playSuccess();
      setSessionStars(prev => prev + 1);
      onStarEarned();
      onWordDiscovered(currentQuestion.item.id);

      setSpokenBubbleText(currentQuestion.successText);

      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.65 },
        colors: ['#ffd600', '#4ecdc4', '#a78bfa', '#ff6b6b']
      });

      sound.speak(currentQuestion.successText, {
        onEnd: () => {
          advanceToNextRound();
        }
      });
    } else {
      setAnswerStatus('wrong');
      sound.playGentleEncourage();
      setSpokenBubbleText(currentQuestion.hintText);

      sound.speak(currentQuestion.hintText, {
        onEnd: () => {
          setTimeout(() => {
            advanceToNextRound();
          }, 1000);
        }
      });
    }
  };

  // Syllable puzzle click piece
  const handlePieceClick = (piece: string, pIdx: number) => {
    if (isLocked || !currentQuestion) return;
    sound.playSyllableTap();
    sound.speak(piece, { isSyllable: true });

    const newAssembled = [...assembledSyllables, piece];
    const newAvailable = availableSyllablePieces.filter((_, i) => i !== pIdx);

    setAssembledSyllables(newAssembled);
    setAvailableSyllablePieces(newAvailable);

    // Check if finished
    if (newAvailable.length === 0) {
      const assembledWord = newAssembled.join('');
      const expectedWord = currentQuestion.item.syllables.join('');

      if (assembledWord.toLowerCase() === expectedWord.toLowerCase()) {
        setIsLocked(true);
        setAnswerStatus('correct');
        sound.playSuccess();
        setSessionStars(prev => prev + 1);
        onStarEarned();
        onWordDiscovered(currentQuestion.item.id);

        confetti({
          particleCount: 70,
          spread: 70,
          origin: { y: 0.65 },
          colors: ['#ffd600', '#4ecdc4', '#a78bfa', '#ff6b6b']
        });

        sound.speak(currentQuestion.successText, {
          onEnd: () => {
            advanceToNextRound();
          }
        });
      } else {
        // Wrong assembly, gentle reset
        setIsLocked(true);
        setAnswerStatus('wrong');
        sound.playGentleEncourage();
        sound.speak("Oups, essaie encore ! Écoute bien les syllabes.", {
          onEnd: () => {
            setTimeout(() => {
              setIsLocked(false);
              setAnswerStatus(null);
              setAvailableSyllablePieces(currentQuestion.syllablePieces || []);
              setAssembledSyllables([]);
            }, 600);
          }
        });
      }
    }
  };

  const advanceToNextRound = () => {
    const nextIdx = roundIndex + 1;
    if (nextIdx >= TOTAL_ROUNDS) {
      setIsVictory(true);
      sound.playSuccess();
      const victoryMsg = sessionStars >= 6
        ? `Incroyable ! Tu as gagné ${sessionStars} étoiles ! Tu es un vrai champion de la lecture !`
        : `Super travail ! Tu as gagné ${sessionStars} étoiles avec Lumo !`;
      sound.speak(victoryMsg);
      confetti({
        particleCount: 100,
        spread: 90,
        origin: { y: 0.5 }
      });
    } else {
      setRoundIndex(nextIdx);
      loadQuestion(nextIdx);
    }
  };

  const currentWorldConfig = WORLDS_CONFIG[selectedWorld];

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center p-3 sm:p-6 select-none">
      
      {/* ── TOP NAV BAR ── */}
      <div className="w-full flex items-center justify-between gap-3 mb-4">
        <button
          onClick={onGoHome}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/80 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-bold hover:scale-105 active:scale-95 transition-transform cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Accueil</span>
        </button>

        {/* Progress Bar */}
        <div className="flex-1 max-w-md mx-2">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
            <span>Question {roundIndex + 1} / {TOTAL_ROUNDS}</span>
            <span className="text-purple-600 dark:text-purple-400 font-extrabold">{currentWorldConfig.label}</span>
          </div>
          <div className="w-full h-3 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-purple-500 via-amber-400 to-emerald-400 transition-all duration-500 ease-out"
              style={{ width: `${((roundIndex + 1) / TOTAL_ROUNDS) * 100}%` }}
            />
          </div>
        </div>

        {/* Stars Counter */}
        <div className="flex items-center gap-1 px-3.5 py-1.5 rounded-full bg-amber-400 text-slate-950 font-black text-sm shadow-md ring-2 ring-amber-300 shrink-0">
          <Star className="w-4 h-4 fill-slate-950" />
          <span>{sessionStars}</span>
        </div>
      </div>

      {/* ── VICTORY SCREEN ── */}
      {isVictory ? (
        <div className="w-full bg-white/95 dark:bg-slate-900/95 border-2 border-amber-400/50 rounded-3xl p-8 sm:p-12 shadow-2xl flex flex-col items-center text-center gap-6 animate-pop-bounce">
          <div className="text-7xl sm:text-9xl animate-float-slow">🏆</div>
          <h2 className="text-3xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-purple-500 to-emerald-400">
            Félicitations petit lecteur !
          </h2>
          <div className="flex items-center gap-1 text-3xl sm:text-4xl text-amber-400">
            {Array.from({ length: Math.max(1, sessionStars) }).map((_, i) => (
              <span key={i}>⭐</span>
            ))}
          </div>
          <p className="text-base sm:text-lg text-slate-700 dark:text-slate-200 font-bold max-w-md">
            Tu as réussi cette partie avec brio ! Tu apprends de plus en plus de mots chaque jour.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 mt-2">
            <button
              onClick={startNewGame}
              className="px-6 py-3 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-extrabold text-base shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-5 h-5" />
              <span>Rejouer cette partie !</span>
            </button>
            <button
              onClick={onGoHome}
              className="px-6 py-3 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-white font-bold text-base hover:bg-slate-300 dark:hover:bg-slate-700 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Home className="w-5 h-5" />
              <span>Changer de monde</span>
            </button>
          </div>
        </div>
      ) : (
        /* ── ACTIVE ROUND STAGE ── */
        <div className="w-full flex flex-col items-center gap-6">
          
          {/* Lumo Mascot & Spoken Bubble */}
          <div className="w-full max-w-3xl flex items-center gap-3 sm:gap-5 bg-white/90 dark:bg-slate-900/90 border-2 border-purple-400/40 rounded-3xl p-4 sm:p-6 shadow-xl backdrop-blur-md">
            {/* Lumo avatar with tap to repeat */}
            <button
              onClick={handleReplaySpeech}
              title="Cliquer sur Lumo pour réécouter"
              className="w-16 h-16 sm:w-22 sm:h-22 rounded-2xl bg-purple-600/20 border-2 border-purple-400/40 flex items-center justify-center text-4xl sm:text-5xl shadow-md transform hover:scale-110 active:scale-95 transition-transform cursor-pointer shrink-0 animate-float-slow"
            >
              🦉
            </button>

            {/* Bubble text — EXTRA LARGE FOR CHILDREN TO READ */}
            <div className="flex-1">
              <div className="text-xs font-extrabold text-purple-600 dark:text-purple-400 uppercase tracking-wider mb-1">
                Lumo te demande :
              </div>
              <div className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 dark:text-white leading-snug tracking-wide">
                {spokenBubbleText}
              </div>
            </div>

            {/* Replay voice button */}
            <button
              onClick={handleReplaySpeech}
              title="Réécouter"
              className="w-12 h-12 rounded-full bg-purple-600 hover:bg-purple-500 text-white flex items-center justify-center shadow-md active:scale-90 transition-transform cursor-pointer shrink-0"
            >
              <Volume2 className="w-6 h-6" />
            </button>
          </div>

          {/* Optional Large Subject Illustration (Mode: which_one or syllable_puzzle) */}
          {currentQuestion?.subjectEmoji && currentQuestion.item && (
            <div
              onClick={handleReplaySpeech}
              className="my-1 animate-pop-bounce cursor-pointer hover:scale-105 transition-transform"
            >
              <WordIllustration
                item={currentQuestion.item}
                visualMode={visualMode}
                size="lg"
                showControls={true}
              />
            </div>
          )}

          {/* ── MODE SPECIFIC WORKSPACES ── */}
          
          {/* SYLLABLE PUZZLE MODE */}
          {currentQuestion?.mode === 'syllable_puzzle' && (
            <div className="w-full max-w-2xl flex flex-col items-center gap-5 bg-purple-50/90 dark:bg-purple-950/40 border-2 border-purple-400/40 rounded-3xl p-6 shadow-lg">
              <div className="text-sm sm:text-base font-extrabold text-purple-700 dark:text-purple-300">
                Touche les syllabes dans le bon ordre pour écrire le mot :
              </div>

              {/* Assembled slots */}
              <div className="flex flex-wrap items-center justify-center gap-2.5 min-h-[72px] px-6 py-3 rounded-2xl bg-white dark:bg-slate-900 border-3 border-purple-400 shadow-inner w-full max-w-lg">
                {assembledSyllables.length === 0 ? (
                  <span className="text-base sm:text-lg text-slate-400 font-bold italic">Place les syllabes ici...</span>
                ) : (
                  assembledSyllables.map((s, idx) => (
                    <div
                      key={idx}
                      className="px-5 py-2.5 rounded-2xl bg-purple-600 text-white font-black text-2xl sm:text-4xl tracking-wider shadow-md animate-pop-bounce"
                    >
                      {s}
                    </div>
                  ))
                )}
              </div>

              {/* Available Pieces */}
              <div className="flex flex-wrap items-center justify-center gap-3.5">
                {availableSyllablePieces.map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => handlePieceClick(p, idx)}
                    className="px-6 py-3.5 rounded-2xl bg-white dark:bg-slate-800 border-3 border-purple-400 dark:border-purple-500 text-purple-900 dark:text-purple-100 font-black text-2xl sm:text-4xl tracking-wider shadow-lg hover:scale-110 active:scale-95 transition-transform cursor-pointer"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* MULTIPLE CHOICES ANSWER GRID — EXTRA LARGE WORDS & SYLLABLES FOR KIDS */}
          {currentQuestion && currentQuestion.mode !== 'syllable_puzzle' && (
            <div
              className={`w-full max-w-3xl grid gap-4 sm:gap-5 ${
                currentQuestion.choices.length === 2
                  ? 'grid-cols-1 sm:grid-cols-2'
                  : currentQuestion.choices.length === 3
                  ? 'grid-cols-1 sm:grid-cols-3'
                  : 'grid-cols-2'
              }`}
            >
              {currentQuestion.choices.map((choice, idx) => {
                const isSelected = selectedAnswerIndex === idx;
                let cardStyle = 'bg-white/95 dark:bg-slate-900/95 border-slate-200 dark:border-purple-500/30 hover:border-purple-400';

                if (isSelected && answerStatus === 'correct') {
                  cardStyle = 'bg-emerald-500/20 border-emerald-500 ring-4 ring-emerald-400/50 scale-102';
                } else if (isSelected && answerStatus === 'wrong') {
                  cardStyle = 'bg-rose-500/20 border-rose-500 ring-4 ring-rose-400/50 animate-shake';
                } else if (isLocked && choice.isCorrect) {
                  cardStyle = 'bg-emerald-500/15 border-emerald-500';
                } else if (isLocked) {
                  cardStyle = 'opacity-40 pointer-events-none';
                }

                const wItem = choice.wordItem;

                return (
                  <button
                    key={choice.id + idx}
                    onClick={() => handleAnswerChoice(idx, choice.isCorrect)}
                    disabled={isLocked}
                    className={`flex flex-col items-center justify-between p-4 sm:p-6 rounded-3xl border-3 shadow-xl transition-all cursor-pointer transform active:scale-95 group ${cardStyle}`}
                  >
                    {wItem ? (
                      <div className="mb-3">
                        <WordIllustration
                          item={wItem}
                          visualMode={visualMode}
                          size="md"
                          showControls={false}
                        />
                      </div>
                    ) : choice.emoji ? (
                      <span className="text-6xl sm:text-7xl mb-3 select-none">{choice.emoji}</span>
                    ) : null}

                    {/* Huge Readable Word + Article */}
                    {wItem ? (
                      <div className="flex flex-col items-center gap-2 w-full">
                        <div className="flex flex-wrap items-baseline justify-center gap-2 text-center">
                          <span className="text-lg sm:text-2xl font-bold text-purple-600 dark:text-purple-400">
                            {wItem.art}
                          </span>
                          <span className="font-black text-2xl sm:text-3xl md:text-4xl tracking-wide text-slate-900 dark:text-white leading-tight">
                            {highlightVowels ? (
                              wItem.word.split('').map((char, cIdx) => {
                                const isV = VOWELS_SET.has(char.toLowerCase());
                                return (
                                  <span
                                    key={cIdx}
                                    className={isV ? 'text-red-500 font-black' : 'text-blue-600 dark:text-blue-400 font-bold'}
                                  >
                                    {char}
                                  </span>
                                );
                              })
                            ) : wItem.silentLetter && wItem.word.endsWith(wItem.silentLetter) ? (
                              <>
                                {wItem.word.slice(0, -wItem.silentLetter.length)}
                                <span className="opacity-40 underline decoration-dotted decoration-purple-400">
                                  {wItem.silentLetter}
                                </span>
                              </>
                            ) : (
                              wItem.word
                            )}
                          </span>
                        </div>

                        {/* Colored Syllables Breakdown under the word to help the child decode */}
                        {wItem.syllables && wItem.syllables.length > 0 && (
                          <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1">
                            {wItem.syllables.map((syl, sIdx) => (
                              <span
                                key={sIdx}
                                className={`font-black text-base sm:text-lg px-2.5 py-0.5 rounded-lg border tracking-wider ${
                                  SYLLABLE_BADGE_COLORS[sIdx % SYLLABLE_BADGE_COLORS.length]
                                }`}
                              >
                                {syl}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="font-black text-2xl sm:text-3xl text-slate-900 dark:text-white text-center leading-tight">
                        {choice.label}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
