// RefyneAI On-Demand Refinement Button

class RefineButton {
    constructor() {
        this.injected = new WeakSet();
    }

    // Find the action bar (where upload button, etc. are)
    findActionBar(inputElement) {
        let parent = inputElement.parentElement;
        let depth = 0;

        while (parent && depth < 5) {
            const buttons = parent.querySelectorAll('button');
            if (buttons.length > 0) {
                const buttonContainer = buttons[0].parentElement;
                if (buttonContainer) {
                    return buttonContainer;
                }
            }
            parent = parent.parentElement;
            depth++;
        }

        // Fallback: Create container below input
        const container = document.createElement('div');
        container.style.cssText = 'display: flex; gap: 8px; margin-top: 8px; align-items: center;';
        inputElement.parentElement.appendChild(container);
        return container;
    }

    // Find the actual input element that contains text
    findTextInput(startElement) {
        // If it's already the right element
        if (startElement.isContentEditable || startElement.tagName === 'TEXTAREA') {
            return startElement;
        }

        // Look for contenteditable in children
        const editable = startElement.querySelector('[contenteditable="true"]');
        if (editable) return editable;

        // Look for textarea in children
        const textarea = startElement.querySelector('textarea');
        if (textarea) return textarea;

        return startElement;
    }

    // Create refinement button
    createButton() {
        const button = document.createElement('button');
        button.className = 'refyne-ai-button';
        button.type = 'button';
        button.setAttribute('data-tooltip', 'Refine with AI');

        // Create R with subscript AI
        const brandText = document.createElement('span');
        brandText.className = 'refyne-ai-brand';

        const rLetter = document.createElement('span');
        rLetter.className = 'brand-r';
        rLetter.textContent = 'R';

        const aiText = document.createElement('span');
        aiText.className = 'brand-ai';
        aiText.textContent = 'AI';

        brandText.appendChild(rLetter);
        brandText.appendChild(aiText);

        const text = document.createElement('span');
        text.className = 'refyne-ai-text';
        text.textContent = 'Refine';

        button.appendChild(brandText);
        button.appendChild(text);

        return button;
    }

    // Inject button next to input field
    inject(inputElement) {
        const actionBar = this.findActionBar(inputElement);
        if (!actionBar) return;

        // Check if button already exists in the action bar
        const existingButton = actionBar.querySelector('.refyne-ai-button');
        if (existingButton) {
            // Button exists, mark as injected and return
            this.injected.add(inputElement);
            return;
        }

        // Button doesn't exist, inject it
        const button = this.createButton();
        actionBar.insertBefore(button, actionBar.firstChild);

        button.addEventListener('click', async (e) => {
            e.preventDefault();
            e.stopPropagation();
            await this.handleRefine(inputElement, button);
        });

        this.injected.add(inputElement);
        console.log('[RefyneAI] Refine button injected');
    }

    // Get prompt text
    getPromptText(element) {
        console.log('[RefyneAI Button] getPromptText called');
        console.log('[RefyneAI Button] Element:', element);
        console.log('[RefyneAI Button] Tag:', element?.tagName);
        console.log('[RefyneAI Button] isContentEditable:', element?.isContentEditable);

        let text = '';

        if (element.tagName === 'TEXTAREA') {
            text = element.value;
            console.log('[RefyneAI Button] Got text from TEXTAREA:', text.length);
        } else if (element.isContentEditable) {
            // First try innerText (best for contenteditable)
            text = element.innerText || '';
            console.log('[RefyneAI Button] innerText:', text.length);

            // If empty, try textContent
            if (!text || text.trim().length === 0) {
                text = element.textContent || '';
                console.log('[RefyneAI Button] textContent:', text.length);
            }

            // If still empty, check for nested p tags (ChatGPT/Gemini)
            if (!text || text.trim().length === 0) {
                const paragraphs = element.querySelectorAll('p');
                console.log('[RefyneAI Button] Found paragraphs:', paragraphs.length);
                if (paragraphs.length > 0) {
                    text = Array.from(paragraphs).map(p => p.textContent).join('\n');
                    console.log('[RefyneAI Button] Got text from paragraphs:', text.length);
                }
            }

            // Last resort: check all text nodes
            if (!text || text.trim().length === 0) {
                const walker = document.createTreeWalker(
                    element,
                    NodeFilter.SHOW_TEXT,
                    null,
                    false
                );
                const textNodes = [];
                while (walker.nextNode()) {
                    if (walker.currentNode.nodeValue.trim()) {
                        textNodes.push(walker.currentNode.nodeValue);
                    }
                }
                text = textNodes.join(' ');
                console.log('[RefyneAI Button] Got text from text nodes:', text.length);
            }
        }

        console.log('[RefyneAI Button] Final extracted text length:', text.trim().length);
        console.log('[RefyneAI Button] Text preview:', text.trim().substring(0, 100));

        return text;
    }

