"use client";

import { Eye, EyeOff } from "lucide-react";
import { useState, useId } from "react";

type Props = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  name?: string;
  required?: boolean;
  autoComplete?: string;
};

export default function PasswordInput({
  label,
  value,
  onChange,
  placeholder,
  error,
  name,
  required,
  autoComplete = "current-password",
}: Props) {

  const [show, setShow] = useState(false);

  const id = useId();

  return (

    <div className="space-y-1">

      {/* Label */}
      <label
        htmlFor={id}
        className="text-[12.7px] text-[#555555]"
      >
        {label}
      </label>


      {/* Input container */}
      <div className="relative">

        <input
          id={id}
          name={name}
          type={show ? "text" : "password"}
          value={value}
          required={required}
          autoComplete={autoComplete}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full rounded-[14px] bg-[#FFE6F0] border px-4 py-3 pr-12 text-sm focus:outline-none transition ${
            error
              ? "border-red-500"
              : "border-[#F7B9D0] focus:border-[#E15483]"
          }`}
        />


        {/* Eye toggle */}
        {value && (
          <button
            type="button"
            onClick={() => setShow(prev => !prev)}
            aria-label={show ? "Hide password" : "Show password"}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#E15483] transition"
          >
            {show
              ? <EyeOff size={18}/>
              : <Eye size={18}/>
            }
          </button>
        )}

      </div>


      {/* Error */}
      {error && (
        <p className="text-red-500 text-[10px]">
          {error}
        </p>
      )}

    </div>

  );

}