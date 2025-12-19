# PromptEngine Installation & Testing Guide

## Quick Start (5 Minutes)

### Step 1: Verify Project Structure

Ensure your directory looks like this:

```
D:\PromptEngine\
├── extension/
│   ├── manifest.json
│   ├── content.js
│   ├── background.js
│   ├── popup.html
│   ├── popup.js
│   ├── styles.css
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
│
├── engine/
│   ├── analyzer.js
│   ├── templates.js
│   ├── refiner.js
│   └── policies.js
│
├── README.md
└── AI_INTEGRATION_DESIGN.md
```

### Step 2: Load Extension in Chrome

1. Open Chrome/Edge/Brave browser
2. Navigate to `chrome://extensions/`
3. Enable **Developer mode** (toggle in top-right corner)
4. Click **Load unpacked**
5. Select the `D:\PromptEngine\extension` folder
6. PromptEngine should now appear in your extensions list

**Note**: The extension will use Chrome's default puzzle piece icon. You can add custom icons later by following the instructions in `extension/ICONS_README.md`.

### Step 3: Verify Installation

1. Look for the PromptEngine icon in your browser toolbar
2. Click the icon to open the popup
3. Verify that:
   - Toggle switch is ON (Active)
   - Mode is set to "General"
   - Status shows "Ready"

## Testing the Extension

### Test 1: Basic Refinement on ChatGPT

1. Go to https://chat.openai.com
2. Type a simple prompt: `explain quantum computing`
3. Press Enter
4. **Expected Result**: The prompt should be automatically refined to include role, task structure, and output format

**Before (what you typed):**
```
explain quantum computing
```

**After (what gets sent):**
```
You are a helpful and knowledgeable assistant.

Request: explain quantum computing

Requirements:
- Provide accurate and relevant information
- Be clear and concise
- Structure the response logically
- Address all aspects of the request

Output format: Provide a well-structured, comprehensive response.
```

### Test 2: Coding Mode

1. Click the PromptEngine icon
2. Change mode to "Coding"
3. Go to ChatGPT or any LLM interface
4. Type: `create a function to sort an array`
5. Press Enter
6. **Expected Result**: Prompt refined with software engineering context

### Test 3: Academic Mode

1. Change mode to "Academic"
2. Type: `what is machine learning`
3. **Expected Result**: Prompt refined with academic research context

### Test 4: Short Prompts (Should NOT Refine)

1. Type: `hello`
2. Press Enter
3. **Expected Result**: Prompt sent as-is (too short to refine)

### Test 5: Commands (Should NOT Refine)

1. Type: `/help`
2. Press Enter
3. **Expected Result**: Prompt sent as-is (starts with /)

### Test 6: Toggle OFF

1. Click PromptEngine icon
2. Turn toggle OFF
3. Type any prompt
4. **Expected Result**: Prompt sent as-is (extension disabled)

## Testing on Multiple LLM Platforms

### ChatGPT (OpenAI)
- URL: https://chat.openai.com
- Input: `<textarea>` element
- ✅ Should work

### Google Gemini
- URL: https://gemini.google.com
- Input: `contenteditable` div
- ✅ Should work

### Claude (Anthropic)
- URL: https://claude.ai
- Input: `contenteditable` div
- ✅ Should work

### Perplexity
- URL: https://www.perplexity.ai
- Input: `<textarea>` element
- ✅ Should work

## Troubleshooting

### Extension Not Loading

**Problem**: Extension doesn't appear after loading unpacked

**Solution**:
1. Check for errors in `chrome://extensions/`
2. Click "Errors" button if present
3. Verify all files are in the correct locations
4. Try reloading the extension

### Prompts Not Being Refined

**Problem**: Prompts are sent without refinement

**Solution**:
1. Check that extension is enabled (toggle ON)
2. Verify prompt is longer than 10 characters
3. Check browser console for errors (F12 → Console)
4. Ensure you're on a supported website

