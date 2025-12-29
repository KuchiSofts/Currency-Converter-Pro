// Multi-Currency Price Converter - ENHANCED VERSION
// 🔧 DEBUG MODE - Set to true to see ALL logs (errors, warnings, debug info)
// Set to false for ZERO console output (super quiet mode)
const DEBUG_MODE = true;

// ⭐ SUPER SMART: All logging controlled by DEBUG_MODE
const log = (...args) => { if (DEBUG_MODE) console.log(...args); };
const logError = (...args) => { if (DEBUG_MODE) console.error(...args); };
const logWarn = (...args) => { if (DEBUG_MODE) console.warn(...args); };

// Initial load message - only shows when DEBUG_MODE = true
log('💱 Currency Converter Pro v3.0.0 loaded');

let exchangeRates = { USD: 1, ILS: 3.7, EUR: 1.1, GBP: 0.8 };
let settings = {
  defaultTargetCurrency: 'ILS',
  showTooltip: true,
  highlightPrices: false,
  autoConvertOnHover: true,
  showInlineConversion: true,
  replacePrice: false
};

// Global cache of processed elements (persists across mutation events)
let processedElements = new WeakSet(); // Changed to 'let' to allow reset on manual conversion
let conversionCache = new Map(); // Cache conversions by text

// Current theme
let currentTheme = 'default';

