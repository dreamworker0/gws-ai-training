import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const source = await readFile(new URL("../ui-state.js", import.meta.url), "utf8");
const UI = new Function(`${source}\nreturn ArchiveUI;`)();

assert.equal(UI.nextIndex(-1, 3, 1), 0);
assert.equal(UI.nextIndex(2, 3, 1), 0);
assert.equal(UI.nextIndex(0, 3, -1), 2);
assert.equal(UI.nextIndex(-1, 0, 1), -1);
assert.deepEqual(UI.closedSearchState(), { hits: [], activeIndex: -1, expanded: false });
assert.equal(UI.defaultGroupOpen(0, true), true);
assert.equal(UI.defaultGroupOpen(1, true), false);
assert.equal(UI.defaultGroupOpen(3, false), true);
const itemIds = new Set(["a04"]);
const deckIds = new Set(["calendar"]);
assert.equal(UI.routeKind("unknown", itemIds, deckIds), "notFound");
assert.equal(UI.routeKind("a04", itemIds, deckIds), "item");
assert.equal(UI.routeKind("slides-a04", itemIds, deckIds), "slides");
assert.equal(UI.routeKind("slides-missing", itemIds, deckIds), "notFound");
assert.equal(UI.routeKind("slide-calendar-1", itemIds, deckIds), "slides");
assert.equal(UI.routeKind("slide-ghost-1", itemIds, deckIds), "notFound");
const connected = { isConnected: true };
assert.equal(UI.returnFocusTarget(connected), connected);
assert.equal(UI.returnFocusTarget({ isConnected: false }), null);
console.log("ui behavior: ok");
