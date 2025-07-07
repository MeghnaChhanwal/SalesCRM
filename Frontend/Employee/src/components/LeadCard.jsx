import React, { useState, useRef, useEffect } from "react";
import styles from "../styles/LeadCard.module.css";

const LeadCard = ({ lead, onTypeChange, onSchedule, onStatusChange }) => {
  const [showTypePopup, setShowTypePopup] = useState(false);
  const [showSchedulePopup, setShowSchedulePopup] = useState(false);
  const [showStatusPopup, setShowStatusPopup] = useState(false);
  const [scheduleData, setScheduleData] = useState({ date: "", time: "" });
  const [popupDirection, setPopupDirection] = useState("down");

  const typeRef = useRef();
  const scheduleRef = useRef();
  const statusRef = useRef();
  const scheduleIconRef = useRef();

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

  useEffect(() => {
    if (showSchedulePopup && scheduleIconRef.current) {
      const rect = scheduleIconRef.current.getBoundingClientRect();
      const availableBelow = window.innerHeight - rect.bottom;
      setPopupDirection(availableBelow < 200 ? "up" : "down");
    }
  }, [showSchedulePopup]);

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

        <p className={styles.label}>Date</p>
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

          <div className={styles.actionsWrapper}>
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
              ref={scheduleIconRef}
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

          {/* Popups must be relative to actionsWrapper */}
          <div className={styles.popupWrapper}>
            {showTypePopup && (
              <div className={`${styles.popup} ${styles.popupType}`} ref={typeRef}>
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

            {showSchedulePopup && (
              <div
                className={`${styles.popup} ${styles.popupSchedule} ${
                  popupDirection === "up" ? styles.popupUp : ""
                }`}
                ref={scheduleRef}
              >
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

            {showStatusPopup && (
              <div className={`${styles.popup} ${styles.popupStatus}`} ref={statusRef}>
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
      </div>
    </div>
  );
};

export default LeadCard;
