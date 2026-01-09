// Theme Management System for Currency Converter Pro

class ThemeManager {
  constructor() {
    this.currentTheme = 'chrome-dark';
    this.init();
  }

  async init() {
    await this.loadTheme();
    this.applyTheme(this.currentTheme);
  }

  async loadTheme() {
    try {
      const result = await chrome.storage.sync.get(['selectedTheme']);
      this.currentTheme = result.selectedTheme || 'chrome-dark';
    } catch (error) {
      console.error('Failed to load theme:', error);
      this.currentTheme = 'chrome-dark';
    }
  }

  async saveTheme(theme) {
    try {
      await chrome.storage.sync.set({ selectedTheme: theme });
      this.currentTheme = theme;
    } catch (error) {
      console.error('Failed to save theme:', error);
    }
  }

  applyTheme(theme) {
    console.log('Applying theme:', theme);

    // Remove existing theme classes
    document.documentElement.removeAttribute('data-theme');
    document.body.className = document.body.className.replace(/theme-\w+/g, '');

    // Apply new theme - ALWAYS set data-theme, even for default
    document.documentElement.setAttribute('data-theme', theme);
    document.body.classList.add(`theme-${theme}`);

    this.currentTheme = theme;

    // Force style recalculation
    document.body.offsetHeight;

    // Notify other parts of the extension
    this.broadcastThemeChange(theme);
  }

  async setTheme(theme) {
    this.applyTheme(theme);
    await this.saveTheme(theme);
  }

  broadcastThemeChange(theme) {
    // Notify other tabs/windows of theme change (with memory leak prevention)
    if (typeof chrome !== 'undefined' && chrome.runtime) {
      // Use timeout to prevent blocking
      setTimeout(() => {
        chrome.runtime.sendMessage({
          type: 'themeChanged',
          theme: theme
        }).catch((error) => {
          // Ignore errors for inactive tabs/contexts
          if (!error.message?.includes('Extension context invalidated')) {
            console.debug('Theme broadcast error (non-critical):', error.message);
          }
        });
      }, 0);
    }
  }

  getAvailableThemes() {
    return [
      {
        id: 'chrome-dark',
        name: '🎯 Chrome Dark - Native Dark Mode (Default)',
        description: 'Native Chrome dark mode styling'
      },
      {
        id: 'dark',
        name: '🌙 Dark Mode - Discord Style',
        description: 'Discord-inspired dark theme'
      },
      {
        id: 'default',
        name: '🎨 Blue Gradient - Classic',
        description: 'Modern blue-purple gradient theme'
      },
      {
        id: 'professional',
        name: '💼 Professional - Corporate Blue',
        description: 'Clean corporate blue theme'
      },
      {
        id: 'minimal',
        name: '⚪ Minimal - Clean White',
        description: 'Minimalist grayscale theme'
      },
      {
        id: 'vibrant',
        name: '🌈 Vibrant - Colorful',
        description: 'Bright orange-red gradient theme'
      },
      {
        id: 'ocean',
        name: '🌊 Ocean - Teal & Aqua',
        description: 'Refreshing teal and cyan theme'
      },
      {
        id: 'sunset',
        name: '🌅 Sunset - Purple & Pink',
        description: 'Beautiful purple and pink gradient'
      },
      {
        id: 'forest',
        name: '🌲 Forest - Green & Nature',
        description: 'Calming green nature theme'
      },
      {
        id: 'midnight',
        name: '🌃 Midnight - Deep Blue',
        description: 'Deep navy blue theme'
      },
      {
        id: 'cherry',
        name: '🍒 Cherry - Red & Rose',
        description: 'Bold red and rose theme'
      },
      {
        id: 'autumn',
        name: '🍂 Autumn - Amber & Orange',
        description: 'Warm autumn colors'
      },
      {
        id: 'lavender',
        name: '💜 Lavender - Soft Purple',
        description: 'Gentle lavender purple theme'
      },
      {
        id: 'monochrome',
        name: '⚫ Monochrome - B&W',
        description: 'High contrast black and white'
      }
    ];
  }
}

// Initialize theme manager
const themeManager = new ThemeManager();

// Listen for theme changes from settings
if (typeof chrome !== 'undefined' && chrome.runtime) {
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'themeChanged') {
      themeManager.applyTheme(message.theme);
    }
  });
}

