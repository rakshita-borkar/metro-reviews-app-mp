import React, { useState } from "react";
import { loginUser, registerUser } from "../api";

const AuthForm = ({ onLogin }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState("login"); // 'login' or 'register'

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (mode === "login") {
        await loginUser(username, password);
      } else {
        await registerUser(username, password);
      }
      onLogin(); // notify parent
    } catch (err) {
      alert(err.response?.data?.error || "Something went wrong");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-white rounded-xl shadow-sm w-80 mx-auto mt-10">
      <h2 className="text-xl font-bold mb-3">{mode === "login" ? "Login" : "Register"}</h2>
      <input
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        className="border rounded p-2 w-full mb-2"
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="border rounded p-2 w-full mb-2"
      />
      <button type="submit" className="px-3 py-1 bg-blue-600 text-white rounded-lg w-full">
        {mode === "login" ? "Login" : "Register"}
      </button>
      <p className="text-sm mt-2 cursor-pointer text-blue-600" onClick={() => setMode(mode === "login" ? "register" : "login")}>
        {mode === "login" ? "Create an account?" : "Already have an account?"}
      </p>
    </form>
  );
};

export default AuthForm;
