import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { FieldError } from "react-hook-form";

interface FormTextareaProps {
  label: string;
  placeholder?: string;
  error?: FieldError;
  required?: boolean;
  disabled?: boolean;
  rows?: number;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLTextAreaElement>) => void;
  name?: string;
}

export const FormTextarea = ({
  label,
  placeholder,
  error,
  required,
  disabled,
  rows = 4,
  value,
  onChange,
  onBlur,
  name,
}: FormTextareaProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor={name}>
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      <Textarea
        id={name}
        name={name}
        placeholder={placeholder}
        disabled={disabled}
        rows={rows}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        className={error ? "border-destructive" : ""}
      />
      {error && <p className="text-sm text-destructive">{error.message}</p>}
    </div>
  );
};
