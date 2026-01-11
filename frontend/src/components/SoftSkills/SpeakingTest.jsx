// frontend/src/components/SoftSkills/SpeakingTest.jsx
import React, { useState, useEffect, useCallback } from 'react'; // Added useCallback
import { ReactMic } from 'react-mic';
import axios from 'axios';

const SpeakingTest = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [prompt, setPrompt] = useState('');
  const [score, setScore] = useState(null);

  // Fetch prompt
  useEffect(() => {
    const fetchPrompt = async () => {
      try {
        const res = await axios.get('/api/softskills/speaking/prompt');
        setPrompt(res.data.prompt);
      } catch (error) {
        console.error('Error fetching prompt:', error);
      }
    };
    fetchPrompt();
  }, []);

  const startRecording = () => setIsRecording(true);

  const stopRecording = () => setIsRecording(false);

  const onStop = (recordedBlob) => {
    setAudioBlob(recordedBlob);
  };

  // Move handleSubmit to top, wrap in useCallback (no timer here, per requirements)
  const handleSubmit = useCallback(async () => {
    if (!audioBlob) return;
    const formData = new FormData();
    formData.append('audio', audioBlob.blob, 'speaking.wav');

    try {
      const res = await axios.post('/api/softskills/speaking/submit', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setScore(res.data.score); // { pronunciation, fluency, etc. }
    } catch (error) {
      console.error('Submission error:', error);
    }
  }, [audioBlob]); // Depend on audioBlob

  return (
    <div>
      <h2>Speaking Skills Assessment</h2>
      <p>Prompt: {prompt}</p>
      <button onClick={startRecording} disabled={isRecording}>Start Recording</button>
      <button onClick={stopRecording} disabled={!isRecording}>Stop Recording</button>
      <ReactMic
        record={isRecording}
        className="sound-wave"
        onStop={onStop}
        strokeColor="#000000"
        backgroundColor="white"
      />
      <button onClick={handleSubmit}>Submit Audio</button>
      {score && <p>Your Score: {score.pronunciation} (Pronunciation), {score.fluency} (Fluency)</p>}
    </div>
  );
};

export default SpeakingTest;