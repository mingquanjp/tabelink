import { ClientRouteGuard } from "@/components/auth/client-route-guard";
import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: "Tabelink Owner Portal",
  description: "Owner portal for managing restaurant operations",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("h-full antialiased", "font-sans", inter.variable)}>
      <body className="min-h-full flex flex-col">
        <ClientRouteGuard>{children}</ClientRouteGuard>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
