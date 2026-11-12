// Local English readability analysis. No network access or runtime dependencies.
const COMMON = new Set(("a about above after again all also an and any are as at back be because been before being between both but by can could day did do down each even every few first for from get give go good great had has have he her here him his how i if in into is it its just know like little long look made make many may me more most much must my new no not now of off on one only or other our out over people said same see she so some still such take than that the their them then there these they thing think this those through time to too up us use very was way we well were what when where which while who will with would year you your" ).split(/\s+/u));
const RARE = new Set(("aberration abeyance abrogate abstruse accretion acrimony adjudicate ameliorate anachronism ancillary antecedent apocryphal apotheosis arbitrage assiduous asymptotic attenuate augmentation bifurcate concomitant confluence conflagration contingent copious corroborate deleterious delineate demarcate disparate elucidate empirical enervate ephemeral equivocal exacerbate exogenous expeditious extrapolate facilitate fallacy fastidious fluctuate heterogeneous ubiquitous idiosyncratic immutable implicit inception incorporate incongruous inference inherent intrinsic juxtapose mitigate modality notwithstanding obfuscate paradigm parameter paucity periphery pragmatic prerequisite probabilistic proliferation pursuant reconcile recurrence redundant salient semantics ubiquitous unilateral validate" ).split(/\s+/u));

function stripMarkdown(text) {
  return text
    .replace(/```[^\n]*\n[\s\S]*?```/gu, " ").replace(/~~~[^\n]*\n[\s\S]*?~~~/gu, " ")
    .replace(/`+[^`]*`+/gu, " ").replace(/<!--([\s\S]*?)-->/gu, " ")
    .replace(/!\[([^\]]*)\]\([^)]*\)/gu, "$1").replace(/\[([^\]]+)\]\([^)]*\)/gu, "$1")
    .replace(/\[([^\]]+)\]\[[^\]]*\]/gu, "$1").replace(/^\s*\[[^\]]+\]:\s*\S+.*$/gmu, " ")
    .replace(/^\s*\|?\s*:?-{3,}:?\s*(?:\|\s*:?-{3,}:?\s*)+\|?\s*$/gmu, " ")
    .replace(/^\s*\|/gmu, "").replace(/\|\s*$/gmu, "")
    .replace(/^(\s{0,3})(#{1,6}\s*)/gmu, "$1\u0002").replace(/^\s{0,3}>\s?/gmu, "")
    .replace(/^\s*(?:[-+*]|\d+[.)])\s+/gmu, "").replace(/^\s*(?:---+|___+|\*\*\*+)\s*$/gmu, " ")
    .replace(/<[^>]+>/gu, " ").replace(/\\([\\`*_{}\[\]()#+.!|>~-])/gu, "$1")
    .replace(/[*_~]{1,3}([^*_~]+)[*_~]{1,3}/gu, "$1").replace(/[ \t]+/gu, " ").replace(/\n{3,}/gu, "\n\n").trim();
}

function countSyllables(word) {
  const w = word.toLowerCase().replace(/[^a-z]/gu, "");
  if (!w) return 1;
  const exceptions = { people: 2, every: 2, different: 3, family: 3, business: 2, chocolate: 2, interesting: 3, probably: 3, actually: 4, comfortable: 4, queue: 1, hour: 1, our: 1, fire: 1, science: 2, create: 2, used: 1, being: 2 };
  if (exceptions[w]) return exceptions[w];
  let groups = (w.match(/[aeiouy]+/gu) || []).length;
  if (w.endsWith("e") && !w.endsWith("le") && !w.endsWith("ye") && groups > 1) groups--;
  if (w.endsWith("ed") && groups > 1 && !/[td]ed$/u.test(w)) groups--;
  if (w.endsWith("es") && groups > 1 && !/(?:ses|xes|zes|ches|shes)$/u.test(w)) groups--;
  return Math.max(1, groups);
}

