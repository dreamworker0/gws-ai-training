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

const html = await readFile(new URL("index.html", root), "utf8");
for (const id of ["hero", "audience-paths", "education-fields", "archive-preview", "viewpoint", "education", "contact", "hero-image"]) {
  assert.match(html, new RegExp(`id=["']${id}["']`), `필수 홈 영역 누락: ${id}`);
}
assert.match(html, /href=["']#curriculum["'][^>]*>[^<]*수강생 복습/);
assert.match(html, /href=["']#education["'][^>]*>[^<]*교육 살펴보기/);
assert.match(html, /<noscript>[\s\S]*수강생 복습[\s\S]*교육 살펴보기[\s\S]*<\/noscript>/);
assert.doesNotMatch(html, /기관별 진행 상황/);
assert.match(html, /<link\s+rel=["']icon["']\s+href=["']favicon\.svg["']\s+type=["']image\/svg\+xml["']/);
assert.match(html, /<link\s+rel=["']canonical["']\s+href=["']https:\/\/dreamworker0\.github\.io\/gws-ai-training\/["']/);
assert.match(html, /property=["']og:type["']\s+content=["']website["']/);
assert.match(html, /property=["']og:title["']\s+content=["']드림워크 교육 아카이브["']/);
assert.match(html, /property=["']og:description["']\s+content=["'][^"']+["']/);
assert.match(html, /property=["']og:url["']\s+content=["']https:\/\/dreamworker0\.github\.io\/gws-ai-training\/["']/);
assert.match(html, /property=["']og:image["']\s+content=["']https:\/\/dreamworker0\.github\.io\/gws-ai-training\/img\/dreamwork-og\.png["']/);
assert.match(html, /property=["']og:image:width["']\s+content=["']1200["']/);
assert.match(html, /property=["']og:image:height["']\s+content=["']630["']/);
assert.match(html, /name=["']twitter:card["']\s+content=["']summary_large_image["']/);
assert.match(html, /name=["']theme-color["']\s+content=["']#17362f["']/);

const appSource = await readFile(new URL("app.js", root), "utf8");
for (const functionName of ["renderEducationFields", "renderArchivePreview", "renderAbout"]) {
  assert.match(appSource, new RegExp(`function\\s+${functionName}\\s*\\(`), `렌더러 누락: ${functionName}`);
}
for (const routePattern of ["raw === \"graph\"", "raw === \"slides\"", "/^slides-", "/^slide-"]) {
  assert.equal(appSource.includes(routePattern), true, `기존 해시 처리 누락: ${routePattern}`);
}
assert.match(appSource, /findItem\(raw\)/);
assert.match(appSource, /ask-education/);
assert.match(appSource, /교육을 함께 준비하시나요\?/);

const css = await readFile(new URL("style.css", root), "utf8");
for (const token of ["--forest", "--terracotta", "--paper", "--sage", "--ink"]) {
  assert.equal(css.includes(token), true, `디자인 토큰 누락: ${token}`);
}
assert.match(css, /@media\s*\(max-width:\s*640px\)/);
assert.match(css, /@media\s*\(prefers-reduced-motion:\s*reduce\)/);
assert.match(css, /:focus-visible/);
assert.match(css, /\.hero-grid/);

const heroImage = await readFile(new URL("img/dreamwork-archive-hero.png", root));
assert.deepEqual([...heroImage.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10]);
const heroWidth = heroImage.readUInt32BE(16);
const heroHeight = heroImage.readUInt32BE(20);
assert.ok(heroWidth >= 1200, `히어로 이미지 폭 부족: ${heroWidth}`);
assert.ok(heroHeight >= 800, `히어로 이미지 높이 부족: ${heroHeight}`);
assert.ok(heroWidth > heroHeight, `히어로 이미지는 가로형이어야 함: ${heroWidth}x${heroHeight}`);

const ogImage = await readFile(new URL("img/dreamwork-og.png", root));
assert.deepEqual([...ogImage.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10]);
assert.equal(ogImage.readUInt32BE(16), 1200, "오픈 그래프 이미지 폭은 1200이어야 함");
assert.equal(ogImage.readUInt32BE(20), 630, "오픈 그래프 이미지 높이는 630이어야 함");

const favicon = await readFile(new URL("favicon.svg", root), "utf8");
assert.match(favicon, /<svg[^>]+viewBox=["']0 0 64 64["']/);
assert.match(favicon, /#17362f/);

assert.match(appSource, /function\s+installImageFallbacks\s*\(/);
assert.match(appSource, /addEventListener\(["']error["']/);
assert.match(appSource, /media-fallback/);
assert.match(css, /\.media-fallback/);

console.log("design data contract: ok");
