// ── Helpers ──
/** The language helpers over a table of texts by language (this card's, the mini card's). */
import { STRINGS } from "./i18n/strings.js";

export function languageOf(strings) {
  // Language of the texts: the full tag when translated (sr-Latn), else its base (fr-FR: fr), else English.
  const resolve = (language) => [language, String(language || "").split("-")[0]].find((l) => strings[l]) || "en";
  // Locale of numbers and dates: Home Assistant's own (pt-BR keeps its formats) when it speaks the language of the
  // texts, else that language; pt alone is European Portuguese for Home Assistant, pt-PT for Intl.
  const intlLocale = (hass) => {
    const resolved = resolve(hass?.language);
    const full = hass?.locale?.language || hass?.language || "";
    if (full.split("-")[0] !== resolved.split("-")[0]) return resolved === "pt" ? "pt-PT" : resolved;
    return full === "pt" ? "pt-PT" : full;
  };
  // A text in that language, else in English, else its key; {name} placeholders filled from `values`.
  const translate = (language, key, values = {}) => {
    const text = strings[resolve(language)][key] ?? strings.en[key] ?? key;
    return text.replace(/\{(\w+)\}/g, (_, k) => values[k] ?? "");
  };
  return { resolve, stringsFor: (language) => strings[resolve(language)], intlLocale, translate };
}

export const { stringsFor, intlLocale, translate } = languageOf(STRINGS);

/** An element with a class and a text. */
export function el(tag, cls, text) {
  const node = document.createElement(tag);
  if (cls) node.className = cls;
  if (text !== undefined) node.textContent = text;
  return node;
}
