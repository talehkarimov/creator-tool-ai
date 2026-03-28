"use client";

import { useState, useCallback } from "react";
import type { Platform, Tone } from "@/lib/bio-generator/types";
import styles from "@/styles/bio-generator/BioForm.module.css";

export interface GenerateBioPayload {
  platform: Platform;
  tone: Tone;
  niche: string;
  traits: string;
  char_limit: number;
}

interface BioFormProps {
  onSubmit: (payload: GenerateBioPayload) => void;
  isLoading: boolean;
}

export default function BioForm({ onSubmit, isLoading }: BioFormProps) {
  const [platform, setPlatform] = useState("");
  const [tone, setTone] = useState("");
  const [niche, setNiche] = useState("");
  const [traits, setTraits] = useState("");

  const [platformError, setPlatformError] = useState("");
  const [toneError, setToneError] = useState("");
  const [nicheError, setNicheError] = useState("");
  const [traitsError, setTraitsError] = useState("");

  const isValid =
    platform !== "" && tone !== "" && niche.trim().length > 0 && traits.trim().length > 0;

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      let valid = true;
      if (!platform) { setPlatformError("Please select a platform"); valid = false; }
      if (!tone) { setToneError("Please select a tone"); valid = false; }
      if (!niche.trim()) { setNicheError("Please describe your niche"); valid = false; }
      if (!traits.trim()) { setTraitsError("Please enter your key traits"); valid = false; }
      if (!valid) return;

      onSubmit({
        platform: platform as Platform,
        tone: tone as Tone,
        niche: niche.trim(),
        traits: traits.trim(),
        char_limit: 0, // use platform default
      });
    },
    [platform, tone, niche, traits, onSubmit]
  );

  return (
    <section className={styles.card}>
      <h2 className="sr-only">Generate your bios</h2>
      <form onSubmit={handleSubmit} role="form" aria-label="Bio generator" noValidate>

        {/* Platform + Tone */}
        <div className={styles.row}>
          <div className={styles.field} style={{ marginBottom: 0 }}>
            <label htmlFor="platform" className={styles.label}>
              Platform <span className={styles.required}>*</span>
            </label>
            <select
              id="platform"
              className={`${styles.select} ${platformError ? styles.selectError : ""}`}
              value={platform}
              onChange={(e) => { setPlatform(e.target.value); if (platformError) setPlatformError(""); }}
              onBlur={() => { if (!platform) setPlatformError("Please select a platform"); }}
              aria-required="true"
              aria-describedby="platform-error"
            >
              <option value="" disabled>Select platform</option>
              <option value="instagram">Instagram</option>
              <option value="tiktok">TikTok</option>
              <option value="linkedin">LinkedIn</option>
              <option value="twitter">Twitter / X</option>
            </select>
            {platformError && (
              <span id="platform-error" className={styles.fieldError} role="alert">{platformError}</span>
            )}
          </div>

          <div className={styles.field} style={{ marginBottom: 0 }}>
            <label htmlFor="tone" className={styles.label}>
              Tone <span className={styles.required}>*</span>
            </label>
            <select
              id="tone"
              className={`${styles.select} ${toneError ? styles.selectError : ""}`}
              value={tone}
              onChange={(e) => { setTone(e.target.value); if (toneError) setToneError(""); }}
              onBlur={() => { if (!tone) setToneError("Please select a tone"); }}
              aria-required="true"
              aria-describedby="tone-error"
            >
              <option value="" disabled>Select tone</option>
              <option value="casual">Casual</option>
              <option value="professional">Professional</option>
              <option value="funny">Funny</option>
              <option value="inspirational">Inspirational</option>
            </select>
            {toneError && (
              <span id="tone-error" className={styles.fieldError} role="alert">{toneError}</span>
            )}
          </div>
        </div>

        {/* Niche */}
        <div className={styles.field}>
          <label htmlFor="niche" className={styles.label}>
            Niche / Profession <span className={styles.required}>*</span>
          </label>
          <input
            id="niche"
            type="text"
            className={`${styles.input} ${nicheError ? styles.inputError : ""}`}
            value={niche}
            onChange={(e) => {
              setNiche(e.target.value.slice(0, 100));
              if (nicheError && e.target.value.trim()) setNicheError("");
            }}
            onBlur={() => { if (!niche.trim()) setNicheError("Please describe your niche"); }}
            placeholder="e.g. fitness coach, travel photographer, software engineer"
            maxLength={100}
            aria-required="true"
            aria-describedby="niche-counter niche-error"
          />
          <span
            id="niche-counter"
            className={`${styles.charCounter} ${niche.length > 90 ? styles.charCounterOver : ""}`}
          >
            {niche.length} / 100
          </span>
          {nicheError && (
            <span id="niche-error" className={styles.fieldError} role="alert">{nicheError}</span>
          )}
        </div>

        {/* Traits */}
        <div className={styles.field}>
          <label htmlFor="traits" className={styles.label}>
            Key Traits <span className={styles.required}>*</span>
          </label>
          <input
            id="traits"
            type="text"
            className={`${styles.input} ${traitsError ? styles.inputError : ""}`}
            value={traits}
            onChange={(e) => {
              setTraits(e.target.value.slice(0, 150));
              if (traitsError && e.target.value.trim()) setTraitsError("");
            }}
            onBlur={() => { if (!traits.trim()) setTraitsError("Please enter your key traits"); }}
            placeholder="e.g. marathon runner, dog lover, coffee addict"
            maxLength={150}
            aria-required="true"
            aria-describedby="traits-counter traits-error"
          />
          <span
            id="traits-counter"
            className={`${styles.charCounter} ${traits.length > 135 ? styles.charCounterOver : ""}`}
          >
            {traits.length} / 150
          </span>
          {traitsError && (
            <span id="traits-error" className={styles.fieldError} role="alert">{traitsError}</span>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          className={styles.submitButton}
          disabled={isLoading || !isValid}
          aria-busy={isLoading}
          aria-disabled={isLoading || !isValid}
        >
          {isLoading ? (
            <>
              <span className={styles.spinner} aria-hidden="true" />
              Generating…
            </>
          ) : (
            "Generate Bios"
          )}
        </button>
      </form>
    </section>
  );
}