// Theme color schemes for tooltip and notifications - ENHANCED
const themeColors = {
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

// Currency symbol to code mapping
const CURRENCY_MAP = {
  '$': 'USD',
  '€': 'EUR',
  '£': 'GBP',
  '¥': 'JPY',
  '₹': 'INR',
  '₪': 'ILS',
  '₽': 'RUB',
  '₩': 'KRW',
  '฿': 'THB',
  '₺': 'TRY',
  'C$': 'CAD',
  'A$': 'AUD',
  'NZ$': 'NZD',
  'HK$': 'HKD',
  'S$': 'SGD',
  'R$': 'BRL',
  'R': 'ZAR',
  'kr': 'SEK', // Also DKK, NOK, ISK - will handle by context
  'zł': 'PLN',
  'Kč': 'CZK',
  'Ft': 'HUF',
  'lei': 'RON',
  'NT$': 'TWD',
  'د.إ': 'AED',
  '﷼': 'SAR', // Also used for QAR (Qatari Riyal) - defaults to SAR
  '₱': 'PHP',
  '₫': 'VND',
  '₴': 'UAH',
  'د.ك': 'KWD',
  '₣': 'CHF'
};

// Get currency symbol for display
function getCurrencySymbol(code) {
  const symbols = {
    'USD': '$', 'EUR': '€', 'GBP': '£', 'JPY': '¥', 'INR': '₹',
    'ILS': '₪', 'RUB': '₽', 'KRW': '₩', 'THB': '฿', 'TRY': '₺',
    'CAD': 'C$', 'AUD': 'A$', 'NZD': 'NZ$', 'HKD': 'HK$', 'SGD': 'S$',
    'BRL': 'R$', 'ZAR': 'R', 'SEK': 'kr', 'NOK': 'kr', 'DKK': 'kr',
    'PLN': 'zł', 'CZK': 'Kč', 'HUF': 'Ft', 'RON': 'lei', 'TWD': 'NT$',
    'AED': 'د.إ', 'SAR': '﷼', 'PHP': '₱', 'VND': '₫', 'UAH': '₴',
    'CHF': '₣', 'MXN': '$', 'CNY': '¥', 'ISK': 'kr', 'KWD': 'د.ك', 'QAR': '﷼', 'EGP': '£'
  };
  return symbols[code] || code;
}

// Get theme-aware highlight colors for price styling
function getHighlightColors() {
  const colors = themeColors[currentTheme] || themeColors.default;

  // Return theme-specific highlight colors
  if (currentTheme === 'dark') {
    return {
      color: '#ffffff',
      backgroundColor: '#40444b',
      borderColor: '#43b581'
    };
  } else if (currentTheme === 'vibrant') {
    return {
      color: '#92400e',
      backgroundColor: '#fef3c7',
      borderColor: '#f59e0b'
    };
  } else if (currentTheme === 'minimal') {
    return {
      color: '#111827',
      backgroundColor: '#f3f4f6',
      borderColor: '#6b7280'
    };
  } else if (currentTheme === 'professional') {
    return {
      color: '#1e40af',
      backgroundColor: '#dbeafe',
      borderColor: '#3b82f6'
    };
  } else {
    // Default theme
    return {
      color: '#4f46e5',
      backgroundColor: '#e0e7ff',
      borderColor: '#7c3aed'
    };
  }
}

// ⭐ NEW: Helper function to preserve original element styles
function getPreservedStyles(element) {
  // Get computed styles from the element
  const computed = window.getComputedStyle(element);

  // ⭐ SMART: For fragmented prices, find the LARGEST font size from all children
  let largestFontSize = parseFloat(computed.fontSize) || 12;
  let prominentColor = computed.color;
  let prominentWeight = computed.fontWeight;

  // Check all child spans/elements for larger font sizes
  const children = element.querySelectorAll('span, div, strong, b');
  children.forEach(child => {
    const childStyle = window.getComputedStyle(child);
    const childFontSize = parseFloat(childStyle.fontSize) || 0;

    // Use the largest font size found
    if (childFontSize > largestFontSize) {
      largestFontSize = childFontSize;
      prominentColor = childStyle.color; // Use color from largest text
      prominentWeight = childStyle.fontWeight; // Use weight from largest text
      log(`📐 Found larger font in child: ${childFontSize}px`);
    }
  });

  log(`📏 Final preserved font size: ${largestFontSize}px`);

  // Return inline style string that preserves the original appearance
  return {
    color: prominentColor,
    fontSize: `${largestFontSize}px`,
    fontWeight: prominentWeight,
    fontFamily: computed.fontFamily,
    lineHeight: computed.lineHeight,
    letterSpacing: computed.letterSpacing,
    textDecoration: computed.textDecoration,
    textTransform: computed.textTransform,
    // Don't preserve background/padding as these might be from containers
  };
}

// ⭐ SUPER SMART: Analyze price structure and extract styles for each part separately
function analyzeFragmentedPriceStyles(element) {
  log(`🔬 ANALYZING PRICE STRUCTURE: "${element.textContent.substring(0, 50)}"`);
  log(`   Element: <${element.tagName}> Children: ${element.children.length}`);

  const result = {
    countryCodeStyle: null,  // Style for "US", "HK", etc.
    symbolStyle: null,        // Style for "$", "€", etc.
    numberStyle: null,        // Style for "54.95", etc.
    hasFragments: false,
    hasSpaceBetweenCurrencyAndNumber: false, // Track if there's a space element
    spaceElement: null       // Store the space element for cloning
  };

  // Get all child elements
  const children = Array.from(element.querySelectorAll('span, div, strong, b'));
  log(`   Found ${children.length} child elements to analyze`);

  if (children.length === 0) {
    // No fragments, use parent style for everything
    const computed = window.getComputedStyle(element);
    const style = {
      color: computed.color,
      fontSize: computed.fontSize,
      fontWeight: computed.fontWeight,
      fontFamily: computed.fontFamily,
      lineHeight: computed.lineHeight,
      letterSpacing: computed.letterSpacing,
      textDecoration: computed.textDecoration,
      textTransform: computed.textTransform
    };
    result.countryCodeStyle = style;
    result.symbolStyle = style;
    result.numberStyle = style;
    return result;
  }

  result.hasFragments = true;

  // ⭐ DETECT SPACE ELEMENTS: Check for empty or whitespace-only elements
  let foundCurrencyPart = false;
  let foundNumberPart = false;

  // Analyze each child to determine what it contains
  children.forEach((child, index) => {
    const text = child.textContent.trim();
    const rawText = child.textContent;

    log(`   [${index}] Checking child: <${child.tagName} class="${child.className}"> text="${text}" rawText="${rawText}"`);

    const computed = window.getComputedStyle(child);
    const style = {
      color: computed.color,
      fontSize: computed.fontSize,
      fontWeight: computed.fontWeight,
      fontFamily: computed.fontFamily,
      lineHeight: computed.lineHeight,
      letterSpacing: computed.letterSpacing,
      textDecoration: computed.textDecoration,
      textTransform: computed.textTransform
    };

    // ⭐ CHECK FOR SPACE ELEMENT: Empty or whitespace-only element between currency and numbers
    if (text === '' || /^\s*$/.test(child.textContent)) {
      log(`   [${index}] → EMPTY ELEMENT! foundCurrency:${foundCurrencyPart} foundNumber:${foundNumberPart}`);
      // Empty element - could be a space
      if (foundCurrencyPart && !foundNumberPart) {
        // Space between currency and numbers!
        result.hasSpaceBetweenCurrencyAndNumber = true;

        // Clone the element and apply computed styles as inline styles
        // This ensures spacing works even when CSS context changes
        const spaceCloned = child.cloneNode(true);
        const spaceComputed = window.getComputedStyle(child);

        // ⭐ Get ACTUAL rendered width (offsetWidth) instead of computed width
        // For empty elements with CSS-defined width, computed width returns "auto"
        const actualWidth = child.offsetWidth || child.clientWidth || 4; // Fallback to 4px
        const actualHeight = child.offsetHeight || child.clientHeight || 0;

        // Apply critical spacing styles as inline styles with ACTUAL dimensions
        spaceCloned.style.display = spaceComputed.display === 'inline' ? 'inline-block' : spaceComputed.display;
        spaceCloned.style.width = `${actualWidth}px`;
        spaceCloned.style.minWidth = `${actualWidth}px`;
        spaceCloned.style.height = actualHeight > 0 ? `${actualHeight}px` : 'auto';
        spaceCloned.style.margin = spaceComputed.margin;
        spaceCloned.style.padding = spaceComputed.padding;
        spaceCloned.style.verticalAlign = spaceComputed.verticalAlign;

        result.spaceElement = spaceCloned;
        log(`🔲 Found SPACE element: <${child.tagName} class="${child.className}"> actualWidth:${actualWidth}px display:${spaceComputed.display}`);
      }
      return; // Skip empty elements
    }

    // Detect country code (US, HK, AU, CA, NZ, SG, etc.)
    if (/^(US|HK|AU|CA|NZ|SG|C|A|S|EU|UK|JP|CN|IN|IL|BR|RU|KR|TH|TR|ZA|SE|NO|DK|PL|CZ|HU|MX|TW|AE|SA|PH|VN|UA|RO|IS|KW|QA|EG)$/i.test(text)) {
      result.countryCodeStyle = style;
      foundCurrencyPart = true;
      log(`🏴 Found country code "${text}" with font: ${style.fontSize}`);
    }
    // Detect currency symbol
    else if (/^[\$€£¥₹₪₽₩฿₺₣₱₫₴]$/.test(text)) {
      result.symbolStyle = style;
      foundCurrencyPart = true;
      log(`💰 Found currency symbol "${text}" with font: ${style.fontSize}`);
    }
    // Detect numbers (including dots, commas)
    else if (/^[\d.,]+$/.test(text)) {
      result.numberStyle = style;
      foundNumberPart = true;
      log(`🔢 Found number "${text}" with font: ${style.fontSize}`);
    }
    // Mixed content - check what dominates
    else if (/[\$€£¥₹₪₽₩฿₺₣₱₫₴]/.test(text)) {
      // Contains symbol
      if (!result.symbolStyle) result.symbolStyle = style;
      foundCurrencyPart = true;
    } else if (/\d/.test(text)) {
      // Contains numbers
      if (!result.numberStyle) result.numberStyle = style;
      foundNumberPart = true;
    }
  });

  // Fill in missing styles with fallbacks
  const parentComputed = window.getComputedStyle(element);
  const fallbackStyle = {
    color: parentComputed.color,
    fontSize: parentComputed.fontSize,
    fontWeight: parentComputed.fontWeight,
    fontFamily: parentComputed.fontFamily,
    lineHeight: parentComputed.lineHeight,
    letterSpacing: parentComputed.letterSpacing,
    textDecoration: parentComputed.textDecoration,
    textTransform: parentComputed.textTransform
  };

  if (!result.countryCodeStyle) result.countryCodeStyle = result.symbolStyle || fallbackStyle;
  if (!result.symbolStyle) result.symbolStyle = result.countryCodeStyle || fallbackStyle;
  if (!result.numberStyle) result.numberStyle = result.symbolStyle || fallbackStyle;

  log(`📊 Fragmented price analysis complete:`);
  log(`   Country code: ${result.countryCodeStyle.fontSize}`);
  log(`   Symbol: ${result.symbolStyle.fontSize}`);
  log(`   Numbers: ${result.numberStyle.fontSize}`);

  return result;
}

// ⭐ SUPER SMART: Generate fragmented HTML with preserved styles
function generateStyledConvertedHTML(convertedText, styleAnalysis) {
  if (!styleAnalysis.hasFragments) {
    // Simple price - return single span
    return `<span style="color: ${styleAnalysis.numberStyle.color}; font-size: ${styleAnalysis.numberStyle.fontSize}; font-weight: ${styleAnalysis.numberStyle.fontWeight}; font-family: ${styleAnalysis.numberStyle.fontFamily}; line-height: ${styleAnalysis.numberStyle.lineHeight}; letter-spacing: ${styleAnalysis.numberStyle.letterSpacing}; text-decoration: ${styleAnalysis.numberStyle.textDecoration}; text-transform: ${styleAnalysis.numberStyle.textTransform};">${convertedText}</span>`;
  }

  // Parse converted text to extract parts
  // Format can be: "ILS ₪174.74" or "₪174.74 ILS"
  const parts = {
    countryCode: '',
    symbol: '',
    number: ''
  };

  // Extract country code (3 letters at start or end)
  const countryCodeMatch = convertedText.match(/^([A-Z]{3})\s+|(\s+[A-Z]{3})$/);
  if (countryCodeMatch) {
    parts.countryCode = (countryCodeMatch[1] || countryCodeMatch[2]).trim();
  }

  // Extract currency symbol
  const symbolMatch = convertedText.match(/[\$€£¥₹₪₽₩฿₺₣₱₫₴]/);
  if (symbolMatch) {
    parts.symbol = symbolMatch[0];
  }

  // Extract number (everything that's a digit, comma, or dot)
  const numberMatch = convertedText.match(/[\d.,]+/);
  if (numberMatch) {
    parts.number = numberMatch[0];
  }

  log(`🎨 Generating styled HTML: "${parts.countryCode}" "${parts.symbol}" "${parts.number}"`);

  // Build HTML with separate spans for each part
  let html = '';

  // Add country code with its style
  if (parts.countryCode) {
    html += `<span style="color: ${styleAnalysis.countryCodeStyle.color}; font-size: ${styleAnalysis.countryCodeStyle.fontSize}; font-weight: ${styleAnalysis.countryCodeStyle.fontWeight}; font-family: ${styleAnalysis.countryCodeStyle.fontFamily}; line-height: ${styleAnalysis.countryCodeStyle.lineHeight}; letter-spacing: ${styleAnalysis.countryCodeStyle.letterSpacing}; text-decoration: ${styleAnalysis.countryCodeStyle.textDecoration}; text-transform: ${styleAnalysis.countryCodeStyle.textTransform};">${parts.countryCode}</span>&nbsp;`;
  }

  // Add symbol with its style
  if (parts.symbol) {
    html += `<span style="color: ${styleAnalysis.symbolStyle.color}; font-size: ${styleAnalysis.symbolStyle.fontSize}; font-weight: ${styleAnalysis.symbolStyle.fontWeight}; font-family: ${styleAnalysis.symbolStyle.fontFamily}; line-height: ${styleAnalysis.symbolStyle.lineHeight}; letter-spacing: ${styleAnalysis.symbolStyle.letterSpacing}; text-decoration: ${styleAnalysis.symbolStyle.textDecoration}; text-transform: ${styleAnalysis.symbolStyle.textTransform};">${parts.symbol}</span>`;
  }

  // ⭐ INSERT SPACE: If original had a space element between currency and numbers, recreate it
  if (styleAnalysis.hasSpaceBetweenCurrencyAndNumber && parts.number) {
    // Use a simple non-breaking space for reliable spacing
    html += '&nbsp;';
    log(`🔲 Inserted SPACE (&nbsp;) between currency and number`);
  }

  // Add number with its style
  if (parts.number) {
    html += `<span style="color: ${styleAnalysis.numberStyle.color}; font-size: ${styleAnalysis.numberStyle.fontSize}; font-weight: ${styleAnalysis.numberStyle.fontWeight}; font-family: ${styleAnalysis.numberStyle.fontFamily}; line-height: ${styleAnalysis.numberStyle.lineHeight}; letter-spacing: ${styleAnalysis.numberStyle.letterSpacing}; text-decoration: ${styleAnalysis.numberStyle.textDecoration}; text-transform: ${styleAnalysis.numberStyle.textTransform};">${parts.number}</span>`;
  }

  return html;
}

// Helper to apply preserved styles to an element
function applyPreservedStyles(element, styles) {
  if (!styles) return;
  element.style.color = styles.color;
  element.style.fontSize = styles.fontSize;
  element.style.fontWeight = styles.fontWeight;
  element.style.fontFamily = styles.fontFamily;
  element.style.lineHeight = styles.lineHeight;
  element.style.letterSpacing = styles.letterSpacing;
  element.style.textDecoration = styles.textDecoration;
  element.style.textTransform = styles.textTransform;
}

// ⭐ Helper function to generate converted text with currency code preservation
function generateConvertedText(originalPrice, convertedAmount, targetCurrency) {
  const targetSymbol = getCurrencySymbol(targetCurrency);

  // Preserve leading/trailing whitespace
  const leadingSpace = (originalPrice || '').match(/^\s*/)[0];
  const trailingSpace = (originalPrice || '').match(/\s*$/)[0];

  // Trim and normalize the original price
  const trimmedPrice = (originalPrice || '').trim();

  // ⭐ SUPER SMART: Detect STRUCTURE of original price
  // 1. Has 3-letter currency CODE (USD, EUR, GBP, etc.) - without symbol
  // 2. Has 2-letter currency CODE + SYMBOL (US $, HK $, AU $, etc.)
  // 3. Has only SYMBOL ($, €, £, etc.) - no code

  // Check for 3-letter currency code + amount (e.g., "USD 663.92")
  const fullCodePattern = /\b(USD|EUR|GBP|JPY|CNY|INR|ILS|CAD|AUD|CHF|BRL|RUB|KRW|THB|TRY|ZAR|SEK|NOK|DKK|PLN|CZK|HUF|MXN|NZD|SGD|HKD|TWD|AED|SAR|PHP|VND|UAH|RON|ISK|KWD|QAR|EGP)\s+[\d.,]+/i;
  const hasFullCode = fullCodePattern.test(trimmedPrice);

  // Check for 2-letter currency code + symbol (e.g., "US $1.99")
  const shortCodeWithSymbolPattern = /\b(US|HK|AU|CA|NZ|SG|C|A|S)\s*[\$€£¥₹₪₽₩]/i;
  const hasShortCodeWithSymbol = shortCodeWithSymbolPattern.test(trimmedPrice);

  // Check for symbol only (e.g., "$1.99")
  const hasSymbol = /[\$€£¥₹₪₽₩]/.test(trimmedPrice);

  // ⭐ SMART SPACING: Detect if there's a space between symbol and number
  // "US $ 9.11" → space after $  |  "US $9.11" → no space after $
  const hasSpaceAfterSymbol = /[\$€£¥₹₪₽₩]\s+\d/.test(trimmedPrice);

  log(`💱 Price structure analysis for "${trimmedPrice}":`);
  log(`   - Full code (USD): ${hasFullCode}`);
  log(`   - Short code + symbol (US $): ${hasShortCodeWithSymbol}`);
  log(`   - Symbol only ($): ${hasSymbol && !hasShortCodeWithSymbol}`);
  log(`   - Space after symbol: ${hasSpaceAfterSymbol}`);

  let result;

  if (hasFullCode && !hasSymbol) {
    // ⭐ Structure: CODE + NUMBER (no symbol)
    // "USD 663.92" → "ILS 2111.27" (letters to letters, numbers to numbers)
    result = `${targetCurrency} ${convertedAmount.toFixed(2)}`;
    log(`   → CODE ONLY: "${result}"`);
  } else if (hasShortCodeWithSymbol) {
    // ⭐ Structure: CODE + SYMBOL + NUMBER
    // "US $ 9.11" → "ILS ₪ 6.33" (with space) | "US $9.11" → "ILS ₪6.33" (no space)
    const spacer = hasSpaceAfterSymbol ? ' ' : '';
    result = `${targetCurrency} ${targetSymbol}${spacer}${convertedAmount.toFixed(2)}`;
    log(`   → CODE + SYMBOL: "${result}"`);
  } else {
    // ⭐ Structure: SYMBOL + NUMBER (no code)
    // "$ 1.99" → "₪ 6.33" (with space) | "$1.99" → "₪6.33" (no space)
    const spacer = hasSpaceAfterSymbol ? ' ' : '';
    result = `${targetSymbol}${spacer}${convertedAmount.toFixed(2)}`;
    log(`   → SYMBOL ONLY: "${result}"`);
  }

  // Restore leading/trailing whitespace
  return leadingSpace + result + trailingSpace;
}

// ===== CUSTOM TOOLTIP SYSTEM =====
const customTooltip = {
  element: null,
  currentTarget: null,
  hideTimeout: null,

  getThemeColors() {
    return themeColors[currentTheme] || themeColors.default;
  },

  create() {
    // Check if tooltip already exists in DOM
    const existingTooltip = document.getElementById('currency-converter-tooltip');
    if (existingTooltip) {
      log('✅ Tooltip already exists in DOM, reusing it');
      this.element = existingTooltip;
      return;
    }

    if (this.element) {
      log('✅ Tooltip reference exists, skipping create');
      return;
    }

    const colors = this.getThemeColors();
    log('🎨 Creating tooltip with theme:', currentTheme, colors);

    this.element = document.createElement('div');
    this.element.id = 'currency-converter-tooltip';
    this.element.className = 'currency-converter-custom-tooltip';

    // ⭐ ENHANCED: Use all theme properties for complete styling
    this.element.style.cssText = `
      position: fixed !important;
      background: ${colors.gradient} !important;
      color: ${colors.textColor} !important;
      padding: ${colors.padding} !important;
      border-radius: ${colors.borderRadius} !important;
      font-size: ${colors.fontSize} !important;
      font-weight: 600 !important;
      text-shadow: ${colors.textShadow} !important;
      z-index: 2147483647 !important;
      pointer-events: none !important;
      opacity: 0 !important;
      display: none !important;
      box-shadow: ${colors.shadow} !important;
      border: 1px solid ${colors.borderColor} !important;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, system-ui, sans-serif !important;
      white-space: nowrap !important;
      letter-spacing: 0.3px !important;
      visibility: hidden !important;
      backdrop-filter: ${colors.backdropBlur} !important;
      -webkit-backdrop-filter: ${colors.backdropBlur} !important;
    `;

    // Append to body
    if (document.body) {
      document.body.appendChild(this.element);
      log('✅ Tooltip element created and appended to body');
      log('   Element ID:', this.element.id);
      log('   Element in DOM:', document.body.contains(this.element));
    } else {
      logError('❌ document.body not available, tooltip cannot be created!');
    }
  },

  updateTheme() {
    if (!this.element) return;

    const colors = this.getThemeColors();
    // ⭐ ENHANCED: Update all theme-dependent styles
    this.element.style.background = colors.gradient;
    this.element.style.color = colors.textColor;
    this.element.style.textShadow = colors.textShadow;
    this.element.style.padding = colors.padding;
    this.element.style.borderRadius = colors.borderRadius;
    this.element.style.fontSize = colors.fontSize;
    this.element.style.boxShadow = colors.shadow;
    this.element.style.borderColor = colors.borderColor;
    this.element.style.backdropFilter = colors.backdropBlur;
    this.element.style.webkitBackdropFilter = colors.backdropBlur;
  },

  show(convertedText, currency, targetElement, sourceAmount, sourceCurrency, exchangeRate) {
    if (settings.debugMode) {
      log('🎨 Showing tooltip:', convertedText, currency);
    }

    if (!this.element) {
      if (settings.debugMode) {
        log('   Creating tooltip element first...');
      }
      this.create();
    }

    if (!this.element) {
      logError('❌ Failed to create tooltip element!');
      return;
    }

    clearTimeout(this.hideTimeout);
    this.currentTarget = targetElement;

    // ⭐ CRITICAL: Store and remove native title to prevent browser tooltip
    if (!targetElement.dataset.originalTitle && targetElement.title) {
      targetElement.dataset.originalTitle = targetElement.title;
      targetElement.removeAttribute('title');
      if (settings.debugMode) {
        log('   Removed native title to show custom tooltip');
      }
    }

    const colors = this.getThemeColors();
    if (settings.debugMode) {
      log('   Using theme colors:', colors);
    }

    // Build tooltip content based on settings
    // Check if convertedText already has currency code to avoid duplication
    const alreadyHasCode = convertedText.trim().startsWith(currency);
    let tooltipContent = alreadyHasCode ? convertedText : `${convertedText} ${currency}`;

    // Add exchange rate if enabled
    if (settings.showExchangeRate && exchangeRate && sourceAmount && sourceCurrency) {
      tooltipContent += `\n1 ${sourceCurrency} = ${exchangeRate.toFixed(4)} ${currency}`;
    }

    // Screen reader enhancement
    if (settings.screenReaderMode) {
      this.element.setAttribute('role', 'tooltip');
      this.element.setAttribute('aria-live', 'polite');
      this.element.setAttribute('aria-label', `Converted price: ${tooltipContent}`);
    }

    // Set content - support multiline for exchange rate
    if (settings.showExchangeRate && tooltipContent.includes('\n')) {
      this.element.innerHTML = tooltipContent.replace('\n', '<br>');
    } else {
      this.element.textContent = tooltipContent;
    }

    // Apply compact mode adjustments
    let padding = colors.padding;
    let fontSize = colors.fontSize;
    let borderRadius = colors.borderRadius;

    if (settings.compactTooltip) {
      padding = '6px 10px';
      fontSize = '12px';
      borderRadius = '6px';
    }

    // Apply large text mode
    if (settings.largeText) {
      const currentSize = parseInt(fontSize);
      fontSize = `${Math.floor(currentSize * 1.25)}px`;
    }

    // Apply high contrast mode
    let boxShadow = colors.shadow;
    let border = `1px solid ${colors.borderColor}`;
    if (settings.highContrast) {
      boxShadow = '0 0 0 3px rgba(0, 0, 0, 0.8), ' + colors.shadow;
      border = `2px solid ${colors.borderColor}`;
    }

    // Animation settings
    const transitionStyle = settings.tooltipAnimation && !settings.reducedMotion
      ? 'opacity 0.2s ease, transform 0.2s ease'
      : 'none';

    // Multi-line support for exchange rate
    const whiteSpace = settings.showExchangeRate ? 'pre-line' : 'nowrap';

    // ⭐ ENHANCED: Force all theme-specific styles inline to override everything
    this.element.style.cssText = `
      position: fixed !important;
      background: ${colors.gradient} !important;
      color: ${colors.textColor} !important;
      text-shadow: ${colors.textShadow} !important;
      padding: ${padding} !important;
      border-radius: ${borderRadius} !important;
      font-size: ${fontSize} !important;
      font-weight: 600 !important;
      z-index: 2147483647 !important;
      pointer-events: none !important;
      opacity: 1 !important;
      display: block !important;
      box-shadow: ${boxShadow} !important;
      border: ${border} !important;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, system-ui, sans-serif !important;
      white-space: ${whiteSpace} !important;
      letter-spacing: 0.3px !important;
      visibility: visible !important;
      transform: translateY(0) !important;
      transition: ${transitionStyle} !important;
      backdrop-filter: ${colors.backdropBlur} !important;
      -webkit-backdrop-filter: ${colors.backdropBlur} !important;
      text-align: center !important;
      line-height: 1.4 !important;
    `;

    // Get element position (getBoundingClientRect is already viewport-relative!)
    const rect = targetElement.getBoundingClientRect();

    log('   Target rect:', rect.top, rect.left, rect.width, rect.height);
    log('   Viewport size:', window.innerWidth, window.innerHeight);

    // Force layout recalculation
    const tooltipWidth = this.element.offsetWidth;
    const tooltipHeight = this.element.offsetHeight;

    log('   Tooltip size:', tooltipWidth, tooltipHeight);

    // ⭐ CRITICAL FIX: position:fixed means NO scroll offsets needed!
    // Calculate position (centered above element by default)
    let top = rect.top - tooltipHeight - 10;
    let left = rect.left + (rect.width / 2) - (tooltipWidth / 2);
    let showBelow = false;

    log('   Initial position:', top, left);

    // Adjust if would go off-screen vertically (show below instead)
    if (top < 5) {
      top = rect.bottom + 10;
      showBelow = true;
      log('   Adjusted to show below:', top);
    }

    // Adjust if would go off-screen horizontally
    if (left < 5) {
      left = 5;
      log('   Adjusted left boundary:', left);
    }
    const maxLeft = window.innerWidth - tooltipWidth - 5;
    if (left > maxLeft) {
      left = maxLeft;
      log('   Adjusted right boundary:', left);
    }

    // Apply final position (re-apply to ensure it sticks)
    this.element.style.top = `${top}px`;
    this.element.style.left = `${left}px`;

    // ⭐ ENHANCED: Add smooth entrance animation (slide-up or slide-down)
    requestAnimationFrame(() => {
      if (showBelow) {
        this.element.style.transform = 'translateY(-5px)';
      } else {
        this.element.style.transform = 'translateY(5px)';
      }
      this.element.style.opacity = '0';

      requestAnimationFrame(() => {
        this.element.style.transform = 'translateY(0)';
        this.element.style.opacity = '1';
      });
    });

    log('✅ Tooltip displayed at:', top, left);
    log('   Element in DOM:', document.body.contains(this.element));
    log('   Element visible:', this.element.offsetWidth > 0 && this.element.offsetHeight > 0);
  },

  hide(immediate = false) {
    if (!this.element) return;

    const hideAction = () => {
      if (this.element) {
        // ⭐ ENHANCED: Smooth fade-out animation
        this.element.style.opacity = '0';
        this.element.style.transform = 'translateY(-5px)';

        // Hide after animation completes
        setTimeout(() => {
          if (this.element) {
            this.element.style.display = 'none';
          }
        }, 200);

        // ⭐ Restore native title if it was removed
        if (this.currentTarget && this.currentTarget.dataset.originalTitle) {
          this.currentTarget.title = this.currentTarget.dataset.originalTitle;
          log('   Restored native title');
        }

        this.currentTarget = null;
      }
    };

    if (immediate) {
      clearTimeout(this.hideTimeout);
      // Skip animation for immediate hide
      if (this.element) {
        this.element.style.display = 'none';
        this.element.style.opacity = '0';
      }
      if (this.currentTarget && this.currentTarget.dataset.originalTitle) {
        this.currentTarget.title = this.currentTarget.dataset.originalTitle;
      }
      this.currentTarget = null;
    } else {
      // Delayed hide to prevent flickering
      this.hideTimeout = setTimeout(hideAction, 100);
    }
  }
};

// Load real exchange rates
async function loadRates() {
  try {
    const response = await chrome.runtime.sendMessage({ type: 'getExchangeRates' });
    if (response && response.rates) {
      exchangeRates = response.rates;
      log('💱 Loaded exchange rates:', Object.keys(exchangeRates).length, 'currencies');
    }
  } catch (e) {
    log('⚠️ Using fallback rates');
  }
}

// Load settings and theme
async function loadSettings() {
  try {
    const result = await chrome.storage.sync.get([
      'defaultTargetCurrency',
      'showTooltip',
      'highlightPrices',
      'autoConvertOnHover',
      'showInlineConversion',
      'replacePrice',
      'selectedTheme',
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
      'maxPrice',
      'showNotifications',
      'enableSounds',
      'debugMode',
      // Accessibility
      'highContrast',
      'largeText',
      'reducedMotion',
      'screenReaderMode'
    ]);

    // Basic settings
    settings.defaultTargetCurrency = result.defaultTargetCurrency || 'ILS';
    settings.showTooltip = result.showTooltip !== undefined ? result.showTooltip : true;
    settings.highlightPrices = result.highlightPrices || false;
    settings.autoConvertOnHover = result.autoConvertOnHover !== undefined ? result.autoConvertOnHover : true;
    settings.showInlineConversion = result.showInlineConversion !== undefined ? result.showInlineConversion : true;
    settings.replacePrice = result.replacePrice || false;

    // Tooltip settings
    settings.tooltipDelay = result.tooltipDelay !== undefined ? result.tooltipDelay : 300;
    settings.tooltipPosition = result.tooltipPosition || 'auto';
    settings.showExchangeRate = result.showExchangeRate || false;
    settings.compactTooltip = result.compactTooltip || false;
    settings.tooltipAnimation = result.tooltipAnimation !== undefined ? result.tooltipAnimation : true;

    // Display format
    settings.decimalPlaces = result.decimalPlaces || 'auto';
    settings.currencyDisplay = result.currencyDisplay || 'symbol';
    settings.useThousandSeparator = result.useThousandSeparator !== undefined ? result.useThousandSeparator : true;

    // Advanced settings
    settings.detectionSensitivity = result.detectionSensitivity || 'medium';
    settings.minPrice = result.minPrice || null;
    settings.maxPrice = result.maxPrice || null;
    settings.showNotifications = result.showNotifications !== undefined ? result.showNotifications : true;
    settings.enableSounds = result.enableSounds || false;
    settings.debugMode = result.debugMode || false;

    // Accessibility
    settings.highContrast = result.highContrast || false;
    settings.largeText = result.largeText || false;
    settings.reducedMotion = result.reducedMotion || false;
    settings.screenReaderMode = result.screenReaderMode || false;

    // Load theme
    currentTheme = result.selectedTheme || 'chrome-dark';

    // Apply accessibility settings to body
    applyAccessibilitySettings();

    if (settings.debugMode) {
      log('⚙️ Settings loaded:', settings);
      log('   showTooltip:', settings.showTooltip);
      log('   tooltipDelay:', settings.tooltipDelay + 'ms');
      log('   compactTooltip:', settings.compactTooltip);
      log('🎨 Theme loaded:', currentTheme);
    }
  } catch (e) {
    log('⚠️ Using default settings');
  }
}

// Apply accessibility settings to document
function applyAccessibilitySettings() {
  const body = document.body;

  // High contrast mode
  if (settings.highContrast) {
    body.classList.add('cc-high-contrast');
  } else {
    body.classList.remove('cc-high-contrast');
  }

  // Large text mode
  if (settings.largeText) {
    body.classList.add('cc-large-text');
  } else {
    body.classList.remove('cc-large-text');
  }

  // Reduced motion
  if (settings.reducedMotion) {
    body.classList.add('cc-reduced-motion');
  } else {
    body.classList.remove('cc-reduced-motion');
  }

  // Screen reader mode
  if (settings.screenReaderMode) {
    body.classList.add('cc-screen-reader');
  } else {
    body.classList.remove('cc-screen-reader');
  }

  // Debug mode
  if (settings.debugMode) {
    body.classList.add('cc-debug-mode');
  } else {
    body.classList.remove('cc-debug-mode');
  }
}

// Format number according to user settings
function formatNumber(amount, currency) {
  let decimals = 2; // default

  // Determine decimal places
  if (settings.decimalPlaces === 'auto') {
    // Auto mode: smart rounding
    if (amount < 1) {
      decimals = 4; // Small amounts get more precision
    } else if (amount > 1000) {
      decimals = 0; // Large amounts don't need decimals
    } else {
      decimals = 2; // Standard amounts
    }
  } else if (settings.decimalPlaces !== 'auto') {
    decimals = parseInt(settings.decimalPlaces);
  }

  // Round to specified decimals
  let rounded = amount.toFixed(decimals);

  // Apply thousand separators if enabled
  if (settings.useThousandSeparator) {
    const parts = rounded.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    rounded = parts.join('.');
  }

  // Apply currency display format
  const symbol = getCurrencySymbol(currency);

  if (settings.currencyDisplay === 'symbol') {
    return `${symbol}${rounded}`;
  } else if (settings.currencyDisplay === 'code') {
    return `${rounded} ${currency}`;
  } else { // both
    return `${symbol}${rounded} ${currency}`;
  }
}

// Get currency symbol
function getCurrencySymbol(currencyCode) {
  const symbols = {
    'USD': '$', 'EUR': '€', 'GBP': '£', 'JPY': '¥',
    'ILS': '₪', 'CAD': 'C$', 'AUD': 'A$', 'CHF': '₣',
    'CNY': '¥', 'INR': '₹', 'RUB': '₽', 'BRL': 'R$',
    'KRW': '₩', 'MXN': '$', 'TRY': '₺', 'THB': '฿',
    'PLN': 'zł', 'SEK': 'kr', 'NOK': 'kr', 'DKK': 'kr',
    'HUF': 'Ft', 'CZK': 'Kč', 'ZAR': 'R', 'SGD': 'S$',
    'HKD': 'HK$', 'NZD': 'NZ$'
  };
  return symbols[currencyCode] || currencyCode + ' ';
}

// Check if price is within acceptable range
function isPriceInRange(amount) {
  // Check minimum price
  if (settings.minPrice !== null && amount < settings.minPrice) {
    if (settings.debugMode) {
      log(`   Price ${amount} below minimum ${settings.minPrice}, skipping`);
    }
    return false;
  }

  // Check maximum price
  if (settings.maxPrice !== null && amount > settings.maxPrice) {
    if (settings.debugMode) {
      log(`   Price ${amount} above maximum ${settings.maxPrice}, skipping`);
    }
    return false;
  }

  return true;
}

// Detect website type for optimized selectors
function detectWebsiteType() {
  const hostname = window.location.hostname;
  if (hostname.includes('amazon.')) return 'amazon';
  if (hostname.includes('ebay.')) return 'ebay';
  if (hostname.includes('aliexpress.')) return 'aliexpress';
  if (hostname.includes('walmart.')) return 'walmart';
  if (hostname.includes('etsy.')) return 'etsy';
  return 'generic';
}

// Get optimized selectors based on site type
function getPriceSelectors(siteType) {
  const selectors = {
    amazon: [
      '.a-price',              // Main price container (often fragmented)
      '.a-price-whole',        // Dollar amount
      'span.priceToPay',       // Checkout price
      '.a-offscreen',          // Screen reader accessibility text
      '.aok-offscreen',        // Alternative offscreen class
      'span[aria-hidden="true"]', // Visible price text (may be aria-hidden)
      '.a-price .a-offscreen', // Nested accessibility text
      '.a-text-price',         // Text-based price display
      '.centralizedApexPricePriceToPayMargin', // Apex price component
      '.centralizedApexBasisPriceCSS',  // Basis/list price
      '[data-a-color="price"]',
      '.apexPriceToPay',
      '#priceblock_ourprice',
      '#priceblock_dealprice',
      '#corePrice_desktop',
      '#corePrice_feature_div',
      '.a-section.a-spacing-small',
      '[data-feature-name="corePrice"]',
      '.priceToPay',
      '.reinventPricePriceToPayMargin',
      '#apex_price span',      // Apex price child spans
      '.apex_on_twister_price span', // Twister (variant) prices
      '[class*="price"]'
    ],
    ebay: [
      '.x-price-primary',
      '.x-bin-price__content',
      '.display-price',
      '[itemprop="price"]'
    ],
    aliexpress: [
      '.product-price-value',
      '.price-current',
      '.uniform-banner-box-price',
      '.price-default--current--F8OlYIo',
      '.price-default--original--CWCHOit',
      '.dynamic-shipping strong',
      '.dynamic-shipping span',
      '._3Mpbo', // AliExpress fragmented price container
      '.kr_lo', // AliExpress fragmented price container (new format)
      '[class*="_3Mpbo"]',
      '[class*="price"]',
      '[class*="Price"]',
      '[class*="amount"]',
      '[class*="cost"]',
      'div[data-spm-anchor-id*="price"]',
      'span[data-spm-anchor-id*="price"]'
    ],
    walmart: [
      '[itemprop="price"]',
      '.price-characteristic',
      '[data-automation-id*="price"]'
    ],
    etsy: [
      '.wt-text-title-01',
      '[data-buy-box-region="price"]',
      '.currency-value'
    ],
    generic: [
      '[class*="price"]',
      '[class*="Price"]',
      '[id*="price"]',
      '[id*="Price"]',
      '[data-price]',
      '[itemprop="price"]'
    ]
  };

  return [...selectors[siteType], ...selectors.generic];
}

// ⭐ Enhanced currency detection with more formats
function detectCurrency(text) {
  // Normalize text - remove extra spaces
  text = text.replace(/\s+/g, ' ').trim();

  // Check for currency codes first (highest priority)
  // Supports: "123.45 USD", "USD 123.45", "US $14.91", "USD3.50"
  const codeMatch = text.match(/\b(USD|EUR|GBP|JPY|INR|ILS|CAD|AUD|CHF|CNY|BRL|RUB|KRW|THB|TRY|ZAR|SEK|NOK|DKK|PLN|CZK|HUF|MXN|NZD|SGD|HKD|TWD|AED|SAR|PHP|VND|UAH|RON|ISK|KWD|QAR|EGP)\b/i);
  if (codeMatch) {
    const currency = codeMatch[1];
    if (currency) return currency.toUpperCase();
    if (codeMatch[0].includes('US $') || codeMatch[0].includes('US$')) return 'USD';
  }

  // Check for currency symbols (order matters - check multi-char first)
  if (text.includes('US $') || text.includes('US$')) return 'USD';
  if (text.includes('C$')) return 'CAD';
  if (text.includes('A$')) return 'AUD';
  if (text.includes('NZ$')) return 'NZD';
  if (text.includes('HK$')) return 'HKD';
  if (text.includes('S$')) return 'SGD';
  if (text.includes('R$')) return 'BRL';
  if (text.includes('NT$')) return 'TWD';
  if (text.includes('د.إ')) return 'AED';
  if (text.includes('د.ك')) return 'KWD';
  if (text.includes('₣')) return 'CHF';
  if (text.includes('€')) return 'EUR';
  if (text.includes('£')) return 'GBP';
  if (text.includes('₹')) return 'INR';
  if (text.includes('₪')) return 'ILS';
  if (text.includes('₽')) return 'RUB';
  if (text.includes('₩')) return 'KRW';
  if (text.includes('฿')) return 'THB';
  if (text.includes('₺')) return 'TRY';
  if (text.includes('zł')) return 'PLN';
  if (text.includes('Kč')) return 'CZK';
  if (text.includes('Ft')) return 'HUF';
  if (text.includes('lei')) return 'RON';
  if (text.includes('﷼')) return 'SAR';
  if (text.includes('₱')) return 'PHP';
  if (text.includes('₫')) return 'VND';
  if (text.includes('₴')) return 'UAH';
  if (text.includes('¥')) return 'JPY'; // Could also be CNY
  if (text.includes('kr')) return 'SEK'; // Could be DKK, NOK, ISK
  if (text.includes('$')) return 'USD';

  return null;
}

// ⭐ SUPER SMART: Context-aware price validation with confidence scoring
function isProbablyPrice(text, element) {
  // Quick validation
  if (!text || !element) return { isPrice: false, confidence: 0 };

  const originalText = text;
  text = text.toLowerCase().trim();

  let confidence = 50; // Start at 50% confidence

  // NEGATIVE SIGNALS (reduce confidence)

  // Not a phone number (US/International format)
  if (/^\+?\d{1,3}[\s.-]?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/.test(text)) {
    return { isPrice: false, confidence: 0, reason: 'phone_number' };
  }

  // Not a year or date
  if (/\b(19|20)\d{2}\b/.test(text) && text.length < 10) {
    confidence -= 30;
  }

  // Not a percentage
  if (/%/.test(text) && !/\$|€|£|¥|usd|eur|gbp/i.test(text)) {
    return { isPrice: false, confidence: 0, reason: 'percentage' };
  }

  // Not a model/product number (common format: XXX-XXXX-XXX)
  if (/^[A-Z0-9]+-[A-Z0-9]+-[A-Z0-9]+$/i.test(text)) {
    return { isPrice: false, confidence: 0, reason: 'product_code' };
  }

  // Not a dimension (10x20, 5' x 3')
  if (/\d+\s*[x×]\s*\d+/i.test(text)) {
    return { isPrice: false, confidence: 0, reason: 'dimension' };
  }

  // POSITIVE SIGNALS (increase confidence)

  // Has currency symbol or code
  if (/[\$€£¥₹₪₽₩฿₺₣₱₫₴]|(?:usd|eur|gbp|jpy|cny|inr|ils|cad|aud|chf|brl|rub|krw|thb|try|zar|sek|nok|dkk|pln|czk|huf|mxn|nzd|sgd|hkd|twd|aed|sar|php|vnd|uah|ron|isk|kwd|qar|egp)\b/i.test(text)) {
    confidence += 40;
  }

  // ⭐ EXTRA BOOST: Currency code followed by amount (e.g., "USD 663.92")
  // This format is very specific and almost always a price
  if (/\b(USD|EUR|GBP|JPY|CNY|INR|ILS|CAD|AUD|CHF|BRL|RUB|KRW|THB|TRY|ZAR|SEK|NOK|DKK|PLN|CZK|HUF|MXN|NZD|SGD|HKD|TWD|AED|SAR|PHP|VND|UAH|RON|ISK|KWD|QAR|EGP)\s+\d/i.test(text)) {
    confidence += 30; // Strong indicator of price format
    log(`💰 Detected currency code + amount format: "${text.substring(0, 30)}"`);
  }

  // Check element class/id for price-related keywords
  const classAndId = (element.className + ' ' + element.id).toLowerCase();
  if (/price|cost|amount|total|subtotal|payment|pay/.test(classAndId)) {
    confidence += 20;
  }

  // Check nearby text for price context (within parent element)
  const parentText = element.parentElement ? element.parentElement.textContent.toLowerCase() : '';
  const priceContextKeywords = /buy|cart|checkout|purchase|order|add to|price|cost|total|pay|sale|discount|save|offer/;
  if (priceContextKeywords.test(parentText.slice(0, 500))) {
    confidence += 15;
  }

  // Reasonable price range (0.01 to 999,999,999.99)
  const numMatch = text.match(/(\d[\d,.\s]*\d|\d)/);
  if (numMatch) {
    const numStr = numMatch[0].replace(/[,\s]/g, '');
    const num = parseFloat(numStr);
    if (num >= 0.01 && num <= 999999999.99) {
      confidence += 10;
    } else {
      confidence -= 20; // Unreasonable price
    }
  }

  // Has decimal point (very likely a price)
  if (/\d+[.,]\d{2}/.test(text)) {
    confidence += 15;
  }

  // Common price patterns
  if (/^[\$€£¥₹₪₽₩]\s*\d+([.,]\d{2})?$/.test(text)) {
    confidence += 20; // Perfect price format
  }

  return {
    isPrice: confidence >= 60,
    confidence: Math.min(100, Math.max(0, confidence)),
    reason: confidence >= 60 ? 'validated' : 'low_confidence'
  };
}

// ⭐ SMART: Detect if element contains a price range (e.g., "$5.81 - $12.99")
function detectPriceRange(text) {
  // Match price ranges with various formats
  const rangePatterns = [
    // "$5.81 - $12.99" or "€5,20 - €10,50"
    /([\$€£¥₹₪₽₩])\s*(\d+[.,]\d{2})\s*[-–—to]\s*\1\s*(\d+[.,]\d{2})/i,
    // "5.81 - 12.99 USD" or "5,20 - 10,50 EUR"
    /(\d+[.,]\d{2})\s*[-–—to]\s*(\d+[.,]\d{2})\s*(usd|eur|gbp|jpy|cny)/i,
    // "$5 - $12" (no decimals)
    /([\$€£¥₹₪₽₩])\s*(\d+)\s*[-–—to]\s*\1\s*(\d+)/i
  ];

  for (const pattern of rangePatterns) {
    const match = text.match(pattern);
    if (match) {
      return {
        isRange: true,
        minPrice: match[2],
        maxPrice: match[3],
        currency: match[1] || match[4]
      };
    }
  }

  return { isRange: false };
}

// ⭐ SMART: Detect sale/comparison prices (was/now, strikethrough, etc.)
function detectSalePrice(element) {
  const text = element.textContent.toLowerCase();
  const style = window.getComputedStyle(element);

  // Check for strikethrough styling
  const isStrikethrough = style.textDecoration.includes('line-through') ||
                          style.textDecorationLine.includes('line-through');

  // Check for sale keywords
  const hasSaleKeywords = /\b(was|originally|reg\.|regular|list price|compare at|msrp|rrp)\b/i.test(text);

  // Check for discount keywords in parent
  const parentText = element.parentElement ? element.parentElement.textContent.toLowerCase() : '';
  const hasDiscountContext = /\b(save|off|discount|sale|clearance|reduced)\b/.test(parentText);

  // Check class/id for sale indicators
  const classAndId = (element.className + ' ' + element.id).toLowerCase();
  const hasSaleClass = /strike|through|original|was|old|compare|regular|msrp|rrp/i.test(classAndId);

  return {
    isOldPrice: isStrikethrough || hasSaleKeywords || hasSaleClass,
    isSaleContext: hasDiscountContext,
    confidence: (isStrikethrough ? 40 : 0) + (hasSaleKeywords ? 30 : 0) + (hasSaleClass ? 20 : 0) + (hasDiscountContext ? 10 : 0)
  };
}

// ⭐ SMART: Differentiate shipping costs from product prices
function isShippingCost(element) {
  const text = element.textContent.toLowerCase();
  const classAndId = (element.className + ' ' + element.id).toLowerCase();
  const parentText = element.parentElement ? element.parentElement.textContent.toLowerCase() : '';

  // Check for shipping keywords
  const shippingKeywords = /\b(shipping|delivery|freight|postage|handling|ship|s&h|s\/h)\b/i;

  return shippingKeywords.test(text) ||
         shippingKeywords.test(classAndId) ||
         shippingKeywords.test(parentText.slice(0, 200));
}

// ⭐ VISUAL INTELLIGENCE: Analyze element's visual context
function analyzeVisualContext(element) {
  try {
    const style = window.getComputedStyle(element);
    const rect = element.getBoundingClientRect();

    // Check if element is visible
    const isVisible = style.display !== 'none' &&
                     style.visibility !== 'hidden' &&
                     style.opacity !== '0' &&
                     rect.width > 0 &&
                     rect.height > 0;

    if (!isVisible) {
      return { score: 0, reason: 'not_visible' };
    }

    let score = 50; // Base score

    // Font size analysis (larger = more likely main price)
    const fontSize = parseFloat(style.fontSize);
    if (fontSize >= 24) score += 20;      // Very large (likely main price)
    else if (fontSize >= 18) score += 15; // Large (likely price)
    else if (fontSize >= 14) score += 5;  // Normal
    else score -= 10;                     // Small (likely metadata)

    // Font weight analysis (bold = more prominent)
    const fontWeight = parseInt(style.fontWeight) || 400;
    if (fontWeight >= 700) score += 15;   // Bold
    else if (fontWeight >= 600) score += 10; // Semi-bold

    // Color analysis (certain colors indicate prices)
    const color = style.color;
    // Check for green (sale), red (discount), or dark (standard)
    if (/rgb\(0,\s*128,\s*0\)|rgb\(34,\s*139,\s*34\)/i.test(color)) score += 10; // Green
    if (/rgb\(255,\s*0,\s*0\)|rgb\(220,\s*20,\s*60\)/i.test(color)) score += 5;  // Red

    // Position analysis (viewport position matters)
    const viewportHeight = window.innerHeight;
    const elementTop = rect.top;
    // Prices in upper portion of page are more likely to be important
    if (elementTop < viewportHeight * 0.5) score += 10;
    else if (elementTop > viewportHeight * 1.5) score -= 5; // Below fold

    // Size analysis (larger elements = more prominent)
    const area = rect.width * rect.height;
    if (area > 5000) score += 15;      // Large element
    else if (area > 2000) score += 10; // Medium element
    else if (area < 500) score -= 5;   // Small element

    return {
      score: Math.min(100, Math.max(0, score)),
      fontSize,
      fontWeight,
      isVisible,
      position: { top: rect.top, left: rect.left },
      size: { width: rect.width, height: rect.height }
    };
  } catch (error) {
    return { score: 50, reason: 'analysis_failed' };
  }
}

// ⭐ SEMANTIC INTELLIGENCE: Analyze HTML semantic meaning
function analyzeSemanticHTML(element) {
  let score = 0;
  const attributes = {
    itemprop: element.getAttribute('itemprop'),
    itemtype: element.getAttribute('itemtype'),
    ariaLabel: element.getAttribute('aria-label'),
    role: element.getAttribute('role'),
    dataPrice: element.getAttribute('data-price'),
    dataAmount: element.getAttribute('data-amount'),
    dataCurrency: element.getAttribute('data-currency')
  };

  // Schema.org microdata (highest confidence)
  if (attributes.itemprop === 'price') score += 40;
  if (attributes.itemprop === 'priceCurrency') score += 30;
  if (attributes.itemtype?.includes('Offer')) score += 20;
  if (attributes.itemtype?.includes('Product')) score += 15;

  // ARIA labels
  if (/price|cost|amount/i.test(attributes.ariaLabel || '')) score += 25;

  // Data attributes (common in modern sites)
  if (attributes.dataPrice) score += 35;
  if (attributes.dataAmount) score += 30;
  if (attributes.dataCurrency) score += 25;

  // Role attribute
  if (attributes.role === 'button' && /buy|cart|checkout/i.test(element.textContent)) score += 10;

  return {
    score: Math.min(100, score),
    hasMicrodata: !!(attributes.itemprop || attributes.itemtype),
    hasAriaLabels: !!attributes.ariaLabel,
    hasDataAttributes: !!(attributes.dataPrice || attributes.dataAmount),
    attributes
  };
}

// ⭐ ADVANCED: Detect quantity-aware pricing ("2 for $10", "$5 each")
function detectQuantityPricing(text) {
  const patterns = [
    // "2 for $10", "3 for €15"
    /(\d+)\s+for\s+([\$€£¥₹₪₽₩]\s*\d+[.,]?\d*)/i,
    // "$5 each", "€10 per item"
    /([\$€£¥₹₪₽₩]\s*\d+[.,]?\d*)\s+(?:each|per item|per unit|apiece)/i,
    // "Buy 2 get 1 free" (skip these)
    /buy\s+\d+\s+get\s+\d+/i
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      // Check if it's a "buy X get Y" offer (don't convert)
      if (pattern.source.includes('buy')) {
        return { isQuantityPrice: true, shouldSkip: true, reason: 'bulk_offer' };
      }

      return {
        isQuantityPrice: true,
        shouldSkip: false,
        quantity: match[1] ? parseInt(match[1]) : 1,
        priceText: match[2] || match[1]
      };
    }
  }

  return { isQuantityPrice: false };
}

