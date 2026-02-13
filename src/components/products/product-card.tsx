import Link from "next/link";
import Image from "next/image";
import Badge from "@/components/ui/badge";
import type { Product } from "@/types";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const isPremium = product.price > 500;
  const isOutOfStock = product.stock === 0;
  const isLowStock = product.stock > 0 && product.stock < 5;
  const hasDiscount =
    product.discount_percentage !== null && product.discount_percentage > 0;
  const discountedPrice = hasDiscount
    ? product.price * (1 - product.discount_percentage! / 100)
    : null;

  return (
    <Link href={`/product/${product.slug}`} className="group">
      <div className="card-hover rounded-2xl bg-surface-light border border-border/50 overflow-hidden">
        {/* Image */}
        <div className="relative aspect-square overflow-hidden bg-surface-lighter">
          <Image
            src={product.image_url || "/placeholder.png"}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />

          {/* Badges overlay */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {isPremium && <Badge variant="premium">⭐ Premium</Badge>}
            {hasDiscount && (
              <Badge variant="sale">-{product.discount_percentage}%</Badge>
            )}
          </div>

          {/* Stock Badge */}
          <div className="absolute top-3 right-3">
            {isOutOfStock && <Badge variant="out-of-stock">Out of Stock</Badge>}
            {isLowStock && (
              <Badge variant="low-stock">Only {product.stock} left</Badge>
            )}
          </div>
        </div>

        {/* Details */}
        <div className="p-4">
          <p className="text-xs text-primary font-medium uppercase tracking-wider mb-1">
            {product.category}
          </p>
          <h3 className="text-sm font-semibold text-text-primary group-hover:text-primary-light transition-colors line-clamp-2 mb-2">
            {product.name}
          </h3>

          <div className="flex items-center gap-2">
            {hasDiscount ? (
              <>
                <span className="text-lg font-bold text-text-primary">
                  ${discountedPrice!.toFixed(2)}
                </span>
                <span className="text-sm text-text-muted line-through">
                  ${product.price.toFixed(2)}
                </span>
              </>
            ) : (
              <span className="text-lg font-bold text-text-primary">
                ${product.price.toFixed(2)}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
