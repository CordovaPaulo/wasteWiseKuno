"use client";

import AdminNavBar from "../componentsadmin/adminNavBar";
import styles from './areports.module.css';
import { useState } from 'react';

export default function ViolationReports() {
  const [filter, setFilter] = useState('all');
  
  // Mock report data - in a real app, this would come from an API
  const [reports, setReports] = useState([
    {
      id: 1,
      username: "juan_delaCruz",
      reportDate: "2025-01-15",
      image: "/images/trash.png", // placeholder image
      title: "Illegal Dumping in Vacant Lot",
      description: "Illegal dumping of household waste in vacant lot. Multiple garbage bags were thrown over the fence creating unsanitary conditions.",
      location: "Corner of Rizal St. and Mabini Ave., Barangay Mabayuan",
      status: "pending"
    },
    {
      id: 2,
      username: "maria_santos92",
      reportDate: "2025-01-14",
      image: "/images/trash.png",
      title: "Burning of Plastic Materials",
      description: "Burning of plastic materials in residential area causing air pollution and health hazards for nearby residents.",
      location: "Block 5, Lot 12, New Asinan Subdivision",
      status: "pending"
    },
    {
      id: 3,
      username: "carlo_reyes",
      reportDate: "2025-01-13",
      image: "/images/trash.png",
      title: "Debris and Old Furniture Dumping",
      description: "Construction debris and old furniture dumped along the roadside blocking pedestrian walkway.",
      location: "Tapinac Road near Barangay Hall",
      status: "resolved"
    },
    {
      id: 4,
      username: "ana_lopez",
      reportDate: "2025-01-12",
      image: "/images/trash.png",
      title: "Improper Disposal of Restaurant Waste",
      description: "Restaurant waste improperly disposed in residential garbage collection area. Food waste attracting pests.",
      location: "Behind Jollibee, East Bajac-Bajac Commercial Area",
      status: "pending"
    },
    {
      id: 5,
      username: "robert_garcia",
      reportDate: "2025-01-11",
      image: "/images/trash.png", 
      title: "Abandonment of Electronic Waste",
      description: "Electronic waste (old TVs, computers) abandoned in public park area. Potential environmental hazard.",
      location: "Rizal Triangle Park, Barangay Centro",
      status: "resolved"
    }
  ]);

  const handleMarkResolved = (reportId) => {
    setReports(prevReports => 
      prevReports.map(report => 
        report.id === reportId 
          ? { ...report, status: "resolved" }
          : report
      )
    );
  };

  const handleDownloadReports = () => {
    // Placeholder for Excel export functionality
    alert("Excel export feature will be implemented here. This would generate a downloadable Excel file with all report data.");
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

    // Filter by status
    if (filter === 'resolved') {
      filteredReports = filteredReports.filter(report => report.status === 'resolved');
    } else if (filter === 'pending') {
      filteredReports = filteredReports.filter(report => report.status === 'pending');
    }

    // Sort by date
    if (filter === 'most-recent') {
      filteredReports.sort((a, b) => new Date(b.reportDate) - new Date(a.reportDate));
    } else if (filter === 'oldest') {
      filteredReports.sort((a, b) => new Date(a.reportDate) - new Date(b.reportDate));
    }

    return filteredReports;
  };

  const filteredReports = getFilteredReports();

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
                  <option value="all">All Reports</option>
                  <option value="resolved">Resolved</option>
                  <option value="pending">Pending</option>
                  <option value="most-recent">Most Recent</option>
                  <option value="oldest">Oldest</option>
                </select>
              </div>
              <button 
                className={styles.downloadBtn}
                onClick={handleDownloadReports}
                title="Download all reports as Excel file"
              >
                <i className="fas fa-download"></i>
                Download Reports
              </button>
            </div>
          </div>
          
          <div className={styles.reportsContainer}>
            <h2 className={styles.sectionTitle}>Recent Reports</h2>
            
            <div className={styles.reportsList}>
              {filteredReports.map((report) => (
                <div key={report.id} className={styles.reportCard}>
                  <div className={styles.reportHeader}>
                    <div className={styles.userInfo}>
                      <i className="fas fa-user-circle"></i>
                      <span className={styles.username}>{report.username}</span>
                      <span className={styles.reportDate}>{formatDate(report.reportDate)}</span>
                    </div>
                  </div>
                  
                  <div className={styles.reportContent}>
                    <div className={styles.imageSection}>
                      <img 
                        src={report.image} 
                        alt="Violation report" 
                        className={styles.reportImage}
                      />
                    </div>
                    
                    <div className={styles.detailsSection}>
                      {/* Title section */}
                      <div className={styles.titleSection}>
                        <h4>Title:</h4>
                        <p>{report.title ? report.title : `Report #${report.id}`}</p>
                      </div>
                      <div className={styles.description}>
                        <h4>Description:</h4>
                        <p>{report.description}</p>
                      </div>
                      <div className={styles.location}>
                        <h4>Location:</h4>
                        <p>
                          <i className="fas fa-map-marker-alt"></i>
                          {report.location}
                          <span className={styles.geoNote}>(Geo-tag to be added later)</span>
                        </p>
                      </div>
                    </div>
                    
                    <div className={styles.statusSection}>
                      <div className={styles.statusControls}>
                        {report.status === "pending" ? (
                          <>
                            <div className={styles.statusBadge}>
                              <span className={`${styles.status} ${styles.pending}`}>
                                <i className="fas fa-clock"></i>
                                Pending
                              </span>
                            </div>
                            <button 
                              className={styles.resolveBtn}
                              onClick={() => handleMarkResolved(report.id)}
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
              ))}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
