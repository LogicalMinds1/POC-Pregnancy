// // controllers/pregnancyController.js
// import PregnancyRecord from "../Model/prm.js";

// import fetch from "node-fetch"; 

// import { OpenAI } from "openai";

// import dotenv from "dotenv"
// dotenv.config();

// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY
// });
// const webhookUploadUrl =  "https://nutrition-j04e.onrender.com/trigger-n8n"
// //const webhookUploadUrl = process.env.WEBHOOK_UPLOAD_URL;
// const webhookRiskAlertUrl = process.env.WEBHOOK_RISK_ALERT_URL;
// const fastApiUrl = process.env.FASTAPI_PREDICT_URL;

// export const createPregnancyRecord = async (req, res) => {
//   try {
//     const motherId = req.motherId; 

//    const record = new PregnancyRecord({
//       ...req.body,
//       motherId,
//     });
//     const saved = await record.save();
//     res.status(201).json(saved);
//   } catch (err) {
//     res.status(400).json({ error: err.message });
//   }
// };

// //////////////////////////////////////////////////////////////////////////////

// // pregnancyController.js
// const basePrompt = `
// You are a medical data assistant. Use only the provided context below to answer the question.
// Do not use external knowledge or make assumptions.

// Context:
// Risk classification result: {risk}

// Question:
// Explain why the patient's pregnancy is classified as {risk} risk based on their characteristics below. Focus only on clinical reasoning and avoid general statements.

// Patient characteristics:
// {query}

// Response must be in two parts, separated by the line '---':
// 1. First part: Output a single word only — one of: Low, Medium, or High.
// 2. Second part: Provide a clear, clinical justification for classifying the pregnancy as {risk} risk.

// Format:
// Low/Medium/High
// ---
// Detailed explanation here...
// `;

// export const saveAndPredict = async (req, res) => {
//   try {
//     // Step 1: Validate motherId if saving to DB
//     if (!req.motherId) {
//       return res.status(400).json({
//         success: false,
//         message: "Mother ID missing in token.",
//       });
//     }

//     // Step 2: Convert boolean values to "Yes"/"No"
//     const convertedData = {};
//     for (const [key, value] of Object.entries(req.body)) {
//       convertedData[key] = typeof value === "boolean" ? (value ? "Yes" : "No") : value;
//     }

//     // Step 3: Add motherId for saving (only in DB)
//     convertedData.motherId = req.motherId;

//     // Step 4: Prepare prediction data (exclude motherId)
//     const { motherId, ...predictionData } = convertedData;

//     // Step 5: Call FastAPI for risk prediction
//     const fastApiResponse = await fetch(fastApiUrl, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(predictionData),
//     });

//     if (!fastApiResponse.ok) {
//       const errText = await fastApiResponse.text();
//       return res.status(fastApiResponse.status).json({
//         success: false,
//         message: "FastAPI error",
//         details: errText,
//       });
//     }

//     const fastApiResult = await fastApiResponse.json();
//     const riskLabel = fastApiResult?.risk_level || "Unknown";

//     // Step 6: Build OpenAI prompt
//     const promptWithContext = basePrompt
//       .replaceAll("{risk}", riskLabel)
//       .replace("{query}", JSON.stringify(predictionData, null, 2));

//     // Step 7: Get explanation from OpenAI
//     const openAIResponse = await openai.chat.completions.create({
//       model: "gpt-4o",
//       messages: [
//         { role: "system", content: "You are a medical assistant specialized in pregnancy risk evaluation." },
//         { role: "user", content: promptWithContext },
//       ],
//       temperature: 0.7,
//     });

//     const explanation = openAIResponse.choices[0].message.content;

//     // Step 8: Send webhook alerts
//     const payload = {
//       riskLabel,
//       explanation,
//       patientData: predictionData,
//       motherId: req.motherId,
//       source: "predict-api",
//     };

//     const webhookUrls = [webhookUploadUrl, webhookRiskAlertUrl];

//     const webhookResponsesRaw = await Promise.all(
//       webhookUrls
//         .filter(Boolean)
//         .map(url =>
//           fetch(url, {
//             method: "POST",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify(payload),
//           }).then(async res => ({
//             status: res.status,
//             ok: res.ok,
//             body: await res.text(),
//           })).catch(err => ({
//             status: 500,
//             ok: false,
//             body: `Error: ${err.message}`,
//           }))
//         )
//     );

