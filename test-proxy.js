#!/usr/bin/env node

/**
 * Test script to verify CCR proxy functionality
 * Simulates a Gemini API request to test our proxy service
 */

import fetch from 'node-fetch';

const proxyUrl = 'http://localhost:3458';

// Test 1: Health check
console.log('🔍 Testing proxy health...');
try {
  const healthResponse = await fetch(`${proxyUrl}/health`);
  const healthData = await healthResponse.json();
  console.log('✅ Health check passed:', healthData);
} catch (error) {
  console.error('❌ Health check failed:', error.message);
  process.exit(1);
}

// Test 2: Simulated Gemini API request
console.log('\n🧪 Testing Gemini API simulation...');

const geminiRequest = {
  contents: [{
    role: 'user',
    parts: [{
      text: 'Hello, please introduce yourself briefly.'
    }]
  }],
  generationConfig: {
    maxOutputTokens: 100,
    temperature: 0.7
  }
};

try {
  console.log('📤 Sending request to proxy...');
  const response = await fetch(`${proxyUrl}/v1beta/models/gemini-2.5-pro/generateContent`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': 'test-key'
    },
    body: JSON.stringify(geminiRequest)
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ Request failed:', response.status, errorText);
    process.exit(1);
  }

  const result = await response.json();
  console.log('✅ Proxy test successful!');
  console.log('📝 Response:', JSON.stringify(result, null, 2));

  // Extract the text response
  if (result.candidates && result.candidates[0] && result.candidates[0].content && result.candidates[0].content.parts) {
    const text = result.candidates[0].content.parts[0].text;
    console.log('\n🤖 AI Response:', text);
  }

} catch (error) {
  console.error('❌ API test failed:', error.message);
  process.exit(1);
}

console.log('\n🎉 All tests passed! Proxy is working correctly.');