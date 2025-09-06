import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Providers } from "@/components/providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sistem Pelayanan Desa",
  description: "Sistem pelayanan administrasi desa terpadu online",
  keywords: ["pelayanan desa", "administrasi desa", "layanan online"],
  authors: [{ name: "Desa Admin" }],
  openGraph: {
    title: "Sistem Pelayanan Desa",
    description: "Sistem pelayanan administrasi desa terpadu online",
    url: "https://desa.example.com",
    siteName: "Sistem Pelayanan Desa",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sistem Pelayanan Desa",
    description: "Sistem pelayanan administrasi desa terpadu online",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
