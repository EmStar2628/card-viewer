import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { api } from "../api/client.js";
import { saveAuth } from "../api/auth.js";

export default function LoginPage({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // 處理 Google callback 帶回來的 token
  useEffect(() => {
    const token = searchParams.get("token");
    const username = searchParams.get("username");
    const error = searchParams.get("error");
    const isAdmin = searchParams.get("isAdmin") === "true";

    if (error) { setErr("Google 登入失敗，請再試一次"); return; }
    if (token && username) {
      saveAuth(token, username, isAdmin);
      onLogin(username, isAdmin);
      navigate("/");
    }
  }, []);

  async function handleSubmit() {
    if (!username.trim() || !password.trim()) { setErr("請填寫帳號和密碼"); return; }
    setLoading(true); setErr("");
    try {
      if (isRegister) {
        await api.register(username, password);
        const data = await api.login(username, password);
        saveAuth(data.token, data.username, data.isAdmin);
        onLogin(data.username, data.isAdmin);
      } else {
        const data = await api.login(username, password);
        saveAuth(data.token, data.username, data.isAdmin);
        onLogin(data.username, data.isAdmin);
      }
      navigate("/");
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  const GOOGLE_URL = import.meta.env.DEV
    ? "http://localhost:3000/api/auth/google"
    : "https://card-viewer-api.onrender.com/api/auth/google";

  function handleGoogleLogin() {
    window.location.href = GOOGLE_URL;
  }

  return (
    <div style={{ minHeight:"100vh", background:"#F1F5F9", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ background:"white", borderRadius:16, padding:32, width:360, boxShadow:"0 2px 16px rgba(0,0,0,0.08)" }}>
        <h2 style={{ margin:"0 0 24px", fontSize:22, fontWeight:800, color:"#1F2937" }}>
          {isRegister ? "註冊帳號" : "登入"}
        </h2>

        <div style={{ marginBottom:14 }}>
          <div style={{ fontSize:13, color:"#374151", marginBottom:6 }}>帳號</div>
          <input value={username} onChange={e => setUsername(e.target.value)}
            style={{ width:"100%", padding:"10px 12px", borderRadius:8, border:"1.5px solid #D1D5DB", fontSize:14, boxSizing:"border-box", outline:"none" }} />
        </div>

        <div style={{ marginBottom:20 }}>
          <div style={{ fontSize:13, color:"#374151", marginBottom:6 }}>密碼</div>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSubmit()}
            style={{ width:"100%", padding:"10px 12px", borderRadius:8, border:"1.5px solid #D1D5DB", fontSize:14, boxSizing:"border-box", outline:"none" }} />
        </div>

        {err && <div style={{ color:"#EF4444", fontSize:13, marginBottom:14 }}>{err}</div>}

        <button onClick={handleSubmit} disabled={loading}
          style={{ width:"100%", padding:"11px 0", background:"#1F2937", color:"white", border:"none", borderRadius:10, fontWeight:800, cursor:"pointer", fontSize:15, marginBottom:12 }}>
          {loading ? "處理中..." : isRegister ? "註冊" : "登入"}
        </button>

        {/* 分隔線 */}
        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12 }}>
          <div style={{ flex:1, height:1, background:"#E5E7EB" }}/>
          <span style={{ fontSize:12, color:"#9CA3AF" }}>或</span>
          <div style={{ flex:1, height:1, background:"#E5E7EB" }}/>
        </div>

        {/* Google 登入按鈕 */}
        <button onClick={handleGoogleLogin}
          style={{ width:"100%", padding:"11px 0", background:"white", color:"#374151", border:"1.5px solid #D1D5DB", borderRadius:10, fontWeight:700, cursor:"pointer", fontSize:14, marginBottom:16, display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
          <svg width="18" height="18" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
          </svg>
          使用 Google 帳號登入
        </button>

        <div style={{ textAlign:"center", fontSize:13, color:"#6B7280" }}>
          {isRegister ? "已有帳號？" : "還沒有帳號？"}
          <span onClick={() => { setIsRegister(r => !r); setErr(""); }}
            style={{ color:"#3B82F6", cursor:"pointer", marginLeft:4 }}>
            {isRegister ? "登入" : "註冊"}
          </span>
        </div>
      </div>
    </div>
  );
}