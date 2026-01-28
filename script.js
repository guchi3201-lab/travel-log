// 地図初期化（日本）
const map = L.map("map", {
  minZoom: 5,
  maxZoom: 18
}).setView([36.5, 138], 6);

// OSM
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "© OpenStreetMap"
}).addTo(map);

// ピン管理
let currentMarker = null;

// アイコン
const redIcon = new L.Icon({
  iconUrl: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
  iconSize: [32, 32],
  iconAnchor: [16, 32]
});

const yellowIcon = new L.Icon({
  iconUrl: "https://maps.google.com/mapfiles/ms/icons/yellow-dot.png",
  iconSize: [32, 32],
  iconAnchor: [16, 32]
});

// 地図タップでピン追加（赤から）
map.on("click", e => {
  const marker = L.marker(e.latlng, { icon: redIcon }).addTo(map);
  marker.status = "行った！";
  marker.photos = [];

  marker.on("click", () => openPanel(marker));
});

// パネル表示
function openPanel(marker) {
  currentMarker = marker;

  // 状態切り替え
  if (marker.status === "行った！") {
    marker.status = "行ってみたい！";
    marker.setIcon(yellowIcon);
  } else {
    marker.status = "行った！";
    marker.setIcon(redIcon);
  }

  document.getElementById("pinStatus").textContent = marker.status;
  document.getElementById("pinPanel").classList.add("show");
}

// ピン削除
document.getElementById("deletePin").onclick = () => {
  if (!currentMarker) return;
  map.removeLayer(currentMarker);
  currentMarker = null;
  document.getElementById("pinPanel").classList.remove("show");
};

// 写真追加（5枚まで）
document.getElementById("photoInput").addEventListener("change", e => {
  if (!currentMarker) return;

  const preview = document.getElementById("photoPreview");
  preview.innerHTML = "";

  const files = Array.from(e.target.files).slice(0, 5);
  currentMarker.photos = files;

  files.forEach(file => {
    const img = document.createElement("img");
    img.src = URL.createObjectURL(file);
    preview.appendChild(img);
  });
});

// 検索
document.getElementById("searchBtn").onclick = () => {
  const q = document.getElementById("searchInput").value;
  if (!q) return;

  fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${q}&countrycodes=jp`)
    .then(res => res.json())
    .then(data => {
      if (data.length > 0) {
        map.setView([data[0].lat, data[0].lon], 14);
      }
    });
};
