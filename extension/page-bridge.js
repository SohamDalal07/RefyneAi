// Initialize settings from content script
window.addEventListener('message', function (event) {
    if (event.data.type === 'REFYNE_AI_SETTINGS') {
        console.log('[RefyneAI Page] Received settings:', event.data.settings);
        window.RefyneAISettings = event.data.settings;

        // Initialize HybridRefiner with settings
        if (window.HybridRefiner) {
            console.log('[RefyneAI Page] Initializing HybridRefiner with useAI:', event.data.settings.useAI);
            window.HybridRefiner.useAI = event.data.settings.useAI;
            if (window.HybridRefiner.initialize) {
                window.HybridRefiner.initialize().then(() => {
                    console.log('[RefyneAI Page] HybridRefiner initialized successfully');
                    console.log('[RefyneAI Page] useAI:', window.HybridRefiner.useAI);
                    console.log('[RefyneAI Page] aiProvider:', window.HybridRefiner.aiProvider);
                });
            }
        } else {
            console.error('[RefyneAI Page] HybridRefiner not found!');
        }
    }

    if (event.data.type === 'REFYNE_AI_SETTINGS_UPDATE') {
        console.log('[RefyneAI Page] Settings updated:', event.data.updates);
        if (window.RefyneAISettings) {
            Object.assign(window.RefyneAISettings, event.data.updates);
        }
        if (window.HybridRefiner && event.data.updates.useAI !== undefined) {
            window.HybridRefiner.useAI = event.data.updates.useAI;
            if (window.HybridRefiner.initialize) {
                window.HybridRefiner.initialize();
            }
        }
    }
});

// Listen for refinement requests from content script
window.addEventListener('message', async function (event) {
    if (event.data.type === 'REFYNE_AI_REFINE') {
        const { id, prompt, mode } = event.data;

        try {
            let refined = prompt;

            if (window.HybridRefiner) {
                refined = await window.HybridRefiner.refine(prompt, mode);
            } else if (window.PromptRefiner) {
                refined = window.PromptRefiner.refine(prompt, mode);
            }

            window.postMessage({
                type: 'REFYNE_AI_RESPONSE',
                id: id,
                refined: refined
            }, '*');
        } catch (error) {
            console.error('[RefyneAI] Refinement error:', error);
            window.postMessage({
                type: 'REFYNE_AI_RESPONSE',
                id: id,
                refined: prompt
            }, '*');
        }
    }
});
