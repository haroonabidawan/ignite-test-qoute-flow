"use client";

import React, { createContext, useContext } from "react";
import type { VariantProps } from "@gluestack-ui/utils/nativewind-utils";
import { buttonGroupStyle, buttonStyle, buttonTextStyle } from "./styles";

type ButtonContextValue = VariantProps<typeof buttonStyle>;

const ButtonContext = createContext<ButtonContextValue>({
  variant: "default",
  size: "default",
});

type ButtonProps = React.ComponentPropsWithoutRef<"button"> &
  VariantProps<typeof buttonStyle> & {
    className?: string;
    onPress?: React.MouseEventHandler<HTMLButtonElement>;
  };

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    className,
    variant = "default",
    size = "default",
    onPress,
    onClick,
    type = "button",
    children,
    ...props
  },
  ref
) {
  return (
    <ButtonContext.Provider value={{ variant, size }}>
      <button
        ref={ref}
        type={type}
        onClick={onPress ?? onClick}
        className={buttonStyle({ variant, size, class: className })}
        {...props}
      >
        {children}
      </button>
    </ButtonContext.Provider>
  );
});

type ButtonTextProps = React.ComponentPropsWithoutRef<"span"> &
  VariantProps<typeof buttonTextStyle> & {
    className?: string;
  };

const ButtonText = React.forwardRef<HTMLSpanElement, ButtonTextProps>(
  function ButtonText({ className, size, ...props }, ref) {
    const parent = useContext(ButtonContext);
    return (
      <span
        ref={ref}
        className={buttonTextStyle({
          parentVariants: {
            variant: parent.variant,
            size: parent.size,
          },
          size,
          class: className,
        })}
        {...props}
      />
    );
  }
);

type ButtonGroupProps = React.ComponentPropsWithoutRef<"div"> &
  VariantProps<typeof buttonGroupStyle> & {
    className?: string;
  };

const ButtonGroup = React.forwardRef<HTMLDivElement, ButtonGroupProps>(
  function ButtonGroup(
    { className, space = "md", isAttached = false, flexDirection = "column", ...props },
    ref
  ) {
    return (
      <div
        ref={ref}
        className={buttonGroupStyle({
          class: className,
          space,
          isAttached,
          flexDirection,
        })}
        {...props}
      />
    );
  }
);

const ButtonSpinner = React.forwardRef<
  HTMLSpanElement,
  React.ComponentPropsWithoutRef<"span"> & { className?: string }
>(function ButtonSpinner({ className, ...props }, ref) {
  return (
    <span
      ref={ref}
      className={`inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent ${className ?? ""}`}
      {...props}
    />
  );
});

const ButtonIcon = React.forwardRef<
  HTMLSpanElement,
  React.ComponentPropsWithoutRef<"span"> & {
    className?: string;
    as?: React.ElementType;
  }
>(function ButtonIcon({ className, as: IconComponent, children, ...props }, ref) {
  return (
    <span
      ref={ref}
      className={`inline-flex h-4 w-4 shrink-0 ${className ?? ""}`}
      {...props}
    >
      {IconComponent ? <IconComponent /> : children}
    </span>
  );
});

Button.displayName = "Button";
ButtonText.displayName = "ButtonText";
ButtonSpinner.displayName = "ButtonSpinner";
ButtonIcon.displayName = "ButtonIcon";
ButtonGroup.displayName = "ButtonGroup";

export { Button, ButtonText, ButtonSpinner, ButtonIcon, ButtonGroup };
