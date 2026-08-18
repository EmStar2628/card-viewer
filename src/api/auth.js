export function saveAuth(token, username, isAdmin = false) {
  localStorage.setItem("token", token);
  localStorage.setItem("username", username);
  localStorage.setItem("isAdmin", isAdmin ? "true" : "false");
}

export function clearAuth() {
  localStorage.removeItem("token");
  localStorage.removeItem("username");
  localStorage.removeItem("isAdmin");
}

export function getUsername() {
  return localStorage.getItem("username");
}

export function isLoggedIn() {
  return !!localStorage.getItem("token");
}

export function getIsAdmin() {
  return localStorage.getItem("isAdmin") === "true";
}