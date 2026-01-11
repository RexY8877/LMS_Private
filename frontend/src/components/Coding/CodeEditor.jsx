import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import axios from 'axios';

const CodeEditor = ({ questionId, defaultLanguage = "javascript" }) => {
  const [code, setCode] = useState("// Write your code here...");
  const [language, setLanguage] = useState(defaultLanguage);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
  setLoading(true);
  try {
    // Get token from storage (assuming you save it as 'token')
    const token = localStorage.getItem('token'); 

    const { data } = await axios.post(
      `/api/coding/submit`, 
      { questionId, language, code },
      {
        headers: {
          Authorization: `Bearer ${token}` // This is the missing "Key"
        }
      }
    );
    setResults(data);
  } catch (err) {
    console.error(err);
    alert(err.response?.data?.message || "Submission failed");
  }
  setLoading(false);
};

  return (
    <div className="flex flex-col h-full bg-gray-900 text-white p-4 rounded-lg">
      <div className="flex justify-between mb-2">
        <select 
          value={language} 
          onChange={(e) => setLanguage(e.target.value)}
          className="bg-gray-800 text-white p-2 rounded"
        >
          <option value="javascript">JavaScript</option>
          <option value="python">Python</option>
          <option value="java">Java</option>
        </select>
        <button 
          onClick={handleSubmit} 
          disabled={loading}
          className="bg-green-600 hover:bg-green-700 px-6 py-2 rounded font-bold"
        >
          {loading ? "Running..." : "Submit Code"}
        </button>
      </div>

      <Editor
        height="60vh"
        theme="vs-dark"
        language={language}
        value={code}
        onChange={(value) => setCode(value)}
      />

      {results && (
        <div className="mt-4 p-4 bg-gray-800 rounded">
          <h3 className="text-xl font-bold">Results: {results.passedCount}/{results.totalCount} Passed</h3>
          {results.results.map((res, i) => (
            <div key={i} className={`mt-2 ${res.passed ? 'text-green-400' : 'text-red-400'}`}>
              Test Case {i+1}: {res.passed ? "✅ Passed" : `❌ Failed: ${res.error || "Wrong Output"}`}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CodeEditor;