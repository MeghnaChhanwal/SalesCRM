// src/components/PageLayout.jsx
import React from "react";
import Header from "./Header";
import BottomNav from "./BottomNav";
import styles from "../styles/Layout.module.css";



const PageLayout = ({ children, showBottomNav = true, showHeader = true }) => {
  return (
    <div className={styles.pageWrapper}>
      {showHeader && <Header />}
      <div className={styles.content}>{children}</div>
      {showBottomNav && <BottomNav />}
    </div>
  );
};

export default PageLayout;