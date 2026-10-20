// ⭐ DEBUG MODE: Read from settings and control ALL console output (ZERO spam when OFF)
let DEBUG_MODE = false;

// 🎯 Professional logging functions (only log when DEBUG_MODE is true)
const log = (...args) => {
  if (!DEBUG_MODE) return;
  console.log(`%c[CCP BG]%c ${new Date().toLocaleTimeString()}`,
    'color: #4f46e5; font-weight: bold;', 'color: #6b7280;', ...args);
};

const logError = (...args) => {
  if (!DEBUG_MODE) return;
  console.error(`%c[CCP BG ERROR]%c ${new Date().toLocaleTimeString()}`,
    'color: #ef4444; font-weight: bold;', 'color: #6b7280;', ...args);
};

const logWarn = (...args) => {
  if (!DEBUG_MODE) return;
  console.warn(`%c[CCP BG WARN]%c ${new Date().toLocaleTimeString()}`,
    'color: #f59e0b; font-weight: bold;', 'color: #6b7280;', ...args);
};

// Load debug mode setting on startup
chrome.storage.sync.get(['debugMode'], (result) => {
  DEBUG_MODE = result.debugMode || false;
  if (DEBUG_MODE) {
    log('🔧 Background script debug mode ENABLED');
  }
});

// Listen for settings changes to update DEBUG_MODE dynamically
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === 'sync' && changes.debugMode) {
    DEBUG_MODE = changes.debugMode.newValue || false;
    if (DEBUG_MODE) {
      log('🔧 Debug mode changed to:', DEBUG_MODE);
    }
  }
});

let exchangeRates = {};
let lastUpdateTime = 0;
const DEFAULT_UPDATE_INTERVAL_MINUTES = 1440; // 24 hours (1 day)
const MIN_UPDATE_INTERVAL_MINUTES = 30;
const RATE_REFRESH_ALARM = 'refreshExchangeRates';
const RETRY_AFTER_FAILURE_MS = 15 * 60 * 1000; // 15 minutes
let lastFailureTime = 0;
let pendingUpdate = null; // In-flight rate update shared by concurrent callers

// The service worker is stopped when idle, so in-memory rates are lost.
// Restore the last fetched rates from local storage on every startup.
const cachedRatesLoaded = (async () => {
  try {
    const cached = await chrome.storage.local.get(['exchangeRates', 'lastUpdate']);
    if (cached.exchangeRates && Object.keys(cached.exchangeRates).length > 0) {
      exchangeRates = cached.exchangeRates;
      lastUpdateTime = cached.lastUpdate || 0;
      log(`💾 Restored ${Object.keys(exchangeRates).length} cached rates`);
    }
  } catch (error) {
    logError('Failed to restore cached rates:', error);
  }
})();

// Read the user's refresh interval (stored in minutes)
async function getUpdateIntervalMinutes() {
  const { updateInterval } = await chrome.storage.sync.get(['updateInterval']);
  const minutes = parseInt(updateInterval, 10) || DEFAULT_UPDATE_INTERVAL_MINUTES;
  return Math.max(minutes, MIN_UPDATE_INTERVAL_MINUTES);
}

// Schedule periodic background refreshes that honor the user's interval
async function scheduleRateRefresh() {
  const periodInMinutes = await getUpdateIntervalMinutes();
  await chrome.alarms.create(RATE_REFRESH_ALARM, {
    delayInMinutes: periodInMinutes,
    periodInMinutes
  });
  log(`⏰ Rate refresh scheduled every ${periodInMinutes} minutes`);
}

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === RATE_REFRESH_ALARM) {
    updateExchangeRates();
  }
});

chrome.runtime.onStartup.addListener(() => {
  scheduleRateRefresh();
});

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName !== 'sync') return;

  if (changes.updateInterval) {
    scheduleRateRefresh();
  }

  // A different provider or key means the cached rates are no longer current
  if (changes.apiProvider || changes.apiKey) {
    lastUpdateTime = 0;
    updateExchangeRates(true);
  }
});

// ⭐ SMART DEFAULTS: Native HTML title tooltips ON by default
const DEFAULT_SETTINGS = {
  defaultTargetCurrency: 'ILS',
  highlightPrices: false,
  showInlineConversion: true,       // Native HTML title attribute ON by default ⭐
  replacePrice: false,
  apiProvider: 'exchangerate-api',
  apiKey: '',
  updateInterval: 1440,
  debugMode: false                  // Debug mode OFF by default
};

