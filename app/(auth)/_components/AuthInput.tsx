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
      <div className="space-y-1">
        <label className="text-[12.7px] text-[#555555]">{label}</label>

        <input
          ref={ref}
          type={type}
          placeholder={placeholder}
          className={`w-full rounded-[14px] bg-[#FFE6F0] border px-4 py-3 text-sm focus:outline-none transition-all ${
            error
              ? "border-red-500"
              : "border-[#F7B9D0] focus:border-[#E15483]"
          }`}
          {...rest}
        />

        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
      </div>
    );
  }
);

AuthInput.displayName = "AuthInput";
export default AuthInput;