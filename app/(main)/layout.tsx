import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Navbar at the top for main store pages */}
      <Navbar />

      {/* Main content area */}
      <main className="flex-1">{children}</main>

      {/* Footer at the bottom */}
      <Footer />
    </>
  );
}

