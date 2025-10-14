"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import styles from "./landing.module.css";

export default function LandingPage() {
  const handleKnowMore = () => {
    const el = document.getElementById("features");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <main className={styles.wrapper}>
      <header className={styles.nav}>
        <div className={styles.brand}>
          <span className={styles.logoCircle}>
            <Image src="/images/wwlogo.png" width={30} height={30} alt="WasteWise Logo" />
          </span>
          <span>WasteWise</span>
        </div>
        <nav className={styles.links}>
          <a href="#features">System Features</a>
            <a href="#faq">FAQ</a>
        </nav>
        <div className={styles.authBtns}>
          <Link href="/login" className={styles.loginBtn}>Login</Link>
        </div>
      </header>

      <section className={styles.hero}>
        <div className={styles.heroContainer}>
          <div className={styles.heroContent}>
            <h1>Smart Waste Management & Reporting</h1>
            <p>Optimize collection schedules, report violations, and empower cleaner communities with data-driven insights.</p>
            <div className={styles.heroActions}>
              <Link href="/login" className={styles.primaryAction}>Get Started</Link>
              <button type="button" className={styles.secondaryAction} onClick={handleKnowMore}>
                Get to Know More
              </button>
            </div>
          </div>
          <div className={styles.heroVisual}>
            <Image
              src="/images/trash.png"
              width={350}
              height={350}
              alt="Waste Illustration"
              className={styles.heroImage}
              priority
            />
          </div>
        </div>
      </section>

      <section id="features" className={styles.sectionCompact}>
        <div className={styles.blockContainer}>
          <div className={styles.blockHeader}>
            <h2>Core Features</h2>
            <p>Everything you need to manage waste operations and reporting effectively.</p>
          </div>
          <div className={styles.featuresGrid}>
            <Feature title="View Schedules" desc="Access optimized waste collection schedules in your area." iconClass="fa-solid fa-calendar-days" />
            <Feature title="Report Violation" desc="Submit waste disposal violations with photos & location." iconClass="fa-solid fa-triangle-exclamation" />
            <Feature title="Locate Recycling Centers" desc="Find nearby recycling and proper disposal locations." iconClass="fa-solid fa-recycle" />
          </div>
        </div>
      </section>

      <section id="faq" className={styles.sectionCompact}>
        <div className={styles.blockContainer}>
          <div className={styles.blockHeader}>
            <h2>Frequently Asked Questions</h2>
            <p>Answers based on the features currently available in the system.</p>
          </div>
          <FAQList items={[
            { q: "Do I need an account to use the system?", a: "Yes. You must log in to view schedules, report violations, and locate recycling centers." },
            { q: "How do I view collection schedules?", a: "After logging in, go to the schedules section to see upcoming collection days in your area." },
            { q: "How do I report a waste violation?", a: "Use the Report Violation feature, fill details, and optionally attach a photo and location." },
            { q: "Can I locate recycling centers?", a: "Yes. Use the Locate Recycling Centers feature to view available nearby facilities." },
            { q: "Can I edit or delete a submitted violation report?", a: "Currently reports cannot be edited. Submit a new one if correction is needed." }
          ]}/>
        </div>
      </section>

      <LandingFooter />
    </main>
  );
}

function Feature({ title, desc, iconClass }) {
  return (
    <div className={styles.featureItemCard}>
      <div className={styles.featureIconWrap}>
        <i className={iconClass} aria-hidden="true"></i>
      </div>
      <div className={styles.featureTexts}>
        <h3>{title}</h3>
        <p>{desc}</p>
      </div>
    </div>
  );
}

function FAQList({ items }) {
  return (
    <div className={styles.faqAccordion}>
      {items.map((f, i) => <FAQItem key={i} q={f.q} a={f.a} />)}
    </div>
  );
}

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`${styles.faqCard} ${open ? styles.faqOpen : ""}`}>
      <button
        type="button"
        className={styles.faqToggle}
        aria-expanded={open}
        onClick={() => setOpen(o => !o)}
      >
        <span>{q}</span>
        <span className={styles.faqIcon}>{open ? "−" : "+"}</span>
      </button>
      <div className={styles.faqAnswer} style={{ maxHeight: open ? "260px" : "0px" }}>
        <p>{a}</p>
      </div>
    </div>
  );
}

function LandingFooter() {
  return (
    <footer className={styles.landingFooter}>
      <div className={styles.footerLogoCircle}>
        <img src="/images/wwlogo.png" alt="WasteWise Logo" className={styles.footerLogoImg} />
      </div>
      <h2 className={styles.footerTitle}>WasteWise</h2>
      <p className={styles.footerSubtitle}>Smart waste management for a greener future</p>
      <p className={styles.footerCopy}>© 2025 ArcMon Techies. All rights reserved.</p>
    </footer>
  );
}