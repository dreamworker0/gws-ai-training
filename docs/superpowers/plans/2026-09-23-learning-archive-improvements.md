# Learning Archive Improvements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 새 발표자료 세 묶음을 연결하고, 모바일 탐색·검색·슬라이드 뷰어·오류 처리를 접근성 있게 개선하며, 현재 정보구조를 검증하는 테스트를 복구한다.

**Architecture:** 빌드 없는 정적 사이트 구조를 유지한다. 콘텐츠는 `data.js`, 화면 구조는 `index.html`, 렌더링은 `app.js`, 반응형 표현은 `style.css`에 둔다. 브라우저와 Node 테스트가 함께 사용하는 작은 상태 계산 함수만 `ui-state.js`로 분리한다.

**Tech Stack:** HTML, CSS, 브라우저 JavaScript, Node.js 내장 `assert`, Python 3, PyMuPDF, Pillow, GitHub Pages

**Spec:** `docs/superpowers/specs/2026-09-23-learning-archive-improvements-design.md`

## Global Constraints

- 새 프레임워크나 런타임 의존성을 추가하지 않는다.
- 기존 해시 주소와 GitHub Pages 정적 배포 방식을 유지한다.
- 발표자료 자체 내용은 수정하지 않는다.
- 공개 사이트에 특정 기관명, 참여자 이름, 내부 기록을 추가하지 않는다.
- 모바일 기준 검증 크기는 390×844이며, 640px 이하에서 모바일 UI를 적용한다.
- 모든 제품 코드 변경은 관련 테스트의 예상 실패를 먼저 확인한다.
- `../../bin/slides-to-site.py`는 사이트 Git 저장소 바깥의 작업공간 파일이므로 수정하되 사이트 커밋에는 포함하지 않는다.
- 공개 배포와 원격 저장소 푸시는 하지 않는다.

## Review Focus

- 발표자료의 페이지 범위를 벗어난 참조가 생기면 데이터 계약과 경로 테스트가 실패해야 한다.
- 모바일 헤더에서 검색과 메뉴가 동시에 열린 상태가 되지 않아야 한다.
- 결과가 0개인 검색에서도 스크린리더 안내와 Escape 동작이 유지되어야 한다.
- 존재하지 않는 해시를 열면 홈으로 조용히 떨어지지 않고 오류 안내가 보여야 한다.
- 전체화면 뷰어를 닫으면 열기 버튼이 DOM에 남아 있을 때만 포커스를 복구해야 한다.

---

### Task 1: 현재 정보구조에 맞는 데이터 계약 복구

**Files:**
- Modify: `scripts/design-contract.test.mjs`
- Modify: `data.js`
- Test: `scripts/design-contract.test.mjs`

**Interfaces:**
- Consumes: `META`, `ABOUT_DREAMWORK`, `GROUPS`, `CURRICULUM`, `ITEM_SLIDES`, `DECKS`, `SLIDE_HIDDEN`, `FAQ`
- Produces: 현재 `GROUPS` 기반 정보구조와 공통 캐시 버전을 검증하는 계약 테스트

- [ ] **Step 1: 오래된 트랙 계약을 현재 분야 계약으로 교체한다**

`scripts/design-contract.test.mjs`가 `GROUPS`를 읽고 다음 검사를 수행하도록 테스트를 먼저 수정한다. 현재 데이터나 승인 범위에 근거하지 않은 `a08`, `a08-vids` assertion은 제거하고, 새 덱을 미리 단정하는 `a06`, `a06-map`, `chat` assertion은 Task 2로 옮긴다.

```js
const data = new Function(
  dataSource + "\nreturn { META, ABOUT_DREAMWORK, GROUPS, CURRICULUM, ITEM_SLIDES, DECKS, SLIDE_HIDDEN, FAQ };"
)();

const itemIds = data.CURRICULUM.map((item) => item.id);
assert.equal(new Set(itemIds).size, itemIds.length, "CURRICULUM id는 유일해야 함");

const groupedIds = data.GROUPS.flatMap((group) => group.items);
assert.equal(new Set(data.GROUPS.map((group) => group.id)).size, data.GROUPS.length);
assert.deepEqual([...groupedIds].sort(), [...itemIds].sort(), "모든 항목은 정확히 한 분야에 있어야 함");
assert.equal(new Set(groupedIds).size, groupedIds.length, "한 항목이 여러 분야에 중복되면 안 됨");
assert.equal(data.META.displayTitle, "드림워크 교육 아카이브");
assert.equal(data.META.displaySubtitle, "Google Workspace와 AI 교육 기록");
```

