import React, { useState, useEffect } from "react";
import LeadCard from "../components/LeadCard";
import SearchFilter from "../components/SearchFilter";
import Layout from "../components/Layout";
import API from "../utils/axios";
import { useAuth } from "../contexts/AuthContext";
import styles from "../styles/Leads.module.css"; // Include searchBarContainer style in this CSS too

const Leads = () => {
  const { employee } = useAuth();
  const [leads, setLeads] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterOption, setFilterOption] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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

  const handleScheduleCall = async (leadId, callDate) => {
    try {
      await API.post(`/api/leads/${leadId}/schedule`, {
        callDate,
        callType: "Cold Call",
      });
      alert("Call scheduled!");
    } catch (err) {
      console.error("Schedule error:", err?.response?.data);
      alert(err?.response?.data?.error || "Failed to schedule call.");
    }
  };

  return (
    <Layout>
      <div className={styles.container}>
        {/* 🔍 Fixed Search Bar just like Schedule page */}
        <div className={styles.searchBarContainer}>
          <SearchFilter
            searchTerm={searchTerm}
            onSearch={setSearchTerm}
            filterOption={filterOption}
            onFilterChange={setFilterOption}
            pageType="lead"
          />
        </div>

        {/* 📋 Main Lead List */}
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
                onSchedule={handleScheduleCall}
              />
            ))}
        </section>
      </div>
    </Layout>
  );
};

export default Leads;
