import React from 'react';

/**
 * Détecte si le mot contient un adjectif de couleur pour colorier dynamiquement le dessin SVG
 */
export function extractColorFromWord(word: string): { hex: string; darkHex: string; name: string } | null {
  const w = word.toLowerCase();
  if (/\b(bleu|bleue|bleus|bleues|bleuet|turquoise|indigo)\b/.test(w)) {
    return { hex: '#3b82f6', darkHex: '#1d4ed8', name: 'bleu' };
  }
  if (/\b(rouge|rouges|coquelicot|fraise|cerise)\b/.test(w)) {
    return { hex: '#ef4444', darkHex: '#b91c1c', name: 'rouge' };
  }
  if (/\b(vert|verte|verts|vertes)\b/.test(w)) {
    return { hex: '#22c55e', darkHex: '#15803d', name: 'vert' };
  }
  if (/\b(jaune|jaunes|doré|dorée|or)\b/.test(w)) {
    return { hex: '#eab308', darkHex: '#a16207', name: 'jaune' };
  }
  if (/\b(rose|roses)\b/.test(w)) {
    return { hex: '#ec4899', darkHex: '#be185d', name: 'rose' };
  }
  if (/\b(violet|violette|violets|violettes|lilas|lavande)\b/.test(w)) {
    return { hex: '#8b5cf6', darkHex: '#5b21b6', name: 'violet' };
  }
  if (/\b(orange|oranges)\b/.test(w)) {
    return { hex: '#f97316', darkHex: '#c2410c', name: 'orange' };
  }
  if (/\b(marron|brun|brune|chocolat)\b/.test(w)) {
    return { hex: '#92400e', darkHex: '#78350f', name: 'marron' };
  }
  if (/\b(noir|noire|noirs|noires)\b/.test(w)) {
    return { hex: '#334155', darkHex: '#0f172a', name: 'noir' };
  }
  if (/\b(blanc|blanche|blancs|blanches)\b/.test(w)) {
    return { hex: '#f8fafc', darkHex: '#cbd5e1', name: 'blanc' };
  }
  return null;
}

/**
 * Dessins vectoriels SVG sur-mesure pour les mots qui n'ont pas d'emoji Unicode exact
 * (ex: guidon, diligence, calèche, volant, pédale, sous-marin, montgolfière, phare, moulin,
 *  table, armoire, escalier, arrosoir, brouette, toboggan, balançoire, pelleteuse, etc.)
 */
