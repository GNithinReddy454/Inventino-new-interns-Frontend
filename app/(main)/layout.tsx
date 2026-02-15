// app/(main)/layout.tsx
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import BackToTop from "./components/BackToTop";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Navigation only for shopping pages */}
      <Navbar />
      
      <main className="flex-1">
        {children}
      </main>
      
      {/* Only appears after scrolling 300px */}
      <BackToTop /> 
      
      <Footer />
    </div>
  );
}