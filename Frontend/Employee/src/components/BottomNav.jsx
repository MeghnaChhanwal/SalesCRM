// src/components/BottomNav.jsx
import React from "react";
import { NavLink } from "react-router-dom";
import styles from "../styles/BottomNav.module.css";

import homeIcon from "../assets/home.png";
import leadsIcon from "../assets/lead.png";
import scheduleIcon from "../assets/schedule.png";
import profileIcon from "../assets/profile.png";

const BottomNav = () => {
  const navItems = [
    { path: "/dashboard", label: "Home",     icon: homeIcon },
    { path: "/leads",     label: "Leads",    icon: leadsIcon },
    { path: "/schedule",  label: "Schedule", icon: scheduleIcon },
    { path: "/profile",   label: "Profile",  icon: profileIcon },
  ];

  return (
    <div className={styles.navbar}>
      {navItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) =>
            `${styles.navItem} ${isActive ? styles.active : ""}`
          }
        >
          <img src={item.icon} alt={item.label} className={styles.icon} />
          <span>{item.label}</span>
        </NavLink>
      ))}
    </div>
  );
};

export default BottomNav;
