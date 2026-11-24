// ── Styles ──
import { BANNER_STYLE, HEADER_STYLE, TITLE_STYLE } from "./shared.js";

export const STYLE = `
  :host { display: block; }
  ha-card { container: sc-card / inline-size; overflow: hidden; }
  .top { padding: 16px; display: flex; flex-direction: column; gap: 14px; }
  .header { display: flex; align-items: center; gap: 10px; }
  ${HEADER_STYLE}
  ${TITLE_STYLE}

  ${BANNER_STYLE}
  .zoom { all: unset; flex: none; align-self: flex-start; cursor: pointer; width: 24px; height: 24px; margin: -2px -4px 0 0;
    border-radius: 50%; display: grid; place-items: center; color: var(--secondary-text-color); --mdc-icon-size: 16px; }
  .zoom:hover { background: color-mix(in srgb, var(--secondary-text-color) 16%, transparent); color: var(--primary-text-color); }
  .zoom:focus-visible { outline: 2px solid var(--primary-color, #03a9f4); outline-offset: 1px; }
  .empty { color: var(--secondary-text-color); font-size: 14px; }
  .section { display: flex; flex-direction: column; gap: 8px; }
  /* Section titles like the other cards': a 16 px icon, the name in small capitals. */
  .section-title { display: flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 500; line-height: 16px; text-transform: uppercase;
    letter-spacing: .04em; color: var(--secondary-text-color); --mdc-icon-size: 16px; }
  .section-title ha-icon { flex: none; }
  .alerts { display: flex; flex-direction: column; }
  .alert { display: grid; grid-template-columns: 40px minmax(0, 1fr) auto; align-items: center; column-gap: 12px; padding: 8px 0;
    border-bottom: 1px solid var(--divider-color); }
  .alert:last-child { border-bottom: none; }
  .abadge { --c: var(--warning-color, #ffa600); flex: none; width: 40px; height: 40px; border-radius: 50%; display: grid; place-items: center;
    background: color-mix(in srgb, var(--c) 16%, transparent); color: var(--c); --mdc-icon-size: 20px; }
  .alert.quiet .abadge { --c: var(--secondary-text-color); }
  .amain { min-width: 0; }
  .awhat { font-size: 14px; line-height: 20px; overflow-wrap: anywhere; }
  .ameta { font-size: 12px; color: var(--secondary-text-color); overflow-wrap: anywhere; }
  .avalue { flex: none; font-size: 13px; color: var(--secondary-text-color); white-space: nowrap; font-variant-numeric: tabular-nums; }
  .more { font-size: 12px; color: var(--secondary-text-color); padding-top: 4px; }
  .rooms { display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 8px; }
  /* Room tiles on the secondary background, like the other cards' tiles; a room with an alert tinted. */
  .room { border-radius: 12px; padding: 8px 10px; min-width: 0; background: var(--secondary-background-color, rgba(127,127,127,.08)); }
  .room.alerting { background: color-mix(in srgb, var(--warning-color, #ffa600) 14%, var(--secondary-background-color, transparent)); }
  .rname { font-size: 13px; color: var(--secondary-text-color); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .rvalue { font-size: 18px; font-weight: 500; line-height: 24px; font-variant-numeric: tabular-nums; }
  .rstate { display: flex; align-items: center; gap: 4px; font-size: 12px; color: var(--secondary-text-color); --mdc-icon-size: 14px;
    min-width: 0; overflow: hidden; }
  .rstate span { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .room.alerting .rstate { color: color-mix(in srgb, var(--warning-color, #ffa600) 70%, var(--primary-text-color)); }
  .rstate.ok { color: color-mix(in srgb, var(--success-color, #43a047) 70%, var(--primary-text-color)); }
  .clickable { cursor: pointer; }
  .alert.clickable { border-radius: 8px; }
  .clickable:focus-visible { outline: 2px solid var(--primary-color, #03a9f4); outline-offset: 2px; }
  .switches { display: flex; flex-wrap: wrap; gap: 8px; }
  /* Not filled: tinted with an accent icon when on, outlined when off. */
  .switch { display: inline-flex; align-items: center; gap: 6px; height: 32px; padding: 0 12px; border-radius: 16px; cursor: pointer;
    border: 1px solid var(--divider-color); background: none; color: var(--secondary-text-color); font: inherit; font-size: 13px;
    --mdc-icon-size: 18px; min-width: 0; }
  .switch.on { background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.12); border-color: var(--primary-color);
    color: color-mix(in srgb, var(--primary-color) 60%, var(--primary-text-color)); }
  .switch.on ha-icon { color: var(--primary-color); }
  .switch.on.part { background: color-mix(in srgb, #f5a623 14%, transparent); border-color: #f5a623; }
  .switch.on.part ha-icon { color: #f5a623; }
  .switch:disabled { opacity: 0.5; cursor: default; }
  .switch:focus-visible { outline: 2px solid var(--primary-color, #03a9f4); outline-offset: 2px; }
  .slabel { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .extra:empty { display: none; }
  .extra { display: flex; flex-direction: column; border-top: 1px solid var(--divider-color); }
  .extra > .section-title { padding: 16px 16px 0; }
  /* Narrow card: the reading of an alert goes under its text. */
  @container (max-width: 360px) {
    .alert { grid-template-columns: 40px minmax(0, 1fr); }
    .abadge { grid-row: span 2; align-self: start; margin-top: 0; }
    .avalue { grid-column: 2; white-space: normal; }
  }
  /* Narrow mini card (6 columns on a phone): the switches keep their icon only (their name stays in the tooltip). */
  @container (max-width: 300px) {
    .switch { padding: 0; width: 32px; justify-content: center; }
    .slabel { display: none; }
  }
`;

/**
 * The full card: what the mini card shows once switched to its full view — every alert, a tile per room,
 * the switches, the latest activity — always, with no compact view and no button to fold it.
 *
 * type: custom:smart-comfort-card
 * title: Smart Comfort      # optional
 * rooms: [Living room]      # optional: only these rooms
 * activity: 5               # activity entries (5 by default, 0 for none)
 */
