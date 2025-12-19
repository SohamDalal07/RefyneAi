window.PromptPolicies = {
    shouldRefine(prompt) {
        if (!prompt || typeof prompt !== 'string') return false;

        const trimmed = prompt.trim();

        if (trimmed.length < 10) return false;

        if (trimmed.startsWith('/')) return false;

        if (trimmed.startsWith('!')) return false;

        const codeBlockPattern = /^```[\s\S]*```$/;
        if (codeBlockPattern.test(trimmed)) return false;

        const urlPattern = /^https?:\/\//i;
        if (urlPattern.test(trimmed)) return false;

        const singleWordPattern = /^\w+$/;
        if (singleWordPattern.test(trimmed)) return false;

        const alreadyRefinedPatterns = [
            /^(you are|act as|your role is)/i,
            /^(task:|objective:|goal:)/i,
            /^(context:|background:|scenario:)/i,
            /(output format|response format|format the response)/i,
            /(step by step|step-by-step)/i
        ];

        for (const pattern of alreadyRefinedPatterns) {
            if (pattern.test(trimmed)) return false;
        }

        return true;
    },

    getMaxPromptLength() {
        return 4000;
    },

    getMinPromptLength() {
        return 10;
    }
};
