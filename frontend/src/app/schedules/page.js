"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import styles from "./schedule.module.css";

const zoneMap = {
  "Zone 1": [
    "West Bajac-Bajac", "New Kababae", "New Ilalim", "West Tapinac", "New Banicain", "Barretto", "Kalaklan"
  ],
  "Zone 2": [
    "East Bajac-Bajac", "East Tapinac", "New Kalalake", "New Asinan", "Pag-Asa"
  ],
  "Zone 3": [
    "Mabayuan", "Sta. Rita", "Gordon Heights", "Old Cabalan", "New Cabalan"
  ]
};

const zoneSchedules = {
  "Zone 1": [
    {
      type: "Biodegradable",
      color: "#4CAF50",
      schedule: "Monday and Tuesday",
      getNext: () => getNextDay(["Monday", "Tuesday"])
    },
    {
      type: "Recyclable",
      color: "#2196F3",
      schedule: "Once every Sunday",
      getNext: () => getNextDay(["Sunday"])
    },
    {
      type: "Residual",
      color: "#9E9E9E",
      schedule: "Monday and Thursday",
      getNext: () => getNextDay(["Monday", "Thursday"])
    },
    {
      type: "Bulky",
      color: "#FF9800",
      schedule: "On call with corresponding fees",
      getNext: () => ({ daysLeft: "On call", dateStr: "" })
    },
    {
      type: "Special Waste",
      color: "#F44336",
      schedule: "Once a month (1st Tuesday)",
      getNext: () => getNextMonthly("Tuesday", 1)
    }
  ],
  "Zone 2": [
    {
      type: "Biodegradable",
      color: "#4CAF50",
      schedule: "Tuesday and Friday",
      getNext: () => getNextDay(["Tuesday", "Friday"])
    },
    {
      type: "Recyclable",
      color: "#2196F3",
      schedule: "Once a month every Sunday",
      getNext: () => getNextMonthly("Sunday")
    },
    {
      type: "Residual",
      color: "#9E9E9E",
      schedule: "Tuesday and Friday",
      getNext: () => getNextDay(["Tuesday", "Friday"])
    },
    {
      type: "Bulky",
      color: "#FF9800",
      schedule: "On call",
      getNext: () => ({ daysLeft: "On call", dateStr: "" })
    },
    {
      type: "Special Waste",
      color: "#F44336",
      schedule: "Once a month (2nd Wednesday)",
      getNext: () => getNextMonthly("Wednesday", 2)
    }
  ],
  "Zone 3": [
    {
      type: "Biodegradable",
      color: "#4CAF50",
      schedule: "Wednesday and Saturday",
      getNext: () => getNextDay(["Wednesday", "Saturday"])
    },
    {
      type: "Recyclable",
      color: "#2196F3",
      schedule: "Once a month every Sunday",
      getNext: () => getNextMonthly("Sunday")
    },
    {
      type: "Residual",
      color: "#9E9E9E",
      schedule: "Wednesday and Saturday",
      getNext: () => getNextDay(["Wednesday", "Saturday"])
    },
    {
      type: "Bulky",
      color: "#FF9800",
      schedule: "On call",
      getNext: () => ({ daysLeft: "On call", dateStr: "" })
    },
    {
      type: "Special Waste",
      color: "#F44336",
      schedule: "Once a month (3rd Monday)",
      getNext: () => getNextMonthly("Monday", 3)
    }
  ]
};

const barangays = [
  "Barretto", "East Bajac-Bajac", "East Tapinac", "Gordon Heights", "Kalaklan", "Mabayuan",
  "New Asinan", "New Banicain", "New Cabalan", "New Ilalim", "New Kababae", "New Kalalake",
  "Pag-Asa", "Sta. Rita", "West Bajac-Bajac", "West Tapinac", "Old Cabalan"
];

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
  if (!nextDate) return { daysLeft: "", dateStr: "" };
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

function getZone(barangay) {
  for (const [zone, list] of Object.entries(zoneMap)) {
    if (list.map(b => b.toLowerCase()).includes(barangay.toLowerCase())) return zone;
  }
  return null;
}

const sortOptions = [
  { value: "type", label: "Type" },
  { value: "daysNum", label: "Next Pickup (Soonest)" },
  { value: "schedule", label: "Schedule" }
];

