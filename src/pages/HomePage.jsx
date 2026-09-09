import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client.js";
import AnnouncementPanel from "../components/AnnouncementPanel.jsx";

const ELEM = { w:"水",f:"火",t:"木",l:"光",d:"暗" };
const ELEM_COLOR = { w:"#3B82F6",f:"#EF4444",t:"#22C55E",l:"#CA8A04",d:"#A855F7" };
const RACE = { G:"神",E:"魔",H:"人",A:"獸",D:"龍",S:"妖",M:"機" };

const PREF_COLORS = { favorite: "#EF4444", top: "#3B82F6", bottom: "#22C55E", blocked: "#374151" };

function BookmarkIcon({ color, filled = true, size = 15 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? color : "none"} stroke={color} strokeWidth={filled ? 0 : 2}
      style={{ display: "inline-block", verticalAlign: "middle" }}>
      <path d="M6 2a1 1 0 0 0-1 1v19l7-4 7 4V3a1 1 0 0 0-1-1H6z" />
    </svg>
  );
}

const ALL_TAGS = {
  "主動技": ["解鎖","清除附加效果","引爆符石","轉版","動態轉版","轉行列","蓄能轉化","固定版面","直接傷害","增減集氣值","增攻","增回","減傷","主動改變消除","延長排珠","排珠","追打","主動兼具","變身","合體"],
  "隊長技": ["隊長倍率","隊長動態倍率","隊長減傷","隊長兼具","隊長改變消除","消Combo掉落","隊長延長移動時間"],
  "隊伍技": ["集氣值系統","隊伍倍率","動態倍率","隊伍減傷","延長移動時間","減CD","攻前傷害","殺敵回血","隊伍追打","改變掉落","無視轉珠障礙","無視攻擊限制","隊伍改變消除"],
};

