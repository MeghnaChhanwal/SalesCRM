// src/pages/Leads.jsx
import React, { useState, useEffect } from "react";
import LeadCard from "../components/LeadCard";
import SearchFilter from "../components/SearchFilter";
import Layout from "../components/Layout";
import API from "../utils/axios";
import { useAuth } from "../contexts/AuthContext";
import styles from "../styles/Leads.module.css";

const Leads = () => {
  const { employee } = useAuth(); // logged in employee context पासून मिळवा
  const [leads, setLeads] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterOption, setFilterOption] = useState(""); // "" | "Ongoing" | "Closed"
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // logged in employee info available असेल तरच fetch करा
    if (!employee?._id) {
      setLeads([]);
      return;
    }

    const fetchLeads = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await API.get("/api/leads", {
          params: {
            assignedEmployee: employee._id,  // logged in employee नुसार filter
            search: searchTerm.trim(),
            filter: filterOption,
            page: 1,
            limit: 20,
            sortBy: "receivedDate",
            order: "desc",
          },
        });

        // Backend मध्ये response.data.leads मध्ये leads असतील
        setLeads(response.data.leads || []);
      } catch (err) {
        console.error("Failed to fetch leads:", err);
        setError("Failed to load leads. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchLeads();
  }, [searchTerm, filterOption, employee]);

  return (
    <Layout>
      <div className={styles.container}>
        <header className={styles.header}>
          <h2>Lead Management</h2>
        </header>

        <SearchFilter
          searchTerm={searchTerm}
          onSearch={setSearchTerm}
          filterOption={filterOption}
          onFilterChange={setFilterOption}
          pageType="lead"
        />

        <section className={styles.body}>
          {loading && <p>Loading leads...</p>}
          {error && <p className={styles.errorMsg}>{error}</p>}
          {!loading && !error && leads.length === 0 && (
            <p className={styles.emptyMsg}>No leads found.</p>
          )}
          {!loading &&
            !error &&
            leads.length > 0 &&
            leads.map((lead) => <LeadCard key={lead._id} lead={lead} />)}
        </section>
      </div>
    </Layout>
  );
};

export default Leads;
