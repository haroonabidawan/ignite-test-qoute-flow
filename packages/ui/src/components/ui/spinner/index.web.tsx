"use client";

import React from "react";
import { tva } from "@gluestack-ui/utils/nativewind-utils";
import type { VariantProps } from "@gluestack-ui/utils/nativewind-utils";

const spinnerStyle = tva({
  base: "inline-block animate-spin rounded-full border-2 border-current border-t-transparent",
  variants: {
    size: {
      small: "h-4 w-4",
      large: "h-8 w-8",
    },
  },
  defaultVariants: {
    size: "small",
  },
});

type SpinnerProps = React.ComponentPropsWithoutRef<"span"> &
  VariantProps<typeof spinnerStyle> & {
    color?: string;
  };

const Spinner = React.forwardRef<HTMLSpanElement, SpinnerProps>(function Spinner(
  { className, size = "small", color, ...props },
  ref
) {
  return (
    <span
      ref={ref}
      role="status"
      aria-label="loading"
      className={spinnerStyle({ size, class: className })}
      style={color ? { color } : undefined}
      {...props}
    />
  );
});

Spinner.displayName = "Spinner";

export { Spinner };
