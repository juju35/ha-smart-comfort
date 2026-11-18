// Smart Comfort's "Hide the top bar" option, loaded on every page for every user: hides the top bar of the dashboards
// (title, menu, edit and search buttons; the view tabs stay) for everyone or only for the users who are not
// administrators, set in the panel's Settings tab. The setting is read from `smart_comfort/header` (open to every user) and kept by the browser,
// so the bar is hidden at once on the next visit. `?show_header` in the address shows the bar anyway.
var SCH_KEY = 'smart-comfort-hide-header';
// Whether the last user seen was an administrator: known before Home Assistant has loaded the user, so that a
// non-admin's bar is hidden from the first frame.
var SCH_ADMIN_KEY = 'smart-comfort-hide-header-admin';
var SCH_STYLE_ID = 'smart-comfort-hide-header';
var SCH_MODES = ['off', 'everyone', 'non_admins'];
// Home Assistant's dashboard (hui-root). A dashboard with several views keeps its view tabs (the bar shows only them:
// no menu, title or buttons); one with a single view, or a subview, loses the whole bar and the room left for it. The
// edit mode is left alone.
var SCH_LIVE = ':not(.edit-mode) > .header';
var SCH_CSS =
  `${SCH_LIVE}:not(:has(.toolbar ha-tab-group)) { display:none !important; }` +
  ` ${SCH_LIVE}:not(:has(.toolbar ha-tab-group)) ~ #view { padding-top:var(--safe-area-inset-top, 0px) !important; }` +
  ` ${SCH_LIVE} .toolbar:has(ha-tab-group) > :not(ha-tab-group) { display:none !important; }`;
var SCH_EVERY_MS = 1000;
var SCH_FETCH_MS = 300000;

function schSaved() {
  try {
    var mode = localStorage.getItem(SCH_KEY);
    return SCH_MODES.includes(mode) ? mode : 'off';
  } catch (_err) {
    return 'off';
  }
}
window.__smartComfortHeader ??= schSaved();

function schSet(mode) {
  var next = SCH_MODES.includes(mode) ? mode : 'off';
  window.__smartComfortHeader = next;
  try {
    localStorage.setItem(SCH_KEY, next);
  } catch (_err) {
    // Private browsing: the setting is asked again on the next page load.
  }
  schApply();
}

function schHass() {
  return document.querySelector('home-assistant')?.hass;
}

// The dashboard's own shadow root (hui-root), or null when the page is not a dashboard.
function schDashboard() {
  var main = document.querySelector('home-assistant')?.shadowRoot?.querySelector('home-assistant-main')?.shadowRoot;
  var lovelace = main?.querySelector('ha-panel-lovelace');
  return lovelace?.shadowRoot?.querySelector('hui-root')?.shadowRoot || null;
}

function schIsAdmin(hass) {
  try {
    if (hass?.user) {
      var admin = Boolean(hass.user.is_admin);
      if (localStorage.getItem(SCH_ADMIN_KEY) !== String(admin)) localStorage.setItem(SCH_ADMIN_KEY, String(admin));
      return admin;
    }
    // The user not loaded yet: the last one seen in this browser; never seen, an administrator (the bar stays).
    return localStorage.getItem(SCH_ADMIN_KEY) !== 'false';
  } catch (_err) {
    return hass?.user ? Boolean(hass.user.is_admin) : true;
  }
}

function schHidden(hass) {
  if (/[?&]show_header\b/.test(location.search)) return false;
  var mode = window.__smartComfortHeader;
  if (mode === 'everyone') return true;
  return mode === 'non_admins' && !schIsAdmin(hass);
}

// The hiding style in a dashboard's shadow root, added or removed to match the setting.
function schApplyTo(root) {
  if (!root) return;
  var style = root.getElementById(SCH_STYLE_ID);
  var hide = schHidden(schHass());
  if (hide && !style) {
    style = document.createElement('style');
    style.id = SCH_STYLE_ID;
    style.textContent = SCH_CSS;
    root.append(style);
  } else if (!hide && style) {
    style.remove();
  }
}

function schApply() {
  schApplyTo(schDashboard());
}

// The dashboard element itself: the style goes into its shadow root as soon as it is attached, before its first
// render, so the bar is never drawn then hidden. Lit leaves the nodes it did not render alone.
function schPatchDashboard() {
  var proto = customElements.get('hui-root')?.prototype;
  if (!proto || proto.__smartComfortHeader) return;
  proto.__smartComfortHeader = true;
  var connected = proto.connectedCallback;
  proto.connectedCallback = function (...args) {
    connected?.apply(this, args);
    schApplyTo(this.shadowRoot);
  };
  var updated = proto.updated;
  proto.updated = function (...args) {
    updated?.apply(this, args);
    schApplyTo(this.shadowRoot);
  };
}

// The setting, asked of Home Assistant once it is connected, then every 5 minutes.
function schFetch() {
  var connection = schHass()?.connection;
  if (!connection) {
    setTimeout(schFetch, 2000);
    return;
  }
  connection
    .sendMessagePromise({ type: 'smart_comfort/header' })
    .then((result) => schSet(result?.hide_header))
    .catch((err) => {
      // Smart Comfort removed or not set up: nothing is hidden any more.
      if (err?.code === 'unknown_command' || err?.code === 'not_found') schSet('off');
    });
}

if (!window.__smartComfortHeader_init) {
  window.__smartComfortHeader_init = true;
  // The panel tells at once when the setting is saved.
  window.addEventListener('smart-comfort-header', (ev) => schSet(ev.detail?.hide_header));
  window.addEventListener('location-changed', () => setTimeout(schApply, 0));
  customElements.whenDefined('hui-root').then(schPatchDashboard);
  // A fallback, should Home Assistant's dashboard element change: the check is cheap, made every second.
  setInterval(schApply, SCH_EVERY_MS);
  schApply();
  schFetch();
  setInterval(schFetch, SCH_FETCH_MS);
}
