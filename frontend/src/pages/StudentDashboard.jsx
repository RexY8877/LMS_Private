import React, { useEffect, useState } from 'react';
import axios from 'axios';
import CodeEditor from '../components/Coding/CodeEditor';

const StudentDashboard = () => {
  const [stats, setStats] = useState(null);
  const [recommendation, setRecommendation] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      // Fetch user stats (points, badges) and AI recommendations
      const [statsRes, recRes] = await Promise.all([
        axios.get('/api/users/profile', config),
        axios.get('/api/stats/readiness', config)
      ]);
      
      setStats(statsRes.data);
      setRecommendation(recRes.data);
    };
    fetchDashboardData();
  }, []);

  if (!stats) return <div className="p-10 text-white">Loading your journey...</div>;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Welcome back, {stats.name}! 👋</h1>
        <div className="flex gap-4">
          <div className="bg-yellow-600 px-4 py-2 rounded-lg font-bold">🏆 {stats.points} Points</div>
          <div className="bg-purple-600 px-4 py-2 rounded-lg font-bold">🏅 {stats.badges.length} Badges</div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: AI Career Path */}
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
          <h2 className="text-xl font-bold mb-4 text-cyan-400">🤖 AI Career Path</h2>
          {recommendation ? (
            <div>
              <p className="text-lg">Role: <span className="font-bold">{recommendation.suggestedRole}</span></p>
              <div className="w-full bg-gray-700 h-4 rounded-full mt-2">
                <div className="bg-cyan-500 h-4 rounded-full" style={{ width: `${recommendation.readinessScore}%` }}></div>
              </div>
              <p className="text-sm mt-1">Readiness: {recommendation.readinessScore}%</p>
              <h3 className="mt-4 font-bold">Action Plan:</h3>
              <ul className="list-disc ml-5 text-sm text-gray-400">
                {recommendation.actionPlan.map((step, i) => <li key={i}>{step}</li>)}
              </ul>
            </div>
          ) : <p>Analyzing your performance...</p>}
        </div>

        {/* Center/Right: Coding Arena */}
        <div className="lg:col-span-2">
          <h2 className="text-xl font-bold mb-4">💻 Latest Coding Challenge</h2>
          <CodeEditor questionId="current-daily-challenge" />
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;