export function renderCustomWordSvg(word: string): React.ReactNode | null {
  const w = word.toLowerCase();
  const colorInfo = extractColorFromWord(w);
  const mainColor = colorInfo?.hex || '#3b82f6';
  const darkColor = colorInfo?.darkHex || '#1d4ed8';

  // 1. GUIDON (Vrai guidon de vélo avec poignées, potence et freins)
  if (w.includes('guidon')) {
    return (
      <svg viewBox="0 0 120 100" className="w-full h-full p-2 drop-shadow-md">
        {/* Potence centrale verticale */}
        <rect x="55" y="48" width="10" height="42" rx="4" fill="#64748b" stroke="#334155" strokeWidth="2.5" />
        <circle cx="60" cy="46" r="7" fill="#475569" stroke="#1e293b" strokeWidth="2.5" />
        {/* Tube du guidon */}
        <path
          d="M 16 34 C 30 34, 34 46, 60 46 C 86 46, 90 34, 104 34"
          fill="none"
          stroke={colorInfo ? mainColor : '#94a3b8'}
          strokeWidth="8"
          strokeLinecap="round"
        />
        {/* Leviers de frein */}
        <path d="M 28 38 L 36 52" stroke="#475569" strokeWidth="3" strokeLinecap="round" />
        <path d="M 92 38 L 84 52" stroke="#475569" strokeWidth="3" strokeLinecap="round" />
        {/* Poignées gauche et droite (colorées selon le mot !) */}
        <rect x="6" y="28" width="22" height="12" rx="6" fill={mainColor} stroke={darkColor} strokeWidth="2.5" />
        <rect x="92" y="28" width="22" height="12" rx="6" fill={mainColor} stroke={darkColor} strokeWidth="2.5" />
        {/* Sonnette sur le guidon */}
        <circle cx="42" cy="34" r="5" fill="#fbbf24" stroke="#b45309" strokeWidth="1.8" />
      </svg>
    );
  }

  // 2. VOLANT (Volant de voiture avec klaxon au centre)
  if (w.includes('volant') && !w.includes('cerf-volant') && !w.includes('soucoupe')) {
    return (
      <svg viewBox="0 0 120 100" className="w-full h-full p-2 drop-shadow-md">
        <circle cx="60" cy="50" r="34" fill="none" stroke={colorInfo ? mainColor : '#334155'} strokeWidth="10" />
        <path d="M 28 50 L 92 50 M 60 50 L 60 82" stroke="#64748b" strokeWidth="8" strokeLinecap="round" />
        <circle cx="60" cy="50" r="12" fill={mainColor} stroke="#1e293b" strokeWidth="3" />
        <circle cx="60" cy="50" r="5" fill="#fde047" />
      </svg>
    );
  }

  // 3. PÉDALE (Pédale de vélo avec manivelle et réflecteur orange)
  if (w.includes('pédale')) {
    return (
      <svg viewBox="0 0 120 100" className="w-full h-full p-2 drop-shadow-md">
        <circle cx="32" cy="72" r="14" fill="#94a3b8" stroke="#334155" strokeWidth="3" />
        <path d="M 32 72 L 68 36" stroke="#64748b" strokeWidth="8" strokeLinecap="round" />
        <rect x="52" y="26" width="46" height="20" rx="5" fill={colorInfo ? mainColor : '#1e293b'} stroke="#0f172a" strokeWidth="2.5" />
        <rect x="60" y="32" width="30" height="8" rx="3" fill="#f97316" />
      </svg>
    );
  }

  // 4. DILIGENCE / CALÈCHE (Vraie voiture à cheval ancienne avec cabine, fenêtres et grandes roues à rayons)
  if (w.includes('diligence') || w.includes('calèche') || w.includes('char')) {
    const coachColor = colorInfo ? mainColor : '#b45309';
    return (
      <svg viewBox="0 0 120 100" className="w-full h-full p-1.5 drop-shadow-md">
        {/* Cabine de la diligence */}
        <path
          d="M 22 28 Q 55 22 88 28 L 92 62 Q 55 68 18 62 Z"
          fill={coachColor}
          stroke="#78350f"
          strokeWidth="3"
        />
        {/* Toit doré / bagages */}
        <path d="M 18 28 Q 55 20 92 28" fill="none" stroke="#fbbf24" strokeWidth="4" strokeLinecap="round" />
        {/* Fenêtres avec rideaux */}
        <rect x="30" y="34" width="18" height="15" rx="3" fill="#bae6fd" stroke="#78350f" strokeWidth="2" />
        <rect x="56" y="34" width="18" height="15" rx="3" fill="#bae6fd" stroke="#78350f" strokeWidth="2" />
        {/* Siège du cocher à l'avant */}
        <path d="M 88 38 L 102 38 L 102 52 L 90 52" fill="#78350f" />
        {/* Grandes roues à rayons en bois */}
        <g stroke="#78350f" strokeWidth="2.5">
          <circle cx="32" cy="70" r="15" fill="none" stroke="#d97706" strokeWidth="4" />
          <line x1="32" y1="55" x2="32" y2="85" />
          <line x1="17" y1="70" x2="47" y2="70" />
          <line x1="21" y1="59" x2="43" y2="81" />
          <line x1="43" y1="59" x2="21" y2="81" />
          <circle cx="32" cy="70" r="4" fill="#fbbf24" />

          <circle cx="80" cy="72" r="13" fill="none" stroke="#d97706" strokeWidth="4" />
          <line x1="80" y1="59" x2="80" y2="85" />
          <line x1="67" y1="72" x2="93" y2="72" />
          <line x1="71" y1="63" x2="89" y2="81" />
          <line x1="89" y1="63" x2="71" y2="81" />
          <circle cx="80" cy="72" r="3.5" fill="#fbbf24" />
        </g>
      </svg>
    );
  }

  // 5. SOUS-MARIN (Sous-marin jaune avec périscope et hublots)
  if (w.includes('sous-marin') || w.includes('bathysphère')) {
    const subColor = colorInfo ? mainColor : '#facc15';
    return (
      <svg viewBox="0 0 120 100" className="w-full h-full p-2 drop-shadow-md">
        {/* Périscope */}
        <path d="M 55 34 L 55 16 L 66 16" fill="none" stroke="#ca8a04" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
        {/* Kiosque */}
        <rect x="44" y="30" width="26" height="16" rx="6" fill={subColor} stroke="#a16207" strokeWidth="2.5" />
        {/* Coque */}
        <ellipse cx="60" cy="56" rx="44" ry="20" fill={subColor} stroke="#a16207" strokeWidth="3" />
        {/* Hélice arrière */}
        <polygon points="10,46 16,56 10,66" fill="#ef4444" stroke="#991b1b" strokeWidth="2" />
        {/* Hublots */}
        <circle cx="40" cy="56" r="6" fill="#bae6fd" stroke="#a16207" strokeWidth="2.5" />
        <circle cx="60" cy="56" r="6" fill="#bae6fd" stroke="#a16207" strokeWidth="2.5" />
        <circle cx="80" cy="56" r="6" fill="#bae6fd" stroke="#a16207" strokeWidth="2.5" />
      </svg>
    );
  }

  // 6. MONTGOLFIÈRE / DIRIGEABLE
  if (w.includes('montgolfière') || w.includes('dirigeable')) {
    return (
      <svg viewBox="0 0 120 100" className="w-full h-full p-1.5 drop-shadow-md">
        {/* Ballon multicolore */}
        <circle cx="60" cy="38" r="26" fill={colorInfo ? mainColor : '#ef4444'} stroke="#991b1b" strokeWidth="2.5" />
        <path d="M 60 12 Q 44 38 60 64 Q 76 38 60 12 Z" fill="#facc15" />
        <path d="M 46 60 L 52 74 M 74 60 L 68 74" stroke="#78350f" strokeWidth="2" />
        {/* Nacelle en osier */}
        <rect x="50" y="74" width="20" height="14" rx="3" fill="#d97706" stroke="#78350f" strokeWidth="2" />
      </svg>
    );
  }

  // 7. PHARE (Phare marin rayé rouge et blanc avec faisceau lumineux)
  if (w === 'phare' || w.startsWith('phare ') || w.endsWith(' phare')) {
    return (
      <svg viewBox="0 0 120 100" className="w-full h-full p-1.5 drop-shadow-md">
        {/* Faisceaux lumineux */}
        <polygon points="60,22 10,8 10,34" fill="#fef08a" opacity="0.65" />
        <polygon points="60,22 110,8 110,34" fill="#fef08a" opacity="0.65" />
        {/* Tour du phare */}
        <polygon points="46,86 52,28 68,28 74,86" fill="#ffffff" stroke="#334155" strokeWidth="2.5" />
        <polygon points="48,70 50,52 70,52 72,70" fill="#ef4444" />
        <polygon points="51,42 52,28 68,28 69,42" fill="#ef4444" />
        {/* Lanterne et toit */}
        <rect x="52" y="18" width="16" height="10" fill="#fef08a" stroke="#334155" strokeWidth="2" />
        <polygon points="49,18 60,8 71,18" fill="#ef4444" stroke="#991b1b" strokeWidth="2" />
      </svg>
    );
  }

  // 8. MOULIN (Moulin à vent avec ses 4 grandes ailes)
  if (w.includes('moulin')) {
    return (
      <svg viewBox="0 0 120 100" className="w-full h-full p-1.5 drop-shadow-md">
        {/* Corps du moulin */}
        <polygon points="44,86 50,38 70,38 76,86" fill="#fef3c7" stroke="#92400e" strokeWidth="2.5" />
        <polygon points="46,38 60,22 74,38" fill="#b45309" stroke="#78350f" strokeWidth="2" />
        <rect x="55" y="68" width="10" height="18" rx="4" fill="#92400e" />
        {/* 4 Ailes croisées */}
        <g stroke="#78350f" strokeWidth="3">
          <line x1="24" y1="14" x2="96" y2="66" />
          <line x1="96" y1="14" x2="24" y2="66" />
        </g>
        <circle cx="60" cy="40" r="4" fill="#fbbf24" stroke="#78350f" strokeWidth="2" />
      </svg>
    );
  }

  // 9. PELLETEUSE / BULLDOZER / GRUE / BÉTONNIÈRE / CHASSE-NEIGE
  if (w.includes('pelleteuse') || w.includes('bulldozer') || w.includes('chasse-neige')) {
    return (
      <svg viewBox="0 0 120 100" className="w-full h-full p-1.5 drop-shadow-md">
        {/* Bras articulé et godet */}
        <path d="M 65 48 L 88 24 L 106 42" fill="none" stroke="#eab308" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M 100 42 L 114 42 L 108 58 L 96 52 Z" fill="#475569" stroke="#1e293b" strokeWidth="2" />
        {/* Cabine */}
        <rect x="26" y="34" width="42" height="32" rx="6" fill={colorInfo ? mainColor : '#eab308'} stroke="#a16207" strokeWidth="2.5" />
        <rect x="34" y="40" width="20" height="14" rx="3" fill="#bae6fd" stroke="#a16207" strokeWidth="2" />
        {/* Chenilles */}
        <rect x="18" y="66" width="58" height="16" rx="8" fill="#334155" stroke="#0f172a" strokeWidth="2.5" />
        <circle cx="28" cy="74" r="5" fill="#94a3b8" />
        <circle cx="47" cy="74" r="5" fill="#94a3b8" />
        <circle cx="66" cy="74" r="5" fill="#94a3b8" />
      </svg>
    );
  }

  // 10. TABLE / BUREAU (Vraie table avec 4 pieds)
  if (w === 'table' || w.startsWith('table ') || w.endsWith(' table') || w.includes('pupitre') || w.includes('établi')) {
    const tColor = colorInfo ? mainColor : '#d97706';
    return (
      <svg viewBox="0 0 120 100" className="w-full h-full p-2 drop-shadow-md">
        {/* Pieds */}
        <rect x="24" y="42" width="8" height="42" rx="2" fill="#92400e" />
        <rect x="88" y="42" width="8" height="42" rx="2" fill="#92400e" />
        <rect x="34" y="46" width="6" height="32" rx="2" fill="#78350f" opacity="0.7" />
        <rect x="80" y="46" width="6" height="32" rx="2" fill="#78350f" opacity="0.7" />
        {/* Plateau de la table */}
        <polygon points="14,42 28,26 92,26 106,42" fill={tColor} stroke="#78350f" strokeWidth="3" />
        <rect x="14" y="42" width="92" height="7" rx="2" fill="#b45309" stroke="#78350f" strokeWidth="2" />
      </svg>
    );
  }

  // 11. ARROSOIR (Vrai arrosoir de jardin avec bec verseur et pomme)
  if (w.includes('arrosoir')) {
    const aColor = colorInfo ? mainColor : '#22c55e';
    return (
      <svg viewBox="0 0 120 100" className="w-full h-full p-2 drop-shadow-md">
        {/* Anse */}
        <path d="M 42 42 C 20 30, 24 72, 42 68" fill="none" stroke={aColor} strokeWidth="6" strokeLinecap="round" />
        {/* Bec verseur */}
        <path d="M 74 62 L 100 34" stroke={aColor} strokeWidth="7" strokeLinecap="round" />
        <ellipse cx="103" cy="31" rx="5" ry="8" transform="rotate(-40 103 31)" fill="#facc15" stroke="#a16207" strokeWidth="2" />
        {/* Réservoir */}
        <rect x="38" y="38" width="38" height="40" rx="6" fill={aColor} stroke="#15803d" strokeWidth="2.5" />
      </svg>
    );
  }

  // 12. BALANÇOIRE
  if (w.includes('balançoire')) {
    return (
      <svg viewBox="0 0 120 100" className="w-full h-full p-2 drop-shadow-md">
        {/* Portique */}
        <path d="M 20 86 L 34 18 L 86 18 L 100 86" fill="none" stroke="#d97706" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
        {/* Cordes */}
        <line x1="48" y1="18" x2="48" y2="66" stroke="#78350f" strokeWidth="2.5" />
        <line x1="72" y1="18" x2="72" y2="66" stroke="#78350f" strokeWidth="2.5" />
        {/* Siège */}
        <rect x="42" y="64" width="36" height="7" rx="3" fill={colorInfo ? mainColor : '#ef4444'} stroke="#991b1b" strokeWidth="2" />
      </svg>
    );
  }

  return null;
}
