# AI Integration Architecture (Phase 7 - Future Enhancement)

## Overview

This document outlines the design for optional AI-powered prompt refinement, extending PromptEngine beyond rule-based templates to leverage Large Language Models for more sophisticated prompt engineering.

## Design Principles

1. **Optional Enhancement**: AI integration is opt-in; rule-based refinement remains the default
2. **Fallback Strategy**: If AI fails, always fall back to rule-based templates
3. **Token Efficiency**: Minimize API calls and token usage
4. **Privacy-First**: Support local LLMs as an alternative to cloud APIs
5. **Cost Awareness**: Cache results and implement smart triggering

## Architecture Components

### 1. AI Provider Abstraction

```javascript
// engine/ai-provider.js
class AIProvider {
  async refinePrompt(prompt, context) {
    throw new Error('Must be implemented by subclass');
  }
  
  isAvailable() {
    throw new Error('Must be implemented by subclass');
  }
}

class OpenAIProvider extends AIProvider {
  constructor(apiKey) {
    super();
    this.apiKey = apiKey;
    this.endpoint = 'https://api.openai.com/v1/chat/completions';
  }
  
  async refinePrompt(prompt, context) {
    // Implementation
  }
}

class LocalLLMProvider extends AIProvider {
  constructor(endpoint) {
    super();
    this.endpoint = endpoint; // e.g., http://localhost:11434 for Ollama
  }
  
  async refinePrompt(prompt, context) {
    // Implementation
  }
}
```

### 2. Smart Triggering Logic

**When to Use AI vs. Rule-Based:**

- **Use AI when:**
  - Prompt is complex (>100 words)
  - Prompt contains domain-specific jargon
  - User explicitly enables "AI Mode"
  - Prompt intent is ambiguous

- **Use Rule-Based when:**
  - Prompt is simple (<50 words)
  - Clear intent detected
  - AI quota exhausted
  - Offline mode

### 3. Token Optimization

**Strategies to Minimize Token Usage:**

1. **Prompt Compression**: Send only essential context
2. **Response Caching**: Cache refined prompts for similar inputs
3. **Batch Processing**: Queue multiple prompts if possible
4. **Model Selection**: Use smaller models (gpt-3.5-turbo vs gpt-4)

**Example Meta-Prompt for AI Refinement:**

```
Refine this user prompt using prompt engineering best practices.
Add: role, clear task definition, constraints, output format.
Keep it concise. Original prompt: "{user_prompt}"
```

### 4. Caching Strategy

```javascript
// engine/cache.js
class PromptCache {
  constructor(maxSize = 100) {
    this.cache = new Map();
    this.maxSize = maxSize;
  }
  
  getCacheKey(prompt, mode) {
    return `${mode}:${this.hashPrompt(prompt)}`;
  }
  
  hashPrompt(prompt) {
    // Simple hash for similarity matching
    return prompt.toLowerCase().trim().slice(0, 50);
  }
  
  get(prompt, mode) {
    const key = this.getCacheKey(prompt, mode);
    return this.cache.get(key);
  }
  
  set(prompt, mode, refinedPrompt) {
    const key = this.getCacheKey(prompt, mode);
    
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    
    this.cache.set(key, refinedPrompt);
  }
}
```

### 5. Fallback Mechanism

```javascript
// engine/ai-refiner.js
class AIRefiner {
  constructor(provider, fallbackRefiner) {
    this.provider = provider;
    this.fallback = fallbackRefiner; // Rule-based refiner
    this.cache = new PromptCache();
  }
  
  async refine(prompt, mode) {
    // Check cache first
    const cached = this.cache.get(prompt, mode);
    if (cached) return cached;
    
    // Try AI refinement
    try {
      if (this.provider.isAvailable()) {
        const refined = await this.provider.refinePrompt(prompt, { mode });
        this.cache.set(prompt, mode, refined);
        return refined;
      }
    } catch (error) {
      console.warn('[PromptEngine] AI refinement failed, using fallback:', error);
    }
    
    // Fallback to rule-based
    return this.fallback.refine(prompt, mode);
  }
}
```

## Local LLM Support

### Recommended Local LLM Solutions

