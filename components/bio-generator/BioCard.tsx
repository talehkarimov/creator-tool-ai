"use client";

import { useState, useCallback } from "react";
import type { Bio } from "@/lib/bio-generator/types";
import styles from "@/styles/bio-generator/BioCard.module.css";

interface BioCardProps {
  bio: Bio;
  index: number;
}

export function BioCardSkeleton() {
  return (
    <div className={styles.skeletonCard} aria-hidden="true">
      <div className={`${styles.skeletonBar} ${styles.skeletonHeader}`} />
      <div className={`${styles.skeletonBar} ${styles.skeletonLine}`} />
      <div className={`${styles.skeletonBar} ${styles.skeletonLineShort}`} />
    </div>
  );
}

export default function BioCard({ bio, index }: BioCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(bio.text);
    } catch {
      const el = document.createElement("textarea");
      el.value = bio.text;
      el.style.position = "fixed";
      el.style.opacity = "0";
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [bio.text]);

  return (
    <article className={styles.card}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h3 className={styles.label}>Bio {index + 1}</h3>
          <span className={styles.charBadge}>{bio.text.length} chars</span>
        </div>
        <button
          className={`${styles.copyButton} ${copied ? styles.copyButtonCopied : ""}`}
          onClick={handleCopy}
          aria-label={copied ? "Bio copied to clipboard" : `Copy bio ${index + 1}`}
        >
          {copied ? "✓ Copied!" : "Copy"}
        </button>
      </div>
      <p className={styles.bodyText}>{bio.text}</p>
    </article>
  );
}
