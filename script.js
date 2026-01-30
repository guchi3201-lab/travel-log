const map = L.map("map").setView([35, 135], 5);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);

let memories = JSON.parse(localStorage.getItem("memories") || "[]");
let current = null;

function icon(name, level) {
  const size = 20 + level * 4;
  return L.divIcon({
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    html: `
      <div class="pin ${level === 5 ? "rainbow" : ""}">
        ${name ? `<div class="pin-label">${name}</div>` : ""}
      </div>
    `
  });
}

function saveAll() {
  localStorage.setItem("memories", JSON.stringify(memories));
}

function renderMarker(m) {
  if (m.marker) map.removeLayer(m.marker);
  m.marker = L.marker(m.latlng, {
    icon: icon(m.name, m.level)
  }).addTo(map);
  m.marker.on("click", () => openInfo(m));
}

function openInfo(m) {
  current = m;
  placeName.value = m.name;
  comment.value = m.comment;

  document.querySelectorAll("[name=level]").forEach(r => {
    r.checked = r.value == m.level;
  });

  document.querySelectorAll("#tags input").forEach(c => {
    c.checked = m.tags.includes(c.value);
  });

  renderPhotos();
}

function renderPhotos() {
  photos.innerHTML = "";
  current.photos.forEach((p, i) => {
    const img = document.createElement("img");
    img.src = p;
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

map.on("click", e => {
  const m = {
    latlng: e.latlng,
    name: "",
    level: 1,
    tags: [],
    comment: "",
    photos: []
  };
  memories.push(m);
  renderMarker(m);
  openInfo(m);
  saveAll();
});

saveBtn.onclick = () => {
  if (!current) return;
  current.name = placeName.value;
  current.comment = comment.value;
  current.level = Number(
    document.querySelector("[name=level]:checked").value
  );
  current.tags = [...document.querySelectorAll("#tags input:checked")].map(
    c => c.value
  );
  renderMarker(current);
  saveAll();
};

deleteBtn.onclick = () => {
  if (!current) return;
  map.removeLayer(current.marker);
  memories = memories.filter(m => m !== current);
  current = null;
  saveAll();
};

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

searchBtn.onclick = () => search();
searchInput.onkeydown = e => e.key === "Enter" && search();

function search() {
  fetch(
    `https://nominatim.openstreetmap.org/search?format=json&q=${searchInput.value}`
  )
    .then(r => r.json())
    .then(d => {
      if (d[0]) {
        map.setView([d[0].lat, d[0].lon], 10);
      }
    });
}

memories.forEach(renderMarker);
