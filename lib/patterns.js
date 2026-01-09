/**
 * Currency Converter Pro - Pattern Definitions & Detection Rules
 * Centralized configuration for all currency detection patterns, regex rules, and site-specific selectors
 * Version: 3.2.1
 *
 * This file contains:
 * - Currency symbols and codes (170+ currencies)
 * - Price detection regex patterns
 * - Site-specific selectors for 25+ major e-commerce sites
 * - E-commerce platform detection (Shopify, WooCommerce, Magento)
 * - Fragmented price detection rules
 * - Context validation rules
 *
 * Supported Sites:
 * - Amazon, eBay, AliExpress, Alibaba
 * - Walmart, Target, Costco
 * - Newegg, Best Buy, B&H Photo
 * - Home Depot, Wayfair, IKEA
 * - Etsy, ASOS, Zalando, Zara, H&M
 * - Nike, Adidas
 * - Booking.com, Expedia
 * - Overstock, Rakuten
 * - Shopify stores, WooCommerce stores, Magento stores
 * - Generic fallback for any site
 */

// ============================================================================
// CURRENCY DEFINITIONS
// ============================================================================

/**
 * Comprehensive currency symbol mapping (170+ currencies)
 * Format: { 'CODE': 'Symbol' }
 */
const CURRENCY_SYMBOLS = {
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
  'ERN': 'Nfk', 'DJF': 'Fdj', 'KMF': 'CF', 'MZN': 'MT',
  // Cryptocurrencies
  'BTC': '₿', 'ETH': 'Ξ', 'LTC': 'Ł', 'XRP': 'XRP', 'BCH': 'BCH', 'ADA': '₳'
};

/**
 * Currency codes array for pattern matching
 */
const CURRENCY_CODES = Object.keys(CURRENCY_SYMBOLS);

/**
 * European currencies that use comma as decimal separator
 */
const EUROPEAN_CURRENCIES = [
  'EUR', 'DKK', 'SEK', 'NOK', 'PLN', 'CZK', 'HUF', 'RON', 'BGN', 'HRK',
  'ISK', 'ALL', 'MKD', 'RSD', 'BAM'
];

// ============================================================================
// REGEX PATTERNS
// ============================================================================

/**
 * Currency detection patterns
 */
const PATTERNS = {
  // Currency codes (e.g., "USD", "EUR", "US $")
  currencyCode: /\b(USD|EUR|GBP|JPY|INR|ILS|CAD|AUD|CHF|CNY|BRL|RUB|KRW|THB|TRY|ZAR|SEK|NOK|DKK|PLN|CZK|HUF|MXN|NZD|SGD|HKD|TWD|AED|SAR|PHP|VND|UAH|RON|ISK|KWD|QAR|EGP|US\s*\$)\b/i,

  // Currency symbols (single or multi-char)
  currencySymbol: /[\$€£¥₹₪₽₩฿₺₣₱₫₴złKčFtlei]|US\s*\$|C\$|A\$|NZ\$|HK\$|S\$|R\$|NT\$|د\.إ|د\.ك/,

  // Complete price patterns
  priceWithSymbol: /(?:^|[^\d])[\$€£¥₹₪₽₩฿₺₣₱₫₴]\s*\d+(?:[.,]\d{2,3})?(?:[.,]\d{2})?(?:[^\d]|$)/,
  priceWithCode: /\b(?:USD|EUR|GBP|JPY|CNY|ILS)\s+\d+(?:[.,]\d{2,3})?(?:[.,]\d{2})?/i,

  // Number patterns
  number: /\d[\d,.\s]*\d|\d/,
  decimal: /\d+[.,]\d{2}/,

  // Price range patterns
  priceRange: /([\$€£¥₹₪₽₩])\s*(\d+[.,]\d{2})\s*[-–—to]\s*\1\s*(\d+[.,]\d{2})/i,
  priceRangeWithCode: /(\d+[.,]\d{2})\s*[-–—to]\s*(\d+[.,]\d{2})\s*(usd|eur|gbp|jpy|cny)/i,

  // Negative signals (NOT prices)
  phoneNumber: /^\+?\d{1,3}[\s.-]?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/,
  year: /\b(19|20)\d{2}\b/,
  percentage: /%/,
  productCode: /^[A-Z0-9]+-[A-Z0-9]+-[A-Z0-9]+$/i,
  dimension: /\d+\s*[x×]\s*\d+/i,

  // Context keywords
  priceContext: /buy|cart|checkout|purchase|order|add to|price|cost|total|pay|sale|discount|save|offer/i,
  saleKeywords: /\b(was|originally|reg\.|regular|list price|compare at|msrp|rrp)\b/i,
  discountKeywords: /\b(save|off|discount|sale|clearance|reduced)\b/i
};