// Currency used in each region (ISO 3166 code) - for picking a sensible
// default target currency on first install
const REGION_CURRENCIES = {
  US: 'USD', PR: 'USD', EC: 'USD', SV: 'USD', PA: 'USD',
  GB: 'GBP', JP: 'JPY', IL: 'ILS', CA: 'CAD', AU: 'AUD', NZ: 'NZD',
  CH: 'CHF', LI: 'CHF', CN: 'CNY', IN: 'INR', KR: 'KRW', HK: 'HKD',
  SG: 'SGD', TH: 'THB', MY: 'MYR', ID: 'IDR', PH: 'PHP', VN: 'VND',
  TW: 'TWD', PK: 'PKR', BD: 'BDT', BR: 'BRL', MX: 'MXN', AR: 'ARS',
  CL: 'CLP', CO: 'COP', PE: 'PEN', UY: 'UYU', CZ: 'CZK', DK: 'DKK',
  HU: 'HUF', NO: 'NOK', PL: 'PLN', RU: 'RUB', SE: 'SEK', TR: 'TRY',
  UA: 'UAH', RO: 'RON', IS: 'ISK', AL: 'ALL', AE: 'AED', SA: 'SAR',
  QA: 'QAR', KW: 'KWD', BH: 'BHD', OM: 'OMR', JO: 'JOD', ZA: 'ZAR',
  EG: 'EGP', NG: 'NGN', KE: 'KES', GH: 'GHS', MA: 'MAD',
  // Euro area
  AT: 'EUR', BE: 'EUR', BG: 'EUR', CY: 'EUR', DE: 'EUR', EE: 'EUR',
  ES: 'EUR', FI: 'EUR', FR: 'EUR', GR: 'EUR', HR: 'EUR', IE: 'EUR',
  IT: 'EUR', LT: 'EUR', LU: 'EUR', LV: 'EUR', MT: 'EUR', NL: 'EUR',
  PT: 'EUR', SI: 'EUR', SK: 'EUR', MC: 'EUR', SM: 'EUR', VA: 'EUR',
  AD: 'EUR', ME: 'EUR', XK: 'EUR'
};

// Guess the user's currency from the browser language (e.g. "de-DE" -> EUR)
function getCurrencyFromLocale() {
  try {
    const language = (navigator.languages && navigator.languages[0]) || navigator.language;
    if (!language) return 'USD';
    // maximize() fills in the likely region for language-only tags ("ja" -> "ja-Jpan-JP")
    const region = new Intl.Locale(language).maximize().region;
    return REGION_CURRENCIES[region] || 'USD';
  } catch (error) {
    return 'USD';
  }
}

// Initialize extension
chrome.runtime.onInstalled.addListener(async (details) => {
  // Only fill in settings that are missing - never overwrite the user's
  // choices when the extension is updated or reloaded
  try {
    const defaults = { ...DEFAULT_SETTINGS };
    if (details.reason === 'install') {
      // New installs start with the currency of the browser's locale
      defaults.defaultTargetCurrency = getCurrencyFromLocale();
    }

    const existing = await chrome.storage.sync.get(Object.keys(defaults));
    const missing = {};
    for (const [key, value] of Object.entries(defaults)) {
      if (existing[key] === undefined) {
        missing[key] = value;
      }
    }
    if (Object.keys(missing).length > 0) {
      await chrome.storage.sync.set(missing);
      log(`⚙️ Applied ${Object.keys(missing).length} default settings (${details.reason})`);
    }
  } catch (error) {
    logError('Failed to apply default settings:', error);
  }

  // Users whose provider was removed in this version fall back to the default
  try {
    await migrateRemovedProvider();
  } catch (error) {
    logError('Failed to migrate API provider:', error);
  }

  // Always fetch fresh rates after install/update - rates cached by an older
  // version may come from a removed provider or an old parser
  updateExchangeRates(true);
  scheduleRateRefresh();

  // Create context menu for currency conversion
  createContextMenu();
});

// Create smart context menu that detects currencies
async function createContextMenu() {
  // Remove existing menus
  await chrome.contextMenus.removeAll();

  // Get default currency for menu
  const settings = await chrome.storage.sync.get(['defaultTargetCurrency']);
  const targetCurrency = settings.defaultTargetCurrency || 'ILS';
  const symbol = getSymbol(targetCurrency);

  // Create dynamic menu for converting prices
  chrome.contextMenus.create({
    id: 'convertCurrency',
    title: `💱 Convert to ${symbol}${targetCurrency}`,
    contexts: ['page', 'selection', 'link'], // Show on page, selection, and links
    visible: true,
    enabled: true
  });

  log('✅ Context menus created with default:', targetCurrency);
}

