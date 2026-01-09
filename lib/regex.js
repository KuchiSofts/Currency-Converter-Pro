/**
 * Currency Converter Pro - Regex Rules
 * All regular expressions for price and currency detection
 * Version: 3.2.2
 */

// ============================================================================
// CURRENCY DETECTION REGEX
// ============================================================================

/**
 * Currency codes pattern (USD, EUR, GBP, etc.)
 * Matches 3-letter ISO currency codes
 */
const CURRENCY_CODE_REGEX = /\b(USD|EUR|GBP|JPY|INR|ILS|CAD|AUD|CHF|CNY|BRL|RUB|KRW|THB|TRY|ZAR|SEK|NOK|DKK|PLN|CZK|HUF|MXN|NZD|SGD|HKD|TWD|AED|SAR|PHP|VND|UAH|RON|ISK|KWD|QAR|EGP)\b/i;

/**
 * Special currency format (US $, US$, etc.)
 */
const SPECIAL_CURRENCY_REGEX = /US\s*\$|C\$|A\$|NZ\$|HK\$|S\$|R\$|NT\$/;

/**
 * All currency symbols in one pattern
 */
const CURRENCY_SYMBOL_REGEX = /[$€£¥₹₪₽₩฿₺₣₱₫₴złKčFtleiد\.إد\.كل\.ع﷼]/;

/**
 * Quick currency check (symbols or codes)
 */
const HAS_CURRENCY_REGEX = /[$€£¥₹₪₽₩฿₺₣₱₫₴złKčFtlei]|\b(?:USD|EUR|GBP|JPY|INR|ILS|CAD|AUD|CHF|CNY|BRL|RUB|KRW|THB|TRY|ZAR|SEK|NOK|DKK|PLN|CZK|HUF|MXN|NZD|SGD|HKD|TWD|AED|SAR|PHP|VND|UAH|RON|ISK|KWD|QAR|EGP)\b/i;

// ============================================================================
// PRICE DETECTION REGEX
// ============================================================================

/**
 * Basic price pattern - matches currency + number
 * Examples: $49, €12.99, £5, ¥1000
 */
const BASIC_PRICE_REGEX = /[$€£¥₹₪₽₩฿₺₣₱₫₴]\s*\d+(?:[.,]\d+)?/;

/**
 * Price with currency code before number
 * Examples: USD 49, EUR 12.99, GBP 5
 */
const CURRENCY_CODE_BEFORE_REGEX = /\b(?:USD|EUR|GBP|JPY|INR|ILS|CAD|AUD|CHF|CNY|BRL|RUB|KRW|THB|TRY|ZAR|SEK|NOK|DKK|PLN|CZK|HUF|MXN|NZD|SGD|HKD|TWD|AED|SAR|PHP|VND|UAH|RON|ISK|KWD|QAR|EGP)\s*\d+(?:[.,]\d+)?/i;

/**
 * Price with currency code after number
 * Examples: 49 USD, 12.99 EUR, 5 GBP
 */
const CURRENCY_CODE_AFTER_REGEX = /\d+(?:[.,]\d+)?\s*(?:USD|EUR|GBP|JPY|INR|ILS|CAD|AUD|CHF|CNY|BRL|RUB|KRW|THB|TRY|ZAR|SEK|NOK|DKK|PLN|CZK|HUF|MXN|NZD|SGD|HKD|TWD|AED|SAR|PHP|VND|UAH|RON|ISK|KWD|QAR|EGP)\b/i;

/**
 * Comprehensive price pattern - catches most price formats
 * Examples: $49, $49.99, 49.99 USD, USD 49.99, €12,99
 */
const COMPREHENSIVE_PRICE_REGEX = /(?:[$€£¥₹₪₽₩฿₺₣₱₫₴]|(?:USD|EUR|GBP|JPY|INR|ILS|CAD|AUD|CHF|CNY|BRL|RUB|KRW|THB|TRY|ZAR|SEK|NOK|DKK|PLN|CZK|HUF|MXN|NZD|SGD|HKD|TWD|AED|SAR|PHP|VND|UAH|RON|ISK|KWD|QAR|EGP)\s*)\s*\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{1,2})?|\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{1,2})?\s*(?:USD|EUR|GBP|JPY|INR|ILS|CAD|AUD|CHF|CNY|BRL|RUB|KRW|THB|TRY|ZAR|SEK|NOK|DKK|PLN|CZK|HUF|MXN|NZD|SGD|HKD|TWD|AED|SAR|PHP|VND|UAH|RON|ISK|KWD|QAR|EGP)\b/i;

