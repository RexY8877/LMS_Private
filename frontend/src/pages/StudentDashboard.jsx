// frontend/src/pages/StudentDashboard.jsx
import React, { useContext } from "react";
import { AuthContext } from "../AuthContext";

const StudentDashboard = () => {
  const { user } = useContext(AuthContext);

  return (
    <div>
      <h2>Student Dashboard</h2>
      <p>Welcome, {user?.name}</p>
      <p>Soon you will see:</p>
      <ul>
        <li>Enrolled courses</li>
        <li>Upcoming exams</li>
        <li>Your scores & AI feedback</li>
      </ul>
    </div>
  );
};

export default StudentDashboard;
