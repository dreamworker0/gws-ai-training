# Dreamwork Education Archive Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 기존 수강생 복습 기능을 보존하면서 사이트를 수강생과 기관 담당자가 함께 이용하는 `드림워크 교육 아카이브`로 개편하고, 전용 히어로 이미지를 제작해 적용한다.

**Architecture:** 빌드 과정과 서버가 없는 현재 정적 사이트 구조를 유지한다. `data.js`는 브랜드·교육 분야·기존 교육 콘텐츠의 단일 원본, `app.js`는 렌더링과 해시 경로, `index.html`은 의미 구조와 무자바스크립트 안내, `style.css`는 에디토리얼 디자인과 반응형·다크 모드를 담당한다.

**Tech Stack:** HTML5, CSS custom properties, vanilla JavaScript, Node.js 내장 모듈 기반 계약 테스트, GitHub Pages, built-in image generation

**Spec:** `docs/superpowers/specs/2026-09-20-dreamwork-education-archive-design.md`

## Global Constraints

- 주 브랜드는 `드림워크`, 사이트명은 `드림워크 교육 아카이브`다.
- `김종원`은 소개와 하단에서만 `교육자 김종원 · 소셜프리즘`으로 표시한다.
- 대표 문구는 `도구보다, 일하는 방식의 변화`다.
- 특정 기관명, 기관별 진도, 진단 결과, 참석자 정보는 공개 사이트에 넣지 않는다.
- 현재 정적 사이트 구조를 유지하고 프레임워크나 런타임 의존성을 추가하지 않는다.
- 기존 `#a01`, `#b01`, `#slides`, `#graph` 등 공개 해시 주소를 유지한다.
- 기존 검색, 관계도, 발표자료, 슬라이드 뷰어, 질문 메일, 다크 모드를 유지한다.
- 대표 이미지에는 제품 로고, 읽어야 하는 글자, 워터마크, 사람 얼굴 클로즈업을 넣지 않는다.
- 360px 모바일부터 데스크톱까지 지원하고 키보드 포커스와 명암 대비를 보장한다.
- 공개 배포는 구현·로컬 검증과 사용자 확인 이후 별도 단계로 진행한다.

## Review Focus

- JavaScript 또는 대표 이미지가 로드되지 않아도 사이트 목적과 두 핵심 이동 경로가 읽혀야 한다. Task 2와 Task 6에서 무자바스크립트·이미지 오류 계약을 검사한다.
- 오래된 북마크로 `#a01`, `#slides-a01`, `#slide-smart-12`, `#graph`에 들어와도 기존 화면이 열려야 한다. Task 3과 Task 7에서 회귀 검사한다.
- 공개 데이터에 특정 기관명이나 기관별 상태가 다시 섞이지 않아야 한다. Task 1의 금지 문자열 검사로 고정한다.
- 360px 화면에서 히어로, 행동 버튼, 검색 결과, 자료 카드가 겹치거나 가로로 잘리지 않아야 한다. Task 4와 Task 7에서 360px 시각 검사를 한다.
- 외부 썸네일·슬라이드 이미지 실패 시 깨진 이미지 대신 제목과 안내가 남아야 한다. Task 6에서 오류 이벤트를 강제로 발생시켜 검사한다.

---

## File Structure

- Modify: `data.js` — 브랜드, 교육 분야, 교육자 소개, 홈 문구의 단일 데이터 원본
- Modify: `index.html` — 홈·교육 소개의 의미 구조와 무자바스크립트 안내
- Modify: `app.js` — 홈·교육 소개 렌더링, 목적별 이동, 이미지 오류 처리
- Modify: `style.css` — 에디토리얼 디자인 토큰, 레이아웃, 반응형, 다크 모드, 모션 감소
- Create: `img/dreamwork-archive-hero.png` — 드림워크 전용 히어로 일러스트
- Create: `scripts/design-contract.test.mjs` — 브랜드, 공개 데이터, HTML 구조, CSS, 이미지 계약 테스트
- Modify: `README.md` — 새 브랜드, 홈 구조, 이미지 교체 방법, 검증 명령 기록

---

### Task 1: 브랜드와 공개 데이터 계약

**Files:**
- Create: `scripts/design-contract.test.mjs`
- Modify: `data.js:19-25`
- Modify: `data.js:74-80`
- Modify: `data.js:965-986`

