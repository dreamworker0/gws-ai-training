// 슬라이드 주소가 실제로 열리는지, 그림 파일이 있는지 본다.
//
//   node scripts/routes.test.mjs
//
// 왜 필요한가 (2026-09-22):
//   녹음 기반 자료에 rec0921 이라는 이름을 지었더니 #slide-rec0921-7 이
//   첫 화면으로 떨어졌다. 주소를 푸는 규칙이 /^slide-([a-z]+)-(\d+)$/ 라
//   덱 이름에 글자만 받았기 때문이다. 같은 이유로 #slides-s01,
//   #slides-a06-map, #slides-a08-vids 도 막혀 있었다.
//
//   못 알아본 주소는 홈으로 보내는 구조라 오류가 안 난다. 조용히 첫 화면이
//   뜰 뿐이라, 눌러 보지 않으면 몇 주도 모른다. 그래서 기계가 눌러 본다.
//
// 이 검사는 app.js 에서 정규식을 **그대로 꺼내** 쓴다. 베껴 두면 app.js 를
// 고칠 때 또 어긋난다.

import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const app = readFileSync(join(ROOT, "app.js"), "utf8");
const data = readFileSync(join(ROOT, "data.js"), "utf8");

const { DECKS, ITEM_SLIDES, SLIDE_TITLES, SLIDE_HIDDEN, CURRICULUM } =
  new Function(data + "return {DECKS,ITEM_SLIDES,SLIDE_TITLES,SLIDE_HIDDEN,CURRICULUM};")();

/* ── app.js 에서 규칙을 꺼낸다 ──────────────────────────── */

function pull(label, marker) {
  const i = app.indexOf(marker);
  if (i < 0) throw new Error(`app.js 에서 ${label} 규칙을 못 찾았습니다 (${marker})`);
  const line = app.slice(i, app.indexOf("\n", i));
  const m = line.match(/\/(\^[^/]+\$)\//);
  if (!m) throw new Error(`${label} 규칙의 모양이 바뀌었습니다: ${line.trim()}`);
  return new RegExp(m[1]);
}

const reOne = pull("한 장 보기", '/^slide-');
const reItem = pull("주제별 보기", '/^slides-');

const fails = [];
const add = (m) => fails.push(m);

/* ── 1. 덱마다 첫 쪽·끝 쪽 주소가 열리는가 ─────────────── */

for (const d of DECKS) {
  for (const n of [1, d.pages]) {
    const hash = `slide-${d.id}-${n}`;          // app.js 의 slideHash 와 같은 모양
    const m = reOne.exec(hash);
    if (!m) { add(`덱 「${d.id}」 ${n}쪽 — 주소 #${hash} 를 못 알아봅니다`); continue; }
    if (m[1] !== d.id || Number(m[2]) !== n) {
      add(`덱 「${d.id}」 ${n}쪽 — 주소가 엉뚱하게 풀립니다: ${m[1]} / ${m[2]}`);
    }
  }
}

/* ── 2. 항목마다 「모두 보기」 주소가 열리는가 ──────────── */

for (const it of CURRICULUM) {
  const hash = `slides-${it.id}`;
  const m = reItem.exec(hash);
  if (!m || m[1] !== it.id) {
    add(`항목 「${it.id}」 ${it.title} — 「모두 보기」 주소 #${hash} 를 못 알아봅니다`);
  }
}

/* ── 3. 가리키는 슬라이드가 실제로 있는가 ──────────────── */

const deckOf = Object.fromEntries(DECKS.map((d) => [d.id, d]));
const refs = new Map();                          // ref → 어디서 가리켰나
const note = (ref, where) => refs.set(ref, (refs.get(ref) || []).concat(where));

for (const [id, list] of Object.entries(ITEM_SLIDES)) list.forEach((r) => note(r, id));
for (const r of Object.keys(SLIDE_TITLES || {})) note(r, "SLIDE_TITLES");
for (const r of SLIDE_HIDDEN || []) note(r, "SLIDE_HIDDEN");

const pad = (n) => (n < 10 ? "0" : "") + n;

for (const [ref, where] of refs) {
  const [id, ns] = String(ref).split(":");
  const n = Number(ns);
  const d = deckOf[id];
  const w = [...new Set(where)].join(", ");
  if (!d) { add(`「${ref}」 (${w}) — 그런 덱이 없습니다`); continue; }
  if (!Number.isInteger(n) || n < 1 || n > d.pages) {
    add(`「${ref}」 (${w}) — ${d.title} 는 ${d.pages}쪽뿐입니다`);
    continue;
  }
  for (const p of [`img/slides/${id}/p${pad(n)}.jpg`,
                   `img/slides/${id}/thumb/p${pad(n)}.jpg`]) {
    if (!existsSync(join(ROOT, p))) add(`「${ref}」 (${w}) — 그림이 없습니다: ${p}`);
  }
}

/* ── 4. 항목이 가리키는 id 가 실제 항목인가 ────────────── */

const ids = new Set(CURRICULUM.map((x) => x.id));
for (const id of Object.keys(ITEM_SLIDES)) {
  if (!ids.has(id)) add(`ITEM_SLIDES 의 「${id}」 — 목차에 그런 항목이 없습니다`);
}

/* ── 알림 ──────────────────────────────────────────────── */

console.log(
  `덱 ${DECKS.length}개 · 항목 ${CURRICULUM.length}개 · 슬라이드 ${refs.size}장을 확인했습니다`);

if (!fails.length) {
  console.log("\n✅ 모든 주소가 열리고 그림도 다 있습니다.");
  process.exit(0);
}

console.error(`\n🔴 ${fails.length}건이 잘못됐습니다.\n`);
for (const f of fails) console.error("  " + f);
console.error("\n주소를 못 알아보면 오류 없이 첫 화면이 뜹니다 — 조용해서 더 위험합니다.");
process.exit(1);
