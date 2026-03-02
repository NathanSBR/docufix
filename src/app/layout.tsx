import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DocuFix - Transforma tus documentos",
  description: "Convierte comillas inglesas a latinas, inserta notas al pie y exporta a PDF. Procesamiento de documentos Word simplificado.",
  keywords: ["DocuFix", "Word", "docx", "PDF", "comillas latinas", "notas al pie", "conversor"],
  authors: [{ name: "Jonathan Stevens Betancourt" }],
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "DocuFix - Transforma tus documentos",
    description: "Convierte comillas inglesas a latinas, inserta notas al pie y exporta a PDF",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