**Interfaces:**
- Consumes: 현재 전역 상수 `META`, `CONTACT`, `CURRICULUM`, `FAQ`
- Produces: `META.brand`, `META.title`, `META.tagline`, `META.subtitle`, `META.lecturer`, `EDUCATION_FIELDS`, `ABOUT_DREAMWORK`

- [ ] **Step 1: 브랜드와 공개 범위를 고정하는 실패 테스트 작성**

```js
// scripts/design-contract.test.mjs
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const root = new URL("../", import.meta.url);
const dataSource = await readFile(new URL("data.js", root), "utf8");
const data = new Function(
  dataSource + "\nreturn { META, EDUCATION_FIELDS, ABOUT_DREAMWORK, CURRICULUM };"
)();

assert.equal(data.META.brand, "드림워크");
assert.equal(data.META.title, "드림워크 교육 아카이브");
assert.equal(data.META.tagline, "도구보다, 일하는 방식의 변화");
assert.equal(data.META.lecturer, "교육자 김종원 · 소셜프리즘");
assert.deepEqual(data.EDUCATION_FIELDS.map((field) => field.id), ["workspace", "automation", "agents"]);
assert.equal(data.ABOUT_DREAMWORK.name, "드림워크");

const publicText = JSON.stringify(data);
for (const forbidden of ["기관별 진행 상황", "중림종합사회복지관", "강감찬관악종합사회복지관"]) {
  assert.equal(publicText.includes(forbidden), false, `공개 데이터 금지 문자열: ${forbidden}`);
}

console.log("design data contract: ok");
```

- [ ] **Step 2: 테스트가 새 상수 부재로 실패하는지 확인**

Run: `node scripts/design-contract.test.mjs`  
Expected: FAIL with `EDUCATION_FIELDS is not defined` 또는 `ABOUT_DREAMWORK is not defined`

- [ ] **Step 3: 브랜드와 교육 분야 데이터 추가**

```js
const META = {
  brand: "드림워크",
  title: "드림워크 교육 아카이브",
  tagline: "도구보다, 일하는 방식의 변화",
  subtitle: "사회복지 현장의 스마트워크와 AI 교육을 기록하고 나눕니다.",
  lecturer: "교육자 김종원 · 소셜프리즘",
  updated: "2026-09-20",
};

const EDUCATION_FIELDS = [
  { id: "workspace", title: "Google Workspace", description: "개인 도구를 조직의 협업 환경으로 바꿉니다.", itemIds: ["a01", "a02", "a03", "a04", "a05", "a06", "a07", "a08", "a09", "a10", "a11", "a12"] },
  { id: "automation", title: "데이터와 업무 자동화", description: "반복 업무를 데이터로 쌓고 다시 쓰는 흐름을 만듭니다.", itemIds: ["b03", "b05", "b09", "b12", "b13"] },
  { id: "agents", title: "생성형 AI와 에이전트", description: "말로 시키는 단계를 넘어 일을 나눠 맡는 시스템을 배웁니다.", itemIds: ["b01", "b02", "b04", "b06", "b07", "b08", "b10", "b11"] },
];

const ABOUT_DREAMWORK = {
  name: "드림워크",
  description: "현장의 작은 변화가 조직의 일하는 문화를 바꾸도록 돕는 교육 아카이브입니다.",
  educator: "교육자 김종원 · 소셜프리즘",
};
```

- [ ] **Step 4: 데이터 계약과 기존 링크 데이터 검사를 실행**

Run: `node scripts/design-contract.test.mjs`  
Expected: `design data contract: ok`

Run: `node scripts/check.mjs`  
Expected: 링크 확인이 완료되고 데이터 중복 또는 필수 영상 누락 오류가 없음

- [ ] **Step 5: 커밋**

```bash
git add data.js scripts/design-contract.test.mjs
git commit -m "드림워크 브랜드와 교육 분야 데이터를 정의한다"
```

### Task 2: 홈과 교육 소개의 의미 구조

**Files:**
- Modify: `index.html:8-168`
- Modify: `scripts/design-contract.test.mjs`

**Interfaces:**
- Consumes: Task 1의 `META`, `EDUCATION_FIELDS`, `ABOUT_DREAMWORK`
- Produces: `#hero`, `#audience-paths`, `#education-fields`, `#archive-preview`, `#viewpoint`, `#education`, `#contact`, `#hero-image`

