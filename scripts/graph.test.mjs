import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const root = new URL("../", import.meta.url);
const data = await readFile(new URL("data.js", root), "utf8");
const find = await readFile(new URL("find.js", root), "utf8");
const Find = new Function(`${data}\n${find}\nreturn Find;`)();

assert.equal(typeof Find.graphTopics, "function", "관계도 목록 데이터를 제공해야 함");
const topics = Find.graphTopics(2);
assert.equal(topics.some((topic) => topic.tag === "기초"), false, "난이도 태그는 관계 주제가 아님");
assert.deepEqual(
  topics.find((topic) => topic.tag === "협업").items.map((item) => item.id),
  ["a01", "a02", "a03", "a04", "a08", "a12"],
  "협업 주제에서는 실제 연결된 항목으로 이동할 수 있어야 함",
);
assert.ok(topics.every((topic) => topic.items.length >= 2));

const list = Find.graphListHTML(2);
assert.match(list, /<details[^>]*>\s*<summary>협업/);
assert.match(list, /href="#a01"/);
assert.match(list, /href="#a12"/);

const svg = Find.graphSVG(2);
assert.doesNotMatch(svg, /role="img"/, "링크를 그림 한 개의 하위 요소로 숨기면 안 됨");
assert.match(svg, /data-graph-item="a01"/);
assert.match(svg, /class="ge" data-graph-item="a01"/);
console.log("graph navigation: ok");
