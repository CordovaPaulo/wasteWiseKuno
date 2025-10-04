"use client";

import AdminNavBar from "../componentsadmin/adminNavBar";
import styles from './areports.module.css';
import { useState, useEffect } from 'react';
import api from "../../../lib/axios";

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
  const [error, setError] = useState("");

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
      const response = await api.patch(`/api/admin/reports/${reportId}/manage`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      // Update local state to reflect the change
      setReports(prevReports => 
        prevReports.map(report => 
          report._id === reportId 
            ? { ...report, reportStatus: "resolved" }
            : report
        )
      );
    } catch (error) {
      alert("Failed to update report status. Please try again.");
    }
  };

  const handleDownloadReports = async () => {
    const authToken = getCookie("authToken");
    try {
      const response = await api.get("/api/admin/reports/download/pdf", {
        responseType: 'blob',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });
      
      // Create blob URL and trigger download
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `waste-reports-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      alert("Failed to download reports. Please try again.");
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
                title="Download all reports as PDF file"
              >
                <i className="fas fa-download"></i>
                Download Reports
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
                filteredReports.map((report) => (
                  <div key={report._id} className={styles.reportCard}>
                    <div className={styles.reportHeader}>
                      <div className={styles.userInfo}>
                        <i className="fas fa-user-circle"></i>
                        <span className={styles.username}>
                          Report #{report._id.slice(-6)}
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
                            <span className={styles.geoNote}>(Geo-tag to be added later)</span>
                          </span>
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
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
