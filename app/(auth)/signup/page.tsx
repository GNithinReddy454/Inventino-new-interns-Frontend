"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useAuth } from "@/components/authContext";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const [mode, setMode] = useState<"signup" | "login">("signup");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple client-side auth simulation
    const userName = mode === "signup" ? name || email.split("@")[0] : email.split("@")[0];
    login({ name: userName, email });
    router.push("/");
  };

  const rightImages = {
    signup:
      "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=1200&q=80",
    // use the same (or highly similar) image for login to match signup visuals
    // choose a different but visually similar jewellery image for login
    login: "/loginImage.png",
  };

  const overlay = {
    signup: {
      title: "Shine With Style",
      subtitle: "Join Inventino and explore timeless handcrafted bracelets.",
    },
    login: {
      title: "Welcome Back",
      subtitle: "Log in to continue shopping your favourite handcrafted pieces.",
    },
  } as const;

  return (
    <div className="min-h-screen flex">
      {/* LEFT SIDE - Form Card */}
      <div className="w-1/2 bg-gray-100 flex items-center justify-center p-8">
        <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-xl border border-pink-100 flex gap-4 items-stretch">
          {/* Form area */}
          <div className="flex-1">
            <div className="flex justify-center mb-2">
              <Image src="/logo.png" alt="Loo" width={140} height={40} className="object-contain" />
            </div>
            <p className="text-center text-sm text-gray-500 mb-4">
              {mode === "signup" ? "Create Account" : "Login to your account"}
            </p>

            <form onSubmit={handleSubmit} className="space-y-3">
              {mode === "signup" && (
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  type="text"
                  placeholder="Full Name"
                  className="w-full p-2 rounded-lg border border-pink-100 focus:ring-2 focus:ring-pink-300"
                />
              )}

              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                placeholder="Email"
                required
                className="w-full p-2 rounded-lg border border-pink-100 focus:ring-2 focus:ring-pink-300"
              />

              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                placeholder="Password"
                required
                className="w-full p-2 rounded-lg border border-pink-100 focus:ring-2 focus:ring-pink-300"
              />

              {mode === "signup" && (
                <input
                  type="password"
                  placeholder="Confirm Password"
                  className="w-full p-2 rounded-lg border border-pink-100 focus:ring-2 focus:ring-pink-300"
                />
              )}

              <button
                type="submit"
                className="w-full bg-pink-500 text-white py-2 rounded-lg hover:bg-pink-600 transition duration-300"
              >
                {mode === "signup" ? "Sign Up" : "Login"}
              </button>

              <p className="text-center text-sm mt-1">
                {mode === "signup" ? "Already have an account?" : "Don't have an account?"}{" "}
                <span
                  className="text-pink-600 cursor-pointer"
                  onClick={() => setMode((m) => (m === "signup" ? "login" : "signup"))}
                >
                  {mode === "signup" ? "Login" : "Sign Up"}
                </span>
              </p>
            </form>
          </div>

          {/* thumbnail removed as requested */}
        </div>
      </div>

      {/* RIGHT SIDE IMAGE (rounded card with overlay) */}
      <div className="w-1/2 flex items-center justify-center p-8">
        <div className="w-full h-[78vh] max-h-[900px] rounded-2xl overflow-hidden relative shadow-2xl border border-pink-100">
          <img
            src={mode === "signup" ? rightImages.signup : rightImages.login}
            alt={overlay[mode].title}
            className="w-full h-full object-cover"
          />

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-pink-900/30 to-transparent flex items-end">
            <div className="p-8 text-white w-full">
              <h2 className="text-3xl font-semibold drop-shadow">{overlay[mode].title}</h2>
              <p className="text-sm mt-2 max-w-md drop-shadow">{overlay[mode].subtitle}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