//     // Step 9: Save to MongoDB (excluding URL in webhookResponses)
//     const record = new PregnancyRecord({
//       ...convertedData,
//       prediction: fastApiResult,
//       explanation,
//       webhookResponses: webhookResponsesRaw,
//     });

//     const savedRecord = await record.save();

//     // Step 10: Respond to client
//     return res.status(201).json({
//       success: true,
//       message: "Record saved, prediction completed, explanation generated",
//       record: savedRecord,
//       prediction: fastApiResult,
//       explanation,
//       webhookResponses: webhookResponsesRaw,
//     });

//   } catch (error) {
//     console.error("Error in saveAndPredict:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Internal server error",
//       ...(process.env.NODE_ENV === "development" && { details: error.stack }),
//     });
//   }
// };


// //////////////////////////////////////////////////// 

// export const predectlevel = async (req,res)=>{
//   try {
//     const input = req.body;
    
//     if (!input || typeof input !== "object") {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid input. Expected a JSON object.",
//       });
//     }
//     // const fastApiUrl = process.env.FASTAPI_URL
//     const fastApiUrl ="https://4287-157-20-251-15.ngrok-free.app/predict/";

//     const response = await fetch(fastApiUrl, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(input),
//     });

//     if (!response.ok) {
//       const errorText = await response.text();
//       console.error("FastAPI Error:", errorText);
//       return res.status(response.status).json({
//         success: false,
//         message: "Error from FastAPI backend",
//         details: errorText,
//       });
//     }

//     const result = await response.json();
//     res.status(200).json({ success: true, data: result });
//   } catch (error) {
//     console.error("Prediction error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Internal server error during prediction",
//       error: error.message,
//     });
//   }
// };
// controllers/pregnancyController.js




// import PregnancyRecord from "../Model/prm.js";
// import axios from "axios";

// import fetch from "node-fetch";

// import { OpenAI } from "openai";

// import dotenv from "dotenv";
// dotenv.config();

// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY,
// });
// //const webhookUploadUrl = "https://nutrition-j04e.onrender.com/trigger-n8n";
// const webhookUploadUrl = process.env.WEBHOOK_UPLOAD_URL ;
// const webhookRiskAlertUrl = process.env.WEBHOOK_RISK_ALERT_URL;
// const fastApiUrl = process.env.FASTAPI_PREDICT_URL;

// export const createPregnancyRecord = async (req, res) => {
//   try {
//     const motherId = req.motherId;

//     const record = new PregnancyRecord({
//       ...req.body,
//       motherId,
//     });
//     const saved = await record.save();
//     res.status(201).json(saved);
//   } catch (err) {
//     res.status(400).json({ error: err.message });
//   }
// };

// //////////////////////////////////////////////////////////////////////////////

// // pregnancyController.js
// const basePrompt = `
// You are a medical data assistant. Use only the provided context below to answer the question.
// Do not use external knowledge or make assumptions.

// Context:
// Risk classification result: {risk}

// Question:
// Explain why the patient's pregnancy is classified as {risk} risk based on their characteristics below. Focus only on clinical reasoning and avoid general statements.

// Patient characteristics:
// {query}

// Response must be in two parts, separated by the line '---':
// 1. First part: Output a single word only — one of: Low, Medium, or High.
// 2. Second part: Provide a clear, clinical justification for classifying the pregnancy as {risk} risk.

// Format:
// Low/Medium/High
// ---
// Detailed explanation here...
// `;

// export const saveAndPredict = async (req, res) => {
//   try {
//     // Step 1: Validate motherId if saving to DB
//     if (!req.motherId) {
//       return res.status(400).json({
//         success: false,
//         message: "Mother ID missing in token.",
//       });
//     }

//     // Step 2: Convert boolean values to "Yes"/"No"
//     const convertedData = {};
//     for (const [key, value] of Object.entries(req.body)) {
//       convertedData[key] =
//         typeof value === "boolean" ? (value ? "Yes" : "No") : value;
//     }

//     // Step 3: Add motherId for saving (only in DB)
//     convertedData.motherId = req.motherId;

