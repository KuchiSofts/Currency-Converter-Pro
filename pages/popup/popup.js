// Popup script for manual currency conversion

let exchangeRates = {};
let isConverting = false;
let conversionHistory = [];
let favoriteCurrencies = ['USD', 'EUR', 'GBP', 'JPY'];

document.addEventListener('DOMContentLoaded', async () => {
  // Load UI scale first
  await loadUIScale();

  // Load theme
  if (window.themeManager) {
    await window.themeManager.init();
  }

  await initializePopup();
  await loadPopupVisibilitySettings();
  setupEventListeners();
  await loadConversionHistory();
  await loadFavoriteCurrencies();
  updateStatsBar();
  updateFavoritesGrid();
});

async function initializePopup() {
  // Load exchange rates
  await loadExchangeRates();

  // Load user preferences
  const settings = await chrome.storage.sync.get(['defaultTargetCurrency', 'defaultSourceCurrency']);

  if (settings.defaultTargetCurrency) {
    document.getElementById('toCurrency').value = settings.defaultTargetCurrency;
  }

  if (settings.defaultSourceCurrency) {
    document.getElementById('fromCurrency').value = settings.defaultSourceCurrency;
  }

  updateRateInfo();
}

// Load and apply UI scale
async function loadUIScale() {
  try {
    const settings = await chrome.storage.sync.get(['uiScale']);
    const scale = settings.uiScale || 100;
    const scaleValue = scale / 100;

    // Apply scale by adjusting body width (so popup window resizes)
    const baseWidth = 360;
    const scaledWidth = Math.round(baseWidth * scaleValue);
    document.body.style.width = scaledWidth + 'px';
    document.body.style.minWidth = scaledWidth + 'px';
    document.body.style.maxWidth = scaledWidth + 'px';
  } catch (error) {
    console.error('Failed to load UI scale:', error);
  }
}

// Load and apply popup visibility settings
async function loadPopupVisibilitySettings() {
  try {
    const settings = await chrome.storage.sync.get([
      'showStatsBar',
      'showFavorites',
      'showActions',
      'showQuickToggles',
      'showFooterLinks'
    ]);

    // Apply visibility settings (all hidden by default)
    const statsBar = document.getElementById('statsBar');
    const favoritesSection = document.getElementById('favoritesSection');
    const actionsSection = document.getElementById('actionsSection');
    const quickTogglesSection = document.getElementById('quickTogglesSection');
    const footerLinksSection = document.getElementById('footerLinksSection');

    if (statsBar) {
      statsBar.style.display = settings.showStatsBar ? 'flex' : 'none';
    }
    if (favoritesSection) {
      favoritesSection.style.display = settings.showFavorites ? 'block' : 'none';
    }
    if (actionsSection) {
      actionsSection.style.display = settings.showActions ? 'flex' : 'none';
    }
    if (quickTogglesSection) {
      quickTogglesSection.style.display = settings.showQuickToggles ? 'flex' : 'none';
    }
    if (footerLinksSection) {
      footerLinksSection.style.display = settings.showFooterLinks ? 'flex' : 'none';
    }
  } catch (error) {
    console.error('Failed to load popup visibility settings:', error);
  }
}

