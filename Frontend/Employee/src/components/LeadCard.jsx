import React, { useState } from "react";
import styles from "../styles/LeadCard.module.css";

const LeadCard = ({ lead, onTypeChange, onStatusChange, onSchedule }) => {
  const [showTypePopup, setShowTypePopup] = useState(false);
  const [showStatusPopup, setShowStatusPopup] = useState(false);
  const [callDate, setCallDate] = useState("");

  const handleTypeSelect = (newType) => {
    setShowTypePopup(false);
    if (newType !== lead.type) {
      onTypeChange(lead._id, newType);
    }
  };

  const handleStatusSelect = (newStatus) => {
    setShowStatusPopup(false);
    if (newStatus !== lead.status) {
      onStatusChange(lead._id, newStatus);
    }
  };

  const handleSchedule = () => {
    if (!callDate) return alert("Select date and time.");
    onSchedule(lead._id, callDate);
    setCallDate("");
  };

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h3>{lead.name}</h3>
        <span className={styles.status}>{lead.status}</span>
      </div>

      <p>
        <strong>Phone:</strong> {lead.phone || "N/A"}
      </p>
      <p>
        <strong>Email:</strong> {lead.email || "N/A"}
      </p>
      <p>
        <strong>Location:</strong> {lead.location}
      </p>
      <p>
        <strong>Language:</strong> {lead.language}
      </p>
      <p>
        <strong>Type:</strong>{" "}
        <span onClick={() => setShowTypePopup(!showTypePopup)} className={styles.clickable}>
          {lead.type}
        </span>
        {showTypePopup && (
          <div className={styles.popup}>
            {["Hot", "Warm", "Cold"].map((type) => (
              <div key={type} onClick={() => handleTypeSelect(type)}>
                {type}
              </div>
            ))}
          </div>
        )}
      </p>

      <p>
        <strong>Status:</strong>{" "}
        <span onClick={() => setShowStatusPopup(!showStatusPopup)} className={styles.clickable}>
          {lead.status}
        </span>
        {showStatusPopup && (
          <div className={styles.popup}>
            {["Ongoing", "Closed"].map((status) => (
              <div key={status} onClick={() => handleStatusSelect(status)}>
                {status}
              </div>
            ))}
          </div>
        )}
      </p>

      {lead.status !== "Closed" && (
        <>
          <div className={styles.scheduleBox}>
            <input
              type="datetime-local"
              value={callDate}
              onChange={(e) => setCallDate(e.target.value)}
            />
            <button onClick={handleSchedule} className={styles.scheduleBtn}>
              Schedule Call
            </button>
          </div>

          {lead.scheduledCalls?.length > 0 && (
            <div className={styles.scheduledList}>
              <h4>Scheduled Calls</h4>
              {lead.scheduledCalls.map((call, index) => (
                <div key={index} className={styles.callItem}>
                  <p>
                    <strong>Date:</strong> {new Date(call.callDate).toLocaleString()}
                  </p>
                  <p>
                    <strong>Type:</strong> {call.callType}
                  </p>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default LeadCard;
