// src/components/LeadCard.jsx
import React from "react";
import styles from "../styles/LeadCard.module.css";

const LeadCard = ({ lead, onEdit, onSchedule, onStatusChange }) => {
  const badgeColor = {
    Hot: "#e74c3c",
    Warm: "#f39c12",
    Cold: "#3498db",
  }[lead.type] || "#bdc3c7";

  return (
    <div className={styles.card}>
      {/* Left: Lead Info */}
      <div>
        <h4 className={styles.name}>{lead.name}</h4>
        <p className={styles.email}>{lead.email}</p>
        <p className={styles.date}>
          {new Date(lead.receivedDate).toLocaleDateString("en-IN")}
        </p>
      </div>

      {/* Right: Status + Actions */}
      <div className={styles.right}>
        <span
          className={styles.typeBadge}
          style={{ backgroundColor: badgeColor }}
        >
          {lead.type}
        </span>

        <span
          className={
            lead.status === "Open" ? styles.statusOpen : styles.statusClosed
          }
        >
          {lead.status}
        </span>

        <div className={styles.actions}>
          <img
            src="/images/edit.png"
            alt="Edit Lead"
            role="button"
            tabIndex={0}
            onClick={() => onEdit(lead)}
          />
          <img
            src="/images/calendar.png"
            alt="Schedule Call"
            role="button"
            tabIndex={0}
            onClick={() => onSchedule(lead)}
          />
          <img
            src="/images/status.png"
            alt="Change Status"
            role="button"
            tabIndex={0}
            onClick={() => onStatusChange(lead)}
          />
        </div>
      </div>
    </div>
  );
};

export default LeadCard;
