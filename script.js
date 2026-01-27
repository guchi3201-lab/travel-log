// 地図を表示（久留米付近）
const map = L.map("map").setView([33.3193, 130.5087], 13);

// OpenStreetMap
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "© OpenStreetMap contributors"
}).addTo(map);

let selectedLatLng = null;

// タップした場所を取得
map.on("click", (e) => {
  selectedLatLng = e.latlng;

  const addBox = document.getElementById("addBox");
  addBox.classList.remove("hidden");
});

// ピン追加
document.getElementById("addPinBtn").addEventListener("click", () => {
  if (!selectedLatLng) return;

  const comment = prompt("コメントを入力してください");
  const imageUrl = prompt("画像URL（なければ空でOK）");

  let popupContent = `<p>${comment || "コメントなし"}</p>`;

  if (imageUrl) {
    popupContent += `<img src="${imageUrl}" width="150">`;
  }

  L.marker(selectedLatLng)
    .addTo(map)
    .bindPopup(popupContent);

  document.getElementById("addBox").classList.add("hidden");
  selectedLatLng = null;
});
