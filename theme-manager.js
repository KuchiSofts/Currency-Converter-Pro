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

// Export for use in other scripts
if (typeof window !== 'undefined') {
  window.themeManager = themeManager;
}