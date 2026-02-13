import Link from "next/link";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      {/* Admin Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <nav className="text-sm text-text-muted mb-1">
            <Link
              href="/"
              className="hover:text-text-primary transition-colors"
            >
              Store
            </Link>
            <span className="mx-2">/</span>
            <span className="text-text-secondary">Admin</span>
          </nav>
          <h1 className="text-2xl font-bold gradient-text">Admin Panel</h1>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/products"
            className="h-9 px-4 inline-flex items-center rounded-lg bg-surface-light text-sm font-medium text-text-secondary hover:bg-surface-lighter transition-colors"
          >
            Products
          </Link>
          <Link
            href="/"
            className="h-9 px-4 inline-flex items-center rounded-lg bg-surface-light text-sm font-medium text-text-secondary hover:bg-surface-lighter transition-colors"
          >
            ← Back to Store
          </Link>
        </div>
      </div>

      {children}
    </div>
  );
}
