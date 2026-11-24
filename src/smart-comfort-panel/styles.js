// ── Styles ──
export const STYLE = `
  :host {
    display: block;
    min-height: 100vh;
    background: var(--primary-background-color);
    color: var(--primary-text-color);
    font-family: var(--paper-font-body1_-_font-family, Roboto, sans-serif);
  }
  /* The top bar: the living room across the page (as on the ENT ONE panel); the tabs under it on the page background,
     sticky; the unsaved changes in a bar sticky at the bottom of the page */
  :host { --sc-accent: #21b7b6; }
  .topbar .shbanner { height: 90px; }
  .topbar .shhead { padding-left: 4px; right: calc(min(360px, 46%) + 96px); }
  .topbar .shscene { right: 96px; }
  .topbar .shtitle { font-size: 20px; }
  .hmenu { flex: none; color: inherit; }
  .hacts { position: absolute; z-index: 2; top: calc((100% - 10px) / 2 - 17px); right: 12px; display: flex; gap: 6px; }
  .hacts .icon-btn { width: 34px; height: 34px; padding: 0; border-radius: 50%; display: grid; place-items: center; box-sizing: border-box; text-decoration: none;
    color: #33506b; background: rgba(255, 255, 255, 0.55); box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.7); --mdc-icon-size: 20px; }
  .hacts .icon-btn:hover { background: rgba(255, 255, 255, 0.82); }
  .night .hacts .icon-btn { color: #fff; background: rgba(255, 255, 255, 0.12); box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.2); }
  :host([bare]) .topbar { display: none; }
  .tabs {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 0 12px;
    overflow-x: auto;
    background: var(--primary-background-color);
    border-bottom: 1px solid var(--divider-color, rgba(0, 0, 0, 0.12));
    position: sticky;
    top: 0;
    z-index: 2;
  }
  .tablist { display: flex; gap: 4px; flex: 1; min-width: 0; }
  .tabmenu { display: none; color: var(--primary-text-color); }
  :host([bare]) .tabmenu { display: flex; }
  .tab {
    background: none;
    border: none;
    border-bottom: 2px solid transparent;
    color: var(--secondary-text-color);
    padding: 12px 12px 10px;
    font: inherit;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    white-space: nowrap;
  }
  .tab:hover { color: var(--primary-text-color); }
  .tab.active { color: var(--primary-text-color); border-bottom-color: var(--sc-accent); }
  .tab .cnt { display: inline-block; min-width: 18px; padding: 1px 5px; margin-left: 5px; border-radius: 9px; font-size: 11px; text-align: center; box-sizing: border-box;
    color: color-mix(in srgb, #f5a623 60%, var(--primary-text-color)); background: color-mix(in srgb, #f5a623 18%, transparent); }
  .savebar {
    position: sticky;
    bottom: 12px;
    z-index: 2;
    box-sizing: border-box;
    width: calc(100% - 32px);
    max-width: 1008px;
    margin: 0 auto 12px;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
    padding: 10px 14px;
    border-radius: 12px;
    background: var(--ha-card-background, var(--card-background-color, #fff));
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.18);
    border: 1px solid color-mix(in srgb, var(--primary-color) 40%, transparent);
  }
  .savebar[hidden] { display: none; }
  .dirty { flex: 1; min-width: 0; font-size: 14px; font-weight: 500; }
  /* A tab's compact header (the picture is in the top bar) */
  .shbanner.compact { height: auto; background: none; color: inherit; --sh-sub: var(--secondary-text-color); }
  .shbanner.compact .shhead { position: static; padding: 12px 16px 0; }
  .shbanner.compact.night { color: inherit; }
  /* Overview: room filter, switches, tiles of the chart */
  .summary.ov { display: flex; flex-direction: column; gap: 12px; }
  .filters { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; }
  .filters .grow { flex: 1; }
  .fchip, .pill { display: inline-flex; align-items: center; gap: 6px; min-height: 30px; padding: 0 12px; border-radius: 16px; font: inherit; font-size: 13px; box-sizing: border-box; cursor: pointer;
    color: var(--secondary-text-color); background: var(--card-background-color, #fff); border: 1px solid var(--divider-color, #e0e0e0); }
  .fchip.on { color: var(--primary-text-color); border: 1.5px solid var(--sc-accent); }
  .fchip .dot { width: 7px; height: 7px; border-radius: 50%; }
  .fchip .dot.warn { background: #f5a623; } .fchip .dot.bad { background: var(--error-color, #db4437); } .fchip .dot.good { background: var(--success-color, #43a047); }
  .fchip .cnt { font-size: 11px; padding: 0 6px; border-radius: 8px; background: color-mix(in srgb, var(--sc-accent) 16%, transparent); color: color-mix(in srgb, var(--sc-accent) 55%, var(--primary-text-color)); }
  .more { position: relative; }
  .more > summary { list-style: none; border-style: dashed; } .more > summary::-webkit-details-marker { display: none; }
  .more .pop { position: absolute; z-index: 3; top: calc(100% + 6px); left: 0; min-width: 200px; max-height: 300px; overflow: auto; padding: 8px; box-sizing: border-box;
    display: flex; flex-direction: column; gap: 4px; background: var(--card-background-color, #fff); border: 1px solid var(--divider-color, rgba(127,127,127,.3));
    border-radius: 12px; box-shadow: 0 8px 24px rgba(0, 0, 0, 0.14); }
  .pill { --mdc-icon-size: 16px; }
  .ctl > summary.pill { border-style: solid; } .ctl > summary.pill.on, .ctl > summary.pill.part { border-color: transparent; }
  .ctl .chev { --mdc-icon-size: 14px; margin-right: -4px; transition: transform .15s; } .ctl[open] .chev { transform: rotate(180deg); }
  .pill.part { color: color-mix(in srgb, #f5a623 60%, var(--primary-text-color)); background: color-mix(in srgb, #f5a623 14%, transparent); }
  .ctl .pop { left: auto; right: 0; min-width: 240px; }
  .crow { display: flex; align-items: center; gap: 10px; width: 100%; padding: 8px 10px; border: 0; border-radius: 8px; background: none; font: inherit; font-size: 13px;
    color: var(--primary-text-color); cursor: pointer; text-align: left; --mdc-icon-size: 18px; }
  .crow:hover { background: var(--secondary-background-color, rgba(127,127,127,.08)); }
  .crow > ha-icon { color: var(--secondary-text-color); } .crow.on > ha-icon { color: var(--success-color, #43a047); }
  .crow:disabled { opacity: .45; cursor: default; } .crow:disabled:hover { background: none; }
  .ctl .pop > .crow:first-child { margin-bottom: 2px; border-radius: 8px 8px 0 0; box-shadow: 0 1px 0 var(--divider-color, rgba(127,127,127,.3)); }
  .crow .cl { flex: 1; }
  .crow .knob { position: relative; width: 30px; height: 18px; border-radius: 9px; background: var(--divider-color, rgba(127,127,127,.35)); flex: none; transition: background .15s; }
  .crow .knob::after { content: ""; position: absolute; top: 2px; left: 2px; width: 14px; height: 14px; border-radius: 50%; background: #fff; transition: left .15s; box-shadow: 0 1px 2px rgba(0,0,0,.25); }
  .crow .knob.on { background: var(--success-color, #43a047); } .crow .knob.on::after { left: 14px; }
  .pill.on { color: color-mix(in srgb, var(--success-color, #43a047) 60%, var(--primary-text-color)); background: color-mix(in srgb, var(--success-color, #43a047) 14%, transparent); border-color: transparent; }
  .otiles { display: grid; grid-template-columns: repeat(auto-fit, minmax(190px, 1fr)); gap: 12px; }
  .otile { display: flex; align-items: center; gap: 12px; min-width: 0; padding: 12px 14px; border-radius: 12px; box-sizing: border-box;
    background: var(--secondary-background-color, rgba(127,127,127,.08)); --c: #8a96a3; }
  .otile.warn { --c: #f5a623; } .otile.bad { --c: var(--error-color, #db4437); } .otile.good { --c: var(--success-color, #43a047); }
  .otile.info { --c: #2f80ed; } .otile.night { --c: #7f77dd; }
  .otile .pastille { position: relative; flex: none; width: 40px; height: 40px; border-radius: 50%; display: grid; place-items: center; --mdc-icon-size: 22px;
    color: var(--c); background: color-mix(in srgb, var(--c) 16%, transparent); }
  .otile .pbadge { position: absolute; top: -3px; right: -5px; min-width: 18px; height: 18px; padding: 0 4px; box-sizing: border-box; border-radius: 9px; font-size: 11px; font-weight: 600;
    line-height: 18px; text-align: center; color: #fff; background: var(--c); box-shadow: 0 0 0 2px var(--card-background-color, #fff); }
  .otile .tl { display: flex; flex-direction: column; min-width: 0; }
  .otile .tn { font-size: 14px; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .otile .ts { font-size: 12px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: color-mix(in srgb, var(--c) 65%, var(--primary-text-color)); }
  .otile.rest .ts { color: var(--secondary-text-color); }
  @media (max-width: 600px) { .topbar .shscene { display: none; } .topbar .shhead { right: 96px; } }
  .content { max-width: 1040px; margin: 0 auto; padding: 16px; display: flex; flex-direction: column; gap: 16px; }
  .card {
    background: var(--ha-card-background, var(--card-background-color, #fff));
    border-radius: var(--ha-card-border-radius, 12px);
    border: var(--ha-card-border-width, 1px) solid var(--ha-card-border-color, var(--divider-color));
    box-shadow: var(--ha-card-box-shadow, none);
    padding: 16px;
  }
  .card-header { display: flex; align-items: center; gap: 10px; font-size: 18px; margin-bottom: 12px; }
  .card-header > ha-icon { color: var(--primary-color); }
  /* Activity tab: the filters, then the lines by day, a time column on the right */
  .act-tools { display: flex; flex-wrap: wrap; align-items: center; gap: 8px 12px; margin: 12px 0 4px; }
  .seg { display: inline-flex; max-width: 100%; overflow-x: auto; scrollbar-width: none; padding: 3px; gap: 2px; border-radius: 10px; background: var(--secondary-background-color, rgba(127,127,127,.12)); }
  .seg button { border: 0; background: none; color: var(--secondary-text-color); font: inherit; font-size: 13px; padding: 6px 12px;
                border-radius: 8px; cursor: pointer; white-space: nowrap; }
  .seg button[aria-checked="true"] { background: var(--card-background-color, #fff); color: var(--primary-text-color); font-weight: 500;
                                     box-shadow: 0 1px 2px rgba(0,0,0,.15); }
  .seg button:focus-visible { outline: 2px solid var(--primary-color); outline-offset: 1px; }
  .act-room { font: inherit; font-size: 13px; color: inherit; padding: 6px 10px; border-radius: 8px; max-width: 100%;
              border: 1px solid var(--divider-color, rgba(127,127,127,.3)); background: var(--secondary-background-color, transparent); }
  .act-room option { color: initial; }
  .act-day { margin-top: 12px; }
  .act-date { padding: 6px 0; font-size: 12px; font-weight: 500; color: var(--secondary-text-color);
              border-bottom: 1px solid var(--divider-color, rgba(127,127,127,.2)); margin-bottom: 4px; }
  .act-row { display: flex; align-items: flex-start; gap: 12px; padding: 8px 6px; border-radius: 8px; }
  .act-row[data-entity] { cursor: pointer; }
  .act-row[data-entity]:hover { background: var(--secondary-background-color, rgba(127,127,127,.08)); }
  .act-row:focus-visible { outline: 2px solid var(--primary-color); outline-offset: -2px; }
  .act-icon { flex: none; width: 32px; height: 32px; overflow: hidden; border-radius: 50%; display: grid; place-items: center; --mdc-icon-size: 18px;
              color: var(--primary-color); background: color-mix(in srgb, var(--primary-color) 12%, transparent); }
  .act-row.failed .act-icon, .act-row.critical .act-icon { color: var(--error-color, #db4437); background: color-mix(in srgb, var(--error-color, #db4437) 12%, transparent); }
  .act-row.warning .act-icon { color: var(--warning-color, #ffa600); background: color-mix(in srgb, var(--warning-color, #ffa600) 14%, transparent); }
  .act-main { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
  .act-what { font-size: 14px; overflow-wrap: anywhere; }
  .act-detail { font-size: 13px; color: var(--secondary-text-color); white-space: pre-line; overflow-wrap: anywhere; }
  .act-room-name { font-size: 12px; color: var(--secondary-text-color); }
  .act-time { flex: none; font-size: 12px; color: var(--secondary-text-color); font-variant-numeric: tabular-nums; padding-top: 2px; }
  .act-empty { padding: 20px 4px; color: var(--secondary-text-color); }
  .card-actions { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; padding-top: 12px; border-top: 1px solid var(--divider-color); }
  .btn {
    font: inherit;
    font-size: 14px;
    font-weight: 500;
    padding: 8px 14px;
    border-radius: 18px;
    border: 1px solid var(--divider-color);
    background: transparent;
    color: var(--primary-color);
    cursor: pointer;
  }
  .btn:hover { background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.08); }
  .btn:disabled { opacity: 0.6; cursor: default; }
  .btn.add { align-self: flex-start; }
  .btn.small { margin-top: 4px; padding: 6px 12px; font-size: 13px; }
  .icon-btn {
    background: none;
    border: none;
    color: var(--secondary-text-color);
    cursor: pointer;
    padding: 6px;
    border-radius: 50%;
    display: inline-flex;
  }
  .icon-btn:hover { background: rgba(var(--rgb-primary-text-color, 0, 0, 0), 0.06); color: var(--primary-color); }
  .banner { padding: 12px 16px; border-radius: 10px; font-size: 14px; line-height: 1.4; }
  .banner.info { background: rgba(var(--rgb-info-color, 3, 155, 229), 0.12); }
  .banner.error { background: rgba(var(--rgb-error-color, 219, 68, 55), 0.14); color: var(--error-color); }
  .banner.success { background: rgba(var(--rgb-success-color, 67, 160, 71), 0.14); }
  .banner .note { margin-top: 6px; font-weight: 500; }
  .source .sfile { display: flex; flex-wrap: wrap; align-items: center; gap: 12px; padding: 12px 14px; border-radius: 12px; background: var(--secondary-background-color, rgba(0, 0, 0, 0.04)); margin: 4px 0; }
  .source .sfile code { flex: 1 1 200px; font-size: 13px; }
  .source .sstatus { font-size: 12px; color: var(--secondary-text-color); }
  .source .sstatus.bad { color: var(--error-color); }
  .srow { display: flex; flex-wrap: wrap; gap: 16px; align-items: center; padding: 14px 0; border-bottom: 1px solid var(--divider-color, rgba(0, 0, 0, 0.08)); }
  .srow:last-child { border-bottom: 0; }
  .stext { flex: 1 1 300px; min-width: 0; }
  .sname { font-size: 14px; font-weight: 600; }
  .shelp { font-size: 12px; color: var(--secondary-text-color); line-height: 1.4; }
  .shelp.note { margin: 4px 0 0; font-weight: 500; color: var(--primary-text-color); }
  .pill.info { background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.14); color: var(--primary-color); }
  .sw { position: relative; display: inline-block; width: 40px; height: 24px; flex: none; }
  .sw input { position: absolute; inset: 0; opacity: 0; margin: 0; cursor: pointer; }
  .sw span { position: absolute; inset: 0; border-radius: 12px; background: var(--disabled-color, #bdbdbd); pointer-events: none; }
  .sw span::after { content: ""; position: absolute; top: 3px; left: 3px; width: 18px; height: 18px; border-radius: 50%; background: #fff; box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2); transition: left 0.15s; }
  .sw input:checked + span { background: var(--primary-color); }
  .sw input:checked + span::after { left: 19px; }
  .sw input:focus-visible + span { outline: 2px solid var(--primary-color); outline-offset: 2px; }
  .btn.primary { border-color: var(--primary-color); color: var(--primary-color); }
  .card.conflict { box-shadow: 0 0 0 2px var(--warning-color, #f59e0b); }
  .cgrid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; margin-top: 10px; }
  .cbox { padding: 10px 12px; border-radius: 10px; min-width: 0; }
  .cbox.file { background: rgba(var(--rgb-warning-color, 245, 158, 11), 0.14); }
  .cbox.panel { background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.12); }
  .cbox .ctitle { font-size: 12px; font-weight: 600; margin-bottom: 4px; }
  .cbox pre { margin: 0; font: 13px/1.5 var(--code-font-family, monospace); white-space: pre-wrap; word-break: break-word; }
  .cactions { display: flex; flex-wrap: wrap; gap: 8px; justify-content: flex-end; margin-top: 12px; }
  .banner .retry { margin-left: 8px; font: inherit; font-weight: 500; color: var(--primary-color); background: none; border: 1px solid currentColor; border-radius: 16px; padding: 2px 12px; cursor: pointer; }
  .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(170px, 1fr)); gap: 12px; }
  .tile {
    font: inherit;
    text-align: left;
    color: inherit;
    background: var(--ha-card-background, var(--card-background-color, #fff));
    border: 1px solid var(--divider-color);
    border-radius: 12px;
    padding: 14px;
    display: grid;
    grid-template-columns: auto 1fr;
    grid-template-rows: auto auto;
    column-gap: 12px;
    align-items: center;
  }
  button.tile { cursor: pointer; }
  .tile ha-icon { grid-row: span 2; color: var(--primary-color); --mdc-icon-size: 28px; }
  .tile.off ha-icon { color: var(--disabled-text-color, var(--secondary-text-color)); }
  .tile-value { font-size: 22px; font-weight: 500; }
  .tile-value:empty { display: none; }
  .tile-label { font-size: 13px; color: var(--secondary-text-color); }
  .alert { display: flex; align-items: flex-start; gap: 12px; padding: 10px 0; border-top: 1px solid var(--divider-color); }
  .alert:first-of-type { border-top: none; }
  .alert .kind { color: var(--warning-color, #ffa600); margin-top: 2px; }
  .alert .kind.too_cold, .alert .kind.window_open_cold { color: var(--info-color, #039be5); }
  .alert .kind.co2_high, .alert .kind.humidity_high, .alert .kind.ventilate,
  .alert .kind.noise_high, .alert .kind.noisy_outside, .alert .kind.bad_air_outside { color: var(--primary-color); }
  .alert .kind.close_windows { color: var(--error-color); }
  .alert-body { flex: 1; min-width: 0; }
  .alert-title { font-weight: 500; }
  .alert-meta { font-size: 13px; color: var(--secondary-text-color); margin-top: 2px; }
  .badges { display: flex; gap: 6px; margin-top: 4px; flex-wrap: wrap; }
  .badge { font-size: 12px; padding: 1px 8px; border-radius: 10px; border: 1px solid var(--divider-color); color: var(--secondary-text-color); }
  .row-actions { display: flex; gap: 2px; }
  .empty { color: var(--secondary-text-color); padding: 8px 0; }
  .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 12px; }
  .grid .card { padding: 14px; }
  .grid .card.has-alert .card-header ha-icon { color: var(--warning-color, #ffa600); }
  .chips { display: flex; flex-wrap: wrap; gap: 6px; }
  .chip {
    display: inline-flex; align-items: center; gap: 4px; font-size: 13px;
    padding: 3px 10px 3px 6px; border-radius: 14px; background: rgba(var(--rgb-primary-text-color, 0, 0, 0), 0.05);
  }
  .chip ha-icon { --mdc-icon-size: 16px; color: var(--secondary-text-color); }
  .room-status { margin-top: 10px; font-size: 14px; }
  .is-ok .room-status { color: var(--success-color, #43a047); }
  .has-alert .room-status { color: var(--warning-color, #ffa600); }
  .devices { margin-top: 10px; border-top: 1px solid var(--divider-color); padding-top: 8px; display: flex; flex-direction: column; gap: 4px; }
  .device { display: flex; justify-content: space-between; gap: 8px; font-size: 13px; }
  .device-name { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .device-state { color: var(--secondary-text-color); white-space: nowrap; }
  .last-title { font-weight: 500; }
  .last-message { white-space: pre-line; margin-top: 4px; }
  .room-header { justify-content: space-between; margin-bottom: 0; gap: 12px; }
  .room-summary { flex: 1; display: flex; flex-wrap: wrap; align-items: center; gap: 10px; color: var(--secondary-text-color); font-size: 13px; }
  .summary-item { display: inline-flex; align-items: center; gap: 2px; }
  .summary-item ha-icon { --mdc-icon-size: 18px; }
  .badge.new { color: var(--primary-color); border-color: var(--primary-color); }
  .room-toggle { display: flex; align-items: center; gap: 6px; background: none; border: none; color: inherit; font: inherit; font-size: 18px; cursor: pointer; padding: 0; }
  .room-toggle ha-icon { color: var(--secondary-text-color); }
  .room-toggle .room-icon { color: var(--primary-color); margin: 0 2px 0 -2px; }
  .subheader { font-size: 14px; font-weight: 500; color: var(--secondary-text-color); margin: 18px 0 8px; text-transform: uppercase; letter-spacing: 0.04em; }
  pre.yaml { margin: 12px 0 0; padding: 12px; overflow-x: auto; border-radius: 8px; font: 13px/1.5 var(--code-font-family, monospace); background: rgba(var(--rgb-primary-text-color, 0, 0, 0), 0.05); white-space: pre; user-select: text; }
  .help { font-size: 13px; color: var(--secondary-text-color); margin: -4px 0 8px; }
  .section-title { display: flex; align-items: center; gap: 8px; font-size: 20px; margin: 28px 0 8px; }
  .section-title ha-icon { color: var(--secondary-text-color); }
  .section-help { margin: 0 0 12px; }
  .discover { display: flex; align-items: center; gap: 16px; }
  .discover-text { flex: 1; font-size: 14px; color: var(--secondary-text-color); line-height: 1.4; }
  @media (max-width: 600px) { .discover { flex-direction: column; align-items: flex-start; } }
  .device-item { display: flex; align-items: flex-start; gap: 4px; margin-bottom: 8px; }
  .device-item ha-form { flex: 1; }
  .device-item.slot { border: 1px solid var(--divider-color); border-radius: 12px; padding: 12px 4px 12px 12px; }
  .link { background: none; border: none; padding: 0; font: inherit; color: var(--primary-color); cursor: pointer; }
  .discover-more { margin-top: 8px; }
  /* Sections of a room and alert kinds: a line that opens, with a summary of what it holds */
  .sections { display: flex; flex-direction: column; margin-top: 12px; border-top: 1px solid var(--divider-color); }
  .section { border-bottom: 1px solid var(--divider-color); }
  .card > .section:last-child { border-bottom: none; }
  .section-head {
    width: 100%; display: flex; align-items: center; gap: 12px; padding: 12px 4px; background: none; border: none;
    font: inherit; color: inherit; cursor: pointer; text-align: left;
  }
  .section-head:hover { background: rgba(var(--rgb-primary-text-color, 0, 0, 0), 0.03); }
  .section-head > ha-icon { color: var(--secondary-text-color); --mdc-icon-size: 22px; }
  .section.open .section-head > ha-icon:first-child { color: var(--primary-color); }
  .section-name { font-size: 15px; font-weight: 500; white-space: nowrap; }
  .section-summary {
    flex: 1; min-width: 0; text-align: right; font-size: 13px; color: var(--secondary-text-color);
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .section-head .chevron { color: var(--secondary-text-color); }
  .section-body { padding: 4px 4px 16px 38px; display: flex; flex-direction: column; gap: 12px; }
  .section-body .help { margin: 0; }
  .section-body .subheader { margin: 8px 0 0; }
  .device-item { margin-bottom: 0; }
  /* "+ Something" for what isn't set yet */
  .add-chips { display: flex; flex-wrap: wrap; gap: 8px; }
  .add-chip {
    display: inline-flex; align-items: center; gap: 4px; padding: 5px 12px 5px 8px; border-radius: 16px;
    border: 1px dashed var(--divider-color); background: none; font: inherit; font-size: 13px;
    color: var(--primary-color); cursor: pointer;
  }
  .add-chip ha-icon { --mdc-icon-size: 18px; }
  .add-chip:hover { background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.08); border-style: solid; }
  /* Schedule */
  .timeline { display: grid; grid-template-columns: minmax(120px, max-content) 1fr; gap: 10px 14px; align-items: center; margin-top: 8px; }
  .tl-scale { position: relative; height: 16px; font-size: 11px; color: var(--secondary-text-color); }
  .tl-tick { position: absolute; transform: translateX(-50%); }
  .tl-tick:first-child { transform: none; }
  .tl-tick:last-child { transform: translateX(-100%); }
  .tl-label { display: flex; align-items: center; gap: 8px; font-size: 14px; }
  .tl-label ha-icon { --mdc-icon-size: 20px; color: var(--secondary-text-color); }
  .tl-bar { position: relative; height: 22px; border-radius: 11px; background: rgba(var(--rgb-primary-text-color, 0, 0, 0), 0.06); overflow: hidden; }
  .tl-bar.unset::after { content: "–"; position: absolute; left: 10px; top: 1px; font-size: 13px; color: var(--secondary-text-color); }
  .tl-seg { position: absolute; top: 0; bottom: 0; background: var(--primary-color); opacity: 0.85; }
  .tl-bar.quiet .tl-seg { background: var(--info-color, #039be5); }
  .tl-bar.night .tl-seg { background: #5c6bc0; }
  .tl-bar.morning .tl-seg { background: var(--warning-color, #ffa600); }
  .tl-bar.boost .tl-seg { background: var(--success-color, #43a047); }
  .tl-bar.displays .tl-seg { background: #78909c; }
  .tl-now { position: absolute; top: -2px; bottom: -2px; width: 2px; background: var(--error-color, #db4437); }
  .sched-row { padding: 12px 0; border-top: 1px solid var(--divider-color); }
  .card-header + .sched-row { border-top: none; padding-top: 0; }
  .sched-head { display: flex; align-items: center; gap: 10px; font-size: 15px; font-weight: 500; margin-bottom: 4px; }
  .sched-head ha-icon { color: var(--primary-color); }
  .sched-row .help { margin: 0 0 8px; }
  @media (max-width: 600px) {
    .content { padding: 12px; }
    /* A room's or outdoor place's name and its actions on the first line, what it holds on the next one. */
    .room-header { flex-wrap: wrap; row-gap: 6px; }
    .room-summary { order: 3; flex-basis: 100%; }
    .section-body { padding-left: 4px; }
    .section-summary { display: none; }
    .section-name { flex: 1; }
    .timeline { grid-template-columns: 1fr; gap: 4px; }
    .tl-scale { display: none; }
    .tl-bar { margin-bottom: 8px; }
  }
    /* Not clipped: the overview's popovers (device control, + N OK) open past the card; the banner rounds its own corners. */
    .shtop { padding:0; overflow:visible; }
    .shtop > .shbanner:first-child { border-top-left-radius:inherit; border-top-right-radius:inherit; }
    .shbanner { position:relative; height:90px; overflow:hidden; color:#1d2733; background:var(--sh-wall); --sh-sub:#4a5a6c; container-type:inline-size; }
    .shbanner.night { color:#fff; --sh-sub:rgba(255,255,255,.78); }
    .shscene { position:absolute; right:0; bottom:10px; height:80px; width:min(360px, 46%); }
    .shground { position:absolute; left:0; right:0; bottom:0; height:10px; }
    .g-parquet { background:repeating-linear-gradient(90deg, #c99a6b 0 38px, #b98a5c 38px 40px); box-shadow:inset 0 2px 0 #a97c50; }
    .night .g-parquet { background:repeating-linear-gradient(90deg, #4a3a2c 0 38px, #3e3024 38px 40px); box-shadow:inset 0 2px 0 #5c4836; }
    .g-tiles { background:repeating-linear-gradient(90deg, #d9dfe3 0 18px, #c6cdd2 18px 19px); box-shadow:inset 0 2px 0 #b8c0c6; }
    .night .g-tiles { background:repeating-linear-gradient(90deg, #3a4250 0 18px, #2e3542 18px 19px); box-shadow:inset 0 2px 0 #4a5262; }
    .g-concrete { background:#9aa1a9; box-shadow:inset 0 2px 0 #b5bbc2; }
    .night .g-concrete { background:#2c323b; box-shadow:inset 0 2px 0 #3a414c; }
    .shhead { position:absolute; z-index:1; left:0; top:0; bottom:10px; right:calc(min(360px, 46%) + 4px); padding:6px 12px; box-sizing:border-box;
              display:flex; align-items:center; gap:10px; min-width:0; }
    .shbadge { width:40px; height:40px; flex:none; border-radius:50%; display:grid; place-items:center; --mdc-icon-size:24px; color:var(--tone);
               background:rgba(255,255,255,.62); box-shadow:inset 0 0 0 1px color-mix(in srgb, var(--tone) 24%, transparent); }
    .night .shbadge { background:rgba(255,255,255,.12); color:color-mix(in srgb, var(--tone) 78%, #fff); box-shadow:inset 0 0 0 1px rgba(255,255,255,.14); }
    .shtitles { flex:1; min-width:0; display:flex; flex-direction:column; gap:2px; }
    .shtrow { display:flex; align-items:center; gap:8px; min-width:0; }
    .shtitle { flex:0 1 auto; min-width:0; font-size:16px; font-weight:500; line-height:1.25; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
    .shpill { flex:none; display:inline-flex; align-items:center; gap:5px; padding:1px 8px; border-radius:10px; font-size:12px; font-weight:500; line-height:16px;
              white-space:nowrap; max-width:60%; overflow:hidden; text-overflow:ellipsis;
              background:color-mix(in srgb, var(--tone) 16%, transparent); color:color-mix(in srgb, var(--tone) 60%, var(--primary-text-color, #1f2328)); }
    .shpill::before { content:""; flex:none; width:7px; height:7px; border-radius:50%; background:var(--tone); }
    .night .shpill { background:color-mix(in srgb, var(--tone) 22%, rgba(255,255,255,.12)); color:color-mix(in srgb, var(--tone) 55%, #fff); }
    .shsub { font-size:13px; line-height:18px; color:var(--sh-sub); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
    .idle { --tone:#8a96a6; }
    @container (max-width:560px) { .shscene { display:none; } .shhead { right:0; } }
    .shtop .subtabs { gap:4px; padding:0 12px; border-bottom:1px solid var(--divider-color, rgba(127,127,127,.2)); overflow-x:auto; flex-wrap:nowrap; }
    .shtop .subtab { min-height:0; padding:8px 10px; border:0; border-bottom:2px solid transparent; border-radius:6px 6px 0 0; margin-bottom:-1px;
                     background:none; color:var(--secondary-text-color); font-size:13px; font-weight:500; white-space:nowrap; gap:6px; --mdc-icon-size:16px; }
    .shtop .subtab:hover { color:var(--primary-text-color); border-color:transparent; }
    .shtop .subtab.active { color:var(--primary-text-color); background:none; border-bottom-color:var(--primary-color); }
    .shtop .subtab.active ha-icon { color:var(--primary-color); }
    .shtop .subdot { width:6px; height:6px; }
    .shscene .sh-blink { animation:sh-bl 1.2s steps(2) infinite; }
    .shscene .sh-fade { animation:sh-bl 1.6s ease-in-out infinite; }
    .shscene .sh-leaf { transform-box:fill-box; transform-origin:50% 100%; animation:sh-sway 4s ease-in-out infinite; }
    .shscene .sh-up { animation:sh-up 1.4s ease-in-out infinite; }
    .shscene .sh-cloud { animation:sh-drift 4s ease-in-out infinite alternate; }
    .shscene .sh-pir { opacity:.14; animation:sh-pir 2s ease-in-out infinite; }
    .shscene .sh-glow { animation:sh-glow 3s ease-in-out infinite; }
    .shscene .sh-float, .shscene .sh-dust { animation:sh-float 3s ease-in-out infinite; }
    .shscene :is(.sh-spin, .sh-rot, .sh-rot-rev, .sh-rot-fast, .sh-ping) { transform-box:fill-box; transform-origin:center; }
    .shscene .sh-spin { animation:sh-spin 1.6s linear infinite; }
    .shscene .sh-rot { animation:sh-spin 9s linear infinite; }
    .shscene .sh-rot-rev { animation:sh-spin 6s linear infinite reverse; }
    .shscene .sh-rot-fast { animation:sh-spin 1.4s linear infinite; }
    .shscene .sh-ping { animation:sh-ping 2s ease-out infinite; }
    @keyframes sh-bl { 50% { opacity:.2; } }
    @keyframes sh-sway { 0%, 100% { transform:rotate(-4deg); } 50% { transform:rotate(4deg); } }
    @keyframes sh-up { 50% { transform:translateY(-2px); } }
    @keyframes sh-drift { to { transform:translateX(4px); } }
    @keyframes sh-pir { 0%, 100% { opacity:.06; } 50% { opacity:.18; } }
    @keyframes sh-glow { 50% { opacity:.06; } }
    @keyframes sh-float { 50% { transform:translateY(-3px); } }
    @keyframes sh-ping { from { transform:scale(1); opacity:.9; } to { transform:scale(2.6); opacity:0; } }
    @media (prefers-reduced-motion: reduce) { .shscene * { animation:none !important; } }

    /* Charter: the header card's body, filled tiles with a round tinted icon, centred icons */
    ha-icon { display:inline-flex; align-items:center; justify-content:center; flex:none; line-height:0; }
    .shbody { display:flex; flex-direction:column; gap:12px; padding:12px 16px 16px; }
    .shbody > .card { border:0; padding:0; background:none; box-shadow:none; }
    .summary { gap:10px; grid-template-columns:repeat(auto-fill, minmax(160px, 1fr)); }
    .tile { background:color-mix(in srgb, var(--primary-text-color) 5%, transparent); border:0; border-radius:14px; padding:10px 12px; min-height:56px; box-sizing:border-box; }
    button.tile:hover { background:color-mix(in srgb, var(--primary-color) 10%, transparent); }
    .tile > ha-icon { width:36px; height:36px; border-radius:50%; --mdc-icon-size:20px;
                      background:color-mix(in srgb, var(--primary-color) 14%, transparent); }
    .tile.off > ha-icon { background:color-mix(in srgb, var(--disabled-text-color, #9e9e9e) 16%, transparent); }
    .tile-value { font-size:18px; line-height:1.2; }
    .tile-label { font-size:12px; line-height:1.3; }
    .tile-value:empty + .tile-label { grid-row:span 2; font-size:13px; color:var(--primary-text-color); }
    .card-header { font-size:13px; font-weight:600; letter-spacing:.06em; text-transform:uppercase; color:var(--secondary-text-color); }
    .card-header > ha-icon { --mdc-icon-size:20px; }
`;
