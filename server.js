import express from 'express';
import dotenv from 'dotenv';
import connectDB from './DB/db.js';
import cors from 'cors';

import MotherId from "./Routes/motherRoutes.js"
import { verifyToken } from "./Middleware/authMiddleware.js";

import PregnancyRecord from '/Controller/pregnancyController.js';
import Chat from "./Routes/chatbot.js"
import UploadFile from "./Routes/uploadefileRoutes.js"

const app = express();
const PORT =  process.env.PORT || 9000;

// Middleware 
app.use(cors());
app.use(express.json());
app.use(verifyToken);
dotenv.config();


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