// ⭐ ADVANCED: Detect multi-currency display ("US $5.81 (€5.20)")
function detectMultiCurrency(text) {
  // Pattern: "USD 5.81 (EUR 5.20)" or "$5.81 (€5.20)"
  const pattern = /(?:([\$€£¥₹₪₽₩]|USD|EUR|GBP|JPY)\s*(\d+[.,]?\d*))\s*\(([^)]+)\)/i;
  const match = text.match(pattern);

  if (match) {
    const primaryPrice = match[1] + ' ' + match[2];
    const secondaryPrice = match[3];

    return {
      isMultiCurrency: true,
      primaryPrice,
      secondaryPrice,
      shouldConvertBoth: false // Only convert primary by default
    };
  }

  return { isMultiCurrency: false };
}

// ⭐ ADVANCED: Cross-element price assembly (price split across siblings)
function assembleCrossElementPrice(element) {
  // Check if element has siblings that might contain price parts
  const parent = element.parentElement;
  if (!parent) return null;

  const siblings = Array.from(parent.children);
  const currentIndex = siblings.indexOf(element);

  // Look at previous and next siblings
  const prevSibling = siblings[currentIndex - 1];
  const nextSibling = siblings[currentIndex + 1];

  let assembledText = element.textContent.trim();

  // Check if previous sibling has currency symbol
  if (prevSibling && /^[\$€£¥₹₪₽₩]$/.test(prevSibling.textContent.trim())) {
    assembledText = prevSibling.textContent.trim() + ' ' + assembledText;
  }

  // Check if next sibling has decimal part
  if (nextSibling && /^\.\d{1,2}$/.test(nextSibling.textContent.trim())) {
    assembledText = assembledText + nextSibling.textContent.trim();
  }

  return assembledText !== element.textContent.trim() ? assembledText : null;
}

