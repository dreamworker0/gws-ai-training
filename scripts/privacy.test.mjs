// 공개 사이트에 사람 이름·기관 이름이 새어 들어갔는지 본다.
//
//   node scripts/privacy.test.mjs
//
// 왜 필요한가:
//   이 사이트는 전국 어느 기관에서나 보는 범용 복습 자료다. 강사님 이름(김종원) 말고는
//   사람 이름이 한 자도 나가면 안 되고, 특정 기관 이름도 나가면 안 된다.
//   그런데 녹음 받아적기에는 참여자 실명이 그대로 있고, 디스코드 호야가 그 받아적기를
//   읽어 data.js 를 자동으로 쓴다. 사람이 매번 눈으로 거르는 구조는 언젠가 반드시 뚫린다.
//
// 어떻게 보는가 — 두 겹이다:
//   1) 대조 (정확하다): ../transcripts 와 ../education-log.md 에 적힌 실제 이름·기관명을
//      그대로 찾는다. 이 파일들은 저장소 밖이라 CI 에는 없다. 있을 때만 돈다.
//   2) 모양 (짐작이다): 「홍길동 과장」처럼 직위가 붙은 이름. 대조할 자료가 없는
//      CI 에서도 이만큼은 걸린다.
//
// 거둔 이름이 미덥지 않으면:  node scripts/privacy.test.mjs --names

