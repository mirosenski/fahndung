"use client";

import * as React from "react";

interface SwitchProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ label, checked, onCheckedChange, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onCheckedChange?.(e.target.checked);
      props.onChange?.(e);
    };

    return (
      <div className="flex items-center space-x-2">
        <label className="relative inline-flex h-6 w-11 cursor-pointer items-center rounded-full bg-muted transition-colors focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2 dark:bg-muted">
          <input
            type="checkbox"
            className="peer sr-only"
            checked={checked}
            onChange={handleChange}
            ref={ref}
            {...props}
          />
          <span className="pointer-events-none absolute left-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-5 peer-checked:bg-blue-500 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 peer-focus:ring-offset-2 dark:bg-muted" />
        </label>
        {label && (
          <span className="text-sm font-medium text-muted-foreground dark:text-muted-foreground">
            {label}
          </span>
        )}
      </div>
    );
  },
);
Switch.displayName = "Switch";

export { Switch };
