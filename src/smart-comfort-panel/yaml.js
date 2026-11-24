// ── YAML ──
// The YAML of the options: the view to copy it, the YAML file in use and its conflicts with the UI, its reload.
// Methods of SmartComfortPanel, copied onto its prototype at registration.
import { DOMAIN } from "./constants.js";
import { changedPaths, pathValue, toYaml } from "./configuration.js";

export class SmartComfortPanelYaml {

  // YAML: the configuration of the integration, as it goes under `smart_comfort:` in configuration.yaml.

  _renderYaml(content) {
    const card = this._card(this._t("yaml_tab"), "mdi:code-braces");
    // Kept in smart_comfort.yaml: the file as it is (or will be once saved), without the `smart_comfort:` key.
    const file = this._config.file;
    const text = file ? `${toYaml(this._draft || {}, "")}\n` : `smart_comfort:\n${toYaml(this._draft || {}, "  ")}\n`;
    let help = file ? this._t("yaml_help_file", { file: file.name }) : this._t(this._dirty ? "yaml_help_unsaved" : "yaml_help");
    if (file && this._dirty) help += ` · ${this._t("unsaved")}`;
    card.append(this._el("div", "help", help));
    const pre = this._el("pre", "yaml", text);
    const copy = this._button(this._t("yaml_copy"), async () => {
      try {
        await navigator.clipboard.writeText(text);
        copy.textContent = this._t("yaml_copied");
      } catch (_err) {
        const range = document.createRange();
        range.selectNodeContents(pre);
        const selection = this.shadowRoot.getSelection?.() || window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
      }
    });
    card.append(copy, pre);
    content.append(card);
  }

  /** Settings: smart_comfort.yaml, kept in sync both ways (or how to start it). */
  _sourceCard() {
    const card = this._card(this._t("src_title"), "mdi:file-sync-outline");
    card.classList.add("source");
    const file = this._config.file;
    const name = file?.name || "smart_comfort.yaml";
    if (!file) {
      const row = this._el("div", "srow");
      const text = this._el("div", "stext");
      text.append(this._el("div", "sname", this._t("src_none", { file: name })), this._el("div", "shelp", this._t("src_create_help", { file: name })));
      const create = this._button(this._t("src_create", { file: name }), () => this._createFile(), "primary");
      row.append(text, create);
      card.append(row);
      return card;
    }
    const head = this._el("div", "sfile");
    head.append(this._el("span", "pill info", "YAML"), this._el("code", "", `/config/${name}`));
    const time = file.mtime ? new Date(file.mtime * 1000).toLocaleTimeString(this._hass.language, { hour: "2-digit", minute: "2-digit" }) : "—";
    const rooms = (this._config.options.rooms || []).length;
    const status = file.invalid ? this._t("src_status_invalid", { time, error: file.invalid }) : this._t("src_status", { time, rooms });
    head.append(this._el("span", `sstatus${file.invalid ? " bad" : ""}`, status));
    const reload = this._button(this._t("src_reload"), () => this._reloadYaml());
    reload.disabled = !!this._reloadingYaml;
    head.append(reload);
    card.append(head);
    if (this._yamlNote) card.append(this._el("div", "shelp note", this._yamlNote));
    const toggle = (key, label, help) => {
      const row = this._el("div", "srow");
      const text = this._el("div", "stext");
      text.append(this._el("div", "sname", label), this._el("div", "shelp", help));
      const sw = this._el("label", "sw");
      const input = document.createElement("input");
      input.type = "checkbox";
      input.checked = this._draft[key] !== false;
      input.setAttribute("aria-label", label);
      input.addEventListener("change", () => {
        if (input.checked) delete this._draft[key];
        else this._draft[key] = false;
        this._changed();
      });
      sw.append(input, this._el("span"));
      row.append(text, sw);
      card.append(row);
    };
    toggle("file_write", this._t("src_write"), this._t("src_write_help"));
    toggle("file_watch", this._t("src_watch"), this._t("src_watch_help"));
    if (file.included?.length) {
      const row = this._el("div", "srow");
      const text = this._el("div", "stext");
      text.append(this._el("div", "sname", this._t("src_included")), this._el("div", "shelp", this._t("src_included_help", { files: file.included.join(", ") })));
      row.append(text, this._el("span", "pill", String(file.included.length)));
      card.append(row);
    }
    return card;
  }

  async _createFile() {
    try {
      await this._hass.callWS({ type: `${DOMAIN}/file/create` });
      this._yamlNote = null;
    } catch (err) {
      this._message = { type: "error", text: err.message };
    }
    this._reload();
  }

  /** Saving found options changed elsewhere: what changed there, the file's value against the panel's. */
  _conflictCard() {
    const c = this._conflict;
    const card = this._card(this._t("conflict_title"), "mdi:file-alert-outline");
    card.classList.add("conflict");
    const paths = changedPaths(c.base, c.options);
    const time = c.file?.mtime ? new Date(c.file.mtime * 1000).toLocaleTimeString(this._hass.language, { hour: "2-digit", minute: "2-digit" }) : "";
    card.append(
      this._el("div", "shelp", c.file ? this._t("conflict_sub", { n: paths.length, file: c.file.name, time }) : this._t("conflict_sub_other", { n: paths.length }))
    );
    const show = (source) =>
      paths
        .slice(0, 8)
        .map((path) => `${path.join(".")}: ${JSON.stringify(pathValue(source, path)) ?? "—"}`)
        .join("\n");
    const grid = this._el("div", "cgrid");
    const side = (cls, title, text) => {
      const box = this._el("div", `cbox ${cls}`);
      box.append(this._el("div", "ctitle", title), this._el("pre", "", text));
      return box;
    };
    grid.append(side("file", this._t("conflict_file"), show(c.options)), side("panel", this._t("conflict_panel"), show(this._draft)));
    const actions = this._el("div", "cactions");
    actions.append(
      this._button(this._t("conflict_keep_file"), () => {
        this._conflict = null;
        this._reload();
      }),
      this._button(this._t("conflict_keep_panel"), () => this._save(true), "primary")
    );
    card.append(grid, actions);
    return card;
  }

  /** The configuration comes from YAML: what that means, and Reload the YAML (the result stays shown until the next one). */
  _yamlBanner() {
    const file = this._config.file;
    const text = file ? this._t("yaml_file", { file: file.name }) : this._t("yaml");
    const banner = this._el("div", "banner info", text);
    const reload = this._el("button", "retry", this._t("yaml_reload"));
    reload.type = "button";
    reload.disabled = !!this._reloadingYaml;
    reload.addEventListener("click", () => this._reloadYaml());
    banner.append(reload);
    if (this._yamlNote) banner.append(this._el("div", "note", this._yamlNote));
    return banner;
  }

  async _reloadYaml() {
    this._reloadingYaml = true;
    this._render();
    let applied = false;
    try {
      const { response } = await this._hass.callService(DOMAIN, "reload", {}, undefined, true, true);
      applied = response.applied;
      if (!applied) this._yamlNote = this._t("yaml_unchanged");
      else if (response.conflicts.length) this._yamlNote = this._t("yaml_conflicts", { paths: response.conflicts.join(", ") });
      else this._yamlNote = this._t("yaml_reloaded");
    } catch (err) {
      this._yamlNote = err.message;
    }
    this._reloadingYaml = false;
    // Applied: the options changed, load them again; otherwise the unsaved edits stay.
    if (applied) this._reload();
    else this._render();
  }
}
