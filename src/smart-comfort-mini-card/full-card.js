// ── Full card ──
import { SmartComfortMiniCard } from "./card.js";

export class SmartComfortCard extends SmartComfortMiniCard {
  static FULL = true;

  // The options of the mini card but the compact view's (alerts listed, zoom button).
  static getConfigForm() {
    const form = SmartComfortMiniCard.getConfigForm();
    return { ...form, schema: form.schema.filter((field) => field.name !== "alerts" && field.name !== "zoom") };
  }

  constructor() {
    super();
    this._zoomed = true;
  }

  getGridOptions() {
    return { columns: 12, min_columns: 6 };
  }

  // Never folded (the click outside the card does nothing).
  _setZoom() {}
}
