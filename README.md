# Readability for Claude

[![CI](https://github.com/alesdrobysh/readability-claude/actions/workflows/ci.yml/badge.svg)](https://github.com/alesdrobysh/readability-claude/actions/workflows/ci.yml)
[![Release](https://img.shields.io/github/v/release/alesdrobysh/readability-claude)](https://github.com/alesdrobysh/readability-claude/releases)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

Keep Claude's prose clear without sending the draft to another service.
Readability adds a local, deterministic readability check to Claude Code and
Claude Desktop. Claude can score a draft, rewrite it, and check the result
again.

- Flesch Reading Ease: 0-100, higher is easier
- MTLD and type-token ratio for lexical diversity
- Sentence, paragraph, and word statistics
- Local processing with no telemetry or network requests
- Pure-JavaScript analyzer with no runtime dependencies

> “Rewrite this release note in plain English. Keep every fact and aim for a
> Reading Ease score of at least 60.”

## Install

### Claude Code plugin

Run these commands inside Claude Code:

```text
/plugin marketplace add alesdrobysh/readability-claude
/plugin install readability@readability-marketplace
```

Then invoke `/readability`, or ask Claude to check or simplify substantial
English prose.

Requires Node.js 18 or newer on `PATH`.

### Claude Desktop MCP Bundle

Download `readability.mcpb` from the
[latest release](https://github.com/alesdrobysh/readability-claude/releases/latest),
open it, and approve the installation in Claude Desktop. The
`analyze_readability` MCP tool will then be available.

The bundle contains its Node dependencies and needs no API key or setup.
Its bundled server requires a host with Node.js 20 or newer.

### Command line

From a checkout:

```bash
printf '%s\n' 'Your draft goes here.' | node src/check.js
printf '%s\n' 'Your draft goes here.' | node src/check.js --threshold 60
```

The threshold command exits 1 when the draft misses the target. Invalid input
or options exit 2.

## Example output

```json
{
  "word_count": 174,
  "sentence_count": 12,
  "paragraph_count": 4,
  "avg_sentence_length": 14.5,
  "avg_word_length": 4.8,
  "ttr": 0.61,
  "mtld": 74.2,
  "flesch_reading_ease": 64.3,
  "complexity_label": "Moderate"
}
```

| Field | Meaning |
|---|---|
| `flesch_reading_ease` | 0-100. 70+ simple, 50-69 moderate, below 50 complex. |
| `complexity_label` | Bucket derived from Reading Ease. |
| `mtld` | Lexical diversity; `null` below 50 words. |
| `ttr` | Unique tokens divided by all tokens. |
| `avg_sentence_length` | Words per sentence. |
| `avg_word_length` | Characters per word. |
| `word_count`, `sentence_count`, `paragraph_count` | Surface statistics. |

Markdown code blocks and inline code are removed. Formatting markers are
stripped while prose content, headings, links, and list text are retained.
This is intentionally a small Markdown heuristic, not a complete parser.

## What this score can and cannot do

This project currently supports English prose. Its syllable counter is a small
English heuristic, not a dictionary. Flesch Reading Ease rewards short
sentences and short words; it does not understand meaning, accuracy, tone, or
style. Use the score as a guardrail against bloat, not a target to game.

Do not use it on source code, logs, command output, non-English prose, or tiny
samples.

## Privacy and security

Analysis happens in the local Node process. The analyzer:

- makes no network requests;
- does not persist text (the Claude host may retain conversation data);
- starts no network listener;
- uses no API keys or telemetry.

The MCP Bundle uses stdio to communicate with its host. See
[SECURITY.md](SECURITY.md) to report a vulnerability.

## Development

```bash
npm install
npm test
npm run validate:mcpb
npm run build:mcpb
# -> readability.mcpb and readability.mcpb.sha256
```

`src/analyzer.js` and `src/check.js` are canonical. The build copies them into
the Claude Code plugin and MCP Bundle before packaging, and the test suite
checks that all copies remain identical.

Project layout:

```text
src/                         analyzer and CLI source
plugin/                      Claude Code plugin
mcpb/                        Claude Desktop MCP Bundle source
test/smoke.js                dependency-free smoke tests
scripts/build-mcpb.sh        validated, lockfile-based bundle build
.claude-plugin/              self-hosted Claude Code marketplace
.github/workflows/           CI and release automation
```

See [CONTRIBUTING.md](CONTRIBUTING.md) for development and release checks.

## License

MIT. See [LICENSE](LICENSE).
