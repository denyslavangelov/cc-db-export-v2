import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CC Hub - Coca-Cola Market Setup & Scripting Platform",
  description: "A comprehensive checklist and workflow management system for setting up new markets in the Coca-Cola research program. Streamline your scripting process with guided steps for iField and Dimensions platforms, ensuring consistent and accurate market implementations.",
  keywords: "Coca-Cola, market setup, scripting, iField, Dimensions, checklist, workflow, research platform",
  authors: [{ name: "CC Hub Team" }],
  openGraph: {
    title: "CC Hub - Coca-Cola Market Setup & Scripting Platform",
    description: "Streamline your Coca-Cola market setup process with our comprehensive checklist and workflow management system. Guided steps for iField and Dimensions platforms.",
    type: "website",
    siteName: "CC Hub",
  },
  twitter: {
    card: "summary_large_image",
    title: "CC Hub - Coca-Cola Market Setup & Scripting Platform",
    description: "Streamline your Coca-Cola market setup process with our comprehensive checklist and workflow management system.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Toaster position="top-center" richColors closeButton />
      </body>
    </html>
  );
}
