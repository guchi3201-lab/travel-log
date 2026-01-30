function createPinIcon(level, tag) {
  const pin = document.createElement("div");

  pin.className = `
    custom-pin
    pin-level-${level}
    ${level === 5 ? "glow-pin" : ""}
  `;

  // タグ（温泉など）
  if (tag) {
    const tagEl = document.createElement("div");
    tagEl.className = "pin-tag";
    tagEl.textContent = tag; // ♨️など
    pin.appendChild(tagEl);
  }

  return L.divIcon({
    html: pin.outerHTML,
    className: "",
    iconSize: null,
    iconAnchor: [20, 40]
  });
}
