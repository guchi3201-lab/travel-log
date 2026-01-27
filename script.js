// 地図初期化（日本）
const map = L.map("map", {
  minZoom: 5,
  maxZoom: 18,
}).setView([36.5, 138], 6);

// 日本だけ表示
map.setMaxBounds([
  [20, 122],
  [46, 154]
]);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "© OpenStreetMap"
}).addTo(map);

// アイコン
const icons = {
  want: L.icon({
    iconUrl: "https://maps.google.com/mapfiles/ms/icons/yellow-dot.png",
    iconSize: [32, 32]
  }),
  done: L.icon({
    iconUrl: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
    iconSize: [32, 32]
  })
};

// 状態切替
function nextStatus(status) {
  return status === "want" ? "done" : "want";
}

function statusText(status) {
  return status === "done" ? "🔴 行った！" : "🟡 行ってみたい";
}

// ピン作成
function createMarker(latlng) {
  let status = "want";
  let photos = [];
  let comment = "";

  const marker = L.marker(latlng, { icon: icons[status] }).addTo(map);

  function updatePopup() {
    marker.bindPopup(`
      <div class="popup-content">
        <div class="status">${statusText(status)}</div>

        <textarea placeholder="コメント">${comment}</textarea>

        <input type="file" accept="image/*" multiple>

        <div class="photo-list">
          ${photos.map(p => `<img src="${p}">`).join("")}
        </div>

        <button class="delete-btn">削除</button>
      </div>
    `);
  }

  updatePopup();

  marker.on("click", () => {
    status = nextStatus(status);
    marker.setIcon(icons[status]);
    updatePopup();
  });

  marker.on("popupopen", (e) => {
    const popup = e.popup.getElement();
    const textarea = popup.querySelector("textarea");
    const input = popup.querySelector("input");
    const delBtn = popup.querySelector(".delete-btn");

    textarea.value = comment;
    textarea.oninput = () => comment = textarea.value;

    input.onchange = () => {
      for (let file of input.files) {
        if (photos.length >= 5) break;
        photos.push(URL.createObjectURL(file));
      }
      updatePopup();
      marker.openPopup();
    };

    delBtn.onclick = () => map.removeLayer(marker);
  });
}

// 地図タップでピン追加
map.on("click", (e) => {
  createMarker(e.latlng);
});

// 検索機能（全国）
document.getElementById("searchBtn").onclick = () => {
  const q = document.getElementById("searchInput").value;
  if (!q) return;

  fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${q}`)
    .then(res => res.json())
    .then(data => {
      if (data.length > 0) {
        map.setView([data[0].lat, data[0].lon], 14);
      }
    });
};
