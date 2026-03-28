import styles from "@/styles/caption-generator/AdSlot.module.css";

export default function AdSlot() {
  return (
    <div className={styles.adSlot} aria-label="Advertisement">
      <span className={styles.label}>Advertisement</span>
    </div>
  );
}
