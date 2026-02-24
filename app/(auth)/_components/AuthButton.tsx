"use client";

type Props = {
  children: React.ReactNode;
};

export default function AuthButton({
  children,
}: Props) {

  return (

    <button
      type="submit"
      className="w-full rounded-full bg-[#E15483] text-white py-3.5 text-sm font-bold shadow-md hover:opacity-90 active:scale-[0.98]"
    >

      {children}

    </button>

  );

}