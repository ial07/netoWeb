import { Suspense } from "react";
import { notFound } from "next/navigation";
import Image from "next/image";
import { getProductBySlug } from "@/services/product-service";
import Badge from "@/components/ui/badge";
import LoadingSpinner from "@/components/ui/loading-spinner";
import AddToCartButton from "@/components/products/add-to-cart-button";
import type { Metadata } from "next";
import type { Product } from "@/types";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return { title: "Product Not Found" };
  }

  return {
    title: product.name,
    description: product.description,
    openGraph: {
      title: product.name,
      description: product.description,
      images: product.image_url ? [{ url: product.image_url }] : [],
      type: "website",
    },
  };
}

function ProductJsonLd({ product }: { product: Product }) {
  const hasDiscount =
    product.discount_percentage !== null && product.discount_percentage > 0;
  const price = hasDiscount
    ? product.price * (1 - product.discount_percentage! / 100)
    : product.price;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.image_url,
    offers: {
      "@type": "Offer",
      price: price.toFixed(2),
      priceCurrency: "USD",
      availability:
        product.stock > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

async function ProductDetail({ slug }: { slug: string }) {
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const isPremium = product.price > 500;
  const isOutOfStock = product.stock === 0;
  const isLowStock = product.stock > 0 && product.stock < 5;
  const hasDiscount =
    product.discount_percentage !== null && product.discount_percentage > 0;
  const discountedPrice = hasDiscount
    ? product.price * (1 - product.discount_percentage! / 100)
    : null;

  return (
    <>
      <ProductJsonLd product={product} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Image Section */}
        <div className="relative aspect-square rounded-2xl overflow-hidden bg-surface-light border border-border/50">
          <Image
            src={product.image_url || "/placeholder.png"}
            alt={product.name}
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
            priority
          />

          {/* Badges */}
          <div className="absolute top-4 left-4 flex flex-col gap-2">
            {isPremium && <Badge variant="premium">⭐ Premium</Badge>}
            {hasDiscount && (
              <Badge variant="sale">-{product.discount_percentage}% OFF</Badge>
            )}
          </div>
        </div>

        {/* Details Section */}
        <div className="flex flex-col">
          {/* Category */}
          <p className="text-sm text-primary font-medium uppercase tracking-wider mb-2">
            {product.category}
          </p>

          {/* Name */}
          <h1 className="text-2xl md:text-3xl font-bold text-text-primary mb-4">
            {product.name}
          </h1>

          {/* Price */}
          <div className="flex items-baseline gap-3 mb-6">
            {hasDiscount ? (
              <>
                <span className="text-3xl font-bold text-text-primary">
                  ${discountedPrice!.toFixed(2)}
                </span>
                <span className="text-xl text-text-muted line-through">
                  ${product.price.toFixed(2)}
                </span>
                <Badge variant="sale">
                  Save ${(product.price - discountedPrice!).toFixed(2)}
                </Badge>
              </>
            ) : (
              <span className="text-3xl font-bold text-text-primary">
                ${product.price.toFixed(2)}
              </span>
            )}
          </div>

          {/* Stock Status */}
          <div className="mb-6">
            {isOutOfStock ? (
              <Badge variant="out-of-stock">Out of Stock</Badge>
            ) : isLowStock ? (
              <Badge variant="low-stock">
                ⚠ Low Stock — Only {product.stock} left
              </Badge>
            ) : (
              <Badge variant="in-stock">
                ✓ In Stock ({product.stock} available)
              </Badge>
            )}
          </div>

          {/* Description */}
          <div className="mb-8">
            <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-2">
              Description
            </h2>
            <p className="text-text-secondary leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Pricing Info */}
          <div className="glass rounded-xl p-4 mb-6 space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-3">
              Pricing Benefits
            </h3>
            <div className="flex items-center gap-2 text-sm text-text-secondary">
              <span className="text-success">✓</span>
              <span>
                Buy 3+ items and get{" "}
                <strong className="text-primary-light">
                  10% bulk discount
                </strong>
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-text-secondary">
              <span className="text-success">✓</span>
              <span>
                Sign in for an extra{" "}
                <strong className="text-primary-light">
                  5% member discount
                </strong>
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-text-secondary">
              <span className="text-success">✓</span>
              <span>
                Orders over $1,000 get{" "}
                <strong className="text-primary-light">free shipping</strong>
              </span>
            </div>
          </div>

          {/* Add to Cart */}
          <AddToCartButton product={product} disabled={isOutOfStock} />
        </div>
      </div>
    </>
  );
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <Suspense fallback={<LoadingSpinner size="lg" />}>
        <ProductDetail slug={slug} />
      </Suspense>
    </div>
  );
}