// Detect currency in selected text
function detectCurrencyInText(text) {
  if (!text || text.length > 100) return null;

  // Check for currency codes first (more reliable), after or before the amount
  const codeMatch = text.match(/(\d[\d,.\s]*)\s*(USD|EUR|GBP|JPY|INR|ILS|CAD|AUD|CHF|CNY|BRL|RUB|KRW|THB|TRY|ZAR|SEK|NOK|DKK|PLN|CZK|HUF|MXN|NZD|SGD|HKD|TWD|AED|SAR|PHP|VND|UAH|RON|ISK|KWD|QAR|EGP)\b/i) ||
    text.match(/()\b(USD|EUR|GBP|JPY|INR|ILS|CAD|AUD|CHF|CNY|BRL|RUB|KRW|THB|TRY|ZAR|SEK|NOK|DKK|PLN|CZK|HUF|MXN|NZD|SGD|HKD|TWD|AED|SAR|PHP|VND|UAH|RON|ISK|KWD|QAR|EGP)\s*\d/i);
  if (codeMatch) {
    return codeMatch[2].toUpperCase();
  }

  // Check for multi-char symbols first (before single $ which could match)
  if (text.includes('C$')) return 'CAD';
  if (text.includes('A$')) return 'AUD';
  if (text.includes('NZ$')) return 'NZD';
  if (text.includes('HK$')) return 'HKD';
  if (text.includes('S$')) return 'SGD';
  if (text.includes('R$')) return 'BRL';
  if (text.includes('NT$')) return 'TWD';

  // Check for other currency symbols, before or after the amount ("€12", "12,99 €")
  if (/€\s*\d|\d\s*€/.test(text)) return 'EUR';
  if (/£\s*\d|\d\s*£/.test(text)) return 'GBP';
  if (/₹\s*\d|\d\s*₹/.test(text)) return 'INR';
  if (/₪\s*\d|\d\s*₪/.test(text)) return 'ILS';
  if (/₽\s*\d|\d\s*₽/.test(text)) return 'RUB';
  if (/₩\s*\d|\d\s*₩/.test(text)) return 'KRW';
  if (/฿\s*\d|\d\s*฿/.test(text)) return 'THB';
  if (/₺\s*\d|\d\s*₺/.test(text)) return 'TRY';
  if (/₣\s*\d|\d\s*₣/.test(text)) return 'CHF';
  if (/₱\s*\d|\d\s*₱/.test(text)) return 'PHP';
  if (/₫\s*\d|\d\s*₫/.test(text)) return 'VND';
  if (/₴\s*\d|\d\s*₴/.test(text)) return 'UAH';

  // Symbols after number
  if (/\d\s*zł/.test(text)) return 'PLN';
  if (/\d\s*Kč/.test(text)) return 'CZK';
  if (/\d\s*Ft/.test(text)) return 'HUF';
  if (/\d\s*lei/.test(text)) return 'RON';
  if (/\d\s*kr/.test(text)) return 'SEK'; // Could be DKK, NOK, ISK

  // Arabic symbols
  if (text.includes('د.إ')) return 'AED';
  if (text.includes('د.ك')) return 'KWD';
  if (text.includes('﷼')) return 'SAR';

  // Generic dollar sign (check last, after multi-char variants)
  if (/\$\s*\d|\d\s*\$/.test(text)) return 'USD';
  if (/¥\s*\d|\d\s*¥/.test(text)) return 'JPY'; // Could be CNY

  return null;
}

// Extract amount from selected text
function extractAmountFromText(text) {
  // Check if text is valid
  if (!text || typeof text !== 'string') {
    return null;
  }

  // Remove all currency symbols and codes
  let cleaned = text;

  // Remove multi-char symbols first
  cleaned = cleaned.replace(/[CANHSR]\$/g, ''); // C$, A$, NZ$, HK$, S$, R$
  cleaned = cleaned.replace(/NT\$/g, '');
  cleaned = cleaned.replace(/د\.إ/g, '');
  cleaned = cleaned.replace(/د\.ك/g, '');

  // Remove single char symbols
  cleaned = cleaned.replace(/[€£¥₹₪₽₩฿₺₣₱₫₴$﷼]/g, '');

  // Remove symbols that come after number
  cleaned = cleaned.replace(/\s*(zł|Kč|Ft|lei|kr)\b/gi, '');

  // Remove currency codes
  cleaned = cleaned.replace(/\b(USD|EUR|GBP|JPY|INR|ILS|CAD|AUD|CHF|CNY|BRL|RUB|KRW|THB|TRY|ZAR|SEK|NOK|DKK|PLN|CZK|HUF|MXN|NZD|SGD|HKD|TWD|AED|SAR|PHP|VND|UAH|RON|ISK|KWD|QAR|EGP)\b/gi, '');

  // Remove extra text
  cleaned = cleaned.replace(/Turkish Lira|Polish Zloty|Israeli Shekel|Euro|Dollar|Pound|Rupee|Yen|Won|Ruble|Riyal|Dirham/gi, '');

  cleaned = cleaned.trim();

  // Handle different number formats
  // European format: 1.234,56 or just 12,99
  if (cleaned.match(/^\d{1,3}(?:\.\d{3})+,\d{2}$/)) {
    // 1.234,56 -> 1234.56
    cleaned = cleaned.replace(/\./g, '').replace(',', '.');
  }
  else if (cleaned.match(/^\d+,\d{1,2}$/)) {
    // 12,99 -> 12.99
    cleaned = cleaned.replace(',', '.');
  }
  // US format: 1,234.56
  else if (cleaned.match(/^\d{1,3}(?:,\d{3})+(?:\.\d{2})?$/)) {
    // 1,234.56 -> 1234.56
    cleaned = cleaned.replace(/,/g, '');
  }
  // Simple number with comma (assume thousands separator)
  else if (cleaned.match(/^\d{1,3},\d{3}$/)) {
    // 1,234 -> 1234
    cleaned = cleaned.replace(/,/g, '');
  }
  // Default: remove commas
  else {
    cleaned = cleaned.replace(/,/g, '');
  }

  // Remove any remaining non-numeric characters except dot
  cleaned = cleaned.replace(/[^\d.]/g, '');

  const amount = parseFloat(cleaned);
  return isNaN(amount) || amount <= 0 ? null : amount;
}

