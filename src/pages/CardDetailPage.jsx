import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { api } from "../api/client.js";
import { parseCard } from "../parser.js";

const ELEM_COLOR = { w:"#3B82F6",f:"#EF4444",t:"#22C55E",l:"#CA8A04",d:"#A855F7" };
const ELEM_DARK  = { w:"#1D4ED8",f:"#B91C1C",t:"#15803D",l:"#92400E",d:"#7E22CE" };
const ELEM_GLYPH = { w:"💧",f:"🔥",t:"🌿",l:"✨",d:"🌑" };
const ELEM = { w:"水",f:"火",t:"木",l:"光",d:"暗" };
const RACE = { G:"神",E:"魔",H:"人",A:"獸",D:"龍",S:"妖",M:"機" };

function EffectTag({ item }) {
  if (!item) return null;
  return (
    <div style={{ background: item.raw ? "#F9F9F9" : "white", border: "1px solid #E5E7EB", borderRadius: 10, padding: "10px 14px", marginBottom: 6 }}>
      <div style={{ fontWeight: 700, fontSize: 14, display: "flex", alignItems: "center", gap: 6, marginBottom: item.parts.length ? 5 : 0 }}>
        <span>{item.icon}</span><span style={{ color: "#111" }}>{item.title}</span>
      </div>
      {item.parts.map((p, i) => (
        <div key={i} style={{ fontSize: 13, color: "#444", paddingLeft: 26, fontFamily: item.mono ? "monospace" : "inherit", lineHeight: 1.65, wordBreak: "break-all" }}>{p}</div>
      ))}
      {item.conds?.length > 0 && (
        <div style={{ fontSize: 12, color: "#888", paddingLeft: 26, marginTop: 3, borderTop: "1px dashed #E5E7EB", paddingTop: 3 }}>
          ⚙️ 發動條件：{item.conds.join("、並")}
        </div>
      )}
    </div>
  );
}

function SkillBlock({ skill, index, elemColor }) {
  const [open, setOpen] = useState(true);
  return (
    <div style={{ marginBottom: 10 }}>
      <div onClick={() => setOpen(o => !o)} style={{ cursor: "pointer", background: "#F3F4F6", borderRadius: 9, padding: "8px 14px", display: "flex", justifyContent: "space-between", alignItems: "center", borderLeft: `4px solid ${elemColor}`, marginBottom: open ? 6 : 0, userSelect: "none" }}>
        <span style={{ fontWeight: 700, fontSize: 14 }}>主動技 {index + 1}：{skill.name}</span>
        <span style={{ color: "#6B7280", fontSize: 13, display: "flex", gap: 12 }}><span>CD {skill.cd}</span><span>{open ? "▲" : "▼"}</span></span>
      </div>
      {open && skill.effects.map((e, i) => <EffectTag key={i} item={e} />)}
    </div>
  );
}