/**
 * Simple price pattern for basic detection
 * Examples: $49, €12.99, £5.00
 */
const SIMPLE_PRICE_REGEX = /[$€£¥₹₪₽₩]\s*\d+(?:\.\d{2})?/;

// ============================================================================
// NUMBER EXTRACTION REGEX
// ============================================================================

/**
 * Extract numeric value from price
 * Matches: 1234, 1,234, 1.234, 1234.56, 1,234.56, etc.
 */
const NUMBER_EXTRACTION_REGEX = /\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{1,2})?/;

/**
 * Decimal separator detection
 */
const DECIMAL_SEPARATOR_REGEX = /[.,]\d{1,2}$/;

/**
 * Thousands separator detection
 */
const THOUSANDS_SEPARATOR_REGEX = /[.,]\d{3}/;

// ============================================================================
// VALIDATION REGEX (Exclude non-prices)
// ============================================================================

/**
 * Phone number pattern (to exclude)
 * Matches: +1 (555) 123-4567, 555-123-4567, etc.
 */
const PHONE_NUMBER_REGEX = /^\+?\d{1,3}[\s.-]?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/;

/**
 * Year pattern (to exclude)
 * Matches: 2024, 1999, etc.
 */
const YEAR_REGEX = /\b(19|20)\d{2}\b/;

/**
 * Date pattern (to exclude)
 * Matches: 12/31/2024, 2024-12-31, etc.
 */
const DATE_REGEX = /\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}|\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2}/;

/**
 * Time pattern (to exclude)
 * Matches: 12:30, 23:59, etc.
 */
const TIME_REGEX = /\b\d{1,2}:\d{2}(?::\d{2})?\s*(?:AM|PM|am|pm)?\b/;

/**
 * Percentage pattern (to exclude)
 * Matches: 50%, 12.5%, etc.
 */
const PERCENTAGE_REGEX = /\d+(?:\.\d+)?%/;

/**
 * Measurement pattern (to exclude)
 * Matches: 12cm, 5kg, 10m, etc.
 */
const MEASUREMENT_REGEX = /\d+(?:\.\d+)?\s*(?:cm|mm|km|m|kg|g|lb|oz|ft|in|ml|l)\b/i;

/**
 * Product code pattern (to exclude)
 * Matches: ABC-123, XYZ123, etc.
 */
const PRODUCT_CODE_REGEX = /[A-Z]{2,}-?\d{3,}|\d{3,}-[A-Z]{2,}/;

/**
 * File size pattern (to exclude)
 * Matches: 12KB, 5.5MB, 1GB, etc.
 */
const FILE_SIZE_REGEX = /\d+(?:\.\d+)?\s*(?:KB|MB|GB|TB|bytes?)\b/i;

/**
 * Version number pattern (to exclude)
 * Matches: v1.2.3, version 2.0, etc.
 */
const VERSION_REGEX = /\b(?:v|version)\s*\d+(?:\.\d+)*\b/i;

/**
 * Quantity pattern (may indicate bulk pricing)
 * Matches: "2 for $10", "Buy 3", "Pack of 5", etc.
 */
const QUANTITY_PATTERN_REGEX = /\b(?:pack|box|set|bundle|lot)\s+of\s+\d+|\d+\s*x\s*\d+|\d+\s+for\b/i;

// ============================================================================
// PRICE RANGE REGEX
// ============================================================================

/**
 * Price range pattern - ENHANCED for better detection
 * Matches: $10-$20, $10-20, US$10-11.90, €5,20-10,50, 10-20 USD, etc.
 * Handles special formats like "US$", "C$", and regular currency codes
 * Groups vary based on match - see detectPriceRange function for parsing
 */
