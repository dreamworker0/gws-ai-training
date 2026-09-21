// 고친 파일이 곧바로 보이게 index.html 에 갱신 표시를 찍는다.
//
//   node scripts/stamp.mjs          찍는다
//   node scripts/stamp.mjs --check  안 맞으면 1로 끝난다
//
// 표시는 네 파일의 내용을 합쳐 만든 짧은 지문이다. 내용이 그대로면 표시도 그대로라
// 쓸데없이 다시 받게 하지 않고, 한 글자라도 바뀌면 반드시 달라진다.
// .git/hooks/pre-commit 이 커밋 때마다 부르므로 사람이 기억할 일이 없다.
//
// 왜 필요한가: GitHub Pages 가 Cache-Control: max-age=600 을 준다. 표시를 안 바꾸면
// 고친 내용이 최대 10분간 안 보인다. 2026-09-20 에 실제로 "이미지가 없는데?" 를 불렀다.

import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const ASSETS = ["style.css", "data.js", "find.js", "app.js"];
const PAGE = join(ROOT, "index.html");

const h = createHash("sha1");
for (const a of ASSETS) h.update(readFileSync(join(ROOT, a)));
const stamp =
  new Date().toISOString().slice(0, 10).replace(/-/g, "") +
  "-" + h.digest("hex").slice(0, 7);

// 정규식을 쓰지 않는다 — 따옴표 안의 "파일이름" 또는 "파일이름?v=..." 를 통째로 갈아 끼운다.
const before = readFileSync(PAGE, "utf8");
let html = before;
let hits = 0;

for (const a of ASSETS) {
  for (const q of ['"', "'"]) {
    let at = 0;
    for (;;) {
      const i = html.indexOf(q + a, at);
      if (i < 0) break;
      const open = i + 1;                      // 파일이름이 시작하는 자리
      const end = html.indexOf(q, open);       // 닫는 따옴표
      if (end < 0) break;
      const inside = html.slice(open, end);    // 예: data.js  또는  data.js?v=지난것
      if (inside !== a && !inside.startsWith(a + "?v=")) { at = i + 1; continue; }
      const now = a + "?v=" + stamp;
      html = html.slice(0, open) + now + html.slice(end);
      hits++;
      at = open + now.length;
    }
  }
}

if (hits !== ASSETS.length) {
  console.error(
    "index.html 에서 " + hits + "곳을 찾았습니다 — " + ASSETS.length + "곳이어야 합니다.");
  process.exit(2);
}

if (before === html) {
  console.log("갱신 표시 그대로 · v=" + stamp);
  process.exit(0);
}

if (process.argv.includes("--check")) {
  console.error("갱신 표시가 낡았습니다 — v=" + stamp + " 로 찍어야 합니다.");
  console.error("  node scripts/stamp.mjs");
  process.exit(1);
}

writeFileSync(PAGE, html);
console.log("갱신 표시를 찍었습니다 · v=" + stamp);
