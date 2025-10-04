"use client";

import { useState, useRef, useEffect } from "react";
import api from "../../lib/axios";
import styles from "./reports.module.css";
import { get } from "http";

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
}


export default function ReportsPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [reports, setReports] = useState([]);
  const imageInputRef = useRef();

  useEffect(() => {
    async function fetchReports() {
      const authToken = getCookie("authToken");
      try {
        const response = await api.get("/api/user/reports", {
          headers: {
            'Authorization': `Bearer ${authToken}`,
          },
        });
        // Sort reports by date, most recent first
        const sortedReports = response.data.sort(
          (a, b) => new Date(b.date) - new Date(a.date)
        );
        setReports(sortedReports);
      } catch (error) {
        console.log(authToken)
        console.error("Error fetching reports:", error);
      }
    }
    fetchReports();
  }, []);

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

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg("");
    setErrorMsg("");

    const authToken = getCookie("authToken");

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("location", location);
      formData.append("date", new Date().toISOString());
      if (image) {
        formData.append("image", image);
      }

      const response = await api.post("/api/user/report", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${authToken}`,
        },
      });

      setSuccessMsg("Report submitted successfully!");
      setTitle("");
      setDescription("");
      setLocation("");
      setImage(null);
      if (imageInputRef.current) imageInputRef.current.value = "";
    } catch (error) {
      setErrorMsg(
        error?.response?.data?.message ||
          "Failed to submit report. Please try again."
      );
    } finally {
      setLoading(false);
    }
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
            <label
              style={{
                fontWeight: "bold",
                color: "#222",
                marginBottom: "0.4rem",
                display: "block",
                fontSize: "1rem",
              }}
            >
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
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
            <label
              style={{
                fontWeight: "bold",
                color: "#222",
                marginBottom: "0.4rem",
                display: "block",
                fontSize: "1rem",
              }}
            >
              Description
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
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
                <label
                  style={{
                    fontWeight: "bold",
                    color: "#222",
                    marginBottom: "0.4rem",
                    display: "block",
                    fontSize: "1rem",
                  }}
                >
                  Location
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
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
                <i
                  className="fa-solid fa-camera"
                  style={{ fontSize: "1.3rem", color: "#F44336" }}
                ></i>
                <div
                  style={{
                    fontWeight: "bold",
                    color: "#222",
                    fontSize: "0.95rem",
                  }}
                >
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
                disabled={loading}
              >
                <i
                  className="fa-solid fa-paper-plane"
                  style={{ marginRight: "0.6em" }}
                ></i>
                {loading ? "Submitting..." : "Submit Report"}
              </button>
            </div>
            {successMsg && (
              <div
                style={{
                  color: "#047857",
                  marginTop: "1rem",
                  fontWeight: "bold",
                }}
              >
                {successMsg}
              </div>
            )}
            {errorMsg && (
              <div
                style={{
                  color: "#F44336",
                  marginTop: "1rem",
                  fontWeight: "bold",
                }}
              >
                {errorMsg}
              </div>
            )}
          </form>
        </div>
        <div className={styles.whiteContainer}>
          <div className={styles.previousReportsLabel}>Previous Reports</div>
          <ul className={styles.reportItems}>
            {reports.length === 0 && (
              <li
                style={{
                  color: "#888",
                  padding: "1.5rem",
                  textAlign: "center",
                }}
              >
                No reports found.
              </li>
            )}
            {reports.map((report) => (
              <li
                className={styles.reportItem}
                key={report._id}
                style={{
                  background: "#f9f9f9",
                  borderRadius: "1.2rem",
                  marginBottom: "2rem",
                  boxShadow: "0 2px 8px #04785722",
                  padding: "1.5rem 1.2rem",
                  display: "flex",
                  flexDirection: "column",
                  gap: "1.2rem",
                }}
              >
                <div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      marginBottom: "0.7rem",
                    }}
                  >
                    <span
                      style={{
                        fontWeight: "bold",
                        color: "#047857",
                        minWidth: "100px",
                      }}
                    >
                      Title:
                    </span>
                    <span
                      style={{
                        fontSize: "1.05rem",
                        color: "#222",
                        marginLeft: "0.5rem",
                      }}
                    >
                      {report.title}
                    </span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      marginBottom: "0.7rem",
                    }}
                  >
                    <span
                      style={{
                        fontWeight: "bold",
                        color: "#047857",
                        minWidth: "100px",
                      }}
                    >
                      Description:
                    </span>
                    <span
                      style={{
                        fontSize: "1rem",
                        color: "#333",
                        marginLeft: "0.5rem",
                      }}
                    >
                      {report.description}
                    </span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      marginBottom: "0.7rem",
                    }}
                  >
                    <span
                      style={{
                        fontWeight: "bold",
                        color: "#047857",
                        minWidth: "100px",
                      }}
                    >
                      Location:
                    </span>
                    <span
                      style={{
                        fontSize: "1rem",
                        color: "#333",
                        marginLeft: "0.5rem",
                      }}
                    >
                      {report.location}
                    </span>
                  </div>
                  <div
                    style={{
                      fontWeight: "bold",
                      color: "#047857",
                      marginBottom: "0.3rem",
                    }}
                  >
                    Images:
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      gap: "1rem",
                      flexWrap: "wrap",
                      marginBottom: "0.7rem",
                    }}
                  >
                    {report.image && report.image.length > 0 ? (
                      report.image.map((img, idx) => (
                        <img
                          key={idx}
                          src={img}
                          alt={`Report ${idx + 1}`}
                          style={{
                            maxWidth: "350px",
                            maxHeight: "250px",
                            borderRadius: "0.7rem",
                            boxShadow: "0 2px 8px #04785722",
                            background: "#fff",
                            objectFit: "cover",
                          }}
                        />
                      ))
                    ) : (
                      <span
                        style={{
                          color: "#888",
                          fontSize: "0.95rem",
                          textAlign: "center",
                        }}
                      >
                        No image
                      </span>
                    )}
                  </div>
                  <div
                    style={{
                      textAlign: "right",
                      color: "#888",
                      fontSize: "0.95rem",
                    }}
                  >
                    {new Date(report.date).toLocaleString()}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}
