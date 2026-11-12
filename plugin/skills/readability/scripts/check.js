#!/usr/bin/env node
// Read files or stdin, emit JSON/Markdown, and optionally fail CI thresholds.
import { readFile } from "node:fs/promises";
import { basename } from "node:path";
import { analyze } from "./analyzer.js";

function parseArgs(argv) {
  const opts = { text: null, files: [], threshold: null, format: "json", allowlist: [], minWords: 100 };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    const value = (name) => { if (i + 1 >= argv.length) throw new Error(`${name} requires a value`); return argv[++i]; };
    if (a === "--text") opts.text = value(a);
    else if (a.startsWith("--text=")) opts.text = a.slice(7);
    else if (a === "--threshold") opts.threshold = Number(value(a));
    else if (a.startsWith("--threshold=")) opts.threshold = Number(a.slice(12));
    else if (a === "--format") opts.format = value(a);
    else if (a.startsWith("--format=")) opts.format = a.slice(9);
    else if (a === "--allowlist") opts.allowlist.push(...value(a).split(",").map((s) => s.trim()).filter(Boolean));
    else if (a.startsWith("--allowlist=")) opts.allowlist.push(...a.slice(12).split(",").map((s) => s.trim()).filter(Boolean));
    else if (a === "--min-words") opts.minWords = Number(value(a));
    else if (a.startsWith("--min-words=")) opts.minWords = Number(a.slice(12));
    else if (a === "--help" || a === "-h") { process.stdout.write("Usage: readability-check [options] [file ...]\n  --text TEXT       Analyze inline text; otherwise read files or stdin.\n  --threshold N     Exit 1 if any score is below N.\n  --format json|markdown (default json)\n  --allowlist a,b   Ignore known project terms in difficult-word findings.\n  --min-words N     Warn below this sample size (default 100).\n  Exit 2 for invalid input/options.\n"); process.exit(0); }
    else if (a.startsWith("-")) throw new Error(`Unknown option: ${a}`);
    else opts.files.push(a);
  }
  if (opts.threshold !== null && (!Number.isFinite(opts.threshold) || opts.threshold < 0 || opts.threshold > 100)) throw new Error("--threshold must be from 0 to 100");
  if (!Number.isInteger(opts.minWords) || opts.minWords < 1) throw new Error("--min-words must be a positive integer");
  if (!["json", "markdown"].includes(opts.format)) throw new Error("--format must be json or markdown");
  if (opts.text !== null && opts.files.length) throw new Error("Use --text or file paths, not both");
  return opts;
}
const fail = (message) => { process.stderr.write(`Error: ${message}\nTry --help for usage.\n`); process.exit(2); };
let opts;
try { opts = parseArgs(process.argv); } catch (error) { fail(error.message); }
let inputs;
try {
  if (opts.text !== null) inputs = [{ file: "(text)", text: opts.text }];
  else if (opts.files.length) inputs = await Promise.all(opts.files.map(async (file) => ({ file, text: await readFile(file, "utf8") })));
  else { let text = ""; for await (const chunk of process.stdin) text += chunk; inputs = [{ file: "(stdin)", text }]; }
} catch (error) { fail(error.message); }
const results = inputs.map(({ file, text }) => ({ file, ...analyze(text, opts) }));
if (results.some((result) => result.error)) { process.stdout.write(JSON.stringify(results.length === 1 ? results[0] : results, null, 2) + "\n"); process.exit(2); }
if (opts.format === "json") process.stdout.write(JSON.stringify(results.length === 1 ? stripFile(results[0]) : results, null, 2) + "\n");
else process.stdout.write(markdown(results));
if (opts.threshold !== null && results.some((r) => r.flesch_reading_ease < opts.threshold)) process.exit(1);

function stripFile(result) { return result.file === "(text)" || result.file === "(stdin)" ? Object.fromEntries(Object.entries(result).filter(([key]) => key !== "file")) : result; }
function markdown(rows) {
  const lines = ["| File | Words | Sentences | Reading Ease | Label | Warnings |", "|---|---:|---:|---:|---|---|"];
  for (const row of rows) lines.push(`| ${row.file} | ${row.word_count} | ${row.sentence_count} | ${row.flesch_reading_ease ?? "n/a"} | ${row.complexity_label} | ${row.warnings.join(" ") || "—"} |`);
  for (const row of rows) {
    if (row.difficult_words.length) lines.push(`\n**${basename(row.file)}: words to review:** ${row.difficult_words.map((w) => `\`${w.word}\``).join(", ")}`);
    for (const sentence of row.complex_sentences) lines.push(`\n**Sentence ${sentence.number}** (${sentence.reasons.join(", ")}): “${sentence.text}”`);
  }
  return lines.join("\n") + "\n";
}
