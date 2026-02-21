// Bare layout for admin — no Navbar or Footer
export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-background font-sans text-foreground">
            {children}
        </div>
    );
}
