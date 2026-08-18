import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client.js";

const ELEM = { w:"水",f:"火",t:"木",l:"光",d:"暗" };
const ELEM_COLOR = { w:"#3B82F6",f:"#EF4444",t:"#22C55E",l:"#CA8A04",d:"#A855F7" };
const RACE = { G:"神",E:"魔",H:"人",A:"獸",D:"龍",S:"妖",M:"機" };

const ALL_TAGS = {
  "主動技": ["解鎖","清除附加效果","引爆符石","轉版","動態轉版","轉行列","蓄能轉化","固定版面","直接傷害","增減集氣值","增攻","增回","減傷","主動改變消除","延長排珠","排珠","追打","主動兼具","變身","合體"],
  "隊長技": ["隊長倍率","隊長動態倍率","隊長減傷","隊長兼具","隊長改變消除","消Combo掉落","隊長延長移動時間"],
  "隊伍技": ["集氣值系統","隊伍倍率","動態倍率","隊伍減傷","延長移動時間","減CD","攻前傷害","殺敵回血","隊伍追打","改變掉落","無視轉珠障礙","無視攻擊限制","隊伍改變消除"],
};

export default function HomePage() {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [element, setElement] = useState("");
  const [race, setRace] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const navigate = useNavigate();

  useEffect(() => { fetchCards(); }, []);

  async function fetchCards(params = {}) {
    setLoading(true);
    try {
      const data = await api.getCards(params);
      setCards(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  function handleSearch() {
    const params = {};
    if (q.trim()) params.q = q.trim();
    if (element) params.element = element;
    if (race) params.race = race;
    if (selectedTags.length > 0) params.tags = selectedTags.join(",");
    fetchCards(params);
  }

  function handleReset() {
    setQ(""); setElement(""); setRace(""); setSelectedTags([]);
    fetchCards();
  }

  function toggleTag(tag) {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  }

  return (
    <div style={{ minHeight:"100vh", background:"#F1F5F9", padding:"24px 16px", boxSizing:"border-box" }}>
      <div style={{ maxWidth:800, margin:"0 auto" }}>

        {/* 回饋問卷 */}
        <div style={{ background:"#EFF6FF", border:"1px solid #BFDBFE", borderRadius:16, padding:"14px 20px", marginBottom:20, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div>
            <div style={{ fontWeight:700, fontSize:15, color:"#1D4ED8", marginBottom:2 }}>📋 測試版回饋問卷</div>
            <div style={{ fontSize:13, color:"#3B82F6" }}>歡迎填寫問卷幫助改進！</div>
          </div>
          <a href="https://docs.google.com/forms/d/e/1FAIpQLSfrMhEWAE3ft4_kOEFmOkLvQr-71fFYEV4TlnT2o9CAoe6CMA/viewform?usp=publish-editor"
            target="_blank" rel="noreferrer"
            style={{ padding:"9px 18px", background:"#1D4ED8", color:"white", borderRadius:10, fontWeight:700, fontSize:13, textDecoration:"none", whiteSpace:"nowrap", marginLeft:16 }}>
            填寫問卷
          </a>
        </div>

        {/* 搜尋列 */}
        <div style={{ background:"white", borderRadius:16, padding:20, marginBottom:20, boxShadow:"0 2px 12px rgba(0,0,0,0.07)" }}>
          <div style={{ display:"flex", gap:10, marginBottom:12 }}>
            <input value={q} onChange={e => setQ(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSearch()}
              placeholder="搜尋角色名稱或系列..."
              style={{ flex:1, padding:"10px 14px", borderRadius:10, border:"1.5px solid #D1D5DB", fontSize:14, outline:"none" }} />
            <button onClick={handleSearch}
              style={{ padding:"10px 20px", background:"#1F2937", color:"white", border:"none", borderRadius:10, fontWeight:700, cursor:"pointer" }}>
              搜尋
            </button>
          </div>

          <div style={{ display:"flex", gap:10, marginBottom:12 }}>
            <select value={element} onChange={e => setElement(e.target.value)}
              style={{ flex:1, padding:"8px 12px", borderRadius:8, border:"1.5px solid #D1D5DB", fontSize:14, outline:"none" }}>
              <option value="">所有屬性</option>
              {Object.entries(ELEM).map(([k,v]) => <option key={k} value={k}>{v}屬</option>)}
            </select>
            <select value={race} onChange={e => setRace(e.target.value)}
              style={{ flex:1, padding:"8px 12px", borderRadius:8, border:"1.5px solid #D1D5DB", fontSize:14, outline:"none" }}>
              <option value="">所有種族</option>
              {Object.entries(RACE).map(([k,v]) => <option key={k} value={k}>{v}族</option>)}
            </select>
            <button onClick={() => setShowAdvanced(s => !s)}
              style={{ padding:"8px 16px", background: showAdvanced ? "#1F2937" : "#F3F4F6", color: showAdvanced ? "white" : "#374151", border:"none", borderRadius:8, fontWeight:600, cursor:"pointer", whiteSpace:"nowrap" }}>
              進階搜尋 {showAdvanced ? "▲" : "▼"}
            </button>
            <button onClick={handleReset}
              style={{ padding:"8px 16px", background:"#F3F4F6", color:"#374151", border:"none", borderRadius:8, fontWeight:600, cursor:"pointer" }}>
              重置
            </button>
          </div>

          {/* 進階搜尋：標籤 */}
          {showAdvanced && (
            <div style={{ borderTop:"1px solid #F3F4F6", paddingTop:14 }}>
              {Object.entries(ALL_TAGS).map(([category, tags]) => (
                <div key={category} style={{ marginBottom:12 }}>
                  <div style={{ fontSize:12, color:"#9CA3AF", fontWeight:700, marginBottom:6 }}>{category}</div>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                    {tags.map(tag => (
                      <button key={tag} onClick={() => toggleTag(tag)}
                        style={{
                          padding:"4px 12px", borderRadius:20, fontSize:12, cursor:"pointer", fontWeight:600,
                          background: selectedTags.includes(tag) ? "#1F2937" : "#F3F4F6",
                          color: selectedTags.includes(tag) ? "white" : "#374151",
                          border: "none"
                        }}>
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
              {selectedTags.length > 0 && (
                <div style={{ fontSize:12, color:"#6B7280", marginTop:4 }}>
                  已選：{selectedTags.join("、")}
                </div>
              )}
            </div>
          )}
        </div>

        {/* 卡片列表 */}
        {loading ? (
          <div style={{ textAlign:"center", color:"#9CA3AF", padding:40 }}>載入中...</div>
        ) : cards.length === 0 ? (
          <div style={{ textAlign:"center", color:"#9CA3AF", padding:40 }}>沒有找到卡片</div>
        ) : (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(240px, 1fr))", gap:16 }}>
            {cards.map(card => (
              <div key={card._id} onClick={() => navigate(`/card/${card._id}`)}
                style={{ background:"white", borderRadius:14, overflow:"hidden", boxShadow:"0 2px 12px rgba(0,0,0,0.07)", cursor:"pointer" }}
                onMouseEnter={e => e.currentTarget.style.transform="translateY(-2px)"}
                onMouseLeave={e => e.currentTarget.style.transform="none"}>
                <div style={{ background:`linear-gradient(135deg, ${ELEM_COLOR[card.element]||"#6B7280"}, #1F2937)`, padding:"16px 16px 12px" }}>
                  <div style={{ fontSize:17, fontWeight:800, color:"white" }}>{card.parsedName}</div>
                  <div style={{ fontSize:12, color:"rgba(255,255,255,0.7)", marginTop:2 }}>
                    #{card.cardCode.split("=b=")[0]} · {card.series || "無系列"}
                  </div>
                </div>
                <div style={{ padding:"10px 16px" }}>
                  {/* 技能標籤 */}
                  {card.skillTags?.length > 0 && (
                    <div style={{ display:"flex", flexWrap:"wrap", gap:4, marginBottom:8 }}>
                      {card.skillTags.slice(0,4).map(tag => (
                        <span key={tag} style={{ fontSize:11, background:"#F3F4F6", color:"#374151", borderRadius:10, padding:"2px 8px" }}>{tag}</span>
                      ))}
                      {card.skillTags.length > 4 && (
                        <span style={{ fontSize:11, color:"#9CA3AF" }}>+{card.skillTags.length - 4}</span>
                      )}
                    </div>
                  )}
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                    <div style={{ fontSize:13, color:"#6B7280" }}>
                      {ELEM[card.element]||"?"}屬 · {RACE[card.race]||"?"}族
                    </div>
                    <div style={{ display:"flex", gap:10, fontSize:13, color:"#9CA3AF" }}>
                      <span>❤️ {card.likeCount}</span>
                      <span style={{ fontSize:12 }}>by {card.owner?.username}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}