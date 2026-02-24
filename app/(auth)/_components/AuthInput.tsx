"use client";

type Props = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  error?: string;
  type?: string;
};

export default function AuthInput({
  label,
  value,
  onChange,
  placeholder,
  error,
  type = "text",
}: Props) {

  return (

    <div className="space-y-1">

      <label className="text-[12.7px] text-[#555555]">

        {label}

      </label>


      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full rounded-[14px] bg-[#FFE6F0] border px-4 py-3 text-sm focus:outline-none transition-all ${
          error
            ? "border-red-500"
            : "border-[#F7B9D0] focus:border-[#E15483]"
        }`}
      />


      {error && (
        <p className="text-red-500 text-[10px]">
          {error}
        </p>
      )}

    </div>

  );

}