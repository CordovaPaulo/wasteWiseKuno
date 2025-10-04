"use client";

import AdminNavBar from "../componentsadmin/adminNavBar";
import styles from './aschedule.module.css';
import { useState, useEffect } from 'react';
import api from "../../../lib/axios";

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
}

function getNextPickupFromDay(dayString) {
  const today = new Date();
  today.setHours(0,0,0,0);
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  if (dayString.toLowerCase().includes("on call")) {
    return { daysLeft: "On call", dateStr: "", daysNum: null };
  }
  if (dayString.toLowerCase().includes("once a month")) {
    if (dayString.includes("Sunday")) {
      return getNextMonthly("Sunday");
    } else if (dayString.includes("1st Tuesday")) {
      return getNextMonthly("Tuesday", 1);
    } else if (dayString.includes("2nd Wednesday")) {
      return getNextMonthly("Wednesday", 2);
    } else if (dayString.includes("3rd Monday")) {
      return getNextMonthly("Monday", 3);
    }
  }
  const days = [];
  dayNames.forEach(day => {
    if (dayString.includes(day)) {
      days.push(day);
    }
  });
  if (days.length > 0) {
    return getNextDay(days);
  }
  return { daysLeft: "", dateStr: "", daysNum: null };
}

function getNextDay(days) {
  const today = new Date();
  today.setHours(0,0,0,0);
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const todayIdx = today.getDay();
  let minDiff = 8;
  let nextDate = null;
  for (let d of days) {
    const idx = dayNames.indexOf(d);
    let diff = idx - todayIdx;
    if (diff < 0) diff += 7;
    if (diff === 0) diff = 7;
    if (diff < minDiff) {
      minDiff = diff;
      nextDate = new Date(today);
      nextDate.setDate(today.getDate() + diff);
    }
  }
  if (!nextDate) return { daysLeft: "", dateStr: "", daysNum: null };
  const options = { month: "long", day: "numeric" };
  return {
    daysLeft: minDiff === 1 ? "In 1 day" : `In ${minDiff} days`,
    dateStr: nextDate.toLocaleDateString(undefined, options),
    daysNum: minDiff
  };
}

function getNextMonthly(dayName, nth = 1) {
  const today = new Date();
  today.setHours(0,0,0,0);
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const month = today.getMonth();
  const year = today.getFullYear();
  let count = 0;
  let nextDate = null;
  for (let d = 1; d <= 31; d++) {
    const date = new Date(year, month, d);
    date.setHours(0,0,0,0);
    if (date.getMonth() !== month) break;
    if (dayNames[date.getDay()] === dayName) {
      count++;
      if (count === nth && date >= today) {
        nextDate = date;
        break;
      }
    }
  }
  if (!nextDate) {
    const nextMonth = month + 1;
    const nextYear = nextMonth > 11 ? year + 1 : year;
    const realNextMonth = nextMonth % 12;
    count = 0;
    for (let d = 1; d <= 31; d++) {
      const date = new Date(nextYear, realNextMonth, d);
      date.setHours(0,0,0,0);
      if (date.getMonth() !== realNextMonth) break;
      if (dayNames[date.getDay()] === dayName) {
        count++;
        if (count === nth) {
          nextDate = date;
          break;
        }
      }
    }
  }
  if (!nextDate) return { daysLeft: "", dateStr: "", daysNum: null };
  const diff = Math.round((nextDate - today) / (1000 * 60 * 60 * 24));
  const options = { month: "long", day: "numeric" };
  return {
    daysLeft: diff === 0 ? "Today" : diff === 1 ? "In 1 day" : `In ${diff} days`,
    dateStr: nextDate.toLocaleDateString(undefined, options),
    daysNum: diff
  };
}

