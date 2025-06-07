// routes/pregnancyRoutes.js
import express from "express";

// Correct relative path: assuming this file is in src/Routes/
// and PregnancyController.js is in src/Controller/
import {
  createPregnancyRecord,
  predectlevel,
  saveAndPredict,
} from "../Controller/pregnancyController.js"; // ✅ Case-sensitive filename

const router = express.Router();

// Define routes
router.post("/post-record", createPregnancyRecord);
router.post("/predict", predectlevel);
router.post("/save-and-predict", saveAndPredict);

export default router;
