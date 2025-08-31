'use client';
import { useState } from 'react';

export default function Filters({ onApply }: { onApply: (t: number) => void }) {
  const [t, setT] = useState(0.45);
  return (
    <div className="flex items-center gap-3 p-3 bg-white border rounded-2xl shadow-sm">
      <label className="text-sm font-medium">Similarity ≥ {t.toFixed(2)}</label>
      <input type="range" min={0} max={1} step={0.01} value={t}
        onChange={(e: React.ChangeEvent<HTMLInputElement>)=>setT(Number(e.currentTarget.value))} className="w-64" />
      <button className="px-3 py-1.5 rounded-lg bg-neutral-900 text-white" onClick={()=>onApply(t)}>Apply</button>
    </div>
  );
}
