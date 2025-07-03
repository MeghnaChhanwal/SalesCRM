import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import SearchFilter from "../components/SearchFilter";
import LeadCard from "../components/LeadCard";
import API from "../utils/axios";
import styles from "../styles/Leads.module.css";

const Schedule = () => {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("Today");
  const [scheduledLeads, setScheduledLeads] = useState([]);

  const fetchSchedules = async () => {
    try {
      const res = await API.get("/api/schedules", {
        params: { search, filter },
      });
      setScheduledLeads(res.data || []);
    } catch (err) {
      console.error("Failed to fetch schedules:", err);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, [search, filter]);

  return (
    <Layout>
      <SearchFilter
        search={search}
        setSearch={setSearch}
        filter={filter}
        setFilter={setFilter}
        filterOptions={["Today", "All"]}
      />
      <div className={styles.list}>
        {scheduledLeads.map((lead) => (
          <LeadCard
            key={lead._id}
            lead={lead}
            onEdit={() => {}}
            onSchedule={() => {}}
            onStatusChange={() => {}}
          />
        ))}
      </div>
    </Layout>
  );
};

export default Schedule;
