import React, { useState, useEffect } from 'react';
import { WordItem, WorldId, VisualMode } from '../types';
import { DrawingModal, getSavedCustomDrawing } from './DrawingModal';
import { renderCustomWordSvg } from './CustomWordSvg';
import { Camera, Palette, Pencil } from 'lucide-react';
import { sound } from '../services/sound';

interface WordIllustrationProps {
  item: WordItem;
  visualMode?: VisualMode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showControls?: boolean;
  className?: string;
}

const clientPhotoCache = new Map<string, string | null>();

/**
 * Convertit un emoji Unicode en codepoint hexadécimal pour charger le dessin vectoriel Twemoji SVG
 */
export function emojiToTwemojiUrl(emoji: string): string {
  const clean = emoji.trim();
  const codePoints: string[] = [];
  for (const char of clean) {
    const cp = char.codePointAt(0);
    if (cp !== undefined) {
      // Twemoji omits fe0f unless part of a ZWJ (200d) sequence
      if (cp === 0xfe0f && !clean.includes('\u200d')) continue;
      codePoints.push(cp.toString(16));
    }
  }
  return `https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/${codePoints.join('-')}.svg`;
}

/**
 * Décors illustrés SVG façon livre pour enfants selon le thème du mot
 */
const WorldSceneBackdrop: React.FC<{ world: WorldId }> = ({ world }) => {
  switch (world) {
    case 'animaux':
      return (
        <svg viewBox="0 0 120 100" className="absolute inset-0 w-full h-full object-cover pointer-events-none">
          <defs>
            <linearGradient id="bg-animaux" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#bae6fd" />
              <stop offset="65%" stopColor="#e0f2fe" />
              <stop offset="100%" stopColor="#bbf7d0" />
            </linearGradient>
          </defs>
          <rect width="120" height="100" fill="url(#bg-animaux)" />
          <circle cx="96" cy="22" r="10" fill="#fde047" opacity="0.85" />
          <path d="M12 26 Q18 20 25 25 Q32 22 35 28 Z" fill="#ffffff" opacity="0.85" />
          <path d="M0 78 Q35 62 70 76 T120 72 L120 100 L0 100 Z" fill="#86efac" />
          <path d="M0 86 Q50 74 120 84 L120 100 L0 100 Z" fill="#4ade80" />
          <circle cx="20" cy="88" r="2" fill="#fef08a" />
          <circle cx="95" cy="90" r="2" fill="#fbcfe8" />
        </svg>
      );
    case 'aliments':
      return (
        <svg viewBox="0 0 120 100" className="absolute inset-0 w-full h-full object-cover pointer-events-none">
          <defs>
            <linearGradient id="bg-aliments" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#fef3c7" />
              <stop offset="100%" stopColor="#ffedd5" />
            </linearGradient>
          </defs>
          <rect width="120" height="100" fill="url(#bg-aliments)" />
          {/* Nappe de pique-nique vichy en bas */}
          <rect x="0" y="72" width="120" height="28" fill="#fecaca" opacity="0.65" />
          <path d="M0 72 L120 72" stroke="#f87171" strokeWidth="1.5" strokeDasharray="6 6" />
          {/* Assiette illustrée centrale */}
          <ellipse cx="60" cy="76" rx="42" ry="12" fill="#ffffff" stroke="#fcd34d" strokeWidth="2" />
          <circle cx="20" cy="22" r="3" fill="#fbbf24" opacity="0.45" />
          <circle cx="102" cy="28" r="4" fill="#fb923c" opacity="0.35" />
        </svg>
      );
    case 'nature':
      return (
        <svg viewBox="0 0 120 100" className="absolute inset-0 w-full h-full object-cover pointer-events-none">
          <defs>
            <linearGradient id="bg-nature" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#a7f3d0" />
              <stop offset="55%" stopColor="#d1fae5" />
              <stop offset="100%" stopColor="#6ee7b7" />
            </linearGradient>
          </defs>
          <rect width="120" height="100" fill="url(#bg-nature)" />
          <polygon points="10,78 42,36 74,78" fill="#34d399" opacity="0.35" />
          <polygon points="55,78 88,42 118,78" fill="#10b981" opacity="0.3" />
          <path d="M0 76 Q60 68 120 78 L120 100 L0 100 Z" fill="#34d399" opacity="0.6" />
          <circle cx="24" cy="22" r="9" fill="#fef08a" opacity="0.8" />
        </svg>
      );
    case 'maison':
      return (
        <svg viewBox="0 0 120 100" className="absolute inset-0 w-full h-full object-cover pointer-events-none">
          <defs>
            <linearGradient id="bg-maison" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ffe4e6" />
              <stop offset="72%" stopColor="#fff1f2" />
              <stop offset="100%" stopColor="#fed7aa" />
            </linearGradient>
          </defs>
          <rect width="120" height="100" fill="url(#bg-maison)" />
          {/* Petite fenêtre de chambre en fond */}
          <rect x="78" y="14" width="24" height="26" rx="3" fill="#bae6fd" stroke="#fda4af" strokeWidth="2" opacity="0.7" />
          <line x1="90" y1="14" x2="90" y2="40" stroke="#fda4af" strokeWidth="1.5" opacity="0.7" />
          <line x1="78" y1="27" x2="102" y2="27" stroke="#fda4af" strokeWidth="1.5" opacity="0.7" />
          {/* Plancher chaleureux & tapis */}
          <rect x="0" y="75" width="120" height="25" fill="#fdba74" opacity="0.55" />
          <ellipse cx="60" cy="85" rx="38" ry="8" fill="#fb7185" opacity="0.35" />
        </svg>
      );
    case 'transports':
      return (
        <svg viewBox="0 0 120 100" className="absolute inset-0 w-full h-full object-cover pointer-events-none">
          <defs>
            <linearGradient id="bg-transports" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#93c5fd" />
              <stop offset="70%" stopColor="#dbeafe" />
              <stop offset="100%" stopColor="#cbd5e1" />
            </linearGradient>
          </defs>
          <rect width="120" height="100" fill="url(#bg-transports)" />
          <path d="M15 24 Q22 17 30 23 Q38 19 42 26 Z" fill="#ffffff" opacity="0.85" />
          <path d="M78 18 Q85 12 92 17 Q98 14 102 20 Z" fill="#ffffff" opacity="0.75" />
          {/* Route illustrée */}
          <rect x="0" y="74" width="120" height="26" fill="#64748b" opacity="0.75" />
          <line x1="6" y1="87" x2="114" y2="87" stroke="#fde047" strokeWidth="2.5" strokeDasharray="10 8" />
        </svg>
      );
    case 'ecole':
      return (
        <svg viewBox="0 0 120 100" className="absolute inset-0 w-full h-full object-cover pointer-events-none">
          <defs>
            <linearGradient id="bg-ecole" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#fce7f3" />
              <stop offset="100%" stopColor="#ede9fe" />
            </linearGradient>
          </defs>
          <rect width="120" height="100" fill="url(#bg-ecole)" />
          {/* Lignes de cahier d'écolier */}
          <line x1="0" y1="25" x2="120" y2="25" stroke="#c4b5fd" strokeWidth="1" opacity="0.5" />
          <line x1="0" y1="50" x2="120" y2="50" stroke="#c4b5fd" strokeWidth="1" opacity="0.5" />
          <line x1="0" y1="75" x2="120" y2="75" stroke="#c4b5fd" strokeWidth="1" opacity="0.5" />
          <line x1="22" y1="0" x2="22" y2="100" stroke="#f472b6" strokeWidth="1.2" opacity="0.45" />
        </svg>
      );
    case 'metiers':
    default:
      return (
        <svg viewBox="0 0 120 100" className="absolute inset-0 w-full h-full object-cover pointer-events-none">
          <defs>
            <linearGradient id="bg-metiers" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ffedd5" />
              <stop offset="65%" stopColor="#fef3c7" />
              <stop offset="100%" stopColor="#fde68a" />
            </linearGradient>
          </defs>
          <rect width="120" height="100" fill="url(#bg-metiers)" />
          <circle cx="22" cy="22" r="3" fill="#fb923c" opacity="0.45" />
          <circle cx="98" cy="20" r="4" fill="#f59e0b" opacity="0.45" />
          <path d="M0 78 Q60 68 120 78 L120 100 L0 100 Z" fill="#fcd34d" opacity="0.55" />
        </svg>
      );
  }
};

