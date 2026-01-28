// ================== 地図 ==================
const map = L.map("map", {
  zoomControl: true,
  minZoom: 5,
  maxZoom: 18
}).setView([36.5, 138], 6);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "© OpenStreetMap"
}).addTo(map);

// ================== アイコン ==================
const icons = {
  went: L.icon({
    iconUrl: "https://maps.gstatic.com/mapfiles/ms2/micons/red.png",
    iconSize: [32, 32],
    iconAnchor: [16, 32]
  }),
  want: L.icon({
    iconUrl: "https://maps.gstatic.com/mapfiles/ms2/micons/yellow.png",
    iconSize: [32, 32],
    iconAnchor: [16, 32]
  })
};

// ================== 保存 ==================
function loadPins() {
  return JSON.parse(localStorage.getItem("pins") || "[]");
}
function savePins() {
  localStorage.setItem("pins", JSON.stringify(pins));
}

function loadTags() {
  return JSON.parse(localStorage.getItem("tags") || '["温泉","神社","山","海","グルメ"]');
}
function saveTags() {
  localStorage.setItem("tags", JSON.stringify(TAGS));
}

let pins = loadPins();
let TAGS = loadTags();

// ================== ピン ==================
pins.forEach(p => createMarker(p));

map.on("click", e => {
  const pin = {
    id: Date.now(),
    lat: e.latlng.lat,
    lng: e.latlng.lng,
    status: "want",
    comment: "",
    photos: [],
    tags: []
  };
  pins.push(pin);
  savePins();
  createMarker(pin);
  openPanel(pin);
});

function createMarker(pin) {
  const marker = L.marker([pin.lat, pin.lng], {
    icon: icons[pin.status]
  }).addTo(map);

  pin.marker = marker;

  marker.on("click", () => openPanel(pin));
}

// ================== パネル ==================
const panel = document.getElementById("panel");

function openPanel(pin) {
  panel.innerHTML = "";
  panel.classList.remove("hidden");

  const title = document.createElement("div");
  title.textContent =
    pin.status === "went" ? "🔴 行った場所" : "🟡 行きたい場所";
  panel.appendChild(title);

  const toggle = document.createElement("button");
  toggle.textContent = "状態切り替え";
  toggle.onclick = () => {
    pin.status = pin.status === "went" ? "want" : "went";
    pin.marker.setIcon(icons[pin.status]);
    savePins();
    openPanel(pin);
  };
  panel.appendChild(toggle);

  const textarea = document.createElement("textarea");
  textarea.value = pin.comment;
  textarea.oninput = () => {
    pin.comment = textarea.value;
    savePins();
  };
  panel.appendChild(textarea);

  const photoInput = document.createElement("input");
  photoInput.type = "file";
  photoInput.accept = "image/*";
  photoInput.onchange = e => {
    const reader = new FileReader();
    reader.onload = () => {
      pin.photos.push(reader.result);
      savePins();
      openPanel(pin);
    };
    reader.readAsDataURL(e.target.files[0]);
  };
  panel.appendChild(photoInput);

  const photos = document.createElement("div");
  photos.className = "photos";
  pin.photos.forEach(src => {
    const img = document.createElement("img");
    img.src = src;
    photos.appendChild(img);
  });
  panel.appendChild(photos);

  const tagsDiv = document.createElement("div");
  tagsDiv.className = "tags";
  TAGS.forEach(tag => {
    const label = document.createElement("label");
    label.className = "tag";
    const cb = document.createElement("input");
    cb.type = "checkbox";
    cb.checked = pin.tags.includes(tag);
    cb.onchange = () => {
      if (cb.checked) pin.tags.push(tag);
      else pin.tags = pin.tags.filter(t => t !== tag);
      savePins();
    };
    label.appendChild(cb);
    label.append(" " + tag);
    tagsDiv.appendChild(label);
  });
  panel.appendChild(tagsDiv);

  const addTag = document.createElement("div");
  addTag.className = "add-tag";
  const tagInput = document.createElement("input");
  tagInput.placeholder = "タグ追加";
  const tagBtn = document.createElement("button");
  tagBtn.textContent = "追加";
  tagBtn.onclick = () => {
    const t = tagInput.value.trim();
    if (!t) return;
    if (!TAGS.includes(t)) {
      TAGS.push(t);
      saveTags();
    }
    if (!pin.tags.includes(t)) pin.tags.push(t);
    savePins();
    openPanel(pin);
  };
  addTag.appendChild(tagInput);
  addTag.appendChild(tagBtn);
  panel.appendChild(addTag);

  const del = document.createElement("button");
  del.textContent = "削除";
  del.onclick = () => {
    map.removeLayer(pin.marker);
    pins = pins.filter(p => p.id !== pin.id);
    savePins();
    panel.classList.add("hidden");
  };
  panel.appendChild(del);
}

// ================== 検索 ==================
document.getElementById("search").addEventListener("change", async e => {
  const q = e.target.value;
  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&q=${q}`
  );
  const data = await res.json();
  if (data[0]) {
    map.setView([data[0].lat, data[0].lon], 13);
  }
});
