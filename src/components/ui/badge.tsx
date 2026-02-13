interface BadgeProps {
  variant: "premium" | "sale" | "low-stock" | "out-of-stock" | "in-stock";
  children: React.ReactNode;
  className?: string;
}

const variantStyles: Record<BadgeProps["variant"], string> = {
  premium: "bg-gradient-to-r from-amber-500 to-orange-500 text-white",
  sale: "bg-gradient-to-r from-pink-500 to-rose-500 text-white",
  "low-stock": "bg-warning/20 text-warning border border-warning/30",
  "out-of-stock": "bg-danger/20 text-danger border border-danger/30",
  "in-stock": "bg-success/20 text-success border border-success/30",
};

export default function Badge({
  variant,
  children,
  className = "",
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
