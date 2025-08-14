import { distance as levenshteinDistance } from 'fastest-levenshtein';

export class NameMatcher {
  private normalize(text: string) {
    return text.toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ').trim();
  }
  private exactMatch(a: string, b: string) { return a === b ? 100 : 0; }
  private fuzzyMatch(a: string, b: string) {
    const m = Math.max(a.length, b.length); if (m === 0) return 100;
    const d = levenshteinDistance(a, b); return Math.round(((m - d) / m) * 100);
  }
  private tokenMatch(a: string, b: string) {
    const A = new Set(a.split(' ')), B = new Set(b.split(' '));
    if (!A.size && !B.size) return 100;
    const inter = new Set([...A].filter(x => B.has(x)));
    const uni = new Set([...A, ...B]);
    return Math.round((inter.size / uni.size) * 100);
  }
  async match(input: string, target: string) {
    const i = this.normalize(input), t = this.normalize(target);
    const exact = this.exactMatch(i, t); if (exact === 100) return 100;
    const fuzzy = this.fuzzyMatch(i, t), token = this.tokenMatch(i, t);
    return Math.round(fuzzy * 0.7 + token * 0.3);
  }
}
export const nameMatcher = new NameMatcher();
