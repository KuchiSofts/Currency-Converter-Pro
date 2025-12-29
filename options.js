// Options page script for settings management

document.addEventListener('DOMContentLoaded', async () => {
  await loadVersionInfo();
  await loadSettings();
  setupEventListeners();
});

// Load version from manifest.json
async function loadVersionInfo() {
  try {
    const manifest = chrome.runtime.getManifest();
    const version = manifest.version;

    // Update all version displays
    const sidebarVersion = document.getElementById('sidebarVersion');
    const aboutVersion = document.getElementById('aboutVersion');

    if (sidebarVersion) sidebarVersion.textContent = `v${version}`;
    if (aboutVersion) aboutVersion.textContent = version;
  } catch (error) {
    console.error('Failed to load version info:', error);
  }
}

async function loadSettings() {
  try {
    const settings = await chrome.storage.sync.get([
      'uiScale',
      'selectedTheme',
      'defaultTargetCurrency',
      'updateInterval',
      'showTooltip',
      'highlightPrices',
      'autoConvertOnHover',
      'showInlineConversion',
      'replacePrice',
      'apiProvider',
      'apiKey',
      // Popup visibility settings
      'showStatsBar',
      'showFavorites',
      'showActions',
      'showQuickToggles',
      'showFooterLinks',
      // Tooltip settings
      'tooltipDelay',
      'tooltipPosition',
      'showExchangeRate',
      'compactTooltip',
      'tooltipAnimation',
      // Display format
      'decimalPlaces',
      'currencyDisplay',
      'useThousandSeparator',
      // Advanced settings
      'detectionSensitivity',
      'minPrice',
      'showNotifications',
      'enableSounds',
      'debugMode',
      // Accessibility
      'highContrast',
      'largeText',
      'reducedMotion',
      'screenReaderMode',
      // Page features
      'showOriginalPrice',
      'convertOnPageLoad',
      'quickCopyOnClick',
      'autoDetectPageCurrency',
      'showRateTrends',
      'persistConversions',
      // History & Favorites
      'saveConversionHistory',
      'historyLimit',
      'syncFavorites',
      'autoAddFrequentCurrencies',
      // Performance
      'cacheRates',
      'preloadCurrencies',
      'lazyLoadConversions',
      'batchProcessPrices',
      'offlineMode',
      // Smart features
      'smartRounding',
      'contextAwareConversion',
      'multiCurrencyDetection',
      'rateAlerts',
      'showConfidenceScore',
      // Display preferences
      'symbolPosition',
      'roundingMethod',
      'useNativeNumbers',
      'showCurrencyFlags'
    ]);

    // Load UI scale
    const uiScale = settings.uiScale || 100;
    document.getElementById('uiScale').value = uiScale;
    document.getElementById('uiScaleValue').textContent = uiScale;
    applyUIScale(uiScale);

    // Load default values - Chrome Dark is default
    const theme = settings.selectedTheme || 'chrome-dark';
    document.getElementById('themeSelect').value = theme;

    // Apply theme immediately
    if (window.themeManager) {
      window.themeManager.applyTheme(theme);
    }

    document.getElementById('defaultTargetCurrency').value = settings.defaultTargetCurrency || 'ILS';
    document.getElementById('updateInterval').value = settings.updateInterval || '1440';
    document.getElementById('showTooltip').checked = settings.showTooltip || false;
    document.getElementById('highlightPrices').checked = settings.highlightPrices || false;
    document.getElementById('autoConvertOnHover').checked = settings.autoConvertOnHover || false;
    document.getElementById('showInlineConversion').checked = settings.showInlineConversion !== false;
    document.getElementById('replacePrice').checked = settings.replacePrice || false;
    document.getElementById('apiProvider').value = settings.apiProvider || 'exchangerate-api';
    document.getElementById('apiKey').value = settings.apiKey || '';

    // Popup visibility settings (all hidden by default)
    document.getElementById('showStatsBar').checked = settings.showStatsBar || false;
    document.getElementById('showFavorites').checked = settings.showFavorites || false;
    document.getElementById('showActions').checked = settings.showActions || false;
    document.getElementById('showQuickToggles').checked = settings.showQuickToggles || false;
    document.getElementById('showFooterLinks').checked = settings.showFooterLinks || false;

    // Tooltip settings
    const tooltipDelay = settings.tooltipDelay || 300;
    document.getElementById('tooltipDelay').value = tooltipDelay;
    document.getElementById('tooltipDelayValue').textContent = `${tooltipDelay}ms`;
    document.getElementById('tooltipPosition').value = settings.tooltipPosition || 'auto';
    document.getElementById('showExchangeRate').checked = settings.showExchangeRate || false;
    document.getElementById('compactTooltip').checked = settings.compactTooltip || false;
    document.getElementById('tooltipAnimation').checked = settings.tooltipAnimation !== false;

    // Display format
    document.getElementById('decimalPlaces').value = settings.decimalPlaces || 'auto';
    document.getElementById('currencyDisplay').value = settings.currencyDisplay || 'symbol';
    document.getElementById('useThousandSeparator').checked = settings.useThousandSeparator !== false;

    // Advanced settings
    document.getElementById('detectionSensitivity').value = settings.detectionSensitivity || 'medium';
    document.getElementById('minPrice').value = settings.minPrice || '';
    document.getElementById('showNotifications').checked = settings.showNotifications !== false;
    const enableSounds = document.getElementById('enableSounds');
    if (enableSounds) enableSounds.checked = settings.enableSounds || false;
    document.getElementById('debugMode').checked = settings.debugMode || false;

    // Accessibility
    document.getElementById('highContrast').checked = settings.highContrast || false;
    document.getElementById('largeText').checked = settings.largeText || false;
    document.getElementById('reducedMotion').checked = settings.reducedMotion || false;
    document.getElementById('screenReaderMode').checked = settings.screenReaderMode || false;

    // Page features
    document.getElementById('showOriginalPrice').checked = settings.showOriginalPrice || false;
    document.getElementById('convertOnPageLoad').checked = settings.convertOnPageLoad !== undefined ? settings.convertOnPageLoad : true;
    document.getElementById('quickCopyOnClick').checked = settings.quickCopyOnClick || false;
    const autoDetect = document.getElementById('autoDetectPageCurrency');
    if (autoDetect) autoDetect.checked = settings.autoDetectPageCurrency || false;
    const rateTrends = document.getElementById('showRateTrends');
    if (rateTrends) rateTrends.checked = settings.showRateTrends || false;
    const persistConv = document.getElementById('persistConversions');
    if (persistConv) persistConv.checked = settings.persistConversions || false;

    // History & Favorites
    document.getElementById('saveConversionHistory').checked = settings.saveConversionHistory !== undefined ? settings.saveConversionHistory : true;
    document.getElementById('historyLimit').value = settings.historyLimit || '50';
    document.getElementById('syncFavorites').checked = settings.syncFavorites !== undefined ? settings.syncFavorites : true;
    const autoAddFreq = document.getElementById('autoAddFrequentCurrencies');
    if (autoAddFreq) autoAddFreq.checked = settings.autoAddFrequentCurrencies !== undefined ? settings.autoAddFrequentCurrencies : true;

    // Performance
    document.getElementById('cacheRates').checked = settings.cacheRates !== undefined ? settings.cacheRates : true;
    document.getElementById('preloadCurrencies').checked = settings.preloadCurrencies !== undefined ? settings.preloadCurrencies : true;
    const lazyLoad = document.getElementById('lazyLoadConversions');
    if (lazyLoad) lazyLoad.checked = settings.lazyLoadConversions || false;
    document.getElementById('batchProcessPrices').checked = settings.batchProcessPrices !== undefined ? settings.batchProcessPrices : true;
    const offlineMode = document.getElementById('offlineMode');
    if (offlineMode) offlineMode.checked = settings.offlineMode || false;

    // Smart features
    const smartRounding = document.getElementById('smartRounding');
    if (smartRounding) smartRounding.checked = settings.smartRounding !== undefined ? settings.smartRounding : true;
    const contextAware = document.getElementById('contextAwareConversion');
    if (contextAware) contextAware.checked = settings.contextAwareConversion || false;
    const multiCurrency = document.getElementById('multiCurrencyDetection');
    if (multiCurrency) multiCurrency.checked = settings.multiCurrencyDetection !== undefined ? settings.multiCurrencyDetection : true;
    const rateAlerts = document.getElementById('rateAlerts');
    if (rateAlerts) rateAlerts.checked = settings.rateAlerts || false;
    const confidenceScore = document.getElementById('showConfidenceScore');
    if (confidenceScore) confidenceScore.checked = settings.showConfidenceScore || false;

    // Display preferences
    const symbolPos = document.getElementById('symbolPosition');
    if (symbolPos) symbolPos.value = settings.symbolPosition || 'auto';
    const roundingMethod = document.getElementById('roundingMethod');
    if (roundingMethod) roundingMethod.value = settings.roundingMethod || 'nearest';
    const useNative = document.getElementById('useNativeNumbers');
    if (useNative) useNative.checked = settings.useNativeNumbers || false;
    const showFlags = document.getElementById('showCurrencyFlags');
    if (showFlags) showFlags.checked = settings.showCurrencyFlags || false;

    toggleApiKeyField();
    updateStatus('Settings loaded', 'success');

  } catch (error) {
    console.error('Failed to load settings:', error);
    updateStatus('Failed to load settings', 'error');
  }
}

