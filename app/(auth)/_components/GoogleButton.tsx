"use client";

import Image from "next/image";

export default function GoogleButton({ text }: { text: string }) {
  return (
    <div className="w-full rounded-full border border-gray-300 bg-gray-50 py-2.5 text-sm font-semibold flex items-center justify-center gap-2 cursor-not-allowed">
      <Image
        src="https://www.svgrepo.com/show/475656/google-color.svg"
        alt="Google"
        width={16}
        height={16}
        className="grayscale opacity-60"
      />
      <span className="text-gray-500">{text}</span>
    </div>
  );
}