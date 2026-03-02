// app/(main)/layout.tsx
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import BackToTop from "./components/BackToTop";
import { ToastProvider } from "@/app/components/GlobalToast";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ToastProvider>
      <div className="flex flex-col min-h-screen bg-white">
        <Navbar />

        <main className="flex-1 bg-white">
          {children}
        </main>

        <BackToTop />
        <Footer />
      </div>
    </ToastProvider>
    <div className="flex flex-col min-h-screen bg-white">
      <Navbar />

      <main className="flex-1 bg-white">{children}</main>

      <BackToTop />
      <Footer />
    </div>
  );
}