import type { Metadata } from "next";
import { Toaster } from "sonner";
import "./globals.css";
import QueryProvider from "@/components/QueryProviders";

export const metadata: Metadata = {
  title: { default: "Switch", template: "%s · Switch" },
  description: "Project management for focused teams",
};

// Providers go here as the app grows — wrap children in order:
// QueryClient → SocketProvider → NotificationProvider
// For now it's just the shell. Add providers in this file, not in page components.
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <QueryProvider>{children}</QueryProvider>
        <Toaster richColors />
      </body>
    </html>
  );
}