// ⭐ COMPREHENSIVE: Score element as price candidate (0-100)
function scorePriceElement(element, text) {
  let totalScore = 0;
  const weights = {
    validation: 0.25,      // 25% - Basic price validation
    visual: 0.20,          // 20% - Visual context
    semantic: 0.25,        // 25% - Semantic HTML
    contextual: 0.15,      // 15% - Shopping context
    structural: 0.15       // 15% - DOM structure
  };

  // 1. Basic validation score
  const validation = isProbablyPrice(text, element);
  totalScore += validation.confidence * weights.validation;

  // 2. Visual context score
  const visual = analyzeVisualContext(element);
  totalScore += visual.score * weights.visual;

  // 3. Semantic HTML score
  const semantic = analyzeSemanticHTML(element);
  totalScore += semantic.score * weights.semantic;

  // 4. Contextual score
  let contextScore = 50;
  const parentText = element.parentElement?.textContent.toLowerCase() || '';
  if (/buy now|add to cart|checkout|purchase/i.test(parentText.slice(0, 300))) contextScore += 30;
  if (/product|item|price/i.test(element.className + ' ' + element.id)) contextScore += 20;
  totalScore += contextScore * weights.contextual;

  // 5. Structural score
  let structScore = 50;
  const tagName = element.tagName.toLowerCase();
  if (['span', 'div', 'strong', 'b'].includes(tagName)) structScore += 20;
  if (element.parentElement?.classList.contains('price')) structScore += 30;
  totalScore += structScore * weights.structural;

  return {
    total: Math.round(totalScore),
    breakdown: {
      validation: Math.round(validation.confidence * weights.validation),
      visual: Math.round(visual.score * weights.visual),
      semantic: Math.round(semantic.score * weights.semantic),
      contextual: Math.round(contextScore * weights.contextual),
      structural: Math.round(structScore * weights.structural)
    },
    details: { validation, visual, semantic }
  };
}

// ⭐ Helper: Normalize price text for consistent processing
function normalizePriceText(text) {
  if (!text) return '';

  // Remove zero-width spaces, non-breaking spaces, and normalize whitespace
  let normalized = text
    .replace(/[\u200B-\u200D\uFEFF]/g, '') // Zero-width characters
    .replace(/\u00A0/g, ' ')  // Non-breaking space
    .replace(/\s+/g, ' ')     // Multiple spaces to single space
    .trim();

  // Remove common price prefixes/suffixes that interfere with detection
  normalized = normalized
    .replace(/^(?:from|starting at|as low as|only|just|approximately|about|around)\s+/i, '')
    .replace(/\s+(?:each|per item|\/item|per unit|apiece)$/i, '');

  return normalized;
}

// ⭐ Enhanced helper function to extract combined text from fragmented elements (e.g., AliExpress)
function extractFragmentedPrice(element) {
  if (!element) return null;

  // Get all text nodes from element and immediate children
  const getAllText = (el) => {
    let text = '';
    const walk = document.createTreeWalker(
      el,
      NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT,
      {
        acceptNode: (node) => {
          // Skip script and style elements
          if (node.nodeType === Node.ELEMENT_NODE) {
            const tag = node.tagName.toLowerCase();
            if (tag === 'script' || tag === 'style' || tag === 'noscript') {
              return NodeFilter.FILTER_REJECT;
            }
          }
          return NodeFilter.FILTER_ACCEPT;
        }
      }
    );

    let node;
    while (node = walk.nextNode()) {
      if (node.nodeType === Node.TEXT_NODE) {
        const trimmed = node.textContent.trim();
        // Add space between parts if needed (e.g., "US" + "$" should be "US $")
        if (trimmed && text && !text.endsWith(' ') && !trimmed.startsWith(' ')) {
          // Check if we need a space (currency code followed by symbol or digit)
          if ((/[A-Z]{2,3}$/.test(text) && /^[\$€£¥₹₪₽₩฿₺₣₱₫₴\d]/.test(trimmed)) ||
              (/[\$€£¥₹₪₽₩฿₺₣₱₫₴]$/.test(text) && /^\d/.test(trimmed))) {
            text += ' ';
          }
        }
        text += trimmed;
      }
    }
    return text.trim();
  };

  // Try element itself
  let combinedText = getAllText(element);

  // ⭐ SMART: Check if element already has a complete price
  const hasCurrencySymbol = /[\$€£¥₹₪₽₩฿₺₣₱₫₴]|USD|EUR|GBP|ILS|JPY|CNY/.test(combinedText);
  const hasNumber = /\d/.test(combinedText);
  const hasCompletePrice = hasCurrencySymbol && hasNumber;

  // If element has very little text AND no complete price, try parent
  if (combinedText.length < 10 && !hasCompletePrice && element.parentElement) {
    const parentText = getAllText(element.parentElement);
    // Only use parent if it's not too large (avoid grabbing entire page)
    // AND parent doesn't have multiple prices
    const priceCount = (parentText.match(/[\$€£¥₹₪₽₩฿₺₣₱₫₴]\s*\d+/g) || []).length;
    if (parentText.length > combinedText.length && parentText.length < 100 && priceCount <= 1) {
      combinedText = parentText;
    }
  }

  // Clean up and normalize the combined text
  combinedText = normalizePriceText(combinedText);

  return combinedText;
}

// ⭐ SUPER SMART: Intelligent decimal separator detection
function detectDecimalSeparator(text, currency) {
  // Currency-based hints (European countries use comma as decimal)
  const europeanCurrencies = ['EUR', 'DKK', 'SEK', 'NOK', 'PLN', 'CZK', 'HUF', 'RON', 'BGN', 'HRK'];
  const preferComma = europeanCurrencies.includes(currency);

  // Analyze the number structure
  const hasComma = text.includes(',');
  const hasDot = text.includes('.');
  const hasBoth = hasComma && hasDot;

  if (hasBoth) {
    // Find which appears last (that's likely the decimal separator)
    const lastCommaIndex = text.lastIndexOf(',');
    const lastDotIndex = text.lastIndexOf('.');

    // Check digit count after each separator
    const afterComma = text.slice(lastCommaIndex + 1).match(/^\d+/)?.[0]?.length || 0;
    const afterDot = text.slice(lastDotIndex + 1).match(/^\d+/)?.[0]?.length || 0;

    // If last separator has exactly 2 digits after it, it's the decimal
    if (lastCommaIndex > lastDotIndex && afterComma === 2) {
      return 'comma'; // European format: 1.234,56
    } else if (lastDotIndex > lastCommaIndex && afterDot === 2) {
      return 'dot'; // US format: 1,234.56
    }

    // Position-based: whichever comes last is likely decimal
    return lastCommaIndex > lastDotIndex ? 'comma' : 'dot';
  }

  // Only one separator - check digit count after it
  if (hasComma) {
    const afterComma = text.slice(text.lastIndexOf(',') + 1).match(/^\d+/)?.[0]?.length || 0;
    // 2 digits = decimal, 3+ = thousands separator (ambiguous), 1 = likely decimal
    if (afterComma === 2 || afterComma === 1) return 'comma';
    // Ambiguous: use currency hint
    return preferComma ? 'comma' : 'dot';
  }

  if (hasDot) {
    const afterDot = text.slice(text.lastIndexOf('.') + 1).match(/^\d+/)?.[0]?.length || 0;
    if (afterDot === 2 || afterDot === 1) return 'dot';
    // Ambiguous: use currency hint
    return preferComma ? 'comma' : 'dot';
  }

  // No separator - assume whole number
  return 'none';
}

// Extract price amount from text
function extractAmount(text, currency, element = null) {
  // Normalize and clean text
  text = normalizePriceText(text);

  // Try to extract fragmented price if element is provided (for AliExpress-style prices)
  if (element) {
    const fragmentedText = extractFragmentedPrice(element);
    if (fragmentedText && fragmentedText !== text && fragmentedText.length > text.length) {
      log('🔍 Found fragmented price:', fragmentedText, 'from original:', text);
      text = fragmentedText;
    }
  }

  // Common price patterns (more comprehensive)
  const patterns = [
    // US dollar: US $123.45, US$123.45
    /US\s*\$\s*(\d{1,3}(?:[,.\s]\d{3})*(?:[.,]\d{1,2})?)/i,
    // Symbol before number: $123.45, €123,45, €12,99
    /[€£¥₹₪₽₩฿₺₣₱₫₴]\s*(\d{1,3}(?:[,.\s]\d{3})*(?:[.,]\d{1,2})?)/,
    // Multi-char symbols: C$123.45, A$123.45
    /[CANZHSR]\$\s*(\d{1,3}(?:[,.\s]\d{3})*(?:[.,]\d{1,2})?)/,
    // NT$ symbol
    /NT\$\s*(\d{1,3}(?:[,.\s]\d{3})*(?:[.,]\d{1,2})?)/,
    // Symbol after number: 123.45zł, 123Ft
    /(\d{1,3}(?:[,.\s]\d{3})*(?:[.,]\d{1,2})?)\s*(?:zł|Kč|Ft|lei|kr)/,
    // Dollar sign (various types)
    /\$\s*(\d{1,3}(?:[,.\s]\d{3})*(?:[.,]\d{1,2})?)/,
    // Currency code: 123.45 USD, USD 123.45
    /(?:USD|EUR|GBP|JPY|INR|ILS|CAD|AUD|CHF|CNY|BRL|RUB|KRW|THB|TRY|ZAR|SEK|NOK|DKK|PLN|CZK|HUF|MXN|NZD|SGD|HKD|TWD|AED|SAR|PHP|VND|UAH|RON|ISK|KWD|QAR|EGP)?\s*(\d{1,3}(?:[,.\s]\d{3})*(?:[.,]\d{1,2})?)\s*(?:USD|EUR|GBP|JPY|INR|ILS|CAD|AUD|CHF|CNY|BRL|RUB|KRW|THB|TRY|ZAR|SEK|NOK|DKK|PLN|CZK|HUF|MXN|NZD|SGD|HKD|TWD|AED|SAR|PHP|VND|UAH|RON|ISK|KWD|QAR|EGP)?/i,
    // Arabic/special symbols
    /[د\.إ﷼]\s*(\d{1,3}(?:[,.\s]\d{3})*(?:[.,]\d{1,2})?)/,
    // Fragmented price pattern (for AliExpress): "US $" followed by digits split across elements
    /US\s*\$?\s*(\d+)\s*\.?\s*(\d+)/i,
    // Just currency symbol followed by fragmented numbers
    /\$\s*(\d+)\s*\.?\s*(\d+)/,
    // Price with just numbers (last resort)
    /(\d{1,3}(?:[,.\s]\d{3})*(?:[.,]\d{1,2})?)/
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      let amountStr = match[1] || match[2];

      // Handle fragmented price (e.g., "6" and "19" from separate spans)
      if (match[1] && match[2] && pattern.source.includes('\\d+') && pattern.source.includes('\\d+')) {
        // This is a fragmented price pattern - combine the parts
        amountStr = match[1] + '.' + match[2];
        log('🔧 Reconstructed fragmented price:', amountStr, 'from parts:', match[1], match[2]);
      }

      if (amountStr) {
        // Clean amount: remove spaces and non-breaking spaces
        let cleaned = amountStr.replace(/\s/g, '').replace(/\u00A0/g, '');

        // ⭐ SUPER SMART: Use intelligent decimal separator detection
        const decimalSeparator = detectDecimalSeparator(cleaned, currency);

        if (decimalSeparator === 'comma') {
          // European format: 1.234,56 → remove dots, replace comma with dot
          cleaned = cleaned.replace(/\./g, '').replace(',', '.');
          log('🧠 Detected European format (comma decimal)');
        } else if (decimalSeparator === 'dot') {
          // US format: 1,234.56 → remove commas
          cleaned = cleaned.replace(/,/g, '');
          log('🧠 Detected US format (dot decimal)');
        } else {
          // No decimal separator or ambiguous - keep as is
          cleaned = cleaned.replace(/[,.]/g, '');
        }

        const result = parseFloat(cleaned);
        if (!isNaN(result) && isFinite(result) && result > 0) {
          log('✅ Extracted amount:', result, 'from text:', text);
          return result;
        }
      }
    }
  }

  return null;
}

