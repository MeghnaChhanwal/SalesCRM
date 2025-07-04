import React, { useState, useRef, useEffect } from "react";
import styles from "../styles/SearchFilter.module.css";

const SearchFilter = ({
  searchTerm,
  onSearch,
  filterOption,
  onFilterChange,
  pageType = "lead", // "lead" or "schedule"
}) => {
  const [showPopup, setShowPopup] = useState(false);
  const [tempOption, setTempOption] = useState(filterOption || "");
  const popupRef = useRef(null);

  const dropdownOptions =
    pageType === "schedule" ? ["Today", "All Day"] : ["Ongoing", "Closed"];

  const togglePopup = () => {
    setShowPopup(true);
    setTempOption(filterOption);
  };

  const handleSave = () => {
    onFilterChange(tempOption);
    setShowPopup(false);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (popupRef.current && !popupRef.current.contains(e.target)) {
        setShowPopup(false);
      }
    };

    if (showPopup) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showPopup]);

  return (
    <div className={styles.container}>
      {/* 🔍 Search Input */}
      <div className={styles.searchWrapper}>
        <img
          src="/images/search.png"
          alt="Search"
          className={styles.searchIcon}
        />
        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => onSearch(e.target.value)}
          className={styles.searchInput}
        />
      </div>

      {/* 🧰 Filter Dropdown */}
      <div className={styles.filterWrapper}>
        <div className={styles.filterCircle} onClick={togglePopup}>
          <img
            src="/images/filter.png"
            alt="Filter"
            className={styles.filterIcon}
          />
        </div>

        {/* 📋 Filter Popup */}
        {showPopup && (
          <div className={styles.popupCard} ref={popupRef}>
            <label className={styles.popupLabel}>Filter By</label>
            <select
              value={tempOption}
              onChange={(e) => setTempOption(e.target.value)}
              className={styles.popupSelect}
            >
              <option value="">Select</option>
              {dropdownOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
            <button className={styles.saveBtn} onClick={handleSave}>
              Save
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchFilter;
