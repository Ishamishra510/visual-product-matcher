'use client';
import { useState } from 'react';

export default function Uploader({ onSearch }: { onSearch: (fd: FormData) => Promise<void> }) {
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState('');
  const [manual, setManual] = useState(''); // NEW
  const [preview, setPreview] = useState<string | null>(null);

  return (
    <div className="grid gap-3 p-4 border rounded-2xl bg-white shadow-sm">
      <div className="grid gap-2 sm:grid-cols-2">
        <div>
          <label className="text-sm font-medium">Upload image</label>
          <input type="file" accept="image/*" onChange={(e) => {
            const f = e.target.files?.[0] || null;
            setFile(f);
            setPreview(f ? URL.createObjectURL(f) : null);
          }} />
        </div>
        <div>
          <label className="text-sm font-medium">...or paste image URL</label>
          <input className="border rounded-md px-3 py-2" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://..." />
        </div>
      </div>

      <div>
        <label className="text-sm font-medium">Manual description (used if quota exceeded)</label>
        <input className="border rounded-md px-3 py-2 w-full"
          value={manual}
          onChange={(e) => setManual(e.target.value)}
          placeholder="e.g., black leather backpack, gold zippers" />
      </div>

      {preview && (
        <div className="mt-2">
          <img src={preview} alt="preview" className="w-full max-h-64 object-contain rounded-xl border" />
        </div>
      )}

      <button className="justify-self-start px-4 py-2 bg-black text-white rounded-xl"
        onClick={async () => {
          const fd = new FormData();
          if (file) fd.append('file', file);
          if (url) fd.append('url', url);
          if (manual) fd.append('manual', manual); // send manual text
          fd.append('threshold', '0.45');
          fd.append('topK', '30');
          await onSearch(fd);
        }}>
        Search similar
      </button>
    </div>
  );
}
