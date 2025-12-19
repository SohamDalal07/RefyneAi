// RefyneAI Popup - Professional Mode

const providerNames = {
    gemini: 'Google Gemini',
    openai: 'OpenAI GPT',
    claude: 'Anthropic Claude'
};

// Load and display settings
chrome.storage.local.get(['enabled', 'mode', 'useAI', 'llmProvider', 'apiKeys'], (result) => {
    console.log('[RefyneAI Popup] Settings loaded:', {
        enabled: result.enabled,
        mode: result.mode,
        useAI: result.useAI,
        provider: result.llmProvider,
        hasApiKeys: !!result.apiKeys
    });

    // Check API key status
    const apiKeyStatus = document.getElementById('apiKeyStatus');
    const apiKeyLink = document.getElementById('apiKeyLink');

    const provider = result.llmProvider || 'gemini';
    const providerName = providerNames[provider] || provider;

    if (result.apiKeys && result.apiKeys[provider]) {
        // API key is set - show provider name
        apiKeyStatus.textContent = providerName;
        apiKeyStatus.style.color = '#30d158';
        apiKeyStatus.style.fontWeight = '500';
    } else {
        // No API key
        apiKeyStatus.textContent = 'Not configured';
        apiKeyStatus.style.color = '#ff3b30';
        apiKeyStatus.style.fontWeight = '500';
    }
});

// Show active status
console.log('[RefyneAI] Popup loaded - Extension active');
