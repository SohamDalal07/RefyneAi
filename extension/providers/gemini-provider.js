// Gemini Provider
(function () {
    let retryCount = 0;
    const maxRetries = 10;

    function tryDefine() {
        if (typeof window.BaseProvider !== 'undefined') {
            defineGeminiProvider();
            return;
        }

        retryCount++;
        if (retryCount <= maxRetries) {
            console.log(`[Gemini Provider] Waiting for BaseProvider... (attempt ${retryCount}/${maxRetries})`);
            setTimeout(tryDefine, 200);
        } else {
            console.error('[Gemini Provider] BaseProvider not available after', maxRetries, 'retries');
        }
    }

    tryDefine();
})();

function defineGeminiProvider() {
    class GeminiProvider extends window.BaseProvider {
        constructor(apiKey, model = 'gemini-2.5-flash') {
            super(apiKey, model);
            this.name = 'gemini';
            this.endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
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
                        'x-goog-api-key': this.apiKey
                    },
                    body: JSON.stringify({
                        contents: [{
                            parts: [{ text: metaPrompt }]
                        }],
                        generationConfig: {
                            temperature: 0.3,
                            maxOutputTokens: 2048,
                            topP: 0.8,
                            topK: 10
                        }
                    })
                });

                if (!response.ok) {
                    throw new Error(`API request failed: ${response.status}`);
                }

                const data = await response.json();

                if (data.candidates && data.candidates[0] && data.candidates[0].content) {
                    return data.candidates[0].content.parts[0].text.trim();
                }

                throw new Error('Invalid response format');
            } catch (error) {
                console.error('[Gemini Provider] Error:', error);
                throw error;
            }
        }

        validateApiKey(apiKey) {
            return apiKey && typeof apiKey === 'string' && apiKey.startsWith('AIzaSy');
        }

        getAvailableModels() {
            return ['gemini-2.5-flash', 'gemini-1.5-flash', 'gemini-1.5-pro'];
        }
    }

    window.GeminiProvider = GeminiProvider;
    console.log('[Gemini Provider] Loaded successfully');
}
