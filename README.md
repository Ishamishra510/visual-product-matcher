# Visual Product Matcher (Gemini)

Find visually similar products using the Gemini API.
Algorithm: image ➜ Gemini caption ➜ text embeddings (gemini-embedding-001) ➜ cosine similarity.

## Monorepo structure
```
visual-product-matcher/
├─ package.json
├─ tsconfig.base.json
├─ .env.example
├─ data/
│  └─ products.csv
├─ packages/
│  └─ shared/...
├─ services/
│  └─ ingest/
└─ apps/
   └─ web/
```

## Local setup
1. Copy CSV to `data/products.csv`.
2. `cp .env.example .env` and set `GEMINI_API_KEY`.
3. `npm i`
4. `npm run ingest`
5. `npm run dev` (http://localhost:3000)
