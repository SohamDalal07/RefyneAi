window.PromptTemplates = {
    coding: {
        prefix: "You are an expert software engineer. ",
        structure: (prompt) => {
            return `You are an expert software engineer.

Task: ${prompt}

Requirements:
- Provide clean, production-ready code
- Include error handling where appropriate
- Add brief comments for complex logic
- Follow best practices and design patterns

Output format: Provide the code first, then a brief explanation if needed.`;
        }
    },

    academic: {
        prefix: "You are a knowledgeable academic researcher. ",
        structure: (prompt) => {
            return `You are a knowledgeable academic researcher with expertise in multiple disciplines.

Query: ${prompt}

Requirements:
- Provide accurate, well-researched information
- Include relevant context and background
- Cite key concepts or frameworks when applicable
- Structure the response logically

Output format: Provide a clear, structured response with proper explanations.`;
        }
    },

    writing: {
        prefix: "You are a skilled professional writer and editor. ",
        structure: (prompt) => {
            return `You are a skilled professional writer and editor.

Task: ${prompt}

Requirements:
- Maintain appropriate tone and style
- Ensure clarity and coherence
- Use proper grammar and structure
- Make the content engaging and readable

Output format: Provide the written content with proper formatting.`;
        }
    },

    general: {
        prefix: "You are a helpful and knowledgeable assistant. ",
        structure: (prompt) => {
            return `You are a helpful and knowledgeable assistant.

Request: ${prompt}

Requirements:
- Provide accurate and relevant information
- Be clear and concise
- Structure the response logically
- Address all aspects of the request

Output format: Provide a well-structured, comprehensive response.`;
        }
    },

    getTemplate(mode) {
        return this[mode] || this.general;
    },

    applyTemplate(prompt, mode) {
        const template = this.getTemplate(mode);
        return template.structure(prompt);
    }
};
