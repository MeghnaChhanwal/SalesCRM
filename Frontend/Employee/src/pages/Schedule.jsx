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
  const [filterOption, setFilterOption] = useState(""); // "Today" / "All Day"
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchLeads = async () => {
      if (!employee?._id) return;

      try {
        setLoading(true);
        setError("");

        const response = await API.get("/api/leads", {
          params: {
            assignedEmployee: employee._id,
          },
        });

        setLeads(response.data.leads || []);
      } catch (err) {
        console.error("Error fetching leads", err);
        setError("Failed to fetch scheduled calls.");
      } finally {
        setLoading(false);
      }
    };

    fetchLeads();
  }, [employee]);

  const filterCalls = (lead) => {
    // Match search
    const matchesSearch =
      lead.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email?.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return [];

    // Filter calls based on selected filterOption
    const todayStr = new Date().toDateString();

    return (lead.scheduledCalls || []).filter((call) => {
      if (filterOption === "Today") {
        const callDateStr = new Date(call.callDate).toDateString();
        return callDateStr === todayStr;
      }
      return true; // All Day (show all)
    });
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

        {!loading && !error && leads.length === 0 && (
          <p className={styles.emptyMsg}>No scheduled calls.</p>
        )}

        <section className={styles.body}>
          {leads.map((lead) => {
            const filteredCalls = filterCalls(lead);
            if (filteredCalls.length === 0) return null;

            return (
              <div key={lead._id} className={styles.card}>
                <h4 className={styles.name}>{lead.name}</h4>
                <p className={styles.email}>{lead.email}</p>
                <ul className={styles.callList}>
                  {filteredCalls.map((call, idx) => (
                    <li key={idx} className={styles.callItem}>
                      <span className={styles.callType}>{call.callType}</span>
                      <span className={styles.callDate}>
                        {new Date(call.callDate).toLocaleString("en-IN", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </section>
      </div>
    </Layout>
  );
};

export default Schedule;
