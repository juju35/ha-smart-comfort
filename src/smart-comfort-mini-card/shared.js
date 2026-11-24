// ── Shared ──
// The activity card's module, the very one of the dashboard resource (same version): its helpers, and the
// activity card shown in the full card.
import { STRINGS } from "./i18n/strings.js";

export const { languageOf, el, HEADER_STYLE, BANNER_STYLE, TITLE_STYLE, fitPill, statusPill, DOMAIN, SWITCHES, findEntities, comfortMood, comfortScene } = await import(
  new URL(`smart-comfort-activity-card.js${new URL(import.meta.url).search}`, import.meta.url).href
);
export const { resolve: resolvedLanguage, stringsFor, intlLocale, translate } = languageOf(STRINGS);
