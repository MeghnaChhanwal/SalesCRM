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
        callbacks: {
          label: (context) => `Conversion: ${context.raw}%`,
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
      });
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
          {/* Summary Cards */}
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

          {/* Chart and Activity */}
          <div className={styles.analyticsRow}>
            <div className={styles.chartBox}>
              <h4>Sales Analytics</h4>
              <div className={styles.chartWrapper}>
                <Bar data={chartData} options={chartOptions} />
              </div>
              {clickedDayInfo && (
                <div className={styles.dayDetail}>
                  📊 {clickedDayInfo.closedLeads} leads closed on {clickedDayInfo.day}
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
                      • {activity.message} —{" "}
                      {new Date(activity.time).toLocaleString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                      })}
                    </li>
                  ))
                )}
              </ul>
            </div>
          </div>

          {/* Employee Table */}
          <div className={styles.tableWrapper}>
            <h4>Employee Overview</h4>
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
                  {employees.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ textAlign: "center" }}>
                        No employees found
                      </td>
                    </tr>
                  ) : (
                    employees.map((emp) => (
                      <tr key={emp._id}>
                        <td>{emp.firstName} {emp.lastName}</td>
                        <td>{emp.email}</td>
                        <td>{emp.employeeId}</td>
                        <td
                          style={{
                            color: emp.status === "Active" ? "#2ecc71" : "#e74c3c",
                            fontWeight: "bold",
                          }}
                        >
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
