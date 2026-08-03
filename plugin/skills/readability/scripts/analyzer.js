// Pure-JS readability analyzer. Zero dependencies.
// Exports analyze(text) -> object of metrics.

function stripMarkdown(text) {
  return text
    .replace(/```[\s\S]*?```/g, "")
    .replace(/`[^`]*`/g, "")
    .replace(/!\[.*?\]\(.*?\)/g, "")
    .replace(/\[(.+?)\]\(.*?\)/g, "$1")
    .replace(/#{1,6}\s+/g, "")
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\*(.+?)\*/g, "$1")
    .replace(/__(.+?)__/g, "$1")
    .replace(/_(.+?)_/g, "$1")
    .replace(/^\s*[-*+]\s+/gm, "")
    .replace(/^\s*\d+\.\s+/gm, "")
    .replace(/^\s*>+\s*/gm, "")
    .replace(/-{3,}/g, "")
    .trim();
}

function countSyllables(word) {
  const w = word.toLowerCase();
  const groups = w.match(/[aeiouy]+/g);
  let count = groups ? groups.length : 0;
  const consonantLe = /[^aeiouy]le$/.test(w);
  if (w.endsWith("e") && !consonantLe && count > 1) count -= 1;
  return Math.max(1, count);
}

function tokenize(plain) {
  const words = plain.match(/\p{L}+(?:['’]\p{L}+)*/gu) || [];
  const sentenceText = plain
    .replace(/\b(?:Mr|Mrs|Ms|Dr|Prof|Sr|Jr|St)\./g, (match) => `${match.slice(0, -1)}\u0000`)
    .replace(/\b(?:[A-Za-z]\.){2,}/g, (match) => match.replaceAll(".", "\u0000"));
  const sentences = sentenceText
    .split(/[.!?]+[”’"'»)\]]*(?:\s+|$)/u)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
  const paragraphs = plain
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);
  return { words, sentences, paragraphs };
}

function fleschReadingEase(wordCount, sentenceCount, syllableCount) {
  if (wordCount === 0 || sentenceCount === 0) return 0;
  const score =
    206.835 -
    1.015 * (wordCount / sentenceCount) -
    84.6 * (syllableCount / wordCount);
  return Math.max(0, Math.min(100, score));
}

// MTLD (McCarthy & Jarvis 2010): walk tokens, count factors where TTR drops
// to ttrThreshold (0.72). MTLD = totalTokens / numFactors. Forward + backward,
// average the two.
function mtld(words, ttrThreshold = 0.72) {
  if (words.length < 50) return null;
  const lowered = words.map((w) => w.toLowerCase());

  const oneDirection = (tokens) => {
    let factors = 0;
    let types = new Set();
    let count = 0;
    for (const t of tokens) {
      count += 1;
      types.add(t);
      const ttr = types.size / count;
      if (ttr <= ttrThreshold) {
        factors += 1;
        types = new Set();
        count = 0;
      }
    }
    if (count > 0) {
      const partial = (1 - types.size / count) / (1 - ttrThreshold);
      factors += partial;
    }
    if (factors === 0) return tokens.length;
    return tokens.length / factors;
  };

  const forward = oneDirection(lowered);
  const backward = oneDirection([...lowered].reverse());
  return (forward + backward) / 2;
}

function complexityLabel(fk) {
  if (fk >= 70) return "Simple";
  if (fk >= 50) return "Moderate";
  return "Complex";
}

function round(value, decimals) {
  if (value === null || value === undefined || Number.isNaN(value)) return null;
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

export function analyze(text) {
  if (typeof text !== "string" || !text.trim()) {
    return { error: "No text to analyze." };
  }
  const plain = stripMarkdown(text);
  if (!plain) return { error: "No text to analyze." };

  const { words, sentences, paragraphs } = tokenize(plain);
  if (words.length === 0) return { error: "No words found in the text." };

  const sentenceCount = Math.max(1, sentences.length);
  const syllableCount = words.reduce((s, w) => s + countSyllables(w), 0);
  const readingEase = fleschReadingEase(words.length, sentenceCount, syllableCount);

  const types = new Set(words.map((w) => w.toLowerCase()));
  const ttr = types.size / words.length;
  const mtldValue = mtld(words);

  const totalChars = words.reduce((s, w) => s + w.length, 0);

  return {
    word_count: words.length,
    sentence_count: sentenceCount,
    paragraph_count: paragraphs.length,
    avg_sentence_length: round(words.length / sentenceCount, 1),
    avg_word_length: round(totalChars / words.length, 1),
    ttr: round(ttr, 3),
    mtld: round(mtldValue, 2),
    flesch_reading_ease: round(readingEase, 1),
    complexity_label: complexityLabel(readingEase),
  };
}
