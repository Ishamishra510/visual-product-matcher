// Load .env from the repo root BEFORE importing modules that read process.env
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ../../../.env from services/ingest/src/index.ts -> back to repo root
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

// Now import modules that use process.env *after* dotenv.config:
const { readCsv, firstImageUrl, parseCategoryTree } = await import('shared/csv');
const { bytesFromUrl, describeImageForSearch, embedText } = await import('shared/gemini');

import fs from 'node:fs';
import type { IndexedProduct, ProductRow } from 'shared/types';

// Resolve paths from the repo root
const ROOT = path.resolve(__dirname, '../../../');
const CSV_PATH = path.join(ROOT, 'data', 'products.csv');
const OUT_DIR = path.join(ROOT, 'apps', 'web', 'public', 'data');
const OUT_FILE = path.join(OUT_DIR, 'products.json');

const LIMIT = Number(process.env.INDEX_LIMIT || '200');
const SKIP_ON_IMAGE_FETCH_ERROR = (process.env.SKIP_ON_IMAGE_FETCH_ERROR || 'true') === 'true';

async function rowToIndexed(row: ProductRow): Promise<IndexedProduct | null> {
  const imageUrl = firstImageUrl(row.image);
  if (!imageUrl) return null;

  const bytes = await bytesFromUrl(imageUrl);
  if (!bytes) {
    if (SKIP_ON_IMAGE_FETCH_ERROR) return null;
  }

  const caption = bytes ? await describeImageForSearch(bytes.bytes, bytes.mime) : '';

  const metaText = [
    row.product_name,
    row.brand,
    (parseCategoryTree(row.product_category_tree) || []).join(' '),
    row.description,
    caption,
  ]
    .filter(Boolean)
    .join('\n');

  const embedding = await embedText(metaText, 'SEMANTIC_SIMILARITY');

  const priceNum = row.discounted_price
    ? Number(row.discounted_price)
    : row.retail_price
      ? Number(row.retail_price)
      : null;

  const indexed: IndexedProduct = {
    id:
      row.pid ||
      Buffer.from((row.product_url || row.product_name).slice(0, 64)).toString('base64url'),
    url: row.product_url,
    imageUrl: imageUrl,
    name: row.product_name,
    brand: row.brand,
    categoryPath: parseCategoryTree(row.product_category_tree),
    price: priceNum,
    discountedPrice: row.discounted_price ? Number(row.discounted_price) : null,
    rating: row.product_rating ? Number(row.product_rating) : null,
    overallRating: row.overall_rating ? Number(row.overall_rating) : null,
    description: row.description,
    caption,
    embedding,
  };
  return indexed;
}

async function main() {
  const rows = readCsv(CSV_PATH);
  const picked = rows
    .filter((r) => r.image && r.product_name && r.product_url)
    .slice(0, LIMIT);

  fs.mkdirSync(OUT_DIR, { recursive: true });

  const results: IndexedProduct[] = [];
  let i = 0;

  for (const row of picked) {
    i++;
    try {
      const item = await rowToIndexed(row);
      if (item) results.push(item);
      process.stdout.write(`\rIndexed ${results.length}/${i}/${picked.length}`);
    } catch (e) {
      console.error('\nRow failed:', row.pid || row.product_name, e);
    }
  }

  if (results.length < 50) {
    console.warn(`\nWARNING: Only ${results.length} products indexed. Increase INDEX_LIMIT or check CSV.`);
  }

  fs.writeFileSync(OUT_FILE, JSON.stringify(results, null, 2));
  console.log(`\nWrote ${results.length} products → ${OUT_FILE}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
