// frontend/src/components/SoftSkills/WritingTest.jsx
import React, { useState } from 'react';
import axios from 'axios';

const WritingTest = () => {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [score, setScore] = useState(null);

  React.useEffect(() => {
    const fetchPrompt = async () => {
      try {
        const res = await axios.get('/api/softskills/writing/prompt');
        setPrompt(res.data.prompt);
      } catch (error) {
        console.error(error);
      }
    };
    fetchPrompt();
  }, []);

  const handleSubmit = async () => {
    try {
      const res = await axios.post('/api/softskills/writing/submit', { response });
      setScore(res.data.score);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <h2>Writing Skills Assessment</h2>
      <p>Prompt: {prompt}</p>
      <textarea value={response} onChange={(e) => setResponse(e.target.value)} />
      <button onClick={handleSubmit}>Submit</button>
      {score && <p>Your Score: {score.grammar} (Grammar), {score.coherence} (Coherence)</p>}
    </div>
  );
};

export default WritingTest;