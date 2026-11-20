/**
 * Socle Unifié ALPHABETTE v0.4.0
 * Web Component <alphabette-shell>
 * Double barre supérieure avec écosystème, thème jour/nuit, grossissement texte (BIG) et config API.
 */

export interface AlphabetteApiConfig {
  provider: 'gemini' | 'openai' | 'claude' | 'custom';
  apiKey: string;
}

declare global {
  interface Window {
    AlphabetteShell: {
      getApiConfig: () => AlphabetteApiConfig;
      setApiConfig: (config: AlphabetteApiConfig) => void;
      getTheme: () => 'light' | 'dark';
      toggleTheme: () => void;
      getScale: () => number;
      toggleScale: () => void;
    };
  }
}

const STORAGE_KEY_API = 'alphabette_api_config';
const STORAGE_KEY_THEME = 'alphabette_theme';
const STORAGE_KEY_SCALE = 'alphabette_scale';

// Apps in ecosystem
const ECOSYSTEM_APPS = [
  { id: 'lecturemagique', name: 'Lecture Magique', icon: '🦉', desc: 'Apprentissage lecture CP/CE1' },
  { id: 'proxilien', name: 'ProxiLien', icon: '🤝', desc: 'Réseau solidaire local' },
  { id: 'iadebat', name: 'IADébat', icon: '⚖️', desc: 'Débats & argumentation' },
  { id: 'infoperso', name: 'InfoPerso', icon: '🛡️', desc: 'Coffre-fort vie privée' },
  { id: 'oeilatelier', name: 'Œil Atelier', icon: '👁️', desc: 'Vision par ordinateur' },
  { id: 'lidarsol', name: 'LidarSol', icon: '🛰️', desc: 'Cartographie & LiDAR' },
];

export class AlphabetteShell extends HTMLElement {
  private modalOpen = false;
  private appsDrawerOpen = false;

  connectedCallback() {
    this.initGlobalStyles();
    this.applyThemeAndScale();
    this.render();
    this.setupListeners();
  }

  private getAppId() { return this.getAttribute('app-id') || 'lecturemagique'; }
  private getAppName() { return this.getAttribute('app-name') || 'Lecture Magique'; }
  private getAppSubtitle() { return this.getAttribute('app-subtitle') || 'L\'aventure de la lecture pour enfants'; }
  private getAppIcon() { return this.getAttribute('app-icon') || '🦉'; }
  private getAccent() { return this.getAttribute('accent') || '#8b5cf6'; }

  private initGlobalStyles() {
    // Set accent
    document.documentElement.style.setProperty('--alpha-accent', this.getAccent());
  }

  private applyThemeAndScale() {
    const savedTheme = localStorage.getItem(STORAGE_KEY_THEME) || 'dark';
    const savedScale = parseFloat(localStorage.getItem(STORAGE_KEY_SCALE) || '1');

    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.style.setProperty('--alpha-bg', '#0d0820');
      document.documentElement.style.setProperty('--alpha-card', '#1a1338');
      document.documentElement.style.setProperty('--alpha-card-subtle', '#251b4d');
      document.documentElement.style.setProperty('--alpha-text', '#f8f4ff');
      document.documentElement.style.setProperty('--alpha-muted', '#9e91c7');
      document.documentElement.style.setProperty('--alpha-border', 'rgba(167, 139, 250, 0.2)');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.style.setProperty('--alpha-bg', '#f6f7fb');
      document.documentElement.style.setProperty('--alpha-card', '#ffffff');
      document.documentElement.style.setProperty('--alpha-card-subtle', '#edf0f8');
      document.documentElement.style.setProperty('--alpha-text', '#1e1b4b');
      document.documentElement.style.setProperty('--alpha-muted', '#64748b');
      document.documentElement.style.setProperty('--alpha-border', '#e2e8f0');
    }

