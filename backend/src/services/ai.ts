import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '../config';
import { DEFAULT_THRESHOLDS, ProjectThresholds } from './anomaly';

// Initialize with standard constructor (v1/v1beta is handled by the model names/SDK internally)
const genAI = config.geminiApiKey ? new GoogleGenerativeAI(config.geminiApiKey) : null;

/**
 * Service to handle all AI-related logic
 */
export const aiService = {
  /**
   * Generates system performance predictions based on recent metrics
   */
  async getPredictions(metrics: any[], thresholds: ProjectThresholds = DEFAULT_THRESHOLDS) {
    if (!genAI || !config.geminiApiKey || config.geminiApiKey.includes('your-')) {
      return this.getLocalPrediction(metrics, thresholds, 'Gemini API key is missing');
    }

    // Confirming available models via diagnostics: Feb 2026 update
    const modelsToTry = ["gemini-2.0-flash", "gemini-flash-latest", "gemini-2.5-flash", "gemini-pro-latest"];
    
    for (const modelName of modelsToTry) {
      try {
        console.log(`🤖 Attempting AI Prediction with model: ${modelName}...`);
        // Use v1beta as the listing API suggested these are v1beta compatible models
        const model = genAI.getGenerativeModel({ model: modelName }, { apiVersion: 'v1beta' });
        const chronologicalMetrics = [...metrics.slice(0, 50)].reverse();
        const prompt = `Analyze these system metrics and predict the next 30 minutes.
        Use this project's alert thresholds when deciding risk: ${JSON.stringify(thresholds)}.
        Return ONLY valid JSON in this format: 
        {"predicted_cpu": number, "predicted_memory": number, "risk_level": "LOW"|"MEDIUM"|"HIGH", "confidence": number, "reasoning": "string"}
        Metrics: ${JSON.stringify(chronologicalMetrics)}`;

        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const jsonStr = text.match(/\{[\s\S]*\}/)?.[0] || text;
        const parsed = JSON.parse(jsonStr);
        return this.normalizePrediction(parsed, metrics, thresholds);
      } catch (error: any) {
        console.error(`Attempt with ${modelName} failed:`, error.message);
        continue; // Try next model
      }
    }

    return this.getLocalPrediction(metrics, thresholds, 'Gemini models unavailable');
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

  normalizePrediction(prediction: any, metrics: any[], thresholds: ProjectThresholds) {
    const localPrediction = this.getLocalPrediction(metrics, thresholds, 'Local validation');
    const predictedCpu = this.clamp(Number(prediction.predicted_cpu), 0, 100, localPrediction.predicted_cpu);
    const predictedMemory = this.clamp(Number(prediction.predicted_memory), 0, 100, localPrediction.predicted_memory);
    const riskLevel = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].includes(prediction.risk_level)
      ? prediction.risk_level
      : localPrediction.risk_level;

    return {
      predicted_cpu: predictedCpu,
      predicted_memory: predictedMemory,
      risk_level: riskLevel,
      confidence: this.clamp(Number(prediction.confidence), 0, 100, localPrediction.confidence),
      reasoning: prediction.reasoning || localPrediction.reasoning
    };
  },

  getLocalPrediction(metrics: any[], thresholds: ProjectThresholds, reason: string) {
    const chronologicalMetrics = [...metrics].reverse();
    const recent = chronologicalMetrics.slice(-10);
    const previous = chronologicalMetrics.slice(-20, -10);
    const sample = recent.length > 0 ? recent : chronologicalMetrics;

    const cpuAverage = this.average(sample, 'cpu');
    const memoryAverage = this.average(sample, 'memory');
    const requestAverage = this.average(sample, 'requests');
    const errorAverage = this.average(sample, 'errors');

    const cpuTrend = cpuAverage - this.average(previous.length ? previous : sample, 'cpu');
    const memoryTrend = memoryAverage - this.average(previous.length ? previous : sample, 'memory');
    const requestTrend = requestAverage - this.average(previous.length ? previous : sample, 'requests');
    const errorTrend = errorAverage - this.average(previous.length ? previous : sample, 'errors');

    const predictedCpu = this.clamp(cpuAverage + cpuTrend * 1.5, 0, 100, cpuAverage);
    const predictedMemory = this.clamp(memoryAverage + memoryTrend * 1.5, 0, 100, memoryAverage);
    const predictedRequests = Math.max(0, requestAverage + requestTrend * 1.5);
    const predictedErrors = Math.max(0, errorAverage + errorTrend * 1.5);

    const pressure = Math.max(
      predictedCpu / thresholds.cpu,
      predictedMemory / thresholds.memory,
      predictedRequests / thresholds.requests,
      predictedErrors / thresholds.errors
    );

    const riskLevel = pressure >= 1.15
      ? 'CRITICAL'
      : pressure >= 1
        ? 'HIGH'
        : pressure >= 0.8
          ? 'MEDIUM'
          : 'LOW';

    const volatility = this.standardDeviation(sample, 'cpu') + this.standardDeviation(sample, 'memory');
    const confidence = this.clamp(85 - volatility / 2 + Math.min(sample.length, 10), 45, 92, 70);
    const direction = cpuTrend > 1 || memoryTrend > 1 || requestTrend > 5 || errorTrend > 0.2
      ? 'upward trend'
      : cpuTrend < -1 && memoryTrend < -1
        ? 'cooling trend'
        : 'stable trend';

    return {
      predicted_cpu: Number(predictedCpu.toFixed(1)),
      predicted_memory: Number(predictedMemory.toFixed(1)),
      risk_level: riskLevel,
      confidence: Math.round(confidence),
      reasoning: `${reason}. Forecast is based on ${sample.length} recent metric samples, project thresholds, and a ${direction}. CPU ${predictedCpu.toFixed(1)}% / ${thresholds.cpu}%, memory ${predictedMemory.toFixed(1)}% / ${thresholds.memory}%.`
    };
  },

  average(metrics: any[], field: string) {
    if (!metrics.length) return 0;
    return metrics.reduce((sum, metric) => sum + (Number(metric[field]) || 0), 0) / metrics.length;
  },

  standardDeviation(metrics: any[], field: string) {
    if (metrics.length < 2) return 0;
    const mean = this.average(metrics, field);
    const variance = metrics.reduce((sum, metric) => {
      const value = Number(metric[field]) || 0;
      return sum + Math.pow(value - mean, 2);
    }, 0) / metrics.length;

    return Math.sqrt(variance);
  },

  clamp(value: number, min: number, max: number, fallback: number) {
    if (!Number.isFinite(value)) return fallback;
    return Math.min(max, Math.max(min, value));
  }
};
