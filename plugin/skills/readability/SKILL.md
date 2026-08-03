---
name: readability
description: >
  Local readability checker for substantial English prose such as docs, PR
  descriptions, commit bodies, blog posts, and explanations. Measures Flesch
  Reading Ease (0-100, higher is easier), MTLD, and TTR. Use when the user asks
  to check, simplify, or rewrite prose. Aim for 60 unless the user specifies a
  different threshold.
allowed-tools: [Bash, Read]
---

# Readability

Check substantial English prose with the pure-JavaScript analyzer bundled in
this plugin. It makes no network requests and has no runtime dependencies.

Do not run it on code, command output, log dumps, non-English text, or short
replies. The scores are not meaningful for those inputs.

## Run the analyzer

The script is at
`${CLAUDE_PLUGIN_ROOT}/skills/readability/scripts/check.js`. It reads stdin,
prints JSON, and exits 1 when the Reading Ease score misses `--threshold`:

```bash
echo "<DRAFT>" | node "${CLAUDE_PLUGIN_ROOT}/skills/readability/scripts/check.js" --threshold 60
```

For a file:

```bash
node "${CLAUDE_PLUGIN_ROOT}/skills/readability/scripts/check.js" --threshold 60 < draft.md
```

For long drafts, use a file or stdin. Do not put long prose in a shell-quoted
`--text` argument.

## Output

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

- `flesch_reading_ease`: 0-100; higher is easier. 70+ is simple, 50-69
  moderate, and below 50 complex.
- `mtld`: lexical diversity; `null` for fewer than 50 words.
- `ttr`: unique tokens divided by all tokens.
- `avg_sentence_length`: the main signal to inspect when a draft scores low.

## Workflow

1. Get the draft from the user or the file they named.
2. Score it with the requested threshold, or 60 by default.
3. If it misses:
   - Above 25 words per sentence: split long sentences.
   - Above 6 characters per word: prefer plainer words where meaning permits.
   - Below 30 Reading Ease: also remove nested clauses and needless passive
     voice.
4. Rewrite without dropping facts, examples, caveats, or the author's voice.
5. Re-score. Stop when it clears the threshold or further simplification would
   damage the content.
6. Show the rewritten draft and the before/after Reading Ease scores.

## Guardrails

Flesch Reading Ease measures sentence and word shape, not truth, style, or
quality. Never game the number at the cost of meaning. A score of 100 is not a
claim that the prose is good.

If `$ARGUMENTS` contains prose, score it. If it names an existing file, read and
score that file. If it is empty, ask what the user wants checked.