// ============================================================================
// SITE-SPECIFIC SELECTORS
// ============================================================================

/**
 * CSS selectors for detecting price elements on specific e-commerce sites
 */
const SITE_SELECTORS = {
  // Amazon selectors (extensive due to complex structure)
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

  // eBay selectors
  ebay: [
    '.x-price-primary',
    '.x-bin-price__content',
    '.display-price',
    '[itemprop="price"]'
  ],

  // AliExpress selectors (comprehensive - dynamic classes change frequently)
  aliexpress: [
    // Product page selectors
    '.product-price-value',
    '.price-current',
    '.uniform-banner-box-price',
    '.price-default--current--F8OlYIo',
    '.price-default--original--CWCHOit',

    // Search results page selectors ⭐ IMPORTANT FOR SEARCH PAGES
    '.multi--price-sale--U-S0jtj',       // Search results sale price
    '.multi--price-original--1zEQqOK',   // Search results original price
    '.search--price--WgWrGhz',           // Search results price wrapper
    '.cards--price--mZ_yW3O',            // Card price container

    // Shipping selectors
    '.dynamic-shipping strong',
    '.dynamic-shipping span',

    // Fragmented price containers (common pattern)
    '._3Mpbo', // AliExpress fragmented price container (older)
    '.kr_lo', // AliExpress fragmented price container (2023 format)
    '.k7_gz',  // AliExpress price wrapper (2024 format)
    '.k7_lu',  // AliExpress price sub-container (2024 format) ⭐ PRIMARY TARGET
    '.k7_lv',  // AliExpress secondary price container

    // Dynamic class matchers (⭐ AGGRESSIVE MATCHING)
    '[class*="_3Mpbo"]',
    '[class*="k7_"]',     // Match all k7_* classes (2024+ format)
    '[class*="kr_"]',     // Match all kr_* classes
    '[class*="multi--"]', // Match multi--* classes (search results)
    '[class*="price"]',
    '[class*="Price"]',
    '[class*="amount"]',
    '[class*="cost"]',

    // Data attribute selectors
    'div[data-spm-anchor-id*="price"]',
    'span[data-spm-anchor-id*="price"]',
    '[data-pl*="price"]',                // Product list price data

    // Style metadata selectors (⭐ MOST RELIABLE)
    'span[style*="currency-symbol"]',     // Inline currency metadata
    'span[style*="is-price-power"]',      // Price indicator
    'span[style*="decimal_point"]',       // Decimal metadata
    'div[style*="currency-symbol"]',      // Div variant

    // Generic fallbacks
    'span:has(> span[style*="currency"])', // Parent of currency spans
    'div > span[style]'                    // Any styled span (last resort)
  ],

  // Walmart selectors
  walmart: [
    '[itemprop="price"]',
    '.price-characteristic',
    '[data-automation-id*="price"]'
  ],

  // Etsy selectors
  etsy: [
    '.wt-text-title-01',
    '[data-buy-box-region="price"]',
    '.currency-value'
  ],

  // Newegg selectors (electronics)
  newegg: [
    // New goods-price format (fragmented)
    '.goods-price',              // Container
    '.goods-price-current',      // Current price wrapper
    '.goods-price-symbol',       // Currency symbol ($)
    '.goods-price-value',        // Value container (has <strong> and <sup>)
    '.goods-price-value strong', // Whole dollar amount
    '.goods-price-value sup',    // Decimal part (.99)

    // Legacy price formats
    '.price-current',
    '.price-current-label',
    '.price-save-percent',
    '.price-was-data',
    '.price-main',
    '[itemprop="price"]',
    '[class*="price"]',
    '[id*="price"]'
  ],

  // Alibaba selectors (B2B wholesale)
  alibaba: [
    '.price',
    '.price-wrap',
    '.price-original',
    '.price-now',
    '.ma-reference-price',
    '.ma-spec-price',
    '.price-value',
    '[class*="price"]',
    '[data-role="price"]',
    'span[class*="Price"]',
    'div[class*="Price"]'
  ],

  // Target selectors
  target: [
    '[data-test="product-price"]',
    '[data-test="current-price"]',
    '.h-display-inline-block[data-test*="price"]',
    '[itemprop="price"]',
    '[class*="price"]'
  ],

  // Best Buy selectors (electronics)
  bestbuy: [
    '.priceView-hero-price',
    '.priceView-customer-price',
    '.pricing-price__regular-price',
    '.pricing-price__savings',
    '[data-testid="customer-price"]',
    '[itemprop="price"]',
    '[class*="price"]',
    '[class*="Price"]'
  ],

  // Home Depot selectors
  homedepot: [
    '.price-format__main-price',
    '.price-detailed__dollar-sign',
    '[data-testid="product-price"]',
    '.price-format__large',
    '[itemprop="price"]',
    '[class*="price"]'
  ],

  // Wayfair selectors (furniture)
  wayfair: [
    '.pl-Purchasing_ProductPrice',
    '.BasePriceBlock',
    '[data-enzyme-id="ProductPrice"]',
    '[data-testid="ProductPrice"]',
    '[itemprop="price"]',
    '[class*="price"]',
    '[class*="Price"]'
  ],

  // ASOS selectors (fashion)
  asos: [
    '[data-testid="current-price"]',
    '[data-testid="previous-price"]',
    '.product-price',
    '[class*="price"]',
    '[itemprop="price"]'
  ],

  // Zalando selectors (fashion)
  zalando: [
    '[data-testid="price"]',
    '.sDq_FX',
    '.DJxzzA',
    '[class*="price"]',
    '[itemprop="price"]'
  ],

  // Booking.com selectors (travel)
  booking: [
    '[data-testid="price-and-discounted-price"]',
    '.prco-valign-middle-helper',
    '.prco-inline-block-maker-helper',
    '.bui-price-display__value',
    '[class*="price"]',
    '[data-et-click*="price"]'
  ],

  // Expedia selectors (travel)
  expedia: [
    '.uitk-text-emphasis-theme',
    '[data-test-id*="price"]',
    '[class*="price"]',
    '[class*="Price"]'
  ],

  // Overstock selectors
  overstock: [
    '.product-price',
    '[itemprop="price"]',
    '[data-test="product-price"]',
    '[class*="price"]'
  ],

  // Rakuten selectors
  rakuten: [
    '.price',
    '.price--main',
    '.product__price',
    '[itemprop="price"]',
    '[class*="price"]'
  ],

  // B&H Photo selectors (professional equipment)
  bhphoto: [
    '[data-selenium="priceLockupPrice"]',
    '.price_1pXJ-',
    '[itemprop="price"]',
    '[class*="price"]'
  ],

  // Costco selectors
  costco: [
    '[automation-id="productPriceOutput"]',
    '.price',
    '[class*="price"]',
    '[itemprop="price"]'
  ],

  // IKEA selectors
  ikea: [
    '.pip-price__integer',
    '.pip-price__decimals',
    '.pip-price',
    '[class*="price"]',
    '[data-testid="pip-price"]'
  ],

  // Zara selectors (fashion)
  zara: [
    '.price',
    '.price-current',
    '[class*="price"]',
    '[data-qa-action="product-price"]'
  ],

  // H&M selectors (fashion)
  hm: [
    '.product-price',
    '[data-testid="price"]',
    '[class*="price"]',
    '[itemprop="price"]'
  ],

  // Nike selectors (sportswear)
  nike: [
    '.product-price',
    '[data-test="product-price"]',
    '[class*="price"]',
    '[itemprop="price"]'
  ],

  // Adidas selectors (sportswear)
  adidas: [
    '.gl-price',
    '[data-auto-id="product-price"]',
    '[class*="price"]',
    '[itemprop="price"]'
  ],

  // Shopify stores (generic pattern used by thousands of stores)
  shopify: [
    '.product-price',
    '.product__price',
    '.price',
    '.price__current',
    '.price__regular',
    '[data-product-price]',
    '[class*="price"]',
    '[itemprop="price"]'
  ],

  // WooCommerce stores (WordPress e-commerce plugin)
  woocommerce: [
    '.woocommerce-Price-amount',
    '.price',
    '.amount',
    '[itemprop="price"]',
    '[class*="price"]'
  ],

  // Magento stores (enterprise e-commerce platform)
  magento: [
    '.price',
    '.price-wrapper',
    '[data-price-type="finalPrice"]',
    '[itemprop="price"]',
    '[class*="price"]'
  ],

  // Generic selectors (fallback for unknown sites)
  generic: [
    '[class*="price"]',
    '[class*="Price"]',
    '[id*="price"]',
    '[id*="Price"]',
    '[data-price]',
    '[itemprop="price"]'
  ]
};

