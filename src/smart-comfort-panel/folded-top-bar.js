// ── Folded top bar ──
// As on the dashboards' illustrated headers (ha-dashboard-header): past 24 px of scroll the 90 px top bar and the
// text tabs fold into one 64 px bar — the panel's icon, title and line, the tabs as round icon pills, the status pill
// and the round buttons — sticky at the top; back under 8 px they unfold. The content does not move: the folded bar
// keeps the room of the top bar and tabs under it. On a narrow panel the pills get a row of their own under the bar,
// the status pill turns to a dot and only the first round button is kept. The folded bar mirrors the top bar and the
// tabs (their text, counts, active tab and buttons): a click on a pill or a button clicks the original.
export const smartComfortPanel_FOLD_CSS = `
  .pf-sense { position:relative; height:0; }
  .pf-sense, .pf-fold, .pf-top, .pf-tabs { overflow-anchor:none; }
  .pf-sense > i { position:absolute; left:0; width:1px; height:1px; pointer-events:none; visibility:hidden; }
  .pf-sense > .pf-s1 { top:24px; } .pf-sense > .pf-s2 { top:8px; }
  .pf-fold { display:none; position:sticky; top:0; z-index:6; container-type:inline-size; color:var(--primary-text-color);
             background:var(--card-background-color, #fff); border-bottom:1px solid var(--divider-color, rgba(0,0,0,.12));
             box-shadow:0 2px 8px rgba(0,0,0,.08); }
  :host([pf-folded]) .pf-fold { display:block; }
  .pf-fold.pf-measure { display:block; position:absolute; visibility:hidden; }
  :host([pf-folded]) .pf-top, :host([pf-folded]) .pf-tabs { display:none !important; }
  .pf-bar { display:flex; flex-wrap:wrap; align-items:center; column-gap:12px; min-height:64px; padding:0 16px; box-sizing:border-box; }
  .pf-menu { flex:none; display:flex; margin-inline:-8px -4px; color:var(--primary-text-color); }
  .pf-menu[hidden] { display:none; }
  .pf-ic { flex:none; width:40px; height:40px; border-radius:50%; display:grid; place-items:center; color:var(--pf-accent);
           background:color-mix(in srgb, currentColor 14%, transparent); }
  .pf-ic svg, .pf-ic img { width:22px; height:22px; fill:currentColor; }
  .pf-ic ha-icon, .pf-ic ha-svg-icon { --mdc-icon-size:22px; }
  .pf-names { display:flex; flex-direction:column; flex:0 1 auto; min-width:0; max-width:260px; }
  .pf-t { font-size:17px; font-weight:700; line-height:1.2; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .pf-s { font-size:12.5px; line-height:1.3; color:var(--secondary-text-color); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .pf-s:empty { display:none; }
  .pf-pills { display:flex; gap:6px; flex:1 1 0; min-width:0; overflow-x:auto; scrollbar-width:none; padding:8px 6px 6px 2px; }
  .pf-pills::-webkit-scrollbar { display:none; }
  .pf-pill { all:unset; position:relative; flex:none; width:48px; height:40px; box-sizing:border-box; border-radius:999px; cursor:pointer;
             display:grid; place-items:center; color:var(--primary-text-color); border:1px solid var(--divider-color, rgba(0,0,0,.12)); }
  .pf-pill:hover { background:color-mix(in srgb, currentColor 6%, transparent); }
  .pf-pill[aria-selected="true"] { color:var(--pf-accent); border:1.5px solid var(--pf-accent); background:color-mix(in srgb, var(--pf-accent) 14%, transparent); }
  .pf-pill:focus-visible { outline:2px solid var(--pf-accent); outline-offset:2px; }
  .pf-pill svg { width:20px; height:20px; fill:currentColor; flex:none; }
  .pf-pill ha-icon { --mdc-icon-size:20px; display:flex; }
  .pf-pill .pf-l { font-size:14px; font-weight:700; }
  .pf-pill b { position:absolute; top:-5px; right:-5px; min-width:18px; height:18px; padding:0 4px; box-sizing:border-box; border-radius:999px;
               font-size:11px; font-weight:700; line-height:14px; text-align:center; color:#fff; background:var(--pf-accent);
               border:2px solid var(--card-background-color, #fff); }
  .pf-end { display:flex; align-items:center; gap:8px; flex:0 1 auto; min-width:0; margin-inline-start:auto; }
  .pf-end > :not(.pf-stat):not(.pf-acts) { min-width:0; max-width:220px; }
  .pf-stat { display:inline-flex; align-items:center; gap:6px; padding:5px 11px; border-radius:999px; font-size:12px; font-weight:600;
             white-space:nowrap; color:var(--pf-c); background:color-mix(in srgb, var(--pf-c) 14%, transparent); }
  .pf-stat > i { width:8px; height:8px; border-radius:50%; background:currentColor; flex:none; }
  .pf-stat:empty, .pf-stat[hidden] { display:none; }
  .pf-acts { display:flex; gap:8px; }
  .pf-acts > * { all:unset; box-sizing:border-box; cursor:pointer; width:40px; height:40px; border-radius:50%; display:grid; place-items:center;
                 color:var(--primary-text-color); border:1px solid var(--divider-color, rgba(0,0,0,.12)); }
  .pf-acts > *:hover { background:color-mix(in srgb, currentColor 6%, transparent); }
  .pf-acts > *:focus-visible { outline:2px solid var(--pf-accent); outline-offset:2px; }
  .pf-acts > *[disabled] { opacity:.6; cursor:default; }
  .pf-acts svg { width:20px; height:20px; fill:currentColor; }
  .pf-acts > .on { color:var(--pf-on, var(--pf-accent)); border:1.5px solid currentColor; background:color-mix(in srgb, currentColor 14%, transparent); }
  .pf-acts ha-icon { --mdc-icon-size:20px; display:flex; }
  .pf-acts .spin svg, .pf-acts .spinning svg { animation:pf-spin 1s linear infinite; }
  @keyframes pf-spin { to { transform:rotate(360deg); } }
  .pf-extra:empty { display:none; }
  .pf-subs { position:absolute; left:0; right:0; top:100%; display:flex; gap:4px; padding:0 12px; overflow-x:auto; scrollbar-width:none;
             background:var(--card-background-color, #fff); border-bottom:1px solid var(--divider-color, rgba(0,0,0,.12));
             box-shadow:0 2px 8px rgba(0,0,0,.08); }
  .pf-subs[hidden] { display:none; }
  .pf-subs::-webkit-scrollbar { display:none; }
  .pf-sub { all:unset; flex:none; display:inline-flex; align-items:center; gap:6px; padding:9px 10px 7px; cursor:pointer; font-size:13px;
            font-weight:500; color:var(--secondary-text-color); border-bottom:2px solid transparent; white-space:nowrap; --mdc-icon-size:18px; }
  .pf-sub:hover { color:var(--primary-text-color); }
  .pf-sub[aria-selected="true"] { color:var(--primary-text-color); border-bottom-color:var(--pf-accent); }
  .pf-sub[aria-selected="true"] ha-icon { color:var(--pf-accent); }
  .pf-sub:focus-visible { outline:2px solid var(--pf-accent); outline-offset:-2px; }
  @container (max-width: 600px) {
    .pf-bar { min-height:0; padding:12px 12px 0 16px; column-gap:10px; row-gap:2px; }
    .pf-names { flex:1 1 0; max-width:none; }
    .pf-t { font-size:17px; }
    .pf-pills { order:9; flex:1 0 100%; margin:0 -12px 0 -16px; padding:6px 12px 10px; }
    .pf-stat { width:26px; height:26px; padding:0; justify-content:center; }
    .pf-stat > span { position:absolute; width:1px; height:1px; overflow:hidden; clip:rect(0 0 0 0); white-space:nowrap; }
    .pf-acts > *:not(:first-child) { display:none; }
    .pf-end > :not(.pf-stat):not(.pf-acts) { max-width:120px; }
    .pf-amenu .pf-acts > *, .pf-amenu .pf-acts > *:not(:first-child) { display:none; }
    .pf-amenu .pf-acts > .on { display:grid; position:relative; }
    .pf-amenu .pf-acts > .on::after { content:""; position:absolute; right:-3px; bottom:-3px; width:14px; height:14px; border-radius:50%;
      background:var(--card-background-color, #fff) no-repeat center / 12px
      url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%23888' d='M7 10l5 5 5-5z'/%3E%3C/svg%3E");
      box-shadow:0 0 0 1px var(--divider-color, rgba(0,0,0,.12)); }
    .pf-amenu.pf-open .pf-acts { position:absolute; z-index:3; right:8px; top:8px; flex-direction:column; padding:6px; border-radius:26px;
      background:var(--card-background-color, #fff); box-shadow:0 6px 18px rgba(0,0,0,.18); }
    .pf-amenu.pf-open .pf-acts > * { display:grid; }
    .pf-amenu.pf-open .pf-acts > .on::after { display:none; }
  }
`;

