const map = L.map("map").setView([35, 135], 5);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);

let memories = JSON.parse(localStorage.getItem("memories") || "[]");
let current = null;

/* ピン生成 */
function createIcon(rate) {
  return L.divIcon({
    className: "",
    iconSize: [30, 42],
    iconAnchor: [15, 42],
    html: `<div class="pin rate${rate}"></div>`
  });
}

/* 保存 */
function saveAll() {
  localStorage.setItem("memories", JSON.stringify(memories));
}

/* マーカー描画 */
function renderMarker(m) {
  if (m.marker) map.removeLayer(m.marker);

  m.marker = L.marker(m.latlng, {
    icon: createIcon(m.rate)
  }).addTo(map);

  m.marker.on("click", () => openInfo(m));
}

/* 情報欄表示 */
function openInfo(m) {
  current = m;
  placeName.value = m.name;

  document.querySelectorAll("[name=rate]").forEach(r => {
    r.checked = Number(r.value) === m.rate;
  });

  document.querySelectorAll("#tags input").forEach(c => {
    c.checked = m.tags.includes(c.value);
  });

  renderPhotos();
}

/* 写真表示 */
function renderPhotos() {
  photos.innerHTML = "";
  current.photos.forEach((src, i) => {
    const img = document.createElement("img");
    img.src = src;
    img.className = "photo";
    img.onclick = () => {
      if (confirm("この写真を削除しますか？")) {
        current.photos.splice(i, 1);
        renderPhotos();
        saveAll();
      }
    };
    photos.appendChild(img);
  });
}

/* 地図クリックで追加 */
map.on("click", e => {
  const m = {
    latlng: e.latlng,
    name: "",
    rate: 3,
    tags: [],
    photos: []
  };
  memories.push(m);
  renderMarker(m);
  openInfo(m);
  saveAll();
});

/* 保存ボタン */
saveBtn.onclick = () => {
  if (!current) return;

  current.name = placeName.value;
  current.rate = Number(
    document.querySelector("[name=rate]:checked").value
  );
  current.tags = [...document.querySelectorAll("#tags input:checked")].map(
    c => c.value
  );

  renderMarker(current);
  saveAll();
};

/* 削除 */
deleteBtn.onclick = () => {
  if (!current) return;
  map.removeLayer(current.marker);
  memories = memories.filter(m => m !== current);
  current = null;
  saveAll();
};

/* 写真追加 */
photoInput.onchange = e => {
  const files = [...e.target.files].slice(0, 5 - current.photos.length);
  files.forEach(f => {
    const reader = new FileReader();
    reader.onload = () => {
      current.photos.push(reader.result);
      renderPhotos();
      saveAll();
    };
    reader.readAsDataURL(f);
  });
};

/* 検索 */
searchBtn.onclick = search;
searchInput.onkeydown = e => e.key === "Enter" && search();

function search() {
  fetch(
    `https://nominatim.openstreetmap.org/search?format=json&q=${searchInput.value}`
  )
    .then(r => r.json())
    .then(d => {
      if (d[0]) {
        map.setView([d[0].lat, d[0].lon], d[0].type === "administrative" ? 8 : 12);
      }
    });
}

/* 初期描画 */
memories.forEach(renderMarker);