// Calculate conversion
function calculateConversion(amount, sourceCurrency, targetCurrency) {
  if (!exchangeRates[sourceCurrency] || !exchangeRates[targetCurrency]) {
    return null;
  }

  const usdAmount = amount / exchangeRates[sourceCurrency];
  const convertedAmount = usdAmount * exchangeRates[targetCurrency];

  return isNaN(convertedAmount) || !isFinite(convertedAmount) ? null : convertedAmount;
}

// ⭐ NEW: Setup right-click context menu on detected prices
let lastClickedPrice = null;

// ⭐ ULTRA SMART: Detect which specific price was clicked in multi-price elements
function detectClickedPrice(element, event) {
  // 🔧 FRAGMENTED PRICE FIX: AliExpress splits prices across multiple spans
  // Example: <span>US $</span><span>54</span><span>.</span><span>95</span>
  // We need to assemble the complete price first!
  const fragmentedText = extractFragmentedPrice(element);
  const elementText = fragmentedText || element.textContent || element.innerText;

  log('🔍 Detecting clicked price:');
  log(`   Element text: "${element.textContent}"`);
  log(`   Fragmented: "${fragmentedText}"`);
  log(`   Final text: "${elementText}"`);

  // 🌍 UNIVERSAL PRICE PATTERN - Detects ALL formats:
  // "US $2.01", "$2.01", "USD 2.01", "2.01 USD", "US 2.01", "₪2.01", "2.01 ILS", etc.
  const pricePattern = new RegExp(
    // Optional country prefix: US, UK, AU, CA, NZ, HK, SG, EU, etc.
    '(?:(?:US|UK|AU|CA|NZ|HK|SG|EU|JP|CN|IN|IL|BR|RU|KR|TH|TR|ZA|SE|NO|DK|PL|CZ|HU|MX|TW|AE|SA|PH|VN|UA|RO|IS|KW|QA|EG)\\s+)?' +
    // Currency symbol OR code BEFORE number
    '(?:([\\$€£¥₹₪₽₩฿₺₣₱₫₴]|USD|EUR|GBP|JPY|CNY|INR|ILS|CAD|AUD|CHF|BRL|RUB|KRW|THB|TRY|ZAR|SEK|NOK|DKK|PLN|CZK|HUF|MXN|NZD|SGD|HKD|TWD|AED|SAR|PHP|VND|UAH|RON|ISK|KWD|QAR|EGP)\\s*)?' +
    // The number with optional separators
    '(\\d{1,3}(?:[,.]\\d{3})*(?:[.,]\\d{1,2})?)' +
    // Currency code AFTER number (optional)
    '(?:\\s*(?:USD|EUR|GBP|JPY|CNY|INR|ILS|CAD|AUD|CHF|BRL|RUB|KRW|THB|TRY|ZAR|SEK|NOK|DKK|PLN|CZK|HUF|MXN|NZD|SGD|HKD|TWD|AED|SAR|PHP|VND|UAH|RON|ISK|KWD|QAR|EGP))?',
    'gi'
  );
  const allPrices = [];
  let match;

  while ((match = pricePattern.exec(elementText)) !== null) {
    allPrices.push({
      text: match[0],
      startIndex: match.index,
      endIndex: match.index + match[0].length
    });
  }

  log(`🔍 Found ${allPrices.length} prices in element: "${elementText}"`);
  allPrices.forEach((p, i) => log(`   ${i + 1}. "${p.text}" at position ${p.startIndex}-${p.endIndex}`));

  // If only one price, return it
  if (allPrices.length === 1) {
    log('✅ Single price detected, using:', allPrices[0].text);
    return allPrices[0];
  }

  // Multiple prices - need to detect which one was clicked
  if (allPrices.length > 1) {
    // Try to use click position to determine which price
    try {
      // Get click position relative to element
      const rect = element.getBoundingClientRect();
      const clickX = event.clientX - rect.left;
      const clickY = event.clientY - rect.top;

      // Use Range API to find text at click position
      let clickedPrice = null;
      let minDistance = Infinity;

      // Check each price's position
      for (const price of allPrices) {
        // Create a range for this price
        const range = document.createRange();
        const textNode = findTextNodeContaining(element, price.text);

        if (textNode) {
          try {
            const startOffset = textNode.textContent.indexOf(price.text);
            if (startOffset !== -1) {
              range.setStart(textNode, startOffset);
              range.setEnd(textNode, startOffset + price.text.length);

              const priceRect = range.getBoundingClientRect();
              const priceX = priceRect.left - rect.left + priceRect.width / 2;
              const priceY = priceRect.top - rect.top + priceRect.height / 2;

              // Calculate distance from click to price center
              const distance = Math.sqrt(Math.pow(clickX - priceX, 2) + Math.pow(clickY - priceY, 2));

              log(`   📏 Distance to "${price.text}": ${Math.round(distance)}px`);

              if (distance < minDistance) {
                minDistance = distance;
                clickedPrice = price;
              }
            }
          } catch (rangeError) {
            logWarn('Range error for price:', price.text);
          }
        }
      }

      if (clickedPrice) {
        log(`✅ Detected clicked price: "${clickedPrice.text}" (${Math.round(minDistance)}px away)`);
        return clickedPrice;
      }
    } catch (error) {
      logWarn('Click detection failed:', error);
    }

    // Fallback: Use last (rightmost/bottom) price as it's usually the main one
    const lastPrice = allPrices[allPrices.length - 1];
    log(`⚠️ Using fallback (last price): "${lastPrice.text}"`);
    return lastPrice;
  }

  return null;
}

// Helper: Find text node containing specific text
function findTextNodeContaining(element, text) {
  const walker = document.createTreeWalker(
    element,
    NodeFilter.SHOW_TEXT,
    null,
    false
  );

  let node;
  while (node = walker.nextNode()) {
    if (node.textContent.includes(text)) {
      return node;
    }
  }
  return null;
}

function setupPriceContextMenu(element) {
  // Add cursor style to indicate it's clickable
  if (!settings.replacePrice) {
    element.style.cursor = 'context-menu';
  }

  // Remove old listener if exists
  element.oncontextmenu = null;

  // Add right-click listener
  element.addEventListener('contextmenu', function(e) {
    // 🔧 FRAGMENTED PRICE: Find the correct price container (not too large, not too small)
    let targetElement = element;

    // If clicked on small element, try to find the right price container
    if (element.textContent.trim().length < 10 && element.parentElement) {
      let currentElement = element;
      let bestPriceContainer = element; // Default to clicked element
      let depth = 0;

      // Walk up max 3 levels to find the right price container
      while (currentElement && depth < 3) {
        currentElement = currentElement.parentElement;
        if (!currentElement) break;

        const text = currentElement.textContent.trim();
        const classes = currentElement.className || '';
        const id = currentElement.id || '';
        const childCount = currentElement.children.length;

        // Skip if text is too long (indicates large container)
        if (text.length > 50) {
          log(`⏭️ Skipping parent at depth ${depth}: too much text (${text.length} chars)`);
          break;
        }

        // Skip if has too many children (indicates large container)
        if (childCount > 10) {
          log(`⏭️ Skipping parent at depth ${depth}: too many children (${childCount})`);
          break;
        }

        // Check if this is a price-specific element
        const isPriceElement = /^(a-price|price|priceToPay|apexPrice)$/i.test(classes.split(' ')[0]) ||
                               /^(price|amount|cost|value)$/i.test(currentElement.tagName.toLowerCase());

        // Reject large containers
        const isLargeContainer = /(feature|widget|section|container|wrapper|card|item|product|listing|celwidget|twister)/i.test(id + ' ' + classes);

        if (isPriceElement && !isLargeContainer) {
          bestPriceContainer = currentElement;
          log(`✅ Found price container at depth ${depth}: ${currentElement.tagName}.${classes || '(no class)'}`);
          log(`   Text: "${text.substring(0, 30)}..." (${text.length} chars, ${childCount} children)`);
          break; // Found it!
        } else if (isLargeContainer) {
          log(`❌ Rejected at depth ${depth}: Large container detected (${id || classes})`);
          break;
        }

        depth++;
      }

      targetElement = bestPriceContainer;

      if (targetElement !== element) {
        log(`🔧 Using price container: ${targetElement.tagName}.${targetElement.className || '(no class)'}`);
      } else {
        log(`⚠️ No better container found, using clicked element`);
      }
    }

    // ⭐ CRITICAL VALIDATION: Final safety check - NEVER use large containers
    const finalId = targetElement.id || '';
    const finalClasses = targetElement.className || '';
    const finalText = targetElement.textContent.trim();
    const isFinalLargeContainer = /(feature|widget|section|container|wrapper|card|item|product|listing|celwidget|twister)/i.test(finalId + ' ' + finalClasses);

    if (isFinalLargeContainer || finalText.length > 50 || targetElement.children.length > 10) {
      log(`🚫 REJECTED final target element (too large):`);
      log(`   ID: ${finalId}`);
      log(`   Classes: ${finalClasses}`);
      log(`   Text length: ${finalText.length}`);
      log(`   Children: ${targetElement.children.length}`);
      log(`   Reverting to clicked element`);
      targetElement = element; // Revert to the actual clicked element
    }

    // ⭐ DETECT WHICH SPECIFIC PRICE WAS CLICKED
    const clickedPriceInfo = detectClickedPrice(targetElement, e);

    // ⭐ FINAL CHECK: Do NOT store if element is still a large container
    const storeId = targetElement.id || '';
    const storeClasses = targetElement.className || '';
    const storeText = targetElement.textContent.trim();
    const isStillLargeContainer = /(feature|widget|section|container|wrapper|card|item|product|listing|celwidget|twister)/i.test(storeId + ' ' + storeClasses);

    // ⭐ SMART: If we found a valid SINGLE price, ALLOW the element even if it matches large container pattern
    const hasValidPrice = clickedPriceInfo && clickedPriceInfo.text;
    const priceCount = (storeText.match(/[\$€£¥₹₪₽₩]\s*\d+/g) || []).length;
    const hasSinglePrice = hasValidPrice && priceCount === 1;
    const shouldReject = isStillLargeContainer && !hasSinglePrice;

    // Block if it's a known large container AND (no valid price found OR multiple prices)
    if (shouldReject) {
      log('🚫 Skipping large container (no single price found), keeping previous element');
      log(`   Ignoring: ${targetElement.tagName}#${storeId}.${storeClasses}`);
      log(`   Prices found: ${priceCount}`);
      // Don't store this element, but don't return - let previous lastClickedPrice remain
      // and continue to send message to background
    } else {
      if (isStillLargeContainer && hasSinglePrice) {
        log('✅ Allowing large container because valid SINGLE price was found');
      }

      // ⭐ SMART: Don't overwrite if we already have a better (more specific) element
      const shouldStore = !lastClickedPrice ||
                          !lastClickedPrice.timestamp ||
                          (Date.now() - lastClickedPrice.timestamp) > 1000 || // More than 1 second old
                          lastClickedPrice.element.contains(targetElement); // New element is a child (more specific)

      if (shouldStore) {
        // Store the clicked element with timestamp for reliability
        lastClickedPrice = {
          element: targetElement, // Use parent for fragmented prices
          originalPrice: targetElement.dataset.originalPrice,
          sourceCurrency: targetElement.dataset.sourceCurrency,
          sourceAmount: targetElement.dataset.sourceAmount,
          targetAmount: targetElement.dataset.targetAmount,
          convertedText: targetElement.dataset.convertedText,
          timestamp: Date.now(),
          // NEW: Store clicked price details
          clickedPriceText: clickedPriceInfo ? clickedPriceInfo.text : null,
          clickedPriceStart: clickedPriceInfo ? clickedPriceInfo.startIndex : null,
          clickedPriceEnd: clickedPriceInfo ? clickedPriceInfo.endIndex : null,
          hasMultiplePrices: targetElement.textContent.match(/[\$€£¥₹₪₽₩]\s*\d+/g)?.length > 1
        };
        log('🖱️ Right-clicked on detected price:', lastClickedPrice);
      } else if (targetElement.contains(lastClickedPrice.element)) {
        // Parent element trying to overwrite child - keep child element
        log('⏭️ Skipping parent element, keeping more specific child element');
      }
    } // Close the else block

    // Notify background to show context menu (happens regardless of whether we stored new element)
    if (lastClickedPrice) {
      try {
      chrome.runtime.sendMessage({
        type: 'updateContextMenu',
        selectedText: targetElement.dataset.originalPrice || targetElement.textContent,
        isDetectedPrice: true,
        clickedPrice: {
          source: lastClickedPrice.sourceCurrency,
          amount: lastClickedPrice.sourceAmount,
          converted: lastClickedPrice.convertedText,
          timestamp: lastClickedPrice.timestamp
        }
      });
        log('✅ Sent updateContextMenu with detected price data');
      } catch (error) {
        // Ignore "Extension context invalidated" errors (happens after extension reload)
        if (error.message?.includes('Extension context invalidated')) {
          log('ℹ️ Extension was updated. Please reload this page (F5) for full functionality.');
        } else {
          logError('❌ Failed to send context menu update:', error);
        }
      }
    } // Close if (lastClickedPrice)

    // Don't prevent default - let browser show context menu
    // return true;
  });
}

// Apply conversion to element
function applyConversion(element, amount, sourceCurrency, convertedAmount, targetCurrency) {
  const targetSymbol = getCurrencySymbol(targetCurrency);
  const sourceSymbol = getCurrencySymbol(sourceCurrency);

  // Store original text if not already stored
  if (!element.dataset.originalPrice) {
    element.dataset.originalPrice = element.textContent;
  }

  // ⭐ Use helper to generate converted text with currency code preservation
  const originalPrice = element.dataset.originalPrice || element.textContent;
  const convertedText = generateConvertedText(originalPrice, convertedAmount, targetCurrency);

  // Store conversion data
  element.dataset.converted = 'true';
  element.dataset.sourceCurrency = sourceCurrency;
  element.dataset.sourceAmount = amount;
  element.dataset.targetAmount = convertedAmount.toFixed(2);
  element.dataset.convertedText = convertedText;

  // Apply styling based on settings
  if (settings.replacePrice) {
    // MODE 1: Replace Price with Conversion (preserve original styling)
    // ⭐ PRESERVE ORIGINAL STYLES - capture before modifying
    const originalStyles = getPreservedStyles(element);

    element.textContent = convertedText;
    element.title = `Original: ${element.dataset.originalPrice} (${sourceCurrency})`;

    // ⭐ APPLY PRESERVED STYLES - keeps same color, size, weight as original
    applyPreservedStyles(element, originalStyles);

    // Only add subtle visual hint that it's converted (optional dotted underline)
    if (settings.highlightPrices) {
      const highlightColors = getHighlightColors();
      element.style.borderBottom = `1px dotted ${highlightColors.borderColor}`;
    }
  } else {
    // MODE 2: Tooltip/Highlight (Original price stays)

    // Setup custom tooltip on hover if showTooltip enabled
    if (settings.showTooltip) {
      log('   Setting up custom tooltip listeners for element');

      // ⭐ Store conversion data in title for removal later
      // Check if convertedText already has currency code to avoid duplication
      const alreadyHasCode = convertedText.trim().startsWith(targetCurrency);
      element.title = alreadyHasCode ? convertedText : `${convertedText} ${targetCurrency}`;

      // Remove old listeners if any
      element.removeEventListener('mouseenter', element._tooltipEnter);
      element.removeEventListener('mouseleave', element._tooltipLeave);

      // Create new listeners and store references
      element._tooltipEnter = function(e) {
        log('🖱️ Mouse entered price element');
        log('   Will show tooltip:', convertedText, targetCurrency);
        customTooltip.show(convertedText, targetCurrency, element);
      };

      element._tooltipLeave = function(e) {
        log('🖱️ Mouse left price element');
        customTooltip.hide();
      };

      // Attach listeners
      element.addEventListener('mouseenter', element._tooltipEnter);
      element.addEventListener('mouseleave', element._tooltipLeave);

      element.dataset.hasTooltipListener = 'true';
      log('✅ Custom tooltip listeners attached');
    }
    // Only add native title if custom tooltip is OFF but inline conversion is ON
    else if (settings.showInlineConversion) {
      // Check if convertedText already has currency code to avoid duplication
      const alreadyHasCode = convertedText.trim().startsWith(targetCurrency);
      element.title = alreadyHasCode ? convertedText : `${convertedText} ${targetCurrency}`;
      log('   Added native title (custom tooltip disabled)');
    }

    // Add visual highlight if highlightPrices enabled
    if (settings.highlightPrices) {
      const highlightColors = getHighlightColors();
      element.style.borderBottom = `2px dotted ${highlightColors.borderColor}`;
      element.style.cursor = 'help';
    }
  }

  // ⭐ NEW: Add right-click context menu on detected prices
  setupPriceContextMenu(element);

  // Log conversion - avoid duplication if convertedText already has currency code
  const alreadyHasCode = convertedText.trim().startsWith(targetCurrency);
  const logText = alreadyHasCode ? convertedText : `${convertedText} ${targetCurrency}`;
  log(`✅ ${sourceSymbol}${amount} ${sourceCurrency} → ${logText}`);
}

