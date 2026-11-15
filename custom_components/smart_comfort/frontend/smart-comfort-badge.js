// Smart Comfort's sidebar badge, loaded on every page: the number of active alerts on the panel's sidebar item,
// coloured by the most serious one, like Home Assistant's own notifications count. The count and severity are read
// from the integration's "Active alerts" sensor (found by its unique `snoozes` attribute), which Home Assistant keeps
// up to date; the badge follows it. The last value is kept by the browser, so the sidebar shows it at once.
var SC_COUNT_KEY = 'smart-comfort-count';
var SC_TONE_KEY = 'smart-comfort-badge-tone';
var SC_EVERY_MS = 15000;
// The badge's colour follows the most serious active alert: critical, warning or info.
var SC_BADGE_COLORS = {
  bad: 'var(--error-color, #db4437)',
  warn: 'var(--warning-color, #ffa600)',
  info: 'var(--info-color, #039be5)',
};
// Dark text reads on the amber badge, white on the others.
var SC_BADGE_TEXT = { warn: 'rgba(0,0,0,.87)' };
// A severity to a tone; an active alert with no known severity falls back to warning.
var SC_SEVERITY_TONE = { critical: 'bad', warning: 'warn', info: 'info' };

function scBadgeSaved() {
  try {
    var n = parseInt(localStorage.getItem(SC_COUNT_KEY), 10);
    var tone = localStorage.getItem(SC_TONE_KEY);
    return { count: Number.isFinite(n) && n > 0 ? n : 0, tone: tone in SC_BADGE_COLORS ? tone : 'warn' };
  } catch (_err) {
    return { count: 0, tone: 'warn' };
  }
}
window.__smartComfortBadge ??= scBadgeSaved();

// The Smart Comfort item in Home Assistant's sidebar, or null until the sidebar is drawn. The recent sidebar gives
// each item the id `sidebar-panel-<path>` and sets its href as a property (not an attribute), so the id is the
// reliable hook; `[href]` and `[data-panel]` catch the older sidebars (an <a> wrapping a paper-icon-item).
function scSidebarItem() {
  var ha = document.querySelector('home-assistant')?.shadowRoot;
  var sidebar = ha?.querySelector('home-assistant-main')?.shadowRoot?.querySelector('ha-sidebar')?.shadowRoot;
  if (!sidebar) return null;
  return (
    sidebar.querySelector('#sidebar-panel-smart-comfort') ||
    sidebar.querySelector('[href="/smart-comfort"]') ||
    sidebar.querySelector('[data-panel="smart-comfort"]')
  );
}

// One badge span, styled as Home Assistant's own sidebar badge (class `badge`, so the sidebar's CSS places it and
// shows or hides it by slot and expanded state) but in our tone instead of the accent colour.
function scBadgeSpan(text, tone, slot, key) {
  var el = document.createElement('span');
  el.className = 'badge smart-comfort-badge';
  el.slot = slot;
  el.dataset.key = key;
  el.textContent = text;
  el.style.cssText = `min-width:18px; height:18px; box-sizing:border-box; padding:0 5px; align-items:center; border-radius:9px; font-size:11px; font-weight:500; line-height:1; color:${SC_BADGE_TEXT[tone] || '#fff'}; background:${SC_BADGE_COLORS[tone]};`;
  return el;
}

