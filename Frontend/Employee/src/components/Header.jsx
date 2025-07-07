
import React from "react";
import styles from "../styles/Header.module.css";
import { useAuth } from "../contexts/AuthContext";
import { useLocation, useNavigate } from "react-router-dom";


const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 18) return "Good Afternoon";
  return "Good Evening";
};

const Header = () => {
  const { employee } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const path = location.pathname;

  const isLogin = path === "/";
  const isHome = path === "/dashboard";


  const pageTitles = {
    "/profile": "Profile",
    "/schedule": "Schedule",
    "/leads": "Leads",
  };

 
  const pageName = Object.entries(pageTitles).find(([route]) =>
    path.startsWith(route)
  )?.[1];


  const handleBack = () => {
    if (path === "/profile") navigate("/schedule");
    else if (path === "/schedule") navigate("/leads");
    else if (path === "/leads") navigate("/dashboard");
    else navigate("/dashboard"); // fallback
  };

  return (
    <div className={styles.header}>
     
      <div className={styles.logo}>
        Canova<span className={styles.crm}>CRM</span>
      </div>

    
      {!isLogin && (
        <div className={styles.subHeader}>
          {isHome && employee && (
            <>
              <p className={styles.greeting}>{getGreeting()},</p>
              <h2 className={styles.name}>
                {employee.firstName} {employee.lastName}
              </h2>
            </>
          )}

          {!isHome && pageName && (
            <button className={styles.pageTitle} onClick={handleBack}>
              &gt; {pageName}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default Header;
