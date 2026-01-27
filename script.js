// 地図初期化（日本）
const map = L.map("map").setView([36.5, 138], 6);

// 日本範囲制限
map.setMaxBounds([
  [20, 122],
  [46, 154]
]);

// タイル
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "© OpenStreetMap"
}).addTo(map);

// アイコン
const redIcon = L.icon({
  iconUrl: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
  iconSize: [32, 32]
});

const yellowIcon = L.icon({
  iconUrl: "https://maps.google.com/mapfiles/ms/icons/yellow-dot.png",
  iconSize: [32, 32]
});

// ピン状態切替
function toggleMarker(marker) {
  if (marker.status === "done") {
    marker.status = "want";
    marker.setIcon(yellowIcon);
    marker.bindPopup("🟡 行ってみたい");
  } else {
    marker.status = "done";
    marker.setIcon(redIcon);
    marker.bindPopup("🔴 行った！");
  }
}

// タップでピン追加
map.on("click", (e) => {
  const marker = L.marker(e.latlng, {
    icon: yellowIcon
  }).addTo(map);

  marker.status = "want";
  marker.bindPopup("🟡 行ってみたい");

  marker.on("click", () => toggleMarker(marker));
});

// 検索機能
document.getElementById("searchBtn").onclick = () => {
  const q = document.getElementById("searchInput").value;
  if (!q) return;

  fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${q}`)
    .then(res => res.json())
    .then(data => {
      if (data.length > 0) {
        map.setView([data[0].lat, data[0].lon], 14);
      } else {
        alert("見つかりません");
      }
    })
    .catch(() => alert("検索エラー"));
};
