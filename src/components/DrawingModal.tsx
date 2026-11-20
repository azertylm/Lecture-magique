import React, { useRef, useState, useEffect } from 'react';
import { WordItem, getFullWordText } from '../data/words';
import { sound } from '../services/sound';
import { Eraser, Trash2, Check, Volume2, Eye, EyeOff, Sparkles, X } from 'lucide-react';

interface DrawingModalProps {
  item: WordItem;
  photoUrl?: string | null;
  twemojiUrl?: string;
  initialCustomDrawing?: string | null;
  onSaveDrawing: (wordId: string, dataUrl: string | null) => void;
  onClose: () => void;
}

const PALETTE_COLORS = [
  { name: 'Noir', hex: '#1e293b' },
  { name: 'Rouge', hex: '#ef4444' },
  { name: 'Orange', hex: '#f97316' },
  { name: 'Jaune', hex: '#eab308' },
  { name: 'Vert', hex: '#22c55e' },
  { name: 'Turquoise', hex: '#14b8a6' },
  { name: 'Bleu', hex: '#3b82f6' },
  { name: 'Violet', hex: '#8b5cf6' },
  { name: 'Rose', hex: '#ec4899' },
  { name: 'Marron', hex: '#92400e' }
];

const STORAGE_DRAWINGS_KEY = 'lecture_magique_custom_drawings';

export function getSavedCustomDrawing(wordId: string): string | null {
  try {
    const raw = localStorage.getItem(STORAGE_DRAWINGS_KEY);
    if (!raw) return null;
    const map = JSON.parse(raw);
    return map[wordId] || null;
  } catch {
    return null;
  }
}

export function saveCustomDrawingToStorage(wordId: string, dataUrl: string | null): void {
  try {
    const raw = localStorage.getItem(STORAGE_DRAWINGS_KEY);
    const map = raw ? JSON.parse(raw) : {};
    if (dataUrl) {
      map[wordId] = dataUrl;
    } else {
      delete map[wordId];
    }
    localStorage.setItem(STORAGE_DRAWINGS_KEY, JSON.stringify(map));
  } catch {
    // ignore storage quota errors
  }
}

