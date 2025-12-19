// RefyneAI Setup Script - Multi-Provider Support

const form = document.getElementById('apiKeyForm');
const providerSelect = document.getElementById('provider');
const apiKeyInput = document.getElementById('apiKey');
const modelSelect = document.getElementById('model');
const modelGroup = document.getElementById('modelGroup');
const submitBtn = document.getElementById('submitBtn');
const errorDiv = document.getElementById('error');
const setupForm = document.getElementById('setupForm');
const successDiv = document.getElementById('success');

// Provider configurations
const providers = {
    gemini: {
        name: 'Google Gemini',
        keyPrefix: 'AIzaSy',
        placeholder: 'AIzaSy...',
        models: ['gemini-2.5-flash', 'gemini-1.5-flash', 'gemini-1.5-pro'],
        link: 'geminiLink',
        testEndpoint: (key, model) => ({
            url: `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
            options: {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-goog-api-key': key
                },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: 'test' }] }]
                })
            }
        })
    },
    openai: {
        name: 'OpenAI GPT',
        keyPrefix: 'sk-',
        placeholder: 'sk-...',
        models: ['gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo'],
        link: 'openaiLink',
        testEndpoint: (key, model) => ({
            url: 'https://api.openai.com/v1/chat/completions',
            options: {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${key}`
                },
                body: JSON.stringify({
                    model: model,
                    messages: [{ role: 'user', content: 'test' }],
                    max_tokens: 5
                })
            }
        })
    },
    claude: {
        name: 'Anthropic Claude',
        keyPrefix: 'sk-ant-',
        placeholder: 'sk-ant-...',
        models: ['claude-3-opus-20240229', 'claude-3-sonnet-20240229', 'claude-3-haiku-20240307'],
        link: 'claudeLink',
        testEndpoint: (key, model) => ({
            url: 'https://api.anthropic.com/v1/messages',
            options: {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': key,
                    'anthropic-version': '2023-06-01'
                },
                body: JSON.stringify({
                    model: model,
                    messages: [{ role: 'user', content: 'test' }],
                    max_tokens: 5
                })
            }
        })
    }
};

// Load existing configuration
chrome.storage.local.get(['llmProvider', 'apiKeys', 'selectedModel'], (result) => {
    if (result.llmProvider) {
        providerSelect.value = result.llmProvider;
        updateProviderUI(result.llmProvider);

        if (result.apiKeys && result.apiKeys[result.llmProvider]) {
            apiKeyInput.value = result.apiKeys[result.llmProvider];
        }

        if (result.selectedModel && result.selectedModel[result.llmProvider]) {
            modelSelect.value = result.selectedModel[result.llmProvider];
        }
    }
});

// Provider selection change
providerSelect.addEventListener('change', (e) => {
    updateProviderUI(e.target.value);
});

function updateProviderUI(provider) {
    const config = providers[provider];

    // Update placeholder
    apiKeyInput.placeholder = config.placeholder;

    // Update help links
    document.querySelectorAll('.provider-links a').forEach(link => {
        link.style.display = 'none';
    });
    document.getElementById(config.link).style.display = 'block';

    // Update models
    modelSelect.innerHTML = '<option value="">Default</option>';
    config.models.forEach(model => {
        const option = document.createElement('option');
        option.value = model;
        option.textContent = model;
        modelSelect.appendChild(option);
    });

    modelGroup.style.display = 'block';
}

// Form submission
form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const provider = providerSelect.value;
    const apiKey = apiKeyInput.value.trim();
    const model = modelSelect.value || providers[provider].models[0];

    if (!apiKey) {
        showError('Please enter an API key');
        return;
    }

    if (!apiKey.startsWith(providers[provider].keyPrefix)) {
        showError(`Invalid API key format. ${providers[provider].name} keys start with "${providers[provider].keyPrefix}"`);
        return;
    }

    // Disable button
    submitBtn.disabled = true;
    submitBtn.textContent = 'Verifying...';

    // Test API key
    const result = await testApiKey(provider, apiKey, model);

    if (result.success) {
        // Save configuration
        chrome.storage.local.get(['apiKeys', 'selectedModel'], (existing) => {
            const apiKeys = existing.apiKeys || {};
            const selectedModel = existing.selectedModel || {};

            apiKeys[provider] = apiKey;
            selectedModel[provider] = model;

            chrome.storage.local.set({
                llmProvider: provider,
                apiKeys: apiKeys,
                selectedModel: selectedModel
            }, () => {
                document.getElementById('selectedProvider').textContent = providers[provider].name;
                showSuccess();
            });
        });
    } else {
        showError(result.error || 'API key verification failed. Please check your key and try again.');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Verify & Save';
    }
});

async function testApiKey(provider, apiKey, model) {
    try {
        console.log(`[RefyneAI Setup] Testing ${provider} API key...`);

        const config = providers[provider].testEndpoint(apiKey, model);
        const response = await fetch(config.url, config.options);

        console.log(`[RefyneAI Setup] Response status: ${response.status}`);

        if (response.ok) {
            console.log('[RefyneAI Setup] API key valid!');
            return { success: true };
        } else {
            const errorText = await response.text();
            console.error('[RefyneAI Setup] API error:', response.status, errorText);

            if (response.status === 400 || response.status === 401) {
                return { success: false, error: 'Invalid API key' };
            } else if (response.status === 403) {
                return { success: false, error: 'API key does not have permission' };
            } else if (response.status === 404) {
                return { success: false, error: 'API endpoint not found' };
            } else if (response.status === 429) {
                return { success: false, error: 'Rate limit exceeded. Please try again later.' };
            } else {
                return { success: false, error: `API returned error: ${response.status}` };
            }
        }
    } catch (error) {
        console.error('[RefyneAI Setup] Network error:', error);
        return {
            success: false,
            error: 'Network error. Please check your internet connection and try again.'
        };
    }
}

function showError(message) {
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';

    setTimeout(() => {
        errorDiv.style.display = 'none';
    }, 8000);
}

function showSuccess() {
    setupForm.style.display = 'none';
    successDiv.style.display = 'block';
}

// Close tab button handler
document.getElementById('closeBtn').addEventListener('click', () => {
    chrome.tabs.getCurrent((tab) => {
        chrome.tabs.remove(tab.id);
    });
});

// Initialize UI
updateProviderUI(providerSelect.value);
