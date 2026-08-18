const BASE_URL = "https://card-viewer-api.onrender.com/api";

// 取得 token
function getToken() {
  return localStorage.getItem("token");
}

// 通用請求函數
async function request(path, options = {}) {
  const headers = { "Content-Type": "application/json" };

  const token = getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers
  });

  const data = await res.json();

  if (!res.ok) throw new Error(data.message || "請求失敗");

  return data;
}

export const api = {
  // 認證
  register: (username, password) =>
    request("/auth/register", { method: "POST", body: JSON.stringify({ username, password }) }),

  login: (username, password) =>
    request("/auth/login", { method: "POST", body: JSON.stringify({ username, password }) }),

  // 卡片
  getCards: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/cards${query ? "?" + query : ""}`);
  },

  getCard: (id) => request(`/cards/${id}`),

  createCard: (data) =>
    request("/cards", { method: "POST", body: JSON.stringify(data) }),

  deleteCard: (id) =>
    request(`/cards/${id}`, { method: "DELETE" }),

  // 互動
  toggleLike: (cardId) =>
    request(`/interactions/${cardId}/like`, { method: "POST" }),

  getComments: (cardId) =>
    request(`/interactions/${cardId}/comments`),

  addComment: (cardId, content) =>
    request(`/interactions/${cardId}/comment`, { method: "POST", body: JSON.stringify({ content }) }),

  deleteComment: (commentId) =>
    request(`/interactions/comment/${commentId}`, { method: "DELETE" }),
};