// frontend/src/pages/StudentLogin.jsx
import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import { AuthContext } from "../AuthContext";

const StudentLogin = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [msg, setMsg] = useState("");

  const onChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    try {
      const res = await api.post("/auth/login", form);
      if (res.data.role !== "student") {
        setMsg("This account is not a student account.");
        return;
      }
      login(res.data);
      navigate("/student/dashboard");
    } catch (err) {
      setMsg(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "40px auto" }}>
      <h2>Student Login</h2>
      <form onSubmit={onSubmit}>
        <div style={{ marginBottom: 10 }}>
          <label>Email</label>
          <input
            style={{ width: "100%" }}
            type="email"
            name="email"
            value={form.email}
            onChange={onChange}
            required
          />
        </div>
        <div style={{ marginBottom: 10 }}>
          <label>Password</label>
          <input
            style={{ width: "100%" }}
            type="password"
            name="password"
            value={form.password}
            onChange={onChange}
            required
          />
        </div>
        <button type="submit" style={{ padding: "6px 12px" }}>
          Login
        </button>
      </form>
      {msg && <p style={{ marginTop: 10, color: "#f88" }}>{msg}</p>}
    </div>
  );
};

export default StudentLogin;
