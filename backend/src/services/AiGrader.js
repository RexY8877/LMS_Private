// backend/src/services/aiGrader.js
const { GoogleGenAI } = require("@google/genai");

// Make sure GEMINI_API_KEY is in your backend/.env
const client = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

async function gradeSubjectiveQuestion({ questionText, rubric, answer, maxMarks }) {
  const systemPrompt = `
You are an experienced corporate trainer and examiner.
Grade the student's answer based only on the question, rubric and maximum marks.
Return ONLY valid JSON:

{
  "score": number,   // between 0 and maxMarks
  "feedback": string // short feedback, 2–4 bullet points
}
`;

  const userPrompt = `
Question: ${questionText}
Rubric: ${rubric || "Grade for clarity, correctness, depth and structure."}
Max marks: ${maxMarks}

Student answer:
${answer}
`;

  const result = await client.models.generateContent({
    model: "gemini-2.0-flash",
    contents: [
      { role: "user", parts: [{ text: systemPrompt + "\n\n" + userPrompt }] },
    ],
    generationConfig: {
      responseMimeType: "application/json",
    },
  });

  const text = result.response.candidates[0].content.parts[0].text;
  try {
    const parsed = JSON.parse(text);
    const score = Math.max(0, Math.min(Number(parsed.score) || 0, maxMarks));
    return {
      score,
      feedback: parsed.feedback || "",
    };
  } catch (err) {
    console.error("AI parse error:", err, text);
    return {
      score: 0,
      feedback: "AI grading failed – please review manually.",
    };
  }
}

module.exports = { gradeSubjectiveQuestion };