// Apply UI scale to the settings page
function applyUIScale(scale) {
  document.documentElement.style.setProperty('--ui-scale', scale / 100);
}

function setupEventListeners() {
  // UI Scale slider
  const uiScaleSlider = document.getElementById('uiScale');
  const uiScaleValue = document.getElementById('uiScaleValue');
  uiScaleSlider.addEventListener('input', (e) => {
    const scale = e.target.value;
    uiScaleValue.textContent = scale;
    applyUIScale(scale);
  });
  uiScaleSlider.addEventListener('change', () => {
    setTimeout(saveSettings, 300);
  });

  // Reset to defaults
  document.getElementById('resetBtn').addEventListener('click', resetSettings);

  // API provider change
  document.getElementById('apiProvider').addEventListener('change', toggleApiKeyField);

  // API key visibility toggle
  document.getElementById('toggleApiKey').addEventListener('click', toggleApiKeyVisibility);

  // Quick actions
  document.getElementById('clearCacheBtn').addEventListener('click', clearCache);
  document.getElementById('testConnectionBtn').addEventListener('click', testConnection);
  document.getElementById('exportSettingsBtn').addEventListener('click', exportSettings);
  document.getElementById('importSettingsBtn').addEventListener('click', () => {
    document.getElementById('importFile').click();
  });

  // Import file
  document.getElementById('importFile').addEventListener('change', importSettings);

  // Force refresh button
  document.getElementById('forceRefreshBtn').addEventListener('click', async () => {
    const btn = document.getElementById('forceRefreshBtn');
    btn.textContent = '⏳ Updating...';
    btn.disabled = true;

    try {
      await testConnection();
      btn.textContent = '✅ Updated!';
      setTimeout(() => {
        btn.textContent = '🔄 Update Now';
        btn.disabled = false;
      }, 2000);
    } catch (error) {
      btn.textContent = '❌ Failed';
      setTimeout(() => {
        btn.textContent = '🔄 Update Now';
        btn.disabled = false;
      }, 2000);
    }
  });

  // Theme selection handler with immediate preview
  document.getElementById('themeSelect').addEventListener('change', async (e) => {
    const theme = e.target.value;

    // Apply theme immediately for preview
    if (window.themeManager) {
      window.themeManager.applyTheme(theme);
      await window.themeManager.saveTheme(theme);
    }

    // Notify all tabs of theme change
    try {
      const tabs = await chrome.tabs.query({});
      tabs.forEach(tab => {
        chrome.tabs.sendMessage(tab.id, {
          type: 'themeChanged',
          theme: theme
        }).catch(() => {
          // Ignore errors for inactive tabs
        });
      });
    } catch (error) {
      console.error('Failed to broadcast theme change:', error);
    }

    setTimeout(saveSettings, 100);
  });

  // Tooltip delay slider
  const tooltipDelaySlider = document.getElementById('tooltipDelay');
  const tooltipDelayValue = document.getElementById('tooltipDelayValue');
  tooltipDelaySlider.addEventListener('input', (e) => {
    tooltipDelayValue.textContent = `${e.target.value}ms`;
  });
  tooltipDelaySlider.addEventListener('change', () => {
    setTimeout(saveSettings, 500);
  });

  // Auto-save on certain changes
  const autoSaveElements = [
    'defaultTargetCurrency', 'updateInterval', 'showTooltip', 'highlightPrices',
    'autoConvertOnHover', 'showInlineConversion', 'replacePrice',
    // Popup visibility settings
    'showStatsBar', 'showFavorites', 'showActions', 'showQuickToggles', 'showFooterLinks',
    // Tooltip settings
    'tooltipPosition', 'showExchangeRate', 'compactTooltip', 'tooltipAnimation',
    // Display format
    'decimalPlaces', 'currencyDisplay', 'useThousandSeparator',
    // Advanced settings
    'detectionSensitivity', 'minPrice', 'showNotifications',
    'enableSounds', 'debugMode',
    // Accessibility
    'highContrast', 'largeText', 'reducedMotion', 'screenReaderMode',
    // Page features
    'showOriginalPrice', 'convertOnPageLoad', 'quickCopyOnClick',
    'autoDetectPageCurrency', 'showRateTrends', 'persistConversions',
    // History & Favorites
    'saveConversionHistory', 'historyLimit', 'syncFavorites',
    'autoAddFrequentCurrencies',
    // Performance
    'cacheRates', 'preloadCurrencies', 'lazyLoadConversions',
    'batchProcessPrices', 'offlineMode',
    // Smart features
    'smartRounding', 'contextAwareConversion', 'multiCurrencyDetection',
    'rateAlerts', 'showConfidenceScore',
    // Display preferences
    'symbolPosition', 'roundingMethod', 'useNativeNumbers', 'showCurrencyFlags'
  ];
  autoSaveElements.forEach(id => {
    const element = document.getElementById(id);
    if (element) {
      element.addEventListener('change', () => {
        setTimeout(saveSettings, 500); // Debounced auto-save
      });
    }
  });
}

