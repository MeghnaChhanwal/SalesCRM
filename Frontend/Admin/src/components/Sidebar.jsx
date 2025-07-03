// components/Sidebar.jsx
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from '../styles/SideBar.module.css';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  const navItems = [
    { label: 'Dashboard', path: '/' },
    { label: 'Leads', path: '/leads' },
    { label: 'Employees', path: '/employees' },
    { label: 'Settings', path: '/settings' },
  ];

  return (
    <div className={styles.sidebar}>
      <div>
        <div className={styles.logo}>
          Canova<span className={styles.crm}>CRM</span>
        </div>

        <div className={styles.nav}>
          {navItems.map((item) => (
            <button
              key={item.label}
              className={`${styles.navItem} ${currentPath === item.path ? styles.active : ''}`}
              onClick={() => navigate(item.path)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      
    </div>
  );
};

export default Sidebar;
