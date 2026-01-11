// frontend/src/components/SoftSkills/ReadingTest.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios'; // For API calls to backend

const ReadingTest = () => {
  const [passage, setPassage] = useState(''); // Fetch or hardcode passage
  const [questions, setQuestions] = useState([]); // Array of questions
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes timer
  const [score, setScore] = useState(null);
  const [isTestStarted, setIsTestStarted] = useState(false);

  useEffect(() => {
    // Fetch passage and questions from backend (e.g., pre-defined or AI-generated)
    const fetchTest = async () => {
      try {
        const res = await axios.get('/api/softskills/reading/test');
        setPassage(res.data.passage);
        setQuestions(res.data.questions);
      } catch (error) {
        console.error('Error fetching reading test:', error);
      }
    };
    fetchTest();
  }, []);

  useEffect(() => {
    let timer;
    if (isTestStarted && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft(timeLeft - 1), 1000);
    } else if (timeLeft === 0) {
      handleSubmit();
    }
    return () => clearInterval(timer);
  }, [isTestStarted, timeLeft]);

  const handleStart = () => setIsTestStarted(true);

  const handleAnswerChange = (qId, answer) => {
    setAnswers({ ...answers, [qId]: answer });
  };

  const handleSubmit = async () => {
    try {
      const res = await axios.post('/api/softskills/reading/submit', { answers });
      setScore(res.data.score); // Includes comprehension, speed, etc.
    } catch (error) {
      console.error('Error submitting reading test:', error);
    }
  };

  return (
    <div>
      <h2>Reading Skills Assessment</h2>
      {!isTestStarted ? (
        <button onClick={handleStart}>Start Test</button>
      ) : (
        <>
          <p>Time Left: {Math.floor(timeLeft / 60)}:{timeLeft % 60}</p>
          <div>{passage}</div>
          {questions.map((q, i) => (
            <div key={i}>
              <p>{q.text}</p>
              <input
                type="text"
                onChange={(e) => handleAnswerChange(q.id, e.target.value)}
              />
            </div>
          ))}
          <button onClick={handleSubmit}>Submit</button>
        </>
      )}
      {score && <p>Your Score: {score.comprehension} (Comprehension), {score.speed} (Speed)</p>}
    </div>
  );
};

export default ReadingTest; // Fixed: Added export for React Refresh