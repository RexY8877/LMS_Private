// backend/src/services/aiService.js (For AI feedback - Add OPENAI_API_KEY in .env)
const { GoogleGenAI } = require("@google/genai");
const genAI = new GoogleGenAI(process.env.GEMINI_API_KEY);
const getAIFeedback = async (type, input) => {
  const prompt = `Analyze this ${type} input: "${input}". Provide scores for grammar, coherence, etc., and suggestions.`;
  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [{ role: 'user', content: prompt }],
  });
  return response.choices[0].message.content; // Parse to scores/feedback
};

module.exports = { getAIFeedback };