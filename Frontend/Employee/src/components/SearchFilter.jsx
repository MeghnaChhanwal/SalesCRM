import React from "react";
import styles from "../styles/SearchFilter.module.css";

const SearchFilter = ({ search, setSearch, filter, setFilter, filterOptions }) => {
  return (
    <div className={styles.container}>
      <div className={styles.searchWrapper}>
        <img src="/images/search.png" alt="Search" className={styles.searchIcon} />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search leads..."
          className={styles.searchInput}
        />
      </div>
      <div className={styles.filterWrapper}>
        <img src="/images/filter.png" alt="Filter" className={styles.filterIcon} />
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className={styles.select}
        >
          {filterOptions.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default SearchFilter;