export default function ScheduleManagement() {
  const [selectedBarangay, setSelectedBarangay] = useState('');
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch schedules from backend
  useEffect(() => {
    const fetchSchedules = async () => {
      const authToken = getCookie("authToken");
      try {
        setLoading(true);
        const response = await api.get("/api/admin/schedules", {
          headers: {
            'Authorization': `Bearer ${authToken}`,
          },
        });
        setSchedules(response.data);
        setError('');
      } catch (error) {
        setError("Failed to fetch schedules. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchSchedules();
  }, []);

  // Get unique barangay names from API data
  const barangays = schedules.map(schedule => schedule.barangay).sort();

  // Waste type colors mapping
  const getTypeColor = (typeName) => {
    const colors = {
      "Biodegradable": "#4CAF50",
      "Recyclable": "#2196F3", 
      "Residual": "#9E9E9E",
      "Bulky": "#FF9800",
      "Special Waste": "#F44336"
    };
    return colors[typeName] || "#666";
  };

  // Filter schedules by selected barangay and flatten the type array
  const getFilteredSchedules = () => {
    if (!selectedBarangay || schedules.length === 0) return [];
    
    const barangaySchedule = schedules.find(schedule => schedule.barangay === selectedBarangay);
    if (!barangaySchedule || !Array.isArray(barangaySchedule.type)) return [];
    
    return barangaySchedule.type.map(type => ({
      id: type._id,
      barangay: barangaySchedule.barangay,
      scheduleId: barangaySchedule._id,
      type: type.typeName,
      color: getTypeColor(type.typeName),
      schedule: type.day,
      next: getNextPickupFromDay(type.day)
    }));
  };

  const filteredSchedules = getFilteredSchedules();

  const handleEdit = (scheduleId, typeId) => {
    // Placeholder for edit functionality - will implement later
    console.log(`Edit schedule ${scheduleId}, type ${typeId}`);
    alert(`Edit functionality will be implemented for schedule ID: ${scheduleId}, type ID: ${typeId}`);
  };

  if (loading) {
    return (
      <>
        <AdminNavBar />
        <main className={styles.scheduleMain}>
          <div className={styles.container}>
            <h1 className={styles.title}>Schedule Management</h1>
            <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
              Loading schedules...
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
        <main className={styles.scheduleMain}>
          <div className={styles.container}>
            <h1 className={styles.title}>Schedule Management</h1>
            <div style={{ textAlign: 'center', padding: '2rem', color: '#F44336' }}>
              {error}
              <button 
                onClick={() => window.location.reload()}
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
      <main className={styles.scheduleMain}>
        <div className={styles.container}>
          <h1 className={styles.title}>Schedule Management</h1>
          
          <div className={styles.tableContainer}>
            <div className={styles.headerSection}>
              <h2 className={styles.sectionTitle}>
                Pickup Schedules
              </h2>
              <div className={styles.filterSection}>
                <label htmlFor="barangay-select" className={styles.filterLabel}>
                  Select Barangay:
                </label>
                <select 
                  id="barangay-select"
                  className={styles.barangaySelect}
                  value={selectedBarangay}
                  onChange={(e) => setSelectedBarangay(e.target.value)}
                >
                  <option value="">-- Select a barangay --</option>
                  {barangays.map((barangay) => (
                    <option key={barangay} value={barangay}>
                      {barangay}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className={styles.tableWrapper}>
              <table className={styles.scheduleTable}>
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Schedule</th>
                    <th>Next Pickup</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSchedules.length > 0 ? (
                    filteredSchedules.map((schedule) => (
                      <tr 
                        key={schedule.id} 
                        className={styles.scheduleRow}
                      >
                        <td className={`${styles.scheduleCell} ${styles.scheduleType}`}>
                          <span 
                            className={styles.typeIndicator}
                            style={{ backgroundColor: schedule.color }}
                          ></span>
                          <span style={{ color: schedule.color }}>
                            {schedule.type}
                          </span>
                        </td>
                        <td className={styles.scheduleCell}>
                          {schedule.schedule}
                        </td>
                        <td className={styles.scheduleCell}>
                          {schedule.next.daysLeft}
                          {schedule.next.dateStr && (
                            <span style={{ color: '#666', marginLeft: '0.5rem' }}>
                              ({schedule.next.dateStr})
                            </span>
                          )}
                        </td>
                        <td className={styles.scheduleCell}>
                          <div className={styles.actionButtons}>
                            <button 
                              className={`${styles.actionBtn} ${styles.editBtn}`}
                              onClick={() => handleEdit(schedule.scheduleId, schedule.id)}
                              title="Edit Schedule"
                            >
                              <i className="fas fa-edit"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className={styles.emptyState}>
                        {selectedBarangay 
                          ? `No schedules found for ${selectedBarangay}`
                          : "Please select a barangay to view schedules"
                        }
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
