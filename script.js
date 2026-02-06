const map=L.map('map').setView([35,135],5);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

let pins=[];
let current=null;
let tempLatLng=null;
let preview=null;
let photos=[];
let rate=1;

const tagList=["♨️温泉","🍜グルメ","⛰山","🌊海","🏯城","🌄絶景"];
tagList.forEach(t=>{
  tags.innerHTML+=`<label><input type="checkbox" value="${t}">${t}</label><br>`;
});

rateUI.onclick=e=>{
  if(e.target.dataset.r){
    rate=e.target.dataset.r;
    [...rateUI.children].forEach(x=>x.classList.remove("active"));
    e.target.classList.add("active");
  }
};

function pinColor(r){
  if(r==5) return "#FFD700";
  return `rgba(255,0,0,${0.25+0.18*r})`;
}

function createIcon(r){
  return L.divIcon({
    html:`<div class="pin" style="background:${pinColor(r)}"></div>`,
    iconSize:[22,22],
    iconAnchor:[11,22]
  });
}

map.on("click",e=>{
  tempLatLng=e.latlng;
  current=null;

  if(preview) map.removeLayer(preview);
  preview=L.marker(e.latlng,{icon:createIcon(1)}).addTo(map);

  sidebar.style.display="block";
});

saveBtn.onclick=()=>{
  if(!tempLatLng) return;

  const data={
    latlng:tempLatLng,
    name:placeName.value,
    comment:comment.value,
    rate,
    tags:[...tags.querySelectorAll("input:checked")].map(x=>x.value),
    photos
  };

  const m=L.marker(tempLatLng,{icon:createIcon(rate)}).addTo(map);
  m.on("click",()=>selectPin(m));

  pins.push({marker:m,data});
  localStorage.setItem("travelPins",JSON.stringify(pins.map(p=>p.data)));

  reset();
};

deleteBtn.onclick=()=>{
  if(!current) return;
  map.removeLayer(current.marker);
  pins=pins.filter(p=>p!==current);
  localStorage.setItem("travelPins",JSON.stringify(pins.map(p=>p.data)));
  reset();
};

function selectPin(marker){
  current=pins.find(p=>p.marker===marker);
  const d=current.data;

  tempLatLng=d.latlng;
  placeName.value=d.name;
  comment.value=d.comment;
  rate=d.rate;
  photos=d.photos||[];

  [...rateUI.children].forEach(x=>{
    x.classList.toggle("active",x.dataset.r==rate);
  });

  tags.querySelectorAll("input").forEach(x=>{
    x.checked=d.tags.includes(x.value);
  });

  renderPhotos();
  sidebar.style.display="block";
}

function reset(){
  placeName.value="";
  comment.value="";
  rate=1;
  photos=[];
  current=null;
  tempLatLng=null;

  if(preview){map.removeLayer(preview);preview=null;}

  [...rateUI.children].forEach(x=>x.classList.remove("active"));
  rateUI.children[0].classList.add("active");

  tags.querySelectorAll("input").forEach(x=>x.checked=false);
  renderPhotos();
}

photoInput.onchange=e=>{
  [...e.target.files].slice(0,5-photos.length).forEach(f=>{
    const r=new FileReader();
    r.onload=()=>{
      photos.push(r.result);
      renderPhotos();
    };
    r.readAsDataURL(f);
  });
};

function renderPhotos(){
  photosDiv=document.getElementById("photos");
  photosDiv.innerHTML="";
  photos.forEach((p,i)=>{
    photosDiv.innerHTML+=`<img src="${p}" class="photo"
      onclick="photos.splice(${i},1);renderPhotos()">`;
  });
}

searchBtn.onclick=()=>{
  fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${searchInput.value}`)
  .then(r=>r.json())
  .then(d=>{
    if(d[0]) map.setView([d[0].lat,d[0].lon],11);
  });
};

window.onload=()=>{
  const saved=JSON.parse(localStorage.getItem("travelPins")||"[]");
  saved.forEach(d=>{
    const m=L.marker(d.latlng,{icon:createIcon(d.rate)}).addTo(map);
    m.on("click",()=>selectPin(m));
    pins.push({marker:m,data:d});
  });
};
