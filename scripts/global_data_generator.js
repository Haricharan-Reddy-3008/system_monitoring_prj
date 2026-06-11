const fs = require('fs');
const path = require('path');
const os = require('os');

// Path to the .env file in the backend directory
const dotenvPath = path.resolve(__dirname, '../backend/.env');

// Simple .env parser to avoid requiring external packages
function loadEnv() {
    try {
        const content = fs.readFileSync(dotenvPath, 'utf8');
        const lines = content.split('\n');
        for (const line of lines) {
            const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
            if (match) {
                const key = match[1];
                let value = match[2] || '';
                // Remove quotes if present
                if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
                process.env[key] = value;
            }
        }
    } catch (err) {
        console.error('❌ Could not read .env file at:', dotenvPath);
        process.exit(1);
    }
}

loadEnv();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY; // Service role key
const API_URL = "http://localhost:8000/api/metrics";
const LOG_API_URL = "http://localhost:8000/api/logs";

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('❌ Missing SUPABASE_URL or SUPABASE_KEY in backend/.env');
    process.exit(1);
}

console.log('🚀 Starting Global Data Generator...');
console.log('📡 Connected to Supabase:', SUPABASE_URL);

let activeProjects = new Set();
let heartbeatCount = 0;

function randomBetween(min, max) {
    return Math.random() * (max - min) + min;
}

function getSystemMetrics() {
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const memoryUsage = ((totalMem - freeMem) / totalMem) * 100;

    // Simulate occasional spikes
    heartbeatCount++;
    let cpuUsage;
    if (heartbeatCount % 10 === 0) {
        cpuUsage = randomBetween(85, 95);
    } else {
        const load = os.loadavg()[0];
        cpuUsage = load > 0 ? Math.min(load * 10, 100) : Math.random() * 20 + 10;
    }

    return { cpu: cpuUsage, memory: memoryUsage };
}

async function sendDataForProject(projectId) {
    const metrics = getSystemMetrics();
    const timestamp = new Date().toISOString();

    const metricsPayload = {
        project_id: projectId,
        cpu: metrics.cpu,
        memory: metrics.memory,
        requests: Math.floor(Math.random() * 200 + 40),
        errors: Math.random() > 0.9 ? Math.floor(Math.random() * 5) : 0,
        timestamp: timestamp
    };

    try {
        // 1. Send Metrics
        await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(metricsPayload)
        });

        // 2. Send logs occasionally (50% chance)
        if (Math.random() > 0.5) {
            const logs = [
                { level: 'INFO', message: `Background check: CPU at ${metrics.cpu.toFixed(1)}%` },
                { level: 'INFO', message: 'User request processed' },
                { level: 'WARN', message: 'Suboptimal latency detected' },
                { level: 'INFO', message: 'Health check passed' }
            ];
            
            // If CPU is high, send an error log
            if (metrics.cpu > 80) {
                logs.push({ level: 'ERROR', message: 'Critical resource exhaustion detected' });
            }

            const log = logs[Math.floor(Math.random() * logs.length)];
            await fetch(LOG_API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    project_id: projectId,
                    timestamp: timestamp,
                    ...log
                })
            });
        }
    } catch (error) {
        // Silently skip if backend is down
    }
}

async function refreshProjects() {
    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/projects?select=id,name`, {
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`
            }
        });
        const projects = await response.json();
        
        const currentIds = new Set(projects.map(p => p.id));
        
        // Find new projects
        for (const project of projects) {
            if (!activeProjects.has(project.id)) {
                console.log(`✨ Discovered new project: ${project.name} (${project.id})`);
                activeProjects.add(project.id);
            }
        }
        
        // Remove deleted projects
        for (const id of activeProjects) {
            if (!currentIds.has(id)) {
                activeProjects.delete(id);
            }
        }
    } catch (error) {
        console.error('⚠️ Could not refresh project list from Supabase:', error.message);
    }
}

// Main Loop
async function run() {
    await refreshProjects();
    
    // Refresh project list every 30 seconds
    setInterval(refreshProjects, 30000);
    
    // Send data for all active projects every 5 seconds
    setInterval(async () => {
        const tasks = Array.from(activeProjects).map(id => sendDataForProject(id));
        await Promise.all(tasks);
        if (activeProjects.size > 0) {
            console.log(`✅ [${new Date().toLocaleTimeString()}] Sent heartbeats to ${activeProjects.size} projects`);
        }
    }, 5000);
}

run();
