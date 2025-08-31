import { GoogleGenAI } from '@google/genai';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
if (!GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY is missing. Add it to your .env');
}

export const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

export async function bytesFromUrl(url: string): Promise<{ bytes: Buffer; mime: string } | null> {
  const res = await fetch(url);
  if (!res.ok) return null;
  const ct = res.headers.get('content-type') || 'image/jpeg';
  const buf = Buffer.from(await res.arrayBuffer());
  return { bytes: buf, mime: ct.split(';')[0] };
}

export async function describeImageForSearch(bytes: Buffer, mime: string): Promise<string> {
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: [
      {
        role: 'user',
        parts: [
          { text: 'Describe this product for visual similarity search in 1-2 sentences. Include brand cues if visible, dominant colors, material, pattern, shape/style, and any notable attributes. Then list 5-8 comma-separated tags.' },
          { inlineData: { data: bytes.toString('base64'), mimeType: mime } },
        ],
      },
    ],
  });
  return (response.text || '').trim();
}

export async function embedText(text: string, taskType: 'SEMANTIC_SIMILARITY' | 'RETRIEVAL_DOCUMENT' | 'RETRIEVAL_QUERY' = 'SEMANTIC_SIMILARITY'): Promise<number[]> {
  const resp = await ai.models.embedContent({
    model: 'gemini-embedding-001',
    contents: text,
    taskType,
  });
  const values = (resp as any).embedding?.values || (resp as any).embeddings?.[0]?.values || [];
  return (values as number[]).map(Number);
}
