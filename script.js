// ===== 地図 =====
const map = L.map("map").setView([36.5, 138], 5);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "© OpenStreetMap"
}).addTo(map);

// ===== データ =====
let pins = JSON.parse(localStorage.getItem("pins") || "[]");
let selectedPin = null;
let markers = [];

// ===== 赤ピン =====
const redIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconAnchor: [12, 41]
});

// ===== 表示 =====
function savePins() {
  localStorage.setItem("pins", JSON.stringify(pins));
}

function renderPins() {
  markers.forEach(m => map.removeLayer(m));
  markers = [];

  pins.forEach(pin => {
    const marker = L.marker([pin.lat, pin.lng], { icon: redIcon }).addTo(map);
    marker.on("click", () => selectPin(pin));
    markers.push(marker);
  });
}

// ===== ピン選択 =====
function selectPin(pin) {
  selectedPin = pin;
  document.getElementById("comment").value = pin.comment || "";
  renderPhotos(pin.photos || []);
}

// ===== 写真表示 =====
function renderPhotos(photos) {
  const list = document.getElementById("photoList");
  list.innerHTML = "";
  photos.forEach(src => {
    const img = document.createElement("img");
    img.src = src;
    list.appendChild(img);
  });
}

// ===== 地図タップ =====
map.on("click", e => {
  const pin = {
    id: Date.now(),
    lat: e.latlng.lat,
    lng: e.latlng.lng,
    comment: "",
    photos: []
  };
  pins.push(pin);
  savePins();
  renderPins();
  selectPin(pin);
});

// ===== 保存 =====
document.getElementById("saveBtn").onclick = () => {
  if (!selectedPin) return;

  selectedPin.comment = document.getElementById("comment").value;

  const files = document.getElementById("photoInput").files;
  if (files.length + (selectedPin.photos?.length || 0) > 5) {
    alert("写真は最大5枚まで");
    return;
  }

  for (const file of files) {
    const reader = new FileReader();
    reader.onload = e => {
      selectedPin.photos.push(e.target.result);
      savePins();
      renderPhotos(selectedPin.photos);
    };
    reader.readAsDataURL(file);
  }

  savePins();
  alert("保存しました");
};

// ===== 削除 =====
document.getElementById("deleteBtn").onclick = () => {
  if (!selectedPin) return;
  pins = pins.filter(p => p.id !== selectedPin.id);
  selectedPin = null;
  document.getElementById("comment").value = "";
  document.getElementById("photoList").innerHTML = "";
  savePins();
  renderPins();
};

// ===== 検索 =====
document.getElementById("searchBtn").onclick = async () => {
  const q = document.getElementById("searchInput").value;
  if (!q) return;

  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&q=${q}`
  );
  const data = await res.json();
  if (data.length > 0) {
    map.fitBounds([
      [data[0].lat, data[0].lon],
      [data[0].lat, data[0].lon]
    ], { maxZoom: 8 });
  }
};

// 初期表示
renderPins();
