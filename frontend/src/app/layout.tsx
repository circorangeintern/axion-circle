import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CleanReport",
  description: "Community Waste & Sanitation Issue Reporting",
  manifest: "/manifest.json",
  themeColor: "#1B5E20",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
