class PromptCache {
    constructor(maxSize = 50) {
        this.cache = new Map();
        this.maxSize = maxSize;
        this.hits = 0;
        this.misses = 0;
    }

    getCacheKey(prompt, mode) {
        const normalized = prompt.toLowerCase().trim().slice(0, 100);
        return `${mode}:${this.simpleHash(normalized)}`;
    }

    simpleHash(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return hash.toString(36);
    }

    get(prompt, mode) {
        const key = this.getCacheKey(prompt, mode);
        const cached = this.cache.get(key);

        if (cached) {
            this.hits++;
            return cached;
        }

        this.misses++;
        return null;
    }

    set(prompt, mode, refinedPrompt) {
        const key = this.getCacheKey(prompt, mode);

        if (this.cache.size >= this.maxSize) {
            const firstKey = this.cache.keys().next().value;
            this.cache.delete(firstKey);
        }

        this.cache.set(key, refinedPrompt);
    }

    clear() {
        this.cache.clear();
        this.hits = 0;
        this.misses = 0;
    }

    getStats() {
        const total = this.hits + this.misses;
        const hitRate = total > 0 ? (this.hits / total * 100).toFixed(1) : 0;

        return {
            size: this.cache.size,
            hits: this.hits,
            misses: this.misses,
            hitRate: `${hitRate}%`
        };
    }
}

window.PromptCache = PromptCache;
