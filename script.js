// ===== 地図 =====
const map = L.map("map").setView([36.5, 138], 6);

map.setMaxBounds([
  [20, 122],
  [46, 154]
]);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "© OpenStreetMap"
}).addTo(map);

// ===== アイコン =====
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

// ===== 保存 =====
function savePins() {
  const data = markers.map(m => ({
    lat: m.getLatLng().lat,
    lng: m.getLatLng().lng,
    status: m.status,
    comment: m.comment,
    photos: m.photos
  }));
  localStorage.setItem("travelPins", JSON.stringify(data));
}

// ===== ピン管理 =====
let markers = [];

// ===== ポップアップ作成 =====
function createPopup(marker) {
  const div = document.createElement("div");

  // 状態表示
  const status = document.createElement("div");
  status.textContent = marker.status === "want" ? "🟡 行ってみたい" : "🔴 行った！";
  status.style.fontWeight = "bold";

  // コメント
  const textarea = document.createElement("textarea");
  textarea.placeholder = "コメントを書く";
  textarea.value = marker.comment;
  textarea.oninput = () => {
    marker.comment = textarea.value;
    savePins();
  };

  // 写真表示
  const photosDiv = document.createElement("div");
  photosDiv.style.display = "flex";
  photosDiv.style.gap = "6px";
  photosDiv.style.overflowX = "auto";
  photosDiv.style.margin = "6px 0";

  function renderPhotos() {
    photosDiv.innerHTML = "";
    marker.photos.forEach((src, i) => {
      const img = document.createElement("img");
      img.src = src;
      img.style.width = "70px";
      img.style.height = "70px";
      img.style.objectFit = "cover";
      img.style.borderRadius = "6px";
      img.onclick = () => {
        if (confirm("この写真を削除しますか？")) {
          marker.photos.splice(i, 1);
          renderPhotos();
          savePins();
        }
      };
      photosDiv.appendChild(img);
    });
  }

  renderPhotos();

  // 写真追加
  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.accept = "image/*";
  fileInput.multiple = true;

  fileInput.onchange = () => {
    const files = Array.from(fileInput.files)
      .slice(0, 5 - marker.photos.length);

    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = e => {
        marker.photos.push(e.target.result);
        renderPhotos();
        savePins();
      };
      reader.readAsDataURL(file);
    });
    fileInput.value = "";
  };

  // 削除
  const delBtn = document.createElement("button");
  delBtn.textContent = "ピンを削除";
  delBtn.onclick = () => {
    map.removeLayer(marker);
    markers = markers.filter(m => m !== marker);
    savePins();
  };

  div.appendChild(status);
  div.appendChild(textarea);
  div.appendChild(photosDiv);
  div.appendChild(fileInput);
  div.appendChild(delBtn);

  return div;
}

// ===== ピン追加 =====
function addMarker(data) {
  const marker = L.marker([data.lat, data.lng], {
    icon: icons[data.status]
  }).addTo(map);

  marker.status = data.status;
  marker.comment = data.comment || "";
  marker.photos = data.photos || [];

  marker.on("click", () => {
    marker.status = marker.status === "want" ? "done" : "want";
    marker.setIcon(icons[marker.status]);
    savePins();
  });

  marker.bindPopup(() => createPopup(marker));
  markers.push(marker);
}

// ===== マップタップ =====
map.on("click", e => {
  addMarker({
    lat: e.latlng.lat,
    lng: e.latlng.lng,
    status: "want",
    comment: "",
    photos: []
  });
  savePins();
});

// ===== 読み込み =====
const saved = JSON.parse(localStorage.getItem("travelPins") || "[]");
saved.forEach(addMarker);

// ===== 検索 =====
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
    });
};
