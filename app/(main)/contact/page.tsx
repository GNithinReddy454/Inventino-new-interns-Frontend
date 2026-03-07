"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Mail, Send, Sparkles, Globe, Loader2 } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { submitContact, resetContactState } from "@/redux/contactslice";

export default function ContactPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { isLoading, success, error } = useAppSelector((state) => state.contact);
  const { user } = useAppSelector((state) => state.auth);

  const [authError, setAuthError] = useState("");
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    subject: "",
    message: ""
  });

  useEffect(() => {
    return () => {
      dispatch(resetContactState());
    };
  }, [dispatch]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setAuthError("Authentication required. Please log in to submit an inquiry.");
      setTimeout(() => {
        router.push("/login");
      }, 2000);
      return;
    }
    setAuthError("");
    dispatch(submitContact(formData));
  };

  return (
    <main className="min-h-screen bg-[#FFF9FA] pb-20 pt-32">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          {/* LEFT: Global Brand Presence */}
          <div className="space-y-12">
            <div>
              <h1 className="text-5xl md:text-7xl font-serif font-light text-gray-900 mb-8">
                Contact <span className="text-pink-600 italic">Us</span>
              </h1>
              <p className="text-gray-500 text-lg font-light leading-relaxed max-w-md">
                Our global concierge is available to assist you with bespoke
                requests, private consultations, and worldwide order care.
              </p>
            </div>

            <div className="space-y-8">
              <div className="flex items-center gap-6">
                <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-pink-500 border border-pink-50">
                  <Mail size={22} />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-pink-400 font-bold">
                    Email
                  </p>
                  <p className="text-gray-800 font-medium">
                    concierge@inventino.com
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-pink-500 border border-pink-50">
                  <Globe size={22} />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-pink-400 font-bold">
                    Global Support
                  </p>
                  <p className="text-gray-800 font-medium">
                    Assisting clients across all time zones.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: Professional Message Form */}
          <div className="bg-white p-10 md:p-12 rounded-[40px] shadow-2xl shadow-pink-100/40 border border-pink-50 relative overflow-hidden">
            {success ? (
              <div className="text-center py-20 animate-in zoom-in duration-500">
                <Sparkles className="w-12 h-12 text-pink-500 mx-auto mb-6" />
                <h3 className="text-3xl font-serif font-medium text-gray-900 mb-4">
                  Inquiry Received
                </h3>
                <p className="text-gray-500 font-light">
                  Your message is with our concierge. We will be in touch
                  shortly.
                </p>
                <button
                  onClick={() => {
                    dispatch(resetContactState());
                    setFormData({ fullName: "", email: "", subject: "", message: "" });
                  }}
                  className="mt-10 text-pink-600 font-semibold hover:text-pink-800 transition-colors"
                >
                  Send another inquiry
                </button>
              </div>
            ) : (
              <>
                <h3 className="text-2xl font-serif font-semibold text-gray-900 mb-8">
                  Direct Inquiry
                </h3>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {(error || authError) && (
                    <div className="bg-red-50 text-red-500 p-4 rounded-xl text-sm font-medium">
                      {authError || error}
                    </div>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <input
                      required
                      type="text"
                      placeholder="Full Name"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="w-full px-6 py-4 rounded-2xl bg-pink-50/20 border border-pink-100 focus:outline-none focus:ring-1 focus:ring-pink-400 transition-all"
                    />
                    <input
                      required
                      type="email"
                      placeholder="Email Address"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-6 py-4 rounded-2xl bg-pink-50/20 border border-pink-100 focus:outline-none focus:ring-1 focus:ring-pink-400 transition-all"
                    />
                  </div>
                  <input
                    required
                    type="text"
                    placeholder="Subject"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-6 py-4 rounded-2xl bg-pink-50/20 border border-pink-100 focus:outline-none focus:ring-1 focus:ring-pink-400 transition-all"
                  />
                  <textarea
                    required
                    placeholder="How can our concierge assist you today?"
                    rows={5}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-6 py-4 rounded-2xl bg-pink-50/20 border border-pink-100 focus:outline-none focus:ring-1 focus:ring-pink-400 transition-all resize-none"
                  ></textarea>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-[#1A0F13] text-white py-5 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-pink-600 transition-all duration-500 shadow-xl disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isLoading ? "Sending..." : "Send Message"}
                    {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                  </button>
                </form>
              </>
            )}
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-pink-50/50 rounded-full blur-3xl"></div>
          </div>
        </div>
      </div>
    </main>
  );
}
