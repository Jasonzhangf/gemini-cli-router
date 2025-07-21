/**
 * Gemini CLI Router - Main Server
 * A proxy service that routes Gemini API requests to third-party providers
 * 
 * @author Jason Zhang
 */

import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import { GeminiTranslator } from './gemini-translator.js';
import { config } from './config.js';

const app = express();

// Middleware
app.use(cors(config.cors));
app.use(express.json({ limit: '10mb' }));
app.use(express.text({ type: 'text/plain' }));

// Logging middleware
app.use((req, res, next) => {
  if (config.debug) {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    if (req.body && Object.keys(req.body).length > 0) {
      console.log('Request body:', JSON.stringify(req.body, null, 2));
    }
  }
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'gemini-cli-router',
    provider: config.provider.name,
    timestamp: new Date().toISOString()
  });
});

// Configuration endpoint
app.get('/config', (req, res) => {
  res.json({
    provider: config.provider.name,
    model: config.provider.model,
    version: '1.0.0'
  });
});

// OpenAI-compatible endpoint (used by SHUAIHONG provider)
app.post('/chat/completions', async (req, res) => {
  try {
    const openaiRequest = req.body;
    
    if (config.debug) {
      console.log(`[Router] Received OpenAI-compatible request`);
      console.log(`[Router] Request:`, JSON.stringify(openaiRequest, null, 2));
    }
    
    // Get provider configuration
    const providerConfig = config.providers[config.provider.name] || config.providers.custom;
    const targetUrl = `${config.provider.baseUrl}${providerConfig.chatEndpoint}`;
    
    // Set model if not specified
    if (!openaiRequest.model) {
      openaiRequest.model = config.provider.model || providerConfig.model;
    }
    
    // Prepare headers
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.provider.apiKey}`
    };
    
    // Handle different provider authentication
    if (config.provider.name === 'claude') {
      headers['x-api-key'] = config.provider.apiKey;
      headers['anthropic-version'] = '2023-06-01';
      delete headers['Authorization'];
    }
    
    if (config.debug) {
      console.log(`[Router] Making request to: ${targetUrl}`);
      console.log(`[Router] Headers:`, { ...headers, Authorization: '[REDACTED]' });
    }
    
    // Make request to target provider
    const response = await fetch(targetUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(openaiRequest)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Router] Provider error (${response.status}):`, errorText);
      
      return res.status(response.status).json({
        error: {
          message: `Provider error: ${errorText}`,
          type: 'provider_error',
          code: response.status
        }
      });
    }
    
    const providerResponse = await response.json();
    
    if (config.debug) {
      console.log(`[Router] Provider response:`, JSON.stringify(providerResponse, null, 2));
    }
    
    // For SHUAIHONG and other OpenAI-compatible providers, pass through the response
    res.json(providerResponse);
    
  } catch (error) {
    console.error('[Router] Error:', error);
    res.status(500).json({
      error: {
        message: error.message,
        type: 'internal_error',
        code: 500
      }
    });
  }
});

// Main Gemini API proxy endpoint
app.post('/v1beta/models/:model/generateContent', async (req, res) => {
  try {
    const { model } = req.params;
    const geminiRequest = req.body;
    
    if (config.debug) {
      console.log(`[Router] Received request for model: ${model}`);
      console.log(`[Router] Gemini request:`, JSON.stringify(geminiRequest, null, 2));
    }
    
    // Translate Gemini request to Claude/OpenAI format
    const translatedRequest = GeminiTranslator.translateRequest(geminiRequest);
    
    if (config.debug) {
      console.log(`[Router] Translated request:`, JSON.stringify(translatedRequest, null, 2));
    }
    
    // Get provider configuration
    const providerConfig = config.providers[config.provider.name] || config.providers.custom;
    const targetUrl = `${config.provider.baseUrl}${providerConfig.chatEndpoint}`;
    
    // Override model if specified
    translatedRequest.model = config.provider.model || providerConfig.model;
    
    // Prepare headers
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.provider.apiKey}`
    };
    
    // Handle different provider authentication
    if (config.provider.name === 'claude') {
      headers['x-api-key'] = config.provider.apiKey;
      headers['anthropic-version'] = '2023-06-01';
      delete headers['Authorization'];
    }
    
    if (config.debug) {
      console.log(`[Router] Making request to: ${targetUrl}`);
      console.log(`[Router] Headers:`, { ...headers, Authorization: '[REDACTED]' });
    }
    
    // Make request to target provider
    const response = await fetch(targetUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(translatedRequest)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Router] Provider error (${response.status}):`, errorText);
      
      return res.status(response.status).json({
        error: {
          code: response.status,
          message: `Provider error: ${errorText}`,
          status: 'PROVIDER_ERROR'
        }
      });
    }
    
    const providerResponse = await response.json();
    
    if (config.debug) {
      console.log(`[Router] Provider response:`, JSON.stringify(providerResponse, null, 2));
    }
    
    // Translate response back to Gemini format
    const geminiResponse = GeminiTranslator.translateResponse(providerResponse);
    
    if (config.debug) {
      console.log(`[Router] Gemini response:`, JSON.stringify(geminiResponse, null, 2));
    }
    
    res.json(geminiResponse);
    
  } catch (error) {
    console.error('[Router] Error:', error);
    res.status(500).json({
      error: {
        code: 500,
        message: error.message,
        status: 'INTERNAL_ERROR'
      }
    });
  }
});

// Catch-all for other Gemini API endpoints
app.all('/v1beta/*', (req, res) => {
  if (config.debug) {
    console.log(`[Router] Unhandled endpoint: ${req.method} ${req.path}`);
  }
  
  res.status(404).json({
    error: {
      code: 404,
      message: `Endpoint not supported: ${req.path}`,
      status: 'NOT_FOUND'
    }
  });
});

// Start server
const server = app.listen(config.port, config.host, () => {
  console.log(`\n🚀 Gemini CLI Router started successfully!`);
  console.log(`📡 Server: http://${config.host}:${config.port}`);
  console.log(`🎯 Provider: ${config.provider.name} (${config.provider.model})`);
  console.log(`🔧 Debug mode: ${config.debug ? 'ON' : 'OFF'}`);
  console.log(`⚡ Ready to route Gemini API requests!\n`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('\n🛑 Received SIGTERM, shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('\n🛑 Received SIGINT, shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

export default app;