"use client";

import Link from "next/link";
import { useState, useRef, useMemo, useEffect } from "react";
import api from "../lib/axios";

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
}


// Fetch schedules from backend
const fetchSchedules = async () => {
  const authToken = getCookie("authToken");
  try {
    const response = await api.get("/api/user/schedules", {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });
    console.log("Fetched schedules:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching schedules:", error);
    return [];
  }
};

// Helper function to parse day string and calculate next pickup
function getNextPickupFromDay(dayString) {
  const today = new Date();
  today.setHours(0,0,0,0);
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  
  // Handle "On call" case
  if (dayString.toLowerCase().includes("on call")) {
    return { daysLeft: "On call", dateStr: "", daysNum: null };
  }
  
  // Handle monthly schedules
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
  
  // Handle regular weekly schedules
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

export default function Page() {
  const [schedules, setSchedules] = useState([]);
  const [selectedBarangay, setSelectedBarangay] = useState("");
  const [location, setLocation] = useState("");
  const [image, setImage] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const imageInputRef = useRef();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Fetch schedules on component mount
  useEffect(() => {
    const loadSchedules = async () => {
      const fetchedSchedules = await fetchSchedules();
      setSchedules(fetchedSchedules);
    };
    loadSchedules();
  }, []);

  // Get unique barangay names from API data
  const barangays = useMemo(() => {
    return schedules.map(s => s.barangay).sort();
  }, [schedules]);

  // Get schedule data for selected barangay
  const barangaySchedules = useMemo(() => {
    if (!selectedBarangay || schedules.length === 0) return [];
    
    const barangayData = schedules.find(s => s.barangay === selectedBarangay);
    if (!barangayData || !Array.isArray(barangayData.type)) return [];
    
    return barangayData.type.map(t => ({
      type: t.typeName,
      color: getTypeColor(t.typeName),
      schedule: t.day,
      next: getNextPickupFromDay(t.day)
    }));
  }, [selectedBarangay, schedules]);

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

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg("");
    setErrorMsg("");

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
  .custom-select-wrapper select {
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23047857' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 1rem center;
    background-size: 1.2em;
  }
  
  @media (max-width: 900px) {
    .custom-select-wrapper select {
      background-position: right 0.8rem center;
      padding-right: 2.5rem;
    }
  }
  @media (max-width: 600px) {
    .custom-select-wrapper select {
      background-position: right 0.6rem center;
      padding-right: 2.2rem;
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
                  padding: "0.6rem 2.5rem 0.6rem 1.2rem",
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
                  cursor: "pointer",
                  backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'16\' height=\'16\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%23047857\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpolyline points=\'6 9 12 15 18 9\'%3E%3C/polyline%3E%3C/svg%3E")',
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "right 1rem center",
                  backgroundSize: "1.2em"
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
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {(selectedBarangay && barangaySchedules.length > 0 ? barangaySchedules : []).map((s, index) => (
                <div
                  key={`${s.type}-${index}`}
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

        {/* Report section */}
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
          <form style={{ marginTop: "1.2rem", display: "flex", flexDirection: "column", gap: "1.2rem" }} onSubmit={handleSubmit}>
            <div>
              <label style={{ fontWeight: "bold", color: "#222", marginBottom: "0.4rem", display: "block", fontSize: "1rem" }}>
                Report Title
              </label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
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
                required
              />
            </div>
            <div>
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
                  marginBottom: "0.4rem",
                  background: "white",
                  color: "#222",
                }}
                required
              />
            </div>
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
                disabled={loading}
              >
                <i className="fa-solid fa-paper-plane"></i>
                {loading ? "Submitting..." : "Submit Report"}
              </button>
            </div>
            {successMsg && (
              <div style={{ color: "#047857", marginTop: "1rem", fontWeight: "bold" }}>
                {successMsg}
              </div>
            )}
            {errorMsg && (
              <div style={{ color: "#F44336", marginTop: "1rem", fontWeight: "bold" }}>
                {errorMsg}
              </div>
            )}
          </form>
        </section>
      </div>
    </main>
  );
}