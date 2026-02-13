"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState, useTransition } from "react";

interface ProductFiltersProps {
  categories: string[];
  currentCategory?: string;
  currentSort?: string;
  currentSearch?: string;
}

export default function ProductFilters({
  categories,
  currentCategory,
  currentSort,
  currentSearch,
}: ProductFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [searchValue, setSearchValue] = useState(currentSearch || "");

  const updateFilters = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value && value !== "all") {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      // Reset to page 1 on filter change
      params.delete("page");
      startTransition(() => {
        router.push(`?${params.toString()}`);
      });
    },
    [router, searchParams],
  );

  const handleSearch = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      updateFilters("search", searchValue);
    },
    [searchValue, updateFilters],
  );

  return (
    <div className={`space-y-4 ${isPending ? "opacity-60" : ""}`}>
      {/* Search */}
      <form onSubmit={handleSearch} className="relative">
        <input
          type="text"
          placeholder="Search products..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          className="w-full h-11 pl-10 pr-4 rounded-xl bg-surface-light border border-border/50 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
        />
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
          />
        </svg>
        {searchValue && (
          <button
            type="button"
            onClick={() => {
              setSearchValue("");
              updateFilters("search", "");
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="h-4 w-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18 18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </form>

      <div className="flex flex-col sm:flex-row gap-3">
        {/* Category Filter */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => updateFilters("category", "all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              !currentCategory || currentCategory === "all"
                ? "bg-primary text-white"
                : "bg-surface-light text-text-secondary hover:bg-surface-lighter"
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => updateFilters("category", cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${
                currentCategory === cat
                  ? "bg-primary text-white"
                  : "bg-surface-light text-text-secondary hover:bg-surface-lighter"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Sort */}
        <select
          value={currentSort || "newest"}
          onChange={(e) => updateFilters("sort", e.target.value)}
          className="h-8 px-3 rounded-lg bg-surface-light border border-border/50 text-xs text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer ml-auto"
        >
          <option value="newest">Newest First</option>
          <option value="price_asc">Price: Low → High</option>
          <option value="price_desc">Price: High → Low</option>
          <option value="name_asc">Name: A → Z</option>
        </select>
      </div>
    </div>
  );
}
