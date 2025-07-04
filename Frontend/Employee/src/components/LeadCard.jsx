import React, { useState } from "react";
import styles from "../styles/LeadCard.module.css";

const LeadCard = ({ lead, onStatusChange, onTypeChange }) => {
  const [showTypeOptions, setShowTypeOptions] = useState(false);

  const getRingColor = () => {
    if (lead.status === "Closed") return "#c4c4c4";
    if (lead.type === "Hot") return "#ff4d4f";
    if (lead.type === "Warm") return "#fbbf24";
    if (lead.type === "Cold") return "#22d3ee";
    return "#d1d5db";
  };

  return (
    <div className={styles.card}>
      <div className={styles.leftBar} style={{ backgroundColor: getRingColor() }} />

      <div className={styles.content}>
        <h4 className={styles.name}>{lead.name}</h4>
        <p className={styles.email}>@{lead.email || "no-email"}</p>

        <div className={styles.date}>
          <img
            src="/image/calendar.png"
            alt="calendar"
            style={{ width: 16, height: 16, marginRight: 6 }}
          />
          <span>
            {new Date(lead.receivedDate).toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "long",
              year: "numeric",
            })}
          </span>
        </div>
      </div>

      <div className={styles.right}>
        <div
          className={`${styles.typeCircle} ${
            lead.status === "Closed"
              ? styles.closed
              : lead.type === "Hot"
              ? styles.hot
              : lead.type === "Warm"
              ? styles.warm
              : styles.cold
          }`}
        >
          {lead.status}
        </div>

        <div className={styles.icons}>
          <button
            className={styles.iconBtn}
            onClick={() => setShowTypeOptions(!showTypeOptions)}
          >
            <img src="/image/pencil.png" alt="edit" width={16} height={16} />
          </button>

          <button className={styles.iconBtn}>
            <img src="/image/phone.png" alt="call" width={16} height={16} />
          </button>
        </div>

        {showTypeOptions && lead.status !== "Closed" && (
          <div className={styles.typeDropdown}>
            {["Hot", "Warm", "Cold"].map((t) => (
              <div
                key={t}
                className={`${styles.typeOption} ${
                  t === "Hot"
                    ? styles.hotOption
                    : t === "Warm"
                    ? styles.warmOption
                    : styles.coldOption
                }`}
                onClick={() => {
                  onTypeChange(lead._id, t);
                  setShowTypeOptions(false);
                }}
              >
                {t}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LeadCard;
