/**
 * Currency Converter Pro - Professional Debug Logger
 * Centralized logging system with color-coded output and performance tracking
 * Version: 3.2.0
 *
 * Features:
 * - Dynamic enable/disable from settings
 * - Color-coded log levels (info, error, warn, debug, performance)
 * - Timestamp formatting
 * - Zero console spam when disabled
 * - Performance metrics tracking
 */

// ============================================================================
// DEBUG STATE MANAGEMENT
// ============================================================================

/**
 * Debug mode state - controlled by user settings
 * Default: OFF for production (zero console output)
 * When ON: Shows detailed logs with timestamps and categories
 */
let DEBUG_MODE = false;

/**
 * Performance tracking storage
 */
const performanceMetrics = {
  marks: new Map(),
  measures: []
};

// ============================================================================
// LOG LEVEL CONFIGURATIONS
// ============================================================================

/**
 * Log level styling configurations
 */
const LOG_STYLES = {
  info: {
    prefix: '[CCP]',
    prefixColor: '#4f46e5',     // Indigo
    timestampColor: '#6b7280'   // Gray
  },
  error: {
    prefix: '[CCP ERROR]',
    prefixColor: '#ef4444',     // Red
    timestampColor: '#6b7280'
  },
  warn: {
    prefix: '[CCP WARN]',
    prefixColor: '#f59e0b',     // Amber
    timestampColor: '#6b7280'
  },
  debug: {
    prefix: '[CCP DEBUG]',
    prefixColor: '#10b981',     // Green
    timestampColor: '#6b7280'
  },
  performance: {
    prefix: '[CCP PERF]',
    prefixColor: '#8b5cf6',     // Purple
    timestampColor: '#6b7280',
    labelColor: '#06b6d4'       // Cyan
  }
};

// ============================================================================
// CORE LOGGING FUNCTIONS
// ============================================================================

/**
 * General information logging
 * Use for: Price detection, conversion success, general flow
 * @param {...any} args - Arguments to log
 */
function log(...args) {
  if (!DEBUG_MODE) return;

  const styles = LOG_STYLES.info;
  console.log(
    `%c${styles.prefix}%c ${formatTimestamp()}`,
    `color: ${styles.prefixColor}; font-weight: bold;`,
    `color: ${styles.timestampColor};`,
    ...args
  );
}

/**
 * Error logging
 * Use for: API failures, conversion errors, critical issues
 * @param {...any} args - Arguments to log
 */
function logError(...args) {
  if (!DEBUG_MODE) return;

  const styles = LOG_STYLES.error;
  console.error(
    `%c${styles.prefix}%c ${formatTimestamp()}`,
    `color: ${styles.prefixColor}; font-weight: bold;`,
    `color: ${styles.timestampColor};`,
    ...args
  );
}

/**
 * Warning logging
 * Use for: Fallback scenarios, deprecated features, minor issues
 * @param {...any} args - Arguments to log
 */
function logWarn(...args) {
  if (!DEBUG_MODE) return;

  const styles = LOG_STYLES.warn;
  console.warn(
    `%c${styles.prefix}%c ${formatTimestamp()}`,
    `color: ${styles.prefixColor}; font-weight: bold;`,
    `color: ${styles.timestampColor};`,
    ...args
  );
}

/**
 * Debug logging
 * Use for: Detailed debugging, development insights
 * @param {...any} args - Arguments to log
 */
function logDebug(...args) {
  if (!DEBUG_MODE) return;

  const styles = LOG_STYLES.debug;
  console.debug(
    `%c${styles.prefix}%c ${formatTimestamp()}`,
    `color: ${styles.prefixColor}; font-weight: bold;`,
    `color: ${styles.timestampColor};`,
    ...args
  );
}

/**
 * Performance logging
 * Use for: Execution time tracking, optimization metrics
 * @param {string} label - Label for the performance metric
 * @param {number} duration - Duration in milliseconds
 */
function logPerformance(label, duration) {
  if (!DEBUG_MODE) return;

  const styles = LOG_STYLES.performance;
  console.log(
    `%c${styles.prefix}%c ${formatTimestamp()} %c${label}%c took ${duration.toFixed(2)}ms`,
    `color: ${styles.prefixColor}; font-weight: bold;`,
    `color: ${styles.timestampColor};`,
    `color: ${styles.labelColor}; font-weight: bold;`,
    `color: ${styles.timestampColor};`
  );
}

// ============================================================================
// PERFORMANCE TRACKING
// ============================================================================

/**
 * Mark the start of a performance measurement
 * @param {string} label - Unique label for the measurement
 */
function performanceStart(label) {
  if (!DEBUG_MODE) return;

  performanceMetrics.marks.set(label, performance.now());
}

