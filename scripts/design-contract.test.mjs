import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const root = new URL("../", import.meta.url);
const dataSource = await readFile(new URL("data.js", root), "utf8");
const data = new Function(
  dataSource + "\nreturn { META, ABOUT_DREAMWORK, GROUPS, CURRICULUM, ITEM_SLIDES, DECKS, SLIDE_HIDDEN, FAQ };"
)();

assert.equal(data.META.brand, "드림워크");
assert.equal(data.META.title, "GWS & AI 교육 아카이브");
assert.equal(data.META.tagline, "도구보다, 일하는 방식의 변화");
assert.equal(data.META.lecturer, "교육자 김종원 · 소셜프리즘");
assert.equal(data.META.updated, "2026-09-21");
assert.equal(data.ABOUT_DREAMWORK.name, "드림워크");
assert.doesNotMatch(dataSource, /const\s+EDUCATION_FIELDS\s*=/);

const itemIds = data.CURRICULUM.map((item) => item.id);
assert.equal(new Set(itemIds).size, itemIds.length, "CURRICULUM id는 유일해야 함");
const groupedIds = data.GROUPS.flatMap((group) => group.items);
assert.equal(new Set(data.GROUPS.map((group) => group.id)).size, data.GROUPS.length);
assert.deepEqual([...groupedIds].sort(), [...itemIds].sort(), "모든 항목은 정확히 한 분야에 있어야 함");
assert.equal(new Set(groupedIds).size, groupedIds.length, "한 항목이 여러 분야에 중복되면 안 됨");
assert.equal(data.META.displayTitle, "드림워크 교육 아카이브");
assert.equal(data.META.displaySubtitle, "Google Workspace와 AI 교육 기록");
assert.ok(data.CURRICULUM.find((item) => item.id === "a00"), "가입 안내 항목 누락");
assert.ok(data.ITEM_SLIDES.a00.length > 0, "가입 안내 발표자료 누락");
const deckPages = Object.fromEntries(data.DECKS.map((deck) => [deck.id, deck.pages]));
assert.equal(deckPages.calendar, 9);
assert.equal(deckPages.keep, 8);
assert.equal(deckPages.chat, 7);
assert.deepEqual(data.ITEM_SLIDES.a04, Array.from({ length: 9 }, (_, i) => `calendar:${i + 1}`));
assert.deepEqual(data.ITEM_SLIDES.a06, ["keep:1", "keep:2", "keep:3", "keep:4"]);
assert.deepEqual(data.ITEM_SLIDES["a06-map"], ["keep:5", "keep:6", "keep:7", "keep:8"]);
assert.deepEqual(data.ITEM_SLIDES.a12, Array.from({ length: 7 }, (_, i) => `chat:${i + 1}`));
for (const [itemId, refs] of Object.entries(data.ITEM_SLIDES)) {
  for (const ref of refs) {
    const [deckId, pageText] = ref.split(":");
    assert.ok(deckPages[deckId], `${itemId}: 존재하지 않는 덱 ${deckId}`);
    assert.ok(Number(pageText) >= 1 && Number(pageText) <= deckPages[deckId], `${itemId}: 범위 밖 참조 ${ref}`);
  }
}

const videos = data.CURRICULUM.flatMap((item) => item.videos || []);
for (const video of videos) {
  assert.match(video.date || "", /^\d{4}-\d{2}-\d{2}$/, `${video.id} 공개일 누락`);
  assert.ok((video.channel || "").trim().length > 0, `${video.id} 채널 누락`);
}

const publicText = JSON.stringify(data);
for (const forbidden of ["기관별 진행 상황", "중림종합사회복지관", "강감찬관악종합사회복지관"]) {
  assert.equal(publicText.includes(forbidden), false, `공개 데이터 금지 문자열: ${forbidden}`);
}

