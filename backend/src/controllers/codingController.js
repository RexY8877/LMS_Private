const { awardProgress } = require("../services/progressService");

async function submitCode(req, res) {
  const { questionId, language, code } = req.body;
  const question = await CodingQuestion.findById(questionId);
  
  const judgeResult = await runCodeAgainstTests({
    language,
    code,
    testCases: question.testCases
  });

  // If student passes more than 80% of tests, award points!
  if ((judgeResult.passedCount / judgeResult.totalCount) >= 0.8) {
    await awardProgress(req.user._id, null, null, 'coding_success');
  }

  res.json(judgeResult);
}