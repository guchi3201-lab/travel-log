// ================= 地図初期化 =================
const map = L.map("map").setView([36, 138], 5);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);

// ================= データ =================
let spots = JSON.parse(localStorage.getItem("spots") || "[]");
let tempMarker = null;
let selectedLatLng = null;

// ================= 既存ピン表示 =================
spots.forEach(drawSpot);

// ================= 地図タップ → 追加候補 =================
map.on("click", e => {
  selectedLatLng = e.latlng;

  if (tempMarker) map.removeLayer(tempMarker);

  tempMarker = L.marker(e.latlng).addTo(map);
  tempMarker.bindPopup(`
    <b>ここにピンを立てますか？</b><br>
    <button onclick="createSpot()">ピンを立てる</button>
  `).openPopup();
});

// ================= ピン作成 =================
window.createSpot = () => {
  const spot = {
    id: Date.now(),
    lat: selectedLatLng.lat,
    lng: selectedLatLng.lng,
    memo: "",
    photos: []
  };

  spots.push(spot);
  save();
  map.removeLayer(tempMarker);
  tempMarker = null;
  drawSpot(spot);
};

// ================= ピン描画 =================
function drawSpot(spot) {
  const marker = L.marker([spot.lat, spot.lng]).addTo(map);
  marker.on("click", () => {
    marker.bindPopup(renderPopup(spot)).openPopup();
  });
}

// ================= ポップアップ内容 =================
function renderPopup(spot) {
  let html = `
    <textarea id="memo-${spot.id}" placeholder="コメント">${spot.memo}</textarea>
    <div class="photo-row">
  `;

  spot.photos.forEach((p, i) => {
    html += `
      <div class="photo">
        <img src="${p}">
        <button onclick="removePhoto(${spot.id},${i})">×</button>
      </div>
    `;
  });

  html += `
    </div>
    <input type="file" accept="image/*" multiple onchange="addPhoto(event,${spot.id})">
    <br>
    <button onclick="saveSpot(${spot.id})">保存</button>
    <button onclick="deleteSpot(${spot.id})">削除</button>
  `;

  return html;
}

// ================= 保存 =================
window.saveSpot = id => {
  const spot = spots.find(s => s.id === id);
  spot.memo = document.getElementById(`memo-${id}`).value;
  save();
  alert("保存しました");
};

// ================= 写真追加 =================
window.addPhoto = (event, id) => {
  const spot = spots.find(s => s.id === id);

  for (const file of event.target.files) {
    if (spot.photos.length >= 5) {
      alert("写真は5枚まで");
      return;
    }
    const reader = new FileReader();
    reader.onload = e => {
      spot.photos.push(e.target.result);
      save();
      location.reload();
    };
    reader.readAsDataURL(file);
  }
};

// ================= 写真削除 =================
window.removePhoto = (id, index) => {
  const spot = spots.find(s => s.id === id);
  spot.photos.splice(index, 1);
  save();
  location.reload();
};

// ================= 削除 =================
window.deleteSpot = id => {
  if (!confirm("このピンを削除しますか？")) return;
  spots = spots.filter(s => s.id !== id);
  save();
  location.reload();
};

// ================= 保存処理 =================
function save() {
  localStorage.setItem("spots", JSON.stringify(spots));
}