//     // Step 4: Prepare prediction data (exclude motherId)
//     const { motherId, ...predictionData } = convertedData;

//     // Step 5: Call FastAPI for risk prediction
//     const fastApiResponse = await fetch(fastApiUrl, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(predictionData),
//     });

//     if (!fastApiResponse.ok) {
//       const errText = await fastApiResponse.text();
//       return res.status(fastApiResponse.status).json({
//         success: false,
//         message: "FastAPI error",
//         details: errText,
//       });
//     }

//     const fastApiResult = await fastApiResponse.json();
//     const riskLabel = fastApiResult?.risk_level || "Unknown";

//     // Step 6: Build OpenAI prompt
//     const promptWithContext = basePrompt
//       .replaceAll("{risk}", riskLabel)
//       .replace("{query}", JSON.stringify(predictionData, null, 2));

//     // Step 7: Get explanation from OpenAI
//     const openAIResponse = await openai.chat.completions.create({
//       model: "gpt-4o",
//       messages: [
//         {
//           role: "system",
//           content:
//             "You are a medical assistant specialized in pregnancy risk evaluation.",
//         },
//         { role: "user", content: promptWithContext },
//       ],
//       temperature: 0.7,
//     });

//     const explanation = openAIResponse.choices[0].message.content;

//     // Step 8: Send webhook alerts
//     const payload = {
//       riskLabel,
//       explanation,
//       patientData: predictionData,
//       motherId: req.motherId,
//       source: "predict-api",
//     };

//     const webhookUrls = [webhookUploadUrl, webhookRiskAlertUrl];

//     const webhookResponsesRaw = await Promise.all(
//       webhookUrls.filter(Boolean).map(async (url) => {
//         try {
//           const response = await axios.post(url, payload, {
//             headers: { "Content-Type": "application/json" },
//           });
//           return {
//             status: response.status,
//             ok: true,
//             body: JSON.stringify(response.data),
//           };
//         } catch (err) {
//           return {
//             status: err.response?.status || 500,
//             ok: false,
//             body: `Error: ${err.message}`,
//           };
//         }
//       })
//     );

//     // Step 9: Save to MongoDB (excluding URL in webhookResponses)
//     const record = new PregnancyRecord({
//       ...convertedData,
//       prediction: fastApiResult,
//       explanation,
//       webhookResponses: webhookResponsesRaw,
//     });

//     const savedRecord = await record.save();

//     // Step 10: Respond to client
//     return res.status(201).json({
//       success: true,
//       message: "Record saved, prediction completed, explanation generated",
//       record: savedRecord,
//       prediction: fastApiResult,
//       explanation,
//       webhookResponses: webhookResponsesRaw,
//     });
//   } catch (error) {
//     console.error("Error in saveAndPredict:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Internal server error",
//       ...(process.env.NODE_ENV === "development" && { details: error.stack }),
//     });
//   }
// };

// ////////////////////////////////////////////////////

// export const predectlevel = async (req, res) => {
//   try {
//     const input = req.body;

//     if (!input || typeof input !== "object") {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid input. Expected a JSON object.",
//       });
//     }
//     // const fastApiUrl = process.env.FASTAPI_URL
//     const fastApiUrl = "https://4287-157-20-251-15.ngrok-free.app/predict/";

//     const response = await fetch(fastApiUrl, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(input),
//     });

//     if (!response.ok) {
//       const errorText = await response.text();
//       console.error("FastAPI Error:", errorText);
//       return res.status(response.status).json({
//         success: false,
//         message: "Error from FastAPI backend",
//         details: errorText,
//       });
//     }

//     const result = await response.json();
//     res.status(200).json({ success: true, data: result });
//   } catch (error) {
//     console.error("Prediction error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Internal server error during prediction",
//       error: error.message,
//     });
//   }
// };




import PregnancyRecord from "../Model/prm.js";
import axios from "axios";
import fetch from "node-fetch";
import { OpenAI } from "openai";
import dotenv from "dotenv";
dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const webhookUploadUrl = process.env.WEBHOOK_UPLOAD_URL;
const webhookRiskAlertUrl = process.env.WEBHOOK_RISK_ALERT_URL;
const fastApiUrl = process.env.FASTAPI_PREDICT_URL;