function setupEventListeners() {
  const fromAmount = document.getElementById('fromAmount');
  const fromCurrency = document.getElementById('fromCurrency');
  const toCurrency = document.getElementById('toCurrency');
  const swapBtn = document.getElementById('swapBtn');
  const settingsBtn = document.getElementById('settingsBtn');
  const refreshBtn = document.getElementById('refreshBtn');
  const copyBtn = document.getElementById('copyBtn');
  const historyBtn = document.getElementById('historyBtn');
  const compareBtn = document.getElementById('compareBtn');
  const editFavoritesBtn = document.getElementById('editFavoritesBtn');

  // Convert on input change with auto-refresh
  fromAmount.addEventListener('input', debounce(convertCurrency, 300));
  fromCurrency.addEventListener('change', () => {
    convertCurrency();
    loadExchangeRates(true); // Auto-refresh rates when currency changes
  });
  toCurrency.addEventListener('change', () => {
    convertCurrency();
    loadExchangeRates(true); // Auto-refresh rates when currency changes
  });

  // Swap currencies
  swapBtn.addEventListener('click', swapCurrencies);

  // Open settings
  settingsBtn.addEventListener('click', () => {
    chrome.tabs.create({ url: chrome.runtime.getURL('pages/options/options.html') });
  });

  // Refresh rates
  if (refreshBtn) {
    refreshBtn.addEventListener('click', async () => {
      refreshBtn.style.animation = 'spin 1s linear';
      await loadExchangeRates(true);
      setTimeout(() => {
        refreshBtn.style.animation = '';
      }, 1000);
      updateStatsBar();
    });
  }

  // Copy result to clipboard
  if (copyBtn) {
    copyBtn.addEventListener('click', copyResultToClipboard);
  }

  // Show conversion history
  if (historyBtn) {
    historyBtn.addEventListener('click', showConversionHistory);
  }

  // Show rate comparison
  if (compareBtn) {
    compareBtn.addEventListener('click', showRateComparison);
  }

  // Edit favorites
  if (editFavoritesBtn) {
    editFavoritesBtn.addEventListener('click', editFavorites);
  }

  // Quick toggles
  const quickToggleTooltip = document.getElementById('quickToggleTooltip');
  const quickToggleHighlight = document.getElementById('quickToggleHighlight');
  const quickToggleAuto = document.getElementById('quickToggleAuto');

  if (quickToggleTooltip) {
    quickToggleTooltip.addEventListener('change', async () => {
      await chrome.storage.sync.set({ showTooltip: quickToggleTooltip.checked });
    });
  }

  if (quickToggleHighlight) {
    quickToggleHighlight.addEventListener('change', async () => {
      await chrome.storage.sync.set({ highlightPrices: quickToggleHighlight.checked });
    });
  }

  if (quickToggleAuto) {
    quickToggleAuto.addEventListener('change', async () => {
      await chrome.storage.sync.set({ autoConvertOnHover: quickToggleAuto.checked });
    });
  }

  // Footer links
  const fullSettingsBtn = document.getElementById('fullSettingsBtn');
  const helpBtn = document.getElementById('helpBtn');

  if (fullSettingsBtn) {
    fullSettingsBtn.addEventListener('click', () => {
      chrome.tabs.create({ url: chrome.runtime.getURL('pages/options/options.html') });
    });
  }

  if (helpBtn) {
    helpBtn.addEventListener('click', async () => {
      const manifest = chrome.runtime.getManifest();
      const version = manifest.version;
      const helpMessage = `Currency Converter Pro v${version}

Quick Features:
• Stats Bar - View status, last update, and theme
• Favorites - Click to quick-convert to favorite currencies
• Copy - Copy result to clipboard
• History - View recent conversions
• Compare - Compare rates across currencies
• Quick Toggles - Instant settings control

Need more help?
Open Full Settings for advanced options.`;
      alert(helpMessage);
    });
  }

  // Auto-focus amount input
  fromAmount.focus();
}

async function loadExchangeRates(forceUpdate = false) {
  try {

    const response = await chrome.runtime.sendMessage({
      type: 'getExchangeRates',
      forceUpdate
    });

    exchangeRates = response.rates || {};

    // Check for API key warnings
    if (response.apiKeyWarning && response.apiKeyWarning.timestamp) {
      const warning = response.apiKeyWarning;
      const age = Date.now() - warning.timestamp;

      // Show warning if it's less than 5 minutes old
      if (age < 5 * 60 * 1000) {
        console.warn('⚠️ API Key Warning:', warning.message);
        if (warning.guide) {
          console.info('ℹ️ Guide:', warning.guide);
        }
        if (warning.signupUrl) {
          console.info('🔗 Sign up:', warning.signupUrl);
        }
      }
    }

    updateRateInfo(response.lastUpdateFormatted);

  } catch (error) {
    console.error('Failed to load exchange rates:', error);
  }
}

