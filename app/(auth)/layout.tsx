import { ToastProvider } from "@/app/components/GlobalToast";
import { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <ToastProvider position="bottom-left">
      {children}
    </ToastProvider>
  );
}