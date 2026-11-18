// Smart Comfort's "Hide the top bar" option, loaded on every page for every user: hides the top bar of the dashboards
// (title, views, edit and search buttons) for everyone or only for the users who are not administrators, set in the
// panel's Settings tab. The setting is read from `smart_comfort/header` (open to every user) and kept by the browser,
// so the bar is hidden at once on the next visit. `?show_header` in the address shows the bar anyway.
var SCH_KEY = 'smart-comfort-hide-header';
var SCH_STYLE_ID = 'smart-comfort-hide-header';
var SCH_MODES = ['off', 'everyone', 'non_admins'];
// Home Assistant's dashboard (hui-root): its header, and the view's room left for it.
var SCH_CSS =
  '.header { display:none !important; }' +
  ' #view { padding-top:var(--safe-area-inset-top, env(safe-area-inset-top, 0px)) !important; min-height:100vh !important; }';
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

function schHidden(hass) {
  if (/[?&]show_header\b/.test(location.search)) return false;
  var mode = window.__smartComfortHeader;
  if (mode === 'everyone') return true;
  // Until the user is known, an administrator is not assumed: the bar stays.
  return mode === 'non_admins' && hass?.user != null && !hass.user.is_admin;
}

function schApply() {
  var root = schDashboard();
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
  // A dashboard is drawn again on navigation and on reconnection: the check is cheap, made every second.
  setInterval(schApply, SCH_EVERY_MS);
  schApply();
  schFetch();
  setInterval(schFetch, SCH_FETCH_MS);
}
