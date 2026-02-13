import { Suspense } from "react";
import { getProducts, getCategories } from "@/services/product-service";
import ProductGrid from "@/components/products/product-grid";
import ProductFilters from "@/components/products/product-filters";
import EmptyState from "@/components/ui/empty-state";
import LoadingSpinner from "@/components/ui/loading-spinner";
import Link from "next/link";
import type { Metadata } from "next";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{
    sort?: string;
    search?: string;
    page?: string;
  }>;
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const categoryName = slug.charAt(0).toUpperCase() + slug.slice(1);

  return {
    title: `${categoryName} Products`,
    description: `Browse our ${categoryName.toLowerCase()} collection — premium products with member discounts and free shipping on orders over $1,000.`,
  };
}

async function CategoryProducts({
  category,
  searchParams,
}: {
  category: string;
  searchParams: { sort?: string; search?: string; page?: string };
}) {
  const categories = await getCategories();
  const {
    data: products,
    totalPages,
    page,
  } = await getProducts({
    category,
    sort: searchParams.sort as
      | "price_asc"
      | "price_desc"
      | "newest"
      | "name_asc"
      | undefined,
    search: searchParams.search,
    page: parseInt(searchParams.page || "1", 10),
    limit: 12,
  });

  return (
    <div className="space-y-8">
      <ProductFilters
        categories={categories}
        currentCategory={category}
        currentSort={searchParams.sort}
        currentSearch={searchParams.search}
      />

      {products.length === 0 ? (
        <EmptyState
          title="No products found"
          description="There are no products in this category yet."
          action={
            <Link
              href="/"
              className="px-6 py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary-dark transition-colors"
            >
              Browse All Products
            </Link>
          }
        />
      ) : (
        <>
          <ProductGrid products={products} />

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              {page > 1 && (
                <Link
                  href={`/category/${category}?${new URLSearchParams({
                    ...(searchParams.sort && { sort: searchParams.sort }),
                    ...(searchParams.search && { search: searchParams.search }),
                    page: String(page - 1),
                  }).toString()}`}
                  className="h-9 px-4 inline-flex items-center rounded-lg bg-surface-light text-sm text-text-secondary hover:bg-surface-lighter transition-colors"
                >
                  ← Previous
                </Link>
              )}
              <span className="text-sm text-text-muted px-4">
                Page {page} of {totalPages}
              </span>
              {page < totalPages && (
                <Link
                  href={`/category/${category}?${new URLSearchParams({
                    ...(searchParams.sort && { sort: searchParams.sort }),
                    ...(searchParams.search && { search: searchParams.search }),
                    page: String(page + 1),
                  }).toString()}`}
                  className="h-9 px-4 inline-flex items-center rounded-lg bg-surface-light text-sm text-text-secondary hover:bg-surface-lighter transition-colors"
                >
                  Next →
                </Link>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default async function CategoryPage({
  params,
  searchParams,
}: CategoryPageProps) {
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;
  const categoryName = slug.charAt(0).toUpperCase() + slug.slice(1);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <nav className="text-sm text-text-muted mb-2">
          <Link href="/" className="hover:text-text-primary transition-colors">
            Home
          </Link>
          <span className="mx-2">/</span>
          <span className="text-text-secondary">{categoryName}</span>
        </nav>
        <h1 className="text-2xl md:text-3xl font-bold gradient-text">
          {categoryName}
        </h1>
      </div>

      <Suspense fallback={<LoadingSpinner size="lg" />}>
        <CategoryProducts category={slug} searchParams={resolvedSearchParams} />
      </Suspense>
    </div>
  );
}