async function saveSettings() {
  try {
    const settings = {
      uiScale: parseInt(document.getElementById('uiScale').value),
      selectedTheme: document.getElementById('themeSelect').value,
      defaultTargetCurrency: document.getElementById('defaultTargetCurrency').value,
      updateInterval: parseInt(document.getElementById('updateInterval').value),
      showTooltip: document.getElementById('showTooltip').checked,
      highlightPrices: document.getElementById('highlightPrices').checked,
      autoConvertOnHover: document.getElementById('autoConvertOnHover').checked,
      showInlineConversion: document.getElementById('showInlineConversion').checked,
      replacePrice: document.getElementById('replacePrice').checked,
      apiProvider: document.getElementById('apiProvider').value,
      apiKey: document.getElementById('apiKey').value,
      // Popup visibility settings
      showStatsBar: document.getElementById('showStatsBar').checked,
      showFavorites: document.getElementById('showFavorites').checked,
      showActions: document.getElementById('showActions').checked,
      showQuickToggles: document.getElementById('showQuickToggles').checked,
      showFooterLinks: document.getElementById('showFooterLinks').checked,
      // Tooltip settings
      tooltipDelay: parseInt(document.getElementById('tooltipDelay').value),
      tooltipPosition: document.getElementById('tooltipPosition').value,
      showExchangeRate: document.getElementById('showExchangeRate').checked,
      compactTooltip: document.getElementById('compactTooltip').checked,
      tooltipAnimation: document.getElementById('tooltipAnimation').checked,
      // Display format
      decimalPlaces: document.getElementById('decimalPlaces').value,
      currencyDisplay: document.getElementById('currencyDisplay').value,
      useThousandSeparator: document.getElementById('useThousandSeparator').checked,
      // Advanced settings
      detectionSensitivity: document.getElementById('detectionSensitivity').value,
      minPrice: parseFloat(document.getElementById('minPrice').value) || null,
      showNotifications: document.getElementById('showNotifications').checked,
      enableSounds: document.getElementById('enableSounds')?.checked || false,
      debugMode: document.getElementById('debugMode').checked,
      // Accessibility
      highContrast: document.getElementById('highContrast').checked,
      largeText: document.getElementById('largeText').checked,
      reducedMotion: document.getElementById('reducedMotion').checked,
      screenReaderMode: document.getElementById('screenReaderMode').checked,
      // Page features
      showOriginalPrice: document.getElementById('showOriginalPrice').checked,
      convertOnPageLoad: document.getElementById('convertOnPageLoad').checked,
      quickCopyOnClick: document.getElementById('quickCopyOnClick').checked,
      autoDetectPageCurrency: document.getElementById('autoDetectPageCurrency')?.checked || false,
      showRateTrends: document.getElementById('showRateTrends')?.checked || false,
      persistConversions: document.getElementById('persistConversions')?.checked || false,
      // History & Favorites
      saveConversionHistory: document.getElementById('saveConversionHistory').checked,
      historyLimit: document.getElementById('historyLimit').value,
      syncFavorites: document.getElementById('syncFavorites').checked,
      autoAddFrequentCurrencies: document.getElementById('autoAddFrequentCurrencies')?.checked || false,
      // Performance
      cacheRates: document.getElementById('cacheRates').checked,
      preloadCurrencies: document.getElementById('preloadCurrencies').checked,
      lazyLoadConversions: document.getElementById('lazyLoadConversions')?.checked || false,
      batchProcessPrices: document.getElementById('batchProcessPrices').checked,
      offlineMode: document.getElementById('offlineMode')?.checked || false,
      // Smart features
      smartRounding: document.getElementById('smartRounding')?.checked !== undefined ? document.getElementById('smartRounding').checked : true,
      contextAwareConversion: document.getElementById('contextAwareConversion')?.checked || false,
      multiCurrencyDetection: document.getElementById('multiCurrencyDetection')?.checked || false,
      rateAlerts: document.getElementById('rateAlerts')?.checked || false,
      showConfidenceScore: document.getElementById('showConfidenceScore')?.checked || false,
      // Display preferences
      symbolPosition: document.getElementById('symbolPosition')?.value || 'before',
      roundingMethod: document.getElementById('roundingMethod')?.value || 'standard',
      useNativeNumbers: document.getElementById('useNativeNumbers')?.checked || false,
      showCurrencyFlags: document.getElementById('showCurrencyFlags')?.checked || false
    };

    await chrome.storage.sync.set(settings);
    updateStatus('Settings saved successfully', 'success');

    // Notify content scripts of settings update
    try {
      const tabs = await chrome.tabs.query({});
      tabs.forEach(tab => {
        chrome.tabs.sendMessage(tab.id, { type: 'settingsUpdated' }).catch(() => {
          // Ignore errors for inactive tabs
        });
      });
    } catch (error) {
      // Ignore tab messaging errors
    }

    // Clear cached rates if API provider changed
    await chrome.storage.local.remove(['exchangeRates', 'lastUpdate']);

  } catch (error) {
    console.error('Failed to save settings:', error);
    updateStatus('Failed to save settings', 'error');
  }
}

