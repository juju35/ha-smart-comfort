// ── Language ──
// Strings of a Home Assistant language: the full tag when translated (sr-Latn), else its base (fr-FR: fr), else English.
import { STRINGS } from "./i18n/strings.js";

export const stringsFor = (language) => STRINGS[language] || STRINGS[String(language || "").split("-")[0]] || STRINGS.en;

// Language whose STRINGS are shown: the full tag when translated (sr-Latn), else its base, else English.
export const resolvedLanguage = (language) => {
  const base = String(language || "").split("-")[0];
  return STRINGS[language] ? language : STRINGS[base] ? base : "en";
};

// Locale of numbers and dates: Home Assistant's full one when it is the language of the texts (pt-BR keeps its
// formats), else the language of the texts; pt alone is European Portuguese for Home Assistant, pt-PT for Intl.
export const intlLocale = (hass) => {
  const full = hass?.locale?.language || hass?.language || "";
  const resolved = resolvedLanguage(hass?.language);
  const locale = full.split("-")[0] === resolved.split("-")[0] ? full : resolved;
  return locale === "pt" ? "pt-PT" : locale;
};
