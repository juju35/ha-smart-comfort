// ── Styles ──
import { BANNER_STYLE, HEADER_STYLE, TITLE_STYLE } from "./shared.js";

export const STYLE = `
  :host { display: block; }
  ha-card { container: sc-card / inline-size; overflow: hidden; }
  .header { display: flex; align-items: center; gap: 10px; padding: 12px 16px 4px; }
  ${HEADER_STYLE}
  ${TITLE_STYLE}
  ${BANNER_STYLE}
  .header.banner { padding: 0; margin-bottom: 4px; }
  .body { padding: 0 16px 12px; }
  .body.flat { padding: 0; }
  .empty { color: var(--secondary-text-color); padding: 12px 0; }
  .day { margin: 14px 0 4px; font-size: 13px; font-weight: 500; color: var(--secondary-text-color); }
  .day::first-letter { text-transform: uppercase; }
  .row { display: flex; gap: 12px; align-items: flex-start; padding: 8px 0; border-bottom: 1px solid var(--divider-color); }
  .row:last-child { border-bottom: none; }
  .row.clickable { cursor: pointer; border-radius: 4px; }
  .row.clickable:focus-visible { outline: 2px solid var(--primary-color); outline-offset: 2px; }
  .badge { flex: none; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center;
    background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.12); color: var(--primary-color); --mdc-icon-size: 20px; }
  .row.lighting .badge, .row.presence_on .badge, .row.presence_off .badge { background: rgba(255, 166, 0, 0.14); color: var(--warning-color, #ffa600); }
  .row.notified .badge, .row.cleared .badge { background: rgba(var(--rgb-info-color, 3, 155, 229), 0.12); color: var(--info-color, #039be5); }
  .row.notified.warning .badge { background: rgba(255, 166, 0, 0.14); color: var(--warning-color, #ffa600); }
  .row.notified.critical .badge, .row.failed .badge { background: rgba(219, 68, 55, 0.12); color: var(--error-color, #db4437); }
  .row.manual .badge, .row.display .badge { background: rgba(var(--rgb-primary-text-color, 0, 0, 0), 0.06); color: var(--secondary-text-color); }
  .main { min-width: 0; flex: 1; }
  .what { font-size: 14px; line-height: 20px; overflow-wrap: anywhere; }
  .detail { font-size: 13px; color: var(--secondary-text-color); white-space: pre-line; margin-top: 2px; overflow-wrap: anywhere; }
  .meta { font-size: 12px; color: var(--secondary-text-color); margin-top: 2px; overflow-wrap: anywhere; }
  .chips { display: flex; flex-wrap: wrap; gap: 8px; padding: 4px 0 4px; }
  .chip { border: 1px solid var(--divider-color); background: none; color: var(--primary-text-color); border-radius: 16px;
    padding: 6px 12px; font: inherit; font-size: 13px; cursor: pointer; }
  .chip:focus-visible { outline: 2px solid var(--primary-color); outline-offset: 2px; }
  /* Active filter: tinted, not filled, like the other active states of the panel. Its text is the primary
     colour toward the text colour, readable (WCAG AA) on the tint in light and dark themes. */
  .chip.active { background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.12); border-color: var(--primary-color);
    color: color-mix(in srgb, var(--primary-color) 60%, var(--primary-text-color)); }
`;
