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
  Tooltip,
  Legend,
  Title,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend, Title);

// Time ago formatter
const getTimeAgo = (dateStr) => {
  const now = new Date();
  const past = new Date(dateStr);
  const diffMs = now - past;

  const minutes = Math.floor(diffMs / 60000);
  const hours = Math.floor(diffMs / 3600000);
  const days = Math.floor(diffMs / 86400000);

  if (days > 0) return `${days} day${days > 1 ? "s" : ""} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  if (minutes > 0) return `${minutes} min${minutes > 1 ? "s" : ""} ago`;
  return "Just now";
};

const Dashboard = () => {
  const [stats, setStats] = useState({
    unassignedLeads: 0,
    assignedThisWeek: 0,
    activeSalespeople: 0,
    conversionRate: 0,
    recentActivities: [],
    graphData: [],
    employees: [],
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const res = await API.get("/api/dashboard/overview");
        setStats(res.data);
      } catch (err) {
        console.error("Dashboard error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardStats();
  }, []);

  const chartData = {
    labels: stats.graphData.map((d) =>
      new Date(d.date).toLocaleDateString("en-US", { weekday: "short" })
    ),
    datasets: [
      {
        label: "Conversion",
        data: stats.graphData.map((d) => d.conversion),
        backgroundColor: "rgba(0, 123, 255, 0.7)",
        borderRadius: 8,
        maxBarThickness: 40,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { enabled: false },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          stepSize: 20,
          callback: (val) => `${val}%`,
        },
      },
    },
    animation: {
      onComplete: function () {
        const chart = this.chart;
        const ctx = chart.ctx;

        chart.data.datasets.forEach((dataset, i) => {
          const meta = chart.getDatasetMeta(i);
          meta.data.forEach((bar, index) => {
            const { x, y } = bar.tooltipPosition();
            const data = dataset.data[index];
            const closed = stats.graphData[index]?.closedLeads || 0;

            ctx.save();
            ctx.font = "12px Segoe UI";
            ctx.textAlign = "center";
            ctx.fillStyle = "#333";
            ctx.fillText(`Closed: ${closed}, ${data}%`, x, y - 10);
            ctx.restore();
          });
        });
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
          {/* 🔹 Stats Cards */}
          <div className={styles.cardGrid}>
            <div className={styles.card}>
              <h4>Unassigned Leads</h4>
              <p>{stats.unassignedLeads}</p>
            </div>
            <div className={styles.card}>
              <h4>Assigned This Week</h4>
              <p>{stats.assignedThisWeek}</p>
            </div>
            <div className={styles.card}>
              <h4>Active Salespeople</h4>
              <p>{stats.activeSalespeople}</p>
            </div>
            <div className={styles.card}>
              <h4>Conversion Rate</h4>
              <p>{stats.conversionRate}%</p>
            </div>
          </div>

          {/* 🔹 Chart and Activity */}
          <div className={styles.analyticsRow}>
            <div className={styles.chartBox}>
              <h4>Sales Analytics</h4>
              <div className={styles.chartWrapper}>
                <Bar data={chartData} options={chartOptions} />
              </div>
            </div>

            <div className={styles.activityBox}>
              <h4>Recent Activity</h4>
              <ul className={styles.activityList}>
                {stats.recentActivities.length === 0 ? (
                  <li>No recent activities.</li>
                ) : (
                  stats.recentActivities.map((activity, index) => (
                    <li key={index}>
                      • {activity.message || activity.text} —{" "}
                      {getTimeAgo(activity.time || activity.timestamp)}
                    </li>
                  ))
                )}
              </ul>
            </div>
          </div>

          {/* 🔹 Employee Table */}
          <div className={styles.tableWrapper}>
            <h4>Employee Overview</h4>
            <div className={styles.tableScroll}>
              <table className={styles.employeeTable}>
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
                  {stats.employees.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ textAlign: "center" }}>
                        No employees found
                      </td>
                    </tr>
                  ) : (
                    stats.employees.map((emp) => (
                      <tr key={emp._id}>
                        <td>{emp.firstName} {emp.lastName}</td>
                        <td>{emp.email}</td>
                        <td>{emp.employeeId}</td>
                        <td style={{
                          fontWeight: "bold",
                          color: emp.status === "Active" ? "#2ecc71" : "#e74c3c"
                        }}>
                          {emp.status}
                        </td>
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
