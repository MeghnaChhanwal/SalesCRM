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
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const Dashboard = () => {
  const [employees, setEmployees] = useState([]);
  const [stats, setStats] = useState({
    unassigned: 0,
    assignedThisWeek: 0,
    activeSalespeople: 0,
    conversionRate: 0,
    recentActivities: [],
    graphData: [],
  });

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

  const chartData = {
    labels: stats.graphData.map((d) => d.date),
    datasets: [
      {
        label: "Sales %",
        data: stats.graphData.map((d) => d.conversion),
        backgroundColor: "#007bff",
        borderRadius: 6,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      tooltip: {
        callbacks: {
          label: (context) => `Sales: ${context.raw}%`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: { stepSize: 20 },
      },
    },
  };

  return (
    <MainLayout showSearch={false}>
      <div className={styles.dashboardContainer}>
        {/* Top Cards */}
        <div className={styles.cardGrid}>
          <div className={styles.card}>
            <h4>Unassigned Leads</h4>
            <p>{stats.unassigned}</p>
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

        {/* Chart + Activity */}
        <div className={styles.analyticsRow}>
          <div className={styles.chartBox}>
            <h4>Sales Analytics</h4>
            <div className={styles.chartWrapper}>
              <Bar data={chartData} options={chartOptions} />
            </div>
          </div>

          <div className={styles.activityBox}>
            <h4>Recent Activity</h4>
            <ul>
              {stats.recentActivities.map((a, i) => (
                <li key={i}>• {a}</li>
              ))}
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
                  <tr><td colSpan="6" style={{ textAlign: "center" }}>No employees found</td></tr>
                ) : (
                  employees.map(emp => (
                    <tr key={emp._id}>
                      <td>{emp.firstName} {emp.lastName}</td>
                      <td>{emp.email}</td>
                      <td>{emp.employeeId}</td>
                      <td style={{ color: emp.status === "Active" ? "green" : "red", fontWeight: "600" }}>
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
    </MainLayout>
  );
};

export default Dashboard;
