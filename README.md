# Currency Converter Pro

**A powerful Chrome extension for automatic currency conversion on any webpage**

Transform your international shopping experience with intelligent, real-time currency conversion. See exact prices in your preferred currency on any website - Amazon, eBay, AliExpress, and thousands more.

## 🌟 Key Features

### 💱 **Intelligent Price Detection**
- **Automatic Detection**: Scans any webpage and automatically detects prices in 170+ currencies
- **Smart Pattern Recognition**: Recognizes multiple price formats:
  - Standard prices: `$49.99`, `€12,50`, `£100`
  - Special formats: `US$10`, `C$50`, `A$75`, `NZ$100`
  - Currency codes: `USD 49.99`, `EUR 12.50`, `100 GBP`
  - Price ranges: `$10-$20`, `€5.50-10.99`, `US$10-11.90`
  - Abbreviated: `$5k`, `€2.5M`, `£1.2B`
  - Per unit: `$5/kg`, `€10 each`, `£2 per item`
  - Subscriptions: `$9.99/month`, `€50/year`
  - Approximate: `~$50`, `approx €100`
  - Cryptocurrencies: `0.001 BTC`, `1.5 ETH`, `100 USDT`
- **Fragmented Price Support**: Detects prices split across multiple HTML elements (common on Amazon, AliExpress, Newegg)
- **Context-Aware**: Understands pricing context to avoid false positives (phone numbers, dates, product codes)

### 🎨 **Multiple Display Modes**
1. **Tooltip Display** (Default - Recommended)
   - Hover over any price to see conversion in a beautiful tooltip
   - Native HTML title attribute - works everywhere, no compatibility issues
   - Zero performance impact
   - Accessible and standards-compliant

2. **Inline Display**
   - Shows conversion directly next to the original price
   - Format: `$49.99 (₪185.46)`
   - Real-time visual feedback

3. **Price Replacement**
   - Replaces original price with converted price
   - Format: `₪185.46 (was $49.99)`
   - Complete currency transformation

4. **Visual Highlighting**
   - Highlights converted prices with subtle visual effects
   - Customizable colors based on theme
   - Makes prices easy to spot on busy pages

### 🌍 **170+ Currencies Supported**

#### Major Currencies
- **US Dollar** (USD $), **Euro** (EUR €), **British Pound** (GBP £)
- **Japanese Yen** (JPY ¥), **Chinese Yuan** (CNY ¥)
- **Indian Rupee** (INR ₹), **Israeli Shekel** (ILS ₪)
- **Canadian Dollar** (CAD C$), **Australian Dollar** (AUD A$)
- **Swiss Franc** (CHF ₣), **Swedish Krona** (SEK kr)

#### Regional Currencies
- **European**: EUR, DKK, SEK, NOK, PLN, CZK, HUF, RON, BGN, HRK, ISK, ALL, MKD, RSD, BAM
- **Asian**: JPY, CNY, INR, KRW, THB, IDR, MYR, PHP, SGD, VND, KHR, LAK, MMK, BDT, PKR, LKR, NPR, AFN
- **Middle Eastern**: ILS, AED, SAR, QAR, KWD, BHD, OMR, JOD, LBP, EGP, MAD, TND, DZD, LYD, IQD, SYP, YER, SDG
- **Americas**: USD, CAD, MXN, BRL, ARS, CLP, COP, PEN, UYU, VEF, BOB, PYG, CRC, GTQ, HNL, NIO, PAB, DOP, JMD, TTD
- **African**: ZAR, NGN, GHS, KES, TZS, UGX, XOF, XAF, ETB, MAD, EGP, MUR, NAD, BWP, MZN
- **Cryptocurrencies**: BTC, ETH, USDT, USDC, BNB, XRP, ADA, SOL, DOGE, DOT, MATIC, LTC, BCH

### 🎯 **Site-Specific Optimization**

