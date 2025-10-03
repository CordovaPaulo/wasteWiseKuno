"use client";

import AdminNavBar from "../componentsadmin/adminNavBar";
import styles from './aschedule.module.css';
import { useState } from 'react';

export default function ScheduleManagement() {
  const [selectedBarangay, setSelectedBarangay] = useState('');

  // All barangays in alphabetical order
  const barangays = [
    "Barretto", "East Bajac-Bajac", "East Tapinac", "Gordon Heights", 
    "Kalaklan", "Mabayuan", "New Asinan", "New Banicain", "New Cabalan", 
    "New Ilalim", "New Kababae", "New Kalalake", "Old Cabalan", 
    "Pag-Asa", "Sta. Rita", "West Bajac-Bajac", "West Tapinac"
  ].sort();

  // Base waste types that every barangay should have
  const wasteTypes = [
    { type: "Biodegradable", color: "#4CAF50" },
    { type: "Residual", color: "#9E9E9E" },
    { type: "Recyclable", color: "#2196F3" },
    { type: "Special Waste", color: "#F44336" },
    { type: "Bulky", color: "#FF9800" }
  ];

  // Zone-based schedule patterns
  const zoneSchedules = {
    // Zone 1: West Bajac-Bajac, New Kababae, New Ilalim, West Tapinac, New Banicain, Barretto, Kalaklan
    "Zone 1": {
      "Biodegradable": { schedule: "Monday and Tuesday", nextPickup: "Tomorrow (Dec 30)" },
      "Residual": { schedule: "Monday and Thursday", nextPickup: "Tomorrow (Dec 30)" },
      "Recyclable": { schedule: "Once every Sunday", nextPickup: "5 days (Jan 2)" },
      "Special Waste": { schedule: "Once a month (1st Tuesday)", nextPickup: "15 days (Jan 14)" },
      "Bulky": { schedule: "On call with corresponding fees", nextPickup: "On call" }
    },
    // Zone 2: East Bajac-Bajac, East Tapinac, New Kalalake, New Asinan, Pag-Asa
    "Zone 2": {
      "Biodegradable": { schedule: "Tuesday and Friday", nextPickup: "2 days (Dec 31)" },
      "Residual": { schedule: "Tuesday and Friday", nextPickup: "2 days (Dec 31)" },
      "Recyclable": { schedule: "Once a month every Sunday", nextPickup: "8 days (Jan 5)" },
      "Special Waste": { schedule: "Once a month (2nd Tuesday)", nextPickup: "18 days (Jan 17)" },
      "Bulky": { schedule: "On call with corresponding fees", nextPickup: "On call" }
    },
    // Zone 3: Mabayuan, Sta. Rita, Gordon Heights, Old Cabalan, New Cabalan
    "Zone 3": {
      "Biodegradable": { schedule: "Wednesday and Saturday", nextPickup: "4 days (Jan 1)" },
      "Residual": { schedule: "Wednesday and Saturday", nextPickup: "4 days (Jan 1)" },
      "Recyclable": { schedule: "Once a month every Sunday", nextPickup: "8 days (Jan 5)" },
      "Special Waste": { schedule: "Once a month (2nd Friday)", nextPickup: "12 days (Jan 10)" },
      "Bulky": { schedule: "On call with corresponding fees", nextPickup: "On call" }
    }
  };

  // Map barangays to their zones
  const barangayToZone = {
    "West Bajac-Bajac": "Zone 1", "New Kababae": "Zone 1", "New Ilalim": "Zone 1", 
    "West Tapinac": "Zone 1", "New Banicain": "Zone 1", "Barretto": "Zone 1", "Kalaklan": "Zone 1",
    "East Bajac-Bajac": "Zone 2", "East Tapinac": "Zone 2", "New Kalalake": "Zone 2", 
    "New Asinan": "Zone 2", "Pag-Asa": "Zone 2",
    "Mabayuan": "Zone 3", "Sta. Rita": "Zone 3", "Gordon Heights": "Zone 3", 
    "Old Cabalan": "Zone 3", "New Cabalan": "Zone 3"
  };

  // Generate complete schedule data for all barangays
  const generateScheduleData = () => {
    let scheduleData = [];
    let idCounter = 1;

    barangays.forEach(barangay => {
      const zone = barangayToZone[barangay];
      const zoneSchedule = zoneSchedules[zone];

      wasteTypes.forEach(wasteType => {
        const scheduleInfo = zoneSchedule[wasteType.type];
        scheduleData.push({
          id: idCounter++,
          barangay: barangay,
          type: wasteType.type,
          color: wasteType.color,
          schedule: scheduleInfo.schedule,
          nextPickup: scheduleInfo.nextPickup
        });
      });
    });

    return scheduleData;
  };

  const scheduleData = generateScheduleData();

  // Filter schedules by selected barangay
  const filteredSchedules = selectedBarangay 
    ? scheduleData.filter(schedule => schedule.barangay === selectedBarangay)
    : [];

  const handleEdit = (scheduleId) => {
    // Placeholder for edit functionality
    alert(`Edit schedule with ID: ${scheduleId}`);
  };

  const handleDelete = (scheduleId) => {
    // Placeholder for delete functionality
    if (confirm("Are you sure you want to delete this schedule?")) {
      alert(`Delete schedule with ID: ${scheduleId}`);
    }
  };

  return (
    <>
      <AdminNavBar />
      <main className={styles.scheduleMain}>
        <div className={styles.container}>
          <h1 className={styles.title}>Schedule Management</h1>
          
          <div className={styles.tableContainer}>
            <div className={styles.headerSection}>
              <h2 className={styles.sectionTitle}>Pickup Schedules</h2>
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
                      <tr key={schedule.id} className={styles.scheduleRow}>
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
                          {schedule.nextPickup}
                        </td>
                        <td className={styles.scheduleCell}>
                          <div className={styles.actionButtons}>
                            <button 
                              className={`${styles.actionBtn} ${styles.editBtn}`}
                              onClick={() => handleEdit(schedule.id)}
                              title="Edit Schedule"
                            >
                              <i className="fas fa-edit"></i>
                            </button>
                            <button 
                              className={`${styles.actionBtn} ${styles.deleteBtn}`}
                              onClick={() => handleDelete(schedule.id)}
                              title="Delete Schedule"
                            >
                              <i className="fas fa-trash"></i>
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
