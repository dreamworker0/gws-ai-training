import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const assets = ["style.css", "data.js", "find.js", "ui-state.js", "app.js"];
const hash = createHash("sha1");
for (const asset of assets) hash.update(readFileSync(join(root, asset)));
const expected = hash.digest("hex").slice(0, 7);
const html = readFileSync(join(root, "index.html"), "utf8");
const versions = [...html.matchAll(/(?:style\.css|data\.js|find\.js|ui-state\.js|app\.js)\?v=([^"']+)/g)]
  .map((match) => match[1]);

assert.equal(versions.length, assets.length, "모든 자산에 캐시 버전이 있어야 함");
assert.deepEqual(versions, Array(assets.length).fill(expected), "캐시 버전은 파일 내용만으로 결정되어야 함");
console.log("캐시 스탬프 내용 기반 검사 통과");
