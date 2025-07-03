// src/pages/Home.jsx
import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import API from "../utils/axios";
import Layout from "../components/Layout";

const Home = () => {
  const { employee } = useAuth();
  const [timing, setTiming] = useState(null);
  const [breaks, setBreaks] = useState([]);

  const fetchTiming = async () => {
    try {
      const res = await API.get(`/api/timing/${employee._id}`);
      const today = res.data?.[0];
      setTiming(today);
    } catch (err) {
      console.error("Fetch timing error:", err);
    }
  };

  const fetchBreaks = async () => {
    try {
      const res = await API.get(`/api/timing/breaks/${employee._id}`);
      setBreaks(res.data);
    } catch (err) {
      console.error("Fetch break history error:", err);
    }
  };

  useEffect(() => {
    if (employee) {
      fetchTiming();
      fetchBreaks();
    }
  }, [employee]);

  return (
    <Layout>
      <div className="homeContainer">
        <h2>Good Morning, {employee?.firstName}</h2>

        <div className="timingBox">
          <div className="checkIn">
            <strong>Checked-In</strong> <span>{timing?.checkIn || "--:--"}</span>
          </div>
          <div className="checkOut">
            <strong>Check-Out</strong> <span>{timing?.checkOut || "--:--"}</span>
          </div>
        </div>

        {timing?.breaks && timing.breaks.length > 0 && (
          <div className="breakSection">
            <h4>Break History</h4>
            {timing.breaks
              .filter((b) => b.start && b.end)
              .map((brk, i) => (
                <div key={i} className="breakItem">
                  <p><strong>Break:</strong> {brk.start}</p>
                  <p><strong>Ended:</strong> {brk.end}</p>
                </div>
              ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Home;
