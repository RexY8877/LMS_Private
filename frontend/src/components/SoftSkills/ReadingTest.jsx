import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const ReadingTest = () => {
  const [passage, setPassage] = useState('');
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [score, setScore] = useState(null);
  const [isTestStarted, setIsTestStarted] = useState(false);

  // Fetch passage & questions once on mount
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

  // Submit function (memoized)
  const handleSubmit = useCallback(async () => {
    try {
      const res = await axios.post('/api/softskills/reading/submit', { answers });
      setScore(res.data.score); // { comprehension, speed, etc. }
    } catch (error) {
      console.error('Error submitting reading test:', error);
    }
  }, [answers]);

  // Timer logic
  useEffect(() => {
    let timer;

    if (isTestStarted && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      handleSubmit();
    }

    return () => clearInterval(timer);
  }, [isTestStarted, timeLeft, handleSubmit]);

  const handleStart = () => setIsTestStarted(true);

  const handleAnswerChange = (qId, value) => {
    setAnswers((prev) => ({ ...prev, [qId]: value }));
  };

  return (
    <div>
      <h2>Reading Skills Assessment</h2>

      {!isTestStarted ? (
        <button onClick={handleStart}>Start Test</button>
      ) : (
        <>
          <p>Time Left: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</p>

          <div style={{ margin: '20px 0', whiteSpace: 'pre-wrap' }}>{passage}</div>

          {questions.map((q) => (
            <div key={q.id} style={{ margin: '15px 0' }}>
              <p>{q.text}</p>
              <input
                type="text"
                value={answers[q.id] || ''}
                onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                style={{ width: '100%', padding: '8px' }}
              />
            </div>
          ))}

          <button onClick={handleSubmit} style={{ marginTop: '20px' }}>
            Submit Early
          </button>
        </>
      )}

      {score && (
        <div style={{ marginTop: '30px', color: 'green' }}>
          <h3>Your Score:</h3>
          <p>Comprehension: {score.comprehension}</p>
          <p>Speed: {score.speed}</p>
        </div>
      )}
    </div>
  );
};

export default ReadingTest;