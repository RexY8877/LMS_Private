import React, { useState } from 'react';
import axios from 'axios';

const ReadingTest = () => {
  const passage = "Digital transformation is the integration of digital technology into all areas of a business, fundamentally changing how you operate and deliver value to customers.";
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleSumbit = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    const { data } = await axios.post('/api/softskills/analyze', {
      type: 'reading',
      passage: passage,
      inputText: answer
    }, { headers: { Authorization: `Bearer ${token}` } });
    
    setResult(data);
    setLoading(false);
  };

  return (
    <div className="bg-slate-800 p-8 rounded-2xl text-white">
      <h2 className="text-2xl font-bold mb-4 text-orange-400">📖 Reading Comprehension</h2>
      <div className="bg-slate-900 p-4 rounded-lg mb-6 border-l-4 border-orange-500">
        <p className="text-lg italic">"{passage}"</p>
      </div>
      
      <label className="block mb-2 font-semibold">Summarize the passage in your own words:</label>
      <textarea 
        className="w-full h-32 bg-slate-700 p-4 rounded-xl mb-4 focus:ring-2 focus:ring-orange-500 outline-none"
        onChange={(e) => setAnswer(e.target.value)}
        placeholder="Type your summary here..."
      />

      <button 
        onClick={handleSumbit}
        className="w-full bg-orange-600 hover:bg-orange-700 py-3 rounded-xl font-bold transition-all"
        disabled={loading}
      >
        {loading ? "AI is Analyzing..." : "Submit Reading Test"}
      </button>

      {result && (
        <div className="mt-6 p-6 bg-orange-500/10 border border-orange-500/30 rounded-xl">
          <p className="text-xl">Score: <strong>{result.score}/10</strong></p>
          <p className="text-gray-400 mt-2">{result.feedback}</p>
        </div>
      )}
    </div>
  );
};