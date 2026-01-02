// backend/src/services/aiSoftSkill.js
const { GoogleGenAI } = require("@google/genai");
const client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function analyzeSoftSkill(type, inputText, promptContext) {
  const model = client.getGenerativeModel({ model: "gemini-1.5-flash" });

  const systemPrompts = {
    writing: "Analyze writing for grammar, tone, and professional structure.",
    reading: "Analyze if the student understood the core concepts and nuances of the provided text.",
    speaking: "Analyze the transcript for fluency, confidence, and filler word usage (ums/ahs)."
  };

  const prompt = `
    Task: ${systemPrompts[type]}
    Context: ${promptContext || "General professional communication"}
    Student Text: ${inputText}
    Return ONLY JSON with scores (0-10) for: clarity, professionalism, and logic, plus a 'feedback' string.
  `;

  const result = await model.generateContent(prompt);
  return JSON.parse(result.response.text());
}

module.exports = { analyzeSoftSkill };