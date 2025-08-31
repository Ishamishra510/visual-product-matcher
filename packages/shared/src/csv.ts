import fs from 'node:fs';
import { parse } from 'csv-parse/sync';
import type { ProductRow } from './types';

export function readCsv(filePath: string): ProductRow[] {
  const raw = fs.readFileSync(filePath, 'utf8');
  const rows = parse(raw, {
    columns: true,
    skip_empty_lines: true,
  }) as ProductRow[];
  return rows;
}

export function firstImageUrl(field: string): string | null {
  const m = field.match(/\[(.*)\]/);
  const inner = m ? m[1] : field;
  const urlMatch = inner.match(/https?:[^'\"]+/);
  return urlMatch ? urlMatch[0] : null;
}

export function parseCategoryTree(field?: string): string[] | undefined {
  if (!field) return undefined;
  const m = field.match(/\[(.*)\]/);
  const inner = m ? m[1] : field;
  const cleaned = inner.replace(/[\[\]']/g, '').trim();
  return cleaned.split('>>').map(s => s.trim()).filter(Boolean);
}
