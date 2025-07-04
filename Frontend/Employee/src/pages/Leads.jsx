import React, { useState, useEffect } from "react";
import LeadCard from "../components/LeadCard";
import SearchFilter from "../components/SearchFilter";
import Layout from "../components/Layout";
import API from "../utils/axios";
import { useAuth } from "../contexts/AuthContext";
import styles from "../styles/Leads.module.css";

const Leads = () => {
  const { employee } = useAuth(); // Logged-in employee
  const [leads, setLeads] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterOption, setFilterOption] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch assigned leads
  useEffect(() => {
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
            assignedEmployee: employee._id,
            search: searchTerm.trim(),
            filter: filterOption,
            page: 1,
            limit: 20,
            sortBy: "receivedDate",
            order: "desc",
          },
        });

        setLeads(response.data.leads || []);
      } catch (err) {
        console.error("Error loading leads:", err);
        setError("Failed to load leads.");
      } finally {
        setLoading(false);
      }
    };

    fetchLeads();
  }, [searchTerm, filterOption, employee]);

  // Update lead type (Hot/Warm/Cold)
  const handleTypeChange = async (id, newType) => {
    try {
      await API.patch(`/api/leads/${id}/type`, { type: newType });
      setLeads((prev) =>
        prev.map((lead) => (lead._id === id ? { ...lead, type: newType } : lead))
      );
    } catch {
      alert("Failed to update lead type.");
    }
  };

  // Update lead status (Ongoing/Closed)
  const handleStatusChange = async (id, newStatus) => {
    try {
      await API.patch(`/api/leads/${id}/status`, { status: newStatus });
      setLeads((prev) =>
        prev.map((lead) =>
          lead._id === id ? { ...lead, status: newStatus } : lead
        )
      );
    } catch (err) {
      alert(err?.response?.data?.error || "Failed to update status.");
    }
  };

  // Schedule call popup trigger (custom modal logic)
  const handleScheduleCall = async (lead) => {
    const callDate = prompt("Enter call date and time (e.g., 2025-07-04T14:30):");
    if (!callDate) return;

    try {
      await API.post(`/api/leads/${lead._id}/schedule`, { callDate });
      alert("Call scheduled!");
    } catch (err) {
      alert(err?.response?.data?.error || "Failed to schedule call.");
    }
  };

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
            <p className={styles.emptyMsg}>No leads assigned.</p>
          )}
          {!loading &&
            !error &&
            leads.map((lead) => (
              <LeadCard
                key={lead._id}
                lead={lead}
                onTypeChange={handleTypeChange}
                onStatusChange={handleStatusChange}
                onScheduleCall={handleScheduleCall}
              />
            ))}
        </section>
      </div>
    </Layout>
  );
};

export default Leads;
