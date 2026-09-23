# Readability for Agents

[![CI](https://github.com/alesdrobysh/readability-agents/actions/workflows/ci.yml/badge.svg)](https://github.com/alesdrobysh/readability-agents/actions/workflows/ci.yml)
[![Release](https://img.shields.io/github/v/release/alesdrobysh/readability-agents)](https://github.com/alesdrobysh/readability-agents/releases)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

Readability gives Codex, OpenCode, Pi, OMP, Hermes, and Claude a local
**measure → rewrite → verify** loop for English prose. It scores a draft,
guides a rewrite without dropping facts, and checks the result again.

No copy-pasting into another editor. No account, API key, telemetry, or network
request.

> “Rewrite this release note in plain English. Keep every fact and aim for a
> Reading Ease score of at least 60.”

In Codex, invoke the skill directly:

```text
$readability Check `your-draft.md`. Keep every fact. Target Reading Ease 60.
```

![Real OpenCode session: the readability skill rewrites a draft and verifies the final score](demo/opencode/readability.gif)

This recording comes from a real OpenCode session. It shows the skill call,
local analyzer output, rewrite, and final Reading Ease score.

## Why use a skill instead of just prompting an agent?

An agent can simplify prose on request, but “make this clearer” has no objective
finish line. Readability adds a deterministic local check and keeps the agent in a
loop until the draft clears your target—or further simplification would damage
the content.

Use it for:

- READMEs and product documentation
- Release notes and changelogs
- PR descriptions and commit bodies
- Technical explanations for a broader audience

It reports:

- Flesch Reading Ease: 0-100, higher is easier
- MTLD and type-token ratio for lexical diversity
- Sentence, paragraph, and word statistics
- Local processing with no telemetry or network requests
- Pure-JavaScript analyzer with no runtime dependencies

## Install

The reusable skill is [`skills/readability`](skills/readability/SKILL.md). It
contains its own Node.js CLI and needs Node.js 18 or newer on `PATH`. Install
the entire `readability` folder so `SKILL.md`, `package.json`, and `scripts/`
stay together. No runtime dependencies or API keys are needed.

### Codex

From a checkout, copy the skill to Codex's user skill directory:

```bash
mkdir -p ~/.agents/skills/readability
cp -R skills/readability/. ~/.agents/skills/readability/
```

Codex also recognizes the repository's portable [`plugin.json`](plugin.json)
and [`skills/`](skills/) layout when this repository is added as a plugin
source. The `.codex-plugin/plugin.json` file supports older Codex plugin
loaders. Invoke the skill as `$readability`, or ask Codex to check or simplify
substantial English prose.

### OpenCode

From a checkout:

```bash
mkdir -p ~/.config/opencode/skills/readability
cp -R skills/readability/. ~/.config/opencode/skills/readability/
```

You can instead copy it to `.opencode/skills/readability` in a project. Invoke
it through OpenCode's `skill` tool or ask for a readability check.

### Pi

Install this repository as a Pi package; Pi discovers the root `skills/`
directory:

```bash
pi install git:github.com/alesdrobysh/readability-agents
```

For a project-only install, use `pi install --local` with the same source.
Invoke `/skill:readability` or ask Pi to simplify English prose.

### OMP (Oh My Pi)

Install the package to make OMP load its bundled skill:

```bash
omp plugin install https://github.com/alesdrobysh/readability-agents
```

From a checkout:

```bash
mkdir -p ~/.omp/agent/skills/readability
cp -R skills/readability/. ~/.omp/agent/skills/readability/
```

For a project-only install, copy the folder to `.omp/skills/readability`.
Invoke `/skill:readability` or ask OMP for a readability check.

### Hermes Agent

Hermes can install the skill and its adjacent scripts directly from GitHub:

```bash
hermes skills install alesdrobysh/readability-agents/skills/readability
```

For a project-only install, copy the folder to `.agents/skills/readability`
and trust that project with `hermes skills trust`. Invoke `/readability` or ask
Hermes to check prose.

### Other Agent Skills hosts

Copy `skills/readability` into the host's skill directory. The skill follows
the `SKILL.md` Agent Skills layout and uses no agent-specific environment
variables. If the host cannot execute local Node.js, use the CLI from a
checkout or connect an MCP server that exposes the analyzer.

### Claude Code plugin

Run these commands inside Claude Code:

```text
/plugin marketplace add alesdrobysh/readability-agents
/plugin install readability@readability-marketplace
```

Then invoke `/readability`, or ask Claude to check or simplify substantial
English prose. The Claude Code plugin carries the same skill as `skills/`.

### Claude Desktop MCP Bundle

Download `readability.mcpb` from the
[latest release](https://github.com/alesdrobysh/readability-agents/releases/latest),
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

### Documentation quality gate

Use a threshold in scripts or CI. The command exits 1 when prose misses the
target, so it can block an unreadable draft before it ships:

```bash
node src/check.js --threshold 60 < README.md
```

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

## How it compares

| Approach | Agent can rewrite | Deterministic score | Local analysis | Threshold exit code |
|---|---:|---:|---:|---:|
| Ask an agent to “make it clearer” | Yes | No | — | No |
| Browser-based writing editor | Outside the agent | Usually | Varies | No |
| Traditional prose linter | No | Rule-based | Usually | Usually |
| **Readability** | **Yes** | **Yes** | **Yes** | **Yes** |

Readability is intentionally narrower than a grammar checker or configurable
style linter. It is a small guardrail for one job: making substantial English
prose easier to read without losing its meaning.

## Privacy and security

Analysis happens in the local Node process. The analyzer:

- makes no network requests;
- does not persist text (the agent host may retain conversation data);
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
the portable skill, Claude Code plugin, and MCP Bundle before packaging. The
test suite checks that all copies remain identical and that the portable skill
runs from an installed copy outside this repository.

Project layout:

```text
src/                         analyzer and CLI source
skills/readability/          portable Agent Skill
plugin.json                  portable plugin manifest
.codex-plugin/               Codex compatibility manifest
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
