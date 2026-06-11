const os = require("os");

// CONFIGURATION
const PROJECT_ID = process.env.PROJECT_ID || process.argv[2];
const API_URL = "http://localhost:8000/api/metrics";

if (!PROJECT_ID) {
  console.error("❌ Missing PROJECT_ID. Example: node scripts/real_agent.js <PROJECT_ID>");
  process.exit(1);
}

console.log("🚀 Starting TRUE Hardware Agent...");
console.log(`Monitoring REAL hardware on: ${os.hostname()} (${os.platform()})`);

// Helper to calculate exact CPU percentage over an interval
function getCpuInfo() {
  const cpus = os.cpus();
  let user = 0, nice = 0, sys = 0, idle = 0, irq = 0;
  for (let cpu in cpus) {
    user += cpus[cpu].times.user;
    nice += cpus[cpu].times.nice;
    sys += cpus[cpu].times.sys;
    irq += cpus[cpu].times.irq;
    idle += cpus[cpu].times.idle;
  }
  return { idle, total: user + nice + sys + idle + irq };
}

let startMeasure = getCpuInfo();

async function sendRealHeartbeat() {
  // 1. Calculate TRUE Memory
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const memoryUsage = ((totalMem - freeMem) / totalMem) * 100;

  // 2. Calculate TRUE CPU
  const endMeasure = getCpuInfo();
  const idleDifference = endMeasure.idle - startMeasure.idle;
  const totalDifference = endMeasure.total - startMeasure.total;
  let cpuUsage = 100 - ~~(100 * idleDifference / totalDifference);
  startMeasure = endMeasure; // Reset for next tick

  // 3. For traffic/errors, we simulate basic baseline traffic since this is a local PC not a webserver
  const requests = Math.floor(Math.random() * 50 + 10);
  const errors = 0;

  const payload = {
    project_id: PROJECT_ID,
    cpu: cpuUsage,
    memory: memoryUsage,
    requests: requests,
    errors: errors,
    timestamp: new Date().toISOString(),
  };

  try {
    await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    // Send context logs so AI can explain the crash
    if (cpuUsage > 80) {
      await fetch("http://localhost:8000/api/logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project_id: PROJECT_ID,
          level: "WARN",
          message: `Heavy processing load detected. CPU threads maxing out.`,
          timestamp: new Date().toISOString()
        }),
      });
    }

    console.log(`📡 [REAL DATA] CPU: ${cpuUsage}% | RAM: ${memoryUsage.toFixed(1)}%`);
  } catch (error) {
    console.error("❌ Connection refused. Is backend running?");
  }
}

// Read and send hardware stats every 3 seconds
setInterval(sendRealHeartbeat, 3000);