캐시 버전은 특정 날짜를 고정하지 않고 CSS와 네 JavaScript 자산이 같은 값을 쓰는지 검사한다.

```js
const assetVersions = [...html.matchAll(/(?:style\.css|data\.js|find\.js|ui-state\.js|app\.js)\?v=([^"']+)/g)]
  .map((match) => match[1]);
assert.equal(assetVersions.length, 5, "캐시 버전은 CSS와 네 JavaScript 자산에 있어야 함");
assert.equal(new Set(assetVersions).size, 1, "CSS와 JavaScript 캐시 버전은 같아야 함");
```

- [ ] **Step 2: 테스트를 실행해 현재 실패 원인이 사라지고 새 자산 계약에서 실패하는지 확인한다**

Run:

```powershell
node scripts/design-contract.test.mjs
```

Expected: 더 이상 `trackA.length`에서 실패하지 않고, 아직 없는 `META.displayTitle` assertion에서 FAIL한다.

- [ ] **Step 3: `META`의 화면 브랜드용 필드를 추가한다**

`data.js`의 `META`에 기존 SEO 제목을 보존하면서 화면 표시용 값을 추가한다.

```js
const META = {
  brand: "드림워크",
  title: "GWS & AI 교육 아카이브",
  displayTitle: "드림워크 교육 아카이브",
  displaySubtitle: "Google Workspace와 AI 교육 기록",
  tagline: "도구보다, 일하는 방식의 변화",
  // 기존 lecturer, updated 등 유지
};
```

- [ ] **Step 4: 데이터 계약의 현재 구조 부분만 통과하는지 확인한다**

Run:

```powershell
node scripts/design-contract.test.mjs
```

Expected: 분야·항목·브랜드 검사를 포함해 이 시점의 디자인 계약이 PASS한다.

- [ ] **Step 5: 변경을 커밋한다**

```powershell
git add data.js scripts/design-contract.test.mjs
git commit -m "test: align archive contract with grouped curriculum"
```

### Task 2: A04·A06·A12 발표자료 변환과 연결

**Files:**
- Modify outside repository: `../../bin/slides-to-site.py`
- Modify: `scripts/design-contract.test.mjs`
- Modify: `data.js`
- Create: `img/slides/calendar/**`
- Create: `img/slides/keep/**`
- Create: `img/slides/chat/**`
- Modify: `img/slides/decks.json`
- Test: `scripts/design-contract.test.mjs`
- Test: `scripts/routes.test.mjs`

**Interfaces:**
- Consumes: PDF 상대 경로와 `(deck_id, title, source_path)` 튜플
- Produces: `calendar:1..9`, `keep:1..8`, `chat:1..7` 슬라이드 참조와 웹 이미지

- [ ] **Step 1: 새 덱 연결 계약을 추가한다**

`scripts/design-contract.test.mjs`에 다음 기대값을 추가한다.

```js
const deckPages = Object.fromEntries(data.DECKS.map((deck) => [deck.id, deck.pages]));
assert.equal(deckPages.calendar, 9);
assert.equal(deckPages.keep, 8);
assert.equal(deckPages.chat, 7);
assert.deepEqual(data.ITEM_SLIDES.a04, Array.from({ length: 9 }, (_, i) => `calendar:${i + 1}`));
assert.deepEqual(data.ITEM_SLIDES.a06, ["keep:1", "keep:2", "keep:3", "keep:4"]);
assert.deepEqual(data.ITEM_SLIDES["a06-map"], ["keep:5", "keep:6", "keep:7", "keep:8"]);
assert.deepEqual(data.ITEM_SLIDES.a12, Array.from({ length: 7 }, (_, i) => `chat:${i + 1}`));
```

모든 참조가 실제 덱 범위 안에 있는지도 검사한다.

