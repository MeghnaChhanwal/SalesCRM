// src/components/SearchFilter.jsx
import React from "react";
import styles from "../styles/SearchFilter.module.css";

const SearchFilter = ({ searchTerm, onSearch, statusFilter, onStatusFilter, options = ["Open", "Closed"] }) => {
  return (
    <div className={styles.filterContainer}>
      <div className={styles.inputGroup}>
        <img src="/images/search.png" alt="Search" className={styles.icon} />
        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => onSearch(e.target.value)}
          className={styles.searchInput}
        />
      </div>

      <div className={styles.selectGroup}>
        <img src="/images/filter.png" alt="Filter" className={styles.icon} />
        <select
          value={statusFilter}
          onChange={(e) => onStatusFilter(e.target.value)}
          className={styles.filterSelect}
        >
          <option value="">All</option>
          {options.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default SearchFilter;