const PRICE_RANGE_REGEX = /(?:(?:US|C|A|NZ|HK|S|R|NT)\s*)?([$€£¥₹₪₽₩฿₺₣₱₫₴])\s*(\d+(?:[.,]\d+)?)\s*[-–—~]\s*(?:(?:US|C|A|NZ|HK|S|R|NT)\s*)?([$€£¥₹₪₽₩฿₺₣₱₫₴])?\s*(\d+(?:[.,]\d+)?)|(?:([A-Z]{3})\s+)?(\d+(?:[.,]\d+)?)\s*[-–—~]\s*(\d+(?:[.,]\d+)?)\s*([A-Z]{3})?/i;

/**
 * Alternative price range pattern with "to"
 * Matches: $10 to $20, US$10 to 20, 10 to 20 USD, etc.
 * Handles special formats like "US$", "C$", and regular currency codes
 */
const PRICE_RANGE_TO_REGEX = /(?:(?:US|C|A|NZ|HK|S|R|NT)\s*)?([$€£¥₹₪₽₩฿₺₣₱₫₴])\s*(\d+(?:[.,]\d+)?)\s+to\s+(?:(?:US|C|A|NZ|HK|S|R|NT)\s*)?([$€£¥₹₪₽₩฿₺₣₱₫₴])?\s*(\d+(?:[.,]\d+)?)|(?:([A-Z]{3})\s+)?(\d+(?:[.,]\d+)?)\s+to\s+(\d+(?:[.,]\d+)?)\s*([A-Z]{3})?/i;

// ============================================================================
// CONTEXT REGEX (Words that indicate prices)
// ============================================================================

/**
 * Price indicator words
 * Words that commonly appear near prices
 */
const PRICE_INDICATOR_WORDS_REGEX = /\b(?:price|cost|total|pay|sale|discount|save|deal|offer|from|starting|only|just|was|now)\b/i;

/**
 * Shipping/delivery indicator words (to exclude)
 */
const SHIPPING_INDICATOR_REGEX = /\b(?:shipping|delivery|freight|postage|handling)\b/i;

/**
 * Sale/comparison price indicators
 * Words that indicate old/original prices
 */
const SALE_PRICE_INDICATOR_REGEX = /\b(?:was|originally|before|list|msrp|rrp|regular)\b/i;

// ============================================================================
// FRAGMENTED PRICE REGEX
// ============================================================================

/**
 * Valid price fragment pattern
 * Matches single characters/numbers used in fragmented prices
 */
const PRICE_FRAGMENT_REGEX = /^(US\s*\$|[A-Z]{3}|[$€£¥₹₪₽₩฿₺₣₱₫₴]|\d+|[.,])$/;

/**
 * AliExpress style attribute patterns
 */
const ALIEXPRESS_STYLE_PATTERN_REGEX = /currency-symbol:|is-price-power:|decimal_point:|comma_style:|show-decimal:|symbol_position:/;

// ============================================================================
// ADVANCED PRICE PATTERNS
// ============================================================================

/**
 * Abbreviated price formats (5k, 2.5M, 1.2B)
 * Matches: $5k, €2.5M, £1.2B, ¥500k
 */
const ABBREVIATED_PRICE_REGEX = /([$€£¥₹₪₽₩฿₺₣₱₫₴])\s*(\d+(?:\.\d+)?)\s*([KkMmBb])\b/;

/**
 * Price with "from" or "starting at"
 * Matches: from $10, starting at €50, as low as £20
 */
const PRICE_FROM_REGEX = /\b(?:from|starting\s+at|as\s+low\s+as|only|just)\s+([$€£¥₹₪₽₩฿₺₣₱₫₴])\s*(\d+(?:[.,]\d+)?)/i;

/**
 * Price with "up to" or "under"
 * Matches: up to $100, under €50, less than £20
 */
const PRICE_UP_TO_REGEX = /\b(?:up\s+to|under|less\s+than|max|maximum)\s+([$€£¥₹₪₽₩฿₺₣₱₫₴])\s*(\d+(?:[.,]\d+)?)/i;

/**
 * Price per unit (per kg, per item, each, etc.)
 * Matches: $5/kg, €10 each, £2 per item
 */
const PRICE_PER_UNIT_REGEX = /([$€£¥₹₪₽₩฿₺₣₱₫₴])\s*(\d+(?:[.,]\d+)?)\s*(?:\/|per|each)\s*(?:kg|g|lb|oz|item|piece|unit|person)?\b/i;

/**
 * Multiple prices in one string (and/or pattern)
 * Matches: $5 and $10, €20 or €30
 */
