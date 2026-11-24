// Entry point: the mini card's modules in their original order. scripts/bundle.mjs concatenates them in this order into
// the single file the card ships as (an ES module: it imports the activity card's helpers at run time).
import "./i18n/strings.js";
import "./card-picker.js";
import "./shared.js";
import "./helpers.js";
import "./card.js";
import "./styles.js";
import "./full-card.js";
import "./register.js";