function sentenceSegments(text) {
  const protectedText = text.replace(/^\u0002[^\n]*/gmu, " ").replace(/\b(?:Mr|Mrs|Ms|Dr|Prof|Sr|Jr|St|vs|etc|e\.g|i\.e)\./giu, (m) => m.replace(/\./gu, "\u0001"))
    .replace(/\b(?:p|a)\.m(?=\.)/giu, (m) => m.replace(".", "\u0001"))
    .replace(/\b(?:[A-Z]\.\s*){2,}/gu, (m) => m.replace(/\./gu, "\u0001"))
    .replace(/\b\d+\.\d+\b/gu, (m) => m.replace(".", "\u0001"));
  return protectedText.split(/(?<=[.!?])(?:[”’"')\]}»]*)\s+(?=[“‘"(\[{«]*[\p{Lu}\p{N}])/gu)
    .flatMap((s) => s.split(/\n+/u)).map((s) => s.replaceAll("\u0001", ".").trim()).filter((s) => /\p{L}/u.test(s));
}

function complexityReasons(sentence, words) {
  const reasons = [];
  if (words.length > 25) reasons.push("long sentence");
  const lower = sentence.toLowerCase();
  const clauseMarkers = [...lower.matchAll(/\b(?:although|because|if|since|unless|whereas|while|when|which|that|who|whom|whose|where|after|before|though|whether)\b/gu)];
  if (clauseMarkers.length >= 2) reasons.push("multiple dependent clauses");
  if (/\b(?:which|that|who|whom)\b[^.!?;]{0,100},[^.!?;]{0,100},/u.test(lower)) reasons.push("nested relative clause");
  if (/\b(?:is|are|was|were|be|been|being)\s+\w+(?:ed|en)\b/iu.test(sentence)) reasons.push("possible passive construction");
  return reasons;
}

export function analyze(text, options = {}) {
  if (typeof text !== "string" || !text.trim()) return { error: "No text to analyze." };
  const plain = stripMarkdown(text);
  if (!plain) return { error: "No text to analyze." };
  const words = plain.match(/[\p{L}]+(?:['’][\p{L}]+)*/gu) || [];
  if (!words.length) return { error: "No words found in the text." };
  const sentences = sentenceSegments(plain);
  const count = sentences.length;
  const syllables = words.reduce((n, w) => n + countSyllables(w), 0);
  const shortSample = words.length < (options.minWords ?? 100);
  const readingEase = count ? Math.max(0, Math.min(100, 206.835 - 1.015 * words.length / count - 84.6 * syllables / words.length)) : null;
  const normalized = words.map((w) => w.toLowerCase());
  const types = new Set(normalized);
  const exceptions = new Set((options.allowlist || []).map((w) => String(w).toLowerCase()));
  const difficultWords = [...new Set(normalized.filter((w) => RARE.has(w) && !COMMON.has(w) && !exceptions.has(w)))].map((word) => ({ word, frequency: "rare", count: normalized.filter((w) => w === word).length }));
  const sentenceDetails = sentences.map((sentence, index) => {
    const sentenceWords = sentence.match(/[\p{L}]+(?:['’][\p{L}]+)*/gu) || [];
    const reasons = complexityReasons(sentence, sentenceWords);
    return { number: index + 1, text: sentence, word_count: sentenceWords.length, reasons };
  });
  const complexSentences = sentenceDetails.filter((s) => s.reasons.length);
  const paragraphs = plain.split(/\n{2,}/u).filter((p) => p.trim());
  const totalChars = words.reduce((n, w) => n + w.length, 0);
  return {
    word_count: words.length, sentence_count: count, paragraph_count: paragraphs.length || 1,
    avg_sentence_length: round(words.length / Math.max(1, count), 1), avg_word_length: round(totalChars / words.length, 1),
    ttr: round(types.size / words.length, 3), mtld: round(mtld(normalized), 2),
    flesch_reading_ease: round(readingEase, 1), complexity_label: complexityLabel(readingEase),
    warnings: shortSample ? [`Text is short (${words.length} words; scores are more reliable at ${options.minWords ?? 100}+ words).`] : [],
    difficult_words: difficultWords,
    complex_sentences: complexSentences,
  };
}

function mtld(words, threshold = 0.72) {
  if (words.length < 50) return null;
  const one = (tokens) => { let factors = 0, types = new Set(), n = 0; for (const t of tokens) { n++; types.add(t); if (types.size / n <= threshold) { factors++; types = new Set(); n = 0; } } if (n) factors += (1 - types.size / n) / (1 - threshold); return factors ? tokens.length / factors : tokens.length; };
  return (one(words) + one([...words].reverse())) / 2;
}
function complexityLabel(score) { if (score === null) return "Unavailable"; if (score >= 70) return "Simple"; if (score >= 50) return "Moderate"; return "Complex"; }
function round(value, places) { if (value === null || value === undefined || Number.isNaN(value)) return null; const factor = 10 ** places; return Math.round(value * factor) / factor; }
