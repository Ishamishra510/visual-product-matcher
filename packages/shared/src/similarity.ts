export function cosine(a: number[], b: number[]): number {
  const n = Math.min(a.length, b.length);
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < n; i++) {
    const x = a[i];
    const y = b[i];
    dot += x * y; na += x * x; nb += y * y;
  }
  if (na === 0 || nb === 0) return 0;
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

export function topK<T extends { embedding: number[] }>(
  query: number[],
  items: T[],
  k = 30
) {
  return items
    .map((it) => ({ item: it, score: cosine(query, it.embedding) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, k);
}
