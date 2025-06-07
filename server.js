import express from 'express';

import connectDB from './src/db.js';
import cors from 'cors';

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

// Start the server
app.listen(PORT, async () => {
    await connectDB();
    console.log(`Server is running on http://localhost:${PORT}`);
});