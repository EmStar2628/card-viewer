export function saveAuth(token, username) {
  localStorage.setItem("token", token);
  localStorage.setItem("username", username);
}

export function clearAuth() {
  localStorage.removeItem("token");
  localStorage.removeItem("username");
}

export function getUsername() {
  return localStorage.getItem("username");
}

export function isLoggedIn() {
  return !!localStorage.getItem("token");
}