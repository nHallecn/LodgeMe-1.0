import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FieldError } from "react-hook-form";

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: FieldError;
}

export const FormInput = React.forwardRef<HTMLInputElement, FormInputProps>(
  ({ label, error, required, type = "text", id, name, className, ...props }, ref) => {
    const inputId = id || name;

    return (
      <div className="space-y-2">
        <Label htmlFor={inputId}>
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
        <Input
          {...props}
          ref={ref}
          id={inputId}
          name={name}
          type={type}
          required={required}
          className={`${error ? "border-destructive focus-visible:ring-destructive" : ""} ${className || ""}`}
        />
        {error && (
          <p className="text-sm font-medium text-destructive">
            {error.message || "Required"}
          </p>
        )}
      </div>
    );
  }
);

FormInput.displayName = "FormInput";