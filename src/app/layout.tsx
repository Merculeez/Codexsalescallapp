import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CodeX Sales Call Analyzer",
  description: "Review sales call transcripts for compliance — pricing, insurance, and payment collection.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