async function resetSettings() {
  if (confirm('Are you sure you want to reset all settings to their default values?')) {
    try {
      await chrome.storage.sync.clear();
      await chrome.storage.local.clear();

      // Reset UI scale
      document.getElementById('uiScale').value = 100;
      document.getElementById('uiScaleValue').textContent = 100;
      applyUIScale(100);

      // Reset form - Basic settings
      document.getElementById('themeSelect').value = 'dark';
      document.getElementById('defaultTargetCurrency').value = 'ILS';
      document.getElementById('updateInterval').value = '1440';
      document.getElementById('showTooltip').checked = false;
      document.getElementById('highlightPrices').checked = false;
      document.getElementById('autoConvertOnHover').checked = false;
      document.getElementById('showInlineConversion').checked = true;
      document.getElementById('replacePrice').checked = false;
      document.getElementById('apiProvider').value = 'exchangerate-api';
      document.getElementById('apiKey').value = '';

      // Reset popup visibility settings (all hidden by default)
      document.getElementById('showStatsBar').checked = false;
      document.getElementById('showFavorites').checked = false;
      document.getElementById('showActions').checked = false;
      document.getElementById('showQuickToggles').checked = false;
      document.getElementById('showFooterLinks').checked = false;

      // Reset tooltip settings
      document.getElementById('tooltipDelay').value = 300;
      document.getElementById('tooltipDelayValue').textContent = '300ms';
      document.getElementById('tooltipPosition').value = 'auto';
      document.getElementById('showExchangeRate').checked = false;
      document.getElementById('compactTooltip').checked = false;
      document.getElementById('tooltipAnimation').checked = true;

      // Reset display format
      document.getElementById('decimalPlaces').value = 'auto';
      document.getElementById('currencyDisplay').value = 'symbol';
      document.getElementById('useThousandSeparator').checked = true;

      // Reset advanced settings
      document.getElementById('detectionSensitivity').value = 'medium';
      document.getElementById('minPrice').value = '';
      document.getElementById('showNotifications').checked = true;
      document.getElementById('enableSounds').checked = false;
      document.getElementById('debugMode').checked = false;

      // Reset accessibility
      document.getElementById('highContrast').checked = false;
      document.getElementById('largeText').checked = false;
      document.getElementById('reducedMotion').checked = false;
      document.getElementById('screenReaderMode').checked = false;

      // Reset page features
      document.getElementById('showOriginalPrice').checked = false;
      document.getElementById('convertOnPageLoad').checked = true;
      document.getElementById('quickCopyOnClick').checked = false;
      document.getElementById('autoDetectPageCurrency').checked = false;
      document.getElementById('showRateTrends').checked = false;
      document.getElementById('persistConversions').checked = false;

      // Reset history & favorites
      document.getElementById('saveConversionHistory').checked = true;
      document.getElementById('historyLimit').value = '50';
      document.getElementById('syncFavorites').checked = true;
      document.getElementById('autoAddFrequentCurrencies').checked = true;

      // Reset performance
      document.getElementById('cacheRates').checked = true;
      document.getElementById('preloadCurrencies').checked = true;
      document.getElementById('lazyLoadConversions').checked = false;
      document.getElementById('batchProcessPrices').checked = true;
      document.getElementById('offlineMode').checked = false;

      // Reset smart features
      document.getElementById('smartRounding').checked = true;
      document.getElementById('contextAwareConversion').checked = false;
      document.getElementById('multiCurrencyDetection').checked = true;
      document.getElementById('rateAlerts').checked = false;
      document.getElementById('showConfidenceScore').checked = false;

      // Reset display preferences
      document.getElementById('symbolPosition').value = 'auto';
      document.getElementById('roundingMethod').value = 'nearest';
      document.getElementById('useNativeNumbers').checked = false;
      document.getElementById('showCurrencyFlags').checked = false;

      toggleApiKeyField();
      updateStatus('Settings reset to defaults', 'success');

    } catch (error) {
      console.error('Failed to reset settings:', error);
      updateStatus('Failed to reset settings', 'error');
    }
  }
}

