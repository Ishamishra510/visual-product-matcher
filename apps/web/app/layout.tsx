import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Visual Product Matcher',
  description: 'Find visually similar products powered by Gemini',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        <div className="max-w-5xl mx-auto p-4 sm:p-6">
          <header className="py-4 sm:py-6">
            <h1 className="text-2xl sm:text-3xl font-bold">Visual Product Matcher</h1>
            <p className="text-sm text-neutral-600">Upload an image or paste a URL, then filter by similarity.</p>
          </header>
          {children}
        </div>
      </body>
    </html>
  );
}
