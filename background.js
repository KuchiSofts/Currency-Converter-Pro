let exchangeRates = {};
let lastUpdateTime = 0;
const UPDATE_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours (1 day)

// Initialize extension
chrome.runtime.onInstalled.addListener(() => {

  // Set default settings
  chrome.storage.sync.set({
    defaultTargetCurrency: 'ILS',
    showTooltip: true,
    highlightPrices: false,
    autoConvertOnHover: true,
    showInlineConversion: true,
    replacePrice: false,
    apiProvider: 'exchangerate-api',
    apiKey: '',
    updateInterval: 1440
  });

  updateExchangeRates();

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

  console.log('✅ Context menus created with default:', targetCurrency);
}

// Detect currency in selected text
function detectCurrencyInText(text) {
  if (!text || text.length > 100) return null;

  // Check for currency codes first (more reliable)
  const codeMatch = text.match(/(\d[\d,.\s]+)\s*(USD|EUR|GBP|JPY|INR|ILS|CAD|AUD|CHF|CNY|BRL|RUB|KRW|THB|TRY|ZAR|SEK|NOK|DKK|PLN|CZK|HUF|MXN|NZD|SGD|HKD|TWD|AED|SAR|PHP|VND|UAH|RON|ISK|KWD|QAR|EGP)\b/i);
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

  // Check for other currency symbols
  if (/€\s*\d/.test(text)) return 'EUR';
  if (/£\s*\d/.test(text)) return 'GBP';
  if (/₹\s*\d/.test(text)) return 'INR';
  if (/₪\s*\d/.test(text)) return 'ILS';
  if (/₽\s*\d/.test(text)) return 'RUB';
  if (/₩\s*\d/.test(text)) return 'KRW';
  if (/฿\s*\d/.test(text)) return 'THB';
  if (/₺\s*\d/.test(text)) return 'TRY';
  if (/₣\s*\d/.test(text)) return 'CHF';
  if (/₱\s*\d/.test(text)) return 'PHP';
  if (/₫\s*\d/.test(text)) return 'VND';
  if (/₴\s*\d/.test(text)) return 'UAH';

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
  if (/\$\s*\d/.test(text)) return 'USD';
  if (/¥\s*\d/.test(text)) return 'JPY'; // Could be CNY

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

    console.log('📋 updateContextMenu message received:', {
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
      console.log('✅ Stored clicked price info for tab', sender.tab.id);
      console.log('   Currency:', clickedPrice.source, 'Amount:', clickedPrice.amount);
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
            console.warn('Context menu update error:', chrome.runtime.lastError.message);
          } else {
            console.log('✅ Context menu updated:', `Convert to ${symbol}${targetCurrency}`);
          }
        });
      } else if (!isDetectedPrice) {
        // Only hide if NOT a detected price
        chrome.contextMenus.update('convertCurrency', {
          visible: false,
          enabled: false
        });
      }
    });
    // Return true to indicate async response (even though we don't send one)
    return true;
  }

  // Handle other message types from background.js message listener further down
  if (request.type === 'getExchangeRates') {
    updateExchangeRates(request.forceUpdate).then(async (updateResult) => {
      // Get formatted time from storage
      const cache = await chrome.storage.local.get(['lastUpdateFormatted', 'apiKeyWarning']);

      sendResponse({
        rates: exchangeRates,
        updateResult,
        lastUpdate: lastUpdateTime,
        lastUpdateFormatted: cache.lastUpdateFormatted || 'Unknown',
        apiKeyWarning: cache.apiKeyWarning
      });
    }).catch(async (error) => {
      const cache = await chrome.storage.local.get(['lastUpdateFormatted']);

      sendResponse({
        rates: exchangeRates,
        error: error.message,
        lastUpdate: lastUpdateTime,
        lastUpdateFormatted: cache.lastUpdateFormatted || 'Unknown'
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
  console.log('🖱️ Context menu clicked!');
  console.log('   Menu ID:', info.menuItemId);
  console.log('   Selection:', info.selectionText);
  console.log('   Tab:', tab.id);
  console.log('   lastClickedPriceInfo:', lastClickedPriceInfo ? 'EXISTS' : 'NULL');

  if (info.menuItemId === 'convertCurrency') {
    // ⭐ SMART FIX: Check for clicked detected price FIRST (before text selection)
    // Validate timestamp to ensure it's fresh (within 5 seconds)
    const isFreshClick = lastClickedPriceInfo &&
                         lastClickedPriceInfo.tabId === tab.id &&
                         lastClickedPriceInfo.timestamp &&
                         (Date.now() - lastClickedPriceInfo.timestamp) < 5000;

    console.log('   isFreshClick:', isFreshClick);

    if (isFreshClick) {
      console.log('✅ DETECTED PRICE CONVERSION MODE');
      console.log('   Converting:', lastClickedPriceInfo.amount, lastClickedPriceInfo.source);

      // Send message to content script to replace the price
      try {
        await chrome.tabs.sendMessage(tab.id, {
          type: 'convertClickedPrice'
        });
        console.log('✅ Sent convertClickedPrice message to content script');
      } catch (error) {
        console.error('❌ Failed to send message to content script:', error);
      }

      // Clear the stored info
      lastClickedPriceInfo = null;
      return;
    } else if (lastClickedPriceInfo) {
      const age = Date.now() - (lastClickedPriceInfo.timestamp || 0);
      console.log('⚠️ Stale clicked price info, ignoring (age:', age, 'ms)');
      lastClickedPriceInfo = null;
    }

    // Regular text selection conversion OR page click
    console.log('📝 TEXT SELECTION/PAGE CLICK CONVERSION MODE');
    const selectedText = info.selectionText;
    console.log('🖱️ Selected text:', selectedText || '(none)');

    // If no selection, try to find price at click position or nearby
    if (!selectedText || !selectedText.trim()) {
      console.log('💡 No selection - attempting to find price at click position');

      // Send message to content script to find and convert price at cursor
      try {
        const result = await chrome.tabs.sendMessage(tab.id, {
          type: 'findAndConvertPriceAtPosition',
          x: info.pageX || 0,
          y: info.pageY || 0
        });

        if (result && result.success) {
          console.log('✅ Found and converted price at cursor position');
          return;
        } else {
          console.log('ℹ️ No price found at cursor position');
          return;
        }
      } catch (error) {
        // Silently handle connection errors (content script not available or no price found)
        if (error.message && error.message.includes('Receiving end does not exist')) {
          console.log('ℹ️ Content script not available on this page (may be restricted page or no prices)');
        } else {
          console.warn('⚠️ Could not find price at position:', error.message);
        }
        return;
      }
    }

    const sourceCurrency = detectCurrencyInText(selectedText);
    const amount = extractAmountFromText(selectedText);

    console.log('Detected currency:', sourceCurrency, 'Amount:', amount);

    if (!sourceCurrency) {
      console.error('❌ Could not detect currency from:', selectedText);
      console.log('💡 TIP: Make sure to select text with currency symbol (e.g., $39.99, €25.00)');
      return;
    }

    if (!amount) {
      console.error('❌ Could not extract amount from:', selectedText);
      console.log('💡 TIP: Make sure to select text with a valid number');
      return;
    }

    // Get settings
    const settings = await chrome.storage.sync.get(['defaultTargetCurrency']);
    const targetCurrency = settings.defaultTargetCurrency || 'ILS';

    console.log(`Converting ${amount} ${sourceCurrency} → ${targetCurrency}`);

    // Ensure we have rates
    if (Object.keys(exchangeRates).length === 0) {
      console.log('⏳ Loading exchange rates...');
      await updateExchangeRates(true);
    }

    // Convert
    if (exchangeRates[sourceCurrency] && exchangeRates[targetCurrency]) {
      const usdAmount = amount / exchangeRates[sourceCurrency];
      const converted = usdAmount * exchangeRates[targetCurrency];

      const targetSymbol = getSymbol(targetCurrency);
      const replacement = `${targetSymbol}${converted.toFixed(2)}`;

      console.log(`✅ Conversion: ${amount} ${sourceCurrency} = ${converted.toFixed(2)} ${targetCurrency}`);

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
        console.log('✅ Message sent to content script');
      } catch (error) {
        console.error('❌ Failed to send message to content script:', error);
      }
    } else {
      console.error('❌ Exchange rates not available for:', sourceCurrency, 'or', targetCurrency);
      console.log('Available rates:', Object.keys(exchangeRates));
    }
  }
});

// extractPrice() function removed - no longer used (dead code cleanup 2025-12-15)


// API Provider Information
const API_PROVIDERS = {
  'exchangerate-api': {
    name: 'ExchangeRate-API',
    free: true,
    requiresKey: false,
    url: 'https://api.exchangerate-api.com/v4/latest/USD'
  },
  'exchangerates-api': {
    name: 'ExchangeRates API',
    free: true,
    requiresKey: false,
    url: 'https://api.exchangerates.host/latest?base=USD'
  },
  'ecb': {
    name: 'European Central Bank',
    free: true,
    requiresKey: false,
    url: 'https://api.exchangerate.host/latest?base=USD&source=ecb'
  },
  'fixer': {
    name: 'Fixer.io',
    free: false,
    requiresKey: true,
    signupUrl: 'https://fixer.io/product',
    guide: 'Sign up at fixer.io, get your API key from dashboard'
  },
  'currencylayer': {
    name: 'CurrencyLayer',
    free: false,
    requiresKey: true,
    signupUrl: 'https://currencylayer.com/product',
    guide: 'Sign up at currencylayer.com, get your access key from dashboard'
  },
  'openexchangerates': {
    name: 'Open Exchange Rates',
    free: 'limited',
    requiresKey: true,
    signupUrl: 'https://openexchangerates.org/signup/free',
    guide: 'Free tier: 1000 requests/month. Sign up at openexchangerates.org'
  }
};

// Update exchange rates
async function updateExchangeRates(forceUpdate = false) {
  const now = Date.now();
  if (!forceUpdate && now - lastUpdateTime < UPDATE_INTERVAL && Object.keys(exchangeRates).length > 0) {
    return { success: true, cached: true };
  }

  try {
    // Get user settings
    const settings = await chrome.storage.sync.get(['apiProvider', 'apiKey']);
    let provider = settings.apiProvider || 'exchangerate-api';
    const apiKey = settings.apiKey;

    // Check if API requires key but none provided - auto-fallback to free API
    const providerInfo = API_PROVIDERS[provider];
    if (providerInfo && providerInfo.requiresKey && !apiKey) {
      console.warn(`⚠️ ${providerInfo.name} requires an API key. Falling back to free API.`);
      provider = 'exchangerate-api'; // Fallback to free API

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

    let apiUrl;
    let headers = {};

    // Choose API based on settings
    switch (provider) {
      case 'bank-of-israel':
        // Use Bank of Israel rates for ILS accuracy
        apiUrl = 'https://www.boi.org.il/currency.xml';
        break;
      case 'ecb':
        // European Central Bank - reliable and free
        apiUrl = 'https://api.exchangerate.host/latest?base=USD&source=ecb';
        break;
      case 'currencyapi':
        // CurrencyAPI - good free tier
        apiUrl = 'https://api.currencyapi.com/v3/latest?base_currency=USD';
        break;
      case 'exchangerates-api':
        // Fast and reliable
        apiUrl = 'https://api.exchangerates.host/latest?base=USD';
        break;
      case 'fixer':
        if (!settings.apiKey) {
          throw new Error('API key required for Fixer.io');
        }
        apiUrl = `https://api.fixer.io/latest?access_key=${settings.apiKey}`;
        break;
      case 'currencylayer':
        if (!settings.apiKey) {
          throw new Error('API key required for CurrencyLayer');
        }
        apiUrl = `https://api.currencylayer.com/live?access_key=${settings.apiKey}`;
        break;
      case 'openexchangerates':
        if (!settings.apiKey) {
          throw new Error('API key required for Open Exchange Rates');
        }
        apiUrl = `https://openexchangerates.org/api/latest.json?app_id=${settings.apiKey}`;
        break;
      case 'xe':
        if (!settings.apiKey) {
          throw new Error('API key required for XE Currency');
        }
        apiUrl = `https://api.xe.com/v1/convert_from.json/?from=USD&to=*&amount=1&key=${settings.apiKey}`;
        break;
      default: // exchangerate-api
        apiUrl = 'https://api.exchangerate-api.com/v4/latest/USD';
        break;
    }

    const response = await fetch(apiUrl, { headers });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    // Handle different API response formats
    switch (provider) {
      case 'bank-of-israel':
        // Parse Bank of Israel SDMX format
        exchangeRates = parseBankOfIsraelData(data);
        break;
      case 'ecb':
      case 'exchangerates-api':
        // Standard format with rates object
        exchangeRates = data.rates || {};
        break;
      case 'currencyapi':
        // CurrencyAPI format
        exchangeRates = data.data || {};
        break;
      case 'currencylayer':
        if (!data.success) {
          throw new Error(data.error?.info || 'CurrencyLayer API error');
        }
        exchangeRates = data.quotes;
        // Convert quotes format (USDUSD, USDEUR) to simple format
        const convertedRates = {};
        Object.keys(exchangeRates).forEach(key => {
          const currency = key.substring(3); // Remove USD prefix
          convertedRates[currency] = exchangeRates[key];
        });
        exchangeRates = convertedRates;
        break;
      case 'fixer':
        if (!data.success) {
          throw new Error(data.error?.info || 'Fixer.io API error');
        }
        exchangeRates = data.rates;
        break;
      case 'openexchangerates':
        exchangeRates = data.rates || {};
        break;
      case 'xe':
        // Parse XE format
        exchangeRates = parseXEData(data);
        break;
      default:
        // ExchangeRate-API format
        exchangeRates = data.rates || {};
        break;
    }

    exchangeRates['USD'] = 1; // Ensure USD is included as base
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

    console.log(`✅ Updated ${Object.keys(exchangeRates).length} exchange rates from ${provider} at ${formattedTime}`);
    return {
      success: true,
      provider,
      count: Object.keys(exchangeRates).length,
      lastUpdate: formattedTime
    };

  } catch (error) {
    console.error('Failed to update exchange rates:', error);

    // Try to load cached rates as fallback
    try {
      const cached = await chrome.storage.local.get(['exchangeRates', 'lastUpdate', 'rateProvider']);
      if (cached.exchangeRates && Object.keys(cached.exchangeRates).length > 0) {
        exchangeRates = cached.exchangeRates;
        lastUpdateTime = cached.lastUpdate || 0;

        console.log(`Loaded cached rates from ${cached.rateProvider || 'unknown provider'}`);
        return { success: false, error: error.message, cached: true };
      }
    } catch (cacheError) {
      console.error('Failed to load cached rates:', cacheError);
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
    console.error('Currency conversion error:', error);
    return null;
  }
}

// Parser functions for different API formats
function parseBankOfIsraelData(data) {
  // Simplified Bank of Israel parser - would need actual API structure
  const rates = { USD: 1, ILS: 3.71 }; // Fallback rates
  try {
    // Parse SDMX format if available
    if (data.dataSets && data.dataSets[0] && data.dataSets[0].series) {
      // Process Bank of Israel specific format
      console.log('Bank of Israel data format detected');
    }
  } catch (error) {
    console.error('Failed to parse Bank of Israel data:', error);
  }
  return rates;
}

function parseXEData(data) {
  // Parse XE Currency API format
  const rates = { USD: 1 };
  try {
    if (data.to) {
      data.to.forEach(rate => {
        rates[rate.quotecurrency] = rate.mid;
      });
    }
  } catch (error) {
    console.error('Failed to parse XE data:', error);
  }
  return rates;
}

// Message listeners consolidated above (line 105)
// This duplicate listener has been removed to prevent conflicts