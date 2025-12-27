// This is a stub. Later you connect it to a real judge API or container.
async function runCodeAgainstTests({ language, code, testCases }) {
  // TODO: integrate with actual judge (e.g., Docker, remote API)
  // For now, we simulate "all pass" with dummy timings.
  const results = testCases.map((tc) => ({
    input: tc.input,
    expectedOutput: tc.expectedOutput,
    actualOutput: tc.expectedOutput,
    passed: true,
    timeMs: 50,
    memoryMb: 32,
  }));

  const passedCount = results.filter((r) => r.passed).length;
  const totalCount = results.length;

  return {
    results,
    passedCount,
    totalCount,
    timeMs: 50,
    memoryMb: 32,
    complexityScore: 0.7,
    plagiarismScore: 0.0,
  };
}

module.exports = { runCodeAgainstTests };