/**
 * Mark the end of a performance measurement and log the duration
 * @param {string} label - Label matching the performanceStart call
 */
function performanceEnd(label) {
  if (!DEBUG_MODE) return;

  const startTime = performanceMetrics.marks.get(label);
  if (!startTime) {
    logWarn(`Performance mark "${label}" not found`);
    return;
  }

  const duration = performance.now() - startTime;
  performanceMetrics.measures.push({
    label,
    duration,
    timestamp: Date.now()
  });

  logPerformance(label, duration);
  performanceMetrics.marks.delete(label);
}


// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Format current time as HH:MM:SS AM/PM
 * @returns {string} Formatted timestamp
 */
function formatTimestamp() {
  return new Date().toLocaleTimeString();
}

/**
 * Enable debug mode
 */
function enableDebugMode() {
  DEBUG_MODE = true;
  log('🔧 Debug mode ENABLED');
}

/**
 * Disable debug mode
 */
function disableDebugMode() {
  const wasEnabled = DEBUG_MODE;
  DEBUG_MODE = false;
  if (wasEnabled) {
    console.log('%c[CCP]%c Debug mode DISABLED',
      'color: #4f46e5; font-weight: bold;',
      'color: #6b7280;');
  }
}

/**
 * Get current debug mode state
 * @returns {boolean} True if debug mode is enabled
 */
function isDebugEnabled() {
  return DEBUG_MODE;
}

/**
 * Set debug mode state
 * @param {boolean} enabled - Enable or disable debug mode
 */
function setDebugMode(enabled) {
  if (enabled) {
    enableDebugMode();
  } else {
    disableDebugMode();
  }
}

// ============================================================================
// SPECIALIZED LOGGING HELPERS
// ============================================================================

/**
 * Log price detection with emoji and formatting
 * @param {string} original - Original price string
 * @param {string} currency - Source currency code
 * @param {number} amount - Price amount
 */
function logPriceDetected(original, currency, amount) {
  log(`✅ Valid price detected: ${currency} ${amount} from "${original}"`);
}

/**
 * Log conversion result
 * @param {number} sourceAmount - Source amount
 * @param {string} sourceCurrency - Source currency code
 * @param {number} targetAmount - Converted amount
 * @param {string} targetCurrency - Target currency code
 */
function logConversion(sourceAmount, sourceCurrency, targetAmount, targetCurrency) {
  log(`✅ ${sourceCurrency} ${sourceAmount} → ${targetCurrency} ${targetAmount}`);
}

/**
 * Log element skip with reason
 * @param {string} reason - Reason for skipping
 * @param {Object} [details] - Optional details object
 */
function logSkipped(reason, details = {}) {
  log(`⏭️ ${reason}`, details);
}

/**
 * Log fragmented price detection
 * @param {string} siteType - Site type (Amazon, AliExpress, etc.)
 * @param {number} fragmentCount - Number of fragments
 * @param {string} text - Assembled text
 */
function logFragmentedPrice(siteType, fragmentCount, text) {
  log(`🧩 Detected ${siteType} fragmented price with ${fragmentCount} fragments: "${text}"`);
}

// ============================================================================
// INITIALIZATION
// ============================================================================

/**
 * Initialize debug logger and load settings from storage
 */
async function initDebugLogger() {
  try {
    // Load debug mode setting from storage
    const result = await chrome.storage.sync.get(['debugMode']);
    DEBUG_MODE = result.debugMode || false;

    if (DEBUG_MODE) {
      log('🔧 Debug logger initialized - DEBUG MODE ON');
    }

    // Listen for settings changes to update debug mode dynamically
    chrome.storage.onChanged.addListener((changes, areaName) => {
      if (areaName === 'sync' && changes.debugMode) {
        const newValue = changes.debugMode.newValue || false;
        setDebugMode(newValue);
      }
    });
  } catch (error) {
    console.error('Failed to initialize debug logger:', error);
  }
}

// ============================================================================
// EXPORT FOR USE IN OTHER SCRIPTS
// ============================================================================

// Make logger available globally
if (typeof window !== 'undefined') {
  window.DebugLogger = {
    // Core functions
    log,
    logError,
    logWarn,
    logDebug,
    logPerformance,

    // Performance tracking
    performanceStart,
    performanceEnd,

    // State management
    enableDebugMode,
    disableDebugMode,
    isDebugEnabled,
    setDebugMode,

    // Specialized helpers
    logPriceDetected,
    logConversion,
    logSkipped,
    logFragmentedPrice,

    // Initialization
    initDebugLogger
  };
}

// Auto-initialize if in browser context
if (typeof window !== 'undefined' && typeof chrome !== 'undefined') {
  initDebugLogger();
}
