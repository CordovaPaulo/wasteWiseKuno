"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import styles from "./wastelog.module.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Chart from "chart.js/auto";
import api from "../../lib/axios";

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
}

const CATEGORIES = [
  { value: "Plastic", color: "#4CAF50" },
  { value: "Paper", color: "#2196F3" },
  { value: "Food", color: "#FFB300" },
  { value: "Glass", color: "#8BC34A" },
  { value: "Metal", color: "#9E9E9E" },
  { value: "E-Waste", color: "#F44336" },
  { value: "Other", color: "#607D8B" },
];

const UNITS = [
  { value: "kg", label: "kg" },
  { value: "g", label: "g" },
  { value: "lb", label: "lb" },
  { value: "L", label: "L" },
  { value: "m³", label: "m³" },
];

// --- API helpers ---
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
const getToken = () =>
  localStorage.getItem("token") ||
  localStorage.getItem("authToken") ||
  localStorage.getItem("accessToken") ||
  localStorage.getItem("jwt");

const CHART_LABELS = ["Plastic", "Paper", "Food", "Glass", "Metal", "E-Waste"];
const SAMPLE_DATA = [12, 8, 15, 5, 4, 3];

export default function WasteLogPage() {
  const [isMobile, setIsMobile] = useState(true);
  const [logs, setLogs] = useState([]);
  const [type, setType] = useState(CATEGORIES[0].value);
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState(UNITS[0].value);
  const [date, setDate] = useState(() => {
    const d = new Date();
    const m = `${d.getMonth() + 1}`.padStart(2, "0");
    const day = `${d.getDate()}`.padStart(2, "0");
    return `${d.getFullYear()}-${m}-${day}`;
  });

  const chartCanvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    const update = () => setIsMobile(window.innerWidth <= 768);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // Load from API on mount, fallback to local storage on error
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const token = getCookie("authToken") || getToken();
        if (!token) throw new Error("Missing auth token");
        const res = await api.get("/api/user/wastelogs", {
          // headers: { Authorization: `Bearer ${token}` },
        });
        const data = res.data;
        const items = (data?.wasteLogs ?? []).map((w) => ({
          id: w._id || `${w.createdAt}`,
          type: w.wasteType,
          quantity: w.quantity,
          unit: w.unit,
          // normalize to YYYY-MM-DD for grouping
          date: new Date(w.date).toISOString().slice(0, 10),
          createdAt: new Date(w.createdAt || w.date).getTime(),
        }));
        items.sort((a, b) => b.createdAt - a.createdAt);
        setLogs(items);
      } catch {
        try {
          const raw = localStorage.getItem("wasteLogs");
          if (raw) setLogs(JSON.parse(raw));
        } catch {}
      }
    };
    fetchLogs();
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("wasteLogs", JSON.stringify(logs));
    } catch {}
  }, [logs]);

  const handleAdd = async (e) => {
    e.preventDefault();
    const q = Number(quantity);
    if (!type || !quantity || Number.isNaN(q) || q <= 0 || !unit || !date) {
      toast.error("Please enter valid details.");
      return;
    }

    try {
      const token = getCookie("authToken") || getToken();
      if (!token) {
        toast.error("Not authenticated.");
        return;
      }

      const payload = {
        wasteType: String(type),
        quantity: String(q),
        unit: String(unit),
        date: String(date), // backend accepts date as string; Mongoose parses to Date
      };

      const res = await api.post("/api/user/wastelog", payload, {
        // headers: {
        //   Authorization: `Bearer ${token}`,
        // },
      });

      const data = res.data;
      const w = data?.wasteLog;
      const item = w
        ? {
            id: w._id || `${w.createdAt}`,
            type: w.wasteType,
            quantity: w.quantity,
            unit: w.unit,
            date: new Date(w.date).toISOString().slice(0, 10),
            createdAt: new Date(w.createdAt || w.date).getTime(),
          }
        : {
            // Fallback if API shape changes
            id: `${Date.now()}`,
            type,
            quantity: q,
            unit,
            date,
            createdAt: Date.now(),
          };

      setLogs((prev) => [item, ...prev]);

      setQuantity("");
      setUnit(UNITS[0].value);
      setType(CATEGORIES[0].value);
      setDate(() => {
        const d = new Date();
        const m = `${d.getMonth() + 1}`.padStart(2, "0");
        const day = `${d.getDate()}`.padStart(2, "0");
        return `${d.getFullYear()}-${m}-${day}`;
      });
      toast.success("Log added.");
    } catch (err) {
      toast.error("Could not add waste log.");
    }
  };

  const handleDelete = async (id) => {
    const isMongoId = /^[a-f\d]{24}$/i.test(id);
    if (!isMongoId) {
      // Fallback: local-only removal for items without a persisted Mongo _id
      setLogs((prev) => prev.filter((x) => x.id !== id));
      toast.info("Waste log removed.");
      return;
    }

    try {
      const token = getCookie("authToken") || getToken();
      if (!token) {
        toast.error("Not authenticated.");
        return;
      }
      const res = await api.delete(`/api/user/wastelog/${id}`, {
        // headers: { Authorization: `Bearer ${token}` },
      });
      // axios will throw on non-2xx, but keep response check for safety
      if (res.status < 200 || res.status >= 300) throw new Error("Delete failed");
      setLogs((prev) => prev.filter((x) => x.id !== id));
      toast.success("Waste log deleted.");
    } catch {
      toast.error("Could not delete waste log.");
    }
  };

  // Aggregate totals per category for the chart
  const chartTotals = useMemo(() => {
    const totalsMap = Object.fromEntries(CHART_LABELS.map((l) => [l, 0]));
    for (const l of logs) {
      if (totalsMap.hasOwnProperty(l.type)) {
        const q = Number(l.quantity) || 0;
        totalsMap[l.type] += q;
      }
    }
    return CHART_LABELS.map((l) => totalsMap[l] || 0);
  }, [logs]);

  const chartData = useMemo(() => {
    const hasData = chartTotals.some((v) => v > 0);
    return hasData ? chartTotals : SAMPLE_DATA;
  }, [chartTotals]);

  // Chart colors based on theme/category colors
  const chartColors = useMemo(() => {
    return CHART_LABELS.map(
      (l) => CATEGORIES.find((c) => c.value === l)?.color || "#047857"
    );
  }, []);

  // Create/update chart
  useEffect(() => {
    if (!chartCanvasRef.current) return;
    if (chartRef.current) {
      chartRef.current.destroy();
    }
    chartRef.current = new Chart(chartCanvasRef.current, {
      type: "bar", // choose bar for layout; switch to 'pie' if preferred
      data: {
        labels: CHART_LABELS,
        datasets: [
          {
            label: "Total",
            data: chartData,
            backgroundColor: chartColors,
            borderColor: chartColors,
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          title: {
            display: true,
            text: "Waste Generation by Category",
          },
        },
        scales: {
          y: { beginAtZero: true },
        },
      },
    });
    return () => chartRef.current?.destroy();
  }, [chartData, chartColors, isMobile]);

  const groupedByDate = useMemo(() => {
    const map = new Map();
    for (const l of logs) {
      if (!map.has(l.date)) map.set(l.date, []);
      map.get(l.date).push(l);
    }
    const entries = Array.from(map.entries()).sort((a, b) => (a[0] < b[0] ? 1 : -1));
    return entries;
  }, [logs]);

  const getCategoryColor = (name) => CATEGORIES.find((t) => t.value === name)?.color || "#047857";

  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <h1 className={styles.pageLabel}>Waste Log</h1>
        <p className={styles.pageDesc}>Track and review your waste by category, quantity, and date</p>
      </header>

      <section className={styles.section}>
        <div className={styles.columns}>
          <div className={`${styles.whiteContainer} ${styles.leftContainer}`}>
            <div className={styles.wasteCreateLabel}>Add Waste Entry</div>
            <form className={styles.createLogForm} onSubmit={handleAdd}>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel} htmlFor="category">Category</label>
                  <div className={styles.selectWrap}>
                    <select
                      id="category"
                      className={styles.select}
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                    >
                      {CATEGORIES.map((t) => (
                        <option key={t.value} value={t.value}>{t.value}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className={styles.formGroupInline}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel} htmlFor="quantity">Amount</label>
                    <input
                      id="quantity"
                      type="number"
                      inputMode="decimal"
                      min="0"
                      step="0.01"
                      className={styles.input}
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      placeholder="0.00"
                    />
                  </div>
                  <div className={styles.formGroupUnit}>
                    <label className={styles.formLabel} htmlFor="unit">Unit</label>
                    <div className={styles.selectWrap}>
                      <select
                        id="unit"
                        className={styles.select}
                        value={unit}
                        onChange={(e) => setUnit(e.target.value)}
                      >
                        {UNITS.map((u) => (
                          <option key={u.value} value={u.value}>{u.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel} htmlFor="date">Date</label>
                  <input
                    id="date"
                    type="date"
                    className={styles.input}
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </div>
              </div>

              <div className={styles.formActions}>
                <button type="submit" className={styles.buttonPrimary}>
                  <i className="fas fa-plus" aria-hidden="true" style={{ marginRight: 8 }} />
                  Add Log
                </button>
              </div>
            </form>

            {/* Chart placed directly under the Add Waste Entry form to avoid grid gap */}
            <div className={styles.chartSection}>
              <div className={styles.previousLogsLabel}>Waste Generation by Category</div>
              <div className={styles.chartCanvasWrap} style={{ height: isMobile ? 260 : 320 }}>
                <canvas ref={chartCanvasRef} />
              </div>
            </div>
          </div>

          <div className={`${styles.whiteContainer} ${styles.rightContainer}`}>
            <div className={styles.rightScroll}>
              <div className={styles.previousLogsLabel}>Previous Logs</div>
              {logs.length === 0 ? (
                <div className={styles.emptyState}>
                  <i className="fas fa-recycle" aria-hidden="true" />
                  <span>No logs yet</span>
                </div>
              ) : (
                <ul className={styles.logsList}>
                  {groupedByDate.map(([d, items]) => (
                    <li key={d} className={styles.dateGroup}>
                      <div className={styles.dateHeader}>{new Date(d).toLocaleDateString()}</div>
                      <ul className={styles.itemsList}>
                        {items.map((l) => (
                          <li key={l.id} className={styles.logItem}>
                            <div className={styles.logHeader}>
                              <span className={styles.typePill} style={{ backgroundColor: getCategoryColor(l.type) }}>
                                {l.type}
                              </span>
                              <span className={styles.amount}>
                                {l.quantity} {l.unit}
                              </span>
                            </div>
                            <div className={styles.logFooter}>
                              <span className={styles.logDate}>
                                <i className="far fa-calendar" aria-hidden="true" /> {l.date}
                              </span>
                              <button
                                type="button"
                                className={styles.deleteBtn}
                                onClick={() => handleDelete(l.id)}
                                aria-label="Delete log"
                              >
                                <i className="far fa-trash-alt" aria-hidden="true" /> Remove
                              </button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Removed the separate chart white container to eliminate large gap */}
        </div>
      </section>

      <ToastContainer position="top-right" autoClose={2500} theme="colored" style={{ top: isMobile ? 68 : 8 }} />
    </main>
  );
}