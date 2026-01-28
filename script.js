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
    iconSize: [32, 32],
    iconAnchor: [16, 32]
  }),
  done: L.icon({
    iconUrl: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
    iconSize: [32, 32],
    iconAnchor: [16, 32]
  })
};

// ===== 保存 =====
let markers = [];

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

// ===== ポップアップ =====
function createPopup(marker) {
  const div = document.createElement("div");

  const status = document.createElement("div");
  status.textContent = marker.status === "want"
    ? "🟡 行ってみたい（タップで切替）"
    : "🔴 行った！（タップで切替）";
  status.style.fontWeight = "bold";
  status.style.marginBottom = "6px";

  status.onclick = () => {
    marker.status = marker.status === "want" ? "done" : "want";
    marker.setIcon(icons[marker.status]);
    savePins();
    marker.setPopupContent(createPopup(marker));
  };

  const textarea = document.createElement("textarea");
  textarea.placeholder = "コメントを書く";
  textarea.value = marker.comment;
  textarea.style.width = "100%";
  textarea.style.height = "60px";
  textarea.oninput = () => {
    marker.comment = textarea.value;
    savePins();
  };

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

  const delBtn = document.createElement("button");
  delBtn.textContent = "ピンを削除";
  delBtn.style.width = "100%";
  delBtn.style.marginTop = "6px";
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

  marker.on("popupopen", () => {
    marker.setPopupContent(createPopup(marker));
  });

  marker.bindPopup("読み込み中…");

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