// Store info about detected price clicks
let lastClickedPriceInfo = null;

// Update context menu based on selection
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'updateContextMenu') {
    const selectedText = request.selectedText;
    const isDetectedPrice = request.isDetectedPrice || false;
    const clickedPrice = request.clickedPrice || null;

    log('📋 updateContextMenu message received:', {
      isDetectedPrice,
      selectedText: selectedText?.substring(0, 30),
      hasClickedPrice: !!clickedPrice
    });

    // ⭐ Store clicked price info for later use (with timestamp for freshness)
    if (isDetectedPrice && clickedPrice) {
      lastClickedPriceInfo = {
        tabId: sender.tab.id,
        timestamp: clickedPrice.timestamp || Date.now(),
        ...clickedPrice
      };
      log('✅ Stored clicked price info for tab', sender.tab.id);
      log('   Currency:', clickedPrice.source, 'Amount:', clickedPrice.amount);
    }

    const sourceCurrency = detectCurrencyInText(selectedText);

    chrome.storage.sync.get(['defaultTargetCurrency'], (settings) => {
      const targetCurrency = settings.defaultTargetCurrency || 'ILS';

      // ⭐ If detected price, always show menu (don't hide it)
      if (isDetectedPrice || (sourceCurrency && sourceCurrency !== targetCurrency)) {
        const symbol = getSymbol(targetCurrency);
        chrome.contextMenus.update('convertCurrency', {
          title: `💱 Convert to ${symbol}${targetCurrency}`,
          visible: true,
          enabled: true
        }, () => {
          if (chrome.runtime.lastError) {
            logWarn('Context menu update error:', chrome.runtime.lastError.message);
          } else {
            log('✅ Context menu updated:', `Convert to ${symbol}${targetCurrency}`);
          }
        });
      } else if (!isDetectedPrice) {
        // Only hide if NOT a detected price
        chrome.contextMenus.update('convertCurrency', {
          visible: false,
          enabled: false
        });
      }
      // Always answer so the sender's promise settles instead of failing
      // with "The message port closed before a response was received"
      sendResponse({ success: true });
    });
    return true; // Response is sent asynchronously
  }

  // Handle other message types from background.js message listener further down
  if (request.type === 'getExchangeRates') {
    updateExchangeRates(request.forceUpdate).then(async (updateResult) => {
      // Get formatted time from storage
      const cache = await chrome.storage.local.get(['lastUpdateFormatted', 'apiKeyWarning', 'rateProvider']);

      sendResponse({
        rates: exchangeRates,
        updateResult,
        lastUpdate: lastUpdateTime,
        lastUpdateFormatted: cache.lastUpdateFormatted || 'Unknown',
        apiKeyWarning: cache.apiKeyWarning,
        provider: cache.rateProvider || DEFAULT_PROVIDER
      });
    }).catch(async (error) => {
      const cache = await chrome.storage.local.get(['lastUpdateFormatted', 'rateProvider']);

      sendResponse({
        rates: exchangeRates,
        error: error.message,
        lastUpdate: lastUpdateTime,
        lastUpdateFormatted: cache.lastUpdateFormatted || 'Unknown',
        provider: cache.rateProvider || DEFAULT_PROVIDER
      });
    });
    return true; // Keep channel open for async response
  }

  if (request.type === 'convertCurrency') {
    const result = convertCurrency(request.amount, request.from, request.to);
    sendResponse({ result });
    return false; // Sync response
  }
});

// Get currency symbol
function getSymbol(code) {
  const symbols = {
    'USD': '$', 'EUR': '€', 'GBP': '£', 'JPY': '¥', 'INR': '₹',
    'ILS': '₪', 'RUB': '₽', 'KRW': '₩', 'THB': '฿', 'TRY': '₺',
    'CAD': 'C$', 'AUD': 'A$', 'NZD': 'NZ$', 'HKD': 'HK$', 'SGD': 'S$',
    'BRL': 'R$', 'ZAR': 'R', 'SEK': 'kr', 'NOK': 'kr', 'DKK': 'kr',
    'PLN': 'zł', 'CZK': 'Kč', 'HUF': 'Ft', 'RON': 'lei', 'TWD': 'NT$',
    'AED': 'د.إ', 'SAR': '﷼', 'PHP': '₱', 'VND': '₫', 'UAH': '₴',
    'CHF': '₣', 'MXN': '$', 'CNY': '¥', 'ISK': 'kr', 'KWD': 'د.ك',
    'QAR': '﷼', 'EGP': '£'
  };
  return symbols[code] || code;
}

