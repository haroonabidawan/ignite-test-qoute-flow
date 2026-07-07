"use client";

import React from "react";
import { tva, type VariantProps } from "@gluestack-ui/utils/nativewind-utils";

const formControlStyle = tva({
  base: "flex flex-col",
});

const formControlLabelStyle = tva({
  base: "flex flex-row items-center mb-1",
});

const formControlLabelTextStyle = tva({
  base: "font-medium text-foreground text-sm font-body",
});

const formControlErrorStyle = tva({
  base: "flex flex-row items-center mt-1 gap-1",
});

const formControlErrorTextStyle = tva({
  base: "text-destructive text-xs font-body",
});

const formControlHelperStyle = tva({
  base: "flex flex-row items-center mt-1 font-body",
});

const formControlHelperTextStyle = tva({
  base: "text-foreground/70 font-body text-sm",
});

type FormControlProps = React.ComponentPropsWithoutRef<"div"> &
  VariantProps<typeof formControlStyle> & {
    className?: string;
    isInvalid?: boolean;
    isDisabled?: boolean;
    isRequired?: boolean;
  };

const FormControl = React.forwardRef<HTMLDivElement, FormControlProps>(
  function FormControl(
    { className, isInvalid, isDisabled, isRequired, ...props },
    ref
  ) {
    return (
      <div
        ref={ref}
        data-invalid={isInvalid ? "true" : undefined}
        data-disabled={isDisabled ? "true" : undefined}
        data-required={isRequired ? "true" : undefined}
        className={formControlStyle({ class: className })}
        {...props}
      />
    );
  }
);

const FormControlLabel = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div"> & { className?: string }
>(function FormControlLabel({ className, ...props }, ref) {
  return (
    <div ref={ref} className={formControlLabelStyle({ class: className })} {...props} />
  );
});

const FormControlLabelText = React.forwardRef<
  HTMLSpanElement,
  React.ComponentPropsWithoutRef<"span"> & { className?: string }
>(function FormControlLabelText({ className, ...props }, ref) {
  return (
    <span
      ref={ref}
      className={formControlLabelTextStyle({ class: className })}
      {...props}
    />
  );
});

const FormControlError = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div"> & { className?: string }
>(function FormControlError({ className, ...props }, ref) {
  return (
    <div ref={ref} className={formControlErrorStyle({ class: className })} {...props} />
  );
});

const FormControlErrorText = React.forwardRef<
  HTMLSpanElement,
  React.ComponentPropsWithoutRef<"span"> & { className?: string }
>(function FormControlErrorText({ className, ...props }, ref) {
  return (
    <span
      ref={ref}
      className={formControlErrorTextStyle({ class: className })}
      {...props}
    />
  );
});

const FormControlHelper = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div"> & { className?: string }
>(function FormControlHelper({ className, ...props }, ref) {
  return (
    <div
      ref={ref}
      className={formControlHelperStyle({ class: className })}
      {...props}
    />
  );
});

const FormControlHelperText = React.forwardRef<
  HTMLSpanElement,
  React.ComponentPropsWithoutRef<"span"> & { className?: string }
>(function FormControlHelperText({ className, ...props }, ref) {
  return (
    <span
      ref={ref}
      className={formControlHelperTextStyle({ class: className })}
      {...props}
    />
  );
});

FormControl.displayName = "FormControl";
FormControlLabel.displayName = "FormControlLabel";
FormControlLabelText.displayName = "FormControlLabelText";
FormControlError.displayName = "FormControlError";
FormControlErrorText.displayName = "FormControlErrorText";
FormControlHelper.displayName = "FormControlHelper";
FormControlHelperText.displayName = "FormControlHelperText";

export {
  FormControl,
  FormControlLabel,
  FormControlLabelText,
  FormControlError,
  FormControlErrorText,
  FormControlHelper,
  FormControlHelperText,
};
