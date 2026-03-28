import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Bio Generator — Free & Instant | Creator Tool AI",
  description:
    "Generate 3 ready-to-use social media bios for Instagram, TikTok, LinkedIn & Twitter in seconds. Free AI tool — pick your tone and copy instantly.",
};

export default function BioGeneratorLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