```js
for (const [itemId, refs] of Object.entries(data.ITEM_SLIDES)) {
  for (const ref of refs) {
    const [deckId, pageText] = ref.split(":");
    assert.ok(deckPages[deckId], `${itemId}: 존재하지 않는 덱 ${deckId}`);
    assert.ok(Number(pageText) >= 1 && Number(pageText) <= deckPages[deckId], `${itemId}: 범위 밖 참조 ${ref}`);
  }
}
```

- [ ] **Step 2: 새 덱 계약이 실패하는지 확인한다**

Run:

```powershell
node scripts/design-contract.test.mjs
```

Expected: `deckPages.calendar`가 `undefined`라서 FAIL한다.

- [ ] **Step 3: 변환 스크립트가 상대 경로를 받도록 수정하고 새 덱을 등록한다**

`../../bin/slides-to-site.py`의 새 입력은 다음과 같다. 이 파일은 사이트 Git 저장소 바깥에 있으므로 작업공간에는 보존하지만 아래 사이트 커밋에는 넣지 않는다.

```python
DECKS = [
    # 기존 항목 유지
    ("calendar", "구글 캘린더", "_재작업/A04_구글캘린더_v2.pdf"),
    ("keep", "구글 킵 · 내 지도", "_재작업/A06_구글킵_구글지도_v2.pdf"),
    ("chat", "Slack", "_재작업/A12_구글챗_슬랙_v2.pdf"),
]

src = os.path.normpath(os.path.join(SRCDIR, fname))
```

- [ ] **Step 4: 변환 스크립트를 실행해 자산을 생성한다**

Run:

```powershell
& 'C:\Users\jwblu\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe' '..\..\bin\slides-to-site.py'
```

Expected: `calendar 9쪽`, `keep 8쪽`, `chat 7쪽`, 전체 덱 9개가 출력되고 각 폴더에 큰 이미지·썸네일·`captions.json`이 생긴다.

- [ ] **Step 5: `data.js`에 덱과 주제 연결, 슬라이드 제목을 추가한다**

```js
DECKS.push(
  { id: "calendar", title: "구글 캘린더", pages: 9 },
  { id: "keep", title: "구글 킵 · 내 지도", pages: 8 },
  { id: "chat", title: "Slack", pages: 7 }
);

ITEM_SLIDES.a04 = ["calendar:1", "calendar:2", "calendar:3", "calendar:4", "calendar:5", "calendar:6", "calendar:7", "calendar:8", "calendar:9"];
ITEM_SLIDES.a06 = ["keep:1", "keep:2", "keep:3", "keep:4"];
ITEM_SLIDES["a06-map"] = ["keep:5", "keep:6", "keep:7", "keep:8"];
ITEM_SLIDES.a12 = ["chat:1", "chat:2", "chat:3", "chat:4", "chat:5", "chat:6", "chat:7"];
```

`SLIDE_TITLES`에는 각 PDF의 실제 쪽 제목을 그대로 옮기되 `화면 캡처 예정`은 제목이 아니라 본문 상태로 남긴다.

- [ ] **Step 6: 데이터·경로 테스트를 통과시킨다**

Run:

```powershell
node scripts/design-contract.test.mjs
node scripts/routes.test.mjs
```

Expected: 두 명령 모두 PASS하고 경로 검사는 `덱 9개 · 항목 30개`를 출력한다.

- [ ] **Step 7: 자산과 데이터를 커밋한다**

```powershell
git add data.js img/slides/calendar img/slides/keep img/slides/chat img/slides/decks.json scripts/design-contract.test.mjs
git commit -m "feat: add calendar keep and slack slide decks"
```

### Task 3: 공용 UI 상태 함수와 모바일 헤더·분야 접기

**Files:**
- Create: `ui-state.js`
- Create: `scripts/ui-behavior.test.mjs`
- Modify: `index.html`
- Modify: `app.js`
- Modify: `style.css`
- Modify: `scripts/design-contract.test.mjs`
- Test: `scripts/ui-behavior.test.mjs`
- Test: `scripts/design-contract.test.mjs`

**Interfaces:**
- Produces: `ArchiveUI.nextIndex(current, length, direction)`, `ArchiveUI.closedSearchState()`, `ArchiveUI.defaultGroupOpen(index, isMobile)`, `ArchiveUI.routeKind(raw, itemIds, deckIds)`, `ArchiveUI.returnFocusTarget(opener)`
- Consumes: `ArchiveUI` 전역 객체, `GROUPS`, 640px 미디어 쿼리