// Find and convert prices
function convertPrices() {
  log('🔍 Looking for prices in ALL currencies...');

  const siteType = detectWebsiteType();
  log(`🌐 Detected site type: ${siteType}`);

  const selectors = getPriceSelectors(siteType);
  const priceElements = document.querySelectorAll(selectors.join(','));

  let converted = 0;
  let skipped = 0;

  // Process price elements
  for (const element of priceElements) {
    // Skip if already processed (using WeakSet for memory efficiency)
    if (processedElements.has(element)) continue;

    // Skip if already converted (backup check)
    if (element.dataset.converted === 'true') continue;

    // Get and normalize text content
    let text = normalizePriceText(element.textContent || element.innerText);
    if (!text || text.length > 150) continue; // Skip very long text

    // 🔧 FRAGMENTED PRICE FIX: Detect fragmented prices (AliExpress, Amazon, etc.)
    // AliExpress: <div class="kr_lo"><span>US $</span><span>54</span><span>.</span><span>95</span></div>
    // Amazon: <span class="a-price"><span class="a-price-symbol">$</span><span class="a-price-whole">24</span>...</span>
    let isFragmentedPrice = false;
    const childSpans = element.querySelectorAll('span');
    if (childSpans.length >= 2) {
      // Method 1: Check for Amazon-specific fragmented price classes
      const hasAmazonPriceStructure =
        element.querySelector('.a-price-symbol, .a-price-whole, .a-price-fraction, .a-price-decimal') !== null;

      // Method 2: Check for generic small spans (AliExpress style)
      const hasSmallSpans = Array.from(childSpans).some(span => {
        const spanText = span.textContent.trim();
        return spanText.length <= 3 && /^[\d\.$€£¥₹₪₽₩,.]+$/.test(spanText);
      });

      const hasCurrencySymbol = /[\$€£¥₹₪₽₩]|USD|EUR|GBP|ILS|JPY|CNY/.test(text);

      if ((hasAmazonPriceStructure || hasSmallSpans) && hasCurrencySymbol) {
        // This is a fragmented price container - mark it for confidence bypass
        isFragmentedPrice = true;
        const siteHint = hasAmazonPriceStructure ? 'Amazon' : 'Generic';
        log(`🧩 Detected ${siteHint} fragmented price container with ${childSpans.length} spans: "${text.slice(0, 50)}"`);

        // Try to extract/clean the price text
        const fragmentedPrice = extractFragmentedPrice(element);
        if (fragmentedPrice && fragmentedPrice.length > 0) {
          text = fragmentedPrice;
        }
      }
    }

    // ⭐ NEXT-LEVEL: Try to assemble price from sibling elements
    const assembledPrice = assembleCrossElementPrice(element);
    if (assembledPrice) {
      log(`🔗 Assembled cross-element price: "${assembledPrice}" from "${text}"`);
      text = assembledPrice;
    }

    // ⭐ COMPREHENSIVE SCORING: Rate element as price candidate (0-100)
    // Skip confidence check for successfully assembled fragmented prices
    const elementScore = scorePriceElement(element, text);
    if (!isFragmentedPrice && elementScore.total < 60) {
      log(`⏭️ Low confidence element (${elementScore.total}%) - Breakdown: Validation:${elementScore.breakdown.validation} Visual:${elementScore.breakdown.visual} Semantic:${elementScore.breakdown.semantic} Context:${elementScore.breakdown.contextual} Struct:${elementScore.breakdown.structural}`);
      skipped++;
      continue;
    }

    if (isFragmentedPrice) {
      log(`✅ Fragmented price bypasses confidence check - proceeding with conversion`);
    }

    log(`🎯 High-confidence price element (${elementScore.total}%) - Visual:${elementScore.details.visual.fontSize}px/${elementScore.details.visual.fontWeight} weight`);

    // ⭐ ADVANCED: Handle multi-currency displays
    const multiCurrency = detectMultiCurrency(text);
    if (multiCurrency.isMultiCurrency) {
      log(`💱 Multi-currency detected: Primary="${multiCurrency.primaryPrice}" Secondary="${multiCurrency.secondaryPrice}"`);
      text = multiCurrency.primaryPrice; // Use primary price
    }

    // ⭐ ADVANCED: Handle quantity pricing
    const quantityInfo = detectQuantityPricing(text);
    if (quantityInfo.isQuantityPrice) {
      if (quantityInfo.shouldSkip) {
        log(`🛒 Skipping bulk offer: "${text.slice(0, 30)}" (${quantityInfo.reason})`);
        skipped++;
        continue;
      }
      log(`📦 Quantity pricing detected: ${quantityInfo.quantity} for ${quantityInfo.priceText}`);
      text = quantityInfo.priceText; // Use the price part
    }

    // ⭐ SMART: Skip shipping costs (only convert product prices)
    if (isShippingCost(element)) {
      log(`📦 Skipping shipping cost: "${text.slice(0, 30)}"`);
      skipped++;
      continue;
    }

    // ⭐ SMART: Detect and handle old/sale prices
    const saleInfo = detectSalePrice(element);
    if (saleInfo.isOldPrice && saleInfo.confidence > 50) {
      log(`🏷️ Skipping old/comparison price: "${text.slice(0, 30)}" (confidence: ${saleInfo.confidence}%)`);
      skipped++;
      continue;
    }

    const sourceCurrency = detectCurrency(text);
    if (!sourceCurrency) continue;

    // SMART: Don't convert currency to itself!
    if (sourceCurrency === settings.defaultTargetCurrency) {
      skipped++;
      continue;
    }

    // ⭐ SMART: Handle price ranges - use minimum price
    const priceRange = detectPriceRange(text);
    if (priceRange.isRange) {
      log(`📊 Detected price range: ${priceRange.minPrice} - ${priceRange.maxPrice}`);
      text = priceRange.minPrice + ' ' + (priceRange.currency || sourceCurrency);
    }

    const amount = extractAmount(text, sourceCurrency, element);
    if (!amount || amount <= 0 || amount > 1000000000) continue;

    // Log successful detection with confidence
    log(`✅ Valid price detected (${elementScore.total}% confidence): ${sourceCurrency} ${amount}`);

    const convertedAmount = calculateConversion(amount, sourceCurrency, settings.defaultTargetCurrency);
    if (!convertedAmount) continue;

    // Apply conversion
    applyConversion(element, amount, sourceCurrency, convertedAmount, settings.defaultTargetCurrency);

    // Mark as processed
    processedElements.add(element);
    converted++;

    // Limit conversions per run to avoid performance issues
    if (converted >= 100) break;
  }

  // Strategy 2: TreeWalker for text nodes (catch any prices missed by selectors)
  if (converted < 50) {
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: function(node) {
          // Skip script, style, and already processed nodes
          const parent = node.parentElement;
          if (!parent) return NodeFilter.FILTER_REJECT;

          const tagName = parent.tagName.toLowerCase();
          if (tagName === 'script' || tagName === 'style' || tagName === 'noscript') {
            return NodeFilter.FILTER_REJECT;
          }

          if (processedElements.has(parent)) {
            return NodeFilter.FILTER_REJECT;
          }

          const text = node.textContent;
          // Quick check for currency symbols or codes
          if (/[$€£¥₹₪₽₩฿₺₣₱₫₴złKčFtlei]|\b(?:USD|EUR|GBP|JPY|INR|ILS|CAD|AUD|CHF|CNY|BRL|RUB|KRW|THB|TRY|ZAR|SEK|NOK|DKK|PLN|CZK|HUF|MXN|NZD|SGD|HKD|TWD|AED|SAR|PHP|VND|UAH|RON|ISK|KWD|QAR|EGP)\b/i.test(text)) {
            if (/\d/.test(text)) {
              return NodeFilter.FILTER_ACCEPT;
            }
          }

          return NodeFilter.FILTER_REJECT;
        }
      }
    );

    const textNodes = [];
    let node;
    while (node = walker.nextNode()) {
      textNodes.push(node);
      if (textNodes.length >= 100) break; // Limit for performance
    }

    log(`📝 Found ${textNodes.length} additional text nodes`);

    for (const textNode of textNodes) {
      const parent = textNode.parentElement;
      if (!parent || processedElements.has(parent)) continue;

      const text = textNode.textContent;
      const sourceCurrency = detectCurrency(text);
      if (!sourceCurrency) continue;

      if (sourceCurrency === settings.defaultTargetCurrency) {
        skipped++;
        continue;
      }

      const amount = extractAmount(text, sourceCurrency, parent);
      if (!amount || amount <= 0 || amount > 1000000000) continue;

      const convertedAmount = calculateConversion(amount, sourceCurrency, settings.defaultTargetCurrency);
      if (!convertedAmount) continue;

      // Apply conversion to parent element
      applyConversion(parent, amount, sourceCurrency, convertedAmount, settings.defaultTargetCurrency);

      processedElements.add(parent);
      converted++;

      if (converted >= 100) break;
    }
  }

  log(`🎯 Converted ${converted} prices, skipped ${skipped} same-currency`);
}

