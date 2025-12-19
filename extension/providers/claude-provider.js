// Anthropic Claude Provider
(function () {
    let retryCount = 0;
    const maxRetries = 10;

    function tryDefine() {
        if (typeof window.BaseProvider !== 'undefined') {
            defineClaudeProvider();
            return;
        }

        retryCount++;
        if (retryCount <= maxRetries) {
            console.log(`[Claude Provider] Waiting for BaseProvider... (attempt ${retryCount}/${maxRetries})`);
            setTimeout(tryDefine, 200);
        } else {
            console.error('[Claude Provider] BaseProvider not available after', maxRetries, 'retries');
        }
    }

    tryDefine();
})();

function defineClaudeProvider() {
    class ClaudeProvider extends window.BaseProvider {
        constructor(apiKey, model = 'claude-3-sonnet-20240229') {
            super(apiKey, model);
            this.name = 'claude';
            this.endpoint = 'https://api.anthropic.com/v1/messages';
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
                        'x-api-key': this.apiKey,
                        'anthropic-version': '2023-06-01'
                    },
                    body: JSON.stringify({
                        model: this.model,
                        messages: [{
                            role: 'user',
                            content: metaPrompt
                        }],
                        max_tokens: 2048,
                        temperature: 0.3
                    })
                });

                if (!response.ok) {
                    throw new Error(`API request failed: ${response.status}`);
                }

                const data = await response.json();

                if (data.content && data.content[0] && data.content[0].text) {
                    return data.content[0].text.trim();
                }

                throw new Error('Invalid response format');
            } catch (error) {
                console.error('[Claude Provider] Error:', error);
                throw error;
            }
        }

        validateApiKey(apiKey) {
            return apiKey && typeof apiKey === 'string' && apiKey.startsWith('sk-ant-');
        }

        getAvailableModels() {
            return [
                'claude-3-opus-20240229',
                'claude-3-sonnet-20240229',
                'claude-3-haiku-20240307'
            ];
        }
    }

    window.ClaudeProvider = ClaudeProvider;
    console.log('[Claude Provider] Loaded successfully');
}
