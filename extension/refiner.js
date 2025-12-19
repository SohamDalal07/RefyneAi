window.PromptRefiner = {
    refine(prompt, mode = 'general') {
        if (!prompt || typeof prompt !== 'string') return prompt;

        const trimmed = prompt.trim();
        if (!trimmed) return prompt;

        const shouldRefine = window.PromptPolicies?.shouldRefine(trimmed);
        if (!shouldRefine) return prompt;

        try {
            const refinedPrompt = window.PromptTemplates.applyTemplate(trimmed, mode);
            return refinedPrompt;
        } catch (error) {
            console.error('[RefyneAI] Refinement error:', error);
            return prompt;
        }
    },

    refineWithIntent(prompt) {
        const intent = window.PromptAnalyzer?.detectIntent(prompt) || 'general';
        return this.refine(prompt, intent);
    },

    validateRefinement(original, refined) {
        if (!refined || refined.length === 0) return false;
        if (refined.length > window.PromptPolicies?.getMaxPromptLength()) return false;
        if (!refined.includes(original.trim())) return false;

        return true;
    }
};
