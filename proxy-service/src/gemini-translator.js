/**
 * Gemini API Request/Response Translator
 * Converts between Gemini API format and Claude/OpenAI format
 * 
 * @author Jason Zhang
 */

export class GeminiTranslator {
  /**
   * Convert Gemini API request to Claude/OpenAI format
   */
  static translateRequest(geminiRequest) {
    const { contents, generationConfig, systemInstruction } = geminiRequest;
    
    // Convert messages
    const messages = [];
    
    // Add system instruction if present
    if (systemInstruction) {
      messages.push({
        role: 'system',
        content: typeof systemInstruction === 'string' 
          ? systemInstruction 
          : systemInstruction.parts?.map(p => p.text).join('') || ''
      });
    }
    
    // Convert content messages
    if (contents && Array.isArray(contents)) {
      contents.forEach(content => {
        const role = content.role === 'user' ? 'user' : 'assistant';
        let messageContent = '';
        
        if (content.parts && Array.isArray(content.parts)) {
          messageContent = content.parts.map(part => {
            if (part.text) return part.text;
            if (part.inlineData) return '[Image data]';
            if (part.fileData) return '[File data]';
            return '';
          }).join('');
        }
        
        if (messageContent.trim()) {
          messages.push({
            role,
            content: messageContent
          });
        }
      });
    }
    
    // Convert generation config
    const requestBody = {
      messages,
      max_tokens: generationConfig?.maxOutputTokens || 4096,
      temperature: generationConfig?.temperature || 0.7,
      top_p: generationConfig?.topP || 1.0,
      stream: false // We'll handle streaming separately
    };
    
    return requestBody;
  }
  
  /**
   * Convert Claude/OpenAI response to Gemini format
   */
  static translateResponse(claudeResponse) {
    // Handle streaming response
    if (claudeResponse.choices && claudeResponse.choices[0]) {
      const choice = claudeResponse.choices[0];
      const content = choice.message?.content || choice.delta?.content || '';
      
      return {
        candidates: [{
          content: {
            parts: [{
              text: content
            }],
            role: 'model'
          },
          finishReason: choice.finish_reason === 'stop' ? 'STOP' : 'OTHER',
          index: 0,
          safetyRatings: []
        }],
        usageMetadata: {
          promptTokenCount: claudeResponse.usage?.prompt_tokens || 0,
          candidatesTokenCount: claudeResponse.usage?.completion_tokens || 0,
          totalTokenCount: claudeResponse.usage?.total_tokens || 0
        }
      };
    }
    
    // Handle direct content response
    if (typeof claudeResponse === 'string') {
      return {
        candidates: [{
          content: {
            parts: [{
              text: claudeResponse
            }],
            role: 'model'
          },
          finishReason: 'STOP',
          index: 0,
          safetyRatings: []
        }]
      };
    }
    
    // Handle error response
    return {
      error: {
        code: 500,
        message: 'Failed to translate response',
        status: 'INTERNAL_ERROR'
      }
    };
  }
  
  /**
   * Convert streaming response chunk to Gemini format
   */
  static translateStreamChunk(chunk) {
    if (chunk.choices && chunk.choices[0]) {
      const choice = chunk.choices[0];
      const content = choice.delta?.content || '';
      
      if (content) {
        return {
          candidates: [{
            content: {
              parts: [{
                text: content
              }],
              role: 'model'
            },
            index: 0
          }]
        };
      }
    }
    
    return null;
  }
}