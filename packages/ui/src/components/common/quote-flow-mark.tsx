"use client";

const sizes = {
  sm: "h-8 w-8 rounded-lg",
  md: "h-10 w-10 rounded-xl",
  lg: "h-12 w-12 rounded-xl",
  xl: "h-24 w-24 rounded-2xl",
} as const;

export function QuoteFlowMark({
  size = "md",
  className = "",
}: {
  size?: keyof typeof sizes;
  className?: string;
}) {
  return (
    <img
      src="/icons/quoteflow.svg"
      alt=""
      aria-hidden
      width={size === "xl" ? 96 : size === "lg" ? 48 : size === "md" ? 40 : 32}
      height={size === "xl" ? 96 : size === "lg" ? 48 : size === "md" ? 40 : 32}
      className={`shrink-0 ${sizes[size]} ${className}`}
    />
  );
}