Pre-configured selectors for 25+ major e-commerce platforms:
- **Marketplaces**: Amazon, eBay, AliExpress, Alibaba, Etsy, Rakuten, Overstock
- **Retail**: Walmart, Target, Costco, Best Buy, Home Depot, Wayfair, IKEA
- **Electronics**: Newegg, B&H Photo
- **Fashion**: ASOS, Zalando, Zara, H&M, Nike, Adidas
- **Travel**: Booking.com, Expedia
- **Platforms**: Shopify stores, WooCommerce stores, Magento stores
- **Generic**: Works on any website with automatic fallback detection

### 📊 **Real-Time Exchange Rates**

- **Multiple API Providers**: Supports 8+ exchange rate APIs for reliability
  - ExchangeRate-API.com (default - free, no API key needed)
  - Fixer.io, CurrencyLayer, Exchangerate.host
  - CurrencyAPI.com, OpenExchangeRates.org, XE.com
  - Bank of Israel (for ILS rates)
- **Auto-Update**: Rates refresh automatically every 24 hours
- **Manual Refresh**: Update rates on demand via popup
- **Offline Support**: Works with cached rates when offline
- **Custom API Keys**: Bring your own API keys for premium services

### 🎨 **Beautiful Themes**

14 professionally designed themes:
1. **Chrome Dark** - Native Chrome dark mode (Default)
2. **Dark Mode** - Discord-inspired dark theme
3. **Blue Gradient** - Modern blue-purple gradient
4. **Professional** - Clean corporate blue
5. **Minimal** - Minimalist grayscale
6. **Vibrant** - Bright orange-red gradient
7. **Ocean** - Refreshing teal and aqua
8. **Sunset** - Purple and pink gradient
9. **Forest** - Calming green nature
10. **Midnight** - Deep navy blue
11. **Cherry** - Bold red and rose
12. **Autumn** - Warm amber and orange
13. **Lavender** - Soft purple
14. **Monochrome** - High contrast B&W

### ⚡ **Performance Optimized**

- **Smart Caching**: Conversion cache with automatic pruning (500 item limit)
- **Debounced Observer**: 500ms delay prevents excessive DOM scanning
- **Element Limits**: Processes 300-500 elements per pass for smooth performance
- **WeakSet Memory**: Automatic memory cleanup when elements removed from DOM
- **Modular Architecture**: Separate library files for better code splitting
- **Lazy Detection**: Only scans when necessary based on page changes

### 🔒 **Privacy & Security**

- **No Data Collection**: Extension doesn't collect or transmit any personal data
- **Local Processing**: All conversions happen in your browser
- **Secure APIs**: Only connects to reputable exchange rate APIs
- **No Tracking**: No analytics, no user tracking, no ads
- **Open Source**: Code is fully auditable

### 🛠️ **Advanced Features**

#### Context Menu Integration
- Right-click any selected price for instant conversion
- Smart detection of currency in selected text
- Quick access to conversion without leaving the page

#### Keyboard Shortcuts
- Context menu accessible via right-click
- Popup opens with browser action click
- Full keyboard navigation support

#### Conversion History
- Saves recent conversions for quick reference
- Configurable history limit (default: 50)
- Clear history option available

#### Debug Mode
- Detailed logging for troubleshooting
- Performance monitoring
- Detection statistics
- Can be enabled in settings

#### Import/Export Settings
- Export all your settings to JSON file
- Import settings from backup
- Share configurations across devices

## 📥 Installation

