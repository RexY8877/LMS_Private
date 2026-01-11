// frontend/src/pages/Dashboard.jsx (Basic student dashboard)
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Dashboard = () => {
  const [profile, setProfile] = useState({});

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get('/api/reports/student', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setProfile(res.data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchProfile();
  }, []);

  return (
    <div>
      <h1>360° Skill Profile</h1>
      <p>Coding Score: {profile.coding?.score}</p>
      <p>Writing Score: {profile.writing?.grammar}</p>
      {/* Add more sections for reading, speaking, behavior, AI recommendations */}
    </div>
  );
};

export default Dashboard;