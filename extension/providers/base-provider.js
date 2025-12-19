// Base Provider Class
class BaseProvider {
    constructor(apiKey, model) {
        this.name = 'base';
        this.apiKey = apiKey;
        this.model = model;
    }

    async refinePrompt(prompt, context) {
        throw new Error('Must be implemented by subclass');
    }

    validateApiKey(apiKey) {
        return apiKey && apiKey.length > 0;
    }

    getAvailableModels() {
        return [];
    }

    isAvailable() {
        return this.validateApiKey(this.apiKey);
    }

    buildMetaPrompt(prompt, mode) {
        const modeInstructions = {
            coding: 'Transform this into a detailed technical specification with role context, specific requirements, code quality expectations, and output format.',
            academic: 'Elevate this to scholarly standards with research context, analytical framework, citation requirements, and structured argumentation.',
            writing: 'Enhance this with creative direction, tone specification, audience consideration, style guidelines, and structural framework.',
            general: 'Transform this into a comprehensive, well-structured request with clear context, specific requirements, and desired output format.'
        };

        return `You are an expert prompt engineer. Transform this basic prompt into ONE sophisticated, detailed prompt.

Original: "${prompt}"

Context: ${mode} domain. ${modeInstructions[mode] || modeInstructions.general}

Requirements:
1. Add expert role/persona (e.g., "As a senior software architect...")
2. Break into numbered sections or requirements
3. Specify output format (step-by-step, bullet points, code examples, etc.)
4. Add constraints (e.g., "Focus on practical applications")
5. Make it 3-5x more detailed while staying focused
6. Use professional, clear language
7. Preserve original intent

CRITICAL: Return ONLY the refined prompt. No explanations, no prefix like "Here's the refined prompt:", just the prompt itself.

Refined prompt:`;
    }
}

window.BaseProvider = BaseProvider;
console.log('[BaseProvider] Loaded successfully');
