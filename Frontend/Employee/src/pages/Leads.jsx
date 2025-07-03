import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import SearchFilter from "../components/SearchFilter";
import LeadCard from "../components/LeadCard";
import styles from "../styles/Leads.module.css";
import API from "../utils/axios";
import { useAuth } from "../contexts/AuthContext";

const Leads = () => {
  const { employee } = useAuth();
  const [leads, setLeads] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterOption, setFilterOption] = useState(""); // "Ongoing", "Closed"
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeads();
  }, [searchTerm, filterOption]);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const res = await API.get("/api/leads", {
        params: {
          search: searchTerm,
          filter: filterOption,
        },
      });

      let data = res.data.leads;

      // Filter by employee
      if (employee?._id) {
        data = data.filter(
          (lead) => lead.assignedEmployee?._id === employee._id
        );
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
      await API.patch(`/api/leads/${leadId}/status`, { status: newStatus });
      fetchLeads();
    } catch (err) {
      alert(err?.response?.data?.error || "Failed to update status.");
    }
  };

  const handleTypeChange = async (leadId, newType) => {
    try {
      await API.patch(`/api/leads/${leadId}/type`, { type: newType });
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
          filterOption={filterOption}
          onFilterChange={setFilterOption}
          pageType="lead" // Enables "Ongoing" / "Closed"
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
