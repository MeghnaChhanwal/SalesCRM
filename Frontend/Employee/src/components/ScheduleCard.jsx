import React from "react";
import styles from "../styles/ScheduleCard.module.css";

const ScheduleCard = ({ lead }) => {
  const getInitials = (name) => {
    if (!name) return "";
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  };

  const formattedDate = new Date(lead.callDate).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  });

  return (
    <div className={styles.card}>
      <div className={styles.left}>
        <h4 className={styles.callType}>{lead.type || "Cold call"}</h4>
        <p className={styles.phone}>{lead.phone}</p>
        <div className={styles.callInfo}>
          <img src="/images/call.png" alt="Call" />
          <span>Call</span>
        </div>
        <div className={styles.avatar}>{getInitials(lead.name)}</div>
      </div>

      <div className={styles.right}>
        <p className={styles.date}>{formattedDate}</p>
      </div>
    </div>
  );
};

export default ScheduleCard;
