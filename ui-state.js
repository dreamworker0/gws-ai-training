/* 계산만 담당하는 UI 상태 함수. 화면 변경은 app.js에서 수행합니다. */
const ArchiveUI = {
  nextIndex(current, length, direction) {
    if (!length) return -1;
    if (current < 0) return direction < 0 ? length - 1 : 0;
    return (current + direction + length) % length;
  },
  closedSearchState() {
    return { hits: [], activeIndex: -1, expanded: false };
  },
  defaultGroupOpen(index, isMobile) {
    return !isMobile || index === 0;
  },
  routeKind(raw, itemIds, deckIds) {
    if (["", "top", "main", "hero", "education", "curriculum", "slides-home", "faq", "contact"].includes(raw)) return "home";
    if (raw === "graph") return "graph";
    if (raw === "slides") return "slides";
    const itemMatch = /^slides-([a-z][a-z0-9-]*)$/.exec(raw);
    if (itemMatch) return itemIds.has(itemMatch[1]) ? "slides" : "notFound";
    const deckMatch = /^slide-([a-z][a-z0-9]*)-(\d+)$/.exec(raw);
    if (deckMatch) return deckIds.has(deckMatch[1]) ? "slides" : "notFound";
    return itemIds.has(raw) ? "item" : "notFound";
  },
  returnFocusTarget(opener) {
    return opener && opener.isConnected ? opener : null;
  },
};
