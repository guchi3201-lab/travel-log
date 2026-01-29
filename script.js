const map = L.map('map').setView([36, 138], 5);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap'
}).addTo(map);

let currentMarker = null;
let data = JSON.parse(localStorage.getItem('pins') || '[]');

const redIcon = L.icon({
  iconUrl: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32]
});

function saveAll() {
  localStorage.setItem('pins', JSON.stringify(data));
}

function renderPins() {
  data.forEach(p => {
    const m = L.marker([p.lat, p.lng], { icon: redIcon }).addTo(map);
    m.on('click', () => openInfo(p, m));
    p._marker = m;
  });
}

renderPins();

map.on('click', e => {
  const pin = {
    lat: e.latlng.lat,
    lng: e.latlng.lng,
    comment: '',
    photos: []
  };
  data.push(pin);
  saveAll();

  const m = L.marker(e.latlng, { icon: redIcon }).addTo(map);
  pin._marker = m;
  openInfo(pin, m);
});

function openInfo(pin, marker) {
  currentMarker = pin;
  document.getElementById('infoPanel').classList.remove('hidden');
  document.getElementById('comment').value = pin.comment;
  renderPhotos();
}

function renderPhotos() {
  const list = document.getElementById('photoList');
  list.innerHTML = '';
  currentMarker.photos.forEach(src => {
    const img = document.createElement('img');
    img.src = src;
    img.onclick = () => openModal(src);
    list.appendChild(img);
  });
}

document.getElementById('photoInput').onchange = e => {
  const files = Array.from(e.target.files).slice(0, 5 - currentMarker.photos.length);
  files.forEach(f => {
    const reader = new FileReader();
    reader.onload = () => {
      currentMarker.photos.push(reader.result);
      renderPhotos();
    };
    reader.readAsDataURL(f);
  });
};

document.getElementById('saveBtn').onclick = () => {
  currentMarker.comment = document.getElementById('comment').value;
  saveAll();
  alert('保存しました');
};

document.getElementById('deleteBtn').onclick = () => {
  currentMarker._marker.remove();
  data = data.filter(p => p !== currentMarker);
  saveAll();
  document.getElementById('infoPanel').classList.add('hidden');
};

document.getElementById('searchBtn').onclick = () => {
  const q = document.getElementById('searchInput').value;
  fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${q}`)
    .then(r => r.json())
    .then(res => {
      if (res[0]) {
        map.setView([res[0].lat, res[0].lon], 13);
      }
    });
};

function openModal(src) {
  document.getElementById('modalImg').src = src;
  document.getElementById('modal').classList.remove('hidden');
}

document.getElementById('modal').onclick = () => {
  document.getElementById('modal').classList.add('hidden');
};
