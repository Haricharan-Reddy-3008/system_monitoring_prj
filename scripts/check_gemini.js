const { GoogleGenerativeAI } = require('@google/generative-ai');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../backend/.env') });

async function listModels() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('❌ No GEMINI_API_KEY found in ../.env');
    return;
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  
  console.log('🔍 Checking available models for your API key...');
  
  try {
    // Note: listModels is not directly on genAI in some versions, 
    // it's usually on a separate client or requires a different approach.
    // However, we can try to hit the endpoint directly or use the SDK's fetch-like behavior.
    
    // For the current SDK, we can try to generate content with a very common model to see if it works.
    const modelsToTry = ["gemini-1.5-flash", "gemini-1.5-flash-latest", "gemini-pro", "gemini-1.0-pro"];
    
    for (const modelName of modelsToTry) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent("test");
        console.log(`✅ Model "${modelName}" is WORKING!`);
        return;
      } catch (err) {
        console.log(`❌ Model "${modelName}" failed: ${err.message}`);
      }
    }
    
    console.log('\n--- Trying with v1beta ---');
    for (const modelName of modelsToTry) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName }, { apiVersion: 'v1beta' });
        const result = await model.generateContent("test");
        console.log(`✅ Model "${modelName}" is WORKING with v1beta!`);
        return;
      } catch (err) {
        console.log(`❌ Model "${modelName}" failed with v1beta: ${err.message}`);
      }
    }

  } catch (error) {
    console.error('💥 Fatal error during diagnostics:', error.message);
  }
}

listModels();
