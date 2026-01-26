// 日本を中心に地図表示
const map = L.map("map").setView([36.2048, 138.2529], 5);

// 地図タイル
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "© OpenStreetMap contributors"
}).addTo(map);

// テスト用ピン（東京）
L.marker([35.681236, 139.767125])
  .addTo(map)
  .bindPopup("東京");
