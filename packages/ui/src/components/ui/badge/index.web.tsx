"use client";

import React, { createContext, useContext } from "react";
import { tva } from "@gluestack-ui/utils/nativewind-utils";
import type { VariantProps } from "@gluestack-ui/utils/nativewind-utils";

type BadgeVariant = "default" | "secondary" | "destructive" | "outline";

const badgeStyle = tva({
  base: "inline-flex flex-row items-center justify-center rounded-sm px-2 py-0.5",
  variants: {
    variant: {
      default: "bg-primary",
      secondary: "bg-secondary",
      destructive: "bg-destructive dark:bg-destructive/60",
      outline: "border border-border dark:border-border/90 bg-transparent",
    },
  },
});

const badgeTextStyle = tva({
  base: "text-xs font-medium tracking-normal uppercase",
  parentVariants: {
    variant: {
      default: "text-primary-foreground",
      secondary: "text-secondary-foreground",
      destructive: "text-white",
      outline: "text-foreground",
    },
  },
});

const BadgeContext = createContext<BadgeVariant>("default");

type BadgeProps = React.ComponentPropsWithoutRef<"span"> &
  VariantProps<typeof badgeStyle> & {
    className?: string;
  };

function Badge({ children, variant = "default", className, ...props }: BadgeProps) {
  return (
    <BadgeContext.Provider value={variant}>
      <span className={badgeStyle({ variant, class: className })} {...props}>
        {children}
      </span>
    </BadgeContext.Provider>
  );
}

type BadgeTextProps = React.ComponentPropsWithoutRef<"span"> &
  VariantProps<typeof badgeTextStyle> & {
    className?: string;
  };

const BadgeText = React.forwardRef<HTMLSpanElement, BadgeTextProps>(function BadgeText(
  { children, className, ...props },
  ref
) {
  const variant = useContext(BadgeContext);
  return (
    <span
      ref={ref}
      className={badgeTextStyle({
        parentVariants: { variant },
        class: className,
      })}
      {...props}
    >
      {children}
    </span>
  );
});

Badge.displayName = "Badge";
BadgeText.displayName = "BadgeText";

export { Badge, BadgeText };
