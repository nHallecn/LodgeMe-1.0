import React from "react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { FieldError } from "react-hook-form";

interface FormTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: FieldError;
}

export const FormTextarea = React.forwardRef<HTMLTextAreaElement, FormTextareaProps>(
  ({ label, error, required, id, name, className, ...props }, ref) => {
    const textareaId = id || name;

    return (
      <div className="space-y-2">
        <Label htmlFor={textareaId}>
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
        <Textarea
          {...props}
          ref={ref}
          id={textareaId}
          name={name}
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

FormTextarea.displayName = "FormTextarea";