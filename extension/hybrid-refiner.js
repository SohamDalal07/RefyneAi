window.HybridRefiner = {
    cache: null,
    aiProvider: null,
    useAI: false,
    defaultApiKey: '',

    async initialize() {
        this.cache = new window.PromptCache(window.RefyneAIConfig?.CACHE_SIZE || 50);
        this.defaultApiKey = window.RefyneAIConfig?.DEFAULT_GEMINI_API_KEY || '';

        const settings = window.RefyneAISettings || {};
        this.useAI = settings.useAI || false;
        const apiKey = settings.geminiApiKey || this.defaultApiKey;

        if (apiKey) {
            this.aiProvider = new window.GeminiProvider(apiKey);
        }
    },

    async getSettings() {
        return window.RefyneAISettings || { useAI: false, geminiApiKey: '' };
    },

    shouldUseAI(prompt) {
        console.log('[RefyneAI Debug] useAI:', this.useAI);
        console.log('[RefyneAI Debug] aiProvider:', this.aiProvider);
        console.log('[RefyneAI Debug] isAvailable:', this.aiProvider?.isAvailable());

        if (!this.useAI || !this.aiProvider || !this.aiProvider.isAvailable()) {
            console.log('[RefyneAI Debug] AI not available - useAI:', this.useAI, 'provider:', !!this.aiProvider);
            return false;
        }

        const wordCount = prompt.trim().split(/\s+/).length;
        console.log('[RefyneAI Debug] Word count:', wordCount);

        if (wordCount < 5) return false;
        if (wordCount > 100) return true;

        const complexityIndicators = [
            /\b(complex|detailed|comprehensive|in-depth|thorough)\b/i,
            /\b(analyze|evaluate|compare|contrast|discuss)\b/i,
            /\b(multiple|several|various|different)\b/i,
            /\b(guide|tutorial|explanation|implementation)\b/i,
            /\b(create|build|develop|design|implement)\b/i,
            /\b(explain|describe|elaborate|clarify)\b/i,
            /\b(importance|significance|impact|affect|effect)\b/i,
            /\b(capability|ability|skill|learning|understanding)\b/i
        ];

        const hasComplexity = complexityIndicators.some(pattern => pattern.test(prompt));
        console.log('[RefyneAI Debug] Has complexity:', hasComplexity);

        // Use AI if complexity indicators found and prompt has at least 8 words
        const shouldUse = hasComplexity && wordCount >= 8;
        console.log('[RefyneAI Debug] Should use AI:', shouldUse);
        return shouldUse;
    },

    async refine(prompt, mode = 'general') {
        // Lazy initialization if not already initialized
        if (!this.cache) {
            await this.initialize();
        }

        if (!prompt || typeof prompt !== 'string') return prompt;

        const trimmed = prompt.trim();
        if (!trimmed) return prompt;

        const shouldRefine = window.PromptPolicies?.shouldRefine(trimmed);
        if (!shouldRefine) return prompt;

        const cached = this.cache.get(trimmed, mode);
        if (cached) {
            console.log('[RefyneAI] Cache hit');
            return cached;
        }

        if (this.shouldUseAI(trimmed)) {
            try {
                console.log('[RefyneAI] Using AI refinement');
                const refined = await this.aiProvider.refinePrompt(trimmed, { mode });

                if (refined && refined.length > 0) {
                    this.cache.set(trimmed, mode, refined);
                    return refined;
                }
            } catch (error) {
                console.warn('[RefyneAI] AI refinement failed, falling back to rules:', error);
            }
        }

        console.log('[RefyneAI] Using rule-based refinement');
        const refined = window.PromptTemplates.applyTemplate(trimmed, mode);
        this.cache.set(trimmed, mode, refined);
        return refined;
    },

    async refineWithIntent(prompt) {
        const intent = window.PromptAnalyzer?.detectIntent(prompt) || 'general';
        return this.refine(prompt, intent);
    },

    getCacheStats() {
        return this.cache.getStats();
    },

    clearCache() {
        this.cache.clear();
    }
};

if (typeof chrome !== 'undefined' && chrome.storage) {
    window.HybridRefiner.initialize();
}