// Handle context menu click
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  log('🖱️ Context menu clicked!');
  log('   Menu ID:', info.menuItemId);
  log('   Selection:', info.selectionText);
  log('   Tab:', tab.id);
  log('   lastClickedPriceInfo:', lastClickedPriceInfo ? 'EXISTS' : 'NULL');

  if (info.menuItemId === 'convertCurrency') {
    // ⭐ SMART FIX: Check for clicked detected price FIRST (before text selection)
    // Validate timestamp to ensure it's fresh (within 5 seconds)
    const isFreshClick = lastClickedPriceInfo &&
                         lastClickedPriceInfo.tabId === tab.id &&
                         lastClickedPriceInfo.timestamp &&
                         (Date.now() - lastClickedPriceInfo.timestamp) < 5000;

    log('   isFreshClick:', isFreshClick);

    if (isFreshClick) {
      log('✅ DETECTED PRICE CONVERSION MODE');
      log('   Converting:', lastClickedPriceInfo.amount, lastClickedPriceInfo.source);

      // Send message to content script to replace the price
      try {
        await chrome.tabs.sendMessage(tab.id, {
          type: 'convertClickedPrice'
        });
        log('✅ Sent convertClickedPrice message to content script');
      } catch (error) {
        logError('❌ Failed to send message to content script:', error);
      }

      // Clear the stored info
      lastClickedPriceInfo = null;
      return;
    } else if (lastClickedPriceInfo) {
      const age = Date.now() - (lastClickedPriceInfo.timestamp || 0);
      log('⚠️ Stale clicked price info, ignoring (age:', age, 'ms)');
      lastClickedPriceInfo = null;
    }

    // Regular text selection conversion OR page click
    log('📝 TEXT SELECTION/PAGE CLICK CONVERSION MODE');
    const selectedText = info.selectionText;
    log('🖱️ Selected text:', selectedText || '(none)');

    // If no selection, try to find price at click position or nearby
    if (!selectedText || !selectedText.trim()) {
      log('💡 No selection - attempting to find price at click position');

      // Send message to content script to find and convert price at cursor
      try {
        const result = await chrome.tabs.sendMessage(tab.id, {
          type: 'findAndConvertPriceAtPosition',
          x: info.pageX || 0,
          y: info.pageY || 0
        });

        if (result && result.success) {
          log('✅ Found and converted price at cursor position');
          return;
        } else {
          log('ℹ️ No price found at cursor position');
          return;
        }
      } catch (error) {
        // Silently handle connection errors (content script not available or no price found)
        if (error.message && error.message.includes('Receiving end does not exist')) {
          log('ℹ️ Content script not available on this page (may be restricted page or no prices)');
        } else {
          logWarn('⚠️ Could not find price at position:', error.message);
        }
        return;
      }
    }

    const sourceCurrency = detectCurrencyInText(selectedText);
    const amount = extractAmountFromText(selectedText);

    log('Detected currency:', sourceCurrency, 'Amount:', amount);

    if (!sourceCurrency) {
      logError('❌ Could not detect currency from:', selectedText);
      log('💡 TIP: Make sure to select text with currency symbol (e.g., $39.99, €25.00)');
      return;
    }

    if (!amount) {
      logError('❌ Could not extract amount from:', selectedText);
      log('💡 TIP: Make sure to select text with a valid number');
      return;
    }

    // Get settings
    const settings = await chrome.storage.sync.get(['defaultTargetCurrency']);
    const targetCurrency = settings.defaultTargetCurrency || 'ILS';

    log(`Converting ${amount} ${sourceCurrency} → ${targetCurrency}`);

    // Ensure we have rates
    if (Object.keys(exchangeRates).length === 0) {
      log('⏳ Loading exchange rates...');
      await updateExchangeRates();
    }

    // Convert
    if (exchangeRates[sourceCurrency] && exchangeRates[targetCurrency]) {
      const usdAmount = amount / exchangeRates[sourceCurrency];
      const converted = usdAmount * exchangeRates[targetCurrency];

      const targetSymbol = getSymbol(targetCurrency);
      const replacement = `${targetSymbol}${converted.toFixed(2)}`;

      log(`✅ Conversion: ${amount} ${sourceCurrency} = ${converted.toFixed(2)} ${targetCurrency}`);

      // Send message to content script to replace text
      try {
        await chrome.tabs.sendMessage(tab.id, {
          type: 'replaceSelectedText',
          originalText: selectedText,
          replacement: replacement,
          sourceCurrency: sourceCurrency,
          targetCurrency: targetCurrency,
          sourceAmount: amount,
          targetAmount: converted.toFixed(2)
        });
        log('✅ Message sent to content script');
      } catch (error) {
        logError('❌ Failed to send message to content script:', error);
      }
    } else {
      logError('❌ Exchange rates not available for:', sourceCurrency, 'or', targetCurrency);
      log('Available rates:', Object.keys(exchangeRates));
    }
  }
});

