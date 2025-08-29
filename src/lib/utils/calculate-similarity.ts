export const calculateSimilarity = (str1: string, str2: string): number => {
  const s1 = str1.toLowerCase();
  const s2 = str2.toLowerCase();

  if (s1 === s2) return 1;

  if (s1.includes(s2) || s2.includes(s1)) return 0.8;

  const words1 = s1.split(/\s+/);
  const words2 = s2.split(/\s+/);
  const commonWords = words1.filter((word) =>
    words2.some((w) => w.includes(word) || word.includes(w))
  );

  if (commonWords.length > 0) {
    return 0.6 * (commonWords.length / Math.max(words1.length, words2.length));
  }

  return 0;
};
