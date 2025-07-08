import React, { useState, useRef, useEffect } from "react";
import styles from "../styles/LeadCard.module.css";

const LeadCard = ({
  lead,
  onTypeChange,
  onSchedule,
  onStatusChange,
  fromSchedulePage = false,
}) => {
  // === Declare ALL hooks at the very top, no conditions around them ===
  const [showTypePopup, setShowTypePopup] = useState(false);
  const [showSchedulePopup, setShowSchedulePopup] = useState(false);
  const [showStatusPopup, setShowStatusPopup] = useState(false);
  const [scheduleData, setScheduleData] = useState({
    date: "",
    time: "",
    callType: "Cold Call",
  });
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
    if (!showSchedulePopup || !scheduleIconRef.current) return;

    const rect = scheduleIconRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    setPopupDirection(spaceBelow < 260 && spaceAbove > 260 ? "up" : "down");
  }, [showSchedulePopup]);

  // === Now do early returns or conditional rendering safely ===
  if (!lead) return null;
  if (fromSchedulePage && lead.status === "Closed") return null;

  // Helper function for color based on lead type
  const getColor = () => {
    const type = lead?.type;
    if (type === "Hot") return "#ff4d4f";
    if (type === "Warm") return "#fbbf24";
    if (type === "Cold") return "#22d3ee";
    return "#ccc";
  };

  // Handle schedule save with validation
  const handleScheduleSave = () => {
    if (scheduleData.date && scheduleData.time) {
      const scheduledDateTime = new Date(
        `${scheduleData.date}T${scheduleData.time}`
      );
      const now = new Date();

      if (scheduledDateTime <= now) {
        alert("Please select a future date and time.");
        return;
      }

      const isoString = scheduledDateTime.toISOString();

      onSchedule(lead._id, isoString, scheduleData.callType);
      setShowSchedulePopup(false);
    }
  };

  const formattedDate = lead.receivedDate
    ? new Date(lead.receivedDate).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "No Date";

  return (
    <div className={styles.card}>
      <div className={styles.leftBar} style={{ backgroundColor: getColor() }} />

      <div className={styles.mainContent}>
        <div className={styles.topRow}>
          <div className={styles.nameEmail}>
            <h4 className={styles.name}>{lead.name || "Unnamed Lead"}</h4>
            <p className={styles.email}>{lead.email || "No Email"}</p>
          </div>
          <div className={styles.statusCircle} style={{ borderColor: getColor() }}>
            {lead.status || "No Status"}
          </div>
        </div>

        <p className={styles.label}>Date</p>
        <div className={styles.dateAndIconsRow}>
          <div className={styles.dateRow}>
            <img src="/images/schedule.png" alt="schedule" />
            <span>{formattedDate}</span>
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

            {lead.status !== "Closed" && (
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
            )}

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

            {showSchedulePopup && lead.status !== "Closed" && (
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

                <label>Call Type</label>
                <select
                  value={scheduleData.callType}
                  onChange={(e) =>
                    setScheduleData({ ...scheduleData, callType: e.target.value })
                  }
                >
                  <option value="Cold Call">Cold Call</option>
                  <option value="Follow-up">Follow-up</option>
                  <option value="Referral">Referral</option>
                </select>

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
