import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client.js";
import { parseCard, extractSkillTags } from "../parser.js";

export default function AddCardPage() {
  const [cardCode, setCardCode] = useState("");
  const [preview, setPreview] = useState(null);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [imageSource, setImageSource] = useState("");
  const [description, setDescription] = useState("");

  function handlePreview() {
    if (!cardCode.trim()) { setErr("請貼上卡片碼"); return; }
    const result = parseCard(cardCode.trim());
    if (!result) { setErr("卡片碼格式有誤"); return; }
    setPreview(result);
    setErr("");
  }

  async function handleSubmit() {
    if (!preview) { setErr("請先預覽卡片"); return; }
    setLoading(true); setErr("");
    try {
      await api.createCard({
        cardCode: cardCode.trim(),
        parsedName: preview.name,
        element: preview.element,
        race: preview.race,
        series: preview.series,
        imageSource: imageSource.trim(),
        skillTags: extractSkillTags(cardCode.trim()),
        description: description.trim()
      });
      navigate("/");
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  const ELEM_COLOR = { w:"#3B82F6",f:"#EF4444",t:"#22C55E",l:"#CA8A04",d:"#A855F7" };
  const ELEM = { w:"水",f:"火",t:"木",l:"光",d:"暗" };
  const RACE = { G:"神",E:"魔",H:"人",A:"獸",D:"龍",S:"妖",M:"機" };

  return (
    <div style={{ minHeight:"100vh", background:"#F1F5F9", padding:"24px 16px", boxSizing:"border-box" }}>
      <div style={{ maxWidth:640, margin:"0 auto" }}>

        {/* 輸入區 */}
        <div style={{ background:"white", borderRadius:16, padding:20, marginBottom:20, boxShadow:"0 2px 12px rgba(0,0,0,0.07)" }}>
          <h2 style={{ margin:"0 0 16px", fontSize:20, fontWeight:800, color:"#1F2937" }}>新增卡片</h2>
          <textarea value={cardCode} onChange={e => { setCardCode(e.target.value); setPreview(null); }}
            placeholder="貼上卡片碼..."
            style={{ width:"100%", height:100, borderRadius:10, border:"1.5px solid #D1D5DB", padding:"10px 12px", fontSize:12, fontFamily:"monospace", resize:"vertical", boxSizing:"border-box", outline:"none" }} />

          <div style={{ marginTop: 12 }}>
            <div style={{ fontSize: 13, color: "#374151", marginBottom: 6 }}>
              圖片來源 <span style={{ color: "#9CA3AF" }}>（選填）</span>
            </div>
            <input value={imageSource} onChange={e => setImageSource(e.target.value)}
              placeholder="例如：畫師或圖片連結"
              style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1.5px solid #D1D5DB", fontSize: 14, boxSizing: "border-box", outline: "none" }} />
          </div>

          <div style={{ marginTop: 12 }}>
            <div style={{ fontSize: 13, color: "#374151", marginBottom: 6 }}>
              補充說明 <span style={{ color: "#9CA3AF" }}>（選填）</span>
            </div>
            <textarea value={description} onChange={e => setDescription(e.target.value)}
              placeholder="例如：平衡說明、特殊效果、使用限制..."
              style={{ width: "100%", height: 80, padding: "10px 12px", borderRadius: 10, border: "1.5px solid #D1D5DB", fontSize: 14, boxSizing: "border-box", outline: "none", resize: "vertical" }} />
          </div>

          {err && <div style={{ color:"#EF4444", fontSize:13, margin:"8px 0" }}>{err}</div>}

          <div style={{ display:"flex", gap:10, marginTop:10 }}>
            <button onClick={handlePreview}
              style={{ flex:1, padding:"10px 0", background:"#F3F4F6", color:"#1F2937", border:"none", borderRadius:10, fontWeight:700, cursor:"pointer", fontSize:14 }}>
              預覽
            </button>
            <button onClick={handleSubmit} disabled={!preview || loading}
              style={{ flex:1, padding:"10px 0", background: preview ? "#1F2937" : "#9CA3AF", color:"white", border:"none", borderRadius:10, fontWeight:800, cursor: preview ? "pointer" : "not-allowed", fontSize:14 }}>
              {loading ? "上傳中..." : "確認新增"}
            </button>
          </div>
        </div>

        {/* 預覽區 */}
        {preview && (
          <div style={{ background:"white", borderRadius:16, padding:20, boxShadow:"0 2px 12px rgba(0,0,0,0.07)" }}>
            <div style={{ fontSize:13, color:"#6B7280", marginBottom:12 }}>預覽結果</div>

            {/* 卡頭 */}
            <div style={{ background:`linear-gradient(135deg, ${ELEM_COLOR[preview.element]||"#6B7280"}, #1F2937)`, borderRadius:12, padding:"16px 20px", marginBottom:16, color:"white" }}>
              <div style={{ fontSize:22, fontWeight:900 }}>{preview.name || "（未命名）"}</div>
              <div style={{ fontSize:13, opacity:0.8, marginTop:2 }}>
                #{preview.no} · {preview.series || "無系列"} · {ELEM[preview.element]||"?"}屬 {RACE[preview.race]||"?"}族
              </div>
              <div style={{ display:"flex", gap:10, marginTop:12 }}>
                {[["❤️","HP",preview.hp],["⚔️","攻",preview.atk],["💚","回",preview.rec]].map(([ico,lbl,val])=>(
                  <div key={lbl} style={{ background:"rgba(255,255,255,0.18)", borderRadius:8, padding:"6px 0", flex:1, textAlign:"center" }}>
                    <div style={{ fontSize:11, opacity:0.85 }}>{ico} {lbl}</div>
                    <div style={{ fontSize:17, fontWeight:900 }}>{Number(val).toLocaleString()}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ fontSize:13, color:"#6B7280", textAlign:"center" }}>
              確認資訊無誤後點「確認新增」上傳
            </div>
          </div>
        )}
      </div>
    </div>
  );
}