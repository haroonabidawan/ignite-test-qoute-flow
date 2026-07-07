"use client";

import React from "react";
import type { VariantProps } from "@gluestack-ui/utils/nativewind-utils";
import { inputFieldStyle, inputIconStyle, inputSlotStyle, inputStyle } from "./styles";

type InputProps = React.ComponentPropsWithoutRef<"div"> &
  VariantProps<typeof inputStyle> & {
    className?: string;
    isInvalid?: boolean;
    isDisabled?: boolean;
    isRequired?: boolean;
  };

const Input = React.forwardRef<HTMLDivElement, InputProps>(function Input(
  { className, isInvalid, isDisabled, isRequired, ...props },
  ref
) {
  return (
    <div
      ref={ref}
      data-invalid={isInvalid ? "true" : undefined}
      data-disabled={isDisabled ? "true" : undefined}
      data-required={isRequired ? "true" : undefined}
      className={inputStyle({ class: className })}
      {...props}
    />
  );
});

type InputIconProps = React.ComponentPropsWithoutRef<"span"> &
  VariantProps<typeof inputIconStyle> & {
    className?: string;
    as?: React.ElementType;
  };

const InputIcon = React.forwardRef<HTMLSpanElement, InputIconProps>(function InputIcon(
  { className, as: IconComponent, children, ...props },
  ref
) {
  const iconClassName = inputIconStyle({ class: className });

  return (
    <span ref={ref} className={iconClassName} {...props}>
      {IconComponent ? <IconComponent className={iconClassName} /> : children}
    </span>
  );
});

type InputSlotProps = React.ComponentPropsWithoutRef<"div"> &
  VariantProps<typeof inputSlotStyle> & {
    className?: string;
  };

const InputSlot = React.forwardRef<HTMLDivElement, InputSlotProps>(function InputSlot(
  { className, ...props },
  ref
) {
  return <div ref={ref} className={inputSlotStyle({ class: className })} {...props} />;
});

type InputFieldProps = Omit<React.ComponentPropsWithoutRef<"input">, "onChange"> &
  VariantProps<typeof inputFieldStyle> & {
    className?: string;
    onChangeText?: (value: string) => void;
    secureTextEntry?: boolean;
    keyboardType?:
      "default" | "email-address" | "phone-pad" | "numeric" | "decimal-pad";
    autoCapitalize?: "none" | "sentences" | "words" | "characters";
  };

const InputField = React.forwardRef<HTMLInputElement, InputFieldProps>(
  function InputField(
    {
      className,
      onChangeText,
      secureTextEntry,
      keyboardType,
      autoCapitalize,
      type,
      ...props
    },
    ref
  ) {
    const resolvedType =
      type ??
      (secureTextEntry
        ? "password"
        : keyboardType === "email-address"
          ? "email"
          : keyboardType === "phone-pad"
            ? "tel"
            : "text");

    return (
      <input
        ref={ref}
        type={resolvedType}
        autoCapitalize={autoCapitalize}
        inputMode={
          keyboardType === "phone-pad"
            ? "tel"
            : keyboardType === "numeric" || keyboardType === "decimal-pad"
              ? "decimal"
              : undefined
        }
        onChange={(event) => onChangeText?.(event.target.value)}
        className={inputFieldStyle({ class: className })}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";
InputIcon.displayName = "InputIcon";
InputSlot.displayName = "InputSlot";
InputField.displayName = "InputField";

export { Input, InputField, InputIcon, InputSlot };
