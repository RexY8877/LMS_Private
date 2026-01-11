// backend/src/services/aiSoftSkill.js
const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function analyzeSoftSkill(type, text) {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
  
  const prompts = {
    speaking: `Analyze the following interview transcript for fluency, confidence, and clarity. 
               Provide a score out of 10 and 2 sentences of professional feedback. 
               Return strictly JSON: {"score": 8, "feedback": "..."}
               Transcript: "${text}"`,
    writing: `Analyze this email/essay for professional tone and grammar...`
  };

  const result = await model.generateContent(prompts[type]);
  const response = await result.response;
  return JSON.parse(response.text());
}

module.exports = { analyzeSoftSkill };