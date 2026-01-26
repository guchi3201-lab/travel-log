const famousPlaces = [
  { name: "浅草寺", lat: 35.7148, lng: 139.7967 },
  { name: "清水寺", lat: 34.9948, lng: 135.7850 },
  { name: "太宰府天満宮", lat: 33.5213, lng: 130.5349 },
  { name: "原爆ドーム", lat: 34.3955, lng: 132.4536 },
  { name: "奈良公園", lat: 34.6851, lng: 135.8431 }
];

let map;
let selectedPlace = null;

const markers = [];

initMap();

function initMap() {
  map = L.map("map").setView([36, 138], 5);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap contributors"
  }).addTo(map);

  loadFamousPlaces();
}

function loadFamousPlaces() {
  famousPlaces.forEach(place => {
    const marker = L.marker([place.lat, place.lng]).addTo(map);
    marker.on("click", () => openForm(place));
    markers.push(place);
  });
}

function openForm(place) {
  selectedPlace = place;
  document.getElementById("form").classList.remove("hidden");
  document.getElementById("placeName").innerText = place.name;
}

function saveVisit() {
  alert(`${selectedPlace.name} に行った記録を保存しました！（仮）`);
}
