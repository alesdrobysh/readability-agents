import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { analyze } from "../src/analyzer.js";

const result = analyze("The cat sat on the mat. It was a warm and sunny day.");
assert.equal(typeof result.flesch_reading_ease, "number");
assert.equal("flesch_kincaid" in result, false);
assert.equal(result.complexity_label, "Simple");
assert.deepEqual(result, {
  word_count: 13,
  sentence_count: 2,
  paragraph_count: 1,
  avg_sentence_length: 6.5,
  avg_word_length: 2.9,
  ttr: 0.923,
  mtld: null,
  flesch_reading_ease: 100,
  complexity_label: "Simple",
});

assert.deepEqual(analyze("   "), { error: "No text to analyze." });
assert.equal(analyze("Café is open.").word_count, 3);
assert.equal(analyze("Hello `ignored code` world.").word_count, 2);
assert.equal(analyze("A simple table helps.").flesch_reading_ease, 75.9);
assert.equal(analyze("She said “This is clear.” Then she left.").sentence_count, 2);
assert.equal(analyze("Dr. Smith wrote this. It is clear.").sentence_count, 2);
assert.deepEqual(
  analyze("# Clear title\n\nShort **plain** prose with [a link](https://example.com). `hidden code`"),
  {
    word_count: 8,
    sentence_count: 1,
    paragraph_count: 2,
    avg_sentence_length: 8,
    avg_word_length: 4.3,
    ttr: 1,
    mtld: null,
    flesch_reading_ease: 100,
    complexity_label: "Simple",
  },
);
assert.equal(analyze("word ".repeat(49)).mtld, null);
assert.equal(typeof analyze("word ".repeat(50)).mtld, "number");

assert.equal(
  readFileSync("src/analyzer.js", "utf8"),
  readFileSync("plugin/skills/readability/scripts/analyzer.js", "utf8"),
);
assert.equal(
  readFileSync("src/analyzer.js", "utf8"),
  readFileSync("mcpb/server/analyzer.js", "utf8"),
);
assert.equal(
  readFileSync("src/check.js", "utf8"),
  readFileSync("plugin/skills/readability/scripts/check.js", "utf8"),
);

function cli(args, input = "") {
  return spawnSync(process.execPath, ["src/check.js", ...args], {
    cwd: process.cwd(),
    input,
    encoding: "utf8",
  });
}

assert.equal(cli([], "Simple words make prose easy to read.").status, 0);
assert.equal(cli(["--threshold", "101"], "Short text.").status, 1);
assert.equal(cli([], "").status, 2);
assert.equal(cli(["--unknown"]).status, 2);
assert.equal(cli(["--threshold", "nope"], "Short text.").status, 2);
assert.equal(cli(["--text"]).status, 2);

const pkg = JSON.parse(readFileSync("package.json", "utf8"));
const manifest = JSON.parse(readFileSync("mcpb/manifest.json", "utf8"));
const serverPkg = JSON.parse(readFileSync("mcpb/server/package.json", "utf8"));
const plugin = JSON.parse(readFileSync("plugin/.claude-plugin/plugin.json", "utf8"));
assert.equal(manifest.manifest_version, "0.3");
assert.equal(pkg.version, manifest.version);
assert.equal(pkg.version, plugin.version);
assert.equal(pkg.version, serverPkg.version);
assert.match(readFileSync("mcpb/server/index.js", "utf8"), /const \{ version \} =/);

console.log("smoke tests passed");