### Infinite Loop / Page Freeze

**Problem**: Page becomes unresponsive after pressing Enter

**Solution**:
1. Disable the extension
2. Check `content.js` for the `isProcessing` flag
3. Reload the page
4. Re-enable extension

### Settings Not Saving

**Problem**: Mode changes don't persist

**Solution**:
1. Check chrome.storage permissions in manifest.json
2. Open browser console and check for storage errors
3. Try clearing extension storage: `chrome://extensions/` → PromptEngine → "Clear storage"

## Advanced Testing

### Console Debugging

Open browser console (F12) and monitor for:

```javascript
// Success messages
[PromptEngine] Prompt refined successfully

// Error messages
[PromptEngine] Refinement failed: [error details]
```

### Manual Testing in Console

```javascript
// Test intent detection
window.PromptAnalyzer.detectIntent("write a function to sort array")
// Should return: "coding"

// Test refinement
window.PromptRefiner.refine("explain AI", "general")
// Should return refined prompt

// Test policies
window.PromptPolicies.shouldRefine("hello")
// Should return: false (too short)

window.PromptPolicies.shouldRefine("explain quantum computing in detail")
// Should return: true
```

### Storage Inspection

```javascript
// Check current settings
chrome.storage.local.get(['enabled', 'mode'], (result) => {
  console.log('Settings:', result);
});

// Manually set settings
chrome.storage.local.set({ enabled: true, mode: 'coding' });
```

## Performance Verification

### Expected Performance Metrics

- **Refinement Time**: < 100ms (instant, no API calls)
- **Memory Usage**: < 5MB
- **CPU Usage**: Negligible
- **No Network Calls**: All processing is local

### Monitoring Performance

1. Open Chrome Task Manager: `Shift + Esc`
2. Find "Extension: PromptEngine"
3. Monitor memory and CPU usage
4. Should be minimal (< 5MB RAM, < 1% CPU)

## Known Limitations

1. **Icon Placeholders**: Icons are currently placeholders; replace with actual PNG files
2. **Site-Specific Issues**: Some sites may have custom input handling that interferes
3. **Shift+Enter**: Currently intercepts all Enter presses; Shift+Enter for new lines works
4. **Dynamic Content**: Sites that heavily modify DOM may require page refresh

## Next Steps

### For Development
- Replace placeholder icons with actual designs
- Test on additional LLM platforms
- Customize templates in `engine/templates.js`
- Add custom refinement rules in `engine/policies.js`

### For Production
- Create proper icon assets (16x16, 48x48, 128x128)
- Test extensively on target platforms
- Consider publishing to Chrome Web Store
- Implement analytics (optional)

### For AI Integration
- Follow `AI_INTEGRATION_DESIGN.md`
- Set up OpenAI API or local LLM
- Implement caching system
- Add cost monitoring

## Support

### Debugging Checklist

- [ ] Extension loaded and enabled
- [ ] Developer mode is ON
- [ ] No errors in chrome://extensions/
- [ ] Popup opens and shows controls
- [ ] Settings save correctly
- [ ] Console shows no errors
- [ ] Prompt is longer than 10 characters
- [ ] Not using command syntax (/)

### Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| No refinement | Extension disabled | Check toggle in popup |
| Page freeze | Infinite loop | Reload page, check isProcessing flag |
| Settings reset | Storage error | Check permissions |
| Icon missing | Placeholder files | Create actual PNG icons |

## Success Criteria

✅ Extension loads without errors
✅ Popup UI displays correctly
✅ Settings persist across sessions
✅ Prompts are refined automatically
✅ Short prompts are ignored
✅ Commands (/) are not refined
✅ Toggle ON/OFF works
✅ Mode selection works
✅ No performance issues
✅ Works on multiple LLM sites

---

**Installation Complete!** 🎉

You now have a working, production-quality prompt engineering extension.
