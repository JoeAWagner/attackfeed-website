import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <div className="font-mono text-6xl text-accent-cyan/20 font-bold mb-4">404</div>
      <h1 className="text-xl font-semibold text-text-primary mb-2">Page not found</h1>
      <p className="text-text-secondary text-sm mb-8">
        The page you&apos;re looking for doesn&apos;t exist.
      </p>
      <Link
        href="/"
        className="px-4 py-2 rounded-lg border border-accent-cyan/30 bg-accent-cyan/10 text-accent-cyan text-sm hover:bg-accent-cyan/20 transition-colors"
      >
        Return to feed →
      </Link>
    </div>
  );
}
