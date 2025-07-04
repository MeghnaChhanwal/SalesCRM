import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import SearchFilter from "../components/SearchFilter";
import styles from "../styles/Schedule.module.css";
import API from "../utils/axios";
import { useAuth } from "../contexts/AuthContext";

const Schedule = () => {
  const { employee } = useAuth();
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
      const res = await API.get("/api/leads/scheduled", {
        params: {
          filter: dayFilter.toLowerCase(),
        },
      });

      let allLeads = res.data.leads || [];

      if (employee?._id) {
        allLeads = allLeads.filter(
          (lead) => lead.assignedEmployee?._id === employee._id
        );
      }

      // Optional: filter by search
      const search = searchTerm.trim().toLowerCase();
      const filtered = allLeads.filter(
        (lead) =>
          lead.name.toLowerCase().includes(search) ||
          lead.email?.toLowerCase().includes(search) ||
          lead.phone?.includes(search)
      );

      setLeads(filtered);
    } catch (err) {
      console.error("Error fetching scheduled leads:", err);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name) => {
    const parts = name.trim().split(" ");
    return parts.length >= 2
      ? parts[0][0] + parts[1][0]
      : name.slice(0, 2).toUpperCase();
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
            {leads.map((lead) =>
              lead.scheduledCalls
                .filter((call) => new Date(call.callDate) >= new Date())
                .map((call, index) => (
                  <div key={index} className={styles.card}>
                    <div className={styles.left}>
                      <div className={styles.callType}>
                        {call.callType || "Cold Call"}
                      </div>
                      {lead.phone && (
                        <div className={styles.phone}>{lead.phone}</div>
                      )}
                      <div className={styles.avatar}>{getInitials(lead.name)}</div>
                    </div>
                    <div className={styles.right}>
                      <div className={styles.date}>
                        {new Date(call.callDate).toLocaleString("en-IN", {
                          weekday: "short",
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                  </div>
                ))
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Schedule;
