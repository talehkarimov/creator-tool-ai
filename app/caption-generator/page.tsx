"use client";

import { useState, useCallback, useRef } from "react";
import type { Caption } from "@/lib/caption-generator/types";
import type { GenerateCaptionPayload } from "@/components/caption-generator/CaptionForm";
import CaptionForm from "@/components/caption-generator/CaptionForm";
import ResultsSection from "@/components/caption-generator/ResultsSection";
import AdSlot from "@/components/caption-generator/AdSlot";
import styles from "@/styles/caption-generator/CaptionGeneratorPage.module.css";

// Note: export const metadata cannot coexist with "use client".
// Move metadata to a separate layout.tsx or a server wrapper if needed for SSR SEO.
// For MVP, title/meta are set via the root layout and can be overridden with next/head if required.

type Status = "idle" | "loading" | "success" | "error";

export default function CaptionGeneratorPage() {
  const [status, setStatus] = useState<Status>("idle");
  const [captions, setCaptions] = useState<Caption[]>([]);
  const [errorMessage, setErrorMessage] = useState("");
  const lastPayloadRef = useRef<(GenerateCaptionPayload & { regenerate?: boolean }) | null>(null);

  const callApi = useCallback(
    async (payload: GenerateCaptionPayload & { regenerate?: boolean }) => {
      setStatus("loading");
      setErrorMessage("");
      lastPayloadRef.current = payload;

      try {
        const res = await fetch("/api/generate-caption", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            topic: payload.topic,
            platform: payload.platform,
            tone: payload.tone,
            hashtag_count: payload.hashtag_count,
            regenerate: payload.regenerate ?? false,
          }),
        });

        const data = await res.json();

        if (!res.ok || data.error) {
          setErrorMessage(data.message || "Something went wrong. Please try again.");
          setStatus("error");
          return;
        }

        setCaptions(data.captions);
        setStatus("success");
      } catch {
        setErrorMessage("Network error. Please check your connection and try again.");
        setStatus("error");
      }
    },
    []
  );

  const handleSubmit = useCallback(
    (payload: GenerateCaptionPayload) => callApi({ ...payload, regenerate: false }),
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
          <h1 className={styles.h1}>Free AI Caption Generator for Social Media</h1>
          <p className={styles.intro}>
            Writing the perfect caption takes time — time most content creators don&apos;t have.
            This free AI caption generator produces ready-to-use captions for Instagram, TikTok,
            LinkedIn, and Twitter in seconds. Just enter your topic, choose your platform and tone,
            and let the AI do the work. Get three unique caption variants — complete with hashtags —
            on every request. Copy your favorite with one click and go. No sign-up. No cost. Just
            captions that work.
          </p>
        </div>

        {/* Tool */}
        <div className={styles.toolSection}>
          <CaptionForm onSubmit={handleSubmit} isLoading={status === "loading"} />

          {/* Ad slot — always in DOM, visually present once status moves past idle */}
          <div className={styles.adWrapper}>
            <AdSlot />
          </div>

          <ResultsSection
            status={status}
            captions={captions}
            errorMessage={errorMessage}
            onRegenerate={handleRegenerate}
            onRetry={handleRetry}
          />
        </div>

        {/* SEO content */}
        <div className={styles.seoContent}>
          <div className={styles.seoSection}>
            <h2>How the AI Caption Generator Works</h2>
            <p>
              Enter your topic, select your platform, choose a tone, and click Generate. The AI
              produces three unique captions tailored to your platform&apos;s style and your chosen
              voice — complete with hashtags. Copy the one you like and post it directly.
            </p>
          </div>
          <div className={styles.seoSection}>
            <h2>Captions for Every Platform — Instagram, TikTok, LinkedIn &amp; Twitter</h2>
            <p>
              Each platform has its own culture. Instagram rewards authenticity, TikTok loves
              punchy hooks, LinkedIn expects professional insight, and Twitter/X demands brevity.
              This tool generates captions that fit the platform you&apos;re posting on.
            </p>
          </div>
          <div className={styles.seoSection}>
            <h2>Choose Your Tone: Casual, Funny, Professional or Inspirational</h2>
            <p>
              Match your brand voice with four tone options. Casual for everyday content, Funny
              for humor-driven posts, Professional for business audiences, and Inspirational for
              motivational messaging.
            </p>
          </div>
          <div className={styles.seoSection}>
            <h2>Generate Captions With the Right Hashtags</h2>
            <p>
              Control exactly how many hashtags appear with each caption — from 0 to 10. Hashtags
              are kept separate from the caption body so you can copy them together or adjust as
              needed.
            </p>
          </div>
          <div className={styles.seoSection}>
            <h2>More Free AI Tools for Creators</h2>
            <p>
              Pair your captions with a standout profile.{" "}
              <a href="/bio-generator" className={styles.internalLink}>
                Try the AI Bio Generator →
              </a>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
