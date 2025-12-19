window.PromptAnalyzer = {
    detectIntent(prompt) {
        const lowerPrompt = prompt.toLowerCase();

        const codingKeywords = [
            'code', 'function', 'class', 'debug', 'error', 'bug', 'implement',
            'algorithm', 'programming', 'syntax', 'compile', 'runtime',
            'javascript', 'python', 'java', 'c++', 'typescript', 'react',
            'api', 'database', 'sql', 'git', 'repository', 'refactor'
        ];

        const academicKeywords = [
            'research', 'study', 'analyze', 'theory', 'hypothesis', 'thesis',
            'academic', 'scholarly', 'paper', 'journal', 'citation', 'reference',
            'methodology', 'literature review', 'experiment', 'data analysis',
            'statistical', 'scientific', 'peer review', 'abstract'
        ];

        const writingKeywords = [
            'write', 'essay', 'article', 'blog', 'story', 'content',
            'draft', 'edit', 'proofread', 'rewrite', 'summarize',
            'paragraph', 'introduction', 'conclusion', 'narrative',
            'creative writing', 'copywriting', 'email', 'letter'
        ];

        let codingScore = 0;
        let academicScore = 0;
        let writingScore = 0;

        codingKeywords.forEach(keyword => {
            if (lowerPrompt.includes(keyword)) codingScore++;
        });

        academicKeywords.forEach(keyword => {
            if (lowerPrompt.includes(keyword)) academicScore++;
        });

        writingKeywords.forEach(keyword => {
            if (lowerPrompt.includes(keyword)) writingScore++;
        });

        if (/```[\s\S]*```/.test(prompt)) codingScore += 3;
        if (/`[^`]+`/.test(prompt)) codingScore += 1;

        // Only add academic score for question words if there are other academic indicators
        if (/\b(explain|how|why|what|when|where)\b/i.test(prompt) && academicScore > 0) {
            academicScore += 1;
        }

        const maxScore = Math.max(codingScore, academicScore, writingScore);

        // Require at least score of 1 to avoid defaulting on weak signals
        if (maxScore === 0) return 'general';
        if (codingScore === maxScore && codingScore > 0) return 'coding';
        if (academicScore === maxScore && academicScore > 1) return 'academic';
        if (writingScore === maxScore && writingScore > 0) return 'writing';

        return 'general';
    },

    extractKeyEntities(prompt) {
        const entities = {
            technologies: [],
            topics: [],
            actions: []
        };

        const techPattern = /\b(javascript|python|react|node|sql|api|html|css)\b/gi;
        const matches = prompt.match(techPattern);
        if (matches) {
            entities.technologies = [...new Set(matches.map(m => m.toLowerCase()))];
        }

        const actionPattern = /\b(create|build|write|analyze|explain|debug|fix|implement|design)\b/gi;
        const actionMatches = prompt.match(actionPattern);
        if (actionMatches) {
            entities.actions = [...new Set(actionMatches.map(m => m.toLowerCase()))];
        }

        return entities;
    }
};