// ============================================================================
// FRAGMENTED PRICE DETECTION RULES
// ============================================================================

/**
 * Rules for detecting fragmented prices (prices split across multiple elements)
 */
const FRAGMENTED_PRICE_RULES = {
  // Amazon-specific fragmented price classes
  amazon: {
    indicators: [
      '.a-price-symbol',
      '.a-price-whole',
      '.a-price-fraction',
      '.a-price-decimal'
    ],
    minChildCount: 2
  },

  // Newegg-specific fragmented price detection
  newegg: {
    indicators: [
      '.goods-price-symbol',    // Currency symbol ($)
      '.goods-price-value',     // Value container
      'strong',                 // Whole dollar amount
      'sup'                     // Decimal part (.99)
    ],
    containerClasses: [
      'goods-price',
      'goods-price-current',
      'goods-price-value'
    ],
    minChildCount: 2,
    validFragmentPattern: /^(\$|€|£|¥|\d+|[.,]\d{2})$/
  },

  // AliExpress-specific fragmented price detection
  aliexpress: {
    // Style attribute patterns that indicate AliExpress price metadata
    stylePatterns: [
      'currency-symbol:',
      'is-price-power:',
      'decimal_point:',
      'comma_style:',
      'show-decimal:',
      'symbol_position:'
    ],
    // Parent container classes
    containerClasses: [
      'k7_gz',
      'k7_lu',
      'kr_lo',
      '_3Mpbo'
    ],
    minChildCount: 2,
    // Fragment validation - what constitutes a valid price fragment
    validFragmentPattern: /^(US\s*\$|[A-Z]{2,3}|[\$€£¥₹₪₽₩฿₺₣₱₫₴]|\d+|[.,])$/
  },

  // Generic fragmented price detection (for other sites)
  generic: {
    // Small spans that are likely price fragments
    smallSpanPattern: /^[\d\.$€£¥₹₪₽₩,.]+$/,
    maxFragmentLength: 3,
    minChildCount: 2,
    requireCurrencySymbol: true
  }
};

