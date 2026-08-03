#!/usr/bin/env node
// CLI wrapper: read text from stdin (or --text), print JSON metrics,
// exit 1 if --threshold is supplied and flesch_reading_ease is below it.

import { analyze } from "./analyzer.js";

function parseArgs(argv) {
  const opts = { text: null, threshold: null };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--text") {
      if (i + 1 >= argv.length) throw new Error("--text requires a value");
      opts.text = argv[++i];
    }
    else if (a.startsWith("--text=")) opts.text = a.slice(7);
    else if (a === "--threshold") {
      if (i + 1 >= argv.length) throw new Error("--threshold requires a number");
      opts.threshold = Number(argv[++i]);
    }
    else if (a.startsWith("--threshold=")) opts.threshold = Number(a.slice(12));
    else if (a === "--help" || a === "-h") {
      process.stdout.write(
        "Usage: check.js [--text \"…\"] [--threshold N]\n" +
          "  Reads stdin if --text is omitted.\n" +
          "  Exits 1 if --threshold is given and flesch_reading_ease < threshold.\n" +
          "  Exits 2 for invalid options or input.\n",
      );
      process.exit(0);
    }
    else throw new Error(`Unknown option: ${a}`);
  }
  if (opts.threshold !== null && !Number.isFinite(opts.threshold)) {
    throw new Error("--threshold requires a finite number");
  }
  return opts;
}

async function readStdin() {
  return new Promise((resolve) => {
    let data = "";
    if (process.stdin.isTTY) return resolve("");
    process.stdin.setEncoding("utf8");
    process.stdin.on("data", (chunk) => (data += chunk));
    process.stdin.on("end", () => resolve(data));
  });
}

let opts;
try {
  opts = parseArgs(process.argv);
} catch (error) {
  process.stderr.write(`Error: ${error.message}\nTry --help for usage.\n`);
  process.exit(2);
}
const text = opts.text !== null ? opts.text : await readStdin();
const result = analyze(text);
process.stdout.write(JSON.stringify(result, null, 2) + "\n");

if (result.error) process.exit(2);

if (opts.threshold !== null) {
  const score = result.flesch_reading_ease;
  if (typeof score === "number" && score < opts.threshold) process.exit(1);
}
process.exit(0);
