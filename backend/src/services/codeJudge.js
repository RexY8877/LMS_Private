const axios = require("axios");

// Language IDs for Judge0 (Common ones for your requirements)
const LANGUAGE_MAP = {
  python: 71, // Python (3.8.1)
  java: 62,   // Java (OpenJDK 13.0.1)
  cpp: 54,    // C++ (GCC 9.2.0)
  c: 50,      // C (GCC 9.2.0)
  javascript: 63, // Node.js (12.14.0)
};

async function runCodeAgainstTests({ language, code, testCases }) {
  const results = [];
  let totalPassed = 0;

  // Process each test case through Judge0
  for (const tc of testCases) {
    try {
      const response = await axios.post(
        `https://${process.env.JUDGE0_HOST}/submissions?wait=true&fields=*`,
        {
          source_code: Buffer.from(code).toString("base64"),
          language_id: LANGUAGE_MAP[language.toLowerCase()] || 71,
          stdin: Buffer.from(tc.input || "").toString("base64"),
          expected_output: Buffer.from(tc.expectedOutput || "").toString("base64"),
        },
        {
          headers: {
            "x-rapidapi-key": process.env.JUDGE0_API_KEY,
            "x-rapidapi-host": process.env.JUDGE0_HOST,
            "Content-Type": "application/json",
          },
        }
      );

      const output = response.data;
      const passed = output.status.id === 3; // Status ID 3 is "Accepted"

      results.push({
        input: tc.input,
        expectedOutput: tc.expectedOutput,
        actualOutput: output.stdout ? Buffer.from(output.stdout, "base64").toString() : "",
        error: output.stderr ? Buffer.from(output.stderr, "base64").toString() : null,
        passed: passed,
        timeMs: parseFloat(output.time) * 1000,
        memoryMb: output.memory / 1024,
      });

      if (passed) totalPassed++;
    } catch (err) {
      console.error("Judge0 Error:", err.response?.data || err.message);
      results.push({ passed: false, error: "Execution service error" });
    }
  }

  return {
    results,
    passedCount: totalPassed,
    totalCount: testCases.length,
    timeMs: results.reduce((acc, r) => acc + (r.timeMs || 0), 0) / results.length,
    memoryMb: results.reduce((acc, r) => acc + (r.memoryMb || 0), 0) / results.length,
    complexityScore: 0, // Placeholder for future static analysis
    plagiarismScore: 0,
  };
}

module.exports = { runCodeAgainstTests };