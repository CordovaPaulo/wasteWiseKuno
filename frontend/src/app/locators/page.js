"use client";

import styles from "./locators.module.css";

export default function LocatorsPage() {
  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <div className={styles.pageLabel}>Locators</div>
        <p className={styles.pageDesc}>
          Locate nearby recycling facilities, junk shops, and other waste drop-off points in your area.
        </p>
      </header>
      <section className={styles.section}>
        <div className={styles.mapPlaceholder}>
          Map coming soon
        </div>
      </section>
    </main>
  );
}
