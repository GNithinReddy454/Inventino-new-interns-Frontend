
import { ToastProvider } from "@/app/components/GlobalToast";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider position="bottom-left">
      {children}
    </ToastProvider>
  );
}