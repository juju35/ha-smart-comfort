// ── Register ──
import { pickerDefine } from "./card-picker.js";
import { SmartComfortActivityCard } from "./card.js";

if (!customElements.get("smart-comfort-activity-card")) {
  pickerDefine("smart-comfort-activity-card", SmartComfortActivityCard);
  window.customCards = window.customCards || [];
  window.customCards.push({
    type: "smart-comfort-activity-card",
    name: "Smart Comfort activity",
    description: "What Smart Comfort did and why, live: devices, lights, notifications, changes by hand.",
    preview: false,
  });
}
