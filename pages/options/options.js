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
      'highlightPrices',
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
      // Display format
      'decimalPlaces',
      'currencyDisplay',
      'useThousandSeparator',
      // Advanced settings
      'detectionSensitivity',
      'minPrice',
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

    // ⭐ SMART DEFAULTS: Native HTML title tooltip ON by default for best UX
    document.getElementById('defaultTargetCurrency').value = settings.defaultTargetCurrency || 'ILS';
    document.getElementById('updateInterval').value = settings.updateInterval || '1440';
    document.getElementById('highlightPrices').checked = settings.highlightPrices || false;
    document.getElementById('showInlineConversion').checked = settings.showInlineConversion !== undefined ? settings.showInlineConversion : true; // Native HTML title ON by default ⭐
    document.getElementById('replacePrice').checked = settings.replacePrice || false;
    const apiProviderSelect = document.getElementById('apiProvider');
    apiProviderSelect.value = settings.apiProvider || 'exchangerate-api';
    if (!apiProviderSelect.value) {
      // Stored provider is no longer offered - fall back to the default
      apiProviderSelect.value = 'exchangerate-api';
    }
    document.getElementById('apiKey').value = settings.apiKey || '';

    // Popup visibility settings (all hidden by default)
    document.getElementById('showStatsBar').checked = settings.showStatsBar || false;
    document.getElementById('showFavorites').checked = settings.showFavorites || false;
    document.getElementById('showActions').checked = settings.showActions || false;
    document.getElementById('showQuickToggles').checked = settings.showQuickToggles || false;
    document.getElementById('showFooterLinks').checked = settings.showFooterLinks || false;

    // Display format
    document.getElementById('decimalPlaces').value = settings.decimalPlaces || 'auto';
    document.getElementById('currencyDisplay').value = settings.currencyDisplay || 'symbol';
    document.getElementById('useThousandSeparator').checked = settings.useThousandSeparator !== false;

    // Advanced settings
    document.getElementById('detectionSensitivity').value = settings.detectionSensitivity || 'medium';
    document.getElementById('minPrice').value = settings.minPrice || '';
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
    updateCurrencyExamples(); // Update examples with selected currency
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

