import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Distric Internet",
  description: "Landing page Distric Internet broadband unlimited.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
