"use client";

import { forwardRef, InputHTMLAttributes } from "react";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  placeholder: string;
  error?: string;
};

const AuthInput = forwardRef<HTMLInputElement, Props>(
  ({ label, placeholder, error, type = "text", ...rest }, ref) => {
    return (
      <div className="space-y-0.5">
        <label className="text-xs text-[#555555]">{label}</label>
        <input
          ref={ref}
          type={type}
          placeholder={placeholder}
          className={`w-full rounded-[14px] bg-[#FFE6F0] border px-4 py-2 text-sm focus:outline-none transition-all ${
            error ? "border-red-500" : "border-[#F7B9D0] focus:border-[#E15483]"
          }`}
          {...rest}
        />
        {error && <p className="text-red-500 text-xs mt-0.5">{error}</p>}
      </div>
    );
  },
);

AuthInput.displayName = "AuthInput";
export default AuthInput;