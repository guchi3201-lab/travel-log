// ================= 地図 =================
const map = L.map("map").setView([36, 138], 5);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);

// アイコン
const blueIcon = new L.Icon.Default();
const redIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

// ================= 世界遺産 =================
const worldHeritage = [
  ["富士山",35.3606,138.7274],
  ["厳島神社",34.295,132.319],
  ["原爆ドーム",34.395,132.453],
  ["姫路城",34.839,134.693],
  ["白川郷",36.260,136.906],
  ["法隆寺",34.614,135.734],
  ["古都京都",35.011,135.768],
  ["古都奈良",34.685,135.804],
  ["日光東照宮",36.758,139.598],
  ["屋久島",30.335,130.512]
];

let visited = JSON.parse(localStorage.getItem("visited") || "{}");

worldHeritage.forEach(([name,lat,lng])=>{
  const marker = L.marker([lat,lng],{
    icon: visited[name] ? redIcon : blueIcon
  }).addTo(map);

  marker.on("click",()=>{
    visited[name] = !visited[name];
    marker.setIcon(visited[name] ? redIcon : blueIcon);
    localStorage.setItem("visited",JSON.stringify(visited));
  });

  marker.bindPopup(`<b>${name}</b><br>世界遺産`);
});

// ================= 自作スポット =================
let spots = JSON.parse(localStorage.getItem("spots") || "[]");

spots.forEach(spot=>{
  const marker = L.marker([spot.lat,spot.lng]).addTo(map);

  let html = `<b>${spot.name}</b><br>${spot.memo}<br>`;
  html += `<div class="photo-row">`;
  spot.photos.forEach(p => {
    html += `<img src="${p}" height="70">`;
  });
  html += `</div>
    <button onclick="editSpot(${spot.id})">編集</button>
    <button onclick="deleteSpot(${spot.id})">削除</button>`;

  marker.bindPopup(html);
});

// ================= 追加モード =================
let addMode = false;
let tempMarker = null;
let selectedLatLng = null;

// UI
const modal = document.getElementById("modal");
const addBtn = document.getElementById("addBtn");
const cancelBtn = document.getElementById("cancelBtn");
const saveBtn = document.getElementById("saveBtn");

addBtn.onclick = () => {
  addMode = true;
  alert("地図をタップして追加したい場所を選んでください");
};

// 地図タップ
map.on("click", e => {
  if (!addMode) return;

  selectedLatLng = e.latlng;

  if (tempMarker) map.removeLayer(tempMarker);

  tempMarker = L.marker(e.latlng).addTo(map);
  tempMarker.bindPopup(`
    <b>この場所を追加しますか？</b><br>
    <button onclick="openAddForm()">この場所を追加</button>
  `).openPopup();
});

window.openAddForm = () => {
  addMode = false;
  modal.classList.remove("hidden");
};

// ================= 写真 =================
let photos = [];
photoInput.onchange = () => {
  for (const file of photoInput.files) {
    if (photos.length >= 5) {
      alert("写真は5枚まで");
      return;
    }
    const r = new FileReader();
    r.onload = e => {
      photos.push(e.target.result);
      renderPhotos();
    };
    r.readAsDataURL(file);
  }
  photoInput.value = "";
};

function renderPhotos() {
  photoPreview.innerHTML = "";
  const row = document.createElement("div");
  row.className = "photo-row";

  photos.forEach((p,i)=>{
    row.innerHTML += `
      <div class="photo">
        <img src="${p}">
        <button onclick="removePhoto(${i})">×</button>
      </div>
    `;
  });

  photoPreview.appendChild(row);
}

window.removePhoto = i => {
  photos.splice(i,1);
  renderPhotos();
};

// ================= 保存・キャンセル =================
cancelBtn.onclick = () => {
  modal.classList.add("hidden");
  photos = [];
  photoPreview.innerHTML = "";
  selectedLatLng = null;

  if (tempMarker) {
    map.removeLayer(tempMarker);
    tempMarker = null;
  }
};

saveBtn.onclick = () => {
  if (!selectedLatLng) {
    alert("地図で場所を選択してください");
    return;
  }

  const spot = {
    id: Date.now(),
    name: nameInput.value,
    memo: memoInput.value,
    lat: selectedLatLng.lat,
    lng: selectedLatLng.lng,
    photos
  };

  spots.push(spot);
  localStorage.setItem("spots", JSON.stringify(spots));

  if (tempMarker) map.removeLayer(tempMarker);

  location.reload();
};

// ================= 編集・削除 =================
window.deleteSpot = id => {
  if (!confirm("削除しますか？")) return;
  spots = spots.filter(s => s.id !== id);
  localStorage.setItem("spots", JSON.stringify(spots));
  location.reload();
};

window.editSpot = id => {
  const s = spots.find(x => x.id === id);
  selectedLatLng = { lat: s.lat, lng: s.lng };
  nameInput.value = s.name;
  memoInput.value = s.memo;
  photos = [...s.photos];
  renderPhotos();
  modal.classList.remove("hidden");
};