- [ ] **Step 1: 상태 함수의 실패 테스트를 작성한다**

`scripts/ui-behavior.test.mjs`를 만든다.

```js
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
```

- [ ] **Step 2: 테스트가 파일 부재로 실패하는지 확인한다**

Run:

```powershell
node scripts/ui-behavior.test.mjs
```

Expected: `ui-state.js`를 찾을 수 없어 FAIL한다.

- [ ] **Step 3: 최소 상태 함수를 구현한다**

`ui-state.js`는 브라우저 전역과 Node의 `new Function` 양쪽에서 읽을 수 있는 단순 객체로 만든다.

```js
const ArchiveUI = {
  nextIndex(current, length, direction) {
    if (!length) return -1;
    return (current + direction + length) % length;
  },
  closedSearchState() {
    return { hits: [], activeIndex: -1, expanded: false };
  },
  defaultGroupOpen(index, isMobile) {
    return !isMobile || index === 0;
  },
  routeKind(raw, itemIds, deckIds) {
    if (["", "top", "hero", "education", "curriculum", "slides-home", "faq", "contact"].includes(raw)) return "home";
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
```

- [ ] **Step 4: 상태 함수 테스트가 통과하는지 확인한다**

Run:

```powershell
node scripts/ui-behavior.test.mjs
```

Expected: `ui behavior: ok`.

- [ ] **Step 5: 모바일 헤더 계약을 추가하고 실패를 확인한다**

`scripts/design-contract.test.mjs`에 `mobile-search-toggle`, `mobile-menu-toggle`, `mobile-search-panel`, `mobile-menu-panel` ID와 `ui-state.js` 스크립트가 존재하는지 검사한다.

Run:

```powershell
node scripts/design-contract.test.mjs
```

Expected: 모바일 토글 요소가 없어 FAIL한다.

- [ ] **Step 6: 헤더 구조와 분야 버튼 렌더링을 구현한다**

`index.html`에 두 토글 버튼을 추가하고 기존 검색·메뉴를 제어 대상 패널로 감싼다. `app.js`의 그룹 렌더링은 다음 의미 구조를 만든다.

```html
<section class="group g-start is-open">
  <h3 class="group-head">
    <button class="group-toggle" aria-expanded="true" aria-controls="group-items-start">…</button>
  </h3>
  <ol class="items" id="group-items-start">…</ol>
</section>
```

미디어 쿼리의 결과와 `ArchiveUI.defaultGroupOpen`을 사용해 첫 분야만 열고, 버튼 클릭 시 `hidden`과 `aria-expanded`를 함께 갱신한다. 미디어 쿼리 상태가 데스크톱으로 바뀌면 모든 분야를 다시 표시해 회전·창 크기 변경 뒤 숨은 목록이 남지 않게 한다.

- [ ] **Step 7: 모바일 CSS를 구현한다**

640px 이하에서 브랜드·검색·메뉴·테마 버튼을 한 줄에 두고 검색·메뉴 패널을 접는다. 검색과 메뉴는 서로 배타적으로 열리며 Escape 또는 패널 안 링크 이동 시 닫힌다. 641px 이상에서는 토글을 숨기고 기존 검색·내비게이션을 표시한다. 열린 패널 하나만 헤더 아래 전체 너비를 사용한다.

- [ ] **Step 8: 모바일 관련 테스트를 통과시킨다**

Run:

```powershell
node scripts/ui-behavior.test.mjs
node scripts/design-contract.test.mjs
```

Expected: PASS.

- [ ] **Step 9: 변경을 커밋한다**

```powershell
git add ui-state.js scripts/ui-behavior.test.mjs index.html app.js style.css scripts/design-contract.test.mjs
git commit -m "feat: compact mobile navigation and curriculum groups"
```

### Task 4: 접근성 있는 검색 자동완성

**Files:**
- Modify: `scripts/ui-behavior.test.mjs`
- Modify: `scripts/design-contract.test.mjs`
- Modify: `index.html`
- Modify: `app.js`
- Modify: `style.css`
- Test: `scripts/ui-behavior.test.mjs`
- Test: `scripts/design-contract.test.mjs`

**Interfaces:**
- Consumes: `ArchiveUI.nextIndex`, `Find.search`
- Produces: combobox/listbox 의미 구조, 화살표·Enter·Escape 키보드 탐색, 경로 이동 시 검색 초기화

