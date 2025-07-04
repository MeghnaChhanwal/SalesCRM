import React, { useState } from "react";
import styles from "../styles/LeadCard.module.css";

const LeadCard = ({ lead, onStatusChange, onTypeChange, onScheduleChange }) => {
  const [showTypeOptions, setShowTypeOptions] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);

  const getRingColor = () => {
    if (lead.status === "Closed") return "#c4c4c4";
    if (lead.type === "Hot") return "#ff4d4f";
    if (lead.type === "Warm") return "#fbbf24";
    if (lead.type === "Cold") return "#22d3ee";
    return "#d1d5db";
  };

  const handleDateChange = (e) => {
    const selectedDate = e.target.value;
    onScheduleChange(lead._id, selectedDate);
    setShowCalendar(false);
  };

  return (
    <div className={styles.card}>
      {/* Colored side bar */}
      <div className={styles.leftBar} style={{ backgroundColor: getRingColor() }} />

      {/* Main content */}
      <div className={styles.content}>
        <h4 className={styles.name}>
          <img
            src={`/logos/${lead.name}.png`}
            alt="logo"
            className={styles.logo}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "/image/default-logo.png";
            }}
          />
          {lead.name}
        </h4>

        <p className={styles.email}>@{lead.email || "no-email"}</p>

        <div className={styles.dateRow}>
          <img
            src="/image/calendar.png"
            alt="Calendar"
            className={styles.icon}
            onClick={() => setShowCalendar(!showCalendar)}
          />
          <span className={styles.date}>
            {new Date(lead.receivedDate).toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "long",
              year: "numeric",
            })}
          </span>
        </div>

        {showCalendar && (
          <input
            type="date"
            className={styles.dateInput}
            onChange={handleDateChange}
            defaultValue={lead.scheduleDate?.slice(0, 10)}
          />
        )}
      </div>

      {/* Actions: Status ring, type edit, phone call */}
      <div className={styles.actions}>
        <div className={styles.statusRing} style={{ borderColor: getRingColor() }}>
          <span className={styles.statusText}>{lead.status}</span>
        </div>

        <button onClick={() => setShowTypeOptions(!showTypeOptions)}>
          <img src="/image/pencil.png" alt="Edit" className={styles.icon} />
        </button>

        <button>
          <img src="/image/phone.png" alt="Call" className={styles.icon} />
        </button>

        {showTypeOptions && lead.status !== "Closed" && (
          <div className={styles.typeDropdown}>
            {["Hot", "Warm", "Cold"].map((t) => (
              <button
                key={t}
                onClick={() => {
                  onTypeChange(lead._id, t);
                  setShowTypeOptions(false);
                }}
                className={styles.typeBtn}
              >
                {t}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LeadCard;