function toggleApiKeyField() {
  const provider = document.getElementById('apiProvider').value;
  const apiKeyGroup = document.getElementById('apiKeyGroup');
  const apiGuide = document.getElementById('apiKeyGuide');

  // Define which providers need API keys
  const freeProviders = [
    'exchangerate-api',
    'exchangerates-api',
    'ecb',
    'bank-of-israel',
    'currencyapi'
  ];

  const requiresKey = !freeProviders.includes(provider);

  if (requiresKey) {
    apiKeyGroup.style.display = 'block';
    updateApiKeyGuide(provider);
  } else {
    apiKeyGroup.style.display = 'none';
  }
}

function updateApiKeyGuide(provider) {
  const apiGuide = document.getElementById('apiKeyGuide');
  if (!apiGuide) return;

  const guides = {
    'fixer': {
      name: 'Fixer.io',
      free: false,
      steps: [
        'Go to <a href="https://fixer.io/product" target="_blank">fixer.io/product</a>',
        'Choose a paid plan (starting at $10/month)',
        'Sign up and verify your email',
        'Go to your Dashboard',
        'Copy your API Access Key',
        'Paste it in the field above'
      ],
      note: '⚠️ This is a PAID service - no free tier available'
    },
    'currencylayer': {
      name: 'CurrencyLayer',
      free: false,
      steps: [
        'Go to <a href="https://currencylayer.com/product" target="_blank">currencylayer.com/product</a>',
        'Choose a paid plan (starting at $10/month)',
        'Create an account',
        'Verify your email',
        'Find your Access Key in the dashboard',
        'Paste it above'
      ],
      note: '⚠️ This is a PAID service - no free tier available'
    },
    'openexchangerates': {
      name: 'Open Exchange Rates',
      free: 'limited',
      steps: [
        'Go to <a href="https://openexchangerates.org/signup/free" target="_blank">openexchangerates.org/signup/free</a>',
        '✅ Choose the FREE plan (1000 requests/month)',
        'Create your account',
        'Verify your email',
        'Copy your App ID from the dashboard',
        'Paste it above'
      ],
      note: '✅ FREE tier available! 1000 requests per month is plenty for personal use'
    },
    'xe': {
      name: 'XE Currency Data',
      free: false,
      steps: [
        'Go to <a href="https://www.xe.com/xecurrencydata/" target="_blank">xe.com/xecurrencydata</a>',
        'Contact sales for enterprise pricing',
        'This is an enterprise-only service'
      ],
      note: '⚠️ Enterprise only - expensive, not recommended for personal use'
    }
  };

  const guide = guides[provider];
  if (!guide) {
    apiGuide.innerHTML = '<div class="guide-content">No guide available for this provider.</div>';
    return;
  }

  const isFree = guide.free === true || guide.free === 'limited';
  const borderColor = isFree ? '#10b981' : '#ef4444';
  const bgColor = isFree ? '#ecfdf5' : '#fef2f2';

  let html = `
    <div class="guide-content" style="background: ${bgColor}; border-left: 3px solid ${borderColor}; padding: 12px; margin-top: 8px; border-radius: 4px;">
      <strong>📖 How to get ${guide.name} API Key:</strong><br><br>
      <ol style="margin: 8px 0; padding-left: 20px;">
        ${guide.steps.map(step => `<li style="margin: 4px 0;">${step}</li>`).join('')}
      </ol>
      <div style="margin-top: 12px; padding: 8px; background: white; border-radius: 4px; font-size: 13px;">
        ${guide.note}
      </div>
    </div>
  `;

  apiGuide.innerHTML = html;
}

