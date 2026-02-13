import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
      <div className="text-6xl font-bold gradient-text mb-4">404</div>
      <h1 className="text-xl font-semibold text-text-primary mb-2">
        Page Not Found
      </h1>
      <p className="text-sm text-text-muted mb-6 max-w-md">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link
        href="/"
        className="h-10 px-6 inline-flex items-center rounded-xl bg-gradient-to-r from-primary to-primary-dark text-white text-sm font-medium hover:opacity-90 transition-opacity"
      >
        ← Back to Store
      </Link>
    </div>
  );
}
