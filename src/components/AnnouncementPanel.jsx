import { useState, useEffect } from "react";
import { api } from "../api/client.js";

const TYPE_ICON = { pinned: "📌", notice: "📢", changelog: "📝" };
const TYPE_LABEL = { pinned: "置頂說明", notice: "公告", changelog: "更新日誌" };

export default function AnnouncementPanel({ isAdmin }) {
  const [announcements, setAnnouncements] = useState([]);
  const [selected, setSelected] = useState(null);
  const [showPanel, setShowPanel] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);

  // 管理員新增/編輯用
  const [form, setForm] = useState({ type: "notice", title: "", content: "", version: "", pinned: false });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => { fetchAnnouncements(); }, []);

  async function fetchAnnouncements() {
    try {
      const data = await api.getAnnouncements();
      setAnnouncements(data);
      if (data.length > 0 && !selected) setSelected(data[0]);
    } catch (e) { console.error(e); }
  }

  async function handleSubmit() {
    try {
      if (editingId) {
        await api.updateAnnouncement(editingId, form);
      } else {
        await api.createAnnouncement(form);
      }
      setForm({ type: "notice", title: "", content: "", version: "", pinned: false });
      setEditingId(null);
      setShowAdmin(false);
      fetchAnnouncements();
    } catch (e) { console.error(e); }
  }

  async function handleDelete(id) {
    if (!confirm("確定刪除？")) return;
    try {
      await api.deleteAnnouncement(id);
      setSelected(null);
      fetchAnnouncements();
    } catch (e) { console.error(e); }
  }

  function handleEdit(a) {
    setForm({ type: a.type, title: a.title, content: a.content, version: a.version || "", pinned: a.pinned });
    setEditingId(a._id);
    setShowAdmin(true);
  }

  if (announcements.length === 0 && !isAdmin) return null;

  return (
    <div style={{ marginBottom: 20 }}>
      {/* 觸發按鈕 */}
      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <button onClick={() => setShowPanel(s => !s)}
          style={{ flex: 1, padding: "12px 20px", background: "white", border: "1.5px solid #E5E7EB", borderRadius: 14, cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
          <span style={{ fontWeight: 700, fontSize: 15, color: "#1F2937" }}>
            📋 公告與更新日誌
            {announcements.length > 0 && (
              <span style={{ marginLeft: 8, background: "#EF4444", color: "white", borderRadius: 10, fontSize: 11, padding: "2px 7px" }}>{announcements.length}</span>
            )}
          </span>
          <span style={{ color: "#9CA3AF" }}>{showPanel ? "▲" : "▼"}</span>
        </button>
        {isAdmin && (
          <button onClick={() => { setShowAdmin(s => !s); setEditingId(null); setForm({ type: "notice", title: "", content: "", version: "", pinned: false }); }}
            style={{ padding: "12px 16px", background: "#1F2937", color: "white", border: "none", borderRadius: 14, cursor: "pointer", fontWeight: 700, fontSize: 13 }}>
            + 新增
          </button>
        )}
      </div>

      {/* 管理員新增/編輯表單 */}
      {isAdmin && showAdmin && (
        <div style={{ background: "white", borderRadius: 14, padding: 20, marginTop: 10, boxShadow: "0 2px 12px rgba(0,0,0,0.07)", border: "1.5px solid #E5E7EB" }}>
          <div style={{ fontWeight: 700, marginBottom: 14 }}>{editingId ? "編輯公告" : "新增公告"}</div>
          <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
            <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
              style={{ flex: 1, padding: "8px 12px", borderRadius: 8, border: "1.5px solid #D1D5DB", fontSize: 14, outline: "none" }}>
              <option value="pinned">📌 置頂說明</option>
              <option value="notice">📢 重要公告</option>
              <option value="changelog">📝 更新日誌</option>
            </select>
            <input value={form.version} onChange={e => setForm(f => ({ ...f, version: e.target.value }))}
              placeholder="版本號（選填）"
              style={{ flex: 1, padding: "8px 12px", borderRadius: 8, border: "1.5px solid #D1D5DB", fontSize: 14, outline: "none" }} />
          </div>
          <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            placeholder="標題"
            style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1.5px solid #D1D5DB", fontSize: 14, outline: "none", boxSizing: "border-box", marginBottom: 10 }} />
          <textarea value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
            placeholder="內容"
            style={{ width: "100%", height: 100, padding: "8px 12px", borderRadius: 8, border: "1.5px solid #D1D5DB", fontSize: 14, outline: "none", boxSizing: "border-box", resize: "vertical", marginBottom: 10 }} />
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#374151", cursor: "pointer" }}>
              <input type="checkbox" checked={form.pinned} onChange={e => setForm(f => ({ ...f, pinned: e.target.checked }))} />
              置頂
            </label>
            <div style={{ flex: 1 }} />
            <button onClick={() => setShowAdmin(false)}
              style={{ padding: "8px 16px", background: "#F3F4F6", color: "#374151", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600 }}>取消</button>
            <button onClick={handleSubmit}
              style={{ padding: "8px 16px", background: "#1F2937", color: "white", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 700 }}>
              {editingId ? "儲存" : "新增"}
            </button>
          </div>
        </div>
      )}

      {/* 公告小視窗 */}
      {showPanel && (
        <div style={{ background: "white", borderRadius: 14, marginTop: 10, boxShadow: "0 2px 12px rgba(0,0,0,0.07)", border: "1.5px solid #E5E7EB", overflow: "hidden", display: "flex", minHeight: 200 }}>

          {/* 左側列表 */}
          <div style={{ width: 200, borderRight: "1px solid #E5E7EB", flexShrink: 0 }}>
            {announcements.map(a => (
              <div key={a._id} onClick={() => setSelected(a)}
                style={{ padding: "12px 16px", cursor: "pointer", borderBottom: "1px solid #F3F4F6", background: selected?._id === a._id ? "#F8FAFC" : "white", borderLeft: selected?._id === a._id ? "3px solid #1F2937" : "3px solid transparent" }}>
                <div style={{ fontSize: 12, color: "#9CA3AF", marginBottom: 3 }}>
                  {TYPE_ICON[a.type]} {TYPE_LABEL[a.type]}
                  {a.version && <span style={{ marginLeft: 4, color: "#6B7280" }}>{a.version}</span>}
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#1F2937", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.title}</div>
                <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 2 }}>
                  {new Date(a.createdAt).toLocaleDateString("zh-TW")}
                </div>
              </div>
            ))}
          </div>

          {/* 右側詳細內容 */}
          <div style={{ flex: 1, padding: 20 }}>
            {selected ? (
              <>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                  <div>
                    <div style={{ fontSize: 12, color: "#9CA3AF", marginBottom: 4 }}>
                      {TYPE_ICON[selected.type]} {TYPE_LABEL[selected.type]}
                      {selected.version && <span style={{ marginLeft: 6, background: "#F3F4F6", padding: "1px 8px", borderRadius: 8, fontSize: 11 }}>{selected.version}</span>}
                    </div>
                    <div style={{ fontSize: 17, fontWeight: 800, color: "#1F2937" }}>{selected.title}</div>
                    <div style={{ fontSize: 12, color: "#9CA3AF", marginTop: 2 }}>
                      {new Date(selected.createdAt).toLocaleDateString("zh-TW")}
                    </div>
                  </div>
                  {isAdmin && (
                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={() => handleEdit(selected)}
                        style={{ fontSize: 12, padding: "5px 12px", background: "#F3F4F6", border: "none", borderRadius: 6, cursor: "pointer", fontWeight: 600 }}>編輯</button>
                      <button onClick={() => handleDelete(selected._id)}
                        style={{ fontSize: 12, padding: "5px 12px", background: "#FEE2E2", color: "#EF4444", border: "none", borderRadius: 6, cursor: "pointer", fontWeight: 600 }}>刪除</button>
                    </div>
                  )}
                </div>
                <div style={{ fontSize: 14, color: "#374151", lineHeight: 1.8, whiteSpace: "pre-wrap" }}>{selected.content}</div>
              </>
            ) : (
              <div style={{ color: "#9CA3AF", fontSize: 14, textAlign: "center", marginTop: 40 }}>選擇左側項目查看內容</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}