function toggleApiKeyVisibility() {
  const apiKeyInput = document.getElementById('apiKey');
  const toggleBtn = document.getElementById('toggleApiKey');
  const toggleText = toggleBtn.querySelector('.toggle-text');

  if (apiKeyInput.type === 'password') {
    // Show the API key
    apiKeyInput.type = 'text';
    toggleText.textContent = 'Hide';
    toggleBtn.classList.add('showing');
    toggleBtn.setAttribute('aria-label', 'Hide API key');
  } else {
    // Hide the API key
    apiKeyInput.type = 'password';
    toggleText.textContent = 'Show';
    toggleBtn.classList.remove('showing');
    toggleBtn.setAttribute('aria-label', 'Show API key');
  }
}

async function clearCache() {
  try {
    await chrome.storage.local.clear();
    updateStatus('Cache cleared successfully', 'success');
  } catch (error) {
    console.error('Failed to clear cache:', error);
    updateStatus('Failed to clear cache', 'error');
  }
}

async function testConnection() {
  try {
    updateStatus('Testing connection...', 'loading');

    const response = await chrome.runtime.sendMessage({
      type: 'getExchangeRates',
      forceUpdate: true
    });

    if (response.rates && Object.keys(response.rates).length > 0) {
      updateStatus('Connection test successful', 'success');
    } else {
      updateStatus('Connection test failed', 'error');
    }

  } catch (error) {
    console.error('Connection test failed:', error);
    updateStatus('Connection test failed', 'error');
  }
}

