const os = require('os');

// CONFIGURATION
const PROJECT_ID = '9d598f17-53c3-48aa-886b-dfcf0f262414'; 
const API_URL = 'http://localhost:8000/api/metrics';
const LOG_API_URL = 'http://localhost:8000/api/logs';

console.log('🚀 Starting Real-Time Data Generator (Metrics + Logs)...');

/**
 * Calculates current CPU usage percentage
 */
let heartbeatCount = 0;

function getRealMetrics() {
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const memoryUsage = ((totalMem - freeMem) / totalMem) * 100;

  // Simulate a spike every 5 heartbeats for testing anomalies
  heartbeatCount++;
  let cpuUsage;
  if (heartbeatCount % 5 === 0) {
    console.log('🔥 SIMULATING CPU SPIKE...');
    cpuUsage = randomBetween(90, 98);
  } else {
    const load = os.loadavg()[0];
    cpuUsage = load > 0 ? Math.min(load * 10, 100) : (Math.random() * 20 + 20); 
  }

  return {
    cpu: cpuUsage,
    memory: memoryUsage
  };
}

function randomBetween(min, max) {
  return Math.random() * (max - min) + min;
}

/**
 * Sends a single heartbeat to the backend
 */
async function sendHeartbeat() {
  const system = getRealMetrics();
  
  const payload = {
    project_id: PROJECT_ID,
    cpu: system.cpu,
    memory: system.memory,
    requests: Math.floor(Math.random() * 300 + 50),
    errors: Math.floor(Math.random() * 3),
    timestamp: new Date().toISOString()
  };

  try {
    // 1. Send Metrics
    await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    // 2. Send logs more frequently (70% chance)
    if (Math.random() > 0.3) {
      const logs = [
        { level: 'INFO', message: `System heartbeat - CPU: ${payload.cpu.toFixed(1)}%` },
        { level: 'INFO', message: 'User session validated' },
        { level: 'WARN', message: 'High memory load detected' },
        { level: 'ERROR', message: 'Database query timed out' },
        { level: 'ERROR', message: 'Foreign key constraint violation' },
        { level: 'INFO', message: 'API Request processed successfully' }
      ];
      const log = logs[Math.floor(Math.random() * logs.length)];
      
      await fetch(LOG_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id: PROJECT_ID,
          timestamp: new Date().toISOString(),
          ...log
        }),
      });
    }

    console.log(`✅ [${new Date().toLocaleTimeString()}] Sent Data: CPU ${payload.cpu.toFixed(1)}%, Mem ${payload.memory.toFixed(1)}%`);
  } catch (error) {
    console.error('❌ Error sending data:', error.message);
  }
}

// Send heartbeat every 5 seconds
setInterval(sendHeartbeat, 5000);
sendHeartbeat();
