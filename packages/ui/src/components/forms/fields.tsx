"use client";

import { Box } from "../../components/ui/box";
import { Text } from "../../components/ui/text";
import { VStack } from "../../components/ui/vstack";
import {
  FormControl,
  FormControlLabel,
  FormControlLabelText,
} from "../../components/ui/form-control";
import {
  Input,
  InputField,
  InputIcon,
  InputSlot,
} from "../../components/ui/input/index.web";
import { Textarea, TextareaInput } from "../../components/ui/textarea";
import { LockIcon, MailIcon, SearchIcon } from "../../components/ui/icon/index.web";

function FieldHint({ hint }: { hint?: string }) {
  if (!hint) return null;
  return <Text className="mt-1.5 text-xs text-muted-foreground">{hint}</Text>;
}

export function TextField({
  label,
  value,
  onChangeText,
  placeholder,
  type = "text",
  required,
  hint,
  isInvalid,
  isDisabled,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  type?: "text" | "email" | "password" | "tel";
  required?: boolean;
  hint?: string;
  isInvalid?: boolean;
  isDisabled?: boolean;
}) {
  const LeadingIcon =
    type === "email" ? MailIcon : type === "password" ? LockIcon : null;

  return (
    <FormControl className="w-full" isInvalid={isInvalid}>
      <FormControlLabel>
        <FormControlLabelText className="text-sm font-medium text-foreground">
          {label}
          {required ? <Text className="text-destructive"> *</Text> : null}
        </FormControlLabelText>
      </FormControlLabel>
      <Input
        isRequired={required}
        isDisabled={isDisabled}
        isInvalid={isInvalid}
        className="h-10 rounded-lg"
      >
        {LeadingIcon ? (
          <InputSlot>
            <InputIcon as={LeadingIcon} className="text-muted-foreground" />
          </InputSlot>
        ) : null}
        <InputField
          type={type}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          secureTextEntry={type === "password"}
          autoCapitalize={type === "email" ? "none" : "sentences"}
          keyboardType={type === "tel" ? "phone-pad" : "default"}
        />
      </Input>
      <FieldHint hint={hint} />
    </FormControl>
  );
}

export function TextAreaField({
  label,
  value,
  onChangeText,
  placeholder,
  rows = 4,
  hint,
  isInvalid,
  isDisabled,
  maxLength,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  rows?: number;
  hint?: string;
  isInvalid?: boolean;
  isDisabled?: boolean;
  maxLength?: number;
}) {
  return (
    <FormControl className="w-full" isInvalid={isInvalid}>
      <FormControlLabel>
        <FormControlLabelText className="text-sm font-medium text-foreground">
          {label}
        </FormControlLabelText>
      </FormControlLabel>
      <Textarea
        size="md"
        isDisabled={isDisabled}
        isInvalid={isInvalid}
        className="min-h-[112px] rounded-lg"
      >
        <TextareaInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          multiline
          numberOfLines={rows}
          maxLength={maxLength}
        />
      </Textarea>
      <FieldHint hint={hint} />
    </FormControl>
  );
}

export function SelectField({
  label,
  value,
  onChange,
  options,
  placeholder = "Select...",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { label: string; value: string }[];
  placeholder?: string;
}) {
  return (
    <FormControl className="w-full">
      <FormControlLabel>
        <FormControlLabelText className="text-sm font-medium text-foreground">
          {label}
        </FormControlLabelText>
      </FormControlLabel>
      <Input className="h-10 rounded-lg px-0">
        <Box className="w-full px-3">
          <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="h-9 w-full bg-transparent text-sm text-foreground outline-none"
          >
            <option value="">{placeholder}</option>
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </Box>
      </Input>
    </FormControl>
  );
}

export function NumberField({
  label,
  value,
  onChange,
  placeholder,
  allowNull,
  isInvalid,
  isDisabled,
}: {
  label: string;
  value: number | null;
  onChange: (value: number | null) => void;
  placeholder?: string;
  allowNull?: boolean;
  isInvalid?: boolean;
  isDisabled?: boolean;
}) {
  return (
    <FormControl className="w-full" isInvalid={isInvalid}>
      <FormControlLabel>
        <FormControlLabelText className="text-sm font-medium text-foreground">
          {label}
        </FormControlLabelText>
      </FormControlLabel>
      <Input isDisabled={isDisabled} isInvalid={isInvalid} className="h-10 rounded-lg">
        <InputField
          type="number"
          keyboardType="decimal-pad"
          value={value === null ? "" : String(value)}
          placeholder={placeholder ?? (allowNull ? "TBD" : "0")}
          onChangeText={(text) => {
            if (text === "" && allowNull) {
              onChange(null);
              return;
            }
            const parsed = Number(text);
            onChange(Number.isNaN(parsed) ? (allowNull ? null : 0) : parsed);
          }}
        />
      </Input>
    </FormControl>
  );
}

/** Compact Gluestack input for tables and inline editing */
export function InlineInputField({
  value,
  onChangeText,
  type = "text",
  placeholder,
  className = "",
  min,
  step,
}: {
  value: string;
  onChangeText: (value: string) => void;
  type?: "text" | "number";
  placeholder?: string;
  className?: string;
  min?: number;
  step?: string;
}) {
  return (
    <Input className={`h-9 min-w-[80px] rounded-md ${className}`}>
      <InputField
        type={type}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        {...(type === "number" ? { keyboardType: "decimal-pad" as const } : {})}
        {...(min !== undefined ? { min } : {})}
        {...(step !== undefined ? { step } : {})}
      />
    </Input>
  );
}

export function SearchField({
  label,
  value,
  onChangeText,
  placeholder,
  isDisabled,
}: {
  label?: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  isDisabled?: boolean;
}) {
  return (
    <FormControl className="w-full">
      {label ? (
        <FormControlLabel>
          <FormControlLabelText className="text-sm font-medium text-foreground">
            {label}
          </FormControlLabelText>
        </FormControlLabel>
      ) : null}
      <Input isDisabled={isDisabled} className="h-10 rounded-lg">
        <InputSlot>
          <InputIcon as={SearchIcon} className="text-muted-foreground" />
        </InputSlot>
        <InputField
          type="search"
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          autoCapitalize="none"
        />
      </Input>
    </FormControl>
  );
}
