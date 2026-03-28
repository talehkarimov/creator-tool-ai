"use client";

import type { Bio } from "@/lib/bio-generator/types";
import BioCard, { BioCardSkeleton } from "./BioCard";
import styles from "@/styles/bio-generator/ResultsSection.module.css";

type Status = "idle" | "loading" | "success" | "error";

interface ResultsSectionProps {
  status: Status;
  bios: Bio[];
  errorMessage: string;
  onRegenerate: () => void;
  onRetry: () => void;
}

export default function ResultsSection({
  status,
  bios,
  errorMessage,
  onRegenerate,
  onRetry,
}: ResultsSectionProps) {
  const hidden = status === "idle";

  return (
    <section
      className={hidden ? styles.sectionHidden : styles.section}
      aria-live="polite"
      aria-label="Bio results"
      aria-hidden={hidden}
    >
      {status === "loading" && (
        <div className={styles.cards}>
          <BioCardSkeleton />
          <BioCardSkeleton />
          <BioCardSkeleton />
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
            {bios.map((bio, i) => (
              <BioCard key={bio.id} bio={bio} index={i} />
            ))}
          </div>
          <button className={styles.regenerateButton} onClick={onRegenerate}>
            Regenerate
          </button>
        </>
      )}
    </section>
  );
}