// Update currency examples dynamically based on selected currency
function updateCurrencyExamples() {
  const selectedCurrency = document.getElementById('defaultTargetCurrency')?.value || 'ILS';

  // Comprehensive currency symbol mapping (170+ currencies supported)
  const currencySymbols = {
    // Major currencies
    'USD': '$', 'EUR': '€', 'GBP': '£', 'JPY': '¥', 'CNY': '¥',
    'ILS': '₪', 'AUD': 'A$', 'CAD': 'C$', 'CHF': 'CHF', 'SEK': 'kr',
    'NOK': 'kr', 'DKK': 'kr', 'RUB': '₽', 'INR': '₹', 'BRL': 'R$',
    'ZAR': 'R', 'KRW': '₩', 'MXN': '$', 'SGD': 'S$', 'HKD': 'HK$',
    'NZD': 'NZ$', 'TRY': '₺', 'PLN': 'zł', 'THB': '฿', 'IDR': 'Rp',
    'MYR': 'RM', 'PHP': '₱', 'CZK': 'Kč', 'HUF': 'Ft', 'RON': 'lei',
    'BGN': 'лв', 'HRK': 'kn', 'AED': 'د.إ', 'SAR': '﷼', 'QAR': 'ر.ق',
    'KWD': 'د.ك', 'BHD': 'د.ب', 'OMR': 'ر.ع', 'JOD': 'د.ا', 'LBP': 'ل.ل',
    'EGP': 'E£', 'MAD': 'د.م', 'TND': 'د.ت', 'DZD': 'د.ج', 'LYD': 'ل.د',
    'IQD': 'ع.د', 'SYP': '£S', 'YER': '﷼', 'SDG': 'ج.س', 'SOS': 'Sh',
    'KES': 'KSh', 'TZS': 'TSh', 'UGX': 'USh', 'GHS': '₵', 'NGN': '₦',
    'XOF': 'CFA', 'XAF': 'FCFA', 'ETB': 'Br', 'ARS': '$', 'CLP': '$',
    'COP': '$', 'PEN': 'S/', 'UYU': '$U', 'VEF': 'Bs', 'BOB': 'Bs',
    'PYG': '₲', 'CRC': '₡', 'GTQ': 'Q', 'HNL': 'L', 'NIO': 'C$',
    'PAB': 'B/.', 'DOP': 'RD$', 'JMD': 'J$', 'TTD': 'TT$', 'BBD': 'Bds$',
    'BZD': 'BZ$', 'GYD': 'G$', 'SRD': '$', 'HTG': 'G', 'AWG': 'ƒ',
    'ANG': 'ƒ', 'VND': '₫', 'KHR': '៛', 'LAK': '₭', 'MMK': 'K',
    'BDT': '৳', 'PKR': '₨', 'LKR': '₨', 'NPR': '₨', 'AFN': '؋',
    'UZS': 'soʻm', 'KZT': '₸', 'GEL': '₾', 'AMD': '֏', 'AZN': '₼',
    'TMT': 'm', 'TJS': 'SM', 'KGS': 'с', 'MDL': 'L', 'UAH': '₴',
    'BYN': 'Br', 'ISK': 'kr', 'ALL': 'L', 'MKD': 'ден', 'RSD': 'дин',
    'BAM': 'KM', 'GIP': '£', 'FKP': '£', 'SHP': '£', 'JEP': '£',
    'IMP': '£', 'GGP': '£', 'TVD': '$', 'NRG': '$', 'SBD': '$',
    'TOP': 'T$', 'WST': 'T', 'VUV': 'Vt', 'FJD': '$', 'PGK': 'K',
    'XPF': '₣', 'MRU': 'UM', 'MGA': 'Ar', 'MWK': 'MK', 'ZMW': 'ZK',
    'AOA': 'Kz', 'BIF': 'FBu', 'RWF': 'FRw', 'LSL': 'L', 'SZL': 'E',
    'BWP': 'P', 'NAD': '$', 'MUR': '₨', 'SCR': '₨', 'GMD': 'D',
    'SLL': 'Le', 'LRD': '$', 'GNF': 'FG', 'CVE': '$', 'STN': 'Db',
    'ERN': 'Nfk', 'DJF': 'Fdj', 'KMF': 'CF', 'MZN': 'MT', 'BTC': '₿',
    'ETH': 'Ξ', 'LTC': 'Ł', 'XRP': 'XRP', 'BCH': 'BCH', 'ADA': '₳'
  };

  // Get symbol for selected currency (fallback to currency code if no symbol found)
  const symbol = currencySymbols[selectedCurrency] || selectedCurrency;
  const code = selectedCurrency;

  // Example amounts for different contexts
  const examples = {
    standard: '366.30',      // Standard 2 decimal
    whole: '366',            // No decimals
    crypto: '366.301',       // 3 decimals
    precise: '366.3015',     // 4 decimals
    small: '0.99',           // Small amount
    medium: '99',            // Medium amount
    large: '1,234.56'        // Large with separator
  };

  // Update Decimal Places hint (lines 358-362)
  const decimalPlacesHint = document.querySelector('#decimalPlaces')?.closest('.setting-item')?.querySelector('.setting-hint');
  if (decimalPlacesHint) {
    decimalPlacesHint.innerHTML = `Control number precision for converted amounts<br>
    <strong>Examples:</strong><br>
    • 0: "${symbol}${examples.whole}" (Clean, whole numbers)<br>
    • 2: "${symbol}${examples.standard}" (Standard currency format ⭐)<br>
    • 3: "${symbol}${examples.crypto}" (Crypto/forex)<br>
    • 4: "${symbol}${examples.precise}" (Maximum precision)<br>
    • Auto: Smart rounding based on value (recommended)`;
  }

  // Update Decimal Places dropdown options (preserve selected value)
  const decimalPlacesSelect = document.getElementById('decimalPlaces');
  if (decimalPlacesSelect) {
    const currentValue = decimalPlacesSelect.value; // Save current selection
    decimalPlacesSelect.innerHTML = `
      <option value="0">0 - No decimals (${symbol}${examples.whole})</option>
      <option value="2">2 - Standard (${symbol}${examples.standard})</option>
      <option value="3">3 - Crypto (${symbol}${examples.crypto})</option>
      <option value="4">4 - Max precision (${symbol}${examples.precise})</option>
      <option value="auto">Auto - Smart rounding ⭐</option>
    `;
    decimalPlacesSelect.value = currentValue; // Restore selection
  }

  // Update Native HTML Title example (line 420)
  const nativeTooltipHint = document.querySelector('#showInlineConversion')?.closest('.setting-item')?.querySelector('.setting-hint');
  if (nativeTooltipHint) {
    nativeTooltipHint.innerHTML = `Show conversion using native HTML title attribute - Simple & universal!<br>
    <strong>Example:</strong> Hover "$${examples.medium}" → Browser's native tooltip shows "~${symbol}${examples.standard} ${code}"<br>
    <strong>✅ Benefits:</strong> Zero conflicts, works everywhere, no custom UI, instant<br>
    <strong>📌 Perfect for:</strong> Shopping sites, price comparisons, quick conversions`;
  }

  // Update Replace Original Prices example (line 434)
  const replacePriceHint = document.querySelector('#replacePrice')?.closest('.setting-item')?.querySelector('.setting-hint');
  if (replacePriceHint) {
    replacePriceHint.innerHTML = `<strong>⚠️ Experimental:</strong> Replace prices on page with converted amounts<br>
    <strong>Example:</strong> "$${examples.medium}" → "${symbol}${examples.standard}" (original price replaced)<br>
    <strong>⚠️ Warning:</strong> May break some sites, use with caution<br>
    <strong>💡 Tip:</strong> Keep OFF and use native title tooltip instead`;
  }

  // Update Highlight Detected Prices example (line 405)
  const highlightHint = document.querySelector('#highlightPrices')?.closest('.setting-item')?.querySelector('.setting-hint');
  if (highlightHint) {
    highlightHint.innerHTML = `Visually mark prices that can be converted<br>
    <strong>Example:</strong> "$${examples.medium}" gets colored border/background<br>
    <strong>Note:</strong> Helps identify convertible prices at a glance`;
  }

  // Update Minimum Price Threshold example (line 472)
  const minPriceHint = document.querySelector('#minPrice')?.closest('.setting-item')?.querySelector('.setting-hint');
  if (minPriceHint) {
    minPriceHint.innerHTML = `Skip amounts below this value to reduce noise<br>
    <strong>Example:</strong> Set to "1.00" to ignore small amounts like "${symbol}${examples.small}" or "€0.50"<br>
    <strong>Use cases:</strong><br>
    • "0.01": Convert everything (including cents)<br>
    • "1.00": Skip cent amounts (recommended)<br>
    • "10.00": Only convert significant prices`;
  }
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

  // Update currency examples when default currency changes
  const currencyDropdown = document.getElementById('defaultTargetCurrency');
  if (currencyDropdown) {
    currencyDropdown.addEventListener('change', () => {
      updateCurrencyExamples(); // Update examples immediately
      setTimeout(saveSettings, 500); // Then save
    });
  }

  // Auto-save on certain changes
  const autoSaveElements = [
    'updateInterval', 'highlightPrices', // Removed defaultTargetCurrency (handled above)
    'apiProvider', 'apiKey',
    'showInlineConversion', 'replacePrice',
    // Popup visibility settings
    'showStatsBar', 'showFavorites', 'showActions', 'showQuickToggles', 'showFooterLinks',
    // Display format
    'decimalPlaces', 'currencyDisplay', 'useThousandSeparator',
    // Advanced settings
    'detectionSensitivity', 'minPrice',
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
      highlightPrices: document.getElementById('highlightPrices').checked,
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
      // Display format
      decimalPlaces: document.getElementById('decimalPlaces').value,
      currencyDisplay: document.getElementById('currencyDisplay').value,
      useThousandSeparator: document.getElementById('useThousandSeparator').checked,
      // Advanced settings
      detectionSensitivity: document.getElementById('detectionSensitivity').value,
      minPrice: parseFloat(document.getElementById('minPrice').value) || null,
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

    // Rates are refetched by the background script when the provider or key changes

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

      // Reset form - Basic settings (⭐ Smart default: Native HTML title ON)
      document.getElementById('themeSelect').value = 'chrome-dark'; // Chrome Dark is default
      document.getElementById('defaultTargetCurrency').value = 'ILS';
      document.getElementById('updateInterval').value = '1440';
      document.getElementById('highlightPrices').checked = false;
      document.getElementById('showInlineConversion').checked = true; // Native HTML title attribute ON ⭐
      document.getElementById('replacePrice').checked = false;
      document.getElementById('apiProvider').value = 'exchangerate-api';
      document.getElementById('apiKey').value = '';

      // Reset popup visibility settings (all hidden by default)
      document.getElementById('showStatsBar').checked = false;
      document.getElementById('showFavorites').checked = false;
      document.getElementById('showActions').checked = false;
      document.getElementById('showQuickToggles').checked = false;
      document.getElementById('showFooterLinks').checked = false;

      // Reset display format
      document.getElementById('decimalPlaces').value = 'auto';
      document.getElementById('currencyDisplay').value = 'symbol';
      document.getElementById('useThousandSeparator').checked = true;

      // Reset advanced settings
      document.getElementById('detectionSensitivity').value = 'medium';
      document.getElementById('minPrice').value = '';
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
    'ecb',
    'bank-of-israel'
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
      free: 'limited',
      steps: [
        'Go to <a href="https://fixer.io/signup/free" target="_blank" rel="noopener">fixer.io/signup/free</a>',
        'Sign up for the free plan (or a paid plan for more requests)',
        'Verify your email',
        'Copy your API Access Key from the dashboard',
        'Paste it in the field above'
      ],
      note: 'ℹ️ Free plan available with limited requests. Free-plan rates use EUR as the base and are rebased to USD automatically.'
    },
    'currencylayer': {
      name: 'CurrencyLayer',
      free: 'limited',
      steps: [
        'Go to <a href="https://currencylayer.com/signup/free" target="_blank" rel="noopener">currencylayer.com/signup/free</a>',
        'Sign up for the free plan (or a paid plan for more requests)',
        'Verify your email',
        'Copy your Access Key from the dashboard',
        'Paste it above'
      ],
      note: 'ℹ️ Free plan available with limited requests.'
    },
    'openexchangerates': {
      name: 'Open Exchange Rates',
      free: 'limited',
      steps: [
        'Go to <a href="https://openexchangerates.org/signup/free" target="_blank" rel="noopener">openexchangerates.org/signup/free</a>',
        'Choose the free plan (1,000 requests/month)',
        'Create your account and verify your email',
        'Copy your App ID from the dashboard',
        'Paste it above'
      ],
      note: 'ℹ️ Free plan available with limited requests (1,000/month) - plenty for personal use.'
    },
    'currencyapi': {
      name: 'CurrencyAPI',
      free: 'limited',
      steps: [
        'Go to <a href="https://app.currencyapi.com/register" target="_blank" rel="noopener">app.currencyapi.com/register</a>',
        'Sign up for the free plan',
        'Copy your API key from the dashboard',
        'Paste it above'
      ],
      note: 'ℹ️ Free plan available with limited requests.'
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