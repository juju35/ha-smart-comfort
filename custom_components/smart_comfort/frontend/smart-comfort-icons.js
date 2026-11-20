// Icon set "smart-comfort": the integration's emblem (a house with a thermometer and a bell), for the panel's sidebar
// entry (smart-comfort:comfort) and anywhere an icon name is accepted. A single monochrome path on the 24 grid, so it
// needs no view box. Registered in both the current and the older frontend icon APIs, like the sidebar's own icons,
// so it resolves whenever Home Assistant rebuilds the sidebar. Loaded on every page, since the
// sidebar shows before any dashboard. The active-alerts badge (smart-comfort-badge.js) carries the state.
(() => {
  const COMFORT =
    'M1.184,10.918 L10.784,2.998 Q11.28,2.589 11.776,2.998 L21.376,10.918 Q21.626,11.124 21.656,11.446 Q21.687,11.767 21.482,12.016 Q21.276,12.266 20.954,12.296 Q20.633,12.327 20.384,12.122 L11.28,4.611 L2.176,12.122 Q1.927,12.327 1.606,12.296 Q1.284,12.266 1.078,12.016 Q0.873,11.767 0.904,11.446 Q0.934,11.124 1.184,10.918 Z M4.98,10.2 L4.98,20.64 Q4.98,20.744 4.997,20.803 Q5.056,20.82 5.16,20.82 L17.4,20.82 Q17.504,20.82 17.563,20.803 Q17.58,20.744 17.58,20.64 L17.58,10.2 Q17.58,9.877 17.808,9.648 Q18.037,9.42 18.36,9.42 Q18.683,9.42 18.912,9.648 Q19.14,9.877 19.14,10.2 L19.14,20.64 Q19.14,21.443 18.672,21.912 Q18.203,22.38 17.4,22.38 L5.16,22.38 Q4.357,22.38 3.888,21.912 Q3.42,21.443 3.42,20.64 L3.42,10.2 Q3.42,9.877 3.648,9.648 Q3.877,9.42 4.2,9.42 Q4.523,9.42 4.752,9.648 Q4.98,9.877 4.98,10.2 Z M11.28,9.48 Q11.926,9.48 12.383,9.937 Q12.84,10.394 12.84,11.04 L12.84,17.52 Q12.84,18.166 12.383,18.623 Q11.926,19.08 11.28,19.08 Q10.634,19.08 10.177,18.623 Q9.72,18.166 9.72,17.52 L9.72,11.04 Q9.72,10.394 10.177,9.937 Q10.634,9.48 11.28,9.48 Z M11.28,10.68 Q11.131,10.68 11.025,10.785 Q10.92,10.891 10.92,11.04 L10.92,17.52 Q10.92,17.669 11.025,17.775 Q11.131,17.88 11.28,17.88 Q11.429,17.88 11.535,17.775 Q11.64,17.669 11.64,17.52 L11.64,11.04 Q11.64,10.891 11.535,10.785 Q11.429,10.68 11.28,10.68 Z M11.28,12.36 L11.28,12.36 C11.545,12.36 11.76,12.575 11.76,12.84 L11.76,18.36 C11.76,18.625 11.545,18.84 11.28,18.84 L11.28,18.84 C11.015,18.84 10.8,18.625 10.8,18.36 L10.8,12.84 C10.8,12.575 11.015,12.36 11.28,12.36 Z M13.08,18.72 C13.08,19.714 12.274,20.52 11.28,20.52 C10.286,20.52 9.48,19.714 9.48,18.72 C9.48,17.726 10.286,16.92 11.28,16.92 C12.274,16.92 13.08,17.726 13.08,18.72 Z M19.8,1.68 L19.806,1.68 C21.661,1.682 23.164,3.186 23.163,5.041 C23.162,6.897 21.658,8.4 19.803,8.4 C17.948,8.4 16.444,6.897 16.443,5.041 C16.442,3.186 17.945,1.682 19.8,1.68 Z M19.8,3.72 C19.08,3.72 18.72,4.26 18.72,4.92 L18.72,5.4 L18.36,5.88 L21.24,5.88 L20.88,5.4 L20.88,4.92 C20.88,4.26 20.52,3.72 19.8,3.72 Z M19.44,6.12 C19.44,6.319 19.601,6.48 19.8,6.48 C19.999,6.48 20.16,6.319 20.16,6.12 Z';
  const icons = { comfort: COMFORT };
  // Current frontend: window.customIcons[prefix] = { getIcon, getIconList }.
  window.customIcons = window.customIcons || {};
  window.customIcons['smart-comfort'] = {
    getIcon: async (name) => ({ path: icons[name] || COMFORT }),
    getIconList: async () => Object.keys(icons).map((name) => ({ name })),
  };
  // Older frontends: window.customIconsets[prefix] = async (name) => ({ path }).
  window.customIconsets = window.customIconsets || {};
  window.customIconsets['smart-comfort'] = async (name) => ({ path: icons[name] || COMFORT });

  // Home Assistant draws an icon whose set is not registered yet as a legacy <iron-icon>, and that ha-icon keeps the
  // legacy mode for good (the flag is only cleared for MDI icons): a sidebar drawn before this module ran — the first
  // load of a page, the module not cached yet — showed the emblem blank until the page was reloaded. Those icons are
  // reset and drawn again: at once, then every 250 ms until the sidebar has drawn the entry (up to 15 s).
  const PREFIX = 'smart-comfort:';
  const redraw = (root, depth = 0) => {
    if (!root || depth > 8) return 0;
    let found = 0;
    for (const el of root.querySelectorAll('*')) {
      if (el.localName === 'ha-icon' && String(el.icon || '').startsWith(PREFIX)) {
        found += 1;
        if (el._legacy) {
          const icon = el.icon;
          el._legacy = false;
          el.icon = '';
          requestAnimationFrame(() => {
            el.icon = icon;
          });
        }
      }
      if (el.shadowRoot) found += redraw(el.shadowRoot, depth + 1);
    }
    return found;
  };
  const redrawSoon = (tries = 60) => {
    if (redraw(document.querySelector('home-assistant')?.shadowRoot) || tries <= 1) return;
    setTimeout(() => redrawSoon(tries - 1), 250);
  };
  redrawSoon();
})();
