# 💱 Currency Converter Pro

<div align="center">

![Version](https://img.shields.io/badge/version-2.1.2-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Chrome](https://img.shields.io/badge/chrome-extension-brightgreen.svg)
![Manifest V3](https://img.shields.io/badge/manifest-v3-orange.svg)

**Professional currency converter Chrome extension with intelligent auto-conversion, beautiful themes, and real-time exchange rates**

[Features](#-features) • [Installation](#-installation) • [Usage](#-usage) • [Development](#-development) • [Contributing](#-contributing)

</div>

---

## ✨ Features

### 🎨 **Beautiful & Customizable**
- **6 Professional Themes**: Default, Dark, Light, Blue, Green, Purple
- **Responsive Design**: Works perfectly on any screen size
- **Smooth Animations**: Professional transitions and effects
- **Dark Mode Support**: Automatic system theme detection

### 💱 **Smart Currency Conversion**
- **Auto-Detection**: Automatically detects prices on web pages
- **Context Menu Integration**: Right-click any price to convert
- **40+ Currencies Supported**: All major world currencies
- **Real-Time Rates**: Updated daily from reliable sources
- **Offline Support**: Cached rates for offline use

### 🔧 **Powerful Features**
- **Multiple API Providers**: Choose from 10 different exchange rate APIs
- **FREE APIs Available**: No API key needed by default
- **Smart Tooltips**: Hover over prices to see conversions
- **Price Highlighting**: Visual indicators for detected prices
- **Conversion History**: Track your recent conversions (up to 100)
- **Favorite Currencies**: Quick access to your most-used currencies

### 🎯 **Professional Tools**
- **Tabbed Settings**: Organized, easy-to-navigate settings
- **API Key Management**: Secure storage for premium API keys
- **Export/Import Settings**: Backup and restore your configuration
- **Performance Optimization**: Lightweight and fast
- **Accessibility**: Full keyboard navigation and screen reader support

---

## 📸 Screenshots

### Main Popup
![Popup Interface](docs/screenshots/popup.png)

### Settings Page
![Settings Interface](docs/screenshots/settings.png)

### Dark Theme
![Dark Theme](docs/screenshots/dark-mode.png)

---

## 🚀 Installation

### Method 1: Chrome Web Store (Coming Soon)
1. Visit the [Chrome Web Store](#) (link coming soon)
2. Click "Add to Chrome"
3. Start converting!

### Method 2: Load Unpacked (For Development)

1. **Clone the repository**
   ```bash
   git clone https://github.com/KuchiSofts/Currency-Converter-Pro.git
   cd Currency-Converter-Pro
   ```

2. **Open Chrome Extensions**
   - Go to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top right)

3. **Load the extension**
   - Click "Load unpacked"
   - Select the cloned `Currency-Converter-Pro` folder
   - Done! The extension is now active

---

## 💡 Usage

### Basic Conversion

1. **Click the extension icon** in your Chrome toolbar
2. **Enter an amount** in the input field
3. **Select currencies** from the dropdowns
4. **See instant results** - conversion happens automatically!

### Auto-Conversion on Websites

1. **Browse any website** with prices
2. **Hover over prices** to see tooltips with conversions
3. **Right-click any price** and select "Convert to [Currency]"
4. **Prices are highlighted** automatically (if enabled)

### Favorite Currencies

1. Open the **settings page**
2. Go to **"History & Favorites"** tab
3. Enable **"Sync Favorites"**
4. Click **favorite currency buttons** in the popup for quick conversion

---

## ⚙️ Configuration

### API Providers

The extension supports multiple exchange rate providers:

#### **Free APIs (No Key Required)** ✅
- **ExchangeRate-API** (Default) - 1500 requests/month
- **ExchangeRates API** - 1000 requests/month
- **European Central Bank** - Unlimited
- **Bank of Israel** - Unlimited (best for ILS)
- **CurrencyAPI** - 300 requests/month

#### **Premium APIs (Key Required)** 💎
- **Fixer.io** - From $10/month
- **CurrencyLayer** - From $10/month
- **Open Exchange Rates** - FREE tier available! (1000/month)
- **XE Currency** - Enterprise only

### Settings Overview

| Tab | Description |
|-----|-------------|
| **General** | Appearance, Default Settings, API Provider |
| **Display** | Tooltip Settings, Display Format, Preferences |
| **Features** | Page Features, History, Smart Features |
| **Advanced** | Performance, Accessibility, Advanced Options |
| **About** | Quick Actions, Version Info |

---

## 🛠️ Development

### Prerequisites

- Chrome/Chromium Browser
- Node.js 18+ (for validation only)
- Git

### Project Structure

```
Currency-Converter-Pro/
├── manifest.json          # Extension manifest (Manifest V3)
├── VERSION.js             # Centralized version management
├── background.js          # Service worker for API calls
├── popup.html/js          # Main popup interface
├── options.html/js        # Settings page
├── content.js             # Content script for page integration
├── tabs.js                # Tab navigation for settings
├── theme-manager.js       # Theme switching logic
├── version.js             # Version display
├── icons/                 # Extension icons (16, 32, 48, 128)
└── styles/               # CSS files
    ├── themes.css        # Theme definitions
    ├── popup.css         # Popup styles
    ├── options.css       # Settings styles
    └── content.css       # Injected styles
```

### Key Technologies

- **Manifest V3** - Latest Chrome extension standard
- **Service Workers** - Background processing
- **Chrome Storage API** - Settings persistence
- **Fetch API** - Exchange rate updates
- **CSS Variables** - Theme system
- **Vanilla JavaScript** - No dependencies!

### Building

No build step required! This is a pure JavaScript extension.

1. Make your changes
2. Update `VERSION.js` with new version number
3. Test in Chrome with "Load unpacked"
4. Ready to distribute!

### Version Management

**IMPORTANT**: We use centralized version management.

Always update `/VERSION.js` first:
```javascript
const EXTENSION_VERSION = {
  major: 2,
  minor: 1,
  patch: 2,
  // ...
};
```

This automatically updates:
- `manifest.json`
- All HTML file references
- Build date
- Changelog

---

## 🧪 Testing

### Manual Testing Checklist

- [ ] Popup opens and displays correctly
- [ ] Currency conversion works
- [ ] Settings save and load correctly
- [ ] Themes switch properly
- [ ] Auto-detection works on test pages
- [ ] Context menu appears and works
- [ ] API provider switching works
- [ ] Tabs navigation functions
- [ ] Dark mode renders correctly
- [ ] Responsive design works at all sizes

### Test Pages

- Amazon product pages
- eBay listings
- International news sites
- Currency comparison websites

---

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for details.

### Quick Start

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Update `VERSION.js`
5. Test thoroughly
6. Commit (`git commit -m 'Add amazing feature'`)
7. Push (`git push origin feature/amazing-feature`)
8. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Exchange rate data provided by various free APIs
- Icons and design inspired by modern UI principles
- Built with ❤️ for the Chrome community

---

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/KuchiSofts/Currency-Converter-Pro/issues)
- **Discussions**: [GitHub Discussions](https://github.com/KuchiSofts/Currency-Converter-Pro/discussions)
- **Email**: your.email@example.com

---

## 🗺️ Roadmap

- [ ] Firefox support
- [ ] Safari support
- [ ] More API providers
- [ ] Historical rate charts
- [ ] Currency alerts
- [ ] Mobile companion app
- [ ] Browser sync across devices

---

<div align="center">

**Made with 💜 by [KuchiSofts](https://github.com/KuchiSofts)**

If you find this useful, please ⭐ star the repository!

</div>
