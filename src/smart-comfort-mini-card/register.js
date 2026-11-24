// ── Register ──
import { pickerDefine } from "./card-picker.js";
import { SmartComfortMiniCard } from "./card.js";
import { SmartComfortCard } from "./full-card.js";

if (!customElements.get("smart-comfort-card")) {
  pickerDefine("smart-comfort-card", SmartComfortCard);
  window.customCards = window.customCards || [];
  window.customCards.push({
    type: "smart-comfort-card",
    name: "Smart Comfort",
    description: "Every alert of Smart Comfort, a tile per room, its switches and its latest activity.",
    preview: true,
  });
}

if (!customElements.get("smart-comfort-mini-card")) {
  pickerDefine("smart-comfort-mini-card", SmartComfortMiniCard);
  window.customCards = window.customCards || [];
  window.customCards.push({
    type: "smart-comfort-mini-card",
    name: "Smart Comfort mini",
    description: "The alerts of the moment and the switches of Smart Comfort; its button opens the full card.",
    preview: true,
  });
}
