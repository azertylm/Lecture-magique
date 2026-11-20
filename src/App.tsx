import React, { useState, useEffect, useRef } from 'react';
import { WorldId, VisualMode } from './types';
import { WORLDS_CONFIG, WORDS_DATABASE } from './data/words';
import { sound, GoogleVoiceName } from './services/sound';
import { MainGame } from './components/MainGame';
import { SyllableFactory } from './components/SyllableFactory';
import { StoryBook } from './components/StoryBook';
import { StarGallery } from './components/StarGallery';
import { 
  Gamepad2, 
  FlaskConical, 
  BookOpen, 
  Trophy, 
  Star, 
  Sparkles, 
  Settings2,
  Volume2,
  VolumeX,
  Play,
  Check
} from 'lucide-react';

type AppTab = 'game' | 'factory' | 'stories' | 'gallery';

const STORAGE_KEY_PROGRESS = 'lecture_magique_progress';

export default function App() {
  const [activeTab, setActiveTab] = useState<AppTab>('game');
  const [isPlayingGame, setIsPlayingGame] = useState(false);
  const [selectedWorld, setSelectedWorld] = useState<WorldId>('animaux');
  
  // Reading & Visual options
  const [visualMode, setVisualMode] = useState<VisualMode>('drawing');
  const [highlightVowels, setHighlightVowels] = useState(false);
  const [speechSpeed, setSpeechSpeed] = useState<'normal' | 'slow'>('normal');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [googleVoice, setGoogleVoice] = useState<GoogleVoiceName>('GoogleNeuralFr');
  const [showVoiceModal, setShowVoiceModal] = useState(false);

  // User persistent progress
  const [totalStars, setTotalStars] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PROGRESS);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.totalStars || 0;
      }
    } catch {
      // ignore
    }
    return 5; // starter welcome stars
  });

  const [discoveredWords, setDiscoveredWords] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PROGRESS);
      if (saved) {
        const parsed = JSON.parse(saved);
        return new Set(parsed.discoveredWords || ['animaux_chat', 'aliments_pomme']);
      }
    } catch {
      // ignore
    }
    return new Set(['animaux_chat', 'aliments_pomme']);
  });

  // Twinkling stars canvas
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // Save progress
    try {
      localStorage.setItem(STORAGE_KEY_PROGRESS, JSON.stringify({
        totalStars,
        discoveredWords: Array.from(discoveredWords)
      }));
    } catch {
      // ignore
    }
  }, [totalStars, discoveredWords]);

  // Stars background animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let stars: { x: number; y: number; r: number; speed: number; phase: number }[] = [];

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      stars = Array.from({ length: 90 }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.5 + 0.4,
        speed: Math.random() * 0.015 + 0.005,
        phase: Math.random() * Math.PI * 2
      }));
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const isDark = document.documentElement.classList.contains('dark');
      const starAlpha = isDark ? 0.6 : 0.25;
      const t = Date.now() / 1000;

      stars.forEach(s => {
        const a = 0.15 + starAlpha * (0.5 + 0.5 * Math.sin(t * s.speed * 18 + s.phase));
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = isDark ? `rgba(255, 255, 255, ${a})` : `rgba(139, 92, 246, ${a})`;
        ctx.fill();
      });

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleStarEarned = () => {
    setTotalStars(prev => prev + 1);
  };

  const handleWordDiscovered = (wordId: string) => {
    setDiscoveredWords(prev => {
      const next = new Set(prev);
      next.add(wordId);
      return next;
    });
  };

  const handleSelectWorld = (worldId: WorldId) => {
    sound.playPop();
    setSelectedWorld(worldId);
    const cfg = WORLDS_CONFIG[worldId];
    sound.speak(`On va explorer ${cfg.label} !`);
  };

  const handleWelcomeOwlClick = () => {
    sound.playPop();
    sound.speak("Bonjour petit lecteur ! Je m'appelle Lumo ! Choisis un jeu ou une histoire et amusons-nous à lire !");
  };

  const handleToggleVowels = () => {
    sound.playPop();
    setHighlightVowels(prev => !prev);
  };

  const handleToggleSpeed = () => {
    sound.playPop();
    const next = sound.toggleSpeechRate();
    setSpeechSpeed(next);
  };

  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    sound.setSoundEnabled(next);
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between overflow-x-hidden font-sans">
      
      {/* Background Stars Canvas */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-0"
      />

      {/* ── SUB-HEADER BAR : MODES & PEDAGOGICAL TOGGLES ── */}
      <div className="relative z-10 w-full px-3 py-2 bg-white/70 dark:bg-slate-900/70 border-b border-slate-200 dark:border-purple-900/30 backdrop-blur-md">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-2.5">
          
          {/* Main App Navigation Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-1">
            <button
              onClick={() => {
                sound.playPop();
                setActiveTab('game');
                setIsPlayingGame(false);
              }}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'game'
                  ? 'bg-purple-600 text-white shadow-md scale-102 ring-2 ring-purple-300'
                  : 'bg-white/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-purple-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
              }`}
            >
              <Gamepad2 className="w-3.5 h-3.5" />
              <span>Jeux de Lumo</span>
            </button>

            <button
              onClick={() => {
                sound.playPop();
                setActiveTab('factory');
                setIsPlayingGame(false);
              }}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'factory'
                  ? 'bg-purple-600 text-white shadow-md scale-102 ring-2 ring-purple-300'
                  : 'bg-white/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-purple-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
              }`}
            >
              <FlaskConical className="w-3.5 h-3.5 text-amber-300" />
              <span>Usine à Syllabes</span>
            </button>

            <button
              onClick={() => {
                sound.playPop();
                setActiveTab('stories');
                setIsPlayingGame(false);
              }}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'stories'
                  ? 'bg-purple-600 text-white shadow-md scale-102 ring-2 ring-purple-300'
                  : 'bg-white/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-purple-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-teal-300" />
              <span>Grimoire d'Histoires</span>
            </button>

            <button
              onClick={() => {
                sound.playPop();
                setActiveTab('gallery');
                setIsPlayingGame(false);
              }}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'gallery'
                  ? 'bg-purple-600 text-white shadow-md scale-102 ring-2 ring-purple-300'
                  : 'bg-white/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-purple-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
              }`}
            >
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>Trophées ({totalStars}⭐)</span>
            </button>
          </div>

          {/* Reading Options & Tools */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            
            {/* Visual Mode Selector: Dessins Illustrés / Photos Réelles / Duo */}
            <div
              className="flex items-center p-0.5 rounded-full bg-slate-200/80 dark:bg-slate-800 border border-slate-300/80 dark:border-slate-700 shadow-xs"
              title="Choisir la représentation des mots : Dessins illustrés, Photos réelles ou les deux"
            >
              {(
                [
                  { id: 'drawing' as VisualMode, label: '🎨 Dessins' },
                  { id: 'photo' as VisualMode, label: '📷 Photos' },
                  { id: 'duo' as VisualMode, label: '🖼️ Duo' }
                ]
              ).map((m) => (
                <button
                  key={m.id}
                  onClick={() => {
                    sound.playPop();
                    setVisualMode(m.id);
                  }}
                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-black transition-all cursor-pointer ${
                    visualMode === m.id
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'text-slate-700 dark:text-slate-300 hover:text-purple-600'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>

            {/* Google Voice HD Selector Button */}
            <button
              onClick={() => {
                sound.playPop();
                setShowVoiceModal(true);
              }}
              title="Configurer la voix Google HD (Gemini 3.8 Flash TTS)"
              className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-md active:scale-95 transition-all cursor-pointer ring-1 ring-purple-300"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Voix Google HD</span>
              <span className="text-[10px] px-1.5 py-0.2 bg-white/20 rounded-md font-mono">{googleVoice}</span>
            </button>

            {/* Speed Toggle (Tortue vs Lièvre) */}
            <button
              onClick={handleToggleSpeed}
              title={`Vitesse de lecture : ${speechSpeed === 'slow' ? 'Lente (Tortue)' : 'Normale (Lièvre)'}`}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-white/80 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer shadow-sm"
            >
              <span>{speechSpeed === 'slow' ? '🐢 Lente' : '🐇 Normale'}</span>
            </button>

            {/* CP/CE1 Color coding toggle (Voyelles rouge, consonnes bleu) */}
            <button
              onClick={handleToggleVowels}
              title="Coloration pédagogique CP : voyelles en rouge, consonnes en bleu"
              className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border transition-colors cursor-pointer shadow-sm ${
                highlightVowels
                  ? 'bg-rose-500/20 border-rose-400 text-rose-700 dark:text-rose-300'
                  : 'bg-white/80 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              <span className="text-red-500 font-black">A</span>
              <span className="text-blue-500 font-black">B</span>
              <span className="hidden sm:inline">CP/CE1</span>
            </button>

            {/* Sound Mute */}
            <button
              onClick={handleToggleSound}
              title={soundEnabled ? 'Couper les sons' : 'Activer les sons'}
              className="p-1.5 rounded-full bg-white/80 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
            >
              {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5 text-rose-500" />}
            </button>
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT CONTAINER ── */}
      <main className="relative z-10 flex-1 w-full max-w-6xl mx-auto px-3 sm:px-6 py-4 flex flex-col items-center justify-center">
        
        {/* GAME TAB */}
        {activeTab === 'game' && (
          isPlayingGame ? (
            <MainGame
              initialWorld={selectedWorld}
              visualMode={visualMode}
              highlightVowels={highlightVowels}
              onStarEarned={handleStarEarned}
              onWordDiscovered={handleWordDiscovered}
              onGoHome={() => setIsPlayingGame(false)}
            />
          ) : (
            /* Welcome / Game Selection Screen */
            <div className="w-full flex flex-col items-center text-center gap-6 py-4 animate-in fade-in">
              
              {/* Lumo the Owl Mascot */}
              <div
                onClick={handleWelcomeOwlClick}
                title="Touche Lumo pour lui dire bonjour !"
                className="text-8xl sm:text-9xl select-none filter drop-shadow-2xl cursor-pointer transform hover:scale-110 active:scale-95 transition-transform animate-float-slow"
              >
                🦉
              </div>

              {/* Title & Subtitle */}
              <div>
                <h2 className="text-3xl sm:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-rose-400 to-purple-400 tracking-tight leading-tight">
                  Apprends à lire avec Lumo !
                </h2>
                <p className="text-sm sm:text-base text-slate-600 dark:text-purple-200/80 font-bold mt-1 max-w-md mx-auto">
                  La méthode syllabique magique avec dessins illustrés, vraies photos et ardoise à dessin ✨
                </p>
              </div>

              {/* Worlds Grid Chips */}
              <div className="w-full max-w-2xl">
                <div className="text-xs font-extrabold text-purple-700 dark:text-purple-300 uppercase tracking-wider mb-2">
                  Choisis ton thème d'aventure :
                </div>

                <div className="flex flex-wrap items-center justify-center gap-2.5">
                  {(Object.keys(WORLDS_CONFIG) as WorldId[]).map((wid) => {
                    const cfg = WORLDS_CONFIG[wid];
                    const isSelected = selectedWorld === wid;
                    const count = WORDS_DATABASE.filter((w) => w.world === wid).length;
                    return (
                      <button
                        key={wid}
                        onClick={() => handleSelectWorld(wid)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-black text-sm sm:text-base transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-purple-600 text-white shadow-xl scale-105 border-2 border-amber-300 ring-2 ring-purple-400'
                            : 'bg-white/80 dark:bg-slate-900/80 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-purple-500/20 hover:border-purple-400'
                        }`}
                      >
                        <span className="text-xl sm:text-2xl">{cfg.icon}</span>
                        <span>{cfg.label}</span>
                        <span className={`text-xs px-1.5 py-0.5 rounded-lg ${isSelected ? 'bg-white/20 text-white' : 'bg-purple-500/10 text-purple-600 dark:text-purple-300'}`}>
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Big Play CTA Button */}
              <button
                onClick={() => {
                  sound.playPop();
                  setIsPlayingGame(true);
                  sound.speak(`C'est parti ! Jouons avec ${WORLDS_CONFIG[selectedWorld].label} !`);
                }}
                className="w-full max-w-xs h-16 rounded-full bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xl sm:text-2xl shadow-2xl hover:shadow-purple-500/50 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3 border-2 border-purple-300/40 cursor-pointer animate-pulse-glow"
              >
                <Play className="w-7 h-7 fill-white" />
                <span>Jouer !</span>
                <Sparkles className="w-5 h-5 text-amber-300" />
              </button>

              {/* Quick stats strip */}
              <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-xs font-bold text-slate-500 dark:text-slate-400 pt-2">
                <span>⭐ {totalStars} étoiles d'or</span>
                <span>•</span>
                <span>📚 {WORDS_DATABASE.length} mots à explorer</span>
                <span>•</span>
                <span>🎨 Dessins + 📷 Photos + ✏️ Ardoise</span>
              </div>
            </div>
          )
        )}

        {/* FACTORY TAB */}
        {activeTab === 'factory' && (
          <SyllableFactory onStarEarned={handleStarEarned} />
        )}

        {/* STORIES TAB */}
        {activeTab === 'stories' && (
          <StoryBook onStarEarned={handleStarEarned} />
        )}

        {/* GALLERY TAB */}
        {activeTab === 'gallery' && (
          <StarGallery
            totalStars={totalStars}
            discoveredWordIds={discoveredWords}
            highlightVowels={highlightVowels}
            visualMode={visualMode}
          />
        )}
      </main>

      {/* ── FOOTER ── */}
      <footer className="relative z-10 w-full py-2.5 px-4 text-center text-[11px] text-slate-600 dark:text-slate-400 border-t border-slate-200 dark:border-purple-900/20 bg-white/40 dark:bg-slate-950/40 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <span>Lecture Magique • Conçu pour l'apprentissage de la lecture des enfants</span>
          <span className="flex items-center gap-1 text-purple-600 dark:text-purple-400 font-bold">
            <span>🦉 Lumo</span>
            <span>• Voix Google Gemini 3.8 Flash TTS</span>
            <span>• Socle Unifié ALPHABETTE v0.4.0</span>
          </span>
        </div>
      </footer>

      {/* ── MODALE SÉLECTION VOIX GOOGLE HD ── */}
      {showVoiceModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-slate-900 border-2 border-purple-500/40 p-6 text-white shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🪄</span>
                <div>
                  <h3 className="font-extrabold text-base text-purple-200 leading-tight">
                    Voix Google HD de Lumo
                  </h3>
                  <span className="text-[10px] text-slate-400">Modèle Gemini 3.8 Flash Lite TTS</span>
                </div>
              </div>
              <button
                onClick={() => setShowVoiceModal(false)}
                className="text-slate-400 hover:text-white text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="py-4 space-y-3">
              <p className="text-xs text-slate-300 leading-relaxed">
                Choisis le timbre de voix avec lequel Lumo guide ton enfant. Chaque voix est générée en direct avec une prononciation française claire et naturelle.
              </p>

              {/* Voice options list */}
              <div className="space-y-2">
                {[
                  {
                    id: 'GoogleNeuralFr' as GoogleVoiceName,
                    name: 'Google Neural Français',
                    icon: '🇫🇷',
                    tag: 'Ultra-Naturelle',
                    desc: 'Voix humaine neuronale Google (accent de France, claire et fluide)',
                  },
                  {
                    id: 'GoogleNeuralCa' as GoogleVoiceName,
                    name: 'Google Neural Douce',
                    icon: '🍁',
                    tag: 'Articulée',
                    desc: 'Voix humaine neuronale douce et posée pour bien entendre chaque son',
                  },
                  {
                    id: 'Puck' as GoogleVoiceName,
                    name: 'Puck (Lumo Studio)',
                    icon: '🦉',
                    tag: 'Gemini Studio',
                    desc: 'Voix pétillante, vive et pleine d\'énergie',
                  },
                  {
                    id: 'Kore' as GoogleVoiceName,
                    name: 'Kore',
                    icon: '🌸',
                    tag: 'Douce & Claire',
                    desc: 'Voix bienveillante, très pédagogique pour le CP',
                  },
                ].map((v) => {
                  const isSelected = googleVoice === v.id;
                  return (
                    <div
                      key={v.id}
                      onClick={() => {
                        sound.playPop();
                        sound.setGoogleVoice(v.id);
                        setGoogleVoice(v.id);
                        sound.speak(`Bonjour ! C'est la voix ${v.name} ! Prêt à apprendre à lire ?`, {
                          voice: v.id,
                        });
                      }}
                      className={`flex items-center justify-between p-3 rounded-2xl border-2 transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-purple-600/30 border-purple-400 shadow-md ring-1 ring-purple-300'
                          : 'bg-slate-800/60 border-slate-700/60 hover:bg-slate-800 hover:border-slate-600'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{v.icon}</span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-sm text-white">{v.name}</span>
                            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-purple-900/80 text-purple-200 border border-purple-400/30">
                              {v.tag}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400">{v.desc}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {isSelected ? (
                          <div className="w-6 h-6 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center text-xs font-black">
                            ✓
                          </div>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              sound.speak(`Bonjour ! C'est la voix ${v.name} !`, { voice: v.id });
                            }}
                            className="text-xs px-2.5 py-1 rounded-lg bg-slate-700 hover:bg-slate-600 text-purple-200 font-bold"
                          >
                            Écouter
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-800">
              <span className="text-[11px] text-emerald-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Qualité audio WAV 24 kHz</span>
              </span>

              <button
                onClick={() => setShowVoiceModal(false)}
                className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 font-bold text-white text-xs shadow-md transition-colors cursor-pointer"
              >
                Parfait !
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
