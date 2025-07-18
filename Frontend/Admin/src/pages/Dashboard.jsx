import React, { useEffect, useState } from "react";
import MainLayout from "../components/Layout";
import styles from "../styles/Dashboard.module.css";
import { Bar } from "react-chartjs-2";
import API from "../utils/axios";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
  Title,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
  Title
);

// Utility to display time ago
const getTimeAgo = (dateStr) => {
  const now = new Date();
  const past = new Date(dateStr);
  const diffMs = now - past;

  const minutes = Math.floor(diffMs / (1000 * 60));
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (days > 0) return `${days} day${days > 1 ? "s" : ""} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  if (minutes > 0) return `${minutes} min${minutes > 1 ? "s" : ""} ago`;
  return "Just now";
};

const Dashboard = () => {
  const [employees, setEmployees] = useState([]);
  const [stats, setStats] = useState({
    unassignedLeads: 0,
    assignedThisWeek: 0,
    activeSalespeople: 0,
    conversionRate: 0,
    recentActivities: [],
    graphData: [],
  });

  const [clickedDayInfo, setClickedDayInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const res = await API.get("/api/dashboard/overview");
        setStats(res.data);
        setEmployees(res.data.employees || []);
      } catch (err) {
        console.error("Dashboard error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardStats();
  }, []);

  const dayLabels = stats.graphData.map((d) =>
    new Date(d.date).toLocaleDateString("en-US", { weekday: "short" })
  );

  const chartData = {
    labels: dayLabels,
    datasets: [
      {
        label: "Closed Leads",
        data: stats.graphData.map((d) => d.closedLeads),
        backgroundColor: "rgba(40, 167, 69, 0.7)", // green
        yAxisID: "y1",
        borderRadius: 6,
        maxBarThickness: 40,
      },
      {
        label: "Conversion Rate (%)",
        data: stats.graphData.map((d) => d.conversion),
        type: "line",
        borderColor: "#007bff",
        backgroundColor: "rgba(0, 123, 255, 0.3)",
        yAxisID: "y2",
        tension: 0.3,
        fill: true,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: "index",
      intersect: false,
    },
    plugins: {
      legend: {
        position: "top",
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.dataset.label || "";
            const value = context.raw;
            return label === "Conversion Rate (%)"
              ? `${label}: ${value}%`
              : `${label}: ${value}`;
          },
        },
      },
    },
    onClick: (event, elements) => {
      if (!elements.length) return;
      const index = elements[0].index;
      const selected = stats.graphData[index];
      const dayName = new Date(selected.date).toLocaleDateString("en-US", {
        weekday: "long",
      });

      setClickedDayInfo({
        day: dayName,
        closedLeads: selected.closedLeads,
        conversion: selected.conversion,
      });
    },
    scales: {
      y1: {
        type: "linear",
        position: "left",
        title: { display: true, text: "Closed Leads" },
        beginAtZero: true,
      },
      y2: {
        type: "linear",
        position: "right",
        title: { display: true, text: "Conversion Rate (%)" },
        beginAtZero: true,
        max: 100,
        ticks: {
          callback: (value) => `${value}%`,
        },
        grid: { drawOnChartArea: false },
      },
    },
  };

  if (loading) {
    return (
      <MainLayout showSearch={false}>
        <div className={styles.dashboardContainer}>
          <h4>Loading dashboard...</h4>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout showSearch={false}>
      <div className={styles.pageWrapper}>
        <div className={styles.dashboardContainer}>
          {/* 🔹 Top Stats */}
          <div className={styles.cardGrid}>
            <div className={styles.card}><h4>Unassigned Leads</h4><p>{stats.unassignedLeads}</p></div>
            <div className={styles.card}><h4>Assigned This Week</h4><p>{stats.assignedThisWeek}</p></div>
            <div className={styles.card}><h4>Active Salespeople</h4><p>{stats.activeSalespeople}</p></div>
            <div className={styles.card}><h4>Conversion Rate</h4><p>{stats.conversionRate}%</p></div>
          </div>

          {/* 🔹 Chart + Activity */}
          <div className={styles.analyticsRow}>
            <div className={styles.chartBox}>
              <h4>Sales Analytics</h4>
              <div className={styles.chartWrapper}>
                <Bar data={chartData} options={chartOptions} />
              </div>
              {clickedDayInfo && (
                <div className={styles.dayDetail}>
                  <strong>{clickedDayInfo.day}</strong> — {clickedDayInfo.closedLeads} leads closed, Conversion Rate: {clickedDayInfo.conversion}%
                </div>
              )}
            </div>

            <div className={styles.activityBox}>
              <h4>Recent Activity</h4>
              <ul className={styles.activityList}>
                {stats.recentActivities.length === 0 ? (
                  <li>No recent activities.</li>
                ) : (
                  stats.recentActivities.map((activity, index) => (
                    <li key={index}>
                      • {activity.message} — {getTimeAgo(activity.time)}
                    </li>
                  ))
                )}
              </ul>
            </div>
          </div>

          {/* 🔹 Employees Table (Only Active) */}
          <div className={styles.tableWrapper}>
            <h4>Active Employees</h4>
            <div className={styles.tableScroll}>
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Employee ID</th>
                    <th>Status</th>
                    <th>Assigned</th>
                    <th>Closed</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.filter(emp => emp.status === "Active").length === 0 ? (
                    <tr><td colSpan="6" style={{ textAlign: "center" }}>No active employees</td></tr>
                  ) : (
                    employees
                      .filter(emp => emp.status === "Active")
                      .map((emp) => (
                        <tr key={emp._id}>
                          <td>{emp.firstName} {emp.lastName}</td>
                          <td>{emp.email}</td>
                          <td>{emp.employeeId}</td>
                          <td style={{ color: "#2ecc71", fontWeight: "bold" }}>Active</td>
                          <td>{emp.assignedLeads}</td>
                          <td>{emp.closedLeads}</td>
                        </tr>
                      ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Dashboard;
