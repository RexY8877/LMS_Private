import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';

const SpeakingTest = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const recognitionRef = useRef(null);

  // Cleanup: Stop microphone if user navigates away
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const initRecognition = () => {
    if (recognitionRef.current) return recognitionRef.current;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Browser not supported. Please use Chrome.");
      return null;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => setIsRecording(true);
    recognition.onend = () => setIsRecording(false);
    
    recognition.onerror = (event) => {
      console.error("Speech Recognition Error:", event.error);
      setIsRecording(false);
    };

    recognition.onresult = (event) => {
      let current = '';
      for (let i = 0; i < event.results.length; i++) {
        current += event.results[i][0].transcript;
      }
      setTranscript(current);
    };

    recognitionRef.current = recognition;
    return recognition;
  };

  const handleToggle = () => {
    const recognition = initRecognition();
    if (!recognition) return;

    if (isRecording) {
      recognition.stop();
    } else {
      try {
        setTranscript(""); 
        setFeedback(null);
        recognition.start();
      } catch (err) {
        console.warn("Recognition already active.");
        setIsRecording(true);
      }
    }
  };

  const analyzeSpeech = async () => {
    if (!transcript) return;
    setIsAnalyzing(true);
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.post('/api/softskills/analyze', {
        type: 'speaking',
        inputText: transcript
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFeedback(data);
    } catch (err) {
      console.error("Analysis Error:", err);
      alert("AI Analysis failed. Ensure your Gemini API Key is set in the backend.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="bg-gray-900 border border-gray-800 p-8 rounded-3xl shadow-2xl max-w-2xl mx-auto text-white">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-black tracking-tight">AI MOCK INTERVIEW</h2>
        {isRecording && (
          <div className="flex items-center gap-2 text-red-500 text-sm font-bold animate-pulse">
            <span className="h-3 w-3 rounded-full bg-red-500"></span>
            LIVE RECORDING
          </div>
        )}
      </div>

      <div className="relative mb-6">
        <div className="w-full h-48 bg-gray-950 rounded-2xl p-6 overflow-y-auto border border-gray-800 text-gray-300 text-lg leading-relaxed">
          {transcript || <span className="text-gray-600 italic">"Tell me about a time you solved a complex technical problem..."</span>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <button 
          onClick={handleToggle}
          className={`py-4 rounded-xl font-bold transition-all ${
            isRecording 
            ? 'bg-red-500 text-white shadow-lg shadow-red-500/20' 
            : 'bg-indigo-600 text-white hover:bg-indigo-700'
          }`}
        >
          {isRecording ? "⏹ Stop Mic" : "🎤 Start Speaking"}
        </button>

        <button 
          onClick={analyzeSpeech}
          disabled={isRecording || !transcript || isAnalyzing}
          className="bg-emerald-600 disabled:bg-gray-800 disabled:text-gray-600 text-white py-4 rounded-xl font-bold transition-all"
        >
          {isAnalyzing ? "AI is Thinking..." : "🔍 Get Feedback"}
        </button>
      </div>

      {feedback && (
        <div className="mt-8 p-6 bg-indigo-600/10 border border-indigo-500/20 rounded-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex justify-between items-center mb-4">
            <p className="text-indigo-400 text-sm font-bold uppercase">Interview Score</p>
            <p className="text-4xl font-black text-white">{feedback.score}<span className="text-lg text-gray-500">/10</span></p>
          </div>
          <p className="text-gray-400 leading-relaxed italic border-t border-gray-800 pt-4 mt-2">
            "{feedback.feedback}"
          </p>
        </div>
      )}
    </div>
  );
};

export default SpeakingTest;