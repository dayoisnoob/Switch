import QueryProvider from "@/components/QueryProviders";
import { cn } from "@/lib/utils";
import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";
import { MobileBlocker } from "@/components/ui/MobileBlocker";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: { default: "Switch", template: "%s · Switch" },
  description: "Project management for focused teams",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("font-sans", geist.variable)}
    >
      <body>
        <MobileBlocker>
          <QueryProvider>{children}</QueryProvider>
        </MobileBlocker>
        <Toaster richColors />
      </body>
    </html>
  );
}
