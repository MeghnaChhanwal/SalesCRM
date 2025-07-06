// src/components/Layout.jsx
import React from "react";
import Sidebar from "./Sidebar";
import Breadcrumb from "./Breadcrumb";
import SearchBar from "./Search";
import styles from "../styles/Layout.module.css";

const MainLayout = ({
  children,
  onSearch,
  showSearch = true,
  showBreadcrumb = true,
  rightElement = null,
}) => {
  return (
    <div className={styles.container}>
      <Sidebar />

      <div className={styles.mainContent}>
        {showSearch && <SearchBar onSearch={onSearch} />}

        {showBreadcrumb && (
          <div className={styles.headerRow}>
            <div className={styles.breadcrumbContainer}>
              <Breadcrumb />
            </div>
            <div className={styles.rightElementContainer}>
              {rightElement}
            </div>
          </div>
        )}

        <div className={styles.childrenContainer}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
