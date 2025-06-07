// import express from 'express';
// import dotenv from 'dotenv';
// import connectDB from './src/db.js';
// import cors from 'cors';

// // import MotherId from "./src/Routes/motherRoutes.js"
// import { verifyToken } from "./src/Middleware/authMiddleware.js";

// import PregnancyRecord from './src/Routes/pregnancyRoutes.js';
// import Chat from "./src/Routes/chatbot.js"
// import UploadFile from "./src/Routes/uploadefileRoutes.js"

// const app = express();
// const PORT =  process.env.PORT || 9000;

// // Middleware 
// app.use(cors());
// app.use(express.json());
// app.use(verifyToken);
// dotenv.config();


// //Routes
// // app.use('/', MotherId);
// app.use('/', PregnancyRecord);
// app.use('/', Chat);
// app.use('/', UploadFile);

// // Start the server
// app.listen(PORT, async () => {
//     await connectDB();
//     console.log(`Server is running on http://localhost:${PORT}`);
// });




import express from 'express';
import dotenv from 'dotenv';
import connectDB from './src/db.js';
import cors from 'cors';
import multer from 'multer';

// Controllers
import { registerMother, loginMother } from './src/Controller/motherController.js';
import { createPregnancyRecord, predectlevel, saveAndPredict } from './src/Controller/pregnancyController.js';
import { handleChat, getChatHistory } from './src/Controller/chatController.js';
import { uploadFile } from './src/Controller/uploadeFilecontroller.js';

// Middleware
import { verifyToken } from './src/Middleware/authMiddleware.js';

dotenv.config(); // Load environment variables

const app = express();
const PORT = process.env.PORT || 9000;

// Multer setup
const upload = multer({ dest: 'uploads/' });

// Core Middleware
app.use(cors());
app.use(express.json());

// ----------- Public Routes -----------
app.post('/reg-mother', registerMother);
app.post('/motherlogin', loginMother);

// ----------- Protected Routes (Requires Token) -----------
app.post('/pregnancy/post-record', verifyToken, createPregnancyRecord);
app.post('/pregnancy/predict', verifyToken, predectlevel);
app.post('/pregnancy/save-and-predict', verifyToken, saveAndPredict);

app.post('/chat', verifyToken, handleChat);
app.get('/chat/history', verifyToken, getChatHistory);

app.post('/upload-test', verifyToken, upload.single('file'), uploadFile);

// ----------- Start Server -----------
app.listen(PORT, async () => {
  await connectDB();
  console.log(`✅ Server is running on http://localhost:${PORT}`);
});