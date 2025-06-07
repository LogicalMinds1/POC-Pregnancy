import express from 'express';

import connectDB from './src/db.js';
import cors from 'cors';
import { createProxyMiddleware } from 'http-proxy-middleware';
import MotherId from "./src/Routes/mo.js"
import { verifyToken } from "./src/Middleware/authMiddleware.js";

import PregnancyRecord from './src/Routes/pre.js';
import Chat from "./src/Routes/Chatbot.js"
import UploadFile from "./src/Routes/up.js"
import dotenv from "dotenv"
dotenv.config();



const app = express();
const PORT =  process.env.PORT || 8000;

// Middleware 
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(verifyToken);



//Routes
app.use('/', MotherId);
app.use('/', PregnancyRecord);
app.use('/', Chat);
app.use('/', UploadFile);


const n8nProxy = createProxyMiddleware({
  target: 'https://n8n.srv795087.hstgr.cloud',
  changeOrigin: true,
  pathRewrite: {'^/n8n-proxy' : ''},
  secure: false,
  onProxyReq: (proxyReq, req) => {
    // Add n8n API key header
    proxyReq.setHeader('X-N8N-API-KEY', process.env.N8N_API_KEY);
    
    // Add content-type if missing
    if (!proxyReq.getHeader('Content-Type')) {
      proxyReq.setHeader('Content-Type', 'application/json');
    }
    
    // Log for debugging
    console.log(`Proxying to n8n: ${req.originalUrl}`);
  }
});

app.use('/n8n-proxy', n8nProxy);
// Start the server
app.listen(PORT, async () => {
    await connectDB();
    console.log(`Server is running on http://localhost:${PORT}`);
});