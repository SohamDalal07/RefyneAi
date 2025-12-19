# RefyneAI - Intelligent Prompt Refinement

<div align="center">

![RefyneAI Logo](icon48.png)

**Transform basic prompts into powerful AI requests**

[![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-blue?logo=google-chrome)](https://github.com/yourusername/refyneai)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Version](https://img.shields.io/badge/Version-1.0.2-orange.svg)](manifest.json)

[Features](#features) • [Installation](#installation) • [Usage](#usage) • [Supported Platforms](#supported-platforms) • [Privacy](#privacy)

</div>

---

## 🎯 What is RefyneAI?

RefyneAI is a Chrome extension that uses AI to intelligently refine your prompts, helping you get 3-5x better responses from AI platforms like Gemini, Claude, and Perplexity.

**Stop struggling with vague prompts.** Just click the **R<sub>AI</sub> Refine** button and get multiple AI-enhanced variations instantly.

---

## ✨ Features

- **🤖 AI-Powered Refinement** - Advanced AI analyzes and enhances your prompts
- **🎯 Multiple Options** - Get 3-5 diverse refinement suggestions
- **🔒 Privacy-First** - All data stored locally, never shared
- **⚡ Lightning Fast** - Instant refinements, no waiting
- **🌐 Multi-Platform** - Works on Gemini, Claude, Perplexity
- **🎨 Beautiful UI** - Modern, intuitive interface with R<sub>AI</sub> branding

---

## 📦 Installation

### Option 1: Manual Installation (Recommended for now)

1. **Download the Extension**
   ```bash
   git clone https://github.com/SohamDalal07/RefyneAi.git
   cd refyneai
   ```

2. **Load in Chrome**
   - Open Chrome and go to `chrome://extensions/`
   - Enable **Developer mode** (top right toggle)
   - Click **Load unpacked**
   - Select the `extension` folder from this repository

3. **Configure API Key**
   - Click the RefyneAI extension icon
   - Click "Manage" or go to setup
   - Choose your AI provider (Gemini, OpenAI, or Claude)
   - Enter your API key ([Get free Gemini API key](https://aistudio.google.com/app/apikey))
   - Select your preferred model (optional)
   - Click "Verify & Save"

### Option 2: Chrome Web Store (Coming Soon)

The extension will be available on the Chrome Web Store after testing is complete.

---

## 🚀 Usage

1. **Go to a supported platform** (Gemini, Claude, or Perplexity)
2. **Type your prompt** in the input field
3. **Click the "R<sub>AI</sub> Refine" button** next to the input
4. **Choose from 3-5 AI-enhanced options** in the modal
5. **Submit your refined prompt** for better AI responses!

### Example

**Before:**
```
explain ai
```

**After RefyneAI:**
```
As an expert in artificial intelligence, please provide a comprehensive 
explanation of AI including:
- Clear definition with examples
- Practical applications across industries
- Key concepts and terminology
- Current trends and future implications
```

---

## 🌐 Supported Platforms

| Platform | Status | Features |
|----------|--------|----------|
| **Google Gemini** | ✅ Full Support | Button + Modal |
| **Anthropic Claude** | ✅ Full Support | Button + Modal |
| **Perplexity AI** | ✅ Full Support | Button + Modal |


---

## 🔧 Configuration

### API Providers

RefyneAI supports multiple AI providers:

- **Google Gemini** (Recommended)
  - Free tier available
  - Models: gemini-2.5-flash, gemini-1.5-flash, gemini-1.5-pro
  - [Get API Key](https://aistudio.google.com/app/apikey)

- **OpenAI**
  - Paid service
  - Models: gpt-4, gpt-4-turbo, gpt-3.5-turbo
  - [Get API Key](https://platform.openai.com/api-keys)

- **Anthropic Claude**
  - Paid service
  - Models: claude-3-opus, claude-3-sonnet, claude-3-haiku
  - [Get API Key](https://console.anthropic.com/account/keys)

### Settings

- **AI Provider**: Choose your preferred AI service
- **API Key**: Your personal API key (stored locally)
- **Model**: Select specific model (optional, uses default if not set)

---

## 🔒 Privacy & Security

- ✅ **Local Storage Only** - All data stored on your device
- ✅ **No Data Collection** - We never collect or track your information
- ✅ **No External Servers** - Direct communication with AI providers only
- ✅ **API Keys Protected** - Stored securely in Chrome's local storage
- ✅ **Open Source** - Transparent code you can review

**We take your privacy seriously.** Your API keys and prompts never leave your device except to communicate directly with your chosen AI provider.

---

## 🛠️ Development

### Project Structure

```
refyneai/
├── extension/
│   ├── manifest.json          # Extension configuration
│   ├── content.js             # Content script injector
│   ├── background.js          # Service worker
│   ├── popup.html/js/css      # Extension popup
│   ├── setup.html/js          # Setup page
│   ├── refine-button.js       # Main refinement logic
│   ├── refine-button.css      # UI styles
│   ├── providers/             # AI provider integrations
│   │   ├── base-provider.js
│   │   ├── gemini-provider.js
│   │   ├── openai-provider.js
│   │   └── claude-provider.js
│   └── ...
└── README.md
```

### Tech Stack

- **Manifest Version**: 3
- **Languages**: JavaScript (ES6+), HTML5, CSS3
- **APIs**: Chrome Extension APIs, Gemini/OpenAI/Claude APIs
- **Architecture**: Content scripts, service worker, popup UI

---

## 🐛 Troubleshooting

### Extension not appearing
- Make sure Developer mode is enabled
- Reload the extension in `chrome://extensions`
- Check browser console for errors

### Refine button not showing
- Refresh the AI platform page
- Check if the platform is supported
- Verify extension is enabled

### API errors
- Verify your API key is correct
- Check API quota/limits
- Try a different model
- Wait a moment if you see "503 - Model Overloaded"

### Modal not appearing
- Check browser console for errors
- Reload the extension
- Clear browser cache

---

## 📝 Changelog

### Version 1.0.2 (Current)
- ✅ Multi-LLM support (Gemini, OpenAI, Claude)
- ✅ AI-powered refinement with diverse options
- ✅ Beautiful R<sub>AI</sub> branding
- ✅ Provider retry logic for stability
- ✅ Improved text extraction


---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Built with ❤️ for better AI interactions
- Powered by Gemini, OpenAI, and Claude APIs
- Inspired by the need for better prompt engineering

---

## 📧 Support

- **Issues**: [GitHub Issues](https://github.com/SohamDalal07/RefyneAi/issues)
- **Email**: smdalal.ac@gmail.com
- **Website**: Coming soon

---

<div align="center">

**Made with ❤️ by [Soham Dalal]**

⭐ Star this repo if you find it useful!

</div>
