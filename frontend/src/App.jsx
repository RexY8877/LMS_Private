// frontend/src/App.jsx
import React, { useContext } from "react";
import { Routes, Route, Navigate, Link } from "react-router-dom";
import { AuthContext } from "./AuthContext";
import TrainerLogin from "./pages/TrainerLogin";
import StudentLogin from "./pages/StudentLogin";
import TrainerDashboard from "./pages/TrainerDashboard";
import StudentDashboard from "./pages/StudentDashboard";

const App = () => {
  const { user, logout } = useContext(AuthContext);

  return (
    <div style={{ fontFamily: "sans-serif", minHeight: "100vh", background: "#111", color: "#fff" }}>
      <header style={{ padding: "10px 20px", borderBottom: "1px solid #333", display: "flex", justifyContent: "space-between" }}>
        <div>
          <Link to="/" style={{ color: "#fff", textDecoration: "none", fontWeight: "bold", fontSize: 20 }}>
            MyCorporateSchool LMS
          </Link>
        </div>
        <nav style={{ display: "flex", gap: 15 }}>
          <Link to="/login-trainer" style={{ color: "#ccc" }}>Trainer Login</Link>
          <Link to="/login-student" style={{ color: "#ccc" }}>Student Login</Link>
          {user && (
            <button onClick={logout} style={{ background: "transparent", color: "#f55", border: "1px solid #f55", borderRadius: 4, cursor: "pointer" }}>
              Logout
            </button>
          )}
        </nav>
      </header>

      <main style={{ padding: 20 }}>
        <Routes>
          {/* Home: redirect based on login */}
          <Route
            path="/"
            element={
              user ? (
                user.role === "trainer" ? (
                  <Navigate to="/trainer/dashboard" />
                ) : (
                  <Navigate to="/student/dashboard" />
                )
              ) : (
                <div>
                  <h1>Welcome to the LMS</h1>
                  <p>Select Trainer or Student login from the top-right.</p>
                </div>
              )
            }
          />

          <Route path="/login-trainer" element={<TrainerLogin />} />
          <Route path="/login-student" element={<StudentLogin />} />

          {/* Protected routes */}
          <Route
            path="/trainer/dashboard"
            element={
              user && user.role === "trainer" ? (
                <TrainerDashboard />
              ) : (
                <Navigate to="/login-trainer" />
              )
            }
          />
          <Route
            path="/student/dashboard"
            element={
              user && user.role === "student" ? (
                <StudentDashboard />
              ) : (
                <Navigate to="/login-student" />
              )
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </div>
  );
};

export default App;