async function exportSettings() {
  try {
    const settings = await chrome.storage.sync.get();
    const exportData = {
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      settings: settings
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `currency-converter-settings-${new Date().toISOString().split('T')[0]}.json`;
    a.click();

    URL.revokeObjectURL(url);
    updateStatus('Settings exported successfully', 'success');

  } catch (error) {
    console.error('Failed to export settings:', error);
    updateStatus('Failed to export settings', 'error');
  }
}

async function importSettings(event) {
  const file = event.target.files[0];
  if (!file) return;

  try {
    const text = await file.text();
    const importData = JSON.parse(text);

    if (!importData.settings) {
      throw new Error('Invalid settings file format');
    }

    await chrome.storage.sync.set(importData.settings);
    await loadSettings();

    updateStatus('Settings imported successfully', 'success');
    event.target.value = ''; // Reset file input

  } catch (error) {
    console.error('Failed to import settings:', error);
    updateStatus('Failed to import settings', 'error');
    event.target.value = ''; // Reset file input
  }
}

function updateStatus(text, type = 'info') {
  const statusElement = document.getElementById('status');
  if (!statusElement) return;

  const indicator = statusElement.querySelector('.status-dot');
  const textElement = statusElement.querySelector('.status-text');

  if (textElement) textElement.textContent = text;
  if (indicator) indicator.className = `status-dot ${type}`;

  // Auto-clear status after 2 seconds for non-error messages
  if (type !== 'error') {
    setTimeout(() => {
      if (textElement) textElement.textContent = 'Auto-saved';
      if (indicator) indicator.className = 'status-dot';
    }, 2000);
  }
}