- [ ] **Step 1: 필수 랜드마크와 무자바스크립트 경로를 검사하는 테스트 추가**

```js
const html = await readFile(new URL("index.html", root), "utf8");
for (const id of ["hero", "audience-paths", "education-fields", "archive-preview", "viewpoint", "education", "contact", "hero-image"]) {
  assert.match(html, new RegExp(`id=["']${id}["']`), `필수 홈 영역 누락: ${id}`);
}
assert.match(html, /href=["']#curriculum["'][^>]*>[^<]*수강생 복습/);
assert.match(html, /href=["']#education["'][^>]*>[^<]*교육 살펴보기/);
assert.match(html, /<noscript>[\s\S]*수강생 복습[\s\S]*교육 살펴보기[\s\S]*<\/noscript>/);
assert.doesNotMatch(html, /기관별 진행 상황/);
```

- [ ] **Step 2: 테스트가 새 영역 부재로 실패하는지 확인**

Run: `node scripts/design-contract.test.mjs`  
Expected: FAIL with `필수 홈 영역 누락: hero`

- [ ] **Step 3: 헤더와 홈 구조를 새 정보 구조로 교체**

```html
<section id="hero" class="hero" aria-labelledby="hero-title">
  <div class="wrap hero-grid">
    <div class="hero-copy">
      <p class="eyebrow">드림워크 교육 아카이브</p>
      <h2 id="hero-title">도구보다,<br>일하는 방식의 변화</h2>
      <p id="hero-description">사회복지 현장의 스마트워크와 AI 교육을 기록하고 나눕니다.</p>
      <div class="hero-actions">
        <a class="button primary" href="#curriculum">수강생 복습하기</a>
        <a class="button secondary" href="#education">교육 살펴보기</a>
      </div>
    </div>
    <figure class="hero-art">
      <img id="hero-image" src="img/dreamwork-archive-hero.png" alt="기록과 사람, 업무가 연결되어 성장하는 모습을 표현한 일러스트">
    </figure>
  </div>
</section>
```

`#audience-paths`, `#education-fields`, `#archive-preview`, `#viewpoint`, `#education`, `#contact`도 같은 문서 흐름에 배치한다. 기존 `#curriculum`, `#slides`, `#faq`는 삭제하지 않고 수강생 복습 구역 안으로 이동한다.

- [ ] **Step 4: 스크립트 없이도 핵심 경로가 보이도록 안내 추가**

```html
<noscript>
  <div class="noscript wrap">
    이 사이트의 대화형 검색과 자료 보기는 JavaScript가 필요합니다.
    <a href="#curriculum">수강생 복습</a>과 <a href="#education">교육 살펴보기</a> 안내는 아래에서 읽을 수 있습니다.
  </div>
</noscript>
```

- [ ] **Step 5: 계약 테스트와 HTML 기본 구조 검사 실행**

Run: `node scripts/design-contract.test.mjs`  
Expected: PASS

Run: `node -e "const fs=require('fs');const s=fs.readFileSync('index.html','utf8');if((s.match(/<main/g)||[]).length!==1)process.exit(1);console.log('html shell: ok')"`  
Expected: `html shell: ok`

- [ ] **Step 6: 커밋**

```bash
git add index.html scripts/design-contract.test.mjs
git commit -m "드림워크 아카이브 홈 구조를 만든다"
```

### Task 3: 홈 렌더링과 기존 해시 경로 보존

**Files:**
- Modify: `app.js:1-150`
- Modify: `app.js:335-430`
- Modify: `scripts/design-contract.test.mjs`

**Interfaces:**
- Consumes: `META`, `EDUCATION_FIELDS`, `ABOUT_DREAMWORK`, `CURRICULUM`, `QUOTES`
- Produces: `renderEducationFields(fields, curriculum) -> string`, `renderArchivePreview(curriculum) -> string`, `renderAbout(about) -> string`, 기존 `route()` 호환

- [ ] **Step 1: 렌더러와 해시 호환 계약 테스트 추가**

```js
const appSource = await readFile(new URL("app.js", root), "utf8");
for (const functionName of ["renderEducationFields", "renderArchivePreview", "renderAbout"]) {
  assert.match(appSource, new RegExp(`function\\s+${functionName}\\s*\\(`), `렌더러 누락: ${functionName}`);
}
for (const routePattern of ["raw === \"graph\"", "raw === \"slides\"", "/^slides-", "/^slide-"]) {
  assert.equal(appSource.includes(routePattern), true, `기존 해시 처리 누락: ${routePattern}`);
}
assert.match(appSource, /findItem\(raw\)/);
```

- [ ] **Step 2: 테스트가 새 렌더러 부재로 실패하는지 확인**

Run: `node scripts/design-contract.test.mjs`  
Expected: FAIL with `렌더러 누락: renderEducationFields`

- [ ] **Step 3: 교육 분야 렌더러 구현**

```js
function renderEducationFields(fields, curriculum) {
  return fields.map(function (field) {
    var linked = field.itemIds.map(findItem).filter(Boolean);
    return '<article class="field-card" id="field-' + esc(field.id) + '">' +
      '<p class="field-count">' + linked.length + '개 주제</p>' +
      '<h3>' + esc(field.title) + '</h3>' +
      '<p>' + esc(field.description) + '</p>' +
      '<a href="#' + esc(linked[0] ? linked[0].id : 'curriculum') + '">대표 주제 보기 →</a>' +
      '</article>';
  }).join('');
}
```

- [ ] **Step 4: 아카이브 미리보기와 소개 렌더러 구현**

```js
function renderArchivePreview(curriculum) {
  return curriculum.slice(0, 6).map(itemRow).join('');
}

function renderAbout(about) {
  return '<div class="about-copy"><p class="eyebrow">' + esc(about.name) + '</p>' +
    '<h2>현장의 작은 변화부터 시작합니다.</h2>' +
    '<p>' + esc(about.description) + '</p><p class="educator">' + esc(about.educator) + '</p></div>';
}
```

초기화 시 `education-fields-list`, `archive-preview-list`, `education-about`에 결과를 넣고 `site-title`, `site-sub`, 문서 제목, 하단 정보를 `META`에서 갱신한다.

- [ ] **Step 5: 홈 앵커가 하위 화면에서 정상 복귀하도록 `route()` 보완**

```js
var HOME_ANCHORS = { hero: true, education: true, curriculum: true, slides-home: true, viewpoint: true, faq: true, contact: true };

if (HOME_ANCHORS[raw]) {
  showHome();
  requestAnimationFrame(function () {
    var target = document.getElementById(raw === "slides-home" ? "slides-home" : raw);
    if (target) target.scrollIntoView();
  });
  return;
}
```

- [ ] **Step 6: 계약 테스트와 기존 검색 테스트 실행**

Run: `node scripts/design-contract.test.mjs`  
Expected: PASS

Run: `node -e "new Function(require('fs').readFileSync('app.js','utf8')); console.log('app syntax: ok')"`  
Expected: `app syntax: ok`

- [ ] **Step 7: 커밋**

```bash
git add app.js scripts/design-contract.test.mjs
git commit -m "목적별 홈과 교육 소개를 렌더링한다"
```

### Task 4: 에디토리얼 디자인, 반응형, 다크 모드

**Files:**
- Modify: `style.css:1-457`
- Modify: `scripts/design-contract.test.mjs`

**Interfaces:**
- Consumes: Task 2의 클래스 `hero`, `hero-grid`, `button`, `audience-paths`, `field-card`, `about-copy`
- Produces: CSS tokens `--forest`, `--terracotta`, `--paper`, `--sage`, `--ink`; 360px 레이아웃; `prefers-reduced-motion` 대응

- [ ] **Step 1: 디자인 토큰과 접근성 CSS 계약 테스트 추가**

```js
const css = await readFile(new URL("style.css", root), "utf8");
for (const token of ["--forest", "--terracotta", "--paper", "--sage", "--ink"]) {
  assert.equal(css.includes(token), true, `디자인 토큰 누락: ${token}`);
}
assert.match(css, /@media\s*\(max-width:\s*640px\)/);
assert.match(css, /@media\s*\(prefers-reduced-motion:\s*reduce\)/);
assert.match(css, /:focus-visible/);
assert.match(css, /\.hero-grid/);
```

- [ ] **Step 2: 테스트가 새 토큰 부재로 실패하는지 확인**

Run: `node scripts/design-contract.test.mjs`  
Expected: FAIL with `디자인 토큰 누락: --forest`

- [ ] **Step 3: 색상과 서체 토큰 정의**

```css
:root {
  --forest: #17362f;
  --terracotta: #b65c3d;
  --paper: #f4f0e8;
  --sage: #dbe6dc;
  --ink: #18231f;
  --serif: "Noto Serif KR", "Nanum Myeongjo", Georgia, serif;
  --sans: Pretendard, "Noto Sans KR", system-ui, sans-serif;
}

[data-theme="dark"] {
  --paper: #101a16;
  --ink: #edf3ef;
  --sage: #20342c;
  --terracotta: #d78362;
}
```

- [ ] **Step 4: 히어로와 홈 섹션의 에디토리얼 레이아웃 구현**

```css
.hero { background: var(--paper); border-bottom: 1px solid var(--line); }
.hero-grid { display: grid; grid-template-columns: minmax(0, 1.05fr) minmax(320px, .95fr); align-items: center; gap: clamp(32px, 6vw, 88px); padding-block: clamp(64px, 9vw, 128px); }
.hero h2 { max-width: 12ch; margin: 0; color: var(--forest); font-family: var(--serif); font-size: clamp(42px, 6vw, 82px); line-height: 1.08; letter-spacing: -.05em; }
.hero-art img { display: block; width: 100%; height: auto; border-radius: 46% 54% 42% 58% / 55% 38% 62% 45%; }
.field-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); border-top: 1px solid var(--line); }
.field-card { padding: 28px; border-right: 1px solid var(--line); }
```

- [ ] **Step 5: 모바일, 포커스, 모션 감소 규칙 구현**

```css
:focus-visible { outline: 3px solid var(--terracotta); outline-offset: 4px; }

@media (max-width: 640px) {
  .hero-grid { grid-template-columns: 1fr; padding-block: 48px; }
  .hero-copy { order: 1; }
  .hero-art { order: 2; }
  .hero-actions { display: grid; grid-template-columns: 1fr; }
  .field-grid { grid-template-columns: 1fr; }
  .field-card { border-right: 0; border-bottom: 1px solid var(--line); }
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { scroll-behavior: auto !important; transition-duration: .01ms !important; animation-duration: .01ms !important; animation-iteration-count: 1 !important; }
}
```

- [ ] **Step 6: 계약 테스트 실행**

Run: `node scripts/design-contract.test.mjs`  
Expected: PASS

- [ ] **Step 7: 커밋**

```bash
git add style.css scripts/design-contract.test.mjs
git commit -m "따뜻한 에디토리얼 디자인을 적용한다"
```

### Task 5: 드림워크 전용 히어로 이미지 생성과 적용

**Files:**
- Create: `img/dreamwork-archive-hero.png`
- Modify: `scripts/design-contract.test.mjs`

**Interfaces:**
- Consumes: Task 2의 `#hero-image`, Task 4의 `.hero-art img`
- Produces: PNG 이미지, 최소 1200×800, 가로 비율, 텍스트·로고 없음

- [ ] **Step 1: PNG 자산 계약 테스트 추가**

```js
const image = await readFile(new URL("img/dreamwork-archive-hero.png", root));
assert.deepEqual([...image.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10]);
const width = image.readUInt32BE(16);
const height = image.readUInt32BE(20);
assert.ok(width >= 1200, `히어로 이미지 폭 부족: ${width}`);
assert.ok(height >= 800, `히어로 이미지 높이 부족: ${height}`);
assert.ok(width > height, `히어로 이미지는 가로형이어야 함: ${width}x${height}`);
```

- [ ] **Step 2: 테스트가 이미지 부재로 실패하는지 확인**

Run: `node scripts/design-contract.test.mjs`  
Expected: FAIL with `ENOENT` for `img/dreamwork-archive-hero.png`

- [ ] **Step 3: built-in 이미지 생성 도구로 이미지 생성**

Use case: `stylized-concept`

```text
Asset type: responsive website hero illustration for the Dreamwork education archive
Primary request: an abstract editorial collage expressing people, work, learning records, and digital tools becoming connected and growing together
Scene/backdrop: warm ivory paper field with layered sheets, subtle interface-like rectangles, connecting nodes and lines, and one small sprouting organic form
Style/medium: refined contemporary Korean editorial illustration, tactile paper texture, flat layered shapes, restrained geometric collage
Composition/framing: wide landscape composition; visual weight on the right and generous calm negative space on the left; all important forms remain safe within the center 80 percent for responsive cropping
Lighting/mood: calm, thoughtful, trustworthy, quietly optimistic
Color palette: deep forest green, muted terracotta orange, soft sage green, warm ivory
Constraints: no words, no letters, no numbers, no logos, no recognizable product UI, no faces, no watermark, no glossy 3D
```

선택한 결과를 `img/dreamwork-archive-hero.png`로 복사한다. 생성 결과가 프로젝트 밖에만 남지 않게 한다.

- [ ] **Step 4: 생성 이미지를 직접 확인**

확인 항목:

- 글자나 제품 로고가 없음
- 오른쪽에 시각적 무게가 있고 왼쪽 문구 영역이 복잡하지 않음
- 포레스트 그린·테라코타·아이보리·세이지 범위 안에 있음
- 모바일 중앙 잘림에서도 핵심 형태가 남음
- 사람 얼굴이나 불필요한 장식이 없음

- [ ] **Step 5: 이미지 계약 테스트 실행**

Run: `node scripts/design-contract.test.mjs`  
Expected: PASS with PNG width at least 1200, height at least 800, and width greater than height

- [ ] **Step 6: 커밋**

```bash
git add img/dreamwork-archive-hero.png scripts/design-contract.test.mjs
git commit -m "드림워크 아카이브 대표 이미지를 추가한다"
```

### Task 6: 외부 이미지 오류와 빈 상태 복구

**Files:**
- Modify: `app.js:150-334`
- Modify: `style.css`
- Modify: `scripts/design-contract.test.mjs`

**Interfaces:**
- Consumes: `#hero-image`, `.vid img`, `.sl img`, 기존 `renderItem()`과 `slideTile()`
- Produces: `installImageFallbacks(root)`, `.media-fallback`, `.is-missing`

- [ ] **Step 1: 오류 처리 계약 테스트 추가**

```js
assert.match(appSource, /function\s+installImageFallbacks\s*\(/);
assert.match(appSource, /addEventListener\(["']error["']/);
assert.match(appSource, /media-fallback/);
assert.match(css, /\.media-fallback/);
```

- [ ] **Step 2: 테스트가 오류 처리 함수 부재로 실패하는지 확인**

Run: `node scripts/design-contract.test.mjs`  
Expected: FAIL with `installImageFallbacks` 관련 assertion

- [ ] **Step 3: 이미지 오류 처리 함수 구현**

```js
function installImageFallbacks(root) {
  (root || document).querySelectorAll("img").forEach(function (img) {
    if (img.dataset.fallbackReady) return;
    img.dataset.fallbackReady = "true";
    img.addEventListener("error", function () {
      img.classList.add("is-missing");
      var fallback = document.createElement("span");
      fallback.className = "media-fallback";
      fallback.textContent = img.id === "hero-image" ? "드림워크 교육 아카이브" : (img.alt || "이미지를 불러오지 못했습니다");
      img.replaceWith(fallback);
    }, { once: true });
  });
}
```

초기 홈 렌더링, 주제 상세 렌더링, 슬라이드 화면 렌더링 직후 각각 `installImageFallbacks()`를 호출한다.

- [ ] **Step 4: 오류 상태 CSS 구현**

```css
.media-fallback { display: grid; min-height: 180px; place-items: center; padding: 24px; background: var(--sage); color: var(--forest); font-weight: 700; text-align: center; }
.thumb .media-fallback { min-height: 0; aspect-ratio: 16 / 9; font-size: 13px; }
```

- [ ] **Step 5: 계약 테스트와 구문 검사 실행**

Run: `node scripts/design-contract.test.mjs`  
Expected: PASS

Run: `node -e "new Function(require('fs').readFileSync('app.js','utf8')); console.log('app syntax: ok')"`  
Expected: `app syntax: ok`

- [ ] **Step 6: 커밋**

```bash
git add app.js style.css scripts/design-contract.test.mjs
git commit -m "외부 이미지 실패 시 안내를 유지한다"
```

### Task 7: 문서화와 전체 회귀 검증

**Files:**
- Modify: `README.md`
- Modify: `index.html:190-192`
- Test: `scripts/design-contract.test.mjs`
- Test: `scripts/check.mjs`

**Interfaces:**
- Consumes: Tasks 1–6의 완성된 정적 사이트
- Produces: 갱신된 운영 문서, 캐시 무효화 버전, 검증 기록

- [ ] **Step 1: README에 새 운영 구조 기록**

다음 내용을 실제 파일명과 명령으로 추가한다.

````markdown
## 드림워크 교육 아카이브

첫 화면은 수강생 복습과 기관 담당자의 교육 탐색을 함께 지원합니다.

- 브랜드·교육 분야·문구: `data.js`
- 홈 구조: `index.html`
- 렌더링·검색·자료 보기: `app.js`, `find.js`
- 디자인: `style.css`
- 대표 이미지: `img/dreamwork-archive-hero.png`

검증:

```bash
node scripts/design-contract.test.mjs
node scripts/check.mjs
```
````

- [ ] **Step 2: 정적 자산 캐시 버전 갱신**

`index.html`의 `style.css`, `data.js`, `find.js`, `app.js` 쿼리 문자열을 같은 새 값으로 맞춘다.

```html
<link rel="stylesheet" href="style.css?v=20260920-archive">
<script src="data.js?v=20260920-archive"></script>
<script src="find.js?v=20260920-archive"></script>
<script src="app.js?v=20260920-archive"></script>
```

- [ ] **Step 3: 빠른 로컬 검증 실행**

Run: `node scripts/design-contract.test.mjs`  
Expected: `design data contract: ok` and exit 0

Run: `node -e "new Function(require('fs').readFileSync('data.js','utf8')); new Function(require('fs').readFileSync('find.js','utf8')); new Function(require('fs').readFileSync('app.js','utf8')); console.log('syntax: ok')"`  
Expected: `syntax: ok`

- [ ] **Step 4: 외부 링크 검사 실행**

Run: `node scripts/check.mjs`  
Expected: 모든 확인 가능한 링크가 정상이며 실패 0건. 네트워크 경고는 실패와 구분해 기록한다.

- [ ] **Step 5: 로컬 서버에서 데스크톱·모바일 시각 검증**

Run: `python -m http.server 4173`  
Open: `http://localhost:4173/`

검증 경로:

- `/` — 히어로, 두 행동 버튼, 교육 분야, 아카이브, 인용문, 문의
- `/#education` — 기관 담당자 동선
- `/#curriculum` — 수강생 동선
- `/#a01`, `/#b01` — 기존 항목 상세
- `/#slides`, `/#slides-a01`, `/#slide-smart-12` — 기존 발표자료
- `/#graph` — 관계도
- 검색어 `캘린더`, `에이전트`, `스프레드 시트`
- 밝은 화면과 어두운 화면
- 360×800, 768×1024, 1440×900 뷰포트
- 키보드 `Tab`, `Shift+Tab`, `Enter`, `Escape`, `/`

Expected: 가로 스크롤, 겹침, 잘린 버튼, 사라진 포커스, 콘솔 오류가 없음

- [ ] **Step 6: 이미지 실패 상태 수동 검증**

브라우저 개발 도구에서 `#hero-image`, 영상 썸네일 하나, 슬라이드 이미지 하나의 `src`를 존재하지 않는 경로로 바꾼다.

Expected: 깨진 이미지 아이콘 대신 `.media-fallback`이 나타나고 제목·링크·주요 동작은 남음

- [ ] **Step 7: 최종 diff와 공개 정보 점검**

Run: `git diff --check`  
Expected: output 없음

Run: `rg -n "기관별 진행 상황|중림종합사회복지관|강감찬관악종합사회복지관" index.html data.js app.js style.css README.md`  
Expected: 공개 파일에서 output 없음

- [ ] **Step 8: 커밋**

```bash
git add README.md index.html
git commit -m "드림워크 아카이브 운영 문서와 캐시 버전을 갱신한다"
```

- [ ] **Step 9: 완료 상태 확인**

Run: `git status --short`  
Expected: output 없음

공개 배포는 하지 않는다. 검증 결과와 로컬 미리보기를 사용자에게 보고하고 별도 승인을 받는다.
