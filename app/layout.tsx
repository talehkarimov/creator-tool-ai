import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Creator Tool AI",
  description: "Free AI tools for content creators.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
