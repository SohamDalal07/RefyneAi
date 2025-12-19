// RefyneAI - Zero Config Mode
// Extension is always enabled, no user configuration needed

chrome.runtime.onInstalled.addListener((details) => {
  // Get existing settings first
  chrome.storage.local.get(['enabled', 'mode', 'useAI', 'geminiApiKey', 'llmProvider', 'apiKeys'], (existing) => {

    // Migration: Convert old geminiApiKey to new schema
    if (existing.geminiApiKey && !existing.llmProvider) {
      console.log('[RefyneAI] Migrating from old schema to multi-provider schema');
      chrome.storage.local.set({
        enabled: true,
        mode: 'auto',
        useAI: true,
        llmProvider: 'gemini',
        apiKeys: { gemini: existing.geminiApiKey },
        selectedModel: { gemini: 'gemini-2.5-flash' }
      });
    } else {
      // Only set defaults for missing values, preserve existing configuration
      chrome.storage.local.set({
        enabled: existing.enabled !== undefined ? existing.enabled : true,
        mode: existing.mode || 'auto',
        useAI: existing.useAI !== undefined ? existing.useAI : true,
        llmProvider: existing.llmProvider || 'gemini',
        apiKeys: existing.apiKeys || {},
        selectedModel: existing.selectedModel || {}
      });
    }

    // Open setup page only on first install and if no API keys exist
    if (details.reason === 'install') {
      if (!existing.llmProvider && (!existing.apiKeys || Object.keys(existing.apiKeys).length === 0)) {
        chrome.tabs.create({ url: 'setup.html' });
      }
    }

    console.log('[RefyneAI] Installed - Multi-provider mode active');
  });
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getSettings') {
    // Always return enabled state
    chrome.storage.local.get(['enabled', 'mode'], sendResponse);
    return true;
  }
});