async function convertCurrency() {
  if (isConverting) return;

  try {
    const fromAmountValue = document.getElementById('fromAmount').value;
    const fromAmount = parseFloat(fromAmountValue);
    const fromCurrency = document.getElementById('fromCurrency').value;
    const toCurrency = document.getElementById('toCurrency').value;
    const toAmountInput = document.getElementById('toAmount');

    // Validate inputs
    if (!fromAmountValue || isNaN(fromAmount) || fromAmount <= 0) {
      toAmountInput.value = '';
      return;
    }

    if (fromAmount > 999999999) {
      toAmountInput.value = '';
      return;
    }

    if (!exchangeRates[fromCurrency] || !exchangeRates[toCurrency]) {
      console.warn('Exchange rates not available');
      return;
    }

    if (fromCurrency === toCurrency) {
      toAmountInput.value = fromAmount.toFixed(2);
      updateRateInfo();
      return;
    }

    isConverting = true;

    // Convert via USD with error handling
    const usdAmount = fromAmount / exchangeRates[fromCurrency];
    const convertedAmount = usdAmount * exchangeRates[toCurrency];

    // Validate result
    if (isNaN(convertedAmount) || !isFinite(convertedAmount)) {
      console.error('Conversion error');
      isConverting = false;
      return;
    }

    toAmountInput.value = convertedAmount.toFixed(2);
    updateRateInfo();

    // Save to history
    await saveConversionToHistory({
      fromAmount,
      fromCurrency,
      toAmount: convertedAmount,
      toCurrency,
      rate: convertedAmount / fromAmount,
      timestamp: Date.now()
    });

    // Save last used currencies (with error handling)
    chrome.storage.sync.set({
      defaultSourceCurrency: fromCurrency,
      defaultTargetCurrency: toCurrency
    }).catch(error => {
      console.error('Failed to save currency preferences:', error);
    });

    isConverting = false;

  } catch (error) {
    console.error('Conversion error:', error);
    isConverting = false;
  }
}

function swapCurrencies() {
  const fromCurrency = document.getElementById('fromCurrency');
  const toCurrency = document.getElementById('toCurrency');
  const fromAmount = document.getElementById('fromAmount');
  const toAmount = document.getElementById('toAmount');

  // Swap currency selections
  const tempCurrency = fromCurrency.value;
  fromCurrency.value = toCurrency.value;
  toCurrency.value = tempCurrency;

  // Swap amounts
  const tempAmount = fromAmount.value;
  fromAmount.value = toAmount.value;
  toAmount.value = tempAmount;

  convertCurrency();
}

function updateRateInfo(lastUpdateFormatted = null) {
  const fromCurrency = document.getElementById('fromCurrency').value;
  const toCurrency = document.getElementById('toCurrency').value;
  const rateInfo = document.getElementById('rateInfo');

  if (exchangeRates[fromCurrency] && exchangeRates[toCurrency]) {
    const rate = exchangeRates[toCurrency] / exchangeRates[fromCurrency];
    rateInfo.querySelector('.rate-text').textContent =
      `1 ${fromCurrency} = ${rate.toFixed(4)} ${toCurrency}`;

    // Show last updated time with formatted timestamp
    const timeDisplay = lastUpdateFormatted || new Date().toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    rateInfo.querySelector('.last-updated').textContent = `Updated: ${timeDisplay}`;
  }
}

// Stats Bar Functions
async function updateStatsBar() {
  try {
    const settings = await chrome.storage.sync.get([
      'showTooltip',
      'highlightPrices',
      'autoConvertOnHover',
      'selectedTheme'
    ]);

    // Update active status
    const activeStatus = document.getElementById('activeStatus');
    if (activeStatus) {
      activeStatus.textContent = 'Active';
      activeStatus.style.color = '#51cf66';
    }

    // Update last update time
    const lastUpdate = document.getElementById('lastUpdate');
    if (lastUpdate) {
      lastUpdate.textContent = 'Just now';
    }

    // Update current theme
    const currentTheme = document.getElementById('currentTheme');
    if (currentTheme) {
      const themeNames = {
        'default': 'Default',
        'dark': 'Dark',
        'light': 'Light',
        'blue': 'Blue',
        'green': 'Green',
        'purple': 'Purple'
      };
      currentTheme.textContent = themeNames[settings.selectedTheme || 'default'] || 'Default';
    }

    // Update quick toggles
    const quickToggleTooltip = document.getElementById('quickToggleTooltip');
    const quickToggleHighlight = document.getElementById('quickToggleHighlight');
    const quickToggleAuto = document.getElementById('quickToggleAuto');

    if (quickToggleTooltip) {
      quickToggleTooltip.checked = settings.showTooltip !== undefined ? settings.showTooltip : true;
    }
    if (quickToggleHighlight) {
      quickToggleHighlight.checked = settings.highlightPrices !== undefined ? settings.highlightPrices : true;
    }
    if (quickToggleAuto) {
      quickToggleAuto.checked = settings.autoConvertOnHover || false;
    }
  } catch (error) {
    console.error('Failed to update stats bar:', error);
  }
}