// Theme Colors Configuration for Tooltips and Highlighting
const THEME_COLORS = {
  default: {
    gradient: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #ec4899 100%)',
    shadow: '0 8px 25px rgba(79, 70, 229, 0.35), 0 4px 12px rgba(124, 58, 237, 0.2)',
    borderColor: 'rgba(124, 58, 237, 0.3)',
    textColor: '#ffffff',
    textShadow: '0 1px 3px rgba(0, 0, 0, 0.3)',
    borderRadius: '10px',
    padding: '10px 16px',
    fontSize: '14px',
    backdropBlur: 'blur(8px)',
    arrowColor: '#7c3aed'
  },
  professional: {
    gradient: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
    shadow: '0 6px 20px rgba(30, 64, 175, 0.25), 0 2px 8px rgba(59, 130, 246, 0.15)',
    borderColor: 'rgba(59, 130, 246, 0.25)',
    textColor: '#ffffff',
    textShadow: '0 1px 2px rgba(0, 0, 0, 0.25)',
    borderRadius: '8px',
    padding: '9px 14px',
    fontSize: '13px',
    backdropBlur: 'blur(6px)',
    arrowColor: '#3b82f6'
  },
  minimal: {
    gradient: 'linear-gradient(135deg, #374151 0%, #6b7280 100%)',
    shadow: '0 4px 12px rgba(0, 0, 0, 0.15), 0 1px 4px rgba(0, 0, 0, 0.1)',
    borderColor: 'rgba(107, 114, 128, 0.3)',
    textColor: '#ffffff',
    textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)',
    borderRadius: '6px',
    padding: '8px 12px',
    fontSize: '13px',
    backdropBlur: 'none',
    arrowColor: '#6b7280'
  },
  vibrant: {
    gradient: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 50%, #ec4899 100%)',
    shadow: '0 10px 30px rgba(245, 158, 11, 0.4), 0 4px 15px rgba(239, 68, 68, 0.3)',
    borderColor: 'rgba(251, 191, 36, 0.4)',
    textColor: '#ffffff',
    textShadow: '0 2px 4px rgba(0, 0, 0, 0.4)',
    borderRadius: '12px',
    padding: '11px 18px',
    fontSize: '14px',
    backdropBlur: 'blur(10px)',
    arrowColor: '#ef4444'
  },
  dark: {
    gradient: 'linear-gradient(135deg, #36393f 0%, #2f3136 100%)',
    shadow: '0 8px 25px rgba(0, 0, 0, 0.7), 0 4px 12px rgba(0, 0, 0, 0.5)',
    borderColor: 'rgba(64, 68, 75, 0.8)',
    textColor: '#ffffff',
    textShadow: '0 1px 3px rgba(0, 0, 0, 0.7)',
    borderRadius: '8px',
    padding: '10px 15px',
    fontSize: '14px',
    backdropBlur: 'blur(12px)',
    arrowColor: '#5865F2',
    isDark: true
  },
  'chrome-dark': {
    gradient: 'linear-gradient(135deg, #202124 0%, #292a2d 100%)',
    shadow: '0 8px 25px rgba(0, 0, 0, 0.8), 0 4px 12px rgba(0, 0, 0, 0.6)',
    borderColor: 'rgba(60, 64, 67, 0.8)',
    textColor: '#e8eaed',
    textShadow: '0 1px 3px rgba(0, 0, 0, 0.7)',
    borderRadius: '8px',
    padding: '10px 15px',
    fontSize: '14px',
    backdropBlur: 'blur(12px)',
    arrowColor: '#8ab4f8',
    isDark: true
  },
  ocean: {
    gradient: 'linear-gradient(135deg, #0891b2 0%, #06b6d4 100%)',
    shadow: '0 8px 25px rgba(8, 145, 178, 0.35), 0 4px 12px rgba(6, 182, 212, 0.2)',
    borderColor: 'rgba(94, 234, 212, 0.4)',
    textColor: '#ffffff',
    textShadow: '0 1px 3px rgba(0, 0, 0, 0.3)',
    borderRadius: '10px',
    padding: '10px 16px',
    fontSize: '14px',
    backdropBlur: 'blur(8px)',
    arrowColor: '#06b6d4'
  },
  sunset: {
    gradient: 'linear-gradient(135deg, #9333ea 0%, #c026d3 100%)',
    shadow: '0 8px 25px rgba(168, 85, 247, 0.35), 0 4px 12px rgba(192, 38, 211, 0.2)',
    borderColor: 'rgba(216, 180, 254, 0.4)',
    textColor: '#ffffff',
    textShadow: '0 1px 3px rgba(0, 0, 0, 0.3)',
    borderRadius: '10px',
    padding: '10px 16px',
    fontSize: '14px',
    backdropBlur: 'blur(8px)',
    arrowColor: '#c026d3'
  },
  forest: {
    gradient: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
    shadow: '0 8px 25px rgba(5, 150, 105, 0.35), 0 4px 12px rgba(16, 185, 129, 0.2)',
    borderColor: 'rgba(134, 239, 172, 0.4)',
    textColor: '#ffffff',
    textShadow: '0 1px 3px rgba(0, 0, 0, 0.3)',
    borderRadius: '10px',
    padding: '10px 16px',
    fontSize: '14px',
    backdropBlur: 'blur(8px)',
    arrowColor: '#10b981'
  },
  midnight: {
    gradient: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
    shadow: '0 8px 25px rgba(29, 78, 216, 0.35), 0 4px 12px rgba(59, 130, 246, 0.2)',
    borderColor: 'rgba(96, 165, 250, 0.4)',
    textColor: '#ffffff',
    textShadow: '0 1px 3px rgba(0, 0, 0, 0.3)',
    borderRadius: '10px',
    padding: '10px 16px',
    fontSize: '14px',
    backdropBlur: 'blur(8px)',
    arrowColor: '#3b82f6'
  },
  cherry: {
    gradient: 'linear-gradient(135deg, #dc2626 0%, #f43f5e 100%)',
    shadow: '0 8px 25px rgba(225, 29, 72, 0.35), 0 4px 12px rgba(244, 63, 94, 0.2)',
    borderColor: 'rgba(253, 164, 175, 0.4)',
    textColor: '#ffffff',
    textShadow: '0 1px 3px rgba(0, 0, 0, 0.3)',
    borderRadius: '10px',
    padding: '10px 16px',
    fontSize: '14px',
    backdropBlur: 'blur(8px)',
    arrowColor: '#f43f5e'
  },
  autumn: {
    gradient: 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)',
    shadow: '0 8px 25px rgba(217, 119, 6, 0.35), 0 4px 12px rgba(245, 158, 11, 0.2)',
    borderColor: 'rgba(252, 211, 77, 0.4)',
    textColor: '#ffffff',
    textShadow: '0 1px 3px rgba(0, 0, 0, 0.3)',
    borderRadius: '10px',
    padding: '10px 16px',
    fontSize: '14px',
    backdropBlur: 'blur(8px)',
    arrowColor: '#f59e0b'
  },
  lavender: {
    gradient: 'linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%)',
    shadow: '0 8px 25px rgba(139, 92, 246, 0.35), 0 4px 12px rgba(167, 139, 250, 0.2)',
    borderColor: 'rgba(216, 180, 254, 0.4)',
    textColor: '#ffffff',
    textShadow: '0 1px 3px rgba(0, 0, 0, 0.3)',
    borderRadius: '10px',
    padding: '10px 16px',
    fontSize: '14px',
    backdropBlur: 'blur(8px)',
    arrowColor: '#a78bfa'
  },
  monochrome: {
    gradient: 'linear-gradient(135deg, #000000 0%, #374151 100%)',
    shadow: '0 8px 25px rgba(0, 0, 0, 0.5), 0 4px 12px rgba(0, 0, 0, 0.3)',
    borderColor: 'rgba(156, 163, 175, 0.5)',
    textColor: '#ffffff',
    textShadow: '0 1px 3px rgba(0, 0, 0, 0.5)',
    borderRadius: '6px',
    padding: '10px 16px',
    fontSize: '14px',
    backdropBlur: 'none',
    arrowColor: '#6b7280'
  }
};

// Export for use in other scripts
if (typeof window !== 'undefined') {
  window.themeManager = themeManager;
  window.ThemeColors = THEME_COLORS;
}