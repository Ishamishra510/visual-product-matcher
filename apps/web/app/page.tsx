'use client';
import { useState } from 'react';
import Uploader from '../components/Uploader';
import Filters from '../components/Filters';

export default function Page() {
  const [threshold, setThreshold] = useState(0.45);
  const [caption, setCaption] = useState('');
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  async function runSearch(fd: FormData) {
    setLoading(true);
    fd.set('threshold', String(threshold));
    const res = await fetch('/api/search', { method: 'POST', body: fd });
    const json = await res.json();
    setLoading(false);

    if (json.quotaExceeded) {
      alert('⚠️ API quota hit. Please type a short description in the Manual Description box and click Search again.');
      return;
    }
    if (json.error) {
      alert(json.error);
      return;
    }

    setCaption(json.caption);
    setItems(json.results);
  }

  return (
    <main className="grid gap-4">
      <Uploader onSearch={runSearch} />
      <Filters onApply={setThreshold} />

      {loading && <div className="p-3 text-sm">Searching…</div>}

      {caption && (
        <div className="p-3 text-sm text-neutral-700 bg-neutral-100 rounded-xl">
          <span className="font-semibold">Query caption:</span> {caption}
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {items.map((p) => (
          <a key={p.id} href={p.url} target="_blank" className="group block border rounded-2xl overflow-hidden bg-white shadow-sm">
            <div className="aspect-square bg-neutral-100 overflow-hidden">
              <img src={p.imageUrl} alt={p.name} className="w-full h-full object-contain transition-transform group-hover:scale-[1.02]" />
            </div>
            <div className="p-3 grid gap-1">
              <div className="text-sm font-medium line-clamp-2">{p.name}</div>
              {p.brand && <div className="text-xs text-neutral-600">{p.brand}</div>}
              <div className="text-xs text-neutral-500">Score: {p.score.toFixed(3)}</div>
            </div>
          </a>
        ))}
      </div>
    </main>
  );
}
