import Link from 'next/link';
import { GitframeLogo } from '@/components/GitframeLogo';
import { ArrowLeft, Sparkles } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 px-4 text-center text-zinc-100">
      <div className="flex flex-col items-center max-w-md gap-6">
        <Link href="/" className="flex items-center gap-2.5 group">
          <GitframeLogo className="w-10 h-10 transition-transform group-hover:scale-105" />
          <span className="font-bold text-xl tracking-tight text-white">Gitframe</span>
        </Link>

        <div className="flex flex-col gap-2">
          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2.5 py-1 rounded-full self-center">
            404 Error
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Page not found
          </h1>
          <p className="text-sm text-zinc-400 leading-relaxed">
            The page or repository preview you are looking for does not exist, was renamed, or has
            moved.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link
            href="/"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-xs font-semibold text-zinc-200 hover:text-white transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>
          <Link
            href="/studio"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white shadow-md shadow-blue-600/20 transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Open Studio</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