    // Set prompt text
    setPromptText(element, text) {
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

    // Handle refinement
    async handleRefine(inputElement, button) {
        // Find the actual input element with text
        const textInput = this.findTextInput(inputElement);
        const originalPrompt = this.getPromptText(textInput).trim();

        console.log('[RefyneAI Button] Input element:', inputElement.tagName, inputElement.className);
        console.log('[RefyneAI Button] Text input:', textInput.tagName, textInput.isContentEditable);
        console.log('[RefyneAI Button] Original prompt:', originalPrompt);

        if (!originalPrompt || originalPrompt.length < 3) {
            this.showError(button, 'Prompt too short');
            return;
        }

        button.classList.add('loading');
        button.querySelector('.refyne-ai-text').textContent = 'Refining...';

        try {
            const detectedIntent = window.PromptAnalyzer?.detectIntent(originalPrompt) || 'general';
            console.log('[RefyneAI] Auto-detected intent:', detectedIntent);

            const options = await this.generateOptions(originalPrompt, detectedIntent);
            this.showModal(textInput, originalPrompt, options, button);

            button.classList.remove('loading');
            button.querySelector('.refyne-ai-text').textContent = 'Refine';
        } catch (error) {
            console.error('[RefyneAI] Refinement error:', error);
            this.showError(button, 'Refinement failed');
        }
    }

    // Generate options
    async generateOptions(prompt, mode) {
        const options = [];
        const seenTexts = new Set();

        // Helper to add unique option
        const addOption = (text, label) => {
            if (text && text !== prompt && !seenTexts.has(text)) {
                seenTexts.add(text);
                options.push({ text, label });
                console.log(`[RefyneAI] Added option: ${label} (${text.substring(0, 50)}...)`);
                return true;
            }
            return false;
        };

        // 1. AI-Powered Refinement (PRIMARY - try first)
        if (prompt.trim().split(/\s+/).length >= 2) {
            try {
                console.log('[RefyneAI] Requesting AI refinement...');
                const aiRefined = await this.refinePrompt(prompt, mode);
                console.log('[RefyneAI] AI response:', aiRefined?.substring(0, 100));

                if (aiRefined && aiRefined.length > prompt.length) {
                    addOption(aiRefined, '✨ AI Enhanced');
                } else {
                    console.warn('[RefyneAI] AI response too short or empty');
                }
            } catch (e) {
                console.error('[RefyneAI] AI refinement failed:', e);
            }
        }

        // 2. Related Questions (diverse alternatives)
        const related = this.generateRelatedQuestions(prompt);
        related.forEach((q, i) => addOption(q, `💡 Alternative ${i + 1}`));

        // 3. Rule-Based (ONLY if we have less than 2 options)
        if (options.length < 2) {
            console.log('[RefyneAI] Using rule-based fallback');
            const ruleRefined = window.PromptTemplates?.applyTemplate(prompt, mode);
            if (ruleRefined && ruleRefined !== prompt) {
                addOption(ruleRefined, '📋 Structured');
            }
        }

        // 4. Manual variations (ONLY if we still have less than 2)
        if (options.length < 2) {
            console.log('[RefyneAI] Adding manual variations');

            // Detailed version
            const detailed = `${prompt}\n\nPlease provide:\n- Detailed explanation with examples\n- Step-by-step breakdown\n- Practical applications\n- Common misconceptions`;
            addOption(detailed, '📚 Detailed');

            // Concise version  
            const concise = `Provide a concise, focused explanation of: ${prompt}`;
            addOption(concise, '⚡ Concise');
        }

        console.log(`[RefyneAI] Generated ${options.length} total options`);
        return options.slice(0, 5); // Max 5 options
    }

    // Generate related questions
    generateRelatedQuestions(prompt) {
        const questions = [];
        const lower = prompt.toLowerCase();
        const topic = prompt.split(' ').filter(w => w.length > 3).slice(-5).join(' ');

        if (lower.includes('how') || lower.includes('explain')) {
            questions.push(`What are the key benefits and challenges of ${topic}?`);
            questions.push(`Can you provide practical examples of ${topic}?`);
        } else if (lower.includes('what')) {
            questions.push(`How can I implement ${topic} effectively?`);
            questions.push(`What are common mistakes to avoid with ${topic}?`);
        } else {
            questions.push(`What are the best practices for ${topic}?`);
        }

        return questions.slice(0, 2);
    }

    // Show modal
    showModal(inputElement, originalPrompt, options, button) {
        const overlay = document.createElement('div');
        overlay.className = 'refyne-modal-overlay';

        const modal = document.createElement('div');
        modal.className = 'refyne-modal';

        // Header with close button
        const header = document.createElement('div');
        header.className = 'refyne-modal-header';

        const closeBtn = document.createElement('button');
        closeBtn.className = 'refyne-modal-close';
        closeBtn.textContent = '×';
        header.appendChild(closeBtn);

        // Body
        const body = document.createElement('div');
        body.className = 'refyne-modal-body';

        // Original prompt
        const originalDiv = document.createElement('div');
        originalDiv.className = 'refyne-original';

        const originalLabel = document.createElement('div');
        originalLabel.className = 'refyne-original-label';
        originalLabel.textContent = 'Original Prompt';

        const originalText = document.createElement('p');
        originalText.className = 'refyne-original-text';
        originalText.textContent = originalPrompt;

        originalDiv.appendChild(originalLabel);
        originalDiv.appendChild(originalText);

        // Options list
        const optionsList = document.createElement('div');
        optionsList.className = 'refyne-options-list';

        options.forEach(option => {
            const optionEl = document.createElement('div');
            optionEl.className = 'refyne-option';
            optionEl.style.cursor = 'pointer';

            const text = document.createElement('p');
            text.className = 'refyne-option-text';
            text.textContent = option.text;

            optionEl.appendChild(text);
            optionsList.appendChild(optionEl);

            // Click to use
            optionEl.addEventListener('click', () => {
                this.setPromptText(inputElement, option.text);
                this.closeModal(overlay);
                this.showSuccess(button);
            });
        });

        body.appendChild(originalDiv);
        body.appendChild(optionsList);

        modal.appendChild(header);
        modal.appendChild(body);
        overlay.appendChild(modal);
        document.body.appendChild(overlay);

        // Close handlers
        closeBtn.addEventListener('click', () => this.closeModal(overlay));
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) this.closeModal(overlay);
        });
    }

    // Close modal
    closeModal(overlay) {
        overlay.style.opacity = '0';
        setTimeout(() => overlay.remove(), 200);
    }

    // Refine prompt
    async refinePrompt(prompt, mode) {
        return new Promise((resolve) => {
            const messageId = 'refine_' + Date.now();

            const handler = (e) => {
                if (e.data.type === 'REFYNE_AI_RESPONSE' && e.data.id === messageId) {
                    window.removeEventListener('message', handler);
                    resolve(e.data.refined);
                }
            };

            window.addEventListener('message', handler);

            window.postMessage({
                type: 'REFYNE_AI_REFINE',
                id: messageId,
                prompt: prompt,
                mode: mode
            }, '*');

            setTimeout(() => {
                window.removeEventListener('message', handler);
                resolve(prompt);
            }, 10000);
        });
    }

    // Show success
    showSuccess(button) {
        button.classList.remove('loading');
        button.classList.add('success');
        button.querySelector('.brand-r').textContent = '✓';
        button.querySelector('.brand-ai').style.display = 'none';
        button.querySelector('.refyne-ai-text').textContent = 'Refined!';

        setTimeout(() => {
            button.classList.remove('success');
            button.querySelector('.brand-r').textContent = 'R';
            button.querySelector('.brand-ai').style.display = 'inline';
            button.querySelector('.refyne-ai-text').textContent = 'Refine';
        }, 2000);
    }

    // Show error
    showError(button, message) {
        button.classList.remove('loading');
        button.querySelector('.refyne-ai-text').textContent = message;

        setTimeout(() => {
            button.querySelector('.refyne-ai-text').textContent = 'Refine';
        }, 2000);
    }

    // Initialize
    initialize() {
        // Skip ChatGPT due to React hydration conflicts
        if (window.location.hostname.includes('chatgpt.com') ||
            window.location.hostname.includes('chat.openai.com')) {
            console.log('[RefyneAI] Skipping ChatGPT - React compatibility issue. Works on Gemini, Claude, and other platforms.');
            return;
        }

        const textareas = document.querySelectorAll('textarea');
        const editables = document.querySelectorAll('[contenteditable="true"]');

        [...textareas, ...editables].forEach(element => {
            this.inject(element);
        });
    }

    // Observe for new inputs
    observe() {
        let debounceTimer;
        const observer = new MutationObserver(() => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                this.initialize();
            }, 100); // Wait 100ms after last DOM change
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
}

// Initialize
const refineButton = new RefineButton();

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        refineButton.initialize();
        refineButton.observe();
    });
} else {
    refineButton.initialize();
    refineButton.observe();
}

console.log('[RefyneAI] Refine button module loaded');