// Throttle function for performance
function throttle(func, limit) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// Debounce function
function debounce(func, wait) {
  let timeout;
  return function(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

// Initialize
async function init() {
  await loadSettings();
  await loadRates();

  // ⭐ Create tooltip element immediately after settings load
  if (settings.showTooltip) {
    log('🎨 Initializing custom tooltip...');
    customTooltip.create();
  }

  // Initial conversion with slight delay for DOM to be ready
  setTimeout(convertPrices, 1000);

  // Watch for dynamic content (Amazon, eBay, etc.)
  setupMutationObserver();

  // Re-scan on scroll for lazy-loaded content (throttled)
  const throttledConvert = throttle(convertPrices, 2000);
  window.addEventListener('scroll', throttledConvert, { passive: true });

  // Hide tooltip on scroll
  window.addEventListener('scroll', () => customTooltip.hide(true), { passive: true });

  // ⭐ GLOBAL CONTEXTMENU LISTENER: Capture right-clicks on ALL prices (converted or not)
  document.addEventListener('contextmenu', function(e) {
    // Store mouse position for Manifest V3 (pageX/pageY not available in context menu API)
    window.lastRightClickPosition = {
      x: e.pageX,
      y: e.pageY,
      clientX: e.clientX,
      clientY: e.clientY,
      timestamp: Date.now()
    };

    // Try to find a price element at the clicked position
    let target = e.target;
    let priceElement = null;
    let depth = 0;

    // Walk up the DOM to find a price container
    while (target && depth < 10) {
      const text = target.textContent?.trim() || '';

      // Check if this element or its data attributes indicate it's a price
      const hasPrice = /[\$€£¥₹₪₽₩฿₺₣₱₫₴]|USD|EUR|GBP|JPY|ILS|CAD/.test(text) && /\d/.test(text);
      const isConverted = target.dataset && (target.dataset.originalPrice || target.dataset.converted);

      if ((hasPrice || isConverted) && text.length < 300) {
        priceElement = target;
        log(`✅ Found price element at depth ${depth} for right-click`);
        break;
      }

      target = target.parentElement;
      depth++;
    }

    // Store the found price element
    if (priceElement) {
      window.lastRightClickElement = priceElement;
      log(`🖱️ Stored right-click on price element at (${e.pageX}, ${e.pageY})`);
    }
  }, { passive: true });
}

// Watch for dynamically loaded prices (throttled)
function setupMutationObserver() {
  const debouncedConvert = debounce(convertPrices, 500);

  const observer = new MutationObserver((mutations) => {
    let shouldConvert = false;

    for (const mutation of mutations) {
      if (mutation.addedNodes.length > 0) {
        // Check if any added nodes contain price-related content
        for (const node of mutation.addedNodes) {
          if (node.nodeType === 1) { // Element node
            const hasPrice = node.querySelector && (
              node.querySelector('[class*="price"]') ||
              node.querySelector('[id*="price"]') ||
              /[$€£¥₹₪₽₩฿₺]/.test(node.textContent || '') ||
              (node.className && typeof node.className === 'string' && node.className.includes('price'))
            );
            if (hasPrice) {
              shouldConvert = true;
              break;
            }
          }
        }
      }
      if (shouldConvert) break;
    }

    if (shouldConvert) {
      log('🔄 Dynamic content detected, re-scanning...');
      debouncedConvert();
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  log('👀 Watching for dynamic price updates');
}

// Start when ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// Manual trigger for testing
window.convertPrices = convertPrices;
window.customTooltip = customTooltip;

// ===== CONTEXT MENU INTEGRATION =====

// Track current selection for context menu
let currentSelection = null;

// Listen for text selection
document.addEventListener('mouseup', () => {
  const selectedText = window.getSelection().toString().trim();

  if (selectedText && selectedText.length > 0 && selectedText.length < 50) {
    currentSelection = {
      text: selectedText,
      selection: window.getSelection()
    };

    // Notify background to update context menu
    try {
      chrome.runtime.sendMessage({
        type: 'updateContextMenu',
        selectedText: selectedText
      });
    } catch (e) {
      // Ignore if extension context is invalidated
    }
  }
});

// Listen for messages from background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'replaceSelectedText') {
    replaceSelectedText(request);
    sendResponse({ success: true });
  }

  if (request.type === 'convertClickedPrice') {
    // ⭐ NEW: Handle conversion of clicked detected price
    convertClickedPrice();
    sendResponse({ success: true });
  }

  if (request.type === 'themeChanged') {
    // Update current theme
    currentTheme = request.theme || 'default';
    log('🎨 Theme changed to:', currentTheme);

    // Update tooltip theme if it exists
    if (customTooltip.element) {
      customTooltip.updateTheme();
    }

    // Apply theme via theme manager if available
    if (window.themeManager) {
      window.themeManager.applyTheme(request.theme);
    }
  }

  if (request.type === 'settingsUpdated') {
    // Reload settings and re-scan
    loadSettings().then(() => {
      // Clear cache when settings change
      conversionCache.clear();
      setTimeout(convertPrices, 500);
    });
  }

  if (request.type === 'findAndConvertPriceAtPosition') {
    // ⭐ NEW: Find and convert price at cursor position
    // Use stored position/element from global contextmenu listener (MV3 compatibility)
    let x = request.x || 0;
    let y = request.y || 0;
    let element = null;

    // Try to use stored right-click position and element
    if (window.lastRightClickPosition && (Date.now() - window.lastRightClickPosition.timestamp) < 2000) {
      x = window.lastRightClickPosition.x;
      y = window.lastRightClickPosition.y;
      element = window.lastRightClickElement;
      log(`🎯 Using stored right-click position (${x}, ${y})`);
    } else {
      log(`🎯 Finding price at position (${x}, ${y})`);
    }

    try {
      // Get element at position if not already stored
      if (!element) {
        element = document.elementFromPoint(x, y);
      }

      if (!element) {
        logWarn('⚠️ No element found at position');
        sendResponse({ success: false, message: 'No element at position' });
        return;
      }

      log('📍 Element at position:', element.tagName, element.className);

      // Check if clicked element or its parents contain a price
      let priceElement = null;
      let currentElement = element;
      let depth = 0;

      // Walk up the DOM tree to find a price element (max 10 levels for fragments)
      while (currentElement && depth < 10) {
        // ⭐ Priority 1: Check if element is already converted (has data attributes)
        if (currentElement.dataset && (currentElement.dataset.originalPrice || currentElement.dataset.converted)) {
          priceElement = currentElement;
          log(`✅ Found converted price element at depth ${depth}`);
          break;
        }

        const text = currentElement.textContent?.trim() || '';

        // ⭐ Priority 2: Check if this element has a complete price pattern
        if (text.length > 0 && text.length < 300) {
          const hasCurrency = /[\$€£¥₹₪₽₩฿₺₣₱₫₴]|US\s*\$|USD|EUR|GBP|JPY|CNY|INR|ILS|CAD|AUD|CHF|BRL|RUB|KRW|THB|TRY/i.test(text);
          const hasNumber = /\d+[.,]?\d*/.test(text);

          // ⭐ Priority 3: Check for fragmented prices (multiple child spans with numbers)
          const hasMultipleSpans = currentElement.querySelectorAll('span').length >= 2;
          const hasFragmentedNumber = /\d/.test(text) && /[\$€£¥₹₪₽₩฿₺₣₱₫₴]|US|EUR|GBP|ILS/.test(text);

          if ((hasCurrency && hasNumber) || (hasMultipleSpans && hasFragmentedNumber)) {
            priceElement = currentElement;
            log(`✅ Found price element at depth ${depth}:`, text.substring(0, 50));
            break;
          }
        }

        currentElement = currentElement.parentElement;
        depth++;
      }

      if (!priceElement) {
        logWarn('⚠️ No price found in clicked element or parents');
        sendResponse({ success: false, message: 'No price found' });
        return;
      }

      // Try to convert this element
      const text = normalizePriceText(priceElement.textContent || priceElement.innerText);
      const sourceCurrency = detectCurrency(text);
      const amount = extractAmount(text, sourceCurrency);

      if (!sourceCurrency || !amount) {
        logWarn('⚠️ Could not extract price from element:', text);
        sendResponse({ success: false, message: 'Could not parse price' });
        return;
      }

      log(`💱 Converting: ${amount} ${sourceCurrency} → ${settings.defaultTargetCurrency}`);

      // Get exchange rates from background
      chrome.runtime.sendMessage({ type: 'getExchangeRates' }, (response) => {
        if (!response || !response.rates) {
          logError('❌ Failed to get exchange rates');
          sendResponse({ success: false, message: 'Failed to get exchange rates' });
          return;
        }

        const rates = response.rates;
        const targetCurrency = settings.defaultTargetCurrency || 'ILS';

        if (!rates[sourceCurrency] || !rates[targetCurrency]) {
          logError('❌ Missing exchange rate for currency');
          sendResponse({ success: false, message: 'Missing exchange rate' });
          return;
        }

        // Convert amount
        const usdAmount = amount / rates[sourceCurrency];
        const convertedAmount = usdAmount * rates[targetCurrency];

        // Store original price if not already stored
        if (!priceElement.dataset.originalPrice) {
          priceElement.dataset.originalPrice = priceElement.textContent;
        }

        // ⭐ Use helper to generate converted text with currency code preservation
        const originalPrice = priceElement.dataset.originalPrice || priceElement.textContent;
        const convertedText = generateConvertedText(originalPrice, convertedAmount, targetCurrency);

        log(`✅ Converted: ${convertedText}`);

        // Preserve original styles
        const originalStyles = getPreservedStyles(priceElement);

        // Replace the price
        priceElement.textContent = convertedText;
        priceElement.title = `Original: ${priceElement.dataset.originalPrice} (${sourceCurrency})`;

        // Apply preserved styles
        applyPreservedStyles(priceElement, originalStyles);

        // Mark as converted
        priceElement.dataset.converted = 'true';
        priceElement.dataset.sourceCurrency = sourceCurrency;
        priceElement.dataset.sourceAmount = amount;
        priceElement.dataset.targetAmount = convertedAmount.toFixed(2);
        priceElement.dataset.convertedText = convertedText;

        // Add to processed elements
        processedElements.add(priceElement);

        log('✅ Price converted successfully at cursor position');
        sendResponse({ success: true, message: 'Price converted' });
      });

      // Return true to indicate async response
      return true;
    } catch (error) {
      logError('❌ Error finding/converting price at position:', error);
      sendResponse({ success: false, message: error.message });
    }
  }

});

// ⭐ FIXED: Convert clicked detected price - ACTUALLY REPLACE TEXT
function convertClickedPrice() {
  if (!lastClickedPrice) {
    logWarn('No clicked price found');
    return;
  }

  const element = lastClickedPrice.element;
  const sourceCurrency = lastClickedPrice.sourceCurrency;
  const sourceAmount = parseFloat(lastClickedPrice.sourceAmount);
  const originalPrice = lastClickedPrice.originalPrice;
  const targetCurrency = settings.defaultTargetCurrency;

  if (!element) {
    logWarn('⚠️ No element found for clicked price');
    return;
  }

  // ⭐ CRITICAL: If element is a large container, find the actual price element inside it
  const elementId = element.id || '';
  const elementClasses = element.className || '';
  const elementText = element.textContent.trim();

  // ⭐ SMART: If element is already a detected/converted price element, skip large container check
  const isDetectedPrice = element.dataset.originalPrice && element.dataset.sourceCurrency;
  const isLargeContainer = !isDetectedPrice && /(feature|widget|section|container|wrapper|card|item|product|listing|celwidget|twister)/i.test(elementId + ' ' + elementClasses);

  if (isLargeContainer || elementText.length > 100 || element.children.length > 15) {
    log('⚠️ Large container detected, searching for actual price element inside...');

    // Find the actual price element inside this container
    const priceSelectors = [
      // Amazon selectors
      '.a-price',
      '.priceToPay',
      '[class*="price"][class*="pay"]',
      'span[data-a-color="price"]',
      // AliExpress selectors
      '.cart-product-price-buynow',
      '.cart-product-price-activity',
      '[class*="cart-product-price"]',
      // Generic - any converted element with single price
      '[data-original-price]'
    ];

    let actualPriceElement = null;
    for (const selector of priceSelectors) {
      // Get ALL matching elements, find one with single price
      const candidates = element.querySelectorAll(selector);
      for (const candidate of candidates) {
        const candidateText = candidate.textContent.trim();
        const priceCount = (candidateText.match(/[\$€£¥₹₪₽₩]\s*\d+/g) || []).length;

        // Only use if it has exactly 1 price (not a container with multiple prices)
        if (priceCount === 1) {
          actualPriceElement = candidate;
          log(`✅ Found actual price element: ${actualPriceElement.className}`);
          log(`   Single price: "${candidateText.substring(0, 50)}"`);
          // Replace the element reference with the actual price element
          lastClickedPrice.element = actualPriceElement;
          lastClickedPrice.originalPrice = actualPriceElement.dataset.originalPrice || actualPriceElement.textContent;
          // Continue conversion with the correct element
          return convertClickedPrice(); // Recursive call with correct element
        }
      }
    }

    // If we still can't find a price element, abort
    logWarn('🚫 BLOCKED: Large container with no price element found inside');
    return;
  }

  // ⭐ SMART: Skip if source currency is same as target currency
  if (sourceCurrency === targetCurrency) {
    log(`⏭️ Skipping: ${sourceCurrency} is already ${targetCurrency}`);
    return;
  }

  log('💱 CONVERTING:', {
    from: `${sourceCurrency} ${sourceAmount}`,
    to: targetCurrency,
    clickedText: lastClickedPrice.clickedPriceText
  });

  // Get convertedText from element's dataset or calculate it
  let convertedText = element.dataset.convertedText;

  if (!convertedText) {
    // Calculate conversion if not already stored
    const convertedAmount = (sourceAmount / exchangeRates[sourceCurrency]) * exchangeRates[targetCurrency];

    // ⭐ Use helper to generate converted text with currency code preservation
    // Prefer clicked price text (has full context), fallback to element text
    const originalPrice = lastClickedPrice.clickedPriceText ||
                         element.dataset.originalPrice ||
                         element.textContent;
    convertedText = generateConvertedText(originalPrice, convertedAmount, targetCurrency);
    log('📊 Calculated conversion:', convertedText);
  }

  // Store the original price if not already stored
  if (!element.dataset.replacedOriginal) {
    element.dataset.replacedOriginal = originalPrice;
    element.dataset.replacedOriginalHTML = element.innerHTML;
  }

  const textContent = element.textContent.trim();
  const htmlContent = element.innerHTML;

  // ⭐ ULTRA SMART: Handle multi-price elements (e.g., "US $1.00 off over US $19.00")
  if (lastClickedPrice.hasMultiplePrices && lastClickedPrice.clickedPriceText) {
    log('💰 MULTI-PRICE ELEMENT DETECTED!');
    log(`   Full text: "${textContent}"`);
    log(`   Clicked price: "${lastClickedPrice.clickedPriceText}"`);
    log(`   Position: ${lastClickedPrice.clickedPriceStart}-${lastClickedPrice.clickedPriceEnd}`);

    // Parse the clicked price to get its amount for conversion
    const clickedCurrency = detectCurrency(lastClickedPrice.clickedPriceText);
    const clickedAmount = extractAmount(lastClickedPrice.clickedPriceText, clickedCurrency);

    if (clickedAmount && clickedCurrency) {
      // Calculate conversion for the specific clicked price
      const targetCurrency = settings.defaultTargetCurrency;
      const convertedAmount = calculateConversion(clickedAmount, clickedCurrency, targetCurrency);

      // ⭐ Use helper to generate converted text with currency code preservation
      const clickedPriceText = lastClickedPrice.clickedPriceText;
      const specificConvertedText = generateConvertedText(clickedPriceText, convertedAmount, targetCurrency);

      log(`   Converting clicked price: ${clickedCurrency} ${clickedAmount} → ${specificConvertedText}`);

      // Replace ONLY the clicked price in the text, keep everything else
      const newText = textContent.substring(0, lastClickedPrice.clickedPriceStart) +
                      specificConvertedText +
                      textContent.substring(lastClickedPrice.clickedPriceEnd);

      log(`   Result: "${newText}"`);

      // ⭐ PRESERVE ORIGINAL STYLES before any replacement
      const originalStyles = getPreservedStyles(element);
      log('🎨 Captured original styles:', originalStyles);

      // Update element text while preserving structure
      if (element.childNodes.length === 1 && element.childNodes[0].nodeType === Node.TEXT_NODE) {
        // Simple text node - replace and reapply styles
        element.textContent = newText;
        // ⭐ REAPPLY STYLES to ensure they're preserved
        applyPreservedStyles(element, originalStyles);
        log('🎨 Reapplied styles to element after text replacement');
      } else {
        // ⭐ IMPROVED: Replace in ALL text nodes containing the clicked price
        // (Amazon has duplicate spans - screen reader + visible)
        const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, null, false);
        let replaced = false;
        let nodeCount = 0;
        let replacementCount = 0;
        const clickedPriceText = lastClickedPrice.clickedPriceText;

        log(`🔍 TreeWalker: Searching for "${clickedPriceText}" in text nodes...`);

        let node;
        while (node = walker.nextNode()) {
          nodeCount++;
          const nodeText = node.textContent;
          log(`   📄 Text node ${nodeCount}: "${nodeText.substring(0, 50)}${nodeText.length > 50 ? '...' : ''}"`);

          // Check if this text node contains the clicked price
          if (nodeText.includes(clickedPriceText)) {
            const beforeText = nodeText;
            // Replace ALL occurrences in this text node
            node.textContent = nodeText.replaceAll(clickedPriceText, specificConvertedText);
            const afterText = node.textContent;
            replaced = true;
            replacementCount++;
            log(`   ✅ Replaced in text node ${nodeCount}:`);
            log(`      Before: "${beforeText}"`);
            log(`      After: "${afterText}"`);
            // DON'T break - continue to replace in ALL text nodes (Amazon has multiple spans)
          }
        }

        log(`📊 TreeWalker completed: ${nodeCount} text nodes found, ${replacementCount} replacements made`);

        // ⭐ FRAGMENTED PRICE HANDLER: If we didn't replace all expected prices, handle fragments
        if (replacementCount < 2 && nodeCount > 2) {
          log('🔧 Detecting fragmented prices...');

          // Parse the converted price parts
          // Handle: "₪158.97", "₪ 158.97", "ILS ₪158.97", "ILS ₪ 158.97"
          const convertedWithCodeMatch = specificConvertedText.match(/^([A-Z]{3})\s+([\$€£¥₹₪₽₩฿₺₣₱₫₴])\s*([\d.,]+)$/);
          const convertedWithoutCodeMatch = specificConvertedText.match(/^([\$€£¥₹₪₽₩฿₺₣₱₫₴])\s*([\d.,]+)$/);

          let convertedCurrencyCode = null;
          let convertedSymbol = null;
          let convertedAmount = null;

          if (convertedWithCodeMatch) {
            // "ILS ₪158.97" format
            convertedCurrencyCode = convertedWithCodeMatch[1]; // "ILS"
            convertedSymbol = convertedWithCodeMatch[2]; // "₪"
            convertedAmount = convertedWithCodeMatch[3]; // "158.97"
            log(`   Converted parts: "${convertedCurrencyCode}" + "${convertedSymbol}" + "${convertedAmount}"`);
          } else if (convertedWithoutCodeMatch) {
            // "₪158.97" format
            convertedSymbol = convertedWithoutCodeMatch[1]; // "₪"
            convertedAmount = convertedWithoutCodeMatch[2]; // "158.97"
            log(`   Converted parts: "${convertedSymbol}" + "${convertedAmount}"`);
          }

          if (convertedAmount) {
            const [wholePart, fractionPart] = convertedAmount.split('.');

            // Second pass: replace fragmented components
            const walker2 = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, null, false);
            let fragmentsReplaced = 0;

            let node2;
            while (node2 = walker2.nextNode()) {
              const text = node2.textContent.trim();

              // Skip if already converted
              if (text.includes('₪') || text.includes(convertedSymbol)) {
                continue;
              }

              // ⭐ PRESERVE STYLES: Capture parent element's styles before replacing
              const parentElement = node2.parentElement;
              const parentStyles = parentElement ? getPreservedStyles(parentElement) : null;

              // Replace currency code (US, HK, AU, etc.)
              if (convertedCurrencyCode && /^(US|HK|AU|CA|NZ|SG|C|A|S)$/i.test(text)) {
                node2.textContent = node2.textContent.replace(text, convertedCurrencyCode);
                // ⭐ REAPPLY STYLES to parent element
                if (parentElement && parentStyles) {
                  applyPreservedStyles(parentElement, parentStyles);
                }
                fragmentsReplaced++;
                log(`   ✅ Replaced currency code: "${text}" → "${convertedCurrencyCode}"`);
              }
              // Replace currency symbol
              else if (text === '$' || text === 'USD' || /^[\$€£¥₹₽₩]$/.test(text)) {
                node2.textContent = node2.textContent.replace(text, convertedSymbol);
                // ⭐ REAPPLY STYLES to parent element
                if (parentElement && parentStyles) {
                  applyPreservedStyles(parentElement, parentStyles);
                }
                fragmentsReplaced++;
                log(`   ✅ Replaced symbol: "${text}" → "${convertedSymbol}"`);
              }
              // Replace whole number part
              else if (wholePart && text === clickedAmount.toString().split('.')[0]) {
                node2.textContent = wholePart;
                // ⭐ REAPPLY STYLES to parent element
                if (parentElement && parentStyles) {
                  applyPreservedStyles(parentElement, parentStyles);
                }
                fragmentsReplaced++;
                log(`   ✅ Replaced whole part: "${text}" → "${wholePart}"`);
              }
              // Replace decimal point
              else if (text === '.' && fractionPart) {
                // Keep decimal point as-is
                log(`   ✅ Keeping decimal: "."`);
              }
              // Replace fraction part
              else if (fractionPart && text === clickedAmount.toString().split('.')[1]) {
                node2.textContent = fractionPart;
                // ⭐ REAPPLY STYLES to parent element
                if (parentElement && parentStyles) {
                  applyPreservedStyles(parentElement, parentStyles);
                }
                fragmentsReplaced++;
                log(`   ✅ Replaced fraction: "${text}" → "${fractionPart}"`);
              }
            }

            if (fragmentsReplaced > 0) {
              log(`📊 Fragmented price handler: ${fragmentsReplaced} fragments replaced`);
              replaced = true;
            }
          }
        }

        if (!replaced) {
          // Fallback: replace entire text (shouldn't happen, but safe)
          element.textContent = newText;
          log('⚠️ Used fallback text replacement');
        }
      }

      element.title = `Original: ${textContent} (converted "${lastClickedPrice.clickedPriceText}")`;
      element.dataset.replacedNow = 'true';
      log('✅ Multi-price element: Replaced ONLY clicked price');
      return;
    }
  }

  // ⭐ CRITICAL: Check if element contains text BEYOND the price
  // Extract all prices from the text
  const pricePattern = /(?:US\s*)?([\$€£¥₹₪₽₩]|USD|EUR|GBP|JPY|CNY|INR|ILS|CAD|AUD|CHF|BRL|RUB|KRW|THB|TRY|ZAR|SEK|NOK|DKK|PLN|CZK|HUF|MXN|NZD|SGD|HKD|TWD|AED|SAR|PHP|VND|UAH|RON|ISK|KWD|QAR|EGP)\s*\d+(?:[.,]\d{1,2})?/gi;
  const allPrices = textContent.match(pricePattern) || [];
  const totalPriceLength = allPrices.reduce((sum, price) => sum + price.length, 0);

  // Calculate how much non-price text exists
  const nonPriceTextLength = textContent.replace(/\s+/g, ' ').trim().length - totalPriceLength;
  const hasAdditionalText = nonPriceTextLength > 1; // More than 1 char of non-price text (lowered from 5 to catch "Save ", "Over ", etc.)

  log(`📝 Text analysis: Total="${textContent}" Length=${textContent.length}`);
  log(`   Prices found: ${allPrices.length} (${allPrices.join(', ')})`);
  log(`   Total price chars: ${totalPriceLength}, Non-price chars: ${nonPriceTextLength}`);
  log(`   Has additional text: ${hasAdditionalText}`);

  // ⭐ PRESERVE TEXT: If element has additional text, use surgical replacement
  if (hasAdditionalText) {
    log('🔪 SURGICAL MODE: Element has additional text, preserving it');

    // Find the price in the text and replace it surgically
    // Use clickedPriceText if available (when user clicked a specific price)
    // Otherwise extract the price pattern from the text
    let priceToReplace = lastClickedPrice.clickedPriceText;

    if (!priceToReplace || !textContent.includes(priceToReplace)) {
      // Fallback: extract first price from text
      const firstPrice = allPrices[0];
      if (firstPrice && textContent.includes(firstPrice)) {
        priceToReplace = firstPrice;
        log(`   Using first price from text: "${priceToReplace}"`);
      } else {
        priceToReplace = originalPrice;
        log(`   Using originalPrice: "${priceToReplace}"`);
      }
    } else {
      log(`   Using clicked price: "${priceToReplace}"`);
    }

    // Try to find and replace in text content
    if (textContent.includes(priceToReplace)) {
      // Use replaceAll to handle duplicate prices (e.g., Amazon accessibility + visible)
      const newText = textContent.replaceAll(priceToReplace, convertedText);

      // ⭐ PRESERVE ORIGINAL STYLES before replacement
      const originalStyles = getPreservedStyles(element);

      // Replace in the appropriate text node
      if (element.childNodes.length === 1 && element.childNodes[0].nodeType === Node.TEXT_NODE) {
        // Simple text node
        element.textContent = newText;
        // ⭐ REAPPLY STYLES after text replacement
        applyPreservedStyles(element, originalStyles);
        log(`✅ Replaced in text node: "${priceToReplace}" → "${convertedText}"`);
        log(`   Result: "${newText}"`);
      } else {
        // Complex structure - find the right text node
        const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, null, false);
        let node;
        let replaced = false;

        while (node = walker.nextNode()) {
          if (node.textContent.includes(priceToReplace)) {
            // ⭐ PRESERVE parent element's styles
            const parentElement = node.parentElement;
            const parentStyles = parentElement ? getPreservedStyles(parentElement) : null;

            // Use replaceAll to handle duplicate prices (e.g., Amazon shows "$49.99$49.99")
            node.textContent = node.textContent.replaceAll(priceToReplace, convertedText);

            // ⭐ REAPPLY STYLES to parent element
            if (parentElement && parentStyles) {
              applyPreservedStyles(parentElement, parentStyles);
            }

            replaced = true;
            log(`✅ Replaced in text node: "${priceToReplace}" → "${convertedText}"`);
            log(`   Result: "${node.textContent}"`);
            // DON'T break - continue to replace in ALL text nodes (Amazon has multiple spans)
          }
        }

        if (!replaced) {
          // Fallback: replace in entire text
          element.textContent = newText;
          // ⭐ REAPPLY STYLES after fallback replacement
          applyPreservedStyles(element, originalStyles);
          log(`⚠️ Fallback replacement used`);
        }
      }

      element.title = `Original: ${textContent}`;
      element.dataset.replacedNow = 'true';
      log('✅ PRESERVED additional text, replaced only the price');
      return;
    }
  }

  // ⭐ ONLY PRICE: Element contains ONLY the price (no additional text to preserve)
  log('🔄 FULL REPLACEMENT MODE: Element contains only the price');

  // ⭐ SMART DETECTION: Check if this is a fragmented or simple price structure
  const hasMultipleChildren = element.children.length > 1;

  // Detect fragmented prices (multiple spans/elements with price parts)
  const hasMultipleSpans = (htmlContent.match(/<span/gi) || []).length > 1;
  const hasCurrencyAndDigits = /[\$€£¥₹₪₽₩]|\bUSD\b|\bEUR\b|\bGBP\b|\bJPY\b|\bCNY\b/i.test(textContent) && /\d/.test(textContent);

  // Check if it's a simple single-text-node structure (and ONLY contains price)
  const isSimplePrice = !hasAdditionalText &&
                        element.children.length === 0 &&
                        element.childNodes.length <= 2 &&
                        textContent.length < 50;

  // Fragmented if has multiple children OR multiple spans with price content
  const isFragmented = (hasMultipleChildren || hasMultipleSpans) && hasCurrencyAndDigits && !hasAdditionalText;

  if (isFragmented || isSimplePrice) {
    const replacementType = isFragmented ? 'fragmented' : 'simple';
    log(`🔍 Detected ${replacementType} price structure (no additional text)`);
    log('   Children:', element.children.length, 'Spans:', hasMultipleSpans ? 'multiple' : 'single', 'Original:', originalPrice);

    // ⭐ SUPER SMART: Analyze fragmented price structure and extract styles for each part
    const styleAnalysis = analyzeFragmentedPriceStyles(element);

    // ⭐ Generate styled HTML with separate spans for country code, symbol, and number
    const styledHTML = generateStyledConvertedHTML(convertedText, styleAnalysis);

    // Replace entire innerHTML with styled HTML
    element.innerHTML = styledHTML;
    element.title = `Original: ${originalPrice} (${sourceCurrency})`;

    log('✅ Replaced', replacementType, 'price with:', convertedText);

    // Mark as replaced
    element.dataset.replacedNow = 'true';
    return;
  }

  // Extract ONLY the price pattern (currency + amount) from the original text
  // Enhanced regex to support BOTH symbols ($, €, £) AND codes (USD, EUR, GBP)
  const pricePatternRegex = /(?:(?:US|HK|NZ|AU|CA|SG|C|A|NZ|HK|S)\s*)?(?:[\$€£¥₹₪₽₩฿₺₣₱₫₴]|USD|EUR|GBP|JPY|CNY|INR|ILS|CAD|AUD|CHF|BRL|RUB|KRW|THB|TRY|ZAR|SEK|NOK|DKK|PLN|CZK|HUF|MXN|NZD|SGD|HKD|TWD|AED|SAR|PHP|VND|UAH|RON|ISK|KWD|QAR|EGP)\s*(\d{1,3}(?:[,.\s]\d{3})*(?:[.,]\d{1,2})?)/gi;

  // Find all currency patterns in the original text
  const matches = Array.from(originalPrice.matchAll(pricePatternRegex));

  if (matches.length === 0) {
    logWarn('❌ Could not find price pattern in:', originalPrice);
    return;
  }

  // Use the first match as the price to replace
  const priceToReplace = matches[0][0]; // Full match like "$14.91" or "US $14.91"
  log('🎯 Found price pattern to replace:', priceToReplace);

  // Function to replace ONLY the price pattern in text nodes
  function replaceOnlyPriceInTextNodes(node) {
    if (node.nodeType === Node.TEXT_NODE) {
      // Check if this text node contains the price pattern
      if (node.textContent.includes(priceToReplace)) {
        // Replace ONLY the price, keep everything else
        node.textContent = node.textContent.replace(priceToReplace, convertedText);
        log('✅ Replaced in text node:', node.textContent);
        return true;
      }
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      // Recursively check child nodes
      for (let child of Array.from(node.childNodes)) {
        if (replaceOnlyPriceInTextNodes(child)) {
          return true;
        }
      }
    }
    return false;
  }

  // Try to replace the specific price pattern
  const wasReplaced = replaceOnlyPriceInTextNodes(element);

  if (!wasReplaced) {
    logWarn('⚠️ Could not find exact price pattern, trying flexible regex...');

    // Fallback: Use TreeWalker to find the price pattern in any text node
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, null, false);
    let textNode;

    // Try to match the price pattern we found earlier
    while (textNode = walker.nextNode()) {
      if (textNode.textContent.includes(priceToReplace)) {
        textNode.textContent = textNode.textContent.replace(priceToReplace, convertedText);
        log('✅ Replaced with TreeWalker:', textNode.textContent);
        break;
      }
    }

    // Last resort: try matching any currency (symbol OR code) + the specific amount
    if (!textNode) {
      log('🔧 Trying last resort: simple innerHTML replacement');

      // For simple single-node prices like "<div>USD 3.50</div>", just replace innerHTML
      if (element.children.length === 0 && element.textContent.trim() === originalPrice) {
        // ⭐ PRESERVE ORIGINAL STYLES - capture before replacement
        const originalStyles = getPreservedStyles(element);

        element.innerHTML = `<span style="color: inherit; font-size: inherit; font-weight: inherit;">${convertedText}</span>`;

        // ⭐ APPLY PRESERVED STYLES - keeps same appearance as original
        const newSpan = element.querySelector('span');
        if (newSpan) {
          applyPreservedStyles(newSpan, originalStyles);
        }

        log('✅ Replaced with simple innerHTML replacement:', convertedText);
      } else {
        // Try flexible regex with both symbols and currency codes
        const walker2 = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, null, false);
        // Match the exact source amount with flexible formatting - supports symbols AND codes
        const amountPattern = sourceAmount.toString().replace(/\./g, '[.,]');
        const lastResortRegex = new RegExp(
          `(?:(?:US|HK|NZ|AU|CA|SG)\\s*)?(?:[\\\$€£¥₹₪₽₩฿₺₣₱₫₴]|USD|EUR|GBP|JPY|CNY|INR|ILS|CAD|AUD|CHF|BRL|RUB|KRW|THB|TRY|ZAR|SEK|NOK|DKK|PLN|CZK|HUF|MXN|NZD|SGD|HKD|TWD|AED|SAR|PHP|VND|UAH|RON|ISK|KWD|QAR|EGP)\\s*${amountPattern}`,
          'gi'
        );

        while (textNode = walker2.nextNode()) {
          if (lastResortRegex.test(textNode.textContent)) {
            textNode.textContent = textNode.textContent.replace(lastResortRegex, convertedText);
            log('✅ Replaced with last resort regex:', textNode.textContent);
            break;
          }
        }
      }
    }
  }

  // Add title showing original price (subtle indicator)
  element.title = `Original: ${originalPrice} (${sourceCurrency})`;

  // Mark as replaced (for tracking purposes only)
  element.dataset.replacedNow = 'true';

  log('✅ Price replaced successfully:', convertedText);
}

