// OpenAI Provider
(function () {
    let retryCount = 0;
    const maxRetries = 10;

    function tryDefine() {
        if (typeof window.BaseProvider !== 'undefined') {
            defineOpenAIProvider();
            return;
        }

        retryCount++;
        if (retryCount <= maxRetries) {
            console.log(`[OpenAI Provider] Waiting for BaseProvider... (attempt ${retryCount}/${maxRetries})`);
            setTimeout(tryDefine, 200);
        } else {
            console.error('[OpenAI Provider] BaseProvider not available after', maxRetries, 'retries');
        }
    }

    tryDefine();
})();

function defineOpenAIProvider() {
    class OpenAIProvider extends window.BaseProvider {
        constructor(apiKey, model = 'gpt-4') {
            super(apiKey, model);
            this.name = 'openai';
            this.endpoint = 'https://api.openai.com/v1/chat/completions';
        }

        async refinePrompt(prompt, context = {}) {
            if (!this.validateApiKey(this.apiKey)) {
                throw new Error('Invalid API key');
            }

            const mode = context.mode || 'general';
            const metaPrompt = this.buildMetaPrompt(prompt, mode);

            try {
                const response = await fetch(this.endpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${this.apiKey}`
                    },
                    body: JSON.stringify({
                        model: this.model,
                        messages: [{
                            role: 'user',
                            content: metaPrompt
                        }],
                        temperature: 0.3,
                        max_tokens: 2048
                    })
                });

                if (!response.ok) {
                    throw new Error(`API request failed: ${response.status}`);
                }

                const data = await response.json();

                if (data.choices && data.choices[0] && data.choices[0].message) {
                    return data.choices[0].message.content.trim();
                }

                throw new Error('Invalid response format');
            } catch (error) {
                console.error('[OpenAI Provider] Error:', error);
                throw error;
            }
        }

        validateApiKey(apiKey) {
            return apiKey && typeof apiKey === 'string' && apiKey.startsWith('sk-');
        }

        getAvailableModels() {
            return ['gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo'];
        }
    }

    window.OpenAIProvider = OpenAIProvider;
    console.log('[OpenAI Provider] Loaded successfully');
}