- [ ] **Step 1: 검색 접근성 계약을 추가한다**

`scripts/design-contract.test.mjs`에서 다음 속성을 검사한다.

```js
for (const token of [
  'role="combobox"', 'aria-autocomplete="list"', 'aria-controls="qres"',
  'role="listbox"', 'id="qstatus"', 'aria-live="polite"'
]) assert.ok(html.includes(token), `검색 접근성 속성 누락: ${token}`);
```

`scripts/ui-behavior.test.mjs`에는 결과 순환의 빈 목록과 양방향 경계를 이미 포함하며, `nextIndex(1, 3, 1) === 2`도 추가한다.

- [ ] **Step 2: 검색 계약이 실패하는지 확인한다**

Run:

```powershell
node scripts/design-contract.test.mjs
node scripts/ui-behavior.test.mjs
```

Expected: HTML 접근성 속성 누락으로 첫 명령만 FAIL한다.

- [ ] **Step 3: 검색 HTML 의미 구조를 추가한다**

검색 입력과 결과 컨테이너를 다음 형태로 갱신한다.

```html
<input id="q" type="search" role="combobox" aria-autocomplete="list"
       aria-expanded="false" aria-controls="qres" autocomplete="off">
<div id="qres" class="qres" role="listbox" hidden></div>
<p id="qstatus" class="sr-only" aria-live="polite"></p>
```

- [ ] **Step 4: 검색 상태와 키보드 동작을 구현한다**

`app.js`에 `searchHits`, `activeSearchIndex`, `closeSearch(clearValue)` 상태를 두고, 닫힌 상태는 `ArchiveUI.closedSearchState()`에서 가져와 다음 규칙을 구현한다.

- 결과를 렌더할 때 각 링크에 `id="q-option-N"`, `role="option"`, `aria-selected`를 설정한다.
- ArrowDown/ArrowUp은 `ArchiveUI.nextIndex`로 활성 결과를 바꾼다.
- Enter는 활성 결과의 `href`로 이동한다.
- Escape는 결과만 닫고 입력에 포커스를 유지한다.
- `route()` 시작 시 검색 결과와 검색어를 초기화하고 모바일 패널을 닫는다.
- 검색 영역 밖을 클릭하면 결과를 닫는다.
- 결과 개수를 `qstatus`에 알린다.

- [ ] **Step 5: 검색 테스트를 통과시킨다**

Run:

```powershell
node scripts/ui-behavior.test.mjs
node scripts/design-contract.test.mjs
node scripts/routes.test.mjs
```

Expected: PASS.

- [ ] **Step 6: 변경을 커밋한다**

```powershell
git add index.html app.js style.css scripts/design-contract.test.mjs scripts/ui-behavior.test.mjs
git commit -m "feat: make archive search keyboard accessible"
```

### Task 5: 오류 경로·noscript·브랜드 표시

**Files:**
- Modify: `scripts/ui-behavior.test.mjs`
- Modify: `scripts/design-contract.test.mjs`
- Modify: `index.html`
- Modify: `app.js`
- Modify: `style.css`
- Test: `scripts/ui-behavior.test.mjs`
- Test: `scripts/design-contract.test.mjs`
- Test: `scripts/routes.test.mjs`

**Interfaces:**
- Consumes: `ArchiveUI.routeKind`, `META.displayTitle`, `META.displaySubtitle`
- Produces: `#notfoundpage`, 정확한 `noscript` 안내, 화면상 드림워크 브랜드

- [ ] **Step 1: 오류·브랜드·noscript 계약을 테스트에 추가한다**

```js
for (const id of ["notfoundpage", "mobile-search-toggle", "mobile-menu-toggle"]) {
  assert.match(html, new RegExp(`id=["']${id}["']`));
}
assert.match(html, /요청한 자료를 찾지 못했습니다/);
assert.match(html, /JavaScript를 켜야 30개 주제 목록/);
assert.match(html, /드림워크 교육 아카이브/);
```

`ui-behavior.test.mjs`에는 `routeKind("%3Cscript%3E", itemIds, deckIds) === "notFound"`를 추가해 임의 문자열도 오류 상태로 분류하는지 확인한다.

- [ ] **Step 2: 테스트 실패를 확인한다**

Run:

```powershell
node scripts/design-contract.test.mjs
node scripts/ui-behavior.test.mjs
```

Expected: `notfoundpage`가 없어 FAIL한다.

- [ ] **Step 3: 정적 오류 화면과 정확한 noscript 링크를 추가한다**

`index.html`에 숨겨진 오류 `<article>`을 추가하고 `only()`가 `notfound` 상태도 전환하도록 한다. `noscript`는 30개 동적 목록을 보려면 JavaScript가 필요하다고 밝히고 `#education`, `#slides-home`, `mailto:` 링크를 제공한다.