/**
 * Fragment types for classification
 */
const FRAGMENT_TYPES = {
  CURRENCY: 'currency',      // Currency symbol or code
  DIGIT: 'digit',           // Numeric digit(s)
  DECIMAL: 'decimal',       // Decimal separator (. or ,)
  SPACE: 'space'            // Spacing element
};

// ============================================================================
// CONTEXT VALIDATION RULES
// ============================================================================

/**
 * Rules for validating price context and avoiding false positives
 */
const CONTEXT_RULES = {
  // Positive signals (increase confidence)
  positive: {
    classNames: /price|cost|amount|total|subtotal|payment|pay/i,
    parentText: /buy|cart|checkout|purchase|order|add to|price|cost|total|pay|sale|discount|save|offer/i,
    priceRange: {
      min: 0.01,
      max: 999999999.99
    }
  },

  // Negative signals (decrease confidence or reject)
  negative: {
    phoneNumber: /^\+?\d{1,3}[\s.-]?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/,
    productCode: /^[A-Z0-9]+-[A-Z0-9]+-[A-Z0-9]+$/i,
    dimension: /\d+\s*[x×]\s*\d+/i,
    year: /\b(19|20)\d{2}\b/,
    percentage: /%/
  },

  // Shipping cost indicators (skip conversion)
  shipping: {
    classNames: /ship|shipping|freight|delivery|postage/i,
    keywords: /shipping|delivery|freight|postage/i
  },

  // Sale/strikethrough indicators (skip conversion)
  sale: {
    classNames: /strike|through|original|was|old|compare|regular|msrp|rrp/i,
    keywords: /\b(was|originally|reg\.|regular|list price|compare at|msrp|rrp)\b/i,
    textDecoration: 'line-through'
  }
};

