const { GoogleGenAI } = require("@google/genai");

const client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function analyzeWriting(inputText) {
  const prompt = `
Analyze this writing sample for grammar, coherence, structure, vocabulary and tone.
Return JSON with fields:
grammar, coherence, structure, vocabulary, tone (0-10),
and feedback string.
Text:
${inputText}
`;
  const result = await client.models.generateContent({
    model: "gemini-2.0-flash",
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: { responseMimeType: "application/json" },
  });

  return JSON.parse(result.response.candidates[0].content.parts[0].text);
}

// For reading & speaking you can create similar helpers later.
module.exports = { analyzeWriting };
