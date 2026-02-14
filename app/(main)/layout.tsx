import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Navbar at the top for main store pages */}
      {/* <Navbar /> */}

      {/* Main content area grows to push footer down */}
      <main className="flex-1">{children}</main>

      {/* Footer stays at the bottom */}
      {/* <Footer /> */}
    </div>
  );
}

