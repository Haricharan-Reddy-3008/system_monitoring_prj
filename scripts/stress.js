const { Worker, isMainThread } = require('worker_threads');
const os = require('os');

if (isMainThread) {
  const coreCount = os.cpus().length;
  console.log(`🔥 Starting MASSIVE CPU Stress Test on all ${coreCount} cores...`);
  console.log(`⚠️  Your fans will spin up. Watch the dashboard spike!`);
  console.log(`🛑 Press Ctrl+C to stop the test.`);
  
  // Spawn a worker for every core your CPU has
  for (let i = 0; i < coreCount; i++) {
    new Worker(__filename);
  }
} else {
  // This runs in each worker thread, maxing out the core in an infinite loop
  while (true) {}
}