export default function HomePage({ isAdmin, loggedIn }) {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [element, setElement] = useState("");
  const [race, setRace] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);
  const [onlyMine, setOnlyMine] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [appliedParams, setAppliedParams] = useState({});
  const [prefs, setPrefs] = useState({});
  const navigate = useNavigate();

  // 個人化功能欄
  const [personalizeOpen, setPersonalizeOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [showBlocked, setShowBlocked] = useState(false);
  const [applyPinTop, setApplyPinTop] = useState(true);
  const [applyPinBottom, setApplyPinBottom] = useState(true);
  const [selectedCards, setSelectedCards] = useState(new Set());

  useEffect(() => {
    fetchCards();
    if (loggedIn) fetchPrefs();
  }, []);

  async function fetchPrefs() {
    try {
      const list = await api.getPreferences();
      const map = {};
      list.forEach(p => { map[p.cardId] = { favorite: p.favorite, pin: p.pin, blocked: p.blocked }; });
      setPrefs(map);
    } catch (e) {
      console.error(e);
    }
  }

  function getPref(cardId) {
    return prefs[cardId] || { favorite: false, pin: "none", blocked: false };
  }

  function toggleSelect(cardId) {
    setSelectedCards(prev => {
      const next = new Set(prev);
      next.has(cardId) ? next.delete(cardId) : next.add(cardId);
      return next;
    });
  }

  async function applyToSelected(field, value) {
    const ids = [...selectedCards];
    const removeValue = field === "pin" ? "none" : false;
    const allHaveIt = ids.every(id => getPref(id)[field] === value);
    const finalValue = allHaveIt ? removeValue : value;

    setPrefs(prev => {
      const next = { ...prev };
      ids.forEach(id => { next[id] = { ...getPref(id), [field]: finalValue }; });
      return next;
    });
    try {
      await Promise.all(ids.map(id => api.setPreference(id, { [field]: finalValue })));
    } catch (e) {
      console.error(e);
    }
    setSelectedCards(new Set());
  }

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
    if (onlyMine) params.mine = "true";
    setAppliedParams(params);
    fetchCards(params);
  }

  function handleReset() {
    setQ(""); setElement(""); setRace(""); setSelectedTags([]); setOnlyMine(false);
    setAppliedParams({});
    fetchCards();
  }

  function toggleTag(tag) {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  }

  return (
    <div style={{ minHeight:"100vh", background:"#F1F5F9", padding: editMode && selectedCards.size > 0 ? "24px 16px 90px" : "24px 16px", boxSizing:"border-box" }}>
      <div style={{ maxWidth:800, margin:"0 auto" }}>

        <AnnouncementPanel isAdmin={isAdmin} />

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
              placeholder="搜尋角色名稱、系列或作者..."
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

          {/* 個人化功能 */}
          {loggedIn && (
            <div style={{ marginBottom: 12 }}>
              <div onClick={() => setPersonalizeOpen(o => !o)}
                style={{ cursor:"pointer", display:"flex", justifyContent:"space-between", alignItems:"center", padding:"8px 16px", background:"#F3F4F6", borderRadius:8, fontSize:13, fontWeight:600, color:"#374151" }}>
                <span><BookmarkIcon color="#374151" /> 個人化功能</span>
                <span>{personalizeOpen ? "▲" : "▼"}</span>
              </div>

              {personalizeOpen && (
                <div style={{ border:"1.5px solid #E5E7EB", borderTop:"none", borderRadius:"0 0 8px 8px", padding:14 }}>
                  <button onClick={() => { setEditMode(m => !m); setSelectedCards(new Set()); }}
                    style={{ padding:"7px 16px", background: editMode ? "#1F2937" : "#F3F4F6", color: editMode ? "white" : "#374151", border:"none", borderRadius:8, fontWeight:700, cursor:"pointer", fontSize:13, marginBottom:12 }}>
                    {editMode ? "✓ 編輯模式" : "編輯模式"}
                  </button>

                  {editMode ? (
                    <div style={{ fontSize:12, color:"#6B7280" }}>
                      勾選卡片後，畫面下方會出現操作列，可以一次套用到多張卡片
                    </div>
                  ) : (
                    <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
                      <button onClick={() => setOnlyFavorites(v => !v)}
                        style={{ display:"flex", alignItems:"center", gap:6, padding:"6px 14px", borderRadius:20, border:"none", cursor:"pointer", fontSize:13, fontWeight:600, background: onlyFavorites ? "#FEE2E2" : "#F3F4F6", color: onlyFavorites ? PREF_COLORS.favorite : "#9CA3AF" }}>
                        <BookmarkIcon color={PREF_COLORS.favorite} filled={onlyFavorites} /> 只顯示我的最愛
                      </button>
                      <button onClick={() => setShowBlocked(v => !v)}
                        style={{ display:"flex", alignItems:"center", gap:6, padding:"6px 14px", borderRadius:20, border:"none", cursor:"pointer", fontSize:13, fontWeight:600, background: showBlocked ? "#E5E7EB" : "#F3F4F6", color: showBlocked ? PREF_COLORS.blocked : "#9CA3AF" }}>
                        <BookmarkIcon color={PREF_COLORS.blocked} filled={showBlocked} /> 顯示已屏蔽的卡片
                      </button>
                      <button onClick={() => setApplyPinTop(v => !v)}
                        style={{ display:"flex", alignItems:"center", gap:6, padding:"6px 14px", borderRadius:20, border:"none", cursor:"pointer", fontSize:13, fontWeight:600, background: applyPinTop ? "#DBEAFE" : "#F3F4F6", color: applyPinTop ? PREF_COLORS.top : "#9CA3AF" }}>
                        <BookmarkIcon color={PREF_COLORS.top} filled={applyPinTop} /> 置頂
                      </button>
                      <button onClick={() => setApplyPinBottom(v => !v)}
                        style={{ display:"flex", alignItems:"center", gap:6, padding:"6px 14px", borderRadius:20, border:"none", cursor:"pointer", fontSize:13, fontWeight:600, background: applyPinBottom ? "#DCFCE7" : "#F3F4F6", color: applyPinBottom ? PREF_COLORS.bottom : "#9CA3AF" }}>
                        <BookmarkIcon color={PREF_COLORS.bottom} filled={applyPinBottom} /> 置底
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* 進階搜尋：標籤 */}
          {showAdvanced && (
            <div style={{ borderTop:"1px solid #F3F4F6", paddingTop:14 }}>
              {loggedIn && (
                <label style={{ display:"flex", alignItems:"center", gap:8, fontSize:13, color:"#374151", marginBottom:14, cursor:"pointer" }}>
                  <input type="checkbox" checked={onlyMine} onChange={e => setOnlyMine(e.target.checked)} />
                  僅顯示我新增的卡片
                </label>
              )}
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
        {(() => {
          let displayCards = cards.filter(c => editMode || showBlocked || !getPref(c._id).blocked);
          if (onlyFavorites) displayCards = displayCards.filter(c => getPref(c._id).favorite);
          const top = applyPinTop ? displayCards.filter(c => getPref(c._id).pin === "top") : [];
          const bottom = applyPinBottom ? displayCards.filter(c => getPref(c._id).pin === "bottom") : [];
          const topIds = new Set(top.map(c => c._id));
          const bottomIds = new Set(bottom.map(c => c._id));
          const mid = displayCards.filter(c => !topIds.has(c._id) && !bottomIds.has(c._id));
          displayCards = [...top, ...mid, ...bottom];

          if (loading) return <div style={{ textAlign:"center", color:"#9CA3AF", padding:40 }}>載入中...</div>;
          if (displayCards.length === 0) return <div style={{ textAlign:"center", color:"#9CA3AF", padding:40 }}>沒有找到卡片</div>;

          return (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(240px, 1fr))", gap:16 }}>
            {displayCards.map(card => {
              const pref = getPref(card._id);
              const isSelected = selectedCards.has(card._id);
              return (
              <div key={card._id} onClick={() => {
                if (editMode) { toggleSelect(card._id); return; }
                const qs = new URLSearchParams(appliedParams).toString();
                navigate(`/card/${card._id}${qs ? `?${qs}` : ""}`);
              }}
                style={{ position:"relative", background:"white", borderRadius:14, overflow:"hidden", boxShadow: isSelected ? "0 0 0 2px #1F2937" : "0 2px 12px rgba(0,0,0,0.07)", cursor:"pointer", opacity: pref.blocked ? 0.5 : 1 }}
                onMouseEnter={e => e.currentTarget.style.transform="translateY(-2px)"}
                onMouseLeave={e => e.currentTarget.style.transform="none"}>
                {editMode && (
                  <div style={{ position:"absolute", top:10, right:10, zIndex:2, width:22, height:22, borderRadius:6, background: isSelected ? "#1F2937" : "rgba(255,255,255,0.85)", border: "2px solid white", display:"flex", alignItems:"center", justifyContent:"center", color:"white", fontSize:13, fontWeight:800 }}>
                    {isSelected ? "✓" : ""}
                  </div>
                )}
                <div style={{ background:`linear-gradient(135deg, ${ELEM_COLOR[card.element]||"#6B7280"}, #1F2937)`, padding:"16px 16px 12px" }}>
                  <div style={{ fontSize:17, fontWeight:800, color:"white", display:"flex", alignItems:"center", justifyContent:"space-between", gap:6 }}>
                    <span>{card.parsedName}</span>
                    <span style={{ display:"flex", gap:3, flexShrink:0 }}>
                      {pref.pin === "top" && <BookmarkIcon color={PREF_COLORS.top} />}
                      {pref.pin === "bottom" && <BookmarkIcon color={PREF_COLORS.bottom} />}
                      {pref.favorite && <BookmarkIcon color={PREF_COLORS.favorite} />}
                    </span>
                  </div>
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
                      <span style={{ fontSize:12 }}>by {card.proxySubmit
                        ? <>{card.authorName || "未知作者"}<span style={{ color:"#9CA3AF" }}>（{card.proxyName}代投）</span></>
                        : (card.authorName || card.owner?.username)}</span>
                    </div>
                  </div>
                </div>
              </div>
              );
            })}
          </div>
          );
        })()}

        {/* 編輯模式：選取卡片後跳出的操作列 */}
        {editMode && selectedCards.size > 0 && (
          <div style={{ position:"fixed", left:0, right:0, bottom:0, background:"white", boxShadow:"0 -2px 16px rgba(0,0,0,0.12)", padding:"14px 20px", display:"flex", alignItems:"center", justifyContent:"center", gap:14, flexWrap:"wrap", zIndex:50 }}>
            <span style={{ fontSize:13, color:"#374151", fontWeight:700 }}>已選取 {selectedCards.size} 張</span>
            <button onClick={() => applyToSelected("favorite", true)}
              style={{ display:"flex", alignItems:"center", gap:6, padding:"8px 16px", borderRadius:20, border:"none", cursor:"pointer", fontSize:13, fontWeight:700, background:"#FEE2E2", color:PREF_COLORS.favorite }}>
              <BookmarkIcon color={PREF_COLORS.favorite} /> 加入最愛
            </button>
            <button onClick={() => applyToSelected("pin", "top")}
              style={{ display:"flex", alignItems:"center", gap:6, padding:"8px 16px", borderRadius:20, border:"none", cursor:"pointer", fontSize:13, fontWeight:700, background:"#DBEAFE", color:PREF_COLORS.top }}>
              <BookmarkIcon color={PREF_COLORS.top} /> 置頂
            </button>
            <button onClick={() => applyToSelected("pin", "bottom")}
              style={{ display:"flex", alignItems:"center", gap:6, padding:"8px 16px", borderRadius:20, border:"none", cursor:"pointer", fontSize:13, fontWeight:700, background:"#DCFCE7", color:PREF_COLORS.bottom }}>
              <BookmarkIcon color={PREF_COLORS.bottom} /> 置底
            </button>
            <button onClick={() => applyToSelected("blocked", true)}
              style={{ display:"flex", alignItems:"center", gap:6, padding:"8px 16px", borderRadius:20, border:"none", cursor:"pointer", fontSize:13, fontWeight:700, background:"#E5E7EB", color:PREF_COLORS.blocked }}>
              <BookmarkIcon color={PREF_COLORS.blocked} /> 屏蔽
            </button>
            <button onClick={() => setSelectedCards(new Set())}
              style={{ padding:"8px 16px", borderRadius:20, border:"none", cursor:"pointer", fontSize:13, fontWeight:700, background:"#F3F4F6", color:"#6B7280" }}>
              取消選取
            </button>
          </div>
        )}
      </div>

    </div>
  );
}