// extractPrice() function removed - no longer used (dead code cleanup 2025-12-15)


// API Provider Information
// Every provider returns a map of "units of currency per 1 USD".
// Providers that use a different base (EUR, ILS) are rebased to USD.
const DEFAULT_PROVIDER = 'exchangerate-api';

const API_PROVIDERS = {
  'exchangerate-api': {
    name: 'ExchangeRate-API',
    requiresKey: false,
    buildUrl: () => 'https://open.er-api.com/v6/latest/USD',
    parse: (data) => {
      if (data.result !== 'success') {
        throw new Error(`ExchangeRate-API error: ${data['error-type'] || 'unknown error'}`);
      }
      return data.rates;
    }
  },
  'ecb': {
    name: 'European Central Bank (via Frankfurter)',
    requiresKey: false,
    buildUrl: () => 'https://api.frankfurter.dev/v1/latest?base=USD',
    parse: (data) => {
      if (!data.rates) {
        throw new Error('Frankfurter API returned no rates');
      }
      // The base currency is not included in the rates object
      return { ...data.rates, [data.base || 'USD']: 1 };
    }
  },
  'bank-of-israel': {
    name: 'Bank of Israel',
    requiresKey: false,
    buildUrl: () => 'https://boi.org.il/PublicApi/GetExchangeRates',
    parse: (data) => {
      if (!Array.isArray(data.exchangeRates) || data.exchangeRates.length === 0) {
        throw new Error('Bank of Israel API returned no rates');
      }
      // Each entry is "ILS per <unit> of <key>"; convert to "<key> per 1 ILS"
      const rates = { ILS: 1 };
      data.exchangeRates.forEach(entry => {
        const ilsPerUnit = Number(entry.currentExchangeRate);
        const unit = Number(entry.unit) || 1;
        if (entry.key && ilsPerUnit > 0) {
          rates[entry.key] = unit / ilsPerUnit;
        }
      });
      return rates;
    }
  },
  'currencyapi': {
    name: 'CurrencyAPI',
    requiresKey: true,
    signupUrl: 'https://app.currencyapi.com/register',
    guide: 'Free plan available with limited requests. Sign up at currencyapi.com and copy your API key.',
    buildUrl: (apiKey) => `https://api.currencyapi.com/v3/latest?apikey=${encodeURIComponent(apiKey)}&base_currency=USD`,
    parse: (data) => {
      if (!data.data) {
        throw new Error(`CurrencyAPI error: ${data.message || 'no data returned'}`);
      }
      // Values are objects: { code: 'EUR', value: 0.92 }
      const rates = {};
      Object.entries(data.data).forEach(([code, entry]) => {
        rates[code] = entry && entry.value;
      });
      return rates;
    }
  },
  'fixer': {
    name: 'Fixer.io',
    requiresKey: true,
    signupUrl: 'https://fixer.io/signup/free',
    guide: 'Free plan available with limited requests (EUR base, rebased to USD automatically). Sign up at fixer.io and copy your access key.',
    buildUrl: (apiKey) => `https://data.fixer.io/api/latest?access_key=${encodeURIComponent(apiKey)}`,
    parse: (data) => {
      if (!data.success) {
        throw new Error(`Fixer.io error: ${data.error?.info || data.error?.type || 'unknown error'}`);
      }
      return { ...data.rates, [data.base || 'EUR']: 1 };
    }
  },
  'currencylayer': {
    name: 'CurrencyLayer',
    requiresKey: true,
    signupUrl: 'https://currencylayer.com/signup/free',
    guide: 'Free plan available with limited requests. Sign up at currencylayer.com and copy your access key.',
    buildUrl: (apiKey) => `https://api.currencylayer.com/live?access_key=${encodeURIComponent(apiKey)}`,
    parse: (data) => {
      if (!data.success) {
        throw new Error(`CurrencyLayer error: ${data.error?.info || data.error?.type || 'unknown error'}`);
      }
      // Quotes are keyed as <source><target>, e.g. USDEUR
      const source = data.source || 'USD';
      const rates = { [source]: 1 };
      Object.entries(data.quotes || {}).forEach(([pair, value]) => {
        if (pair.startsWith(source)) {
          rates[pair.substring(source.length)] = value;
        }
      });
      return rates;
    }
  },
  'openexchangerates': {
    name: 'Open Exchange Rates',
    requiresKey: true,
    signupUrl: 'https://openexchangerates.org/signup/free',
    guide: 'Free plan available with limited requests (1,000/month). Sign up at openexchangerates.org and copy your App ID.',
    buildUrl: (apiKey) => `https://openexchangerates.org/api/latest.json?app_id=${encodeURIComponent(apiKey)}`,
    parse: (data) => {
      if (data.error || !data.rates) {
        throw new Error(`Open Exchange Rates error: ${data.description || data.message || 'no rates returned'}`);
      }
      return { ...data.rates, [data.base || 'USD']: 1 };
    }
  }
};