// Favorites Functions
async function loadFavoriteCurrencies() {
  try {
    const result = await chrome.storage.sync.get('favoriteCurrencies');
    if (result.favoriteCurrencies && Array.isArray(result.favoriteCurrencies)) {
      favoriteCurrencies = result.favoriteCurrencies;
    }
  } catch (error) {
    console.error('Failed to load favorite currencies:', error);
  }
}

async function saveFavoriteCurrencies() {
  try {
    await chrome.storage.sync.set({ favoriteCurrencies });
  } catch (error) {
    console.error('Failed to save favorite currencies:', error);
  }
}

function updateFavoritesGrid() {
  const favoritesGrid = document.getElementById('favoritesGrid');
  if (!favoritesGrid) return;

  favoritesGrid.innerHTML = '';

  favoriteCurrencies.forEach(currency => {
    const btn = document.createElement('button');
    btn.className = 'favorite-btn';
    btn.dataset.currency = currency;
    btn.setAttribute('aria-label', `Convert to ${currency}`);
    btn.setAttribute('title', `Quick convert to ${currency}`);

    const symbol = getCurrencySymbol(currency);
    btn.innerHTML = `
      <span class="currency-symbol" aria-hidden="true">${symbol}</span>
      <span class="currency-code">${currency}</span>
    `;

    btn.addEventListener('click', () => {
      document.getElementById('toCurrency').value = currency;
      convertCurrency();
    });

    favoritesGrid.appendChild(btn);
  });
}

function getCurrencySymbol(currency) {
  const symbols = {
    'USD': '$', 'EUR': '€', 'GBP': '£', 'JPY': '¥', 'ILS': '₪',
    'CAD': 'C$', 'AUD': 'A$', 'CHF': '₣', 'CNY': '¥', 'INR': '₹',
    'RUB': '₽', 'KRW': '₩', 'BRL': 'R$', 'MXN': '$', 'SGD': 'S$',
    'HKD': 'HK$', 'NOK': 'kr', 'SEK': 'kr', 'DKK': 'kr', 'PLN': 'zł',
    'THB': '฿', 'TRY': '₺', 'ZAR': 'R', 'NZD': 'NZ$', 'TWD': 'NT$',
    'AED': 'د.إ', 'SAR': '﷼', 'PHP': '₱', 'VND': '₫', 'UAH': '₴',
    'EGP': '£', 'CZK': 'Kč', 'HUF': 'Ft', 'RON': 'lei', 'ISK': 'kr',
    'QAR': '﷼', 'KWD': 'د.ك'
  };
  return symbols[currency] || currency;
}

function editFavorites() {
  const newFavorites = prompt(
    'Enter your favorite currencies (comma-separated, e.g., USD,EUR,GBP,JPY):',
    favoriteCurrencies.join(',')
  );

  if (newFavorites !== null) {
    const currencies = newFavorites.split(',').map(c => c.trim().toUpperCase()).filter(c => c.length === 3);
    if (currencies.length > 0) {
      favoriteCurrencies = currencies.slice(0, 6); // Max 6 favorites
      saveFavoriteCurrencies();
      updateFavoritesGrid();
    }
  }
}

// Copy Function
async function copyResultToClipboard() {
  const toAmount = document.getElementById('toAmount').value;
  const toCurrency = document.getElementById('toCurrency').value;

  if (!toAmount) {
    return;
  }

  const textToCopy = `${toAmount} ${toCurrency}`;

  try {
    await navigator.clipboard.writeText(textToCopy);

    // Visual feedback
    const copyBtn = document.getElementById('copyBtn');
    const originalText = copyBtn.querySelector('.btn-text').textContent;
    copyBtn.querySelector('.btn-text').textContent = 'Copied!';
    copyBtn.querySelector('.btn-icon-symbol').textContent = '✓';

    setTimeout(() => {
      copyBtn.querySelector('.btn-text').textContent = originalText;
      copyBtn.querySelector('.btn-icon-symbol').textContent = '📋';
    }, 2000);
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
  }
}

// History Functions
async function loadConversionHistory() {
  try {
    const settings = await chrome.storage.sync.get(['saveConversionHistory', 'historyLimit']);
    if (settings.saveConversionHistory === false) {
      return;
    }

    const result = await chrome.storage.local.get('conversionHistory');
    if (result.conversionHistory && Array.isArray(result.conversionHistory)) {
      conversionHistory = result.conversionHistory;

      // Apply history limit
      const limit = settings.historyLimit === 'unlimited' ? Infinity : parseInt(settings.historyLimit) || 50;
      if (conversionHistory.length > limit) {
        conversionHistory = conversionHistory.slice(-limit);
        await chrome.storage.local.set({ conversionHistory });
      }
    }
  } catch (error) {
    console.error('Failed to load conversion history:', error);
  }
}

