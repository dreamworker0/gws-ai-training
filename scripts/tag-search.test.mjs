import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const root = new URL("../", import.meta.url);
const data = await readFile(new URL("data.js", root), "utf8");
const find = await readFile(new URL("find.js", root), "utf8");
const Find = new Function(`${data}\n${find}\nreturn Find;`)();

assert.equal(typeof Find.tagMatches, "function", "태그 교집합 검색을 제공해야 함");
assert.equal(typeof Find.tagOptions, "function", "태그 목록을 제공해야 함");
assert.equal(typeof Find.toggleTag, "function", "태그 선택을 제공해야 함");

assert.deepEqual(Find.tagMatches([]).map((item) => item.id), [], "선택 전에는 결과를 펼치지 않음");
assert.deepEqual(
  Find.tagMatches(["협업", "클라우드"]).map((item) => item.id),
  ["a01", "a02"],
  "고른 태그가 모두 붙은 강의 항목만 표시",
);
assert.deepEqual(Find.tagMatches(["없는 태그"]).map((item) => item.id), []);

const cloud = Find.tagOptions(["협업"], "클라 우드");
assert.deepEqual(cloud.map((option) => option.tag), ["클라우드"], "공백 차이를 무시하고 태그 이름 검색");
assert.equal(cloud[0].count, 2, "태그 사용 강의 항목 수 표시");
assert.equal(cloud[0].disabled, false);
assert.equal(Find.tagOptions(["협업"], "앱 만들기")[0].disabled, true,
  "현재 선택과 겹치는 강의 항목이 없는 태그는 선택 불가");

assert.deepEqual(Find.toggleTag(["협업"], "클라우드"), ["협업", "클라우드"]);
assert.deepEqual(Find.toggleTag(["협업", "클라우드"], "협업"), ["클라우드"], "선택 해제");
assert.deepEqual(Find.toggleTag(["협업"], "앱 만들기"), ["협업"], "결과가 없는 조합은 추가하지 않음");
assert.deepEqual(Find.toggleTag(["협업", "클라우드", "기초"], "메모"),
  ["협업", "클라우드", "기초"], "네 번째 태그는 추가하지 않음");
console.log("tag search: ok");
