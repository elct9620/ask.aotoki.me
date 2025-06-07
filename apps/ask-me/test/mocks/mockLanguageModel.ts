import { LanguageModel, LanguageModelV1CallOptions, LanguageModelV1FinishReason, LanguageModelV1FunctionToolCall, LanguageModelV1LogProbs, LanguageModelV1ObjectGenerationMode, LanguageModelV1ProviderMetadata, LanguageModelV1Source, LanguageModelV1StreamPart } from "ai";
import { injectable } from "tsyringe";

/**
 * Mock implementation of LanguageModelV1 for testing
 */
@injectable()
export class MockLanguageModel implements LanguageModel {
  readonly specificationVersion = "v1" as const;
  readonly provider = "mock";
  readonly modelId = "mock-language-model";
  readonly defaultObjectGenerationMode: LanguageModelV1ObjectGenerationMode = "json";
  readonly supportsImageUrls = true;
  readonly supportsStructuredOutputs = true;

  // Configurable responses for testing
  private mockTextResponse: string = "This is a mock response";
  private mockToolCalls: LanguageModelV1FunctionToolCall[] = [];
  private mockFinishReason: LanguageModelV1FinishReason = "stop";
  private mockUsage = { promptTokens: 10, completionTokens: 20 };

  /**
   * Configure the mock text response
   */
  setMockTextResponse(text: string): void {
    this.mockTextResponse = text;
  }

  /**
   * Configure mock tool calls
   */
  setMockToolCalls(toolCalls: LanguageModelV1FunctionToolCall[]): void {
    this.mockToolCalls = toolCalls;
  }

  /**
   * Configure the mock finish reason
   */
  setMockFinishReason(reason: LanguageModelV1FinishReason): void {
    this.mockFinishReason = reason;
  }

  /**
   * Configure the mock token usage
   */
  setMockUsage(promptTokens: number, completionTokens: number): void {
    this.mockUsage = { promptTokens, completionTokens };
  }

  /**
   * Checks if the model supports the given URL for file parts natively
   */
  supportsUrl(url: URL): boolean {
    return url.protocol === 'https:';
  }

  /**
   * Generate a non-streaming response
   */
  async doGenerate(options: LanguageModelV1CallOptions): Promise<{
    text?: string;
    reasoning?: string | Array<{ type: 'text'; text: string; signature?: string } | { type: 'redacted'; data: string }>;
    files?: Array<{ data: string | Uint8Array; mimeType: string }>;
    toolCalls?: Array<LanguageModelV1FunctionToolCall>;
    finishReason: LanguageModelV1FinishReason;
    usage: { promptTokens: number; completionTokens: number };
    rawCall: { rawPrompt: unknown; rawSettings: Record<string, unknown> };
    rawResponse?: { headers?: Record<string, string>; body?: unknown };
    request?: { body?: string };
    response?: { id?: string; timestamp?: Date; modelId?: string };
    warnings?: any[];
    providerMetadata?: LanguageModelV1ProviderMetadata;
    sources?: LanguageModelV1Source[];
    logprobs?: LanguageModelV1LogProbs;
  }> {
    return {
      text: this.mockTextResponse,
      toolCalls: this.mockToolCalls,
      finishReason: this.mockFinishReason,
      usage: this.mockUsage,
      rawCall: {
        rawPrompt: options.messages,
        rawSettings: { temperature: options.temperature ?? 0.7 },
      },
      rawResponse: {
        headers: { "x-mock": "true" },
        body: { text: this.mockTextResponse }
      },
      request: {
        body: JSON.stringify({ messages: options.messages })
      },
      response: {
        id: "mock-response-id",
        timestamp: new Date(),
        modelId: this.modelId
      }
    };
  }

  /**
   * Generate a streaming response
   */
  async doStream(options: LanguageModelV1CallOptions): Promise<{
    stream: ReadableStream<LanguageModelV1StreamPart>;
    rawCall: { rawPrompt: unknown; rawSettings: Record<string, unknown> };
    rawResponse?: { headers?: Record<string, string> };
    request?: { body?: string };
    warnings?: any[];
  }> {
    const encoder = new TextEncoder();
    const text = this.mockTextResponse;
    
    // Create a stream that yields each character of the mock text
    const stream = new ReadableStream<LanguageModelV1StreamPart>({
      start: async (controller) => {
        try {
          // Send response metadata
          controller.enqueue({
            type: "response-metadata",
            id: "mock-response-id",
            timestamp: new Date(),
            modelId: this.modelId
          });
          
          // Send text deltas
          for (let i = 0; i < text.length; i++) {
            controller.enqueue({ 
              type: "text-delta", 
              textDelta: text[i]
            });
            
            // Simulate some delay for realism
            await new Promise(resolve => setTimeout(resolve, 5));
          }
          
          // Send tool calls if any
          for (const toolCall of this.mockToolCalls) {
            controller.enqueue({
              type: "tool-call",
              ...toolCall
            });
          }
          
          // Send finish
          controller.enqueue({
            type: "finish",
            finishReason: this.mockFinishReason,
            usage: this.mockUsage
          });
          
          controller.close();
        } catch (error) {
          controller.enqueue({
            type: "error",
            error
          });
          controller.close();
        }
      }
    });

    return {
      stream,
      rawCall: {
        rawPrompt: options.messages,
        rawSettings: { temperature: options.temperature ?? 0.7 }
      },
      rawResponse: {
        headers: { "x-mock": "true" }
      },
      request: {
        body: JSON.stringify({ messages: options.messages })
      }
    };
  }
}