import { readFileSync, existsSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const WATCH = ["data.js", "index.html", "app.js", "find.js"];

// 나가도 되는 것 — 강사님 본인과 사업·기관 일반명사
const ALLOW = ["김종원", "소셜프리즘", "강감찬"];

const SURNAME =
  "김이박최정강조윤장임한오서신권황안송류전홍고문양손배백허유남심노하곽성차주우구원";
// 직함. 이름을 거둘 때는 직위(JOB)만 쓴다 — 「님·씨」는 낱말 끝에도 흔해 헛걸림이 많다.
const JOB = "(과장|팀장|관장|국장|부장|차장|주임|대리|선생님|사회복지사)";
const TITLE = "(님|씨|과장|팀장|관장|국장|부장|차장|주임|대리|사원|선생님|사회복지사)";

const found = [];

function add(file, why, line, text) {
  found.push({ file, why, line, text: text.trim().slice(0, 110) });
}

function lineOf(s, i) {
  return s.slice(0, i).split("\n").length;
}

/* ── 1겹: 실제 자료와 대조 ───────────────────────────────── */

function realNames() {
  const names = new Set();
  const orgs = new Set();
  const files = [];

  const td = join(ROOT, "..", "transcripts");
  if (existsSync(td)) {
    for (const f of readdirSync(td)) if (f.endsWith(".md")) files.push(join(td, f));
  }
  const log = join(ROOT, "..", "education-log.md");
  if (existsSync(log)) files.push(log);

  // 사람 이름의 모양 — 성 한 자 + 두 자, 딱 세 글자만 본다. 두 글자까지 넓히면 「강사·정보·전체」 같은
  // 낱말이 이름으로 둔갑한다. 대신 두 글자 이름(김별)은 이 대조에서 빠진다 —
  // 그런 이름은 아래 「직함이 붙은 이름」 검사에 맡긴다.
  const NAME = new RegExp(`^[${SURNAME}][가-힣]{2}$`);
  const NOTNAME = new RegExp(`^(${TITLE.slice(1, -1).split("|").join("|")})$`);
  // 교육기록의 「참여:」 줄은 명단이 아니라 산문일 때가 많다. 조사가 붙은 낱말
  // (우리는·이름이·문서가)이 이름으로 둔갑하지 않게 끝 글자로 거른다.
  const PARTICLE = /[은는이가을를의도만과와로에서]$/;
  // 어미로 끝나는 말 (이렇게·주시고·하여튼)
  const ENDING = /(게|고|서|며|면|야|든|지|요)$/;
  // 모양만으로는 이름과 못 가르는 것들. 헛걸림이 나오면 여기에 한 낱말씩 더한다.
  // 「고용한」은 실제 참여자 이름이라 어미(-한)로는 거를 수 없었다.
  const STOP = new Set(["고요한", "노력한", "정확한", "고유한", "신뢰할", "서울시", "고서부"]);

  for (const f of files) {
    const s = readFileSync(f, "utf8");

    // 「- 참여: 과장 고용한, 이민기, …」 줄 — 토막으로 잘라 이름 꼴만 거둔다
    for (const m of s.matchAll(/^[-·\s]*참여[:：](.+)$/gm)) {
      for (let tok of m[1].split(/[,、·()（）\s]+/)) {
        tok = tok.replace(new RegExp(`${TITLE}$`), "").trim();
        if (NAME.test(tok) && !NOTNAME.test(tok) &&
            !PARTICLE.test(tok) && !ENDING.test(tok) && !STOP.has(tok)) names.add(tok);
      }
    }
    // 직함이 붙은 이름 — 역시 세 글자만
    for (const m of s.matchAll(
      new RegExp(`(?<![가-힣])[${SURNAME}][가-힣]{2}(?=\\s*${JOB})`, "g"))) {
      if (!PARTICLE.test(m[0]) && !ENDING.test(m[0]) && !STOP.has(m[0])) names.add(m[0]);
    }
    // 기관 이름 — 파일 이름과 본문에서
    for (const m of s.matchAll(/[가-힣]{2,}(복지관|복지센터|재단|협의회|지원센터)/g)) {
      orgs.add(m[0]);
    }
  }

  for (const a of ALLOW) { names.delete(a); orgs.delete(a); }
  // 「사회복지관」처럼 고유명사가 아닌 일반명사는 뺀다
  for (const o of [...orgs]) if (/^(사회|종합|노인|장애인|지역|아동|청소년)/.test(o)) orgs.delete(o);

  return { names: [...names], orgs: [...orgs], sources: files.length };
}

const real = realNames();

// 무엇을 이름으로 보고 있는지 눈으로 확인할 수 있게 — 헛걸림이 나면 여기부터 본다.
if (process.argv.includes("--names")) {
  console.log("이름 " + real.names.length + "개\n  " + real.names.sort().join(" "));
  console.log("\n기관 " + real.orgs.length + "개\n  " + real.orgs.sort().join(" "));
  process.exit(0);
}

for (const file of WATCH) {
  const s = readFileSync(join(ROOT, file), "utf8");
  for (const n of real.names) {
    let i = s.indexOf(n);
    while (i >= 0) {
      add(file, `참여자 실명 「${n}」`, lineOf(s, i), s.slice(Math.max(0, i - 50), i + 60));
      i = s.indexOf(n, i + 1);
    }
  }
  for (const o of real.orgs) {
    let i = s.indexOf(o);
    while (i >= 0) {
      add(file, `기관 이름 「${o}」`, lineOf(s, i), s.slice(Math.max(0, i - 50), i + 60));
      i = s.indexOf(o, i + 1);
    }
  }
}

/* ── 2겹: 모양으로 짐작 ──────────────────────────────────── */

// 「고용한 과장」처럼 직위가 붙은 것만 본다.
//
// 한때 「한 줄에 이름 셋 이상 = 명단」도 보았는데 전부 헛걸림이었다. 우리말 산문은
// 성으로 시작하는 세 글자 낱말(우리는·정해진·권한을)로 가득해서, 모양만으로는
// 이름과 낱말을 가를 수 없다. 짐작이 시끄러우면 사람이 검사를 꺼 버린다 —
// 실명 명단은 위의 「대조」가 정확하게 잡는다.
const TITLED = new RegExp(`(?<![가-힣])([${SURNAME}][가-힣]{2})\\s*${JOB}`, "g");

for (const file of WATCH) {
  const lines = readFileSync(join(ROOT, file), "utf8").split("\n");
  lines.forEach((ln, k) => {
    for (const m of ln.matchAll(TITLED)) {
      if (ALLOW.includes(m[1])) continue;
      add(file, `직함이 붙은 이름 「${m[0]}」`, k + 1, ln);
    }
  });
}

/* ── 알림 ────────────────────────────────────────────────── */

const where = real.sources
  ? `받아적기·교육기록 ${real.sources}개와 대조 (이름 ${real.names.length} · 기관 ${real.orgs.length})`
  : "대조할 받아적기가 없어 모양으로만 봤습니다 (CI 에서는 정상입니다)";
console.log(where);

if (!found.length) {
  console.log("\n✅ 사람 이름도 기관 이름도 새어 나가지 않았습니다.");
  process.exit(0);
}

console.error(`\n🔴 공개하면 안 되는 것이 ${found.length}군데 있습니다.\n`);
for (const f of found) {
  console.error(`  ${f.file}:${f.line}  ${f.why}`);
  console.error(`      ${f.text}\n`);
}
console.error("지우고 다시 돌리십시오. 원본 받아적기는 그대로 두십시오 — 교육기록에는 필요합니다.");
process.exit(1);
