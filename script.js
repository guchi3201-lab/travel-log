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
const spots = [
  { name: "太宰府天満宮", lat: 33.5215, lng: 130.5346 },
  { name: "清水寺", lat: 34.9948, lng: 135.7850 },
  { name: "浅草寺", lat: 35.7148, lng: 139.7967 },
  { name: "厳島神社", lat: 34.2950, lng: 132.3199 },
  { name: "札幌時計台", lat: 43.0621, lng: 141.3544 }
];

spots.forEach(s => {
  L.marker([s.lat, s.lng])
    .addTo(map)
    .bindPopup(s.name);
});
