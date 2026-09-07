import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center px-4">
        <p className="font-playfair text-6xl font-light text-gray-200 mb-4">404</p>
        <p className="text-gray-400 uppercase tracking-[0.3em] text-[11px] mb-2">
          Page not found
        </p>
        <p className="text-sm text-gray-500 mb-8">
          The story you are looking for doesn't exist or has been moved.
        </p>
        <Link
          href="/"
          className="inline-block text-[11px] uppercase tracking-[0.2em] text-[#1e3a8a] hover:text-black transition-colors"
        >
          ← Back to Home
        </Link>
      </div>
    </main>
  );
}