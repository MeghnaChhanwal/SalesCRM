// src/components/LeadCard.jsx
import React, { useState } from "react";
import styles from "../styles/LeadCard.module.css";

const LeadCard = ({ lead, onStatusChange, onTypeChange }) => {
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [showDateTime, setShowDateTime] = useState(false);
  const [showStatus, setShowStatus] = useState(false);
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");

  const typeColor = {
    Hot: styles.hot,
    Warm: styles.warm,
    Cold: styles.cold,
  };

  const handleSchedule = () => {
    if (scheduleDate && scheduleTime) {
      alert(`Scheduled for ${scheduleDate} at ${scheduleTime}`);
    }
    setShowDateTime(false);
  };

  const handleClose = () => {
    if (lead.hasFutureCall) {
      alert("Lead cannot be closed due to upcoming call");
      return;
    }
    onStatusChange(lead._id, "Closed");
    setShowStatus(false);
  };

  return (
    <div className={`${styles.card} ${typeColor[lead.type] || ""}`}>
      <div className={styles.leftIndicator}></div>
      <div className={styles.details}>
        <div className={styles.header}>
          <h4>{lead.name}</h4>
          <span className={styles.statusCircle}>{lead.status}</span>
        </div>
        <p>@{lead.email}</p>
        <p>Date: {new Date(lead.receivedDate).toLocaleDateString()}</p>

        <div className={styles.actions}>
          <div className={styles.actionIcon} onClick={() => setShowTypeDropdown(!showTypeDropdown)}>
            <img src="/images/type-icon.png" alt="Type" />
            {showTypeDropdown && (
              <div className={styles.dropdown}>
                <div onClick={() => onTypeChange(lead._id, "Hot")}>Hot</div>
                <div onClick={() => onTypeChange(lead._id, "Warm")}>Warm</div>
                <div onClick={() => onTypeChange(lead._id, "Cold")}>Cold</div>
              </div>
            )}
          </div>

          <div className={styles.actionIcon} onClick={() => setShowDateTime(!showDateTime)}>
            <img src="/images/schedule-icon.png" alt="Schedule" />
            {showDateTime && (
              <div className={styles.datetimeBox}>
                <input
                  type="date"
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                />
                <input
                  type="time"
                  value={scheduleTime}
                  onChange={(e) => setScheduleTime(e.target.value)}
                />
                <button onClick={handleSchedule}>Save</button>
              </div>
            )}
          </div>

          <div className={styles.actionIcon} onClick={() => setShowStatus(!showStatus)}>
            <img src="/images/status-icon.png" alt="Status" />
            {showStatus && (
              <div className={styles.statusBox}>
                <button disabled={lead.hasFutureCall}>Ongoing</button>
                <button
                  onClick={handleClose}
                  disabled={lead.hasFutureCall}
                >
                  Close
                </button>
                {lead.hasFutureCall && <p>Lead cannot be closed</p>}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeadCard;