export default function SchedulesPage() {
  const [selectedBarangay, setSelectedBarangay] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [sortBy, setSortBy] = useState("daysNum");
  const [showFilter, setShowFilter] = useState(false);

  const filterRef = useRef(null);

  useEffect(() => {
    if (!showFilter) return;
    function handleClick(e) {
      if (filterRef.current && !filterRef.current.contains(e.target)) {
        setShowFilter(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showFilter]);

  const barangaySchedules = useMemo(() => {
    const zone = getZone(selectedBarangay);
    if (!zone) return [];
    return zoneSchedules[zone].map(s => ({
      ...s,
      next: typeof s.getNext === "function" ? s.getNext() : { daysLeft: "", dateStr: "", daysNum: null }
    }));
  }, [selectedBarangay]);

  const filteredSchedules = useMemo(() => {
    let arr = barangaySchedules;
    if (sortBy === "type") {
      arr = [...arr].sort((a, b) => a.type.localeCompare(b.type));
    } else if (sortBy === "schedule") {
      arr = [...arr].sort((a, b) => a.schedule.localeCompare(b.schedule));
    } else if (sortBy === "daysNum") {
      arr = [...arr].sort((a, b) => {
        if (a.next.daysNum == null) return 1;
        if (b.next.daysNum == null) return -1;
        return a.next.daysNum - b.next.daysNum;
      });
    }
    return arr;
  }, [barangaySchedules, sortBy]);

  function isImportant(s) {
    return s.next.daysNum !== null && s.next.daysNum <= 2;
  }

  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <div className={styles.scheduleLabel}>
          Schedules
        </div>
        <p className={styles.scheduleDesc}>
          View and search all waste collection schedules for your barangay.
        </p>
      </header>
      <section className={styles.section}>
        <div className={styles.scheduleBar}>
          <div className={styles.scheduleBarLeft}>
            <div className={styles.customSelectWrapper} style={{ minWidth: "220px" }}>
              <select
                value={selectedBarangay}
                onChange={e => {
                  setSelectedBarangay(e.target.value);
                  setDropdownOpen(false);
                }}
                className={styles.select}
                onFocus={() => setDropdownOpen(true)}
                onBlur={() => setDropdownOpen(false)}
              >
                <option value="" disabled>
                  Select Barangay
                </option>
                {barangays.map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
              <span className={styles.customArrow}>
                <svg width="18" height="18" viewBox="0 0 22 22" style={{ display: "block" }}>
                  <circle cx="11" cy="11" r="10" fill="#F3FFF7" />
                  <path d="M7 10l4 4 4-4" stroke="#047857" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
            </div>
          </div>
          <div className={styles.scheduleBarRight} ref={filterRef}>
            <button
              className={styles.filterBtn}
              type="button"
              onClick={() => setShowFilter(f => !f)}
              aria-label="Filter"
            >
              <i className="fa-solid fa-filter"></i>
              Filter
            </button>
            {showFilter && (
              <div className={styles.filterDropdown}>
                {sortOptions.map(opt => (
                  <button
                    key={opt.value}
                    className={`${styles.filterDropdownOption}${sortBy === opt.value ? " " + styles.selected : ""}`}
                    type="button"
                    onClick={() => {
                      setSortBy(opt.value);
                      setShowFilter(false);
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className={styles.tableWrapper}>
          <table className={styles.scheduleTable}>
            <thead>
              <tr>
                <th>Type</th>
                <th>Schedule</th>
                <th>Next Pickup</th>
              </tr>
            </thead>
            <tbody>
              {(selectedBarangay && filteredSchedules.length > 0 ? filteredSchedules : []).map(s => (
                <tr
                  key={s.type}
                  className={`${styles.scheduleRow}${isImportant(s) ? " " + styles.important : ""}`}
                  style={{
                    background: isImportant(s) ? "#e6fff3" : "#fff",
                  }}
                >
                  <td className={`${styles.scheduleCell} ${styles.scheduleType}`} style={{ color: s.color }}>
                    <span style={{
                      display: "inline-block",
                      width: "1.1em",
                      height: "1.1em",
                      background: s.color,
                      borderRadius: "50%",
                      marginRight: "0.5em",
                      verticalAlign: "middle"
                    }}></span>
                    {s.type}
                  </td>
                  <td className={styles.scheduleCell}>
                    {s.schedule}
                  </td>
                  <td className={`${styles.scheduleCell} ${styles.scheduleNext}${isImportant(s) ? " " + styles.important : ""}`}>
                    {s.next.daysLeft}{s.next.dateStr ? <span className={styles.scheduleNextDate}> ({s.next.dateStr})</span> : ""}
                    {isImportant(s) && (
                      <span style={{
                        marginLeft: "0.7em",
                        background: "#047857",
                        color: "#fff",
                        borderRadius: "0.7em",
                        padding: "0.2em 0.8em",
                        fontSize: "0.9em",
                        fontWeight: "bold",
                        boxShadow: "0 2px 8px #04785722"
                      }}>
                        Upcoming
                      </span>
                    )}
                  </td>
                </tr>
              ))}
              {(!selectedBarangay || filteredSchedules.length === 0) && (
                <tr>
                  <td colSpan={3} style={{ color: "#888", fontSize: "0.95rem", textAlign: "center", padding: "1.5rem" }}>
                    Please select a barangay to view schedule.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
