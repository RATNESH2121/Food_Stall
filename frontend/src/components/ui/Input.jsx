import React, { forwardRef } from 'react';

const Input = forwardRef(({ label, type = "text", id, error, className = "", ...props }, ref) => {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && <label htmlFor={id} className="text-sm font-medium text-slate-700">{label}</label>}
      <input
        ref={ref}
        type={type}
        id={id}
        className={`px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
          error ? 'border-red-500' : 'border-slate-300'
        }`}
        {...props}
      />
      {error && <p className="text-xs text-red-600">{error.message}</p>}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;
