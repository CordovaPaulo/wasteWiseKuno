import AdminNavBar from "../componentsadmin/adminNavBar";
import styles from './adashboard.module.css';

export default function AdminDashboard() {
  // Mock data - replace with real data later
  const stats = {
    totalReports: 142,
    pendingReports: 28,
    resolvedCases: 114
  };

  const recentActivities = [
  {
    id: 1,
    icon: "fas fa-exclamation-triangle",
    iconColor: "#ef4444",
    message: "Violation reported in Barangay Barretto",
    time: "2 hours ago"
  },
  {
    id: 2,
    icon: "fas fa-check-circle",
    iconColor: "#10b981",
    message: "Waste collection completed in Barangay East Bajac-Bajac",
    time: "4 hours ago"
  },
  {
    id: 3,
    icon: "fas fa-calendar-alt",
    iconColor: "#3b82f6",
    message: "New collection schedule posted for Barangay Kalaklan",
    time: "6 hours ago"
  },
  {
    id: 4,
    icon: "fas fa-user-plus",
    iconColor: "#8b5cf6",
    message: "New user registered from Barangay West Tapinac",
    time: "8 hours ago"
  },
  {
    id: 5,
    icon: "fas fa-flag",
    iconColor: "#f59e0b",
    message: "Report flagged for review in Barangay Gordon Heights",
    time: "1 day ago"
  }
];

  return (
    <>
      <AdminNavBar />
      <main className={styles.dashboardMain}>
        <div className={styles.container}>
          <h1 className={styles.title}>Dashboard Overview</h1>
          
          {/* Stats Cards */}
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statIcon} style={{ backgroundColor: '#3b82f6' }}>
                <i className="fas fa-file-alt"></i>
              </div>
              <div className={styles.statContent}>
                <div className={styles.statTitle}>Total Reports</div>
                <div className={styles.statNumber}>{stats.totalReports}</div>
              </div>
            </div>
            
            <div className={styles.statCard}>
              <div className={styles.statIcon} style={{ backgroundColor: '#f59e0b' }}>
                <i className="fas fa-clock"></i>
              </div>
              <div className={styles.statContent}>
                <div className={styles.statTitle}>Pending Reports</div>
                <div className={styles.statNumber}>{stats.pendingReports}</div>
              </div>
            </div>
            
            <div className={styles.statCard}>
              <div className={styles.statIcon} style={{ backgroundColor: '#10b981' }}>
                <i className="fas fa-check-circle"></i>
              </div>
              <div className={styles.statContent}>
                <div className={styles.statTitle}>Resolved Cases</div>
                <div className={styles.statNumber}>{stats.resolvedCases}</div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className={styles.activitySection}>
            <h2 className={styles.sectionTitle}>Recent Activity</h2>
            <div className={styles.activityContainer}>
              {recentActivities.map((activity) => (
                <div key={activity.id} className={styles.activityItem}>
                  <div 
                    className={styles.activityIcon} 
                    style={{ backgroundColor: activity.iconColor }}
                  >
                    <i className={activity.icon}></i>
                  </div>
                  <div className={styles.activityContent}>
                    <span className={styles.activityMessage}>{activity.message}</span>
                    <span className={styles.activityTime}>— {activity.time}</span>
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
