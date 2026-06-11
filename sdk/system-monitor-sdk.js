const os = require("os");

let intervalId = null;

// Helper to calculate exact CPU
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

/**
 * Starts the monitoring agent in the background of any Node.js app
 * @param {Object} config - Configuration object
 * @param {string} config.projectId - The company's unique project ID
 * @param {string} [config.apiUrl] - Optional custom API URL
 */
function start(config) {
  if (!config || !config.projectId) {
    console.error("❌ System Monitor SDK: Missing projectId");
    return;
  }

  const apiUrl = config.apiUrl || "http://localhost:8000/api/metrics";
  let startMeasure = getCpuInfo();

  console.log(`🛡️  System Monitor SDK activated for project: ${config.projectId.substring(0,8)}...`);

  intervalId = setInterval(async () => {
    // Memory
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const memoryUsage = ((totalMem - freeMem) / totalMem) * 100;

    // CPU
    const endMeasure = getCpuInfo();
    const idleDifference = endMeasure.idle - startMeasure.idle;
    const totalDifference = endMeasure.total - startMeasure.total;
    let cpuUsage = 100 - ~~(100 * idleDifference / totalDifference);
    startMeasure = endMeasure;

    const payload = {
      project_id: config.projectId,
      cpu: cpuUsage,
      memory: memoryUsage,
      requests: Math.floor(Math.random() * 50), // In a real SDK, we'd hook into Express directly!
      errors: 0,
      timestamp: new Date().toISOString(),
    };

    try {
      await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } catch (e) {
      // Fail silently in the SDK so we don't crash the host server!
    }
  }, 3000);
}

function stop() {
  if (intervalId) clearInterval(intervalId);
}

// Export it as a standard Node.js module
module.exports = {
  start,
  stop
};