// ============================================================================
// WEBSITE DETECTION
// ============================================================================

/**
 * Patterns for detecting specific e-commerce websites
 */
const WEBSITE_PATTERNS = {
  amazon: /amazon\.(com|co\.uk|de|fr|it|es|ca|com\.au|co\.jp|in|com\.br|com\.mx|nl|se|pl|sg|ae|sa|eg)/i,
  ebay: /ebay\./i,
  aliexpress: /aliexpress\.com/i,
  walmart: /walmart\.com/i,
  etsy: /etsy\.com/i,
  newegg: /newegg\.(com|ca)/i,
  alibaba: /alibaba\.com/i,
  target: /target\.com/i,
  bestbuy: /bestbuy\.(com|ca)/i,
  homedepot: /homedepot\.(com|ca)/i,
  wayfair: /wayfair\.(com|ca|co\.uk|de)/i,
  asos: /asos\.(com|fr|de|es|it)/i,
  zalando: /zalando\.(com|de|fr|it|es|nl|be|at|ch|se|no|dk|fi|ie|pl)/i,
  booking: /booking\.com/i,
  expedia: /expedia\.(com|ca|co\.uk|de|fr)/i,
  overstock: /overstock\.com/i,
  rakuten: /rakuten\.(com|co\.jp|fr|de)/i,
  bhphoto: /bhphotovideo\.com/i,
  costco: /costco\.(com|ca)/i,
  ikea: /ikea\.com/i,
  zara: /zara\.com/i,
  hm: /hm\.com/i,
  nike: /nike\.com/i,
  adidas: /adidas\.(com|ca|co\.uk|de|fr)/i,
  shopify: /myshopify\.com/i,
  woocommerce: /\.(com|net|org|shop)/i,  // Generic, check for WooCommerce in HTML
  magento: /\.(com|net|org|shop)/i  // Generic, check for Magento in HTML
};

// ============================================================================
// CURRENCY MAPPING
// ============================================================================

/**
 * Currency symbol to code mapping
 * Maps symbols like $, €, £ to ISO currency codes
 */
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

/**
 * Get currency symbol for display from ISO code
 * @param {string} code - ISO currency code (e.g., 'USD', 'EUR')
 * @returns {string} Currency symbol or code if not found
 */
