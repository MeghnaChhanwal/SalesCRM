import React, { useState, useRef, useEffect } from "react";
import styles from "../styles/LeadCard.module.css";

const LeadCard = ({ lead, onTypeChange, onSchedule, onStatusChange }) => {
  const [showTypePopup, setShowTypePopup] = useState(false);
  const [showSchedulePopup, setShowSchedulePopup] = useState(false);
  const [showStatusPopup, setShowStatusPopup] = useState(false);
  const [scheduleData, setScheduleData] = useState({ date: "", time: "" });

  const typeRef = useRef();
  const scheduleRef = useRef();
  const statusRef = useRef();

  // Close popups on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        (!typeRef.current || !typeRef.current.contains(e.target)) &&
        (!scheduleRef.current || !scheduleRef.current.contains(e.target)) &&
        (!statusRef.current || !statusRef.current.contains(e.target))
      ) {
        setShowTypePopup(false);
        setShowSchedulePopup(false);
        setShowStatusPopup(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getColor = () => {
    if (lead.type === "Hot") return "#ff4d4f";
    if (lead.type === "Warm") return "#fbbf24";
    if (lead.type === "Cold") return "#22d3ee";
    return "#ccc";
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
      <div className={styles.leftBar} style={{ backgroundColor: getColor() }} />

      <div className={styles.mainContent}>
        <div className={styles.topRow}>
          <div className={styles.nameEmail}>
            <h4 className={styles.name}>{lead.name}</h4>
            <p className={styles.email}>{lead.email}</p>
          </div>
          <div className={styles.statusCircle} style={{ borderColor: getColor() }}>
            {lead.status}
          </div>
        </div>

        <p className={styles.label}>date</p>
        <div className={styles.dateAndIconsRow}>
          <div className={styles.dateRow}>
            <img src="/images/schedule.png" alt="schedule" />
            <span>
              {new Date(lead.receivedDate).toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
            </span>
          </div>

          <div className={styles.actionsRowRight}>
            <img
              src="/images/type.png"
              alt="Edit Type"
              onClick={() => {
                setShowTypePopup(!showTypePopup);
                setShowSchedulePopup(false);
                setShowStatusPopup(false);
              }}
            />
            <img
              src="/images/calendar.png"
              alt="Schedule"
              onClick={() => {
                setShowSchedulePopup(!showSchedulePopup);
                setShowTypePopup(false);
                setShowStatusPopup(false);
              }}
            />
            <img
              src="/images/status.png"
              alt="Status"
              onClick={() => {
                setShowStatusPopup(!showStatusPopup);
                setShowTypePopup(false);
                setShowSchedulePopup(false);
              }}
            />
          </div>
        </div>

        {/* Type Popup */}
        {showTypePopup && (
          <div className={styles.popup} ref={typeRef}>
            {["Hot", "Warm", "Cold"].map((type) => (
              <div
                key={type}
                className={`${styles.option} ${styles[type.toLowerCase()]}`}
                onClick={() => {
                  onTypeChange(lead._id, type);
                  setShowTypePopup(false);
                }}
              >
                {type}
              </div>
            ))}
          </div>
        )}

        {/* Schedule Popup */}
        {showSchedulePopup && (
          <div className={styles.popup} ref={scheduleRef}>
            <label>Date</label>
            <input
              type="date"
              value={scheduleData.date}
              onChange={(e) => setScheduleData({ ...scheduleData, date: e.target.value })}
            />
            <label>Time</label>
            <input
              type="time"
              value={scheduleData.time}
              onChange={(e) => setScheduleData({ ...scheduleData, time: e.target.value })}
            />
            <button onClick={handleScheduleSave}>Save</button>
          </div>
        )}

        {/* Status Popup */}
        {showStatusPopup && (
          <div className={styles.popup} ref={statusRef}>
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