// Resolve a stored provider id to a supported one
function resolveProviderId(provider) {
  return API_PROVIDERS[provider] ? provider : DEFAULT_PROVIDER;
}

// Move users whose stored provider was removed (e.g. the dead
// 'exchangerates-api' endpoint or 'xe') to the default provider
async function migrateRemovedProvider() {
  const { apiProvider } = await chrome.storage.sync.get(['apiProvider']);
  if (apiProvider && !API_PROVIDERS[apiProvider]) {
    await chrome.storage.sync.set({ apiProvider: DEFAULT_PROVIDER });
    log(`🔀 Provider "${apiProvider}" is no longer available, switched to ${DEFAULT_PROVIDER}`);
  }
}

// Rebase any rate table to "units per 1 USD" and drop invalid values
function normalizeToUSD(rawRates) {
  const usdRate = Number(rawRates && rawRates.USD);
  if (!(usdRate > 0) || !isFinite(usdRate)) {
    throw new Error('Provider response does not include a USD rate');
  }

  const rates = {};
  Object.entries(rawRates).forEach(([code, value]) => {
    const rate = Number(value) / usdRate;
    if (/^[A-Z]{3,5}$/.test(code) && rate > 0 && isFinite(rate)) {
      rates[code] = rate;
    }
  });
  rates.USD = 1;
  return rates;
}

// Fetch JSON and turn HTTP errors into readable messages
async function fetchJson(url) {
  const response = await fetch(url);
  let data = null;
  try {
    data = await response.json();
  } catch (parseError) {
    // Non-JSON response (HTML error page, redirect, etc.)
  }

  if (!response.ok) {
    const detail = data && (data.error?.info || data.error?.message || data.description || data.message);
    throw new Error(`API request failed: ${response.status}${detail ? ` - ${detail}` : ''}`);
  }
  if (!data) {
    throw new Error('API returned an invalid (non-JSON) response');
  }
  return data;
}