- [ ] **Step 4: 라우터에서 오류 상태를 표시한다**

`route()`의 마지막 분기는 다음처럼 동작한다.

```js
only("notfound");
document.title = "자료를 찾지 못했습니다 — " + META.title;
window.scrollTo(0, 0);
```

사용자가 입력한 해시 문자열은 `innerHTML`이나 화면 문구에 넣지 않는다.

- [ ] **Step 5: 화면 브랜드를 데이터에서 표시한다**

헤더와 푸터에 `META.displayTitle`, 보조 문구에 `META.displaySubtitle`을 사용하고, 히어로 눈썹 문구도 `드림워크 교육 아카이브`로 바꾼다. `<title>`, canonical, Open Graph 제목은 그대로 유지한다.

- [ ] **Step 6: 오류·경로·개인정보 테스트를 통과시킨다**

Run:

```powershell
node scripts/ui-behavior.test.mjs
node scripts/design-contract.test.mjs
node scripts/routes.test.mjs
node scripts/privacy.test.mjs
```

Expected: 모두 PASS.

- [ ] **Step 7: 변경을 커밋한다**

```powershell
git add index.html app.js style.css data.js scripts/design-contract.test.mjs scripts/ui-behavior.test.mjs scripts/routes.test.mjs
git commit -m "feat: add clear route errors and dreamwork branding"
```

### Task 6: 슬라이드 뷰어 포커스 관리

**Files:**
- Modify: `scripts/design-contract.test.mjs`
- Modify: `index.html`
- Modify: `app.js`
- Modify: `style.css`
- Test: `scripts/design-contract.test.mjs`

**Interfaces:**
- Consumes: 현재 `.fsbtn` 클릭 흐름
- Produces: 접근성 있는 모달, 포커스 트랩, 닫기 후 포커스 복구, 페이지 수 live announcement

- [ ] **Step 1: 뷰어 접근성 계약을 추가한다**

```js
for (const token of [
  'id="viewer"', 'role="dialog"', 'aria-modal="true"',
  'aria-labelledby="viewer-title"', 'id="viewer-title"',
  'id="v-count"', 'aria-live="polite"'
]) assert.ok(html.includes(token), `뷰어 접근성 속성 누락: ${token}`);
```

- [ ] **Step 2: 계약 실패를 확인한다**

Run:

```powershell
node scripts/design-contract.test.mjs
```

Expected: `role="dialog"` 누락으로 FAIL한다.

- [ ] **Step 3: 뷰어 HTML 의미 구조를 구현한다**

```html
<div id="viewer" class="viewer" role="dialog" aria-modal="true"
     aria-labelledby="viewer-title" hidden>
  <h2 id="viewer-title" class="sr-only">발표자료 전체 화면</h2>
  <img id="viewer-img" alt="" data-keep>
  <div class="viewer-bar">
    …
    <span id="v-count" aria-live="polite"></span>
    …
  </div>
</div>
```

- [ ] **Step 4: 포커스 저장·트랩·복구를 구현한다**

`app.js` 뷰어 IIFE에 `opener`를 추가한다.

```js
var opener = null;

function open(ref, from, trigger) {
  opener = trigger || document.activeElement;
  // 기존 목록 계산
  box.hidden = false;
  draw();
  $("v-close").focus();
}

function close() {
  // 기존 닫기 처리
  var target = ArchiveUI.returnFocusTarget(opener);
  if (target) target.focus();
  opener = null;
}
```

keydown에서 Tab과 Shift+Tab을 처리해 활성화된 이전·다음·닫기 버튼 안에서 순환한다. 클릭 처리에서는 `.fsbtn` 요소를 `open`의 세 번째 인자로 넘긴다.

