import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import API from "../utils/axios";
import Layout from "../components/Layout";

const formatTime = (iso) => {
  if (!iso) return "--:--";
  const date = new Date(iso);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const Home = () => {
  const { employee } = useAuth();
  const [timing, setTiming] = useState(null);

  const fetchTiming = async () => {
    try {
      const res = await API.get(`/api/timing/${employee._id}`);
      const todayTiming = res.data?.[0];
      setTiming(todayTiming);
    } catch (err) {
      console.error("❌ Fetch timing error:", err);
    }
  };

  useEffect(() => {
    if (employee?._id) {
      fetchTiming();
    }
  }, [employee]);

  return (
    <Layout>
      <div className="homeContainer" style={{ padding: "1rem" }}>
        <h2>👋 Good {new Date().getHours() < 12 ? "Morning" : "Afternoon"}, {employee?.firstName}</h2>

        <div className="timingBox" style={{ marginTop: "1rem" }}>
          <p><strong>🕒 Check-In:</strong> {formatTime(timing?.checkIn)}</p>
          <p><strong>🏁 Check-Out:</strong> {formatTime(timing?.checkOut)}</p>
          <p><strong>📌 Status:</strong> {timing?.status || employee?.status}</p>
        </div>

        <div className="breakSection" style={{ marginTop: "2rem" }}>
          <h4>⏱ Break History</h4>
          {timing?.breaks?.length > 0 ? (
            timing.breaks.map((brk, index) => (
              <div key={index} className="breakItem" style={{ marginBottom: "0.5rem" }}>
                <p>🔁 Start: {formatTime(brk.start)}</p>
                <p>✅ End: {brk.end ? formatTime(brk.end) : "On Break"}</p>
              </div>
            ))
          ) : (
            <p>No breaks recorded yet.</p>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Home;
