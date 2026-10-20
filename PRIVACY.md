# Privacy Policy

_Last updated: October 2026_

Currency Converter Pro is a browser extension that converts prices on web pages into your preferred currency. It is designed to work without collecting any personal data.

## Summary

- **No data collection.** The extension has no analytics, no tracking, no accounts and no servers of its own.
- **Your settings stay in your browser.** They are stored with Chrome's own storage APIs.
- **Network requests only fetch exchange rates.** They go to the exchange rate provider you selected and to CoinGecko (for cryptocurrency prices). No page content is sent.
- **Pages are read locally.** The content script reads page text on your device to find prices and never sends it anywhere.

## What the extension stores

| Data | Where | Purpose |
| --- | --- | --- |
| Your settings (target currency, display options, selected provider, optional API key, favorite currencies) | `chrome.storage.sync` | Remember your preferences. If Chrome Sync is turned on, Chrome syncs these to your Google account like other extension settings. |
| Cached exchange rates and the time they were fetched | `chrome.storage.local` | Avoid refetching rates on every page load. |
| Conversion history from the popup (can be turned off in settings) | `chrome.storage.local` | Show your recent conversions in the popup. |

The optional API key is stored in `chrome.storage.sync` as plain text. The extension does not encrypt it. Use a key from a free or limited plan if this is a concern. You can delete all stored data at any time with **Settings > Advanced > Reset All Settings** or by removing the extension.

## Network requests

The extension's background service worker makes HTTPS requests to:

1. **The exchange rate provider you selected.** This is [ExchangeRate-API](https://www.exchangerate-api.com) by default. The optional providers are Frankfurter (ECB data), Bank of Israel, Open Exchange Rates, CurrencyAPI, Fixer.io and CurrencyLayer. If the provider needs an API key, the key is sent to that provider only.
2. **[CoinGecko](https://www.coingecko.com)**, to fetch cryptocurrency prices.

These requests only ask for the latest rates. They contain no information about you or the pages you visit. As with any web request, the provider can see your IP address. Each provider's own privacy policy covers how it handles that.

## Page content

The content script runs on web pages to detect prices such as `$49.99` or `€12,50`. It reads text and some layout information in your browser, converts the amounts locally, and shows the result as a tooltip or replaces it in place. Page content, URLs and browsing history are never sent to the extension's developer or to anyone else.

When you right-click a price and choose **Convert**, the selected text goes from the page to the extension's own background script to do the conversion. It never leaves your browser.

## Permissions

| Permission | Why it is needed |
| --- | --- |
| `storage` | Save your settings and cached rates. |
| `contextMenus` | Add the right-click "Convert to ..." menu item. |
| `alarms` | Refresh exchange rates on your chosen schedule. |
| Host access to the rate provider and CoinGecko domains | Fetch exchange rates. |
| Content script on all sites | Detect and convert prices on the pages you visit. |

## Changes

If this policy changes, the updated version will be published in this repository.

## Contact

Questions or concerns? Open an issue at <https://github.com/KuchiSofts/Currency-Converter-Pro/issues>.
