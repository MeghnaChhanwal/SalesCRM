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
  const [selectedCardId, setSelectedCardId] = useState(null);

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
              <div
                key={lead._id}
                className={`${styles.card} ${
                  selectedCardId === lead._id ? styles.activeCard : ""
                }`}
                onClick={() => setSelectedCardId(lead._id)}
              >
                <div className={styles.cardHeader}>
                  <span className={styles.callType}>
                    {latestCall.callType || "Call"}
                  </span>
                  <span className={styles.date}>
                    {new Date(latestCall.callDate).toLocaleDateString("en-IN")}
                  </span>
                </div>

                <div className={styles.phone}>{lead.phone || "—"}</div>

                <div className={styles.callDetails}>
                  <img
                    src="/icons/phone.svg"
                    alt="Phone Icon"
                    className={styles.icon}
                  />
                  <span>Call</span>
                  <div className={styles.user}>
                    <div className={styles.avatar}>
                      {lead.name
                        ?.split(" ")
                        .map((n) => n[0]?.toUpperCase())
                        .join("")}
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
