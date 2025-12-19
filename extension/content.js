// Inject scripts into page context
function injectScript(file) {
    const script = document.createElement('script');
    script.src = chrome.runtime.getURL(file);
    script.onload = function () {
        console.log('[RefyneAI] Script loaded:', file);
        this.remove();
    };
    script.onerror = function () {
        console.error('[RefyneAI] Script failed to load:', file);
    };
    (document.head || document.documentElement).appendChild(script);
}

// Scripts to inject
const scripts = [
    'config.js',
    'policies.js',
    'templates.js',
    'analyzer.js',
    'refiner.js',
    'cache.js',
    'providers/base-provider.js',
    'providers/gemini-provider.js',
    'providers/openai-provider.js',
    'providers/claude-provider.js',
    'ai-provider.js',
    'hybrid-refiner.js',
    'page-bridge.js',
    'refine-button.js'
    // ChatGPT auto-refine removed - was causing page crashes
];

scripts.forEach(injectScript);

// Wait for scripts to load, then send settings via postMessage
setTimeout(() => {
    if (typeof chrome !== 'undefined' && chrome.storage) {
        console.log('[RefyneAI Content] Loading settings...');
        chrome.storage.local.get(['enabled', 'mode', 'useAI', 'llmProvider', 'apiKeys', 'selectedModel'], (result) => {
            console.log('[RefyneAI Content] Settings loaded:', result);

            const provider = result.llmProvider || 'gemini';
            const apiKeys = result.apiKeys || {};

            const settings = {
                enabled: result.enabled ?? true,
                mode: result.mode ?? 'auto',
                useAI: result.useAI ?? true,
                llmProvider: provider,
                geminiApiKey: apiKeys.gemini || '', // Legacy support
                apiKeys: apiKeys,
                selectedModel: result.selectedModel || {}
            };

            console.log('[RefyneAI Content] Sending settings via postMessage:', settings);

            // Send settings to page context via postMessage
            window.postMessage({
                type: 'REFYNE_AI_SETTINGS',
                settings: settings
            }, '*');
        });
    } else {
        console.error('[RefyneAI Content] Chrome storage API not available');
    }
}, 500); // Wait 500ms for scripts to load

// Listen for settings changes
if (typeof chrome !== 'undefined' && chrome.storage) {
    chrome.storage.onChanged.addListener((changes) => {
        const updates = {};
        if (changes.enabled) updates.enabled = changes.enabled.newValue;
        if (changes.mode) updates.mode = changes.mode.newValue;
        if (changes.useAI) updates.useAI = changes.useAI.newValue;
        if (changes.geminiApiKey) updates.geminiApiKey = changes.geminiApiKey.newValue;

        console.log('[RefyneAI Content] Settings changed, sending update:', updates);

        // Send updated settings to page context
        window.postMessage({
            type: 'REFYNE_AI_SETTINGS_UPDATE',
            updates: updates
        }, '*');
    });
}

// Main content script logic
let isProcessing = false;

function findInputElement(element) {
    if (!element) return null;
    if (element.tagName === 'TEXTAREA') return element;
    if (element.isContentEditable) return element;

    const textarea = element.querySelector('textarea');
    if (textarea) return textarea;

    const contentEditable = element.querySelector('[contenteditable="true"]');
    if (contentEditable) return contentEditable;

    return null;
}

function getPromptText(element) {
    if (element.tagName === 'TEXTAREA') {
        return element.value;
    }
    if (element.isContentEditable) {
        return element.innerText || element.textContent;
    }
    return '';
}

function setPromptText(element, text) {
    if (element.tagName === 'TEXTAREA') {
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
            window.HTMLTextAreaElement.prototype,
            'value'
        ).set;
        nativeInputValueSetter.call(element, text);

        element.dispatchEvent(new Event('input', { bubbles: true }));
        element.dispatchEvent(new Event('change', { bubbles: true }));
    } else if (element.isContentEditable) {
        element.innerText = text;

        element.dispatchEvent(new Event('input', { bubbles: true }));
        element.dispatchEvent(new Event('change', { bubbles: true }));
    }
}

