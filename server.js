import express from 'express';
import cors from 'cors';
import { createProxyMiddleware } from 'http-proxy-middleware';

const app = express();
const PORT = process.env.PORT || 3001;

// Enable CORS for all routes
app.use(cors());

// Proxy middleware configuration
const streamProxy = createProxyMiddleware({
  target: (req) => {
    // Extract the original URL from the query parameter
    const originalUrl = req.query.url;
    if (!originalUrl) {
      throw new Error('No URL provided');
    }
    
    // Parse the URL to get the origin
    const urlObj = new URL(originalUrl);
    return `${urlObj.protocol}//${urlObj.host}`;
  },
  changeOrigin: true,
  pathRewrite: (path, req) => {
    // Extract the original URL and get the path
    const originalUrl = req.query.url;
    if (!originalUrl) return path;
    
    const urlObj = new URL(originalUrl);
    return urlObj.pathname + urlObj.search;
  },
  onProxyReq: (proxyReq, req, res) => {
    // Add User-Agent header
    proxyReq.setHeader('User-Agent', 'Lavf/56.15.102');
    
    // Copy other headers from the original request if needed
    if (req.headers['referer']) {
      proxyReq.setHeader('Referer', req.headers['referer']);
    }
  },
  onError: (err, req, res) => {
    console.error('Proxy error:', err);
    res.status(500).json({ error: 'Proxy error', message: err.message });
  },
  logLevel: 'debug'
});

// Proxy endpoint for streams
app.use('/api/stream', streamProxy);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Proxy server is running' });
});

app.listen(PORT, () => {
  console.log(`Proxy server running on port ${PORT}`);
  console.log(`Stream proxy endpoint: http://localhost:${PORT}/api/stream?url=<stream-url>`);
});
