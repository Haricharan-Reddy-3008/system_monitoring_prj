// 1. They import standard Express for their web server
const express = require('express');

// 2. THEY IMPORT YOUR SDK AS AN EXTENSION!
const monitor = require('./system-monitor-sdk'); 

const app = express();

// 3. They activate your agent with their unique Project ID
monitor.start({ 
  projectId: "YOUR_PROJECT_ID_HERE", 
  apiUrl: "http://localhost:8000/api/metrics" // Only needed for local testing
});

// ... their normal company code below ...
app.get('/', (req, res) => {
  res.send('Welcome to the generic company API!');
});

app.listen(3000, () => {
  console.log('Company server running on port 3000');
});