export const DrawingModal: React.FC<DrawingModalProps> = ({
  item,
  photoUrl,
  twemojiUrl,
  initialCustomDrawing,
  onSaveDrawing,
  onClose
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [color, setColor] = useState('#8b5cf6');
  const [brushSize, setBrushSize] = useState(8);
  const [isEraser, setIsEraser] = useState(false);
  const [showStencil, setShowStencil] = useState(true);
  const [isDrawing, setIsDrawing] = useState(false);

  const fullText = getFullWordText(item);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (initialCustomDrawing) {
      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      };
      img.src = initialCustomDrawing;
    }
  }, [initialCustomDrawing]);

  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    if ('touches' in e) {
      const touch = e.touches[0] || e.changedTouches[0];
      return {
        x: (touch.clientX - rect.left) * scaleX,
        y: (touch.clientY - rect.top) * scaleY
      };
    } else {
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY
      };
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.stopPropagation();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    setIsDrawing(true);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    e.stopPropagation();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.globalCompositeOperation = isEraser ? 'destination-out' : 'source-over';
    ctx.strokeStyle = isEraser ? 'rgba(0,0,0,1)' : color;
    ctx.lineWidth = isEraser ? brushSize * 2.2 : brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
  };

  const handleClear = () => {
    sound.playPop();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const handleSave = () => {
    sound.playSuccess();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    saveCustomDrawingToStorage(item.id, dataUrl);
    onSaveDrawing(item.id, dataUrl);
    sound.speak(`Bravo ! Ton dessin pour ${fullText} est enregistré !`);
    onClose();
  };

  const handleResetToDefault = () => {
    sound.playPop();
    saveCustomDrawingToStorage(item.id, null);
    onSaveDrawing(item.id, null);
    onClose();
  };

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        onClose();
      }}
      className="fixed inset-0 z-[200] flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm animate-in fade-in select-none"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border-3 border-purple-400/50 p-4 sm:p-6 shadow-2xl flex flex-col gap-3"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">🎨</span>
            <div>
              <h3 className="font-black text-base sm:text-lg text-slate-900 dark:text-white leading-tight">
                L'Ardoise à Dessin : <span className="text-purple-600 dark:text-purple-400">{fullText}</span>
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Dessine ou colorie le mot avec ton doigt ou ta souris !
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                sound.playPop();
                sound.speak(fullText);
              }}
              title="Écouter le mot"
              className="p-2 rounded-full bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300 hover:scale-105 cursor-pointer"
            >
              <Volume2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Models Reference Bar (Drawing + Real Photo) */}
        <div className="flex items-center justify-between gap-3 bg-purple-50/70 dark:bg-slate-800/70 rounded-2xl p-2.5 border border-purple-200/60 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-center p-1.5 shadow-sm">
              {twemojiUrl ? (
                <img src={twemojiUrl} alt={item.word} className="w-9 h-9 object-contain" />
              ) : (
                <span className="text-3xl">{item.emoji}</span>
              )}
            </div>
            {photoUrl && (
              <div className="w-12 h-12 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm bg-white">
                <img
                  src={photoUrl}
                  alt={item.word}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="flex flex-col">
              <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200">
                Modèle : {fullText}
              </span>
              <div className="flex flex-wrap gap-1 mt-0.5">
                {item.syllables.map((s, idx) => (
                  <span
                    key={idx}
                    onClick={() => sound.speak(s, { isSyllable: true })}
                    className="text-[11px] font-black px-1.5 py-0.2 rounded bg-purple-200/80 dark:bg-purple-900/70 text-purple-800 dark:text-purple-200 cursor-pointer"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={() => setShowStencil((prev) => !prev)}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
              showStencil
                ? 'bg-purple-600 text-white border-purple-500'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
            }`}
          >
            {showStencil ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span>Calque</span>
          </button>
        </div>

        {/* Drawing Canvas Area */}
        <div className="relative w-full h-64 sm:h-72 rounded-2xl bg-white border-2 border-dashed border-purple-300 dark:border-purple-600 overflow-hidden shadow-inner touch-none">
          {/* Background Stencil Guide */}
          {showStencil && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-15">
              {twemojiUrl ? (
                <img src={twemojiUrl} alt="" className="w-44 h-44 object-contain" />
              ) : (
                <span className="text-9xl">{item.emoji}</span>
              )}
            </div>
          )}

          <canvas
            ref={canvasRef}
            width={500}
            height={320}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
            className="relative z-10 w-full h-full cursor-crosshair"
          />
        </div>

        {/* Color Palette & Brush Controls */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            {PALETTE_COLORS.map((c) => (
              <button
                key={c.hex}
                onClick={() => {
                  sound.playPop();
                  setIsEraser(false);
                  setColor(c.hex);
                }}
                title={c.name}
                style={{ backgroundColor: c.hex }}
                className={`w-7 h-7 rounded-full border-2 transition-transform cursor-pointer ${
                  !isEraser && color === c.hex
                    ? 'scale-125 border-slate-950 dark:border-white ring-2 ring-purple-400'
                    : 'border-white shadow-sm hover:scale-110'
                }`}
              />
            ))}
          </div>

          <div className="flex items-center gap-1.5">
            {/* Brush Size */}
            {[5, 10, 18].map((sz) => (
              <button
                key={sz}
                onClick={() => setBrushSize(sz)}
                className={`w-7 h-7 rounded-lg border flex items-center justify-center cursor-pointer ${
                  brushSize === sz
                    ? 'bg-purple-100 dark:bg-purple-900/60 border-purple-500'
                    : 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700'
                }`}
                title="Taille du pinceau"
              >
                <span
                  className="rounded-full bg-slate-800 dark:bg-white"
                  style={{ width: Math.max(4, sz / 1.5), height: Math.max(4, sz / 1.5) }}
                />
              </button>
            ))}

            {/* Eraser */}
            <button
              onClick={() => setIsEraser((prev) => !prev)}
              title="Gomme"
              className={`p-1.5 rounded-xl border text-xs font-bold flex items-center gap-1 cursor-pointer ${
                isEraser
                  ? 'bg-amber-400 text-slate-950 border-amber-500'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
              }`}
            >
              <Eraser className="w-4 h-4" />
            </button>

            {/* Clear all */}
            <button
              onClick={handleClear}
              title="Tout effacer"
              className="p-1.5 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-300 border border-rose-300 dark:border-rose-800 hover:bg-rose-200 cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800">
          {initialCustomDrawing ? (
            <button
              onClick={handleResetToDefault}
              className="text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline cursor-pointer"
            >
              Remettre l'illustration d'origine
            </button>
          ) : (
            <span className="text-[11px] text-slate-400 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Ton dessin s'affichera sur la carte du mot !</span>
            </span>
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold cursor-pointer"
            >
              Annuler
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-black shadow-md cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Valider mon dessin</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
