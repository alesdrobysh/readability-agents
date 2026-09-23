---
name: readability
description: >
  Local readability checker for substantial English prose such as docs, PR
  descriptions, commit bodies, blog posts, and explanations. Measures Flesch
  Reading Ease (0-100, higher is easier), MTLD, and TTR. Use when the user asks
  to check, simplify, or rewrite prose. Aim for 60 unless the user specifies a
  different threshold.
---

# Readability

Check substantial English prose with the pure-JavaScript analyzer next to this
skill. It makes no network requests and has no runtime dependencies. This skill
works in any agent that supports Agent Skills and can run Node.js 18 or newer.

Do not run it on code, command output, log dumps, non-English text, or short
replies. The scores are not meaningful for those inputs.

## Run the analyzer

Find the directory containing this `SKILL.md`, then run its adjacent
`scripts/check.js` with Node.js. Use the actual absolute path to that script;
the current working directory and agent-specific environment variables are not
reliable ways to locate it. The script reads stdin, prints JSON, and exits 1
when the Reading Ease score misses `--threshold`:

```bash
node "/absolute/path/to/readability/scripts/check.js" --threshold 60 < draft.md
```

To score prose already in the conversation, pass it on stdin. For long drafts,
write the draft to a file first. Do not put prose in a shell-quoted `--text`
argument. The path above is an example; replace it with the installed skill's
actual path.

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

If the user's request contains prose, score it. If it names an existing file,
read and score that file. If no prose or file is provided, ask what to check.
