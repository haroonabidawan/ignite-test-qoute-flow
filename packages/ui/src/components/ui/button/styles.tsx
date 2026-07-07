import { tva } from "@gluestack-ui/utils/nativewind-utils";

export const buttonStyle = tva({
  base: "inline-flex rounded-md items-center justify-center focus-visible:outline-none focus-visible:ring-2 disabled:opacity-40 disabled:pointer-events-none gap-2 h-fit transition-colors",
  variants: {
    variant: {
      default:
        "appearance-none bg-primary text-primary-foreground [background-color:rgb(var(--primary))] hover:[background-color:rgb(var(--primary)/0.9)] active:[background-color:rgb(var(--primary)/0.9)]",
      destructive:
        "bg-destructive text-white hover:bg-destructive/90 active:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
      outline:
        "border border-border bg-background shadow-xs hover:bg-accent active:bg-accent dark:bg-input/[0.045] dark:border-border/90 dark:hover:bg-input/[0.075] dark:active:bg-input/[0.075] text-foreground",
      secondary:
        "bg-secondary text-secondary-foreground hover:bg-secondary/80 active:bg-secondary/80",
      ghost:
        "text-foreground hover:bg-accent active:bg-accent dark:hover:bg-accent/50 dark:active:bg-accent/50",
      link: "text-primary underline-offset-4 hover:underline active:underline bg-transparent",
    },
    size: {
      default: "px-4 py-2 text-sm",
      sm: "min-h-8 rounded-md px-3 text-xs",
      lg: "min-h-10 rounded-md px-8 text-sm",
      icon: "min-h-9 min-w-9 text-sm",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
});

export const buttonTextStyle = tva({
  base: "select-none font-sans",
  parentVariants: {
    variant: {
      default: "text-primary-foreground",
      destructive: "text-white",
      outline: "text-foreground",
      secondary: "text-secondary-foreground",
      ghost: "text-foreground",
      link: "text-primary",
    },
    size: {
      default: "text-sm",
      sm: "text-xs",
      lg: "text-sm",
      icon: "text-sm",
    },
  },
});

export const buttonGroupStyle = tva({
  base: "flex",
  variants: {
    space: {
      xs: "gap-1",
      sm: "gap-2",
      md: "gap-3",
      lg: "gap-4",
      xl: "gap-5",
      "2xl": "gap-6",
      "3xl": "gap-7",
      "4xl": "gap-8",
    },
    isAttached: {
      true: "gap-0",
    },
    flexDirection: {
      row: "flex-row",
      column: "flex-col",
      "row-reverse": "flex-row-reverse",
      "column-reverse": "flex-col-reverse",
    },
  },
});
