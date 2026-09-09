import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client.js";
import { parseCard, extractSkillTags } from "../parser.js";
import { convertDriveLink } from "../utils/imageUrl.js";
import { getUsername } from "../api/auth.js";

export default function AddCardPage() {
  const [cardCode, setCardCode] = useState("");
  const [preview, setPreview] = useState(null);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [imageSource, setImageSource] = useState("");
  const [promoUrl, setPromoUrl] = useState("");
  const [description, setDescription] = useState("");

  // 進階設定：作者資訊
  const [authorAdvOpen, setAuthorAdvOpen] = useState(false);
  const [proxySubmit, setProxySubmit] = useState(false);
  const [authorName, setAuthorName] = useState("");
  const [proxyName, setProxyName] = useState("");

  function toggleProxy() {
    setProxySubmit(p => {
      const next = !p;
      setAuthorName("");
      return next;
    });
  }

  // 複製權限（開關，預設開啟）
  const [copyEnabled, setCopyEnabled] = useState(true);

  // 進階設定：卡片圖片
  const [advOpen, setAdvOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [imgOk, setImgOk] = useState(false);
  const [imgWarning, setImgWarning] = useState("");
  const [driveConverted, setDriveConverted] = useState(false);
  const [showImgHelp, setShowImgHelp] = useState(false);
  const [cropX, setCropX] = useState(50);
  const [cropY, setCropY] = useState(50);
  const [cropZoom, setCropZoom] = useState(1);
  const cropBoxRef = useRef(null);

  function handleImageUrlChange(raw) {
    const converted = convertDriveLink(raw);
    setDriveConverted(converted !== raw);
    setImageUrl(converted);
    setImgOk(false);
    setImgWarning("");
  }

  function handleImageLoad(e) {
    const { naturalWidth: w, naturalHeight: h } = e.target;
    setImgOk(true);
    if (w > 2000 || h > 2000) {
      setImgWarning(`圖片解析度較高（${w}×${h}），建議先壓縮再使用，載入速度會比較快`);
    } else {
      setImgWarning("");
    }
  }

  function handleImageError() {
    setImgOk(false);
    setImgWarning("圖片網址載入失敗，請確認網址是否正確");
  }

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
        imageUrl: imageUrl.trim(),
        imageCrop: imageUrl.trim() ? { x: cropX, y: cropY, zoom: cropZoom } : null,
        skillTags: extractSkillTags(cardCode.trim()),
        description: description.trim(),
        promoUrl: promoUrl.trim(),
        copyEnabled,
        authorName: proxySubmit ? authorName.trim() : (authorName.trim() || getUsername() || ""),
        proxySubmit,
        proxyName: proxySubmit ? (proxyName.trim() || getUsername() || "") : ""
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
              fb 貼文網址 <span style={{ color: "#9CA3AF" }}>（選填）</span>
            </div>
            <input value={promoUrl} onChange={e => setPromoUrl(e.target.value)}
              placeholder="例如：社團 FB 貼文連結"
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

          {/* 複製權限：開關，預設開啟 */}
          <label style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 12, padding: "10px 12px", background: "#F3F4F6", borderRadius: 10, cursor: "pointer" }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#374151" }}>允許複製卡片碼</span>
            <input type="checkbox" checked={copyEnabled} onChange={e => setCopyEnabled(e.target.checked)}
              style={{ width: 18, height: 18, cursor: "pointer" }} />
          </label>

          {/* 進階設定：作者資訊 */}
          <div style={{ marginTop: 12 }}>
            <div onClick={() => setAuthorAdvOpen(o => !o)}
              style={{ cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 12px", background: "#F3F4F6", borderRadius: 10, fontSize: 13, fontWeight: 700, color: "#374151", userSelect: "none" }}>
              <span>⚙️ 進階設定（作者資訊）</span>
              <span>{authorAdvOpen ? "▲" : "▼"}</span>
            </div>

            {authorAdvOpen && (
              <div style={{ border: "1.5px solid #E5E7EB", borderTop: "none", borderRadius: "0 0 10px 10px", padding: 14 }}>
                <button type="button" onClick={toggleProxy}
                  style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", background: proxySubmit ? "#1F2937" : "#F3F4F6", color: proxySubmit ? "white" : "#374151", border: "none", borderRadius: 8, fontWeight: 700, cursor: "pointer", fontSize: 13, marginBottom: 12 }}>
                  {proxySubmit ? "✓ 代為投稿" : "代為投稿"}
                </button>

                {proxySubmit ? (
                  <>
                    <div style={{ fontSize: 12, color: "#6B7280", marginBottom: 10, lineHeight: 1.6 }}>
                      已標記為代投，「代投人名稱」是你自己，「作者名稱」填原作者
                    </div>
                    <div style={{ fontSize: 13, color: "#374151", marginBottom: 6 }}>代投人名稱</div>
                    <input value={proxyName} onChange={e => setProxyName(e.target.value)}
                      placeholder="預設為你的帳號名稱"
                      style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1.5px solid #D1D5DB", fontSize: 14, boxSizing: "border-box", outline: "none", marginBottom: 12 }} />
                    <div style={{ fontSize: 13, color: "#374151", marginBottom: 6 }}>作者名稱 <span style={{ color: "#9CA3AF" }}>（選填）</span></div>
                    <input value={authorName} onChange={e => setAuthorName(e.target.value)}
                      placeholder="填入原作者名稱"
                      style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1.5px solid #D1D5DB", fontSize: 14, boxSizing: "border-box", outline: "none" }} />
                  </>
                ) : (
                  <>
                    <div style={{ fontSize: 12, color: "#6B7280", marginBottom: 10, lineHeight: 1.6 }}>
                      如果是幫別人上傳卡片，開啟上面的開關
                    </div>
                    <div style={{ fontSize: 13, color: "#374151", marginBottom: 6 }}>作者名稱</div>
                    <input value={authorName} onChange={e => setAuthorName(e.target.value)}
                      placeholder="預設為你的帳號名稱"
                      style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1.5px solid #D1D5DB", fontSize: 14, boxSizing: "border-box", outline: "none" }} />
                  </>
                )}
              </div>
            )}
          </div>

          {/* 進階設定：卡片圖片 */}
          <div style={{ marginTop: 12 }}>
            <div onClick={() => setAdvOpen(o => !o)}
              style={{ cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 12px", background: "#F3F4F6", borderRadius: 10, fontSize: 13, fontWeight: 700, color: "#374151", userSelect: "none" }}>
              <span>⚙️ 進階設定（卡片圖片）</span>
              <span>{advOpen ? "▲" : "▼"}</span>
            </div>

            {advOpen && (
              <div style={{ border: "1.5px solid #E5E7EB", borderTop: "none", borderRadius: "0 0 10px 10px", padding: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                  <span style={{ fontSize: 13, color: "#374151" }}>圖片網址</span>
                  <button type="button" onClick={() => setShowImgHelp(s => !s)}
                    style={{ width: 18, height: 18, borderRadius: "50%", border: "1px solid #D1D5DB", background: showImgHelp ? "#1F2937" : "white", color: showImgHelp ? "white" : "#6B7280", fontSize: 11, fontWeight: 700, cursor: "pointer", lineHeight: "16px", padding: 0 }}>
                    ?
                  </button>
                </div>

                {showImgHelp && (
                  <div style={{ fontSize: 12, color: "#4B5563", background: "#F9FAFB", border: "1px solid #E5E7EB", borderRadius: 8, padding: "10px 12px", marginBottom: 10, lineHeight: 1.7 }}>
                    <div style={{ fontWeight: 700, marginBottom: 4 }}>✅ 通常可以用</div>
                    以 .jpg / .png / .webp 結尾的圖片直連網址、Imgur 直連（i.imgur.com/xxx.png）、ImgBB、Cloudinary 等圖床
                    <div style={{ fontWeight: 700, margin: "8px 0 4px" }}>⚠️ 常見會失敗</div>
                    巴哈姆特相簿、Pixiv（防盜鏈）、Discord 連結（會過期）、Facebook/Instagram（需登入）、網頁連結（不是圖片檔案本身）
                    <div style={{ fontWeight: 700, margin: "8px 0 4px" }}>Google Drive</div>
                    貼分享連結會自動幫你轉換成可用格式，但這個做法不是 Google 官方保證的功能，未來仍可能失效
                  </div>
                )}

                <input value={imageUrl} onChange={e => handleImageUrlChange(e.target.value)}
                  placeholder="貼上要顯示的卡片圖片網址"
                  style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1.5px solid #D1D5DB", fontSize: 14, boxSizing: "border-box", outline: "none" }} />
                {driveConverted && (
                  <div style={{ fontSize: 12, color: "#059669", marginTop: 6 }}>✓ 已自動轉換為 Google Drive 縮圖網址</div>
                )}

                {imageUrl.trim() && (
                  <div style={{ marginTop: 12 }}>
                    <div style={{ fontSize: 12, color: "#6B7280", marginBottom: 6 }}>
                      預覽（用下方拉桿調整焦點位置）
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <div ref={cropBoxRef}
                        style={{ position: "relative", flex: 1, aspectRatio: "1.5 / 1", borderRadius: 10, overflow: "hidden", background: "#F3F4F6" }}>
                        <img src={imageUrl} onLoad={handleImageLoad} onError={handleImageError}
                          style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: `${cropX}% ${cropY}%`, transform: `scale(${cropZoom})`, transformOrigin: `${cropX}% ${cropY}%`, display: "block" }} />
                        {imgOk && (
                          <div style={{ position: "absolute", left: `${cropX}%`, top: `${cropY}%`, width: 14, height: 14, marginLeft: -7, marginTop: -7, borderRadius: "50%", border: "2px solid white", boxShadow: "0 0 0 1px rgba(0,0,0,0.4)", pointerEvents: "none" }} />
                        )}
                      </div>
                      {imgOk && (
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 28 }}>
                          <input type="range" min="0" max="100" value={cropY} orient="vertical"
                            onChange={e => setCropY(Number(e.target.value))}
                            style={{ WebkitAppearance: "slider-vertical", width: 8, height: "100%" }} />
                        </div>
                      )}
                    </div>
                    {imgOk && (
                      <div style={{ marginTop: 8 }}>
                        <input type="range" min="0" max="100" value={cropX}
                          onChange={e => setCropX(Number(e.target.value))}
                          style={{ width: "100%" }} />
                      </div>
                    )}
                    {imgOk && (
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 10 }}>
                        <span style={{ fontSize: 12, color: "#6B7280", whiteSpace: "nowrap" }}>縮放 {cropZoom.toFixed(2)}x</span>
                        <input type="range" min="1" max="3" step="0.05" value={cropZoom}
                          onChange={e => setCropZoom(Number(e.target.value))}
                          style={{ flex: 1 }} />
                        <button type="button" onClick={() => { setCropX(50); setCropY(50); setCropZoom(1); }}
                          style={{ fontSize: 12, color: "#374151", background: "#F3F4F6", border: "none", borderRadius: 8, padding: "6px 10px", cursor: "pointer", whiteSpace: "nowrap" }}>
                          重設
                        </button>
                      </div>
                    )}
                    {imgWarning && <div style={{ fontSize: 12, color: "#D97706", marginTop: 6 }}>⚠️ {imgWarning}</div>}
                  </div>
                )}
              </div>
            )}
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