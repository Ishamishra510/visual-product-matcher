import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import products from '../../../public/data/products.json';

export const runtime = 'nodejs';

function cosine(a: number[], b: number[]) {
  const n = Math.min(a.length, b.length);
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < n; i++) { const x = a[i], y = b[i]; dot += x*y; na += x*x; nb += y*y; }
  if (!na || !nb) return 0; return dot / (Math.sqrt(na)*Math.sqrt(nb));
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

async function embedFromImageBytes(bytes: Buffer, mime: string): Promise<{ caption: string; embedding: number[] }> {
  const resp = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: [{ role: 'user', parts: [
      { text: 'Describe this product for visual similarity search in 1-2 sentences. Include brand cues if visible, dominant colors, material, pattern, shape/style, and any notable attributes. Then list 5-8 comma-separated tags.' },
      { inlineData: { data: bytes.toString('base64'), mimeType: mime } },
    ]}]
  });
  const caption = (resp.text || '').trim();
  const emb = await ai.models.embedContent({ model: 'gemini-embedding-001', contents: caption, taskType: 'SEMANTIC_SIMILARITY' });
  const values = (emb as any).embedding?.values || (emb as any).embeddings?.[0]?.values || [];
  const embedding = (values as number[]).map(Number);
  return { caption, embedding };
}

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const threshold = Number(form.get('threshold') || '0.4');
    const topK = Math.min(Number(form.get('topK') || '30'), 60);

    let bytes: Buffer | null = null; let mime = 'image/jpeg';

    const file = form.get('file') as File | null;
    const url = (form.get('url') as string | null)?.trim();
    if (file && file.size > 0) {
      const arr = await file.arrayBuffer(); bytes = Buffer.from(arr); mime = file.type || 'image/jpeg';
    } else if (url) {
      const r = await fetch(url); if (!r.ok) throw new Error('Could not fetch image URL');
      const ct = r.headers.get('content-type') || 'image/jpeg'; mime = ct.split(';')[0];
      bytes = Buffer.from(await r.arrayBuffer());
    } else {
      return NextResponse.json({ error: 'Provide a file or url' }, { status: 400 });
    }

    const { caption, embedding } = await embedFromImageBytes(bytes!, mime);

    const scored = (products as any[]).map(p => ({ ...p, score: cosine(embedding, p.embedding as number[]) }))
      .filter(p => p.score >= threshold)
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);

    return NextResponse.json({ caption, results: scored });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Search failed' }, { status: 500 });
  }
}
