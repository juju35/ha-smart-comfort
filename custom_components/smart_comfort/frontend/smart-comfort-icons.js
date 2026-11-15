// Smart Comfort's sidebar icon, loaded on every page: the integration's emblem (a house with a thermometer and a
// bell) as a custom icon set, so the panel's sidebar icon is `smart-comfort:comfort` instead of a generic mdi one.
// A single monochrome path (it follows the sidebar's own colour); the active-alerts badge (smart-comfort-badge.js)
// carries the state. The icon is redrawn once at load for any element shown before this set was known (blank until
// its icon changes), as Home Assistant keeps the last one so the sidebar shows it at once.
var SC_ICON_PATH =
  'M87.727,225.972 L247.727,93.972 Q256,87.147 264.273,93.972 L424.273,225.972 Q428.427,229.399 428.941,234.759 Q429.455,240.119 426.028,244.273 Q422.601,248.427 417.241,248.941 Q411.881,249.455 407.727,246.028 L256,120.853 L104.273,246.028 Q100.119,249.455 94.759,248.941 Q89.399,248.427 85.972,244.273 Q82.545,240.119 83.059,234.759 Q83.573,229.399 87.727,225.972 Z M151,214 L151,388 Q151,389.736 151.281,390.719 Q152.264,391 154,391 L358,391 Q359.736,391 360.719,390.719 Q361,389.736 361,388 L361,214 Q361,208.615 364.808,204.808 Q368.615,201 374,201 Q379.385,201 383.192,204.808 Q387,208.615 387,214 L387,388 Q387,401.385 379.192,409.192 Q371.385,417 358,417 L154,417 Q140.615,417 132.808,409.192 Q125,401.385 125,388 L125,214 Q125,208.615 128.808,204.808 Q132.615,201 138,201 Q143.385,201 147.192,204.808 Q151,208.615 151,214 Z M256,202 Q266.77,202 274.385,209.615 Q282,217.23 282,228 L282,336 Q282,346.77 274.385,354.385 Q266.77,362 256,362 Q245.23,362 237.615,354.385 Q230,346.77 230,336 L230,228 Q230,217.23 237.615,209.615 Q245.23,202 256,202 Z M256,222 Q253.515,222 251.757,223.757 Q250,225.515 250,228 L250,336 Q250,338.485 251.757,340.243 Q253.515,342 256,342 Q258.485,342 260.243,340.243 Q262,338.485 262,336 L262,228 Q262,225.515 260.243,223.757 Q258.485,222 256,222 Z M256,250 L256,250 A8 8 0 0 1 264,258 L264,350 A8 8 0 0 1 256,358 L256,358 A8 8 0 0 1 248,350 L248,258 A8 8 0 0 1 256,250 Z M286,356 A30 30 0 1 1 226,356 A30 30 0 1 1 286,356 Z M398,72 L398.1,72 C429.018,72.028 454.064,97.107 454.05,128.025 C454.036,158.943 428.968,184 398.05,184 C367.132,184 342.064,158.943 342.05,128.025 C342.036,97.107 367.082,72.028 398,72 Z M398,106 C386,106 380,115 380,126 L380,134 L374,142 L422,142 L416,134 L416,126 C416,115 410,106 398,106 Z M392,146 C392,149.314 394.686,152 398,152 C401.314,152 404,149.314 404,146 Z';
var SC_ICON_VIEWBOX = '68 44 400 400';

window.customIcons = window.customIcons || {};
window.customIcons['smart-comfort'] = {
  getIcon: async () => ({ path: SC_ICON_PATH, viewBox: SC_ICON_VIEWBOX }),
  getIconList: async () => [{ name: 'comfort' }],
};

// Icons drawn before this set was known (shown blank until their icon changes): drawn again, here only.
function scIconRedraw(root, depth = 0) {
  if (!root || depth > 8) return 0;
  var found = 0;
  for (var el of root.querySelectorAll('*')) {
    if (el.localName === 'ha-icon' && String(el.icon || '').startsWith('smart-comfort:')) {
      var icon = el.icon;
      el.icon = '';
      requestAnimationFrame(() => {
        el.icon = icon;
      });
      found += 1;
    }
    if (el.shadowRoot) found += scIconRedraw(el.shadowRoot, depth + 1);
  }
  return found;
}

// At once, then until the sidebar has drawn the icon (it may come after this module): every 250 ms for 5 seconds
function scIconRedrawSoon(tries = 20) {
  if (scIconRedraw(document.querySelector('home-assistant')?.shadowRoot) || tries <= 1) return;
  setTimeout(() => scIconRedrawSoon(tries - 1), 250);
}

if (!window.__smartComfortIcons_init) {
  window.__smartComfortIcons_init = true;
  scIconRedrawSoon();
}
