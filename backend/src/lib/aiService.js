import { AI_CONFIG } from "../config/ai.config.js";
import {
  OllamaProvider,
  OpenAIProvider,
  HuggingFaceProvider,
  GeminiProvider,
  AnthropicProvider,
  MistralProvider,
} from "./providers/AIProvider.js";

/**
 * AI Service Manager
 * Handles provider selection, fallbacks, and generation
 */
class AIService {
  constructor() {
    this.providers = this.initializeProviders();
    this.activeProvider = null;
    this.selectProvider();
  }

  /**
   * Initialize all available providers
   */
  initializeProviders() {
    const providers = {};

    providers.ollama = new OllamaProvider(AI_CONFIG.providers.ollama);
    providers.openai = new OpenAIProvider(AI_CONFIG.providers.openai);
    providers.huggingface = new HuggingFaceProvider(
      AI_CONFIG.providers.huggingface
    );
    providers.gemini = new GeminiProvider(AI_CONFIG.providers.gemini);
    providers.anthropic = new AnthropicProvider(AI_CONFIG.providers.anthropic);
    providers.mistral = new MistralProvider(AI_CONFIG.providers.mistral);

    return providers;
  }

  /**
   * Select active provider based on config
   */
  selectProvider() {
    const providerName = AI_CONFIG.provider;
    const provider = this.providers[providerName];

    if (!provider) {
      console.warn(`Provider '${providerName}' not found, using fallback`);
      this.selectFallbackProvider();
      return;
    }

    if (!provider.isAvailable()) {
      console.warn(`Provider '${providerName}' not available, using fallback`);
      this.selectFallbackProvider();
      return;
    }

    this.activeProvider = provider;

    if (process.env.NODE_ENV === "development") {
      console.log(
        `AI Provider: ${providerName} (${AI_CONFIG.providers[providerName].model})`
      );
    }
  }

  /**
   * Select first available fallback provider
   */
  selectFallbackProvider() {
    for (const fallbackName of AI_CONFIG.fallbacks) {
      const provider = this.providers[fallbackName];
      if (provider && provider.isAvailable()) {
        this.activeProvider = provider;
        console.warn(
          `Using fallback AI Provider: ${fallbackName} (${AI_CONFIG.providers[fallbackName].model})`
        );
        return;
      }
    }

    throw new Error("No available AI providers found");
  }

  /**
   * Generate text with active provider
   * Automatically falls back to other providers if primary fails
   */
  async generate(prompt, retries = 2) {
    if (!this.activeProvider) {
      throw new Error("No AI provider available");
    }

    try {
      const startTime = Date.now();
      const response = await this.activeProvider.generate(prompt);
      const duration = ((Date.now() - startTime) / 1000).toFixed(2);

      if (process.env.NODE_ENV === "development") {
        console.log(
          `✅ AI generated in ${duration}s with ${this.activeProvider.getName()}`
        );
      }

      return response;
    } catch (error) {
      // Retry on transient per-minute rate limits
      const is429 = error.message.includes("429") || error.message.includes("Too Many Requests");
      const isPerMinute = error.message.includes("PerMinute");
      if (is429 && isPerMinute && retries > 0) {
        const retryMatch = error.message.match(/retry[^\d]*(\d+(?:\.\d+)?)/i);
        const waitMs = retryMatch ? Math.ceil(parseFloat(retryMatch[1])) * 1000 : 5000;
        console.warn(`Rate limited (per-minute), retrying in ${waitMs / 1000}s...`);
        await new Promise((r) => setTimeout(r, waitMs));
        return this.generate(prompt, retries - 1);
      }

      console.error(
        `AI Provider ${this.activeProvider.getName()} failed:`,
        error.message
      );

      // Try fallback providers
      for (const fallbackName of AI_CONFIG.fallbacks) {
        if (fallbackName === this.activeProvider.getName()) continue;

        const fallbackProvider = this.providers[fallbackName];
        if (fallbackProvider && fallbackProvider.isAvailable()) {
          try {
            const response = await fallbackProvider.generate(prompt);
            console.warn(`Using fallback provider: ${fallbackName}`);
            return response;
          } catch (fallbackError) {
            console.error(
              `Fallback ${fallbackName} failed:`,
              fallbackError.message
            );
            continue;
          }
        }
      }

      throw new Error(`All AI providers failed. Last error: ${error.message}`);
    }
  }

  /**
   * Stream text generation chunk by chunk.
   * Falls back to a single-chunk emit if the active provider doesn't support streaming.
   * @returns {Promise<string>} full accumulated text
   */
  async generateStream(prompt, onChunk) {
    if (!this.activeProvider) throw new Error("No AI provider available");

    if (typeof this.activeProvider.generateStream === "function") {
      return await this.activeProvider.generateStream(prompt, onChunk);
    }

    // Fallback: non-streaming provider — emit full response as one chunk
    const text = await this.generate(prompt);
    onChunk(text);
    return text;
  }

  /**
   * Get current provider info
   */
  getProviderInfo() {
    if (!this.activeProvider) {
      return { provider: "none", model: "none", status: "unavailable" };
    }

    const name = this.activeProvider.getName();
    return {
      provider: name,
      model: AI_CONFIG.providers[name]?.model || "unknown",
      status: "available",
    };
  }

  /**
   * Switch to a different provider at runtime
   */
  switchProvider(providerName) {
    const provider = this.providers[providerName];

    if (!provider) {
      throw new Error(`Provider '${providerName}' not found`);
    }

    if (!provider.isAvailable()) {
      throw new Error(`Provider '${providerName}' not available`);
    }

    this.activeProvider = provider;

    if (process.env.NODE_ENV === "development") {
      console.log(
        `Switched AI provider to: ${providerName} (${AI_CONFIG.providers[providerName].model})`
      );
    }
  }
}

// Export singleton instance
export const aiService = new AIService();

// Export for direct use
export async function generateText(prompt) {
  return await aiService.generate(prompt);
}
