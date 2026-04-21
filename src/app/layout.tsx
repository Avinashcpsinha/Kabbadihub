import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { MatchProvider } from "@/context/MatchContext";
import { AuthProvider } from "@/context/AuthContext";
import { TenantProvider } from "@/context/TenantContext";
import { AuctionProvider } from "@/context/AuctionContext";
import ImpersonationBanner from "@/components/ImpersonationBanner";
import Breadcrumbs from "@/components/Breadcrumbs";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "KabaddiHub | Pro Kabaddi Management",
  description: "Next-gen Kabaddi scoring, broadcasting, and tournament management platform.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className={`${inter.className} min-h-full flex flex-col`}>
        <TenantProvider>
          <ImpersonationBanner />
          <Breadcrumbs />
          <AuthProvider>
            <AuctionProvider>
              <MatchProvider>
                {children}
              </MatchProvider>
            </AuctionProvider>
          </AuthProvider>
        </TenantProvider>
      </body>
    </html>
  );
}