    document.documentElement.style.setProperty('--alpha-scale', String(savedScale));
  }

  private render() {
    const isDark = document.documentElement.classList.contains('dark');
    const scale = parseFloat(localStorage.getItem(STORAGE_KEY_SCALE) || '1');
    const isBig = scale > 1;
    const accent = this.getAccent();
    const appName = this.getAppName();
    const appSubtitle = this.getAppSubtitle();
    const appIcon = this.getAppIcon();
    const apiConfig = window.AlphabetteShell.getApiConfig();
    const hasKey = Boolean(apiConfig.apiKey);

    this.innerHTML = `
      <div class="alphabette-shell-container w-full select-none font-sans z-50 relative border-b border-white/10 dark:border-purple-900/30">
        <!-- BARRE 1 : ECOSYSTEME ALPHABETTE -->
        <div class="alpha-bar-1 flex items-center justify-between px-3 md:px-6 py-1.5 text-xs bg-slate-950/80 text-slate-300 backdrop-blur-md border-b border-white/5">
          <div class="flex items-center gap-3">
            <button id="alpha-apps-btn" class="flex items-center gap-1.5 font-bold tracking-wider text-white hover:text-purple-300 transition-colors py-1 px-2 rounded hover:bg-white/5 cursor-pointer">
              <span class="text-sm">🌌</span>
              <span class="tracking-widest font-black uppercase text-[11px] bg-gradient-to-r from-purple-400 to-indigo-300 bg-clip-text text-transparent">ALPHABETTE</span>
              <span class="text-[9px] px-1.5 py-0.2 rounded bg-purple-900/60 text-purple-200 border border-purple-500/30">v0.4.0</span>
              <span class="text-[10px] text-slate-400 ml-0.5">▾</span>
            </button>
            <span class="hidden sm:inline-block text-slate-500">|</span>
            <span class="hidden sm:inline-block text-[11px] text-slate-400">Écosystème Numérique Libre & Pédagogique</span>
          </div>

          <div class="flex items-center gap-2">
            <!-- Bouton Zoom BIG -->
            <button id="alpha-scale-btn" title="Agrandir le texte pour les enfants / accessibilité" class="flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-semibold transition-all cursor-pointer ${isBig ? 'bg-amber-500 text-slate-950 font-black ring-2 ring-amber-300' : 'bg-slate-800 text-slate-200 hover:bg-slate-700'}">
              <span>🔍</span>
              <span>BIG</span>
              <span class="text-[10px] opacity-75">${isBig ? 'ON' : 'OFF'}</span>
            </button>

            <!-- Bouton Thème Jour/Nuit -->
            <button id="alpha-theme-btn" title="Changer de mode jour/nuit" class="flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer">
              <span>${isDark ? '🌙' : '☀️'}</span>
              <span class="hidden sm:inline">${isDark ? 'Nuit' : 'Jour'}</span>
            </button>

            <!-- Bouton Clé API -->
            <button id="alpha-api-btn" title="Configurer la clé API IA" class="flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-medium ${hasKey ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-500/40' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'} transition-colors cursor-pointer">
              <span>⚙️</span>
              <span class="hidden sm:inline">IA Studio</span>
              <span class="w-2 h-2 rounded-full ${hasKey ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}"></span>
            </button>
          </div>
        </div>

        <!-- BARRE 2 : APPLICATION ACTIVE (Lecture Magique) -->
        <div class="alpha-bar-2 flex items-center justify-between px-3 md:px-6 py-2 bg-gradient-to-r from-purple-950/70 via-indigo-950/60 to-purple-950/70 backdrop-blur-md">
          <div class="flex items-center gap-2.5 min-w-0">
            <div class="w-9 h-9 rounded-xl flex items-center justify-center text-xl shadow-md border border-purple-400/30 shrink-0" style="background: ${accent}">
              ${appIcon}
            </div>
            <div class="min-w-0">
              <div class="flex items-center gap-2">
                <h1 class="text-base sm:text-lg font-black tracking-tight text-white truncate" style="font-family: 'Baloo 2', cursive, sans-serif;">
                  ${appName}
                </h1>
                <span class="hidden md:inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-200 border border-purple-400/30">
                  Lecteurs 5-8 ans • CP / CE1
                </span>
              </div>
              <p class="text-[11px] text-purple-200/70 truncate hidden sm:block">
                ${appSubtitle}
              </p>
            </div>
          </div>

          <div class="flex items-center gap-2 shrink-0 text-xs">
            <!-- Badge mascotte / guide -->
            <div class="flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-900/40 border border-purple-400/20 text-purple-100">
              <span class="text-sm animate-bounce">🦉</span>
              <span class="font-bold text-xs">Lumo t'accompagne !</span>
            </div>
          </div>
        </div>

        <!-- TIROIR APPLICATIONS DE L'ÉCOSYSTÈME -->
        <div id="alpha-apps-drawer" class="${this.appsDrawerOpen ? 'block' : 'hidden'} absolute top-full left-2 sm:left-6 mt-1 w-80 max-w-[90vw] p-3 rounded-2xl bg-slate-900 text-white shadow-2xl border border-purple-500/30 z-50 backdrop-blur-xl animate-in fade-in slide-in-from-top-2">
          <div class="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
            <span class="text-xs font-bold uppercase tracking-wider text-purple-300">Applications ALPHABETTE</span>
            <button id="alpha-close-apps" class="text-slate-400 hover:text-white text-sm cursor-pointer">✕</button>
          </div>
          <div class="grid grid-cols-1 gap-1.5 max-h-72 overflow-y-auto">
            ${ECOSYSTEM_APPS.map(app => `
              <div class="flex items-center gap-3 p-2 rounded-xl transition-colors ${app.id === this.getAppId() ? 'bg-purple-600/30 border border-purple-400/50 text-white font-bold' : 'hover:bg-slate-800/80 text-slate-300'}">
                <span class="text-2xl">${app.icon}</span>
                <div class="min-w-0 flex-1">
                  <div class="text-xs font-bold leading-tight">${app.name}</div>
                  <div class="text-[10px] text-slate-400 truncate">${app.desc}</div>
                </div>
                ${app.id === this.getAppId() ? '<span class="text-[10px] text-purple-300 bg-purple-950/80 px-1.5 py-0.5 rounded">Actif</span>' : ''}
              </div>
            `).join('')}
          </div>
        </div>

        <!-- MODALE CONFIGURATION CLÉ API -->
        <div id="alpha-api-modal" class="${this.modalOpen ? 'flex' : 'hidden'} fixed inset-0 z-[999] items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div class="w-full max-w-md rounded-2xl bg-slate-900 border border-purple-500/40 p-5 text-white shadow-2xl">
            <div class="flex items-center justify-between pb-3 border-b border-slate-800">
              <div class="flex items-center gap-2">
                <span class="text-xl">⚙️</span>
                <h3 class="font-bold text-sm text-purple-200">Configuration IA Studio & Clé API</h3>
              </div>
              <button id="alpha-close-modal" class="text-slate-400 hover:text-white text-lg cursor-pointer">✕</button>
            </div>
            
            <div class="py-4 space-y-3 text-xs">
              <p class="text-slate-300 leading-relaxed">
                Configurez une clé API pour activer la génération magique de mini-histoires personnalisées avec Gemini pour votre enfant.
              </p>

              <div>
                <label class="block font-medium text-slate-300 mb-1">Fournisseur d'IA :</label>
                <select id="alpha-provider-select" class="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:border-purple-400">
                  <option value="gemini" ${apiConfig.provider === 'gemini' ? 'selected' : ''}>Google Gemini (Recommandé - AI Studio)</option>
                  <option value="openai" ${apiConfig.provider === 'openai' ? 'selected' : ''}>OpenAI</option>
                  <option value="claude" ${apiConfig.provider === 'claude' ? 'selected' : ''}>Anthropic Claude</option>
                  <option value="custom" ${apiConfig.provider === 'custom' ? 'selected' : ''}>Fournisseur Local / Personnalisé</option>
                </select>
              </div>

              <div>
                <label class="block font-medium text-slate-300 mb-1">Clé API (Optionnelle si configurée côté serveur) :</label>
                <input id="alpha-apikey-input" type="password" placeholder="AIzaSy... ou sk-..." value="${apiConfig.apiKey || ''}" class="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono text-xs outline-none focus:border-purple-400" />
                <p class="text-[10px] text-slate-400 mt-1">
                  La clé reste stockée localement dans votre navigateur en toute sécurité.
                </p>
              </div>
            </div>

            <div class="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button id="alpha-cancel-modal" class="px-3 py-1.5 rounded-lg text-slate-400 hover:text-white text-xs cursor-pointer">
                Fermer
              </button>
              <button id="alpha-save-modal" class="px-4 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 font-bold text-white text-xs shadow-md transition-colors cursor-pointer">
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  private setupListeners() {
    // Theme toggle
    this.querySelector('#alpha-theme-btn')?.addEventListener('click', () => {
      window.AlphabetteShell.toggleTheme();
      this.applyThemeAndScale();
      this.render();
      this.setupListeners();
      window.dispatchEvent(new CustomEvent('alphabette-theme-change'));
    });

    // Scale toggle
    this.querySelector('#alpha-scale-btn')?.addEventListener('click', () => {
      window.AlphabetteShell.toggleScale();
      this.applyThemeAndScale();
      this.render();
      this.setupListeners();
      window.dispatchEvent(new CustomEvent('alphabette-scale-change'));
    });

    // Apps drawer toggle
    this.querySelector('#alpha-apps-btn')?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.appsDrawerOpen = !this.appsDrawerOpen;
      this.render();
      this.setupListeners();
    });

    this.querySelector('#alpha-close-apps')?.addEventListener('click', () => {
      this.appsDrawerOpen = false;
      this.render();
      this.setupListeners();
    });

    // API Modal toggle
    this.querySelector('#alpha-api-btn')?.addEventListener('click', () => {
      this.modalOpen = true;
      this.render();
      this.setupListeners();
    });

    this.querySelector('#alpha-close-modal')?.addEventListener('click', () => {
      this.modalOpen = false;
      this.render();
      this.setupListeners();
    });

    this.querySelector('#alpha-cancel-modal')?.addEventListener('click', () => {
      this.modalOpen = false;
      this.render();
      this.setupListeners();
    });

    this.querySelector('#alpha-save-modal')?.addEventListener('click', () => {
      const provider = (this.querySelector('#alpha-provider-select') as HTMLSelectElement)?.value as AlphabetteApiConfig['provider'];
      const apiKey = (this.querySelector('#alpha-apikey-input') as HTMLInputElement)?.value?.trim() || '';
      window.AlphabetteShell.setApiConfig({ provider, apiKey });
      this.modalOpen = false;
      this.render();
      this.setupListeners();
      window.dispatchEvent(new CustomEvent('alphabette-api-change'));
    });
  }
}

// Global API helper
window.AlphabetteShell = {
  getApiConfig: (): AlphabetteApiConfig => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_API);
      if (raw) return JSON.parse(raw);
    } catch {
      // ignore
    }
    return { provider: 'gemini', apiKey: '' };
  },
  setApiConfig: (config: AlphabetteApiConfig) => {
    try {
      localStorage.setItem(STORAGE_KEY_API, JSON.stringify(config));
    } catch {
      // ignore
    }
  },
  getTheme: () => {
    return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
  },
  toggleTheme: () => {
    const isDark = document.documentElement.classList.contains('dark');
    const newTheme = isDark ? 'light' : 'dark';
    localStorage.setItem(STORAGE_KEY_THEME, newTheme);
  },
  getScale: () => {
    return parseFloat(localStorage.getItem(STORAGE_KEY_SCALE) || '1');
  },
  toggleScale: () => {
    const cur = parseFloat(localStorage.getItem(STORAGE_KEY_SCALE) || '1');
    const next = cur > 1 ? 1 : 1.25;
    localStorage.setItem(STORAGE_KEY_SCALE, String(next));
  }
};

if (!customElements.get('alphabette-shell')) {
  customElements.define('alphabette-shell', AlphabetteShell);
}