// Fetch cryptocurrency rates from CoinGecko API
async function fetchCryptoRates() {
  try {
    const cryptoIds = [
      'bitcoin', 'ethereum', 'tether', 'usd-coin', 'binancecoin',
      'ripple', 'cardano', 'solana', 'dogecoin', 'polkadot',
      'matic-network', 'litecoin', 'bitcoin-cash', 'chainlink',
      'stellar', 'cosmos'
    ];

    const url = `https://api.coingecko.com/api/v3/simple/price?ids=${cryptoIds.join(',')}&vs_currencies=usd`;
    log(`🔄 Fetching crypto rates from CoinGecko...`);

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`);
    }

    const data = await response.json();
    log(`📊 CoinGecko response:`, data);

    // Convert to our format: rates are "how many crypto per 1 USD"
    // Example: if 1 BTC = $45,000 USD, then rate = 1/45000 = 0.0000222 BTC per USD
    const cryptoRates = {
      'BTC': 1 / (data.bitcoin?.usd || 0),
      'ETH': 1 / (data.ethereum?.usd || 0),
      'USDT': 1 / (data.tether?.usd || 1),
      'USDC': 1 / (data['usd-coin']?.usd || 1),
      'BNB': 1 / (data.binancecoin?.usd || 0),
      'XRP': 1 / (data.ripple?.usd || 0),
      'ADA': 1 / (data.cardano?.usd || 0),
      'SOL': 1 / (data.solana?.usd || 0),
      'DOGE': 1 / (data.dogecoin?.usd || 0),
      'DOT': 1 / (data.polkadot?.usd || 0),
      'MATIC': 1 / (data['matic-network']?.usd || 0),
      'LTC': 1 / (data.litecoin?.usd || 0),
      'BCH': 1 / (data['bitcoin-cash']?.usd || 0),
      'LINK': 1 / (data.chainlink?.usd || 0),
      'XLM': 1 / (data.stellar?.usd || 0),
      'ATOM': 1 / (data.cosmos?.usd || 0)
    };

    // Filter out invalid rates (0 or infinite)
    const validRates = {};
    Object.entries(cryptoRates).forEach(([key, value]) => {
      if (value > 0 && isFinite(value)) {
        validRates[key] = value;
      }
    });

    log(`✅ Valid crypto rates:`, validRates);
    return validRates;
  } catch (error) {
    logError('Failed to fetch cryptocurrency rates:', error);
    throw error;
  }
}

// Update exchange rates
async function updateExchangeRates(forceUpdate = false) {
  // Make sure rates cached by a previous service worker instance are loaded
  await cachedRatesLoaded;

  const now = Date.now();
  const intervalMs = (await getUpdateIntervalMinutes()) * 60 * 1000;
  const hasRates = Object.keys(exchangeRates).length > 0;
  if (!forceUpdate && hasRates && now - lastUpdateTime < intervalMs) {
    return { success: true, cached: true };
  }
  // After a failed request, keep serving cached rates for a while instead of
  // retrying on every page load
  if (!forceUpdate && hasRates && now - lastFailureTime < RETRY_AFTER_FAILURE_MS) {
    return { success: false, cached: true, error: 'Waiting before retrying the rate provider' };
  }

  // Share one network request between concurrent callers (e.g. many tabs loading)
  if (!pendingUpdate) {
    pendingUpdate = fetchAndStoreRates(now).finally(() => {
      pendingUpdate = null;
    });
  }
  return pendingUpdate;
}

// Fetch fresh rates from the selected provider and persist them
async function fetchAndStoreRates(now) {
  try {
    // Get user settings
    const settings = await chrome.storage.sync.get(['apiProvider', 'apiKey']);
    let provider = resolveProviderId(settings.apiProvider);
    const apiKey = (settings.apiKey || '').trim();

    // Check if API requires key but none provided - auto-fallback to free API
    const providerInfo = API_PROVIDERS[provider];
    if (providerInfo.requiresKey && !apiKey) {
      logWarn(`⚠️ ${providerInfo.name} requires an API key. Falling back to free API.`);
      provider = DEFAULT_PROVIDER; // Fallback to free API

      // Store the fallback info for user notification
      await chrome.storage.local.set({
        apiKeyWarning: {
          provider: settings.apiProvider,
          message: `${providerInfo.name} requires an API key. Using free API instead.`,
          guide: providerInfo.guide,
          signupUrl: providerInfo.signupUrl,
          timestamp: now
        }
      });
    }

    const activeProvider = API_PROVIDERS[provider];
    const data = await fetchJson(activeProvider.buildUrl(apiKey));

    // Parse the provider-specific format (throws on API errors) and rebase to USD
    const fiatRates = normalizeToUSD(activeProvider.parse(data));

    // Fetch cryptocurrency rates (BTC, ETH, etc.) from CoinGecko
    try {
      const cryptoRates = await fetchCryptoRates();
      // Merge crypto rates with fiat rates
      Object.assign(fiatRates, cryptoRates);
      log('✅ Successfully added cryptocurrency rates:', Object.keys(cryptoRates).join(', '));
    } catch (cryptoError) {
      logWarn('⚠️ Failed to fetch crypto rates:', cryptoError.message);
      // Continue with fiat rates only
    }

    exchangeRates = fiatRates;
    lastUpdateTime = now;

    // Format last update time
    const updateDate = new Date(now);
    const formattedTime = updateDate.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    // Cache rates with metadata
    await chrome.storage.local.set({
      exchangeRates: exchangeRates,
      lastUpdate: now,
      lastUpdateFormatted: formattedTime,
      rateProvider: provider,
      rateCount: Object.keys(exchangeRates).length
    });

    log(`✅ Updated ${Object.keys(exchangeRates).length} exchange rates from ${provider} at ${formattedTime}`);
    return {
      success: true,
      provider,
      count: Object.keys(exchangeRates).length,
      lastUpdate: formattedTime
    };

  } catch (error) {
    logError('Failed to update exchange rates:', error);
    lastFailureTime = now;

    // Try to load cached rates as fallback
    try {
      const cached = await chrome.storage.local.get(['exchangeRates', 'lastUpdate', 'rateProvider']);
      if (cached.exchangeRates && Object.keys(cached.exchangeRates).length > 0) {
        exchangeRates = cached.exchangeRates;
        lastUpdateTime = cached.lastUpdate || 0;

        log(`Loaded cached rates from ${cached.rateProvider || 'unknown provider'}`);
        return { success: false, error: error.message, cached: true };
      }
    } catch (cacheError) {
      logError('Failed to load cached rates:', cacheError);
    }

    return { success: false, error: error.message, cached: false };
  }
}

// Convert between currencies
function convertCurrency(amount, fromCurrency, toCurrency) {
  // Validate inputs
  if (!amount || isNaN(amount) || amount <= 0) {
    return null;
  }

  if (!fromCurrency || !toCurrency ||
      !exchangeRates[fromCurrency] || !exchangeRates[toCurrency]) {
    return null;
  }

  try {
    // Convert to USD first, then to target currency
    const usdAmount = amount / exchangeRates[fromCurrency];
    const result = usdAmount * exchangeRates[toCurrency];

    // Validate result
    if (isNaN(result) || !isFinite(result)) {
      return null;
    }

    return result;
  } catch (error) {
    logError('Currency conversion error:', error);
    return null;
  }
}
