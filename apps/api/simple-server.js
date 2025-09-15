const http = require('http');
const url = require('url');

const PORT = 3001;

// Mock data storage
let jobs = [];
let jobIdCounter = 1;

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': 'http://localhost:3000',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Credentials': 'true'
};

// Helper function to parse JSON body
function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        resolve(JSON.parse(body));
      } catch (error) {
        reject(error);
      }
    });
  });
}

// Helper function to send JSON response
function sendJSON(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    ...corsHeaders
  });
  res.end(JSON.stringify(data));
}

// Create server
const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const path = parsedUrl.pathname;
  const method = req.method;

  // Handle CORS preflight
  if (method === 'OPTIONS') {
    res.writeHead(200, corsHeaders);
    res.end();
    return;
  }

  try {
    // Health check
    if (path === '/api/health') {
      sendJSON(res, 200, { 
        status: 'OK', 
        message: 'Simple API server is running',
        jobsCount: jobs.length
      });
      return;
    }

    // Get all jobs
    if (path === '/api/jobs' && method === 'GET') {
      sendJSON(res, 200, {
        success: true,
        data: jobs,
        message: 'Jobs retrieved successfully'
      });
      return;
    }

    // Create new job
    if (path === '/api/jobs' && method === 'POST') {
      const jobData = await parseBody(req);
      
      // Validate required fields
      if (!jobData.title || !jobData.description || !jobData.budget) {
        sendJSON(res, 400, {
          success: false,
          message: 'Missing required fields: title, description, budget'
        });
        return;
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
      console.log('📊 Total jobs:', jobs.length);

      sendJSON(res, 201, {
        success: true,
        data: newJob,
        message: 'Job posted successfully'
      });
      return;
    }

    // Get job by ID
    if (path.startsWith('/api/jobs/') && method === 'GET') {
      const jobId = parseInt(path.split('/')[3]);
      const job = jobs.find(j => j.id === jobId);
      
      if (!job) {
        sendJSON(res, 404, {
          success: false,
          message: 'Job not found'
        });
        return;
      }

      sendJSON(res, 200, {
        success: true,
        data: job,
        message: 'Job retrieved successfully'
      });
      return;
    }

    // 404 for other routes
    sendJSON(res, 404, {
      success: false,
      message: 'Route not found'
    });

  } catch (error) {
    console.error('❌ Server error:', error);
    sendJSON(res, 500, {
      success: false,
      message: 'Internal server error'
    });
  }
});

// Start server
server.listen(PORT, '0.0.0.0', () => {
  console.log('🚀 Simple API Server is running on: http://localhost:3001');
  console.log('📋 Available endpoints:');
  console.log('   GET  /api/health - Health check');
  console.log('   GET  /api/jobs - Get all jobs');
  console.log('   POST /api/jobs - Create new job');
  console.log('   GET  /api/jobs/:id - Get job by ID');
  console.log('🌐 Server bound to: 0.0.0.0:3001');
  console.log('💡 This is a mock server - no database required!');
});
