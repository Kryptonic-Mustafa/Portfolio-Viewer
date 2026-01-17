import type { Metadata } from "next";
import "./globals.css"; // Ensure you have globals.css, if not remove this line

export const metadata: Metadata = {
  title: "Portfolio OS",
  description: "My Developer Operating System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-neutral-950 text-white antialiased">{children}</body>
    </html>
  );
}