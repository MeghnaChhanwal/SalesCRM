import React from "react";
import { NavLink } from "react-router-dom";
import styles from "../styles/BottomNav.module.css";

const navItems = [
  { path: "/dashboard", label: "Home", icon: "/images/home.png" },
  { path: "/leads", label: "Leads", icon: "/images/lead.png" },
  { path: "/schedule", label: "Schedule", icon: "/images/schedule.png" },
  { path: "/profile", label: "Profile", icon: "/images/profile.png" },
];

const BottomNav = () => {
  return (
    <nav className={styles.navbar}>
      {navItems.map(({ path, label, icon }) => (
        <NavLink
          key={path}
          to={path}
          className={({ isActive }) =>
            `${styles.navItem} ${isActive ? styles.active : ""}`
          }
        >
          <img src={icon} alt={`${label} icon`} className={styles.icon} />
          <span className={styles.label}>{label}</span>
        </NavLink>
      ))}
    </nav>
  );
};

export default BottomNav;
