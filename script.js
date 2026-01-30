const map = L.map("map").setView([35, 135], 5);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "© OpenStreetMap"
}).addTo(map);

let memories = JSON.parse(localStorage.getItem("memories") || "[]");
let current = null;

function icon(level) {
  const size = 16 + level * 2;
  return L.divIcon({
    html: `<div class="pin ${level === 5 ? "glow" : ""}"></div>`,
    className: "",
    iconSize: [size, size],
    iconAnchor: [size / 2, size]
  });
}

function saveAll() {
  localStorage.setItem("memories", JSON.stringify(memories));
}

function render() {
  memories.forEach(m => {
    if (m.marker) map.removeLayer(m.marker);
    m.marker = L.marker(m.latlng, { icon: icon(m.level) })
      .addTo(map)
      .on("click", () => openInfo(m));
  });
}

map.on("click", e => {
  const m = {
    latlng: e.latlng,
    level: 1,
    tags: [],
    comment: "",
    photos: []
  };
  memories.push(m);
  saveAll();
  render();
  openInfo(m);
});

function openInfo(m) {
  current = m;
  document.getElementById("comment").value = m.comment;
  document.querySelectorAll("#levelSelect input").forEach(r => {
    r.checked = r.value == m.level;
  });
  document.querySelectorAll("#tags input").forEach(c => {
    c.checked = m.tags.includes(c.value);
  });
  renderPhotos();
  document.getElementById("info").classList.add("show");
}

function renderPhotos() {
  const box = document.getElementById("photos");
  box.innerHTML = "";
  current.photos.forEach((p, i) => {
    const img = document.createElement("img");
    img.src = p;
    img.onclick = () => window.open(p);
    img.oncontextmenu = e => {
      e.preventDefault();
      current.photos.splice(i, 1);
      saveAll();
      renderPhotos();
    };
    box.appendChild(img);
  });
}

document.getElementById("saveBtn").onclick = () => {
  current.comment = comment.value;
  current.level = document.querySelector("#levelSelect input:checked")?.value || 1;
  current.tags = [...document.querySelectorAll("#tags input:checked")].map(c => c.value);
  saveAll();
  render();
};

document.getElementById("deleteBtn").onclick = () => {
  memories = memories.filter(m => m !== current);
  saveAll();
  map.removeLayer(current.marker);
  document.getElementById("info").classList.remove("show");
};

document.getElementById("photoInput").onchange = e => {
  [...e.target.files].slice(0, 5 - current.photos.length).forEach(f => {
    const r = new FileReader();
    r.onload = () => {
      current.photos.push(r.result);
      saveAll();
      renderPhotos();
    };
    r.readAsDataURL(f);
  });
};

document.getElementById("searchBtn").onclick = () => {
  const q = searchInput.value;
  fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${q}`)
    .then(r => r.json())
    .then(d => {
      if (d[0]) {
        map.setView([d[0].lat, d[0].lon], d[0].type === "administrative" ? 7 : 12);
      }
    });
};

render();
