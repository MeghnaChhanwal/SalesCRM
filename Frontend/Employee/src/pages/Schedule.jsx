import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import API from "../utils/axios";
import SearchFilter from "../components/SearchFilter";
import styles from "../styles/Schedule.module.css";
import { useAuth } from "../contexts/AuthContext";

const Schedule = () => {
  const { employee } = useAuth();
  const [leads, setLeads] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterOption, setFilterOption] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchLeads = async () => {
      if (!employee?._id) return;
      try {
        setLoading(true);
        const res = await API.get("/api/leads", {
          params: { assignedEmployee: employee._id },
        });
        setLeads(res.data.leads || []);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch scheduled calls.");
      } finally {
        setLoading(false);
      }
    };

    fetchLeads();
  }, [employee]);

  const getLatestValidCall = (lead) => {
    const sorted = (lead.scheduledCalls || [])
      .filter((call) => call.callDate)
      .sort((a, b) => new Date(b.callDate) - new Date(a.callDate));

    const latestCall = sorted[0];
    if (!latestCall) return null;

    if (filterOption === "Today") {
      const callDate = new Date(latestCall.callDate).toDateString();
      const today = new Date().toDateString();
      if (callDate !== today) return null;
    }

    const matchesSearch =
      lead.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch ? latestCall : null;
  };

  const formatDateTime = (dateStr) => {
    const date = new Date(dateStr);
    const options = { hour: "numeric", minute: "2-digit", hour12: true };
    const time = date.toLocaleTimeString("en-IN", options).toLowerCase();
    const formattedDate = date.toLocaleDateString("en-GB"); // dd/mm/yyyy
    return `${time} ${formattedDate}`;
  };

  return (
    <Layout>
      <div className={styles.container}>
        <SearchFilter
          searchTerm={searchTerm}
          onSearch={setSearchTerm}
          filterOption={filterOption}
          onFilterChange={setFilterOption}
          pageType="schedule"
        />

        {loading && <p>Loading scheduled calls...</p>}
        {error && <p className={styles.errorMsg}>{error}</p>}

        <div className={styles.body}>
          {leads.map((lead) => {
            const latestCall = getLatestValidCall(lead);
            if (!latestCall) return null;

            return (
              <div key={lead._id} className={styles.card}>
                <div className={styles.topRow}>
                  <div className={styles.left}>
                    <span className={styles.callType}>
                      {latestCall.callType || "Call"}
                    </span>
                  </div>
                  <div className={styles.right}>
                    <span className={styles.dateLabel}>Date</span>
                    <span className={styles.date}>
                      {formatDateTime(latestCall.callDate)}
                    </span>
                  </div>
                </div>

                <div className={styles.phone}>{lead.phone || "—"}</div>

                <div className={styles.bottomRow}>
                  <div className={styles.callBox}>
                    <img
                      src="/images/location.png"
                      alt="Call Icon"
                      className={styles.icon}
                    />
                    <span className={styles.callLabel}>Call</span>
                  </div>
                  <div className={styles.user}>
                    <div className={styles.avatar}>
                      {lead.name
                        ?.split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()}
                    </div>
                    <span className={styles.leadName}>{lead.name}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Layout>
  );
};

export default Schedule;
