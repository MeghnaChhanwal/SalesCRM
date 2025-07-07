import React, { useEffect, useState } from "react";
import Header from "./Header";
import BottomNav from "./BottomNav";
import styles from "../styles/Layout.module.css";

const PageLayout = ({ children, showBottomNav = true, showHeader = true }) => {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return (
    <div className={styles.pageWrapper}>
      {!isOnline && (
        <div className={styles.networkBanner}>
          You're offline. Please check your internet connection.
        </div>
      )}
      {showHeader && <Header />}
      <div className={styles.content}>{children}</div>
      {showBottomNav && <BottomNav />}
    </div>
  );
};

export default PageLayout;
