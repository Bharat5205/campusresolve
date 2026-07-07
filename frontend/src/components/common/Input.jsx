import { forwardRef } from "react";

export const Input = forwardRef(({
  label,
  error,
  id,
  className = "",
  containerClassName = "",
  ...props
}, ref) => {
  return (
    <div className={`space-y-1.5 ${containerClassName}`}>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={id}
        className={`w-full px-3 py-2 text-sm border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors ${
          error ? "border-red-300 focus:ring-red-500 focus:border-red-500" : "border-gray-300"
        } ${className}`}
        {...props}
      />
      {error && (
        <p className="text-xs text-red-500" role="alert">
          {error}
        </p>
      )}
    </div>
  );
});

Input.displayName = "Input";