// Create Pregnancy Record only
export const createPregnancyRecord = async (req, res) => {
  try {
    const motherId = req.motherId;
    const record = new PregnancyRecord({ ...req.body, motherId });
    const saved = await record.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Prompt Template for OpenAI
const basePrompt = `
You are a medical data assistant. Use only the provided context below to answer the question.
Do not use external knowledge or make assumptions.

Context:
Risk classification result: {risk}

Question:
Explain why the patient's pregnancy is classified as {risk} risk based on their characteristics below. Focus only on clinical reasoning and avoid general statements.

Patient characteristics:
{query}

Response must be in two parts, separated by the line '---':
1. First part: Output a single word only — one of: Low, Medium, or High.
2. Second part: Provide a clear, clinical justification for classifying the pregnancy as {risk} risk.

Format:
Low/Medium/High
---
Detailed explanation here...
`;

// Predict and Save Record
export const saveAndPredict = async (req, res) => {
  try {
    if (!req.motherId) {
      return res.status(400).json({
        success: false,
        message: "Mother ID missing in token.",
      });
    }

    // Convert boolean to "Yes"/"No"
    const convertedData = {};
    for (const [key, value] of Object.entries(req.body)) {
      convertedData[key] = typeof value === "boolean" ? (value ? "Yes" : "No") : value;
    }

    convertedData.motherId = req.motherId;
    const { motherId, ...predictionData } = convertedData;

    // FastAPI Prediction
    const fastApiResponse = await fetch(fastApiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(predictionData),
    });

    if (!fastApiResponse.ok) {
      const errText = await fastApiResponse.text();
      return res.status(fastApiResponse.status).json({
        success: false,
        message: "FastAPI error",
        details: errText,
      });
    }

    const fastApiResult = await fastApiResponse.json();
    const riskLabel = fastApiResult?.risk_level || "Unknown";

    // Build OpenAI Prompt
    const promptWithContext = basePrompt
      .replaceAll("{risk}", riskLabel)
      .replace("{query}", JSON.stringify(predictionData, null, 2));

    const openAIResponse = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "You are a medical assistant specialized in pregnancy risk evaluation." },
        { role: "user", content: promptWithContext },
      ],
      temperature: 0.7,
    });

    const explanation = openAIResponse.choices[0].message.content;

    // Send Webhooks (optional)
    const payload = {
      riskLabel,
      explanation,
      patientData: predictionData,
      motherId: req.motherId,
      source: "predict-api",
    };

    const webhookUrls = [webhookUploadUrl, webhookRiskAlertUrl];
    const webhookResponsesRaw = await Promise.all(
      webhookUrls.filter(Boolean).map(async (url) => {
        try {
          const response = await axios.post(url, payload, {
            headers: { "Content-Type": "application/json" },
          });
          return {
            status: response.status,
            ok: true,
            body: JSON.stringify(response.data),
          };
        } catch (err) {
          return {
            status: err.response?.status || 500,
            ok: false,
            body: `Error: ${err.message}`,
          };
        }
      })
    );

    // Save Record
    const record = new PregnancyRecord({
      ...convertedData,
      prediction: fastApiResult,
      explanation,
      webhookResponses: webhookResponsesRaw,
    });

    const savedRecord = await record.save();

    return res.status(201).json({
      success: true,
      message: "Record saved, prediction completed, explanation generated",
      record: savedRecord,
      prediction: fastApiResult,
      explanation,
      webhookResponses: webhookResponsesRaw,
    });
  } catch (error) {
    console.error("Error in saveAndPredict:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error:error.message
      // ...(process.env.NODE_ENV === "development" && { details: error.stack }),
    });
  }
};

// Predict Only (FastAPI)
export const predectlevel = async (req, res) => {
  try {
    const input = req.body;

    if (!input || typeof input !== "object") {
      return res.status(400).json({
        success: false,
        message: "Invalid input. Expected a JSON object.",
      });
    }

    const response = await fetch(fastApiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("FastAPI Error:", errorText);
      return res.status(response.status).json({
        success: false,
        message: "Error from FastAPI backend",
        details: errorText,
      });
    }

    const result = await response.json();
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error("Prediction error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error during prediction",
      error: error.message,
    });
  }
};