export const WordIllustration: React.FC<WordIllustrationProps> = ({
  item,
  visualMode = 'drawing',
  size = 'md',
  showControls = true,
  className = ''
}) => {
  const [localOverrideMode, setLocalOverrideMode] = useState<'drawing' | 'photo' | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [photoLoading, setPhotoLoading] = useState(false);
  const [twemojiFailed, setTwemojiFailed] = useState(false);
  const [customDrawing, setCustomDrawing] = useState<string | null>(() => getSavedCustomDrawing(item.id));
  const [isDrawingModalOpen, setIsDrawingModalOpen] = useState(false);

  const customSvg = renderCustomWordSvg(item.word);
  // Si le mot a un emoji générique (preferPhoto) et pas de dessin SVG sur-mesure, on privilégie la vraie photo par défaut
  const defaultAutoMode: VisualMode =
    visualMode === 'drawing' && item.preferPhoto && !customSvg && !customDrawing
      ? 'photo'
      : visualMode;

  const effectiveMode: VisualMode = localOverrideMode || defaultAutoMode;
  const twemojiUrl = emojiToTwemojiUrl(item.emoji);
  const queryWord = item.photoQuery || item.word;

  useEffect(() => {
    setCustomDrawing(getSavedCustomDrawing(item.id));
    setTwemojiFailed(false);
    setLocalOverrideMode(null);
  }, [item.id, item.emoji]);

  useEffect(() => {
    const needsPhoto =
      effectiveMode === 'photo' ||
      effectiveMode === 'duo' ||
      isDrawingModalOpen ||
      Boolean(item.preferPhoto);
    if (!needsPhoto) return;

    const cacheKey = queryWord.toLowerCase();
    if (clientPhotoCache.has(cacheKey)) {
      setPhotoUrl(clientPhotoCache.get(cacheKey) || null);
      return;
    }

    let cancelled = false;
    setPhotoLoading(true);

    fetch(`/api/photo?word=${encodeURIComponent(queryWord)}`)
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        const url = data?.url || null;
        clientPhotoCache.set(cacheKey, url);
        setPhotoUrl(url);
      })
      .catch(() => {
        if (!cancelled) setPhotoUrl(null);
      })
      .finally(() => {
        if (!cancelled) setPhotoLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [queryWord, effectiveMode, isDrawingModalOpen, item.preferPhoto]);

  const dimensions = {
    sm: {
      box: 'w-32 h-24 sm:w-36 sm:h-28 rounded-2xl',
      duoBox: 'w-44 h-24 sm:w-48 sm:h-28 rounded-2xl',
      art: 'w-16 h-16 sm:w-18 sm:h-18',
      emojiFallback: 'text-4xl'
    },
    md: {
      box: 'w-40 h-32 sm:w-44 sm:h-36 rounded-2xl',
      duoBox: 'w-52 h-32 sm:w-60 sm:h-36 rounded-2xl',
      art: 'w-22 h-22 sm:w-24 sm:h-24',
      emojiFallback: 'text-5xl sm:text-6xl'
    },
    lg: {
      box: 'w-52 h-40 sm:w-64 sm:h-48 rounded-3xl',
      duoBox: 'w-68 h-40 sm:w-84 sm:h-48 rounded-3xl',
      art: 'w-30 h-30 sm:w-36 sm:h-36',
      emojiFallback: 'text-7xl sm:text-8xl'
    },
    xl: {
      box: 'w-60 h-48 sm:w-72 sm:h-56 rounded-3xl',
      duoBox: 'w-76 h-48 sm:w-96 sm:h-56 rounded-3xl',
      art: 'w-36 h-36 sm:w-40 sm:h-40',
      emojiFallback: 'text-7xl sm:text-8xl'
    }
  }[size];

  const renderIllustratedDrawing = () => (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
      <WorldSceneBackdrop world={item.world} />
      {customDrawing ? (
        <img
          src={customDrawing}
          alt={`Dessin de ${item.word}`}
          className="relative z-10 w-full h-full object-contain p-1 drop-shadow-md transition-transform group-hover:scale-105"
        />
      ) : customSvg ? (
        <div className={`relative z-10 flex items-center justify-center transition-transform duration-300 group-hover:scale-110 ${dimensions.art}`}>
          {customSvg}
        </div>
      ) : !twemojiFailed ? (
        <img
          src={twemojiUrl}
          alt={item.word}
          onError={() => setTwemojiFailed(true)}
          className={`relative z-10 object-contain drop-shadow-md transition-transform duration-300 group-hover:scale-110 ${dimensions.art}`}
        />
      ) : (
        <span className={`relative z-10 select-none drop-shadow-sm ${dimensions.emojiFallback}`}>
          {item.emoji}
        </span>
      )}

      {/* Badge "Mon Dessin" si personnalisé */}
      {customDrawing && (
        <span className="absolute bottom-1 left-1 z-20 bg-purple-600/90 text-white text-[9px] font-black px-1.5 py-0.5 rounded-md shadow">
          ✏️ Mon dessin
        </span>
      )}
    </div>
  );

  const renderPhotoPane = () => (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden bg-slate-100 dark:bg-slate-800">
      {photoLoading ? (
        <div className="w-full h-full flex flex-col items-center justify-center gap-1 animate-pulse bg-slate-200 dark:bg-slate-800">
          <Camera className="w-5 h-5 text-slate-400" />
          <span className="text-[9px] font-bold text-slate-400">Photo...</span>
        </div>
      ) : photoUrl ? (
        <>
          <img
            src={photoUrl}
            alt={`Photo de ${item.word}`}
            referrerPolicy="no-referrer"
            onError={() => setPhotoUrl(null)}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <span className="absolute bottom-1 left-1 z-20 bg-black/60 backdrop-blur-xs text-white text-[9px] font-bold px-1.5 py-0.2 rounded">
            📷 Photo
          </span>
        </>
      ) : (
        // Fallback élégant vers le dessin illustré si aucune photo Wikipedia n'est trouvée
        renderIllustratedDrawing()
      )}
    </div>
  );

  return (
    <>
      <div
        className={`relative overflow-hidden border-2 border-white/80 dark:border-slate-700/80 shadow-md ring-1 ring-slate-200/70 dark:ring-purple-500/20 select-none ${
          effectiveMode === 'duo' ? dimensions.duoBox : dimensions.box
        } ${className}`}
      >
        {effectiveMode === 'duo' ? (
          <div className="w-full h-full grid grid-cols-2 divide-x-2 divide-white/80 dark:divide-slate-700">
            {renderIllustratedDrawing()}
            {renderPhotoPane()}
          </div>
        ) : effectiveMode === 'photo' ? (
          renderPhotoPane()
        ) : (
          renderIllustratedDrawing()
        )}

        {/* Mini boutons d'action sur la vignette (Basculer Dessin/Photo + Ouvrir l'Ardoise à Dessin) */}
        {showControls && (
          <div className="absolute top-1 left-1 z-20 flex items-center gap-1 opacity-85 group-hover:opacity-100 transition-opacity">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                sound.playPop();
                setLocalOverrideMode((prev) => {
                  const current = prev || visualMode;
                  return current === 'photo' ? 'drawing' : 'photo';
                });
              }}
              title="Basculer entre Dessin illustré et Photo réelle"
              className="w-6 h-6 rounded-lg bg-white/90 dark:bg-slate-900/90 hover:bg-purple-100 text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700 shadow-sm flex items-center justify-center transition-transform hover:scale-110 active:scale-95 cursor-pointer"
            >
              {effectiveMode === 'photo' ? (
                <Palette className="w-3.5 h-3.5 text-purple-600" />
              ) : (
                <Camera className="w-3.5 h-3.5 text-teal-600" />
              )}
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                sound.playPop();
                setIsDrawingModalOpen(true);
              }}
              title="Dessiner ce mot sur l'ardoise magique"
              className="w-6 h-6 rounded-lg bg-white/90 dark:bg-slate-900/90 hover:bg-amber-100 text-amber-600 dark:text-amber-400 border border-slate-200/80 dark:border-slate-700 shadow-sm flex items-center justify-center transition-transform hover:scale-110 active:scale-95 cursor-pointer"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {isDrawingModalOpen && (
        <DrawingModal
          item={item}
          photoUrl={photoUrl}
          twemojiUrl={!twemojiFailed ? twemojiUrl : undefined}
          initialCustomDrawing={customDrawing}
          onSaveDrawing={(_id, dataUrl) => setCustomDrawing(dataUrl)}
          onClose={() => setIsDrawingModalOpen(false)}
        />
      )}
    </>
  );
};