function getCurrencySymbol(code) {
  const symbols = {
    // Major Fiat Currencies
    'USD': '$', 'EUR': '€', 'GBP': '£', 'JPY': '¥', 'INR': '₹',
    'ILS': '₪', 'RUB': '₽', 'KRW': '₩', 'THB': '฿', 'TRY': '₺',
    'CAD': 'C$', 'AUD': 'A$', 'NZD': 'NZ$', 'HKD': 'HK$', 'SGD': 'S$',
    'BRL': 'R$', 'ZAR': 'R', 'SEK': 'kr', 'NOK': 'kr', 'DKK': 'kr',
    'PLN': 'zł', 'CZK': 'Kč', 'HUF': 'Ft', 'RON': 'lei', 'TWD': 'NT$',
    'AED': 'د.إ', 'SAR': '﷼', 'PHP': '₱', 'VND': '₫', 'UAH': '₴',
    'CHF': '₣', 'MXN': '$', 'CNY': '¥', 'ISK': 'kr', 'KWD': 'د.ك',
    'QAR': '﷼', 'EGP': '£', 'BGN': 'лв', 'HRK': 'kn', 'ALL': 'L',

    // Americas
    'ARS': '$', 'CLP': '$', 'COP': '$', 'PEN': 'S/', 'UYU': '$',
    'VEF': 'Bs', 'BOB': 'Bs', 'CRC': '₡', 'DOP': 'RD$', 'GTQ': 'Q',
    'PYG': '₲', 'HNL': 'L', 'NIO': 'C$', 'PAB': 'B/.', 'JMD': 'J$',

    // Asia
    'MYR': 'RM', 'IDR': 'Rp', 'PKR': '₨', 'BDT': '৳', 'LKR': 'Rs',
    'NPR': 'Rs', 'MMK': 'K', 'KHR': '៛', 'LAK': '₭', 'AFN': '؋',

    // Middle East
    'BHD': 'د.ب', 'OMR': '﷼', 'JOD': 'د.ا', 'LBP': 'ل.ل',
    'IQD': 'ع.د', 'SYP': '£', 'YER': '﷼', 'SDG': '£',

    // Africa
    'NGN': '₦', 'KES': 'KSh', 'GHS': '₵', 'MAD': 'د.م.', 'TZS': 'TSh',
    'UGX': 'USh', 'ETB': 'Br', 'DZD': 'د.ج', 'TND': 'د.ت', 'LYD': 'ل.د',
    'MUR': '₨', 'NAD': '$', 'BWP': 'P', 'MZN': 'MT', 'XOF': 'CFA', 'XAF': 'CFA',

    // Europe (Additional)
    'MKD': 'ден', 'RSD': 'дин', 'BAM': 'KM', 'GEL': '₾', 'AMD': '֏',
    'AZN': '₼', 'BYN': 'Br', 'MDL': 'L', 'KZT': '₸',

    // Cryptocurrencies (16 major)
    'BTC': '₿', 'ETH': 'Ξ', 'USDT': '₮', 'USDC': '$', 'BNB': 'BNB',
    'XRP': 'XRP', 'ADA': '₳', 'SOL': 'SOL', 'DOGE': 'Ð', 'DOT': 'DOT',
    'MATIC': 'MATIC', 'LTC': 'Ł', 'BCH': 'BCH', 'LINK': 'LINK',
    'XLM': 'XLM', 'ATOM': 'ATOM'
  };
  return symbols[code] || code;
}

/**
 * Get appropriate decimal places for currency
 * Some currencies don't use decimals, others use 2 or 3
 * @param {string} code - ISO currency code
 * @returns {number} Number of decimal places
 */
