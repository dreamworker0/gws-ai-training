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