async function saveConversionToHistory(conversion) {
  try {
    const settings = await chrome.storage.sync.get(['saveConversionHistory', 'historyLimit']);
    if (settings.saveConversionHistory === false) {
      return;
    }

    conversionHistory.push(conversion);

    // Apply history limit
    const limit = settings.historyLimit === 'unlimited' ? Infinity : parseInt(settings.historyLimit) || 50;
    if (conversionHistory.length > limit) {
      conversionHistory = conversionHistory.slice(-limit);
    }

    await chrome.storage.local.set({ conversionHistory });
  } catch (error) {
    console.error('Failed to save conversion to history:', error);
  }
}

function showConversionHistory() {
  if (conversionHistory.length === 0) {
    alert('No conversion history yet. Start converting currencies to build your history!');
    return;
  }

  const recentHistory = conversionHistory.slice(-10).reverse();
  let historyText = 'Recent Conversions:\n\n';

  recentHistory.forEach((item, index) => {
    const date = new Date(item.timestamp);
    const timeStr = date.toLocaleTimeString();
    historyText += `${index + 1}. ${item.fromAmount.toFixed(2)} ${item.fromCurrency} → ${item.toAmount.toFixed(2)} ${item.toCurrency} (${timeStr})\n`;
  });

  alert(historyText);
}

// Rate Comparison Function
function showRateComparison() {
  const fromCurrency = document.getElementById('fromCurrency').value;
  const popularCurrencies = ['USD', 'EUR', 'GBP', 'JPY', 'ILS', 'CAD', 'AUD'];

  let comparisonText = `Exchange rates for 1 ${fromCurrency}:\n\n`;

  popularCurrencies.forEach(currency => {
    if (currency !== fromCurrency && exchangeRates[fromCurrency] && exchangeRates[currency]) {
      const rate = exchangeRates[currency] / exchangeRates[fromCurrency];
      const symbol = getCurrencySymbol(currency);
      comparisonText += `${symbol} ${currency}: ${rate.toFixed(4)}\n`;
    }
  });

  alert(comparisonText);
}

// Utility function for debouncing input
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}
// Listen for settings changes (theme, currency, etc.)
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === 'sync') {
    // Handle UI scale changes
    if (changes.uiScale) {
      const scale = changes.uiScale.newValue || 100;
      const scaleValue = scale / 100;
      const baseWidth = 360;
      const scaledWidth = Math.round(baseWidth * scaleValue);
      document.body.style.width = scaledWidth + 'px';
      document.body.style.minWidth = scaledWidth + 'px';
      document.body.style.maxWidth = scaledWidth + 'px';
    }

    // Handle default currency changes
    if (changes.defaultTargetCurrency) {
      document.getElementById('toCurrency').value = changes.defaultTargetCurrency.newValue;
      convertCurrency();
    }

    if (changes.defaultSourceCurrency) {
      document.getElementById('fromCurrency').value = changes.defaultSourceCurrency.newValue;
      convertCurrency();
    }

    // Handle popup visibility setting changes
    if (changes.showStatsBar) {
      const statsBar = document.getElementById('statsBar');
      if (statsBar) statsBar.style.display = changes.showStatsBar.newValue ? 'flex' : 'none';
    }
    if (changes.showFavorites) {
      const favoritesSection = document.getElementById('favoritesSection');
      if (favoritesSection) favoritesSection.style.display = changes.showFavorites.newValue ? 'block' : 'none';
    }
    if (changes.showActions) {
      const actionsSection = document.getElementById('actionsSection');
      if (actionsSection) actionsSection.style.display = changes.showActions.newValue ? 'flex' : 'none';
    }
    if (changes.showQuickToggles) {
      const quickTogglesSection = document.getElementById('quickTogglesSection');
      if (quickTogglesSection) quickTogglesSection.style.display = changes.showQuickToggles.newValue ? 'flex' : 'none';
    }
    if (changes.showFooterLinks) {
      const footerLinksSection = document.getElementById('footerLinksSection');
      if (footerLinksSection) footerLinksSection.style.display = changes.showFooterLinks.newValue ? 'flex' : 'none';
    }
  }
});