const html = await readFile(new URL("index.html", root), "utf8");
for (const token of [
  'role="combobox"', 'aria-autocomplete="list"', 'aria-controls="qres"',
  'role="listbox"', 'id="qstatus"', 'aria-live="polite"',
]) assert.ok(html.includes(token), `검색 접근성 속성 누락: ${token}`);
for (const id of ["mobile-search-toggle", "mobile-menu-toggle", "mobile-search-panel", "mobile-menu-panel"]) {
  assert.match(html, new RegExp(`id=["']${id}["']`), `모바일 헤더 요소 누락: ${id}`);
}
assert.match(html, /<script[^>]+src=["']ui-state\.js\?v=/, "UI 상태 스크립트 누락");
for (const id of ["hero", "education", "curriculum", "contact", "hero-image"]) {
  assert.match(html, new RegExp(`id=["']${id}["']`), `필수 홈 영역 누락: ${id}`);
}
for (const removedId of ["audience-paths", "education-fields", "archive-preview", "start", "viewpoint"]) {
  assert.doesNotMatch(html, new RegExp(`id=["']${removedId}["']`), `제거 대상 홈 영역이 남아 있음: ${removedId}`);
}
for (const removedText of ["어떤 마음으로 오셨나요?", "Education fields", "Learning archive", "아직 기관 계정이 없으신가요?", "Dreamwork viewpoint"]) {
  assert.equal(html.includes(removedText), false, `제거 대상 문구가 남아 있음: ${removedText}`);
}
assert.doesNotMatch(html, /href=["']#(?:education-fields|viewpoint)["']/);
const assetVersions = [...html.matchAll(/(?:style\.css|data\.js|find\.js|ui-state\.js|app\.js)\?v=([^"']+)/g)]
  .map((match) => match[1]);
assert.equal(assetVersions.length, 5, "캐시 버전은 CSS와 네 JavaScript 자산에 있어야 함");
assert.equal(new Set(assetVersions).size, 1, "CSS와 JavaScript 캐시 버전은 같아야 함");
assert.match(html, /href=["']#curriculum["'][^>]*>[^<]*수강생 복습/);
assert.match(html, /href=["']#education["'][^>]*>[^<]*교육 살펴보기/);
assert.match(html, /<noscript>[\s\S]*수강생 복습[\s\S]*교육 살펴보기[\s\S]*<\/noscript>/);
assert.doesNotMatch(html, /기관별 진행 상황/);
assert.match(html, /<link\s+rel=["']icon["']\s+href=["']favicon\.svg["']\s+type=["']image\/svg\+xml["']/);
assert.match(html, /<link\s+rel=["']canonical["']\s+href=["']https:\/\/dreamworker0\.github\.io\/gws-ai-training\/["']/);
assert.match(html, /property=["']og:type["']\s+content=["']website["']/);
assert.match(html, /property=["']og:title["']\s+content=["']GWS &amp; AI 교육 아카이브["']/);
assert.match(html, /property=["']og:description["']\s+content=["'][^"']+["']/);
assert.match(html, /property=["']og:url["']\s+content=["']https:\/\/dreamworker0\.github\.io\/gws-ai-training\/["']/);
assert.match(html, /property=["']og:image["']\s+content=["']https:\/\/dreamworker0\.github\.io\/gws-ai-training\/img\/dreamwork-og\.png["']/);
assert.match(html, /property=["']og:image:width["']\s+content=["']1200["']/);
assert.match(html, /property=["']og:image:height["']\s+content=["']630["']/);
assert.match(html, /name=["']twitter:card["']\s+content=["']summary_large_image["']/);
assert.match(html, /name=["']theme-color["']\s+content=["']#17362f["']/);

const appSource = await readFile(new URL("app.js", root), "utf8");
for (const functionName of ["renderAbout"]) {
  assert.match(appSource, new RegExp(`function\\s+${functionName}\\s*\\(`), `렌더러 누락: ${functionName}`);
}
assert.doesNotMatch(appSource, /renderEducationFields|renderArchivePreview|setupBox|\$\(["']quotes["']\)/);
for (const routePattern of ["raw === \"graph\"", "raw === \"slides\"", "/^slides-", "/^slide-"]) {
  assert.equal(appSource.includes(routePattern), true, `기존 해시 처리 누락: ${routePattern}`);
}
assert.match(appSource, /findItem\(raw\)/);
assert.match(appSource, /ask-education/);
assert.match(appSource, /교육을 함께 준비하시나요\?/);
assert.match(appSource, /교육 문의하기/);
assert.match(appSource, /기관명/);
assert.match(appSource, /GWS & AI 교육 아카이브/);
assert.match(appSource, /video-meta/);
assert.match(appSource, /video-play/);

const css = await readFile(new URL("style.css", root), "utf8");
for (const token of ["--forest", "--terracotta", "--paper", "--sage", "--ink"]) {
  assert.equal(css.includes(token), true, `디자인 토큰 누락: ${token}`);
}
assert.match(css, /@media\s*\(max-width:\s*640px\)/);
assert.match(css, /@media\s*\(prefers-reduced-motion:\s*reduce\)/);
assert.match(css, /:focus-visible/);
assert.match(css, /\.hero-grid/);
assert.match(css, /\.vids\s*\{[^}]*display:\s*grid/s);
assert.match(css, /\.vid\s*\{/);
assert.match(css, /\.item\s*\{[^}]*text-decoration:\s*none/s, "학습 목록 링크 밑줄 제거 누락");

const heroImage = await readFile(new URL("img/dreamwork-archive-hero.png", root));
assert.deepEqual([...heroImage.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10]);
const heroWidth = heroImage.readUInt32BE(16);
const heroHeight = heroImage.readUInt32BE(20);
assert.ok(heroWidth >= 1200, `히어로 이미지 폭 부족: ${heroWidth}`);
assert.ok(heroHeight >= 800, `히어로 이미지 높이 부족: ${heroHeight}`);
assert.ok(heroWidth > heroHeight, `히어로 이미지는 가로형이어야 함: ${heroWidth}x${heroHeight}`);

const heroWebp = await readFile(new URL("img/dreamwork-archive-hero.webp", root));
assert.equal(heroWebp.subarray(0, 4).toString("ascii"), "RIFF");
assert.equal(heroWebp.subarray(8, 12).toString("ascii"), "WEBP");
assert.ok(heroWebp.length < 500_000, `히어로 WebP가 너무 큼: ${heroWebp.length}`);
assert.match(html, /<source[^>]+srcset=["']img\/dreamwork-archive-hero\.webp["'][^>]+type=["']image\/webp["']/);

const ogImage = await readFile(new URL("img/dreamwork-og.png", root));
assert.deepEqual([...ogImage.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10]);
assert.equal(ogImage.readUInt32BE(16), 1200, "오픈 그래프 이미지 폭은 1200이어야 함");
assert.equal(ogImage.readUInt32BE(20), 630, "오픈 그래프 이미지 높이는 630이어야 함");

const favicon = await readFile(new URL("favicon.svg", root), "utf8");
assert.match(favicon, /<svg[^>]+viewBox=["']0 0 64 64["']/);
assert.match(favicon, /#17362f/);

assert.match(appSource, /function\s+installImageFallbacks\s*\(/);
assert.match(appSource, /addEventListener\(["']error["']/);
assert.match(appSource, /naturalWidth\s*===\s*0/);
assert.match(appSource, /media-fallback/);
assert.match(css, /\.media-fallback/);

console.log("design data contract: ok");