### From Chrome Web Store
1. Visit the [Chrome Web Store](#) (link coming soon)
2. Click "Add to Chrome"
3. Confirm by clicking "Add extension"

### Manual Installation (Developer Mode)
1. Download or clone this repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked"
5. Select the extension directory
6. Extension will appear in your toolbar

## 🚀 Quick Start

### Basic Usage
1. **Install the extension** from Chrome Web Store
2. **Click the extension icon** in your toolbar
3. **Select your preferred currency** (e.g., ILS, EUR, USD)
4. **Browse any website** - prices will be automatically converted
5. **Hover over prices** to see conversions in tooltip

### Changing Settings
1. Click the **extension icon**
2. Click **"Settings"** button
3. Configure:
   - Default target currency
   - Display mode (tooltip/inline/replacement)
   - Visual highlighting
   - Theme selection
   - Auto-update interval

### Using Context Menu
1. **Select any price text** on a webpage
2. **Right-click** the selection
3. Choose **"💱 Convert to [your currency]"**
4. Conversion appears in a popup notification

## ⚙️ Configuration Options

### Appearance Settings
- **Theme Selection**: Choose from 14 beautiful themes
- **UI Scale**: Adjust popup size (80% - 150%)
- **Visual Highlighting**: Toggle price highlighting
- **Custom Colors**: Themes include gradient, shadow, border customization

### Currency Settings
- **Default Target Currency**: Your preferred currency for conversions
- **Default Source Currency**: Optional - auto-detect if not set
- **Favorite Currencies**: Quick access to frequently used currencies

### Display Settings
- **Show Inline Conversion**: Display next to original price
- **Replace Original Price**: Replace with converted price
- **Show Tooltips**: Native HTML title tooltips (recommended)
- **Highlight Converted Prices**: Visual feedback for converted prices

### Detection Settings
- **Auto-Convert on Page Load**: Automatically convert when page loads
- **Auto-Convert on Hover**: Convert prices when you hover over them
- **Detect Price Ranges**: Enable range detection ($10-$20)
- **Skip Shipping Prices**: Ignore shipping/delivery costs
- **Skip Sale Prices**: Ignore crossed-out/original prices

### Advanced Settings
- **API Provider**: Choose exchange rate service
- **Custom API Key**: Use your own API key
- **Update Interval**: How often to refresh rates (1-168 hours)
- **Cache Size**: Maximum cached conversions (100-1000)
- **Debug Mode**: Enable detailed logging
- **Element Detection Limit**: Max elements per scan (100-1000)

## 🏗️ Architecture

### File Structure
```
currency-converter-pro/
├── manifest.json              # Extension configuration
├── background.js              # Service worker (API calls, storage)
├── content.js                 # Main price detection engine
├── lib/
│   ├── logger.js             # Professional logging system
│   ├── regex.js              # All regex patterns
│   ├── patterns.js           # Detection rules & site selectors
│   └── themes.js             # Theme configurations
├── pages/
│   ├── popup/
│   │   ├── popup.html        # Extension popup interface
│   │   └── popup.js          # Popup functionality
│   └── options/
│       ├── options.html      # Settings page
│       ├── options.js        # Settings functionality
│       └── tabs.js           # Tab navigation
├── styles/
│   ├── content.css           # Injected page styles
│   ├── popup.css             # Popup styles
│   ├── options.css           # Settings page styles
│   └── themes.css            # Theme definitions
└── icons/                    # Extension icons
```

### Technology Stack
- **Manifest V3**: Latest Chrome extension architecture
- **Vanilla JavaScript**: No frameworks - lightweight and fast
- **CSS3**: Modern styling with gradients and animations
- **Chrome Storage API**: Settings and rate caching
- **Service Worker**: Background rate updates
- **Content Scripts**: Page injection and price detection
- **Context Menus API**: Right-click conversion

### Detection Algorithm
1. **Page Scan**: MutationObserver watches for DOM changes
2. **Element Selection**: Site-specific or generic selectors
3. **Text Extraction**: Extracts text from potential price elements
4. **Pattern Matching**: Tests against 30+ regex patterns
5. **Validation**: Excludes false positives (phone numbers, dates, etc.)
6. **Context Analysis**: Checks surrounding text for price indicators
7. **Currency Detection**: Identifies currency from symbols or codes
8. **Conversion**: Applies exchange rate and formats result
9. **Display**: Shows in tooltip, inline, or replacement mode

## 🎯 Use Cases

### International Shopping
- **Compare Prices**: See if US or EU prices are better for your location
- **Budget Planning**: Know exact costs in your currency before buying
- **No Surprises**: Avoid unexpected conversion charges from banks

### Travel Planning
- **Hotel Prices**: Compare accommodation costs across countries
- **Flight Tickets**: See airfare in your currency
- **Local Costs**: Understand prices when researching destinations

### Business & Finance
- **Market Research**: Analyze pricing across international markets
- **Vendor Comparison**: Compare suppliers from different countries
- **Cost Analysis**: Evaluate international purchases in your currency

### Cryptocurrency Trading
- **Crypto Prices**: Convert Bitcoin, Ethereum, and altcoin prices
- **Portfolio Value**: See holdings in your local currency
- **Exchange Rates**: Monitor crypto to fiat conversions

## 🤝 Contributing

Contributions are welcome! This project is open source and community-driven.

### How to Contribute
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Test thoroughly
5. Commit with clear messages (`git commit -m 'Add amazing feature'`)
6. Push to your branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Development Setup
```bash
# Clone the repository
git clone https://github.com/yourusername/currency-converter-pro.git

# Load in Chrome
1. Go to chrome://extensions/
2. Enable Developer Mode
3. Click "Load unpacked"
4. Select the project directory

# Make changes and reload extension
# Click reload icon on chrome://extensions/
```

### Code Guidelines
- Use ES6+ JavaScript features
- Follow existing code style
- Add comments for complex logic
- Test on multiple websites
- Ensure no console errors
- Update README if adding features

## 🐛 Known Issues

### Limitations
- **Dynamic Prices**: Some single-page apps with highly dynamic content may need manual refresh
- **Lazy Loading**: Prices loaded after scrolling may not be detected immediately
- **Custom Fonts**: Some websites use custom fonts that hide text from detection
- **iFrames**: Prices inside iframes may not be detected (browser security)

### Workarounds
- **Manual Conversion**: Use context menu on selected text
- **Reload Extension**: Click reload on chrome://extensions/
- **Report Issues**: Use GitHub issues to report problematic websites

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Exchange rate data provided by multiple free and paid API services
- Icons and design inspired by modern material design principles
- Community feedback and bug reports help improve the extension
- Built with ❤️ for the global shopping community

## 📞 Support

### Get Help
- **GitHub Issues**: [Report bugs or request features](https://github.com/KuchiSofts/Currency-Converter-Pro/issues)
- **Documentation**: Read this README for detailed information
- **Settings**: Check extension settings for configuration options

### FAQ

**Q: Why aren't prices being converted?**
A: Check that: (1) Currency is set in popup, (2) Exchange rates are loaded, (3) Page has detectable prices. Try manual conversion via context menu.

**Q: Can I use my own exchange rate API?**
A: Yes! Go to Settings → Advanced → API Provider and enter your API key.

**Q: Does this work offline?**
A: Yes, with cached exchange rates. Rates are stored locally for 24 hours.

**Q: Is my data being collected?**
A: No. All processing happens locally in your browser. No data is transmitted to any servers except exchange rate APIs.

**Q: Why do some prices show wrong currency?**
A: Dollar signs ($) are ambiguous (USD, CAD, AUD, etc.). Use context menu conversion or site-specific detection will improve accuracy.

**Q: Can I convert cryptocurrency?**
A: Yes! The extension detects BTC, ETH, USDT and other major cryptocurrencies.

**Q: How often are exchange rates updated?**
A: Default is 24 hours. You can change this in Settings → Advanced → Update Interval.

**Q: Does this work on all websites?**
A: It works on most websites. Some heavily customized sites or those using canvas/SVG for prices may not work.

---

**Made with ❤️ for international shoppers worldwide**

*Currency Converter Pro - v3.2.2*
