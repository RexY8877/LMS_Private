const { GoogleGenAI } = require("@google/genai");
const genAI = new GoogleGenAI(process.env.GEMINI_API_KEY);

async function getCareerPath(studentData) {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `
    Analyze this student's performance for Placement Readiness:
    - Coding Score: ${studentData.codingAvg}/100
    - Soft Skills (Writing): ${studentData.softSkillAvg}/10
    - Points/Consistency: ${studentData.points}
    - Badges: ${studentData.badges.join(", ")}

    Provide a JSON response with:
    1. "readinessScore": (0-100)
    2. "suggestedRole": (e.g., Full Stack Dev, QA, Technical Consultant)
    3. "weakAreas": [List of topics to improve]
    4. "actionPlan": [3 specific steps]
  `;

  const result = await model.generateContent(prompt);
  return JSON.parse(result.response.text());
}

module.exports = { getCareerPath };