// The badge on the sidebar item: the number of active alerts, in the most serious severity's colour, like the
// notifications count; none when there is nothing active. On the recent sidebar (ha-list-item-button /
// ha-md-list-item) it mirrors Home Assistant's own badge — a span in the start slot (shown when the sidebar is
// collapsed, over the icon) and one in the end slot (shown when expanded) — so the sidebar's CSS handles the
// placement and the collapsed/expanded switch. On the older sidebar (an <a>) a single span is placed at the right.
// Redrawn when Home Assistant rebuilds its items; unchanged, it writes nothing (so the observer below does not loop).
function scBadgeRedraw() {
  var item = scSidebarItem();
  if (!item) return false;
  var count = window.__smartComfortBadge.count;
  var tone = window.__smartComfortBadge.tone;
  var spans = item.querySelectorAll(':scope > .smart-comfort-badge');
  if (!count) {
    for (var b of spans) b.remove();
    return true;
  }
  var text = count > 99 ? '99+' : String(count);
  var key = `${tone}:${text}`;
  if (item.localName === 'a') {
    var badge = spans[0];
    if (badge && badge.dataset.key === key) return true;
    if (!badge) {
      badge = document.createElement('span');
      badge.className = 'smart-comfort-badge';
      item.style.position = 'relative';
      item.appendChild(badge);
    }
    badge.dataset.key = key;
    badge.textContent = text;
    badge.style.cssText = `position:absolute; right:12px; top:50%; transform:translateY(-50%); min-width:18px; height:18px; box-sizing:border-box; padding:0 5px; display:inline-flex; align-items:center; justify-content:center; border-radius:9px; font-size:11px; font-weight:500; line-height:1; pointer-events:none; z-index:1; color:${SC_BADGE_TEXT[tone] || '#fff'}; background:${SC_BADGE_COLORS[tone]};`;
    return true;
  }
  if (spans.length === 2 && spans[0].dataset.key === key) return true;
  for (var old of spans) old.remove();
  // The start badge goes right after the icon, so the sidebar's `ha-svg-icon + .badge` rule places it over the icon.
  var icon = item.querySelector(':scope > ha-svg-icon[slot="start"]') || item.querySelector(':scope > ha-icon[slot="start"]');
  var start = scBadgeSpan(text, tone, 'start', key);
  if (icon) item.insertBefore(start, icon.nextSibling);
  else item.appendChild(start);
  item.appendChild(scBadgeSpan(text, tone, 'end', key));
  return true;
}

// Until the sidebar has drawn the item (it may come after this module): every 250 ms for 5 seconds
function scBadgeRedrawSoon(tries = 20) {
  if (scBadgeRedraw() || tries <= 1) return;
  setTimeout(() => scBadgeRedrawSoon(tries - 1), 250);
}

// The sidebar rebuilds its items (opened, folded, panels changed): the badge is added again when it is dropped
function scBadgeObserve() {
  var item = scSidebarItem();
  var sidebar = item?.getRootNode();
  if (!sidebar) {
    setTimeout(scBadgeObserve, 500);
    return;
  }
  if (sidebar.__smartComfortBadgeObserved) return;
  sidebar.__smartComfortBadgeObserved = true;
  new MutationObserver(() => {
    if (window.__smartComfortBadgeRaf) return;
    window.__smartComfortBadgeRaf = requestAnimationFrame(() => {
      window.__smartComfortBadgeRaf = 0;
      scBadgeRedraw();
    });
  }).observe(sidebar, { childList: true, subtree: true });
}

// The count and the most serious severity: the badge drawn again when they change, kept for the next page
function scSetBadge(count, tone) {
  count = Math.max(0, parseInt(count, 10) || 0);
  if (!(tone in SC_BADGE_COLORS)) tone = 'warn';
  if (window.__smartComfortBadge.count === count && window.__smartComfortBadge.tone === tone) return;
  window.__smartComfortBadge = { count: count, tone: tone };
  try {
    localStorage.setItem(SC_COUNT_KEY, String(count));
    localStorage.setItem(SC_TONE_KEY, tone);
  } catch (_err) {
    // drawn anyway, not kept
  }
  scBadgeRedraw();
}

// The integration's "Active alerts" sensor: the only sensor that carries a `snoozes` attribute. Its state is the
// number of active alerts, its `severity` attribute the most serious one.
function scActiveState(hass) {
  var states = hass?.states;
  if (!states) return null;
  for (var id in states) {
    if (!id.startsWith('sensor.')) continue;
    var st = states[id];
    if (st?.attributes && 'snoozes' in st.attributes) {
      if (hass.entities?.[id] && hass.entities[id].platform !== 'smart_comfort') continue;
      return st;
    }
  }
  return null;
}

// The active alerts read from the sensor, reported for the sidebar badge
function scFollow() {
  var hass = document.querySelector('home-assistant')?.hass;
  if (!hass?.user?.is_admin || document.hidden) return;
  var st = scActiveState(hass);
  if (!st) return;
  var count = parseInt(st.state, 10);
  if (!Number.isFinite(count)) count = 0;
  var tone = SC_SEVERITY_TONE[st.attributes.severity] || 'warn';
  scSetBadge(count, tone);
}

if (!window.__smartComfortBadge_init) {
  window.__smartComfortBadge_init = true;
  scBadgeRedrawSoon();
  scBadgeObserve();
  // The alerts read a few seconds after the page, once Home Assistant has drawn it, then every 15 seconds
  setTimeout(scFollow, 3000);
  setInterval(scFollow, SC_EVERY_MS);
}
