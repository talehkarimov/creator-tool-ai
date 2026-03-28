"use client";

import type { Caption } from "@/lib/caption-generator/types";
import CaptionCard, { CaptionCardSkeleton } from "./CaptionCard";
import styles from "@/styles/caption-generator/ResultsSection.module.css";

type Status = "idle" | "loading" | "success" | "error";

interface ResultsSectionProps {
  status: Status;
  captions: Caption[];
  errorMessage: string;
  onRegenerate: () => void;
  onRetry: () => void;
}

export default function ResultsSection({
  status,
  captions,
  errorMessage,
  onRegenerate,
  onRetry,
}: ResultsSectionProps) {
  const hidden = status === "idle";

  return (
    <section
      className={hidden ? styles.sectionHidden : styles.section}
      aria-live="polite"
      aria-label="Caption results"
      aria-hidden={hidden}
    >
      {status === "loading" && (
        <div className={styles.cards}>
          <CaptionCardSkeleton />
          <CaptionCardSkeleton />
          <CaptionCardSkeleton />
        </div>
      )}

      {status === "error" && (
        <div className={styles.errorBanner} role="alert">
          <p className={styles.errorText}>
            {errorMessage || "Something went wrong. Please try again."}
          </p>
          <button className={styles.retryButton} onClick={onRetry}>
            Try Again
          </button>
        </div>
      )}

      {status === "success" && (
        <>
          <div className={styles.cards}>
            {captions.map((caption, i) => (
              <CaptionCard key={caption.id} caption={caption} index={i} />
            ))}
          </div>
          <button
            className={styles.regenerateButton}
            onClick={onRegenerate}
          >
            Regenerate
          </button>
        </>
      )}
    </section>
  );
}
