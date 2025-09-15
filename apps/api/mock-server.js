const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
}));
app.use(express.json());

// Mock data storage
let jobs = [];
let jobIdCounter = 1;

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Mock API server is running' });
});

// Jobs endpoints
app.get('/api/jobs', (req, res) => {
  res.json({
    success: true,
    data: jobs,
    message: 'Jobs retrieved successfully'
  });
});

app.post('/api/jobs', (req, res) => {
  try {
    const jobData = req.body;
    
    // Validate required fields
    if (!jobData.title || !jobData.description || !jobData.budget) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: title, description, budget'
      });
    }

    // Create new job
    const newJob = {
      id: jobIdCounter++,
      ...jobData,
      status: 'open',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    jobs.push(newJob);

    console.log('✅ New job posted:', newJob.title);

    res.status(201).json({
      success: true,
      data: newJob,
      message: 'Job posted successfully'
    });
  } catch (error) {
    console.error('❌ Error posting job:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

app.get('/api/jobs/:id', (req, res) => {
  const jobId = parseInt(req.params.id);
  const job = jobs.find(j => j.id === jobId);
  
  if (!job) {
    return res.status(404).json({
      success: false,
      message: 'Job not found'
    });
  }

  res.json({
    success: true,
    data: job,
    message: 'Job retrieved successfully'
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log('🚀 Mock API Server is running on: http://localhost:3001');
  console.log('📋 Available endpoints:');
  console.log('   GET  /api/health - Health check');
  console.log('   GET  /api/jobs - Get all jobs');
  console.log('   POST /api/jobs - Create new job');
  console.log('   GET  /api/jobs/:id - Get job by ID');
  console.log('🌐 Server bound to: 0.0.0.0:3001');
});
