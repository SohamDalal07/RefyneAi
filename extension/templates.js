window.PromptTemplates = {
    applyTemplate(prompt, mode = 'general') {
        const trimmed = prompt.trim();

        // Don't apply template if prompt is already detailed (>50 words)
        if (trimmed.split(/\s+/).length > 50) {
            return prompt;
        }

        // Detect if it's a question
        const isQuestion = /^(what|how|why|when|where|who|can|could|should|would|is|are|do|does|explain|describe|tell)/i.test(trimmed);

        if (isQuestion) {
            // For questions, just add context request
            return `${trimmed}\n\nPlease provide:\n- Clear explanation with examples\n- Practical applications\n- Key concepts and definitions`;
        }

        // For coding mode, add technical context
        if (mode === 'coding') {
            return `${trimmed}\n\nRequirements:\n- Include code examples\n- Explain best practices\n- Show common pitfalls to avoid`;
        }

        // For academic mode, add scholarly context
        if (mode === 'academic') {
            return `${trimmed}\n\nPlease include:\n- Theoretical framework\n- Research-backed insights\n- Critical analysis`;
        }

        // For writing mode, add creative context
        if (mode === 'writing') {
            return `${trimmed}\n\nConsiderations:\n- Target audience and tone\n- Structure and flow\n- Style and voice`;
        }

        // General: Just add basic structure request
        return `${trimmed}\n\nPlease provide a comprehensive response with examples and practical insights.`;
    }
};