/**
 * Folds the panel's top bar on scroll. `o`: `top` and `tabs` (the top bar and the tab row), `tab` (a tab, in the
 * row), `key` (a tab's id, from the button), `icons` (id → SVG path), `badge` (a tab's count, in it), `name`, `sub`,
 * `icon`, `status` (in the top bar), `acts` (its round buttons), `accent` (CSS colour), `extra` (an element shown
 * under the bar when folded, such as a sub-tab row: moved there while folded), `side` (an element moved before the
 * status pill while folded, such as an account picker), `subtab` (the sub-tabs of the tab shown, in the page:
 * mirrored in a row under the folded bar), `mount` (the node the folded bar goes before, when not the top bar), `menu` (() => ({ hass, narrow,
 * show })) for Home Assistant's menu button, `css` (the panel's own rules while folded; the folded bar's height is
 * `--pf-h` on the panel), `actsMenu` (narrow: only the active button `.on`, which opens the others, such as alarm
 * modes), `folded` (start folded: the page was drawn again while folded), `badgeColors` (the counts take the colours of the tabs' own badges), `skip` (() => true while the top bar must not fold). Returns { sync, detach }, or null when the panel has no top bar.
 */
export function smartComfortPanelFold(host, o) {
  const root = host.shadowRoot;
  const q = (sel) => (sel ? root?.querySelector?.(sel) : null);
  const top = q(o.top);
  const tabs = q(o.tabs);
  host.removeAttribute?.("pf-folded");
  if (!root || !top || !tabs || typeof root.querySelector !== "function") return null;
  if (!root.getElementById?.("pf-style")) {
    const style = document.createElement("style");
    style.id = "pf-style";
    style.textContent = smartComfortPanel_FOLD_CSS + (o.css || "");
    root.appendChild(style);
  }
  top.classList.add("pf-top");
  tabs.classList.add("pf-tabs");
  const sense = document.createElement("div");
  sense.className = "pf-sense";
  sense.setAttribute("aria-hidden", "true");
  sense.innerHTML = '<i class="pf-s1"></i><i class="pf-s2"></i>';
  const fold = document.createElement("div");
  fold.className = "pf-fold";
  fold.style.setProperty("--pf-accent", o.accent);
  if (o.actsMenu) fold.classList.add("pf-amenu");
  fold.innerHTML = `<div class="pf-bar"><span class="pf-menu" hidden></span><span class="pf-ic" aria-hidden="true"></span>
    <div class="pf-names"><span class="pf-t"></span><span class="pf-s"></span></div>
    <div class="pf-pills" role="tablist"></div>
    <div class="pf-end"><span class="pf-stat" role="status"></span><div class="pf-acts"></div></div></div><div class="pf-extra"></div><div class="pf-subs" role="tablist" hidden></div>`;
  const at = o.mount || top;
  at.parentNode.insertBefore(sense, at);
  at.parentNode.insertBefore(fold, at);
  const el = (c) => fold.querySelector(c);
  // Home Assistant's menu button, in a shadow root of its own: the panel's own look-ups of its menu button never
  // find this one
  const menuBtn = document.createElement("ha-menu-button");
  el(".pf-menu").attachShadow?.({ mode: "open" })?.append(menuBtn);
  // A copy keeps the icons of its ha-icon elements, which panels often set as a property (not copied by cloneNode)
  const copyIcons = (from, to) => {
    const a = from.matches?.("ha-icon") ? [from] : [...from.querySelectorAll("ha-icon")];
    const b = to.matches?.("ha-icon") ? [to] : [...to.querySelectorAll("ha-icon")];
    a.forEach((n, i) => {
      const icon = n.icon || n.getAttribute("icon");
      if (b[i] && icon) b[i].setAttribute("icon", icon);
    });
  };
  const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[ch]);
  let folded = false;
  let queued = false;
  let extraHome = null;
  let sideHome = null;

  const tabButtons = () => [...tabs.querySelectorAll(o.tab)];
  const tabLabel = (b) => {
    const clone = b.cloneNode(true);
    for (const n of clone.querySelectorAll?.(`${o.badge || ".badge"}, ha-menu-button, svg`) || []) n.remove();
    return (b.getAttribute("aria-label") || clone.textContent || "").trim();
  };
  const isActive = (b) => b.classList.contains("active") || b.getAttribute("aria-selected") === "true";

  const sync = () => {
    queued = false;
    if (!folded) return;
    const iconBox = q(o.icon);
    const icon = iconBox?.querySelector("svg, ha-icon, ha-svg-icon, img");
    const iconCopy = icon?.cloneNode(true);
    if (iconCopy) copyIcons(icon, iconCopy);
    el(".pf-ic").replaceChildren(...(iconCopy ? [iconCopy] : []));
    // The icon keeps the colour of its state, as in the top bar
    el(".pf-ic").style.color = iconBox && !o.iconAccent ? getComputedStyle(iconBox).color : "";
    el(".pf-t").textContent = (q(o.name)?.textContent || "").trim();
    el(".pf-s").textContent = (q(o.sub)?.textContent || "").trim();
    const st = q(o.status);
    const stat = el(".pf-stat");
    const text = (st?.textContent || "").trim();
    stat.hidden = !text;
    if (text) {
      stat.style.setProperty("--pf-c", getComputedStyle(st).color || "var(--pf-accent)");
      stat.setAttribute("aria-label", text);
      stat.innerHTML = `<i></i><span>${esc(text)}</span>`;
    }
    const focused = root.activeElement?.closest?.(".pf-pill")?.dataset.i;
    const shown = tabs.hidden ? [] : tabButtons();
    el(".pf-pills").innerHTML = (shown.length > 1 ? shown : [])
      .map((b, i) => {
        const id = o.key(b);
        const label = tabLabel(b);
        const badgeEl = b.querySelector(o.badge || ".badge");
        const count = (badgeEl?.textContent || "").trim();
        // The count in the colour of its tab's own badge (its tone), where the panel colours them
        let tone = "";
        if (count && o.badgeColors) {
          const cs = getComputedStyle(badgeEl);
          tone = ` style="background:${cs.backgroundColor};color:${cs.color}"`;
        }
        const path = o.icons[id];
        const own = path ? null : b.querySelector("svg, ha-icon");
        const ownIcon = own?.localName === "ha-icon" ? own.icon || own.getAttribute("icon") : null;
        const glyph = !path
          ? own
            ? ownIcon
              ? `<ha-icon icon="${esc(ownIcon)}" aria-hidden="true"></ha-icon>`
              : own.outerHTML
            : `<span class="pf-l" aria-hidden="true">${esc(label.slice(0, 1))}</span>`
          : path.startsWith("mdi:")
            ? `<ha-icon icon="${esc(path)}" aria-hidden="true"></ha-icon>`
            : `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${path}"/></svg>`;
        const on = isActive(b);
        return `<button class="pf-pill" role="tab" data-i="${i}" aria-selected="${on}" tabindex="${on ? 0 : -1}" title="${esc(label)}" aria-label="${esc(count ? `${label} (${count})` : label)}">${glyph}${count ? `<b aria-hidden="true"${tone}>${esc(count)}</b>` : ""}</button>`;
      })
      .join("");
    if (focused !== undefined) el(`.pf-pill[data-i="${focused}"]`)?.focus({ preventScroll: true });
    // The active pill in sight in a scrolling row, without scrolling the page
    const row = el(".pf-pills");
    const act = el(".pf-pill[aria-selected=true]");
    if (act && (act.offsetLeft < row.scrollLeft || act.offsetLeft + act.offsetWidth > row.scrollLeft + row.clientWidth)) {
      row.scrollLeft = Math.max(0, act.offsetLeft - 16);
    }
    // The sub-tabs of the tab shown (in the page, under the top bar), mirrored in a row under the folded bar
    const subs = o.subtab ? [...root.querySelectorAll(o.subtab)].filter((b) => !fold.contains(b)) : [];
    const subRow = el(".pf-subs");
    subRow.hidden = subs.length < 2;
    subRow.innerHTML = subs.length < 2 ? "" : subs
      .map((b, i) => {
        const on = isActive(b);
        const hi = b.querySelector("ha-icon");
        const ic = hi && (hi.icon || hi.getAttribute("icon"));
        return `<button class="pf-sub" role="tab" data-s="${i}" aria-selected="${on}" tabindex="${on ? 0 : -1}">${ic ? `<ha-icon icon="${esc(ic)}" aria-hidden="true"></ha-icon>` : ""}${esc(tabLabel(b))}</button>`;
      })
      .join("");
    subRow.onclick = (ev) => {
      const sb = ev.target.closest?.(".pf-sub");
      if (sb) subs[Number(sb.dataset.s)]?.click();
    };
    const acts = el(".pf-acts");
    acts.textContent = "";
    for (const a of o.acts ? root.querySelectorAll(o.acts) : []) {
      if (a.offsetParent === null && !top.contains(a)) continue;
      const c = a.cloneNode(true);
      copyIcons(a, c);
      c.removeAttribute("id");
      // An active button (`.on`) keeps the colour of its state
      if (c.classList.contains("on")) c.style.setProperty("--pf-on", getComputedStyle(a).color);
      if (c.tagName !== "A") {
        // The panel's own click handlers see the original only (its data-* stay off the copy)
        for (const n of [c, ...c.querySelectorAll("*")]) for (const at of [...n.attributes]) if (at.name.startsWith("data-")) n.removeAttribute(at.name);
        c.addEventListener("click", (ev) => {
          ev.preventDefault();
          ev.stopPropagation();
          // Narrow, with `actsMenu`: the active button opens the list of the others first
          if (o.actsMenu && fold.clientWidth <= 600 && (!fold.classList.contains("pf-open") || c.classList.contains("on"))) {
            fold.classList.toggle("pf-open");
            return;
          }
          fold.classList.remove("pf-open");
          a.click();
        });
      }
      acts.appendChild(c);
    }
    const m = o.menu?.();
    el(".pf-menu").hidden = !m?.show;
    if (m) {
      menuBtn.hass = m.hass;
      menuBtn.narrow = m.narrow;
    }
  };
  const queue = () => {
    if (queued || !folded) return;
    queued = true;
    requestAnimationFrame(sync);
  };

  const setFolded = (v) => {
    if (v === folded) return;
    if (v) {
      const t = top.getBoundingClientRect();
      const b = tabs.getBoundingClientRect();
      if (!t.height || o.skip?.()) return; // top bar hidden (Settings): the tabs alone stay sticky
      const extra = q(o.extra);
      // The room of the top bar and the tabs (and an extra row), by their heights: the tabs may be stuck at the top
      // already (a jump down the page), where their position says nothing of the room they take in the page
      const room = t.height + b.height + (extra ? extra.getBoundingClientRect().height : 0);
      folded = true;
      sync();
      if (extra) {
        extraHome = [extra.parentNode, extra.nextSibling];
        el(".pf-extra").appendChild(extra);
      }
      const side = q(o.side);
      if (side) {
        sideHome = [side.parentNode, side.nextSibling];
        el(".pf-end").prepend(side);
      }
      // Measured out of the flow first, so that the content never moves (nor the browser's scroll anchoring with it)
      fold.style.width = `${t.width}px`;
      fold.classList.add("pf-measure");
      const h = fold.offsetHeight;
      fold.classList.remove("pf-measure");
      fold.style.width = "";
      fold.style.marginBottom = `${Math.round(room - h)}px`;
      host.style.setProperty("--pf-h", `${h}px`);
      host.setAttribute("pf-folded", "");
    } else {
      folded = false;
      const extra = el(".pf-extra").firstElementChild;
      if (extra && extraHome) extraHome[0].insertBefore(extra, extraHome[1] && extraHome[1].parentNode === extraHome[0] ? extraHome[1] : null);
      extraHome = null;
      const side = sideHome && el(".pf-end").firstElementChild;
      if (side && !side.matches(".pf-stat")) sideHome[0].insertBefore(side, sideHome[1] && sideHome[1].parentNode === sideHome[0] ? sideHome[1] : null);
      sideHome = null;
      host.removeAttribute("pf-folded");
      fold.style.marginBottom = "";
    }
  };

  el(".pf-pills").addEventListener("click", (ev) => {
    const p = ev.target.closest?.(".pf-pill");
    if (p) tabButtons()[Number(p.dataset.i)]?.click();
  });
  el(".pf-pills").addEventListener("keydown", (ev) => {
    const step = ev.key === "ArrowRight" ? 1 : ev.key === "ArrowLeft" ? -1 : 0;
    const p = ev.target.closest?.(".pf-pill");
    if (!step || !p) return;
    ev.preventDefault();
    const all = [...el(".pf-pills").children];
    all[(Number(p.dataset.i) + step + all.length) % all.length]?.focus();
  });

  // The list of buttons opened (narrow, `actsMenu`) closes at a click elsewhere
  const closeMenu = (ev) => {
    if (fold.classList.contains("pf-open") && !ev.composedPath().includes(el(".pf-acts"))) fold.classList.remove("pf-open");
  };
  if (o.actsMenu) root.addEventListener("click", closeMenu, true);
  let io = null;
  if (typeof IntersectionObserver === "function") {
    const [s1, s2] = sense.children;
    io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        const above = !e.isIntersecting && e.boundingClientRect.top < (e.rootBounds?.top ?? 0);
        if (e.target === s1 && above) setFolded(true);
        if (e.target === s2 && e.isIntersecting) setFolded(false);
      }
    });
    io.observe(s1);
    io.observe(s2);
  }
  const mo = typeof MutationObserver === "function" ? new MutationObserver(queue) : null;
  mo?.observe(top, { subtree: true, childList: true, characterData: true, attributes: true });
  mo?.observe(tabs, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ["class", "aria-selected", "hidden"] });
  // Drawn again while folded (a panel that rewrites its page): folded straight away, without a frame unfolded
  if (o.folded) setFolded(true);
  return {
    sync: queue,
    detach() {
      root.removeEventListener?.("click", closeMenu, true);
      io?.disconnect();
      mo?.disconnect();
      setFolded(false);
      sense.remove();
      fold.remove();
      host.removeAttribute("pf-folded");
    },
  };
}
