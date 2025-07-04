import React, { useState } from "react";
import styles from "../styles/LeadCard.module.css";

const LeadCard = ({ lead, onTypeChange, onSchedule, onStatusChange }) => {
  const [showTypePopup, setShowTypePopup] = useState(false);
  const [showSchedulePopup, setShowSchedulePopup] = useState(false);
  const [showStatusPopup, setShowStatusPopup] = useState(false);
  const [scheduleData, setScheduleData] = useState({ date: "", time: "" });

  const getColor = () => {
    if (lead.type === "Hot") return "#ff4d4f";
    if (lead.type === "Warm") return "#fbbf24";
    if (lead.type === "Cold") return "#22d3ee";
    return "#fb923c"; // default
  };

  const handleScheduleSave = () => {
    if (scheduleData.date && scheduleData.time) {
      const isoString = new Date(`${scheduleData.date}T${scheduleData.time}`).toISOString();
      onSchedule(lead._id, isoString);
      setShowSchedulePopup(false);
    }
  };

  return (
    <div className={styles.card}>
      {/* Colored strip based on type */}
      <div className={styles.leftBar} style={{ backgroundColor: getColor() }}></div>

      {/* Lead Info */}
      <div className={styles.details}>
        <h4 className={styles.name}>{lead.name}</h4>
        <p className={styles.email}>@{lead.email}</p>
        <p className={styles.label}>date</p>
        <div className={styles.dateRow}>
          <img src="/image/calendar.png" alt="calendar" />
          <span>
            {new Date(lead.receivedDate).toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "long",
              year: "numeric",
            })}
          </span>
        </div>
      </div>

      {/* Status & Action Buttons */}
      <div className={styles.rightArea}>
        <div
          className={styles.statusCircle}
          style={{ borderColor: getColor() }}
        >
          {lead.status}
        </div>

        <div className={styles.actions}>
          <img
            src="/images/type.png"
            alt="Edit Type"
            onClick={() => setShowTypePopup(!showTypePopup)}
          />
          <img
            src="/images/schedule.png"
            alt="Schedule"
            onClick={() => setShowSchedulePopup(!showSchedulePopup)}
          />
          <img
            src="/images/status.png"
            alt="Status"
            onClick={() => setShowStatusPopup(!showStatusPopup)}
          />
        </div>

        {/* Type Popup */}
        {showTypePopup && (
          <div className={styles.popup}>
            {["Hot", "Warm", "Cold"].map((t) => (
              <div
                key={t}
                className={`${styles.option} ${styles[t.toLowerCase()]}`}
                onClick={() => {
                  onTypeChange(lead._id, t);
                  setShowTypePopup(false);
                }}
              >
                {t}
              </div>
            ))}
          </div>
        )}

        {/* Schedule Popup */}
        {showSchedulePopup && (
          <div className={styles.popup}>
            <label>Date</label>
            <input
              type="date"
              value={scheduleData.date}
              onChange={(e) =>
                setScheduleData({ ...scheduleData, date: e.target.value })
              }
            />
            <label>Time</label>
            <input
              type="time"
              value={scheduleData.time}
              onChange={(e) =>
                setScheduleData({ ...scheduleData, time: e.target.value })
              }
            />
            <button onClick={handleScheduleSave}>Save</button>
          </div>
        )}

        {/* Status Popup */}
        {showStatusPopup && (
          <div className={styles.popup}>
            {["Ongoing", "Closed"].map((status) => (
              <div
                key={status}
                className={styles.option}
                onClick={() => {
                  onStatusChange(lead._id, status);
                  setShowStatusPopup(false);
                }}
              >
                {status}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LeadCard;
