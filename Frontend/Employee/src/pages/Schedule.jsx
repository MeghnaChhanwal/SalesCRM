// src/pages/Schedule.jsx
import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import SearchFilter from "../components/SearchFilter";
import styles from "../styles/Schedule.module.css";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";

const API_BASE = import.meta.env.VITE_API_BASE;

const Schedule = () => {
  const { Employee } = useAuth();
  const [leads, setLeads] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [dayFilter, setDayFilter] = useState("Today");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchScheduledLeads();
  }, [searchTerm, dayFilter]);

  const fetchScheduledLeads = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/api/leads`, {
        params: { search: searchTerm }
      });

      const allLeads = res.data.leads.filter((lead) => lead.scheduledCalls?.length > 0);

      const filtered = allLeads.filter((lead) => {
        if (dayFilter === "All") return true;
        return lead.scheduledCalls.some((call) => {
          const callDate = new Date(call.callDate).toDateString();
          const today = new Date().toDateString();
          return callDate === today;
        });
      });

      setLeads(filtered);
    } catch (err) {
      console.error("Error fetching scheduled leads:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className={styles.container}>
        <SearchFilter
          searchTerm={searchTerm}
          onSearch={setSearchTerm}
          statusFilter={dayFilter}
          onStatusFilter={setDayFilter}
          options={["Today", "All"]}
        />

        {loading ? (
          <p className={styles.message}>Loading schedule...</p>
        ) : leads.length === 0 ? (
          <p className={styles.message}>No scheduled calls found.</p>
        ) : (
          <div className={styles.cardList}>
            {leads.map((lead) => (
              <div className={styles.card} key={lead._id}>
                <h4>{lead.name}</h4>
                {lead.scheduledCalls.map((call, index) => (
                  <div key={index} className={styles.callInfo}>
                    <p><strong>{call.callType}</strong></p>
                    <p>{new Date(call.callDate).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Schedule;
