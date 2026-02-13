import { Suspense } from "react";
import { getProducts } from "@/services/product-service";
import { getCategories } from "@/services/product-service";
import ProductGrid from "@/components/products/product-grid";
import ProductFilters from "@/components/products/product-filters";
import EmptyState from "@/components/ui/empty-state";
import LoadingSpinner from "@/components/ui/loading-spinner";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shop All Products",
  description:
    "Browse our curated collection of premium tech products, furniture, and accessories with exclusive member discounts.",
};

interface HomePageProps {
  searchParams: Promise<{
    category?: string;
    sort?: string;
    search?: string;
    page?: string;
  }>;
}

async function ProductsSection({
  searchParams,
}: {
  searchParams: {
    category?: string;
    sort?: string;
    search?: string;
    page?: string;
  };
}) {
  const categories = await getCategories();
  const filters = {
    category: searchParams.category,
    search: searchParams.search,
    sort: searchParams.sort as
      | "price_asc"
      | "price_desc"
      | "newest"
      | "name_asc"
      | undefined,
    page: parseInt(searchParams.page || "1", 10),
    limit: 12,
  };

  const { data: products, totalPages, page } = await getProducts(filters);

  return (
    <div className="space-y-8">
      <ProductFilters
        categories={categories}
        currentCategory={searchParams.category}
        currentSort={searchParams.sort}
        currentSearch={searchParams.search}
      />

      {products.length === 0 ? (
        <EmptyState
          title="No products found"
          description="Try adjusting your filters or search term to find what you're looking for."
          icon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="h-8 w-8"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
              />
            </svg>
          }
        />
      ) : (
        <>
          <ProductGrid products={products} />

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              {page > 1 && (
                <Link
                  href={`?${new URLSearchParams({
                    ...(searchParams.category && {
                      category: searchParams.category,
                    }),
                    ...(searchParams.sort && { sort: searchParams.sort }),
                    ...(searchParams.search && {
                      search: searchParams.search,
                    }),
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
                  href={`?${new URLSearchParams({
                    ...(searchParams.category && {
                      category: searchParams.category,
                    }),
                    ...(searchParams.sort && { sort: searchParams.sort }),
                    ...(searchParams.search && {
                      search: searchParams.search,
                    }),
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

export default async function HomePage({ searchParams }: HomePageProps) {
  const resolvedParams = await searchParams;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero section */}
      <div className="mb-10">
        <h1 className="text-3xl md:text-4xl font-bold gradient-text mb-3">
          Discover Premium Products
        </h1>
        <p className="text-text-secondary max-w-2xl">
          Shop our curated collection with{" "}
          <span className="text-primary-light font-medium">
            exclusive member discounts
          </span>
          , bulk pricing, and free shipping on orders over $1,000.
        </p>
      </div>

      <Suspense fallback={<LoadingSpinner size="lg" />}>
        <ProductsSection searchParams={resolvedParams} />
      </Suspense>
    </div>
  );
}
