// ✅ Updated Chart hover tooltip to show detailed info inline
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

  const [hoverData, setHoverData] = useState(null);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const res = await API.get("/api/dashboard/overview");
        setStats(res.data);
        setEmployees(res.data.employees || []);
      } catch (err) {
        console.error("Dashboard error:", err);
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
        label: "Conversion Rate (%)",
        data: stats.graphData.map((d) => d.conversion),
        backgroundColor: "rgba(0, 123, 255, 0.7)",
        borderColor: "#007bff",
        borderWidth: 1,
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
      tooltip: {
        enabled: true,
        callbacks: {
          label: (ctx) => {
            const index = ctx.dataIndex;
            const day = stats.graphData[index];
            if (day) {
              setHoverData({
                day: new Date(day.date).toLocaleDateString("en-US", { weekday: "long" }),
                closedLeads: day.closedLeads,
                conversion: day.conversion,
              });
            }
            return `Conversion: ${ctx.raw}%`;
          },
        },
      },
    },
    onHover: (event, chartElement) => {
      if (!chartElement.length) setHoverData(null);
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
  };

  return (
    <MainLayout showSearch={false}>
      <div className={styles.pageWrapper}>
        <div className={styles.dashboardContainer}>
          {/* 🔹 Stats Overview */}
          <div className={styles.cardGrid}>
            <div className={styles.card}><h4>Unassigned Leads</h4><p>{stats.unassignedLeads}</p></div>
            <div className={styles.card}><h4>Assigned This Week</h4><p>{stats.assignedThisWeek}</p></div>
            <div className={styles.card}><h4>Active Salespeople</h4><p>{stats.activeSalespeople}</p></div>
            <div className={styles.card}><h4>Conversion Rate</h4><p>{stats.conversionRate}%</p></div>
          </div>

          {/* 🔹 Analytics Chart & Recent Activity */}
          <div className={styles.analyticsRow}>
            <div className={styles.chartBox}>
              <h4>Sales Analytics</h4>
              <div className={styles.chartWrapper}>
                <Bar data={chartData} options={chartOptions} />
              </div>
              {hoverData && (
                <div className={styles.dayDetail}>
                  <strong>{hoverData.day}</strong> — {hoverData.closedLeads} leads closed, Conversion Rate: {hoverData.conversion}%
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
                      • {activity.message || activity.text} — {new Date(activity.time || activity.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </li>
                  ))
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Dashboard;
