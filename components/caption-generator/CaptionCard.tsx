"use client";

import { useState, useCallback } from "react";
import type { Caption } from "@/lib/caption-generator/types";
import styles from "@/styles/caption-generator/CaptionCard.module.css";

interface CaptionCardProps {
  caption: Caption;
  index: number;
}

export function CaptionCardSkeleton() {
  return (
    <div className={styles.skeletonCard} aria-hidden="true">
      <div className={`${styles.skeletonBar} ${styles.skeletonHeader}`} />
      <div className={`${styles.skeletonBar} ${styles.skeletonLine}`} />
      <div className={`${styles.skeletonBar} ${styles.skeletonLineShort}`} />
      <div className={`${styles.skeletonBar} ${styles.skeletonHashtags}`} />
    </div>
  );
}

export default function CaptionCard({ caption, index }: CaptionCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    const text = caption.text + (caption.hashtags.length > 0 ? "\n" + caption.hashtags.join(" ") : "");
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // Fallback for older browsers
      const el = document.createElement("textarea");
      el.value = text;
      el.style.position = "fixed";
      el.style.opacity = "0";
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [caption]);

  return (
    <article className={styles.card}>
      <div className={styles.header}>
        <h3 className={styles.label}>Caption {index + 1}</h3>
        <button
          className={`${styles.copyButton} ${copied ? styles.copyButtonCopied : ""}`}
          onClick={handleCopy}
          aria-label={copied ? "Caption copied to clipboard" : `Copy caption ${index + 1}`}
        >
          {copied ? "✓ Copied!" : "Copy"}
        </button>
      </div>
      <p className={styles.bodyText}>{caption.text}</p>
      {caption.hashtags.length > 0 && (
        <p className={styles.hashtags}>{caption.hashtags.join(" ")}</p>
      )}
    </article>
  );
}