export default function CardDetailPage({ loggedIn, username }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [card, setCard] = useState(null);
  const [parsed, setParsed] = useState(null);
  const [comments, setComments] = useState([]);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [commentText, setCommentText] = useState("");
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [filteredIds, setFilteredIds] = useState(null);

  const filterParams = Object.fromEntries(searchParams.entries());

  useEffect(() => {
    fetchCard();
    fetchComments();
  }, [id]);

  useEffect(() => {
    api.getCards(filterParams).then(list => setFilteredIds(list.map(c => c._id))).catch(() => setFilteredIds(null));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);

  async function fetchCard() {
    try {
      const data = await api.getCard(id);
      setCard(data);
      setLikeCount(data.likeCount);
      setParsed(parseCard(data.cardCode));
    } catch { navigate("/"); }
    finally { setLoading(false); }
  }

  async function fetchComments() {
    try {
      const data = await api.getComments(id);
      setComments(data);
    } catch (e) { console.error(e); }
  }

  async function handleLike() {
    if (!loggedIn) { navigate("/login"); return; }
    try {
      const data = await api.toggleLike(id);
      setLiked(data.liked);
      setLikeCount(c => data.liked ? c + 1 : c - 1);
    } catch (e) { console.error(e); }
  }

  function handleCopy() {
    navigator.clipboard.writeText(card.cardCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleComment() {
    if (!commentText.trim()) return;
    try {
      await api.addComment(id, commentText);
      setCommentText("");
      fetchComments();
    } catch (e) { console.error(e); }
  }

  async function handleDeleteComment(commentId) {
    try {
      await api.deleteComment(commentId);
      fetchComments();
    } catch (e) { console.error(e); }
  }

  async function handleDeleteCard() {
    if (!confirm("確定要刪除這張卡片？")) return;
    try {
      await api.deleteCard(id);
      navigate("/");
    } catch (e) { console.error(e); }
  }

  const currentIndex = filteredIds ? filteredIds.indexOf(id) : -1;
  const prevId = currentIndex > 0 ? filteredIds[currentIndex - 1] : null;
  const nextId = currentIndex >= 0 && currentIndex < filteredIds?.length - 1 ? filteredIds[currentIndex + 1] : null;

  function goTo(otherId) {
    navigate(`/card/${otherId}${location.search}`);
  }

  const FILTER_ELEM = { w: "水", f: "火", t: "木", l: "光", d: "暗" };
  const FILTER_RACE = { G: "神", E: "魔", H: "人", A: "獸", D: "龍", S: "妖", M: "機" };
  const filterBadges = [];
  if (filterParams.q) filterBadges.push(`關鍵字：${filterParams.q}`);
  if (filterParams.element) filterBadges.push(`${FILTER_ELEM[filterParams.element] || filterParams.element}屬`);
  if (filterParams.race) filterBadges.push(`${FILTER_RACE[filterParams.race] || filterParams.race}族`);
  if (filterParams.tags) filterParams.tags.split(",").filter(Boolean).forEach(t => filterBadges.push(t));
  if (filterParams.mine === "true") filterBadges.push("僅顯示我新增的卡片");

  if (loading) return <div style={{ textAlign: "center", padding: 60, color: "#9CA3AF" }}>載入中...</div>;
  if (!card || !parsed) return null;

  const ec = ELEM_COLOR[parsed.element] || "#6B7280";
  const ed = ELEM_DARK[parsed.element] || "#374151";
  const eg = ELEM_GLYPH[parsed.element] || "◆";

  return (
    <div style={{ minHeight: "100vh", background: "#F1F5F9", padding: "24px 16px", boxSizing: "border-box" }}>
      <div style={{ maxWidth: 680, margin: "0 auto" }}>

        {/* 返回 */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div onClick={() => navigate(`/${location.search}`)} style={{ color: "#6B7280", fontSize: 14, cursor: "pointer" }}>← 返回列表</div>
          {filteredIds && (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {currentIndex >= 0 && (
                <span style={{ fontSize: 12, color: "#9CA3AF", whiteSpace: "nowrap" }}>
                  第 {currentIndex + 1} 筆 / 共 {filteredIds.length} 筆
                </span>
              )}
              <button onClick={() => prevId && goTo(prevId)} disabled={!prevId}
                style={{ padding: "6px 14px", background: prevId ? "#F3F4F6" : "#F9FAFB", color: prevId ? "#374151" : "#D1D5DB", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: prevId ? "pointer" : "default" }}>
                ◀ 上一張
              </button>
              <button onClick={() => nextId && goTo(nextId)} disabled={!nextId}
                style={{ padding: "6px 14px", background: nextId ? "#F3F4F6" : "#F9FAFB", color: nextId ? "#374151" : "#D1D5DB", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: nextId ? "pointer" : "default" }}>
                下一張 ▶
              </button>
            </div>
          )}
        </div>

        {filterBadges.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
            <span style={{ fontSize: 12, color: "#9CA3AF", padding: "4px 0" }}>目前篩選：</span>
            {filterBadges.map((b, i) => (
              <span key={i} style={{ fontSize: 12, background: "#E0E7FF", color: "#3730A3", borderRadius: 12, padding: "3px 10px" }}>{b}</span>
            ))}
          </div>
        )}

        <div style={{ background: "white", borderRadius: 18, padding: 20, boxShadow: "0 2px 16px rgba(0,0,0,0.07)", marginBottom: 16 }}>

          {/* 卡頭 */}
          <div style={{ background: `linear-gradient(135deg,${ec},${ed})`, borderRadius: 14, padding: "18px 20px", marginBottom: 18, color: "white", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", right: -10, top: -10, fontSize: 88, opacity: 0.12, lineHeight: 1 }}>{eg}</div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", position: "relative" }}>
              <div>
                <div style={{ fontSize: 22, fontWeight: 900 }}>{parsed.name}</div>
                <div style={{ fontSize: 13, opacity: 0.85, marginTop: 2 }}>#{parsed.no}{parsed.series ? ` · ${parsed.series}系列` : ""}</div>
              </div>
              <span style={{ background: "rgba(255,255,255,0.22)", borderRadius: 20, padding: "4px 12px", fontWeight: 700, fontSize: 13 }}>
                {ELEM[parsed.element] || "?"}屬·{RACE[parsed.race] || "?"}族
              </span>
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
              {[["❤️", "HP", parsed.hp], ["⚔️", "攻", parsed.atk], ["💚", "回", parsed.rec]].map(([ico, lbl, val]) => (
                <div key={lbl} style={{ background: "rgba(255,255,255,0.18)", borderRadius: 10, padding: "7px 0", flex: 1, textAlign: "center" }}>
                  <div style={{ fontSize: 11, opacity: 0.85 }}>{ico} {lbl}</div>
                  <div style={{ fontSize: 19, fontWeight: 900 }}>{Number(val).toLocaleString()}</div>
                </div>
              ))}
            </div>
          </div>

          {/* 卡片圖片 */}
          {card.imageUrl && (
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 18 }}>
              <div style={{ width: "80%", aspectRatio: "1.5 / 1", borderRadius: 14, overflow: "hidden", background: "#F3F4F6" }}>
                <img src={card.imageUrl} loading="lazy" alt={parsed.name}
                  style={{
                    width: "100%", height: "100%", objectFit: "cover", display: "block",
                    objectPosition: card.imageCrop ? `${card.imageCrop.x}% ${card.imageCrop.y}%` : "50% 50%",
                    transform: `scale(${card.imageCrop?.zoom || 1})`,
                    transformOrigin: card.imageCrop ? `${card.imageCrop.x}% ${card.imageCrop.y}%` : "50% 50%"
                  }} />
              </div>
            </div>
          )}

          {/* 技能 */}
          {parsed.skills.length > 0 && (
            <div style={{ marginBottom: 18 }}>
              <div style={{ fontSize: 15, fontWeight: 800, borderLeft: `4px solid ${ec}`, paddingLeft: 10, marginBottom: 10 }}>主動技</div>
              {parsed.skills.map((s, i) => <SkillBlock key={i} skill={s} index={i} elemColor={ec} />)}
            </div>
          )}
          {parsed.leaderSkill.length > 0 && (
            <div style={{ marginBottom: 18 }}>
              <div style={{ fontSize: 15, fontWeight: 800, borderLeft: `4px solid ${ec}`, paddingLeft: 10, marginBottom: 10 }}>隊長技</div>
              {parsed.leaderSkill.map((e, i) => <EffectTag key={i} item={e} />)}
            </div>
          )}
          {parsed.teamSkill.length > 0 && (
            <div style={{ marginBottom: 8 }}>
              <div style={{ fontSize: 15, fontWeight: 800, borderLeft: `4px solid ${ec}`, paddingLeft: 10, marginBottom: 10 }}>隊伍技</div>
              {parsed.teamSkill.map((e, i) => <EffectTag key={i} item={e} />)}
            </div>
          )}

          {card.imageSource && (
            <div style={{ fontSize: 13, color: "#6B7280", padding: "10px 0", borderTop: "1px solid #E5E7EB" }}>
              🎨 圖片來源：
              {card.imageSource.startsWith("http") ? (
                <a href={card.imageSource} target="_blank" rel="noreferrer"
                  style={{ color: "#3B82F6", marginLeft: 4 }}>{card.imageSource}</a>
              ) : (
                <span style={{ marginLeft: 4 }}>{card.imageSource}</span>
              )}
            </div>
          )}

          {card.description && (
            <div style={{ fontSize: 14, color: "#374151", padding: "10px 0", borderTop: "1px solid #E5E7EB", lineHeight: 1.7 }}>
              📝 補充說明：
              {card.description}
            </div>
          )}

          {/* 操作列 */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 12, borderTop: "1px solid #E5E7EB" }}>
            <div style={{ fontSize: 13, color: "#9CA3AF" }}>by {card.owner?.username}</div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={handleCopy}
                style={{ padding:"7px 16px", background: copied ? "#D1FAE5" : "#F3F4F6", color: copied ? "#059669" : "#374151", border:"none", borderRadius:8, fontWeight:700, cursor:"pointer", fontSize:13 }}>
                {copied ? "已複製 ✓" : "複製卡片碼"}
              </button>
              <button onClick={handleLike} style={{ padding: "7px 16px", background: liked ? "#FEE2E2" : "#F3F4F6", color: liked ? "#EF4444" : "#374151", border: "none", borderRadius: 8, fontWeight: 700, cursor: "pointer", fontSize: 13 }}>
                ❤️ {likeCount}
              </button>
              {loggedIn && card.owner?.username === username && (
                <button onClick={() => navigate(`/card/${id}/edit${location.search}`)} style={{ padding: "7px 16px", background: "#F3F4F6", color: "#374151", border: "none", borderRadius: 8, fontWeight: 700, cursor: "pointer", fontSize: 13 }}>
                  編輯
                </button>
              )}
              {loggedIn && card.owner?.username === username && (
                <button onClick={handleDeleteCard} style={{ padding: "7px 16px", background: "#FEE2E2", color: "#EF4444", border: "none", borderRadius: 8, fontWeight: 700, cursor: "pointer", fontSize: 13 }}>
                  刪除
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 留言區 */}
        <div style={{ background: "white", borderRadius: 18, padding: 20, boxShadow: "0 2px 16px rgba(0,0,0,0.07)" }}>
          <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 16 }}>留言 ({comments.length})</div>

          {loggedIn && (
            <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
              <input value={commentText} onChange={e => setCommentText(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleComment()}
                placeholder="留下你的評論..."
                style={{ flex: 1, padding: "10px 14px", borderRadius: 10, border: "1.5px solid #D1D5DB", fontSize: 14, outline: "none" }} />
              <button onClick={handleComment}
                style={{ padding: "10px 18px", background: "#1F2937", color: "white", border: "none", borderRadius: 10, fontWeight: 700, cursor: "pointer" }}>
                送出
              </button>
            </div>
          )}

          {comments.length === 0 ? (
            <div style={{ textAlign: "center", color: "#9CA3AF", padding: 20, fontSize: 14 }}>還沒有留言</div>
          ) : (
            comments.map(c => (
              <div key={c._id} style={{ padding: "12px 0", borderBottom: "1px solid #F3F4F6" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <span style={{ fontWeight: 700, fontSize: 13, color: "#1F2937" }}>{c.userId?.username}</span>
                    <span style={{ fontSize: 12, color: "#9CA3AF", marginLeft: 8 }}>{new Date(c.createdAt).toLocaleDateString("zh-TW")}</span>
                  </div>
                  {loggedIn && c.userId?.username === username && (
                    <button onClick={() => handleDeleteComment(c._id)}
                      style={{ fontSize: 12, color: "#9CA3AF", background: "none", border: "none", cursor: "pointer" }}>
                      刪除
                    </button>
                  )}
                </div>
                <div style={{ fontSize: 14, color: "#374151", marginTop: 4 }}>{c.content}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}