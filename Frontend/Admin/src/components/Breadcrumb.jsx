import React from "react";
import { Link, useLocation } from "react-router-dom";
import styles from "../styles/Breadcrumb.module.css";

const Breadcrumb = () => {
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter((x) => x);

  return (
    <div className={styles.breadcrumb}>
      <Link to="/">Home</Link>

      {pathnames.length === 0 ? (
        <span> &gt; Dashboard</span> // ✅ Special case for "/"
      ) : (
        pathnames.map((name, index) => {
          const routeTo = "/" + pathnames.slice(0, index + 1).join("/");
          const displayName = name.charAt(0).toUpperCase() + name.slice(1);
          return (
            <span key={routeTo}>
              {" "} &gt;{" "}
              <Link to={routeTo}>{displayName}</Link>
            </span>
          );
        })
      )}
    </div>
  );
};

export default Breadcrumb;
