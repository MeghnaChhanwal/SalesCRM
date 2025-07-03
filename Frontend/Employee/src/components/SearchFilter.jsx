import React from "react";
import styles from "../styles/SearchFilter.module.css";
import filterIcon from "../assets/filter.png";

const SearchFilter = ({ search, setSearch, filter, setFilter, filterOptions }) => {
  return (
    <div className={styles.container}>
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search leads..."
        className={styles.searchInput}
      />
      <div className={styles.filterWrapper}>
        <img src={filterIcon} alt="Filter" className={styles.filterIcon} />
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className={styles.select}
        >
          {filterOptions.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default SearchFilter;
