// RefyneAI Configuration
// Add your Gemini API key here

const CONFIG = {
    // Users must provide their own API key
    DEFAULT_GEMINI_API_KEY: '', // No default - users must set their own

    // Cache settings
    CACHE_SIZE: 50,

    // AI refinement thresholds
    MIN_WORDS_FOR_AI: 5,
    COMPLEX_PROMPT_WORDS: 15,

    // Performance
    DEBOUNCE_MS: 50,
    SUBMIT_DELAY_MS: 100,
    PROCESSING_LOCK_MS: 500
};

window.RefyneAIConfig = CONFIG;
