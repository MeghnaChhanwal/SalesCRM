// src/pages/Leads.jsx
import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import SearchFilter from "../components/SearchFilter";
import LeadCard from "../components/LeadCard";
import styles from "../styles/Leads.module.css";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";

const API_BASE = import.meta.env.VITE_API_BASE;

const Leads = () => {
  const { employee } = useAuth(); // Ensure lowercase variable
  const [leads, setLeads] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState(""); // "Open" or "Closed"
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeads();
  }, [searchTerm, statusFilter]);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/api/leads`, {
        params: {
          search: searchTerm,
          filter: statusFilter,
        },
      });

      // If employee-specific view is required
      let data = res.data.leads;
      if (employee?._id) {
        data = data.filter((lead) => lead.assignedEmployee?._id === employee._id);
      }

      setLeads(data);
    } catch (err) {
      console.error("Failed to fetch leads:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (leadId, newStatus) => {
    try {
      await axios.put(`${API_BASE}/api/leads/${leadId}`, { status: newStatus });
      fetchLeads();
    } catch (err) {
      alert(err?.response?.data?.error || "Failed to update status.");
      console.error("Status update failed:", err);
    }
  };

  const handleTypeChange = async (leadId, newType) => {
    try {
      await axios.put(`${API_BASE}/api/leads/${leadId}`, { type: newType });
      fetchLeads();
    } catch (err) {
      console.error("Type update failed:", err);
    }
  };

  return (
    <Layout>
      <div className={styles.container}>
        <SearchFilter
          searchTerm={searchTerm}
          onSearch={setSearchTerm}
          statusFilter={statusFilter}
          onStatusFilter={setStatusFilter}
          options={["", "Open", "Closed"]}
        />

        {loading ? (
          <p className={styles.message}>Loading leads...</p>
        ) : leads.length === 0 ? (
          <p className={styles.message}>No leads found.</p>
        ) : (
          <div className={styles.cardList}>
            {leads.map((lead) => (
              <LeadCard
                key={lead._id}
                lead={lead}
                onStatusChange={handleStatusChange}
                onTypeChange={handleTypeChange}
              />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Leads;
