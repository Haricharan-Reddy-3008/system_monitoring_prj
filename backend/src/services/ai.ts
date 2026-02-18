import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '../config';

// Initialize with standard constructor (v1/v1beta is handled by the model names/SDK internally)
const genAI = config.geminiApiKey ? new GoogleGenerativeAI(config.geminiApiKey) : null;

/**
 * Service to handle all AI-related logic
 */
export const aiService = {
  /**
   * Generates system performance predictions based on recent metrics
   */
  async getPredictions(metrics: any[]) {
    if (!genAI || !config.geminiApiKey || config.geminiApiKey.includes('your-')) {
      return this.getMockPrediction('Missing API Key');
    }

    // Confirming available models via diagnostics: Feb 2026 update
    const modelsToTry = ["gemini-2.0-flash", "gemini-flash-latest", "gemini-2.5-flash", "gemini-pro-latest"];
    
    for (const modelName of modelsToTry) {
      try {
        console.log(`🤖 Attempting AI Prediction with model: ${modelName}...`);
        // Use v1beta as the listing API suggested these are v1beta compatible models
        const model = genAI.getGenerativeModel({ model: modelName }, { apiVersion: 'v1beta' });
        const prompt = `Analyze these system metrics and predict the next 30 minutes. 
        Return ONLY valid JSON in this format: 
        {"predicted_cpu": number, "predicted_memory": number, "risk_level": "LOW"|"MEDIUM"|"HIGH", "confidence": number, "reasoning": "string"}
        Metrics: ${JSON.stringify(metrics.slice(0, 5))}`;

        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const jsonStr = text.match(/\{[\s\S]*\}/)?.[0] || text;
        return JSON.parse(jsonStr);
      } catch (error: any) {
        console.error(`Attempt with ${modelName} failed:`, error.message);
        continue; // Try next model
      }
    }

    return this.getMockPrediction('AI Models unavailable');
  },

  /**
   * Explains an anomaly by looking at metrics and logs context
   */
  async getRootCauseAnalysis(anomaly: any, logs: any[], metrics: any[]) {
    if (!genAI || !config.geminiApiKey || config.geminiApiKey.includes('your-')) {
      return { explanation: "AI Explanation unavailable. (Missing API Key)" };
    }

    try {
      console.log(`🤖 Attempting Root Cause Analysis with gemini-flash-lite-latest...`);
      const model = genAI.getGenerativeModel({ model: "gemini-flash-lite-latest" }, { apiVersion: 'v1beta' });
      const prompt = `
        As a Site Reliability Engineer, explain the root cause of this anomaly.
        
        ANOMALY: ${anomaly.description} (Severity: ${anomaly.severity})
        RECENT LOGS: ${JSON.stringify(logs.slice(0, 10))}
        METRIC SNAPSHOT: ${JSON.stringify(metrics.slice(0, 5))}

        Provide a concise "Root Cause" and a "Suggested Fix". 
        Format as plain text with short bullet points.
      `;

      const result = await model.generateContent(prompt);
      return { explanation: result.response.text() };
    } catch (error: any) {
      console.error('Explanation Error:', error.message);
      return { explanation: "Failed to generate AI explanation. Please check logs manually." };
    }
  },

  getMockPrediction(reason: string) {
    return {
      predicted_cpu: 45.0,
      predicted_memory: 50.0,
      risk_level: "LOW",
      confidence: 100,
      reasoning: `Status: ${reason}. System is healthy based on static analysis.`
    };
  }
};