const MULTIPLE_PRICES_REGEX = /([$€£¥₹₪₽₩฿₺₣₱₫₴])\s*(\d+(?:[.,]\d+)?)\s+(?:and|or|to)\s+\1\s*(\d+(?:[.,]\d+)?)/i;

/**
 * Cryptocurrency patterns
 * Matches: 0.0001 BTC, 1.5 ETH, 100 USDT
 */
const CRYPTO_PRICE_REGEX = /(\d+(?:\.\d+)?)\s*(BTC|ETH|USDT|USDC|BNB|XRP|ADA|SOL|DOGE|DOT|MATIC|LTC|BCH|LINK|XLM|ATOM)\b/i;

/**
 * Price with discount indication
 * Matches: $50 (save $10), €100 (20% off)
 */
const PRICE_WITH_DISCOUNT_REGEX = /([$€£¥₹₪₽₩฿₺₣₱₫₴])\s*(\d+(?:[.,]\d+)?)\s*\((?:save|discount|off)\s+[^)]+\)/i;

/**
 * Subscription/recurring price patterns
 * Matches: $9.99/month, €50/year, £5 per month
 */
const SUBSCRIPTION_PRICE_REGEX = /([$€£¥₹₪₽₩฿₺₣₱₫₴])\s*(\d+(?:[.,]\d+)?)\s*(?:\/|per)\s*(?:month|mo|year|yr|week|day|hour)\b/i;

/**
 * Price in parentheses (common in Asian markets)
 * Matches: (¥100), ($50), (€20)
 */
const PRICE_IN_PARENTHESES_REGEX = /\(\s*([$€£¥₹₪₽₩฿₺₣₱₫₴])\s*(\d+(?:[.,]\d+)?)\s*\)/;

/**
 * Approx/circa price patterns
 * Matches: ~$50, approx €100, circa £200
 */
const APPROXIMATE_PRICE_REGEX = /(?:~|approx\.?|circa|about|around)\s*([$€£¥₹₪₽₩฿₺₣₱₫₴])\s*(\d+(?:[.,]\d+)?)/i;

// ============================================================================
// EXPORT
// ============================================================================

if (typeof window !== 'undefined') {
  window.PriceRegex = {
    // Currency detection
    CURRENCY_CODE_REGEX,
    SPECIAL_CURRENCY_REGEX,
    CURRENCY_SYMBOL_REGEX,
    HAS_CURRENCY_REGEX,

    // Price detection
    BASIC_PRICE_REGEX,
    CURRENCY_CODE_BEFORE_REGEX,
    CURRENCY_CODE_AFTER_REGEX,
    COMPREHENSIVE_PRICE_REGEX,
    SIMPLE_PRICE_REGEX,

    // Number extraction
    NUMBER_EXTRACTION_REGEX,
    DECIMAL_SEPARATOR_REGEX,
    THOUSANDS_SEPARATOR_REGEX,

    // Validation (exclusions)
    PHONE_NUMBER_REGEX,
    YEAR_REGEX,
    DATE_REGEX,
    TIME_REGEX,
    PERCENTAGE_REGEX,
    MEASUREMENT_REGEX,
    PRODUCT_CODE_REGEX,
    FILE_SIZE_REGEX,
    VERSION_REGEX,
    QUANTITY_PATTERN_REGEX,

    // Price ranges
    PRICE_RANGE_REGEX,
    PRICE_RANGE_TO_REGEX,

    // Context
    PRICE_INDICATOR_WORDS_REGEX,
    SHIPPING_INDICATOR_REGEX,
    SALE_PRICE_INDICATOR_REGEX,

    // Fragments
    PRICE_FRAGMENT_REGEX,
    ALIEXPRESS_STYLE_PATTERN_REGEX,

    // Advanced patterns
    ABBREVIATED_PRICE_REGEX,
    PRICE_FROM_REGEX,
    PRICE_UP_TO_REGEX,
    PRICE_PER_UNIT_REGEX,
    MULTIPLE_PRICES_REGEX,
    CRYPTO_PRICE_REGEX,
    PRICE_WITH_DISCOUNT_REGEX,
    SUBSCRIPTION_PRICE_REGEX,
    PRICE_IN_PARENTHESES_REGEX,
    APPROXIMATE_PRICE_REGEX
  };
}
