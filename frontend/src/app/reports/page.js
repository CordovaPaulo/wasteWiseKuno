"use client";

import { useState, useRef } from "react";
import styles from "./reports.module.css";

export default function ReportsPage() {
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [image, setImage] = useState(null);
  const imageInputRef = useRef();

  function handleImageChange(e) {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
    } else {
      setImage(null);
    }
  }

  function handleImageBoxClick() {
    if (imageInputRef.current) {
      imageInputRef.current.click();
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    setDescription("");
    setLocation("");
    setImage(null);
    if (imageInputRef.current) imageInputRef.current.value = "";
  }

  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <div className={styles.pageLabel}>Reports</div>
        <p className={styles.pageDesc}>
          Create a new report or view your previously submitted reports.
        </p>
      </header>
      <section className={styles.section}>
        <div className={styles.whiteContainer}>
          <div className={styles.reportCreateLabel}>Create Report</div>
          <form className={styles.createReportForm} onSubmit={handleSubmit}>
            {/* Title input box and label */}
            <label style={{ fontWeight: "bold", color: "#222", marginBottom: "0.4rem", display: "block", fontSize: "1rem" }}>
              Title
            </label>
            <input
              type="text"
              placeholder="Enter report title"
              style={{
                width: "100%",
                padding: "0.7rem 1rem",
                borderRadius: "0.8rem",
                border: "1px solid #d1d5db",
                fontSize: "0.95rem",
                outline: "none",
                marginBottom: "1rem",
                background: "white",
                color: "#222",
              }}
              required
            />
            <label style={{ fontWeight: "bold", color: "#222", marginBottom: "0.4rem", display: "block", fontSize: "1rem" }}>
              Description
            </label>
            <input
              type="text"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Describe the illegal dumping activity"
              style={{
                width: "100%",
                padding: "0.7rem 1rem",
                borderRadius: "0.8rem",
                border: "1px solid #d1d5db",
                fontSize: "0.95rem",
                outline: "none",
                marginBottom: "1rem",
                background: "white",
                color: "#222",
              }}
              required
            />
            <div style={{ display: "flex", gap: "0.7rem" }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontWeight: "bold", color: "#222", marginBottom: "0.4rem", display: "block", fontSize: "1rem" }}>
                  Location
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  placeholder="Will be replaced by map locator"
                  style={{
                    width: "100%",
                    padding: "0.7rem 1rem",
                    borderRadius: "0.8rem",
                    border: "1px solid #d1d5db",
                    fontSize: "0.95rem",
                    outline: "none",
                    marginBottom: "0.4rem",
                    background: "white",
                    color: "#222",
                  }}
                  required
                />
              </div>
              <div
                className={styles.imageUploadBox}
                onClick={handleImageBoxClick}
                tabIndex={0}
                role="button"
              >
                <input
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  ref={imageInputRef}
                  onChange={handleImageChange}
                />
                <i className="fa-solid fa-camera" style={{ fontSize: "1.3rem", color: "#F44336" }}></i>
                <div style={{ fontWeight: "bold", color: "#222", fontSize: "0.95rem" }}>
                  Click to upload or drag and drop
                </div>
                <div style={{ fontSize: "0.95rem", color: "#888" }}>
                  {image ? image.name : "No photo uploaded"}
                </div>
                {image && (
                  <img
                    src={URL.createObjectURL(image)}
                    alt="Preview"
                    style={{
                      marginTop: "0.4rem",
                      maxWidth: "100%",
                      maxHeight: "100px",
                      borderRadius: "0.5rem",
                    }}
                  />
                )}
              </div>
            </div>
            <div className={styles.formActions}>
              <button
                type="submit"
                className={styles.formButton}
              >
                <i className="fa-solid fa-paper-plane" style={{ marginRight: "0.6em" }}></i>
                Submit Report
              </button>
            </div>
          </form>
        </div>
        <div className={styles.whiteContainer}>
          <div className={styles.previousReportsLabel}>Previous Reports</div>
          <ul className={styles.reportItems}>
            <li className={styles.reportItem}>
              <div className={styles.reportItemHeader}>
                <div className={styles.reportText}><strong>Title:</strong> Illegal dumping of garbage bags near Main St.</div>
                <span className={styles.reportDate}>2025-09-25 09:15 AM</span>
              </div>
              <div className={styles.reportItemBody}>
                <div className={styles.reportLocation}><strong>Location:</strong> Barangay 12, Main St.</div>
                <div className={styles.reportDescription}><strong>Description:</strong> Garbage bags were left near the main street entrance, blocking pedestrian access.</div>
                <div className={styles.reportImageWrapper}>
                  <img
                    src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80"
                    alt="Report"
                    className={styles.reportImage}
                  />
                </div>
              </div>
            </li>
            <li className={styles.reportItem}>
              <div className={styles.reportItemHeader}>
                <div className={styles.reportText}><strong>Title:</strong> Overflowing bins at park entrance.</div>
                <span className={styles.reportDate}>2025-09-24 04:30 PM</span>
              </div>
              <div className={styles.reportItemBody}>
                <div className={styles.reportLocation}><strong>Location:</strong> City Park, Gate 2</div>
                <div className={styles.reportDescription}><strong>Description:</strong> Trash bins at the park entrance have not been emptied and are overflowing.</div>
                <div className={styles.reportImageWrapper}>
                  <img
                    src="https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=400&q=80"
                    alt="Report"
                    className={styles.reportImage}
                  />
                </div>
              </div>
            </li>
            <li className={styles.reportItem}>
              <div className={styles.reportItemHeader}>
                <div className={styles.reportText}><strong>Title:</strong> Uncollected trash for 3 days.</div>
                <span className={styles.reportDate}>2025-09-23 11:00 AM</span>
              </div>
              <div className={styles.reportItemBody}>
                <div className={styles.reportLocation}><strong>Location:</strong> Riverside Ave.</div>
                <div className={styles.reportDescription}><strong>Description:</strong> Trash has not been collected for three days, causing unpleasant odors.</div>
                <div className={styles.reportImageWrapper}>
                  <img
                    src="https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?auto=format&fit=crop&w=400&q=80"
                    alt="Report"
                    className={styles.reportImage}
                  />
                </div>
              </div>
            </li>
          </ul>
        </div>
      </section>
    </main>
  );
}
