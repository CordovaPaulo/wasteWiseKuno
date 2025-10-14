"use client";

import AdminNavBar from "../componentsadmin/adminNavBar";
import styles from './areports.module.css';
import { useState, useEffect } from 'react';
import api from "../../../lib/axios";
import dynamic from "next/dynamic";
const MapPreview = dynamic(() => import("../../components/MapPreview"), { ssr: false });

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
}

export default function ViolationReports() {
  const [filter, setFilter] = useState('most-recent');
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState("");
  const [openMapId, setOpenMapId] = useState(null);

  // Fetch reports from backend on component mount
  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    const authToken = getCookie("authToken");
    try {
      setLoading(true);
      const response = await api.get("/api/admin/reports", {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });
      setReports(response.data);
      setError("");
    } catch (error) {
      setError("Failed to fetch reports. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleMarkResolved = async (reportId) => {
    const authToken = getCookie("authToken");
    try {
      await api.patch(`/api/admin/reports/${reportId}/manage`, {}, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      setReports(prev => prev.map(r => r._id === reportId ? { ...r, reportStatus: 'resolved' } : r));
    } catch {
      alert("Failed to update report status.");
    }
  };

  const handleDownloadReports = async () => {
    if (downloading) return;
    const authToken = getCookie("authToken");
    try {
      setDownloading(true);
      // Optional: adapt filters to query string
      const qs = ''; // or build from current filter if desired
      const resp = await api.get(`/api/admin/reports/download/pdf${qs}`, {
        responseType: 'blob',
        headers: { Authorization: `Bearer ${authToken}` }
      });
      const blob = new Blob([resp.data], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `waste-reports-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      alert("Failed to download reports PDF.");
    } finally {
      setDownloading(false);
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Filter and sort reports based on selected filter
  const getFilteredReports = () => {
    let filteredReports = [...reports];

    // Always sort by date first (most recent by default)
    filteredReports.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Then apply filters
    if (filter === 'resolved') {
      filteredReports = filteredReports.filter(report => report.reportStatus === 'resolved');
    } else if (filter === 'pending') {
      filteredReports = filteredReports.filter(report => report.reportStatus === 'pending');
    } else if (filter === 'oldest') {
      // Resort for oldest first
      filteredReports.sort((a, b) => new Date(a.date) - new Date(b.date));
    }
    // 'all' and 'most-recent' use the default sort (most recent first)

    return filteredReports;
  };

  const filteredReports = getFilteredReports();

  if (loading) {
    return (
      <>
        <AdminNavBar />
        <main className={styles.reportsMain}>
          <div className={styles.container}>
            <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
              Loading reports...
            </div>
          </div>
        </main>
      </>
    );
  }

  if (error) {
    return (
      <>
        <AdminNavBar />
        <main className={styles.reportsMain}>
          <div className={styles.container}>
            <div style={{ textAlign: 'center', padding: '2rem', color: '#F44336' }}>
              {error}
              <button 
                onClick={fetchReports}
                style={{ 
                  marginLeft: '1rem', 
                  padding: '0.5rem 1rem', 
                  background: '#047857', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '0.5rem' 
                }}
              >
                Retry
              </button>
            </div>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <AdminNavBar />
      <main className={styles.reportsMain}>
        <div className={styles.container}>
          <div className={styles.header}>
            <h1 className={styles.title}>Violation Reports</h1>
            <div className={styles.headerControls}>
              <div className={styles.filterSection}>
                <label htmlFor="report-filter" className={styles.filterLabel}>
                  Filter:
                </label>
                <select 
                  id="report-filter"
                  className={styles.filterSelect}
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                >
                  <option value="most-recent">Most Recent</option>
                  <option value="all">All Reports</option>
                  <option value="resolved">Resolved</option>
                  <option value="pending">Pending</option>
                  <option value="oldest">Oldest</option>
                </select>
              </div>
              <button
                className={styles.downloadBtn}
                onClick={handleDownloadReports}
                disabled={downloading}
                title="Download all reports as PDF file"
              >
                <i className="fas fa-download"></i>
                {downloading ? 'Generating...' : 'Download Reports'}
              </button>
            </div>
          </div>
          
          <div className={styles.reportsContainer}>
            <h2 className={styles.sectionTitle}>
              Recent Reports ({filteredReports.length})
            </h2>
            
            <div className={styles.reportsList}>
              {filteredReports.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
                  No reports found for the selected filter.
                </div>
              ) : (
                filteredReports.map((report) => {
                  // Extract coordinates from payload
                  const coords =
                    report.locCoords && report.locCoords.coordinates
                      ? report.locCoords.coordinates
                      : null;

                  return (
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
                      <div className={styles.reportHeader}>
                        <div className={styles.userInfo}>
                          <i className="fas fa-user-circle"></i>
                          <span className={styles.username}>
                            Reported by {report.reporterName}
                          </span>
                          <span className={styles.reportDate}>
                            {formatDate(report.date)}
                          </span>
                        </div>
                      </div>
                      
                      <div className={styles.reportContent}>
                        <div className={styles.imageSection}>
                          {report.image && report.image.length > 0 ? (
                            <img 
                              src={report.image[0]} 
                              alt="Violation report" 
                              className={styles.reportImage}
                            />
                          ) : (
                            <div className={styles.reportImage} style={{ 
                              background: '#f5f5f5', 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center',
                              color: '#999'
                            }}>
                              <i className="fas fa-image" style={{ fontSize: '2rem' }}></i>
                            </div>
                          )}
                        </div>
                        
                        <div className={styles.detailsSection}>
                          <div className={styles.detailRow}>
                            <span className={styles.detailLabel}>Title:</span>
                            <span className={styles.detailValue}>{report.title}</span>
                          </div>
                          <div className={styles.detailRow}>
                            <span className={styles.detailLabel}>Description:</span>
                            <span className={styles.detailValue}>{report.description}</span>
                          </div>
                          <div className={styles.locationRow}>
                            <span className={styles.detailLabel}>Location:</span>
                            <span className={styles.detailValue}>
                              {report.location || "Location not specified"}
                            </span>
                          </div>
                          {/* View Map Button */}
                          <div style={{ margin: "0.5rem 0" }}>
                            {coords && (
                              <button
                                style={{
                                  marginBottom: "0.5rem",
                                  padding: "0.4rem 1rem",
                                  background: "#047857",
                                  color: "white",
                                  border: "none",
                                  borderRadius: "0.5rem",
                                  cursor: "pointer",
                                  fontWeight: "bold",
                                }}
                                onClick={() =>
                                  setOpenMapId(openMapId === report._id ? null : report._id)
                                }
                              >
                                {openMapId === report._id ? "Hide Map" : "View Map"}
                              </button>
                            )}
                            {coords && openMapId === report._id && (
                              <MapPreview coordinates={coords} />
                            )}
                          </div>
                        </div>
                        
                        <div className={styles.statusSection}>
                          <div className={styles.statusControls}>
                            {report.reportStatus === "pending" ? (
                              <>
                                <div className={styles.statusBadge}>
                                  <span className={`${styles.status} ${styles.pending}`}>
                                    <i className="fas fa-clock"></i>
                                    Pending
                                  </span>
                                </div>
                                <button 
                                  className={styles.resolveBtn}
                                  onClick={() => handleMarkResolved(report._id)}
                                >
                                  <i className="fas fa-check"></i>
                                  Mark as Resolved
                                </button>
                              </>
                            ) : (
                              <div className={styles.statusBadge}>
                                <span className={`${styles.status} ${styles.resolved}`}>
                                  <i className="fas fa-check-circle"></i>
                                  Resolved
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </li>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}