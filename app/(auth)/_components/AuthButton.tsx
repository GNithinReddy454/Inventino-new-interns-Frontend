"use client";

type Props = {
  children: React.ReactNode;
  disabled?: boolean;
};

export default function AuthButton({ children, disabled = false }: Props) {
  return (
    <button
      type="submit"
      disabled={disabled}
      className={`w-full rounded-full text-white py-3 text-sm font-bold shadow-md active:scale-[0.98] ${
        disabled
          ? "bg-gray-400 cursor-not-allowed opacity-60"
          : "bg-[#E15483] hover:opacity-90"
      }`}
    >
      {children}
    </button>
  );
}