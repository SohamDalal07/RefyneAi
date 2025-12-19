// AI Provider Factory - Multi-Provider Support

class AIProviderFactory {
    static createProvider(providerName, apiKey, model) {
        switch (providerName) {
            case 'gemini':
                return new window.GeminiProvider(apiKey, model);
            case 'openai':
                return new window.OpenAIProvider(apiKey, model);
            case 'claude':
                return new window.ClaudeProvider(apiKey, model);
            default:
                console.error('[AIProviderFactory] Unknown provider:', providerName);
                return null;
        }
    }

    static async getCurrentProvider() {
        return new Promise((resolve) => {
            chrome.storage.local.get(['llmProvider', 'apiKeys', 'selectedModel'], (result) => {
                const provider = result.llmProvider || 'gemini';
                const apiKeys = result.apiKeys || {};
                const selectedModel = result.selectedModel || {};

                const apiKey = apiKeys[provider];
                const model = selectedModel[provider];

                if (!apiKey) {
                    console.warn('[AIProviderFactory] No API key for provider:', provider);
                    resolve(null);
                    return;
                }

                const providerInstance = AIProviderFactory.createProvider(provider, apiKey, model);
                resolve(providerInstance);
            });
        });
    }
}

// Legacy support - keep GeminiProvider for backward compatibility
class AIProvider {
    constructor() {
        this.name = 'base';
    }

    async refinePrompt(prompt, context) {
        throw new Error('Must be implemented by subclass');
    }

    isAvailable() {
        return false;
    }

    validateApiKey(apiKey) {
        return apiKey && apiKey.length > 0;
    }
}

// Export for use in other scripts
window.AIProvider = AIProvider;
window.AIProviderFactory = AIProviderFactory;
