import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface FieldProps {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * Shared wrapper for all form fields.
 * Shows a red asterisk for required fields and an inline error message.
 */
export function Field({ label, required, error, children, className }: FieldProps) {
  return (
    <div className={cn("space-y-1", className)}>
      <Label className="text-xs font-medium text-slate-600">
        {label}
        {required && (
          <span className="ml-0.5 text-rose-500 font-bold" aria-hidden="true">
            *
          </span>
        )}
      </Label>
      {children}
      {error && (
        <p className="flex items-center gap-1 text-[11px] font-medium text-rose-600">
          <span aria-hidden="true">⚠</span> {error}
        </p>
      )}
    </div>
  );
}