function findSubmitButton(inputElement) {
    let parent = inputElement.parentElement;
    let depth = 0;

    while (parent && depth < 5) {
        const button = parent.querySelector('button[type="submit"]') ||
            parent.querySelector('button[data-testid*="send"]') ||
            parent.querySelector('button[aria-label*="send" i]') ||
            parent.querySelector('button svg') ||
            parent.querySelector('button');

        if (button && !button.disabled) return button;

        parent = parent.parentElement;
        depth++;
    }

    return null;
}

async function handlePromptSubmission(event, inputElement) {
    if (isProcessing) return;

    const originalPrompt = getPromptText(inputElement).trim();

    if (!originalPrompt) return;
    if (originalPrompt.length < 10) return;
    if (originalPrompt.startsWith('/')) return;

    isProcessing = true;

    try {
        // Auto-detect intent - no user mode selection needed
        const detectedIntent = window.PromptAnalyzer?.detectIntent(originalPrompt) || 'general';
        console.log('[RefyneAI] Auto-detected intent:', detectedIntent);
        // Call refinement in page context with auto-detected intent
        const refinedPrompt = await new Promise((resolve) => {
            const messageId = 'refine_' + Date.now();

            window.addEventListener('message', function handler(e) {
                if (e.data.type === 'REFYNE_AI_RESPONSE' && e.data.id === messageId) {
                    window.removeEventListener('message', handler);
                    resolve(e.data.refined);
                }
            });

            window.postMessage({
                type: 'REFYNE_AI_REFINE',
                id: messageId,
                prompt: originalPrompt,
                mode: detectedIntent  // Use auto-detected intent
            }, '*');

            // Timeout after 5 seconds
            setTimeout(() => resolve(originalPrompt), 5000);
        });

        if (refinedPrompt && refinedPrompt !== originalPrompt) {
            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation();

            await new Promise(resolve => setTimeout(resolve, 50));

            setPromptText(inputElement, refinedPrompt);

            await new Promise(resolve => setTimeout(resolve, 100));

            const submitButton = findSubmitButton(inputElement);
            if (submitButton) {
                submitButton.click();
            } else {
                const enterEvent = new KeyboardEvent('keydown', {
                    key: 'Enter',
                    code: 'Enter',
                    keyCode: 13,
                    which: 13,
                    bubbles: true,
                    cancelable: true
                });
                inputElement.dispatchEvent(enterEvent);
            }
        }
    } catch (error) {
        console.error('[RefyneAI] Refinement failed:', error);
    } finally {
        setTimeout(() => { isProcessing = false; }, 500);
    }
}

function attachListeners(inputElement) {
    if (inputElement.dataset.refyneaiAttached) return;
    inputElement.dataset.refyneaiAttached = 'true';

    inputElement.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            handlePromptSubmission(event, inputElement);
        }
    }, { capture: true });

    const submitButton = findSubmitButton(inputElement);
    if (submitButton && !submitButton.dataset.refyneaiAttached) {
        submitButton.dataset.refyneaiAttached = 'true';
        submitButton.addEventListener('click', (event) => {
            handlePromptSubmission(event, inputElement);
        }, { capture: true });
    }
}

function observeDOM() {
    const observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
            for (const node of mutation.addedNodes) {
                if (node.nodeType === 1) {
                    const inputElement = findInputElement(node);
                    if (inputElement) {
                        attachListeners(inputElement);
                    }

                    const textareas = node.querySelectorAll?.('textarea') || [];
                    const editables = node.querySelectorAll?.('[contenteditable="true"]') || [];

                    [...textareas, ...editables].forEach(attachListeners);
                }
            }
        }
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
}

function initialize() {
    const textareas = document.querySelectorAll('textarea');
    const editables = document.querySelectorAll('[contenteditable="true"]');

    [...textareas, ...editables].forEach(attachListeners);

    observeDOM();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
} else {
    initialize();
}
