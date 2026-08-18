import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";
import { isLoggedIn, getUsername, getIsAdmin, clearAuth } from "./api/auth.js";

import HomePage from "./pages/HomePage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import CardDetailPage from "./pages/CardDetailPage.jsx";
import AddCardPage from "./pages/AddCardPage.jsx";

export default function App() {
  const [loggedIn, setLoggedIn] = useState(isLoggedIn());
  const [username, setUsername] = useState(getUsername());
  const [isAdmin, setIsAdmin] = useState(getIsAdmin());

  function handleLogin(uname, admin = false) {
    setLoggedIn(true);
    setUsername(uname);
    setIsAdmin(admin);
  }

  function handleLogout() {
    clearAuth();
    setLoggedIn(false);
    setUsername(null);
    setIsAdmin(false);
  }

  return (
    <BrowserRouter>
      {/* 導覽列 */}
      <nav style={{ background: "#1F2937", padding: "12px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <a href="/" style={{ color: "white", fontWeight: 800, fontSize: 18, textDecoration: "none" }}>🃏 神魔修練場圖鑑</a>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          {loggedIn ? (
            <>
              <span style={{ color: "#9CA3AF", fontSize: 14 }}>{username}</span>
              <a href="/add" style={{ color: "white", fontSize: 14, textDecoration: "none", background: "#3B82F6", padding: "6px 14px", borderRadius: 8 }}>新增卡片</a>
              <button onClick={handleLogout} style={{ color: "#9CA3AF", fontSize: 14, background: "none", border: "none", cursor: "pointer" }}>登出</button>
            </>
          ) : (
            <a href="/login" style={{ color: "white", fontSize: 14, textDecoration: "none", background: "#3B82F6", padding: "6px 14px", borderRadius: 8 }}>登入</a>
          )}
        </div>
      </nav>

      {/* 頁面 */}
      <Routes>
        <Route path="/" element={<HomePage isAdmin={isAdmin} />} />
        <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
        <Route path="/card/:id" element={<CardDetailPage loggedIn={loggedIn} username={username} isAdmin={isAdmin} />} />
        <Route path="/add" element={loggedIn ? <AddCardPage /> : <Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}