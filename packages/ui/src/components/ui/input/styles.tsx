import { tva } from "@gluestack-ui/utils/nativewind-utils";

export const inputStyle = tva({
  base: "h-9 w-full flex items-center rounded-md border border-border dark:bg-input/30 bg-transparent shadow-xs transition-[color,box-shadow] overflow-hidden has-[:focus]:outline-none has-[:focus]:border-ring dark:has-[:focus]:border-ring has-[:focus]:ring-[3px] has-[:focus]:ring-ring/50 data-[invalid=true]:border-destructive/40 dark:data-[invalid=true]:border-destructive/40 data-[invalid=true]:ring-destructive/20 dark:data-[invalid=true]:ring-destructive/40 data-[disabled=true]:pointer-events-none data-[disabled=true]:cursor-not-allowed data-[disabled=true]:opacity-50 px-3 gap-2",
});

export const inputIconStyle = tva({
  base: "flex justify-center items-center text-muted-foreground fill-none h-4 w-4 shrink-0",
});

export const inputSlotStyle = tva({
  base: "flex justify-center items-center disabled:cursor-not-allowed",
});

export const inputFieldStyle = tva({
  base: "flex-1 min-w-0 bg-transparent text-foreground text-sm py-1 h-full placeholder:text-muted-foreground outline-none disabled:cursor-not-allowed",
});
