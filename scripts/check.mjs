/* 링크 생존 점검
   -------------------------------------------------------------------
   data.js 에 적힌 유튜브 영상과 공식 문서가 아직 살아 있는지 확인합니다.
   영상은 삭제되거나 비공개로 바뀌고, 구글 도움말 주소는 조용히 바뀝니다.
   죽은 링크가 쌓이면 사이트 전체가 방치된 것처럼 보입니다.

   실행:  node scripts/check.mjs
   =================================================================== */

import { readFile } from "node:fs/promises";

const TIMEOUT_MS = 20000;
const UA = "Mozilla/5.0 (compatible; yeolmae-link-check)";

/* data.js 를 브라우저와 같은 방식으로 읽어 들입니다. */
const src = await readFile(new URL("../data.js", import.meta.url), "utf8");
const D = new Function(
  src + "\nreturn { META, INTRO_VIDEO, QUOTES, CURRICULUM, FAQ };"
)();

const fails = [];
const warns = [];

function note(list, kind, label, detail) {
  list.push({ kind, label, detail });
}

async function head(url) {
  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), TIMEOUT_MS);
  try {
    const r = await fetch(url, {
      redirect: "follow",
      headers: { "user-agent": UA },
      signal: ac.signal,
    });
    return r.status;
  } catch (e) {
    return e.name === "AbortError" ? 0 : -1;
  } finally {
    clearTimeout(timer);
  }
}

/* 유튜브는 oEmbed 로 확인합니다.
   삭제·비공개·임베드 금지 영상은 여기서 404/401 이 납니다. */
async function checkVideo(id, label) {
  const probe =
    "https://www.youtube.com/oembed?format=json&url=" +
    encodeURIComponent("https://www.youtube.com/watch?v=" + id);
  const s = await head(probe);
  if (s === 200) return;
  if (s === 0 || s === -1) {
    note(warns, "영상", label, `확인 실패 (네트워크) · ${id}`);
  } else {
    note(fails, "영상", label, `응답 ${s} — 삭제·비공개·임베드 금지일 수 있습니다 · https://www.youtube.com/watch?v=${id}`);
  }
}

async function checkDoc(url, label) {
  const s = await head(url);
  if (s >= 200 && s < 400) return;
  if (s === 0 || s === -1) {
    note(warns, "문서", label, `확인 실패 (네트워크) · ${url}`);
  } else {
    note(fails, "문서", label, `응답 ${s} · ${url}`);
  }
}

/* ── 데이터 자체의 앞뒤가 맞는지 ──────────────────────────────── */
const ids = new Set(D.CURRICULUM.map((i) => i.id));

if (ids.size !== D.CURRICULUM.length) {
  note(fails, "데이터", "CURRICULUM", "항목 id 가 중복되었습니다.");
}
if (!D.INTRO_VIDEO?.id) {
  note(fails, "데이터", "INTRO_VIDEO", "설치 영상이 비어 있습니다. 이 영상은 절대 빠지면 안 됩니다.");
}

/* ── 실제 확인 ──────────────────────────────────────────────── */
const jobs = [];

jobs.push(checkVideo(D.INTRO_VIDEO.id, "시작하기 · 설치 영상"));

for (const it of D.CURRICULUM) {
  const where = `${it.track}${it.no} ${it.title}`;
  for (const v of it.videos || []) jobs.push(checkVideo(v.id, `${where} — ${v.t}`));
  for (const d of it.docs || []) jobs.push(checkDoc(d.u, `${where} — ${d.t}`));
}

/* 한 번에 6개씩만 — 상대 서버에 부담을 주지 않습니다. */
const LIMIT = 6;
for (let i = 0; i < jobs.length; i += LIMIT) {
  await Promise.all(jobs.slice(i, i + LIMIT));
}

/* ── 결과 ───────────────────────────────────────────────────── */
const total = jobs.length;
console.log(`\n확인한 링크 ${total}건\n`);

if (warns.length) {
  console.log(`⚠️  확인하지 못한 것 ${warns.length}건 (네트워크 문제일 수 있습니다)`);
  for (const w of warns) console.log(`   · [${w.kind}] ${w.label}\n     ${w.detail}`);
  console.log("");
}

if (fails.length) {
  console.log(`🔴 고쳐야 할 것 ${fails.length}건\n`);
  for (const f of fails) console.log(`   · [${f.kind}] ${f.label}\n     ${f.detail}\n`);
  console.log("data.js 에서 해당 줄을 고친 뒤 다시 커밋해 주세요.\n");
  process.exit(1);
}

console.log("✅ 모든 링크가 살아 있습니다.\n");
