"use client";

import { useState, useCallback, useRef } from "react";
import type { Bio } from "@/lib/bio-generator/types";
import type { GenerateBioPayload } from "@/components/bio-generator/BioForm";
import BioForm from "@/components/bio-generator/BioForm";
import ResultsSection from "@/components/bio-generator/ResultsSection";
import AdSlot from "@/components/caption-generator/AdSlot";
import styles from "@/styles/bio-generator/BioGeneratorPage.module.css";

type Status = "idle" | "loading" | "success" | "error";

export default function BioGeneratorPage() {
  const [status, setStatus] = useState<Status>("idle");
  const [bios, setBios] = useState<Bio[]>([]);
  const [errorMessage, setErrorMessage] = useState("");
  const lastPayloadRef = useRef<(GenerateBioPayload & { regenerate?: boolean }) | null>(null);

  const callApi = useCallback(
    async (payload: GenerateBioPayload & { regenerate?: boolean }) => {
      setStatus("loading");
      setErrorMessage("");
      lastPayloadRef.current = payload;

      try {
        const res = await fetch("/api/generate-bio", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            platform: payload.platform,
            tone: payload.tone,
            niche: payload.niche,
            traits: payload.traits,
            char_limit: payload.char_limit,
            regenerate: payload.regenerate ?? false,
          }),
        });

        const data = await res.json();

        if (!res.ok || data.error) {
          setErrorMessage(data.message || "Something went wrong. Please try again.");
          setStatus("error");
          return;
        }

        setBios(data.bios);
        setStatus("success");
      } catch {
        setErrorMessage("Network error. Please check your connection and try again.");
        setStatus("error");
      }
    },
    []
  );

  const handleSubmit = useCallback(
    (payload: GenerateBioPayload) => callApi({ ...payload, regenerate: false }),
    [callApi]
  );

  const handleRegenerate = useCallback(() => {
    if (lastPayloadRef.current) {
      callApi({ ...lastPayloadRef.current, regenerate: true });
    }
  }, [callApi]);

  const handleRetry = useCallback(() => {
    if (lastPayloadRef.current) {
      callApi(lastPayloadRef.current);
    }
  }, [callApi]);

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        {/* Hero / SEO header */}
        <div className={styles.hero}>
          <h1 className={styles.h1}>Free AI Bio Generator for Social Media</h1>
          <p className={styles.intro}>
            Your bio is the first thing people read on your profile — make it count. This free AI
            bio generator writes ready-to-use bios for Instagram, TikTok, LinkedIn, and Twitter in
            seconds. Enter your niche and a few key traits, choose your platform and tone, and get
            three unique bio variants instantly. Copy the one that fits, paste it into your profile,
            and go. No sign-up. No cost.
          </p>
        </div>

        {/* Tool */}
        <div className={styles.toolSection}>
          <BioForm onSubmit={handleSubmit} isLoading={status === "loading"} />

          <div className={styles.adWrapper}>
            <AdSlot />
          </div>

          <ResultsSection
            status={status}
            bios={bios}
            errorMessage={errorMessage}
            onRegenerate={handleRegenerate}
            onRetry={handleRetry}
          />
        </div>

        {/* SEO content */}
        <div className={styles.seoContent}>
          <div className={styles.seoSection}>
            <h2>How the AI Bio Generator Works</h2>
            <p>
              Select your platform and tone, enter your niche and a few key traits that define you,
              then click Generate. The AI produces three distinct bio variants tailored to your
              platform&apos;s character limits and culture. Copy the one you like and paste it
              straight into your profile.
            </p>
          </div>
          <div className={styles.seoSection}>
            <h2>Bios for Every Platform — Instagram, TikTok, LinkedIn &amp; Twitter</h2>
            <p>
              Every platform has different bio conventions. Instagram rewards personality and emojis,
              TikTok demands punchy 80-character hooks, LinkedIn values professional authority, and
              Twitter/X rewards wit and brevity. This tool generates bios that fit the platform
              you&apos;re writing for.
            </p>
          </div>
          <div className={styles.seoSection}>
            <h2>Choose Your Tone: Casual, Funny, Professional or Inspirational</h2>
            <p>
              Match your bio to your brand voice. Casual for everyday creators, Funny for
              personality-driven accounts, Professional for B2B and career-focused profiles, and
              Inspirational for coaches and mission-driven creators.
            </p>
          </div>
          <div className={styles.seoSection}>
            <h2>Get 3 Bio Variants — Pick the One That Fits</h2>
            <p>
              Three bios mean three different angles on your identity. You might prefer the punchy
              version today and the story-driven one tomorrow. Each variant is a complete,
              ready-to-use bio — not a template with blanks to fill.
            </p>
          </div>
          <div className={styles.seoSection}>
            <h2>More Free AI Tools for Creators</h2>
            <p>
              Pair your new bio with a great caption.{" "}
              <a href="/caption-generator" className={styles.internalLink}>
                Try the AI Caption Generator →
              </a>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