// Replace selected text with converted value - SMART MODE
function replaceSelectedText(data) {
  const selection = window.getSelection();

  if (!selection || selection.rangeCount === 0) {
    logWarn('No selection found');
    return;
  }

  try {
    const range = selection.getRangeAt(0);
    const selectedText = range.toString();

    log('📝 Selected text for replacement:', selectedText);
    log('📝 Original text from conversion:', data.originalText);

    // ⭐ SMART FIX: Find the price portion within the selected text
    const sourceCurrency = detectCurrency(selectedText);
    if (!sourceCurrency) {
      logWarn('No currency detected in selection, aborting');
      showNotification('No currency found in selection', 'error');
      return;
    }

    const amount = extractAmount(selectedText, sourceCurrency);
    if (!amount) {
      logWarn('No amount detected in selection, aborting');
      showNotification('No price amount found in selection', 'error');
      return;
    }

    // Find the price pattern in the selected text
    const pricePatterns = [
      // Symbol before number
      new RegExp(`[€£¥₹₪₽₩฿₺₣₱₫₴$]\\s*\\d{1,3}(?:[,.\\s]\\d{3})*(?:[.,]\\d{1,2})?`, 'g'),
      // Multi-char symbols
      new RegExp(`[CANZHSR]\\$\\s*\\d{1,3}(?:[,.\\s]\\d{3})*(?:[.,]\\d{1,2})?`, 'g'),
      // Symbol after number
      new RegExp(`\\d{1,3}(?:[,.\\s]\\d{3})*(?:[.,]\\d{1,2})?\\s*(?:zł|Kč|Ft|lei|kr)`, 'gi'),
      // Currency code with number
      new RegExp(`(?:USD|EUR|GBP|JPY|INR|ILS|CAD|AUD|CHF|CNY|BRL|RUB|KRW|THB|TRY|ZAR|SEK|NOK|DKK|PLN|CZK|HUF|MXN|NZD|SGD|HKD|TWD|AED|SAR|PHP|VND|UAH|RON|ISK|KWD|QAR|EGP)?\\s*\\d{1,3}(?:[,.\\s]\\d{3})*(?:[.,]\\d{1,2})?\\s*(?:USD|EUR|GBP|JPY|INR|ILS|CAD|AUD|CHF|CNY|BRL|RUB|KRW|THB|TRY|ZAR|SEK|NOK|DKK|PLN|CZK|HUF|MXN|NZD|SGD|HKD|TWD|AED|SAR|PHP|VND|UAH|RON|ISK|KWD|QAR|EGP)?`, 'gi')
    ];

    let priceMatch = null;
    let priceStartOffset = -1;
    let priceEndOffset = -1;

    // Try each pattern to find the price
    for (const pattern of pricePatterns) {
      pattern.lastIndex = 0; // Reset regex
      const match = pattern.exec(selectedText);
      if (match && match[0]) {
        priceMatch = match[0];
        priceStartOffset = match.index;
        priceEndOffset = match.index + match[0].length;
        log('✅ Found price in selection:', priceMatch, 'at offset', priceStartOffset, '-', priceEndOffset);
        break;
      }
    }

    if (!priceMatch || priceStartOffset === -1) {
      logWarn('Could not locate price boundaries in selection, replacing entire selection');

      // ⭐ PRESERVE ORIGINAL STYLES from parent element
      const parentElement = range.commonAncestorContainer.nodeType === Node.ELEMENT_NODE
        ? range.commonAncestorContainer
        : range.commonAncestorContainer.parentElement;
      const originalStyles = parentElement ? getPreservedStyles(parentElement) : null;

      // Fallback to old behavior
      range.deleteContents();
      const replacementNode = document.createElement('span');
      replacementNode.textContent = data.replacement;

      // ⭐ APPLY PRESERVED STYLES - keeps same appearance as original
      if (originalStyles) {
        applyPreservedStyles(replacementNode, originalStyles);
      }

      replacementNode.title = `Converted from ${data.sourceAmount} ${data.sourceCurrency}`;
      range.insertNode(replacementNode);
      selection.removeAllRanges();
      showNotification(`Converted to ${data.replacement}`, 'success');
      return;
    }

    // ⭐ SMART REPLACEMENT: Only replace the price portion
    log('🎯 Smart replacement: only replacing price portion');

    // Get the text before and after the price
    const textBefore = selectedText.substring(0, priceStartOffset);
    const textAfter = selectedText.substring(priceEndOffset);

    log('📝 Text before price:', textBefore);
    log('💰 Price to replace:', priceMatch);
    log('📝 Text after price:', textAfter);

    // ⭐ PRESERVE ORIGINAL STYLES from parent element
    const parentElement = range.commonAncestorContainer.nodeType === Node.ELEMENT_NODE
      ? range.commonAncestorContainer
      : range.commonAncestorContainer.parentElement;
    const originalStyles = parentElement ? getPreservedStyles(parentElement) : null;

    // Delete the selected content
    range.deleteContents();

    // Create a document fragment with: textBefore + replacement + textAfter
    const fragment = document.createDocumentFragment();

    // Add text before (if any)
    if (textBefore) {
      fragment.appendChild(document.createTextNode(textBefore));
    }

    // Add replacement node with preserved styling
    const replacementNode = document.createElement('span');
    replacementNode.textContent = data.replacement;

    // ⭐ APPLY PRESERVED STYLES - keeps same appearance as original
    if (originalStyles) {
      applyPreservedStyles(replacementNode, originalStyles);
    }

    replacementNode.title = `Converted from ${data.sourceAmount} ${data.sourceCurrency}`;
    replacementNode.dataset.converted = 'true';
    replacementNode.dataset.original = priceMatch;
    fragment.appendChild(replacementNode);

    // Add text after (if any)
    if (textAfter) {
      fragment.appendChild(document.createTextNode(textAfter));
    }

    // Insert the fragment
    range.insertNode(fragment);

    // Clear selection
    selection.removeAllRanges();

    // Show success notification
    showNotification(`Converted ${priceMatch} to ${data.replacement}`, 'success');

    log('✨ Smart replacement completed successfully');

  } catch (error) {
    logError('Error replacing text:', error);
    showNotification('Failed to replace text', 'error');
  }
}

// Show notification
function showNotification(message, type = 'success') {
  const colors = themeColors[currentTheme] || themeColors.default;

  // Use theme colors for success, red gradient for error
  const background = type === 'success'
    ? colors.gradient
    : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';

  const shadow = type === 'success'
    ? colors.shadow
    : '0 4px 20px rgba(239, 68, 68, 0.4)';

  const textColor = colors.isDark || type === 'success' ? '#ffffff' : 'white';

  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${background};
    color: ${textColor};
    padding: 12px 20px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
    z-index: 2147483647;
    box-shadow: ${shadow};
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
    animation: slideIn 0.3s ease;
  `;
  notification.textContent = `💱 ${message}`;

  // Add animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn {
      from {
        transform: translateX(400px);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    @keyframes slideOut {
      from {
        transform: translateX(0);
        opacity: 1;
      }
      to {
        transform: translateX(400px);
        opacity: 0;
      }
    }
  `;
  if (!document.querySelector('#currency-converter-animations')) {
    style.id = 'currency-converter-animations';
    document.head.appendChild(style);
  }

  document.body.appendChild(notification);

  // Auto remove after 3 seconds
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

log('✨ Currency Converter Pro Enhanced - Ready!');
