import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Guide Law — Your AI Assistant for Bangladeshi Business Law",
  description: "Academic AI Legal Research Assistant grounded in Bangladesh's 5 core commercial statutes for the United International University (UIU) Business Law Competition.",
  keywords: ["Bangladeshi Business Law", "Contract Act 1872", "Sale of Goods Act 1930", "Negotiable Instruments Act 1881", "Partnership Act 1932", "Companies Act 1994", "UIU Law"],
  authors: [{ name: "Guide Law Research Team" }],
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8fafc" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0f1c" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-bg text-ink antialiased min-h-screen flex flex-col">
        {children}
      </body>
    </html>
  );
}
