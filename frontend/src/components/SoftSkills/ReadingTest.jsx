// frontend/src/components/SoftSkills/ReadingTest.jsx
import React, { useState, useEffect, useCallback } from 'react'; // Added useCallback
import axios from 'axios';

const ReadingTest = () => {
  const [passage, setPassage] = useState('');
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [score, setScore] = useState(null);
  const [isTestStarted, setIsTestStarted] = useState(false);

  // Fetch test data (move before useEffect for clarity)
  useEffect(() => {
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

  // Move handleSubmit BEFORE the timer useEffect, and wrap in useCallback
  const handleSubmit = useCallback(async () => {
    try {
      const res = await axios.post('/api/softskills/reading/submit', { answers });
      setScore(res.data.score); // { comprehension, speed, etc. }
    } catch (error) {
      console.error('Error submitting reading test:', error);
    }
  }, [answers]); // Depend on answers (state it uses)

  // Timer useEffect (now after handleSubmit)
  useEffect(() => {
  let timer;
  if (isTestStarted && timeLeft > 0) {
    timer = setInterval(() => setTimeLeft(timeLeft - 1), 1000);
  } else if (timeLeft === 0) {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    handleSubmit();
  }
  return () => clearInterval(timer);
}, [isTestStarted, timeLeft, handleSubmit]);
    } else if (timeLeft === 0) {
      handleSubmit();
    }
    return () => clearInterval(timer);
  }, [isTestStarted, timeLeft, handleSubmit]); // Added handleSubmit to deps

  const handleStart = () => setIsTestStarted(true);

  const handleAnswerChange = (qId, answer) => {
    setAnswers({ ...answers, [qId]: answer });
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

export default ReadingTest;