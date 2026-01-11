// backend/src/services/judgeService.js (Implements code execution - WARNING: Use sandbox in prod)
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const runCodeAgainstTests = async ({ language, code, testCases }) => {
  // Write code to temp file
  const tempDir = path.join(__dirname, '../../temp');
  if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);
  const fileName = `code.${getExtension(language)}`;
  const filePath = path.join(tempDir, fileName);
  fs.writeFileSync(filePath, code);

  let passedCount = 0;
  const results = [];

  for (const test of testCases) {
    const input = test.input;
    const expected = test.expectedOutput;

    try {
      const output = await new Promise((resolve, reject) => {
        exec(`${getCompiler(language)} ${filePath}`, (error, stdout, stderr) => {
          if (error || stderr) reject(stderr || error);
          resolve(stdout.trim());
        });
      });
      const passed = output === expected;
      if (passed) passedCount++;
      results.push({ input, expected, output, passed });
    } catch (error) {
      results.push({ input, expected, error: error.message });
    }
  }

  fs.unlinkSync(filePath); // Cleanup
  return { passedCount, totalCount: testCases.length, results };
};

const getExtension = (lang) => {
  switch (lang) {
    case 'python': return 'py';
    case 'java': return 'java';
    // Add more
    default: return 'js';
  }
};

const getCompiler = (lang) => {
  switch (lang) {
    case 'python': return 'python';
    case 'java': return 'javac && java Main'; // Assume class Main
    default: return 'node';
  }
};

module.exports = { runCodeAgainstTests };