const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

async function testAI() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('❌ No GEMINI_API_KEY found');
    return;
  }

  console.log('🔍 Listing all available models for this API key...');
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.error) {
      console.error('❌ API Error:', data.error);
    } else {
      console.log('✅ Available Models:');
      data.models.forEach(m => console.log(` - ${m.name}`));
    }
  } catch (err) {
    console.log(`❌ Failed to list models: ${err.message}`);
  }
}

testAI();