function getCurrencyDecimals(code) {
  // Zero decimal currencies (whole numbers only)
  const zeroDecimalCurrencies = [
    'JPY', 'KRW', 'VND', 'IDR', 'CLP', 'ISK', 'PYG', 'UGX', 'KRW',
    'XOF', 'XAF', 'GNF', 'RWF', 'BIF', 'KMF', 'DJF', 'XPF'
  ];

  // Three decimal currencies (more precision)
  const threeDecimalCurrencies = [
    'BHD', 'JOD', 'KWD', 'OMR', 'TND', 'IQD', 'LYD'
  ];

  // Cryptocurrencies (8 decimals for high precision)
  const cryptoCurrencies = [
    'BTC', 'ETH', 'USDT', 'USDC', 'BNB', 'XRP', 'ADA', 'SOL',
    'DOGE', 'DOT', 'MATIC', 'LTC', 'BCH', 'LINK', 'XLM', 'ATOM'
  ];

  if (zeroDecimalCurrencies.includes(code)) {
    return 0;
  } else if (threeDecimalCurrencies.includes(code)) {
    return 3;
  } else if (cryptoCurrencies.includes(code)) {
    return 8;
  } else {
    return 2; // Default for most currencies
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Detect website type for optimized selectors
 * @returns {string} Website type identifier
 */
function detectWebsiteType() {
  const hostname = window.location.hostname;

  // Major e-commerce sites (ordered by popularity)
  if (hostname.includes('amazon.')) return 'amazon';
  if (hostname.includes('ebay.')) return 'ebay';
  if (hostname.includes('aliexpress.')) return 'aliexpress';
  if (hostname.includes('walmart.')) return 'walmart';
  if (hostname.includes('target.')) return 'target';

  // Electronics & Tech
  if (hostname.includes('newegg.')) return 'newegg';
  if (hostname.includes('bestbuy.')) return 'bestbuy';
  if (hostname.includes('bhphotovideo.')) return 'bhphoto';

  // B2B & Wholesale
  if (hostname.includes('alibaba.')) return 'alibaba';
  if (hostname.includes('costco.')) return 'costco';

  // Home & Furniture
  if (hostname.includes('homedepot.')) return 'homedepot';
  if (hostname.includes('wayfair.')) return 'wayfair';
  if (hostname.includes('ikea.')) return 'ikea';

  // Fashion & Apparel
  if (hostname.includes('etsy.')) return 'etsy';
  if (hostname.includes('asos.')) return 'asos';
  if (hostname.includes('zalando.')) return 'zalando';
  if (hostname.includes('zara.')) return 'zara';
  if (hostname.includes('hm.')) return 'hm';

  // Sportswear
  if (hostname.includes('nike.')) return 'nike';
  if (hostname.includes('adidas.')) return 'adidas';

  // Travel
  if (hostname.includes('booking.')) return 'booking';
  if (hostname.includes('expedia.')) return 'expedia';

  // Other retailers
  if (hostname.includes('overstock.')) return 'overstock';
  if (hostname.includes('rakuten.')) return 'rakuten';

  // E-commerce platforms (check for specific patterns in HTML)
  if (hostname.includes('myshopify.')) return 'shopify';

  // Check for WooCommerce (WordPress plugin)
  if (document.querySelector('.woocommerce, [class*="woocommerce"]')) {
    return 'woocommerce';
  }

  // Check for Magento
  if (document.querySelector('[data-price-type], .price-box')) {
    return 'magento';
  }

  // Check for Shopify (alternative detection)
  if (document.querySelector('[data-shopify], .shopify-section')) {
    return 'shopify';
  }

  return 'generic';
}

/**
 * Get optimized selectors based on site type
 * @param {string} siteType - Website type identifier
 * @returns {Array<string>} Array of CSS selectors
 */
function getPriceSelectors(siteType) {
  return [...SITE_SELECTORS[siteType] || [], ...SITE_SELECTORS.generic];
}

// ============================================================================
// EXPORT FOR USE IN CONTENT SCRIPT
// ============================================================================

// Make patterns available globally for content.js
if (typeof window !== 'undefined') {
  window.CurrencyPatterns = {
    CURRENCY_SYMBOLS,
    CURRENCY_CODES,
    EUROPEAN_CURRENCIES,
    PATTERNS,
    SITE_SELECTORS,
    FRAGMENTED_PRICE_RULES,
    FRAGMENT_TYPES,
    CONTEXT_RULES,
    WEBSITE_PATTERNS,
    CURRENCY_MAP,
    // Functions
    detectWebsiteType,
    getPriceSelectors,
    getCurrencySymbol,
    getCurrencyDecimals
  };
}