- [ ] **Step 5: 뷰어 계약과 전체 로컬 테스트를 통과시킨다**

Run:

```powershell
node scripts/design-contract.test.mjs
node scripts/ui-behavior.test.mjs
node scripts/routes.test.mjs
node scripts/privacy.test.mjs
```

Expected: 모두 PASS.

- [ ] **Step 6: 변경을 커밋한다**

```powershell
git add index.html app.js style.css scripts/design-contract.test.mjs
git commit -m "feat: manage focus in slide viewer"
```

### Task 7: 문서화와 전체 검증

**Files:**
- Modify: `README.md`
- Modify: `index.html` via `scripts/stamp.mjs`
- Test: all local tests and public-link checker

**Interfaces:**
- Consumes: 완성된 사이트와 변환 스크립트
- Produces: 재현 가능한 새 덱 추가 절차와 검증 기록

- [ ] **Step 1: README 계약을 먼저 추가해 실패를 확인한다**

`scripts/design-contract.test.mjs`에서 README가 `_재작업/<파일>.pdf` 상대 경로 예시와 `node scripts/ui-behavior.test.mjs` 명령을 포함하는지 검사한다.

Run:

```powershell
node scripts/design-contract.test.mjs
```

Expected: README 문구가 없어 FAIL한다.

- [ ] **Step 2: README의 발표자료 추가·검증 절차를 갱신한다**

현재의 분야 7개·주제 30개 구조를 설명하도록 오래된 A/B 트랙 및 23항목 문구도 함께 고치고, 다음 명령을 문서화한다.

```powershell
python ../../bin/slides-to-site.py
node scripts/design-contract.test.mjs
node scripts/ui-behavior.test.mjs
node scripts/routes.test.mjs
node scripts/privacy.test.mjs
node scripts/check.mjs
```

새 덱 튜플은 `_재작업/A04_구글캘린더_v2.pdf`처럼 `발표자료폴더` 기준 상대 경로를 허용한다고 설명한다.

- [ ] **Step 3: 전체 자동 테스트를 실행한다**

Run:

```powershell
node scripts/design-contract.test.mjs
node scripts/ui-behavior.test.mjs
node scripts/routes.test.mjs
node scripts/privacy.test.mjs
node scripts/check.mjs
```

Expected: 모두 PASS, 외부 링크 61건 이상 정상.

- [ ] **Step 4: 브라우저에서 데스크톱 동선을 검증한다**

정적 서버를 실행하고 공개 배포 전 로컬 페이지를 확인한다.

```powershell
python -m http.server 4173
```

브라우저에서 다음을 확인한다.

- 홈, A04, A06, A12, 전체 발표자료, 관계도
- 검색 결과 ArrowDown/ArrowUp/Enter/Escape
- 잘못된 `#missing-topic` 오류 안내
- 밝은 화면과 어두운 화면
- 슬라이드 뷰어 열기·앞뒤 이동·닫기·포커스 복귀
- 콘솔 오류와 경고 없음

- [ ] **Step 5: 390×844 모바일 동선을 검증한다**

다음을 확인한다.

- 닫힌 헤더가 한 줄이며 검색·메뉴 중 하나만 열림
- 첫 분야만 기본으로 열림
- 다른 분야를 열고 주제 상세로 이동 가능
- 검색 결과가 화면 너비 안에 들어오고 이동 후 닫힘
- A04·A06·A12 썸네일과 큰 슬라이드에 잘림 없음

- [ ] **Step 6: 캐시 스탬프를 갱신하고 테스트를 한 번 더 실행한다**

```powershell
node scripts/stamp.mjs
node scripts/design-contract.test.mjs
node scripts/ui-behavior.test.mjs
node scripts/routes.test.mjs
node scripts/privacy.test.mjs
```

Expected: 모두 PASS하고 `index.html`의 CSS·JS 버전이 동일하다.

- [ ] **Step 7: 최종 변경을 커밋한다**

```powershell
git add README.md index.html
git commit -m "docs: document archive asset and verification workflow"
```

- [ ] **Step 8: 작업 트리와 최근 커밋을 확인한다**

```powershell
git status --short
git log --oneline -8
```

Expected: 작업 트리가 깨끗하고 이번 계획의 커밋들이 순서대로 보인다.
