import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Caption Generator — Free & Instant | Creator Tool AI",
  description:
    "Generate ready-to-use social media captions for Instagram, TikTok, LinkedIn & Twitter in seconds. Free AI tool — pick your tone and copy instantly.",
};

export default function CaptionGeneratorLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
