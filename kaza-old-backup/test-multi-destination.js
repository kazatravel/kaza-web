// Test script for multi-destination API
const fetch = require('node-fetch');

const API_URL = 'http://localhost:3000/api/trip/multi';

const testPayload = {
  origin: 'LAX',
  destinations: [
    { city: 'Paris', checkIn: '2025-06-01', checkOut: '2025-06-05' },
    { city: 'Rome', checkIn: '2025-06-05', checkOut: '2025-06-09' }
  ],
  travelers: 2
};

async function testAPI() {
  console.log('Testing Multi-Destination API...');
  console.log('Payload:', JSON.stringify(testPayload, null, 2));
  
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testPayload)
    });
    
    const data = await response.json();
    console.log('\nResponse Status:', response.status);
    console.log('\nResponse Data:');
    console.log(JSON.stringify(data, null, 2));
    
    // Save results
    const fs = require('fs');
    const results = {
      timestamp: new Date().toISOString(),
      payload: testPayload,
      response: data,
      success: data.success === true
    };
    
    fs.writeFileSync(
      '/data/.openclaw/workspace/projects/kaza/agents/agent-c-test-results.json',
      JSON.stringify(results, null, 2)
    );
    
    console.log('\nTest results saved to agent-c-test-results.json');
    return results;
  } catch (error) {
    console.error('Test failed:', error);
    return { success: false, error: error.message };
  }
}

testAPI();
