// 把常見的 Google Drive 分享連結格式，自動轉成目前還能用的縮圖直連網址
// 支援：
//   https://drive.google.com/file/d/檔案ID/view?...
//   https://drive.google.com/open?id=檔案ID
//   https://drive.google.com/uc?export=view&id=檔案ID（舊格式，已不穩定，一併轉換）
export function convertDriveLink(url) {
  if (!url) return url;
  const patterns = [
    /drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/,
    /drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/,
    /drive\.google\.com\/uc\?.*[?&]id=([a-zA-Z0-9_-]+)/,
  ];
  for (const re of patterns) {
    const m = url.match(re);
    if (m) return `https://drive.google.com/thumbnail?id=${m[1]}&sz=w1000`;
  }
  return url;
}