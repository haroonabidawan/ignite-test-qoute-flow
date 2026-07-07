"use client";

import React, { createContext, useContext } from "react";
import { tva, type VariantProps } from "@gluestack-ui/utils/nativewind-utils";

const textareaStyle = tva({
  base: "w-full min-h-[100px] border border-border dark:bg-input/30 rounded hover:border-border/80 focus-within:border-primary/80 focus-within:ring-1 focus-within:ring-inset focus-within:ring-indicator-primary data-[invalid=true]:border-destructive data-[invalid=true]:ring-1 data-[invalid=true]:ring-inset data-[invalid=true]:ring-indicator-error data-[disabled=true]:opacity-40 data-[disabled=true]:bg-background/90",
  variants: {
    variant: {
      default: "",
    },
    size: {
      sm: "",
      md: "",
      lg: "",
      xl: "",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "md",
  },
});

const textareaInputStyle = tva({
  base: "block w-full min-h-[inherit] resize-y bg-transparent p-2 outline-none text-foreground placeholder:text-foreground/60 disabled:cursor-not-allowed",
  parentVariants: {
    size: {
      sm: "text-sm",
      md: "text-base",
      lg: "text-lg",
      xl: "text-xl",
    },
  },
});

const TextareaContext = createContext<{
  size?: VariantProps<typeof textareaStyle>["size"];
}>({
  size: "md",
});

type TextareaProps = React.ComponentPropsWithoutRef<"div"> &
  VariantProps<typeof textareaStyle> & {
    className?: string;
    isInvalid?: boolean;
    isDisabled?: boolean;
  };

const Textarea = React.forwardRef<HTMLDivElement, TextareaProps>(function Textarea(
  {
    className,
    variant = "default",
    size = "md",
    isInvalid,
    isDisabled,
    children,
    ...props
  },
  ref
) {
  return (
    <TextareaContext.Provider value={{ size }}>
      <div
        ref={ref}
        data-invalid={isInvalid ? "true" : undefined}
        data-disabled={isDisabled ? "true" : undefined}
        className={textareaStyle({ variant, size, class: className })}
        {...props}
      >
        {children}
      </div>
    </TextareaContext.Provider>
  );
});

type TextareaInputProps = React.ComponentPropsWithoutRef<"textarea"> &
  VariantProps<typeof textareaInputStyle> & {
    className?: string;
    onChangeText?: (value: string) => void;
    multiline?: boolean;
    numberOfLines?: number;
  };

const TextareaInput = React.forwardRef<HTMLTextAreaElement, TextareaInputProps>(
  function TextareaInput(
    {
      className,
      onChangeText,
      onChange,
      rows,
      multiline: _multiline,
      numberOfLines,
      ...props
    },
    ref
  ) {
    const { size } = useContext(TextareaContext);

    return (
      <textarea
        ref={ref}
        rows={rows ?? numberOfLines ?? 4}
        onChange={(event) => {
          onChange?.(event);
          onChangeText?.(event.target.value);
        }}
        className={textareaInputStyle({
          parentVariants: { size },
          class: className,
        })}
        {...props}
      />
    );
  }
);

Textarea.displayName = "Textarea";
TextareaInput.displayName = "TextareaInput";

export { Textarea, TextareaInput };
