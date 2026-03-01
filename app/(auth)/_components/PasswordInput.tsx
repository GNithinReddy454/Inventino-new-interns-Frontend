"use client";

import { Eye, EyeOff } from "lucide-react";
import { useState, useId, forwardRef, InputHTMLAttributes } from "react";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  placeholder?: string;
  error?: string;
};

const PasswordInput = forwardRef<HTMLInputElement, Props>(
  (
    { label, placeholder, error, autoComplete = "current-password", ...rest },
    ref,
  ) => {
    const [show, setShow] = useState(false);
    const id = useId();

    return (
      <div className="space-y-1">
        <label htmlFor={id} className="text-[12.7px] text-[#555555]">
          {label}
        </label>

        <div className="relative">
          <input
            ref={ref}
            id={id}
            type={show ? "text" : "password"}
            autoComplete={autoComplete}
            placeholder={placeholder}
            className={`w-full rounded-[14px] bg-[#FFE6F0] border px-4 py-3 pr-12 text-sm focus:outline-none transition ${
              error
                ? "border-red-500"
                : "border-[#F7B9D0] focus:border-[#E15483]"
            }`}
            {...rest}
          />

          <button
            type="button"
            onClick={() => setShow((prev) => !prev)}
            aria-label={show ? "Hide password" : "Show password"}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#E15483] transition"
          >
            {show ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
      </div>
    );
  },
);

PasswordInput.displayName = "PasswordInput";
export default PasswordInput;
