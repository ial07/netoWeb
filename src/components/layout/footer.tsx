import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-border/50 bg-surface-light/50 mt-auto">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-secondary">
                <span className="text-xs font-bold text-white">N</span>
              </div>
              <span className="text-lg font-bold gradient-text">NetoStore</span>
            </div>
            <p className="text-sm text-text-muted leading-relaxed">
              A mini e-commerce platform demonstrating Neto-style template
              customization with modern web technologies.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-text-primary mb-4 uppercase tracking-wider">
              Shop
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/"
                  className="text-sm text-text-muted hover:text-text-primary transition-colors"
                >
                  All Products
                </Link>
              </li>
              <li>
                <Link
                  href="/category/electronics"
                  className="text-sm text-text-muted hover:text-text-primary transition-colors"
                >
                  Electronics
                </Link>
              </li>
              <li>
                <Link
                  href="/category/furniture"
                  className="text-sm text-text-muted hover:text-text-primary transition-colors"
                >
                  Furniture
                </Link>
              </li>
              <li>
                <Link
                  href="/category/accessories"
                  className="text-sm text-text-muted hover:text-text-primary transition-colors"
                >
                  Accessories
                </Link>
              </li>
            </ul>
          </div>

          {/* Account */}
          <div>
            <h3 className="text-sm font-semibold text-text-primary mb-4 uppercase tracking-wider">
              Account
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/login"
                  className="text-sm text-text-muted hover:text-text-primary transition-colors"
                >
                  Sign In
                </Link>
              </li>
              <li>
                <Link
                  href="/signup"
                  className="text-sm text-text-muted hover:text-text-primary transition-colors"
                >
                  Create Account
                </Link>
              </li>
              <li>
                <Link
                  href="/cart"
                  className="text-sm text-text-muted hover:text-text-primary transition-colors"
                >
                  Shopping Cart
                </Link>
              </li>
            </ul>
          </div>

          {/* Info */}
          <div>
            <h3 className="text-sm font-semibold text-text-primary mb-4 uppercase tracking-wider">
              About
            </h3>
            <ul className="space-y-2">
              <li>
                <span className="text-sm text-text-muted">
                  Built with Next.js, Supabase & TailwindCSS
                </span>
              </li>
              <li>
                <span className="text-sm text-text-muted">
                  Neto Template Simulation
                </span>
              </li>
              <li>
                <span className="text-sm text-text-muted">
                  Open Source Demo Project
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-border/50 text-center">
          <p className="text-sm text-text-muted">
            © {new Date().getFullYear()} NetoStore. A demonstration project for
            Neto-style e-commerce template customization.
          </p>
        </div>
      </div>
    </footer>
  );
}