1. **Ollama** (Recommended)
   - Easy setup: `ollama run llama2`
   - Local endpoint: `http://localhost:11434`
   - Models: llama2, mistral, codellama

2. **LM Studio**
   - GUI-based
   - OpenAI-compatible API
   - Good for non-technical users

3. **llama.cpp**
   - Lightweight
   - C++ implementation
   - Fast inference

### Integration Example

```javascript
class OllamaProvider extends AIProvider {
  constructor(model = 'llama2') {
    super();
    this.endpoint = 'http://localhost:11434/api/generate';
    this.model = model;
  }
  
  async refinePrompt(prompt, context) {
    const response = await fetch(this.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: this.model,
        prompt: `Refine this prompt using best practices: "${prompt}"`,
        stream: false
      })
    });
    
    const data = await response.json();
    return data.response;
  }
  
  isAvailable() {
    // Check if Ollama is running
    return fetch(this.endpoint, { method: 'HEAD' })
      .then(() => true)
      .catch(() => false);
  }
}
```

## User Settings Extension

Add to popup.html:

```html
<div class="control-group">
  <label for="aiMode" class="label">AI Enhancement</label>
  <select id="aiMode" class="select">
    <option value="disabled">Disabled (Rule-Based Only)</option>
    <option value="openai">OpenAI API</option>
    <option value="local">Local LLM (Ollama)</option>
  </select>
</div>

<div id="apiKeySection" style="display: none;">
  <label for="apiKey" class="label">API Key</label>
  <input type="password" id="apiKey" class="input" placeholder="sk-...">
</div>
```

## Cost Management

### Token Budget System

```javascript
class TokenBudget {
  constructor(dailyLimit = 100000) {
    this.dailyLimit = dailyLimit;
    this.resetDate = new Date().toDateString();
    this.tokensUsed = 0;
  }
  
  canUseTokens(estimatedTokens) {
    this.checkReset();
    return (this.tokensUsed + estimatedTokens) <= this.dailyLimit;
  }
  
  recordUsage(tokens) {
    this.checkReset();
    this.tokensUsed += tokens;
  }
  
  checkReset() {
    const today = new Date().toDateString();
    if (today !== this.resetDate) {
      this.resetDate = today;
      this.tokensUsed = 0;
    }
  }
}
```

## Implementation Phases

### Phase 7.1: Foundation
- [ ] Create AI provider abstraction
- [ ] Implement caching system
- [ ] Add fallback logic
- [ ] Update settings UI

### Phase 7.2: OpenAI Integration
- [ ] Implement OpenAI provider
- [ ] Add API key management
- [ ] Implement token budgeting
- [ ] Add error handling

### Phase 7.3: Local LLM Support
- [ ] Implement Ollama provider
- [ ] Add connection testing
- [ ] Create setup documentation
- [ ] Optimize prompts for local models

### Phase 7.4: Optimization
- [ ] Implement smart caching
- [ ] Add A/B testing framework
- [ ] Performance monitoring
- [ ] Cost analytics

## Security Considerations

1. **API Key Storage**: Use chrome.storage.local with encryption
2. **HTTPS Only**: Enforce secure connections
3. **Rate Limiting**: Prevent abuse
4. **Input Validation**: Sanitize all prompts before sending to AI

## Performance Targets

- **AI Response Time**: < 2 seconds
- **Cache Hit Rate**: > 60%
- **Fallback Rate**: < 5%
- **Token Usage**: < 500 tokens per refinement

## Testing Strategy

1. **Unit Tests**: Test each provider independently
2. **Integration Tests**: Test fallback mechanisms
3. **Load Tests**: Simulate high usage
4. **Cost Tests**: Monitor token usage in production

## Future Enhancements

- **Multi-model Support**: Allow users to choose between GPT-4, Claude, etc.
- **Custom Meta-Prompts**: Let users define their own refinement instructions
- **Analytics Dashboard**: Show refinement statistics
- **Collaborative Learning**: Share successful refinements (opt-in)

---

**Status**: Design Complete - Ready for Implementation
**Priority**: Medium (MVP works well with rule-based approach)
**Estimated Effort**: 2-3 weeks for full implementation
