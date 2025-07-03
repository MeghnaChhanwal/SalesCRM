import React from "react";
import styles from "../styles/ProfileLogo.module.css";

const ProfileInfo = ({ firstName = "", lastName = "", email = "", showEmail = true }) => {
  return (
    <div className={styles.nameCell}>
      <div className={styles.profileCircle}>
        {firstName?.[0] || ""}{lastName?.[0] || ""}
      </div>
      <div>
        <div className={styles.empName}>
          {firstName} {lastName}
        </div>
        {showEmail && (
          <div className={styles.empEmail}>
            {email}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileInfo;
