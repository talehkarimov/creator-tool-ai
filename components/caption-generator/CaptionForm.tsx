"use client";

import { useState, useCallback } from "react";
import type { Platform, Tone } from "@/lib/caption-generator/types";
import styles from "@/styles/caption-generator/CaptionForm.module.css";

export interface GenerateCaptionPayload {
  topic: string;
  platform: Platform;
  tone: Tone;
  hashtag_count: number;
}

interface CaptionFormProps {
  onSubmit: (payload: GenerateCaptionPayload) => void;
  isLoading: boolean;
}

export default function CaptionForm({ onSubmit, isLoading }: CaptionFormProps) {
  const [topic, setTopic] = useState("");
  const [platform, setPlatform] = useState<string>("");
  const [tone, setTone] = useState<string>("");
  const [hashtagCount, setHashtagCount] = useState<number>(5);

  const [topicError, setTopicError] = useState("");
  const [platformError, setPlatformError] = useState("");
  const [toneError, setToneError] = useState("");

  const isValid = topic.trim().length > 0 && platform !== "" && tone !== "";

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();

      let valid = true;
      if (!topic.trim()) { setTopicError("Please describe your topic"); valid = false; }
      if (!platform) { setPlatformError("Please select a platform"); valid = false; }
      if (!tone) { setToneError("Please select a tone"); valid = false; }
      if (!valid) return;

      onSubmit({
        topic: topic.trim(),
        platform: platform as Platform,
        tone: tone as Tone,
        hashtag_count: hashtagCount,
      });
    },
    [topic, platform, tone, hashtagCount, onSubmit]
  );

  const charCount = topic.length;
  const charOver = charCount > 180;

  return (
    <section className={styles.card}>
      <h2 className="sr-only">Generate your captions</h2>
      <form
        onSubmit={handleSubmit}
        role="form"
        aria-label="Caption generator"
        noValidate
      >
        {/* Topic */}
        <div className={styles.field}>
          <label htmlFor="topic" className={styles.label}>
            Topic <span className={styles.required}>*</span>
          </label>
          <textarea
            id="topic"
            className={`${styles.textarea} ${topicError ? styles.textareaError : ""}`}
            value={topic}
            onChange={(e) => {
              setTopic(e.target.value.slice(0, 200));
              if (topicError && e.target.value.trim()) setTopicError("");
            }}
            onBlur={() => { if (!topic.trim()) setTopicError("Please describe your topic"); }}
            placeholder="e.g. Morning coffee routine for productivity"
            rows={3}
            aria-required="true"
            aria-describedby="topic-counter topic-error"
          />
          <span
            id="topic-counter"
            className={`${styles.charCounter} ${charOver ? styles.charCounterOver : ""}`}
          >
            {charCount} / 200
          </span>
          {topicError && (
            <span id="topic-error" className={styles.fieldError} role="alert">
              {topicError}
            </span>
          )}
        </div>

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
              <span id="platform-error" className={styles.fieldError} role="alert">
                {platformError}
              </span>
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
              <span id="tone-error" className={styles.fieldError} role="alert">
                {toneError}
              </span>
            )}
          </div>
        </div>

        {/* Hashtag count */}
        <div className={styles.field} style={{ marginTop: 16 }}>
          <label htmlFor="hashtag-count" className={styles.label}>
            Hashtags (0–10)
          </label>
          <input
            id="hashtag-count"
            type="number"
            className={styles.numberInput}
            min={0}
            max={10}
            step={1}
            value={hashtagCount}
            onChange={(e) => setHashtagCount(Math.min(10, Math.max(0, Number(e.target.value))))}
            onBlur={(e) => setHashtagCount(Math.min(10, Math.max(0, Number(e.target.value) || 0)))}
          />
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
            "Generate Captions"
          )}
        </button>
      </form>
    </section>
  );
}
