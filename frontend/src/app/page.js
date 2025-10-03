"use client";

import Link from "next/link";
import { useState, useRef, useMemo } from "react";

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
    dateStr: nextDate.toLocaleDateString(undefined, options)
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
  if (!nextDate) return { daysLeft: "", dateStr: "" };
  const diff = Math.round((nextDate - today) / (1000 * 60 * 60 * 24));
  const options = { month: "long", day: "numeric" };
  return {
    daysLeft: diff === 0 ? "Today" : diff === 1 ? "In 1 day" : `In ${diff} days`,
    dateStr: nextDate.toLocaleDateString(undefined, options)
  };
}


function getZone(barangay) {
  for (const [zone, list] of Object.entries(zoneMap)) {
    if (list.map(b => b.toLowerCase()).includes(barangay.toLowerCase())) return zone;
  }
  return null;
}

export default function Page() {
  const [selectedBarangay, setSelectedBarangay] = useState("");
  const [location, setLocation] = useState("");
  const [image, setImage] = useState(null);
  const imageInputRef = useRef();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setImage(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const barangaySchedules = useMemo(() => {
    const zone = getZone(selectedBarangay);
    if (!zone) return [];
    return zoneSchedules[zone].map(s => ({
      ...s,
      next: typeof s.getNext === "function" ? s.getNext() : { daysLeft: "", dateStr: "" }
    }));
  }, [selectedBarangay]);

  return (
    <main
      style={{
        background: "#F3FFF7",
        minHeight: "100vh",
        padding: "2rem",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "2rem",
      }}
    >
      <style>{`
  .custom-select-wrapper {
    position: relative;
    width: 100%;
    max-width: 340px;
  }
  .custom-arrow {
    position: absolute;
    right: 18px;
    top: 50%;
    transform: translateY(-50%);
    pointer-events: none;
    color: #047857;
    font-size: 1rem;
    background: white;
    border-radius: 50%;
    box-shadow: 0 2px 8px rgba(4,120,87,0.08);
    padding: 1px 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2;
    height: 28px;
    width: 28px;
  }
  @media (max-width: 900px) {
    .custom-arrow {
      right: 12px;
      font-size: 1rem;
      padding: 1px 3px;
      height: 24px;
      width: 24px;
    }
  }
  @media (max-width: 600px) {
    .custom-arrow {
      right: 8px;
      font-size: 1rem;
      padding: 0px 2px;
      height: 20px;
      width: 20px;
    }
  }
`}</style>
      <div className="main-container" style={{ width: "100%", maxWidth: "1100px", display: "flex", flexDirection: "column", gap: "1.2rem" }}>
        <section className="section-responsive"
          style={{
            background: "white",
            boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
            borderRadius: "1.1rem",
            padding: "2.2rem 2.5rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "1.2rem",
          }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 style={{ fontSize: "2rem", marginBottom: "1.1rem", color: "#047857", fontWeight: "bold" }}>
              Smart Waste Management
            </h1>
            <p style={{ fontSize: "1.1rem", marginBottom: "1.1rem", color: "#333" }}>
              Empowering Communities to Manage Waste Smarter and Build a Cleaner, Greener Future
            </p>
            <div style={{ display: "flex", gap: "1.2rem", flexWrap: "wrap" }}>
              <Link href="/schedules">
                <button
                  style={{
                    background: "#047857",
                    color: "white",
                    border: "none",
                    borderRadius: "0.6rem",
                    padding: "0.7rem 1.3rem",
                    fontSize: "0.95rem",
                    fontWeight: "bold",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    cursor: "pointer",
                    boxShadow: "0 2px 8px rgba(4,120,87,0.08)",
                  }}
                >
                  <i className="fa-solid fa-calendar-days"></i>
                  Check Pickup Schedules
                </button>
              </Link>
              <Link href="/locators">
                <button
                  style={{
                    background: "white",
                    color: "#047857",
                    border: "2px solid #047857",
                    borderRadius: "0.6rem",
                    padding: "0.7rem 1.3rem",
                    fontSize: "0.95rem",
                    fontWeight: "bold",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    cursor: "pointer",
                    boxShadow: "0 2px 8px rgba(4,120,87,0.08)",
                  }}
                >
                  <i className="fa-solid fa-location-dot"></i>
                  Find Centers
                </button>
              </Link>
            </div>
          </div>
          <div style={{ flex: "0 0 180px", display: "flex", justifyContent: "center" }}>
            <img
              src="/images/trash.png"
              alt="Trash Bin"
              style={{
                maxWidth: "180px",
                width: "100%",
                borderRadius: "1.2rem",
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                background: "#F3FFF7",
              }}
            />
          </div>
        </section>

        <div className="flex-wrap-responsive" style={{ display: "flex", gap: "1.2rem", flexWrap: "wrap" }}>
          <section className="section-responsive"
            style={{
              background: "white",
              boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
              borderRadius: "1.1rem",
              padding: "1.5rem 2rem",
              minWidth: "260px",
              flex: 1,
              position: "relative",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.7rem" }}>
                <i className="fa-solid fa-calendar-week" style={{ fontSize: "1.3rem", color: "#047857" }}></i>
                <span style={{ fontWeight: "bold", fontSize: "1.1rem", color: "#222" }}>
                  Collection Schedule
                </span>
              </div>
              <Link href="/schedules" style={{ color: "#047857", fontWeight: "bold", textDecoration: "underline", fontSize: "0.95rem" }}>
                View All
              </Link>
            </div>
            <div style={{ margin: "1.1rem 0 1.2rem 0", fontSize: "1rem", color: "#555" }}>
              Select Barangay
            </div>
            <div
              className="custom-select-wrapper"
              tabIndex={-1}
              style={{ marginBottom: "1.2rem" }}
            >
              <select
                value={selectedBarangay}
                onChange={e => {
                  setSelectedBarangay(e.target.value);
                  setDropdownOpen(false);
                }}
                style={{
                  background: "white",
                  border: "1px solid #d1d5db",
                  borderRadius: "0.8rem",
                  padding: "0.6rem 1.2rem",
                  fontSize: "0.95rem",
                  outline: "none",
                  width: "100%",
                  maxWidth: "340px",
                  color: selectedBarangay ? "#222" : "#888",
                  boxSizing: "border-box",
                  appearance: "none",
                  WebkitAppearance: "none",
                  MozAppearance: "none",
                  lineHeight: "1.2",
                  cursor: "pointer"
                }}
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
              <span className="custom-arrow">
                <i className="fa-solid fa-chevron-down"></i>
              </span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {(selectedBarangay && barangaySchedules.length > 0 ? barangaySchedules : []).map(s => (
                <div
                  key={s.type}
                  style={{
                    background: s.color + "22",
                    borderRadius: "1.2rem",
                    padding: "1rem",
                    display: "flex",
                    flexDirection: "column",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                    gap: "0.4rem",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ fontWeight: "bold", fontSize: "1rem", color: s.color }}>
                      {s.type}
                    </div>
                    <div style={{ fontWeight: "bold", color: s.color, fontSize: "0.95rem" }}>
                      Next: {s.next.daysLeft}{s.next.dateStr ? ` (${s.next.dateStr})` : ""}
                    </div>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "0.15rem" }}>
                    <div style={{ fontSize: "0.95rem", color: "#555" }}>
                      {s.schedule}
                    </div>
                  </div>
                </div>
              ))}
              {(!selectedBarangay || barangaySchedules.length === 0) && (
                <div style={{ color: "#888", fontSize: "0.95rem", textAlign: "center", marginTop: "1.2rem" }}>
                  Please select a barangay to view schedule.
                </div>
              )}
            </div>
          </section>

          <section className="section-responsive"
            style={{
              background: "white",
              boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
              borderRadius: "1.1rem",
              padding: "1.5rem 2rem",
              minWidth: "260px",
              flex: 1,
              position: "relative",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.7rem" }}>
                <i className="fa-solid fa-map-location-dot" style={{ fontSize: "1.3rem", color: "#2196F3" }}></i>
                <span style={{ fontWeight: "bold", fontSize: "1.1rem", color: "#222" }}>
                  Recycling Locator
                </span>
              </div>
              <Link href="/locators" style={{ color: "#2196F3", fontWeight: "bold", textDecoration: "underline", fontSize: "0.95rem" }}>
                View More
              </Link>
            </div>
            <div style={{ margin: "1.1rem 0 1.2rem 0", fontSize: "1rem", color: "#555" }}>
              Find nearby recycling centers and drop-off points
            </div>
            <div
              style={{
                background: "#F3FFF7",
                border: "1px solid #e0e0e0",
                borderRadius: "1.2rem",
                height: "140px",
                marginBottom: "1.2rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#aaa",
                fontSize: "0.95rem",
                minWidth: 0,
              }}
            >
              [Map Placeholder]
            </div>
            <div className="recycling-locator-inputs" style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              <input
                type="text"
                value={location}
                onChange={e => setLocation(e.target.value)}
                placeholder="Enter Location"
                style={{
                  flex: 1,
                  padding: "0.7rem 1rem",
                  borderRadius: "0.8rem",
                  border: "1px solid #d1d5db",
                  fontSize: "0.95rem",
                  outline: "none",
                  background: "white",
                  color: "#222",
                  minWidth: 0,
                }}
              />
              <button
                style={{
                  background: "#2196F3",
                  color: "white",
                  border: "none",
                  borderRadius: "0.6rem",
                  padding: "0.7rem 1.1rem",
                  fontSize: "0.95rem",
                  fontWeight: "bold",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  cursor: "pointer",
                  minWidth: 0,
                }}
              >
                <i className="fa-solid fa-magnifying-glass"></i>
                Search
              </button>
            </div>
          </section>
        </div>

        <section className="section-responsive"
          style={{
            background: "white",
            boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
            borderRadius: "1.3rem",
            padding: "1.5rem 2rem",
            minHeight: "60px",
            position: "relative",
            marginTop: "1.2rem",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.7rem" }}>
              <i className="fa-solid fa-triangle-exclamation" style={{ fontSize: "1.3rem", color: "#F44336" }}></i>
              <span style={{ fontWeight: "bold", fontSize: "1.1rem", color: "#222" }}>
                Report Waste Violation
              </span>
            </div>
            <Link href="/reports" style={{ color: "#F44336", fontWeight: "bold", textDecoration: "underline", fontSize: "0.95rem" }}>
              View Reports
            </Link>
          </div>
          <form style={{ marginTop: "1.2rem", display: "flex", flexDirection: "column", gap: "1.2rem" }}>
            {/* Title input box and label */}
            <div>
              <label style={{ fontWeight: "bold", color: "#222", marginBottom: "0.4rem", display: "block", fontSize: "1rem" }}>
                Report Title
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
                  marginBottom: "0.4rem",
                  background: "white",
                  color: "#222",
                }}
              />
            </div>
            <div>
              <label style={{ fontWeight: "bold", color: "#222", marginBottom: "0.4rem", display: "block", fontSize: "1rem" }}>
                Description
              </label>
              <input
                type="text"
                placeholder="Describe the illegal dumping activity"
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
              />
            </div>
            <div style={{ display: "flex", gap: "0.7rem" }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontWeight: "bold", color: "#222", marginBottom: "0.4rem", display: "block", fontSize: "1rem" }}>
                  Location
                </label>
                <input
                  type="text"
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
                />
              </div>
              <div
                style={{
                  flex: 1,
                  border: "2px dashed #e0e0e0",
                  borderRadius: "1.2rem",
                  padding: "1rem",
                  textAlign: "center",
                  background: "#F9F9F9",
                  color: "#888",
                  marginBottom: "0.4rem",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "0.4rem",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
                onClick={() => imageInputRef.current.click()}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
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
                      maxHeight: "120px",
                      borderRadius: "0.5rem",
                    }}
                  />
                )}
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-start", marginTop: "0.7rem" }}>
              <button
                type="submit"
                style={{
                  background: "#F44336",
                  color: "white",
                  border: "none",
                  borderRadius: "0.6rem",
                  padding: "0.7rem 1.3rem",
                  fontSize: "0.95rem",
                  fontWeight: "bold",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  cursor: "pointer",
                }}
              >
                <i className="fa-solid fa-paper-plane"></i>
                Submit Report
              </button>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}
