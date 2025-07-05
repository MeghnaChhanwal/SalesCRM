import React, { useEffect, useState } from "react";
import MainLayout from "../components/Layout";
import Pagination from "../components/Pagination";
import API from "../utils/axios";
import Papa from "papaparse";
import styles from "../styles/Lead.module.css";
import ProfileLogo from "../components/ProfileLogo";

const Lead = () => {
  const [leads, setLeads] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [file, setFile] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [modalType, setModalType] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    language: "",
  });
  const [loading, setLoading] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: "receivedDate", direction: "desc" });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const leadsPerPage = 7;

  useEffect(() => {
    fetchLeads();
  }, [searchTerm, sortConfig, currentPage]);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const res = await API.get("/api/leads", {
        params: {
          search: searchTerm,
          page: currentPage,
          limit: leadsPerPage,
          sortBy: sortConfig.key,
          order: sortConfig.direction,
        },
      });
      setLeads(res.data.leads || []);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      console.error("Error fetching leads:", err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Improved CSV validation logic
  const verifyCSV = (file, callback) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const required = ["name", "email", "phone", "language", "location"];

        const cleanedRows = results.data.map((row) => {
          const cleanedRow = {};
          required.forEach((field) => {
            cleanedRow[field] = row[field]?.trim() || "";
          });
          return cleanedRow;
        });

        const invalidRows = cleanedRows.filter((row) =>
          required.some((field) => row[field] === "")
        );

        callback(invalidRows.length === 0, invalidRows.length);
      },
      error: (err) => {
        console.error("CSV Parse Error:", err);
        callback(false, 0);
      },
    });
  };

  const handleFileUpload = async () => {
    if (!file) return;
    verifyCSV(file, async (isValid, count) => {
      if (!isValid) {
        alert(`${count} invalid rows found. Fix the file and try again.`);
        return;
      }

      const formData = new FormData();
      formData.append("file", file);

      try {
        setUploading(true);
        const response = await API.post("/api/leads/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
          onUploadProgress: (e) => {
            setUploadProgress(Math.round((e.loaded * 100) / e.total));
          },
        });

        alert(response.data.message || "File uploaded successfully");
        setUploading(false);
        setUploadProgress(0);
        setFile(null);
        setModalType(null);
        fetchLeads();
      } catch (err) {
        console.error("Upload error:", err);
        alert("Upload failed. Please try again.");
        setUploading(false);
      }
    });
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post("/api/leads", formData);
      alert("Lead added successfully");
      setModalType(null);
      setFormData({ name: "", email: "", phone: "", location: "", language: "" });
      fetchLeads();
    } catch (err) {
      console.error("Manual entry error:", err);
      alert("Failed to add lead");
    }
  };

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  return (
    <MainLayout
      onSearch={(val) => {
        setSearchTerm(val);
        setCurrentPage(1);
      }}
      rightElement={
        <div className={styles.actionButtons}>
          <button className={styles.addManual} onClick={() => setModalType("manual")}>
            Add Manually
          </button>
          <button className={styles.addLeadButton} onClick={() => setModalType("upload")}>
            Upload CSV
          </button>
        </div>
      }
    >
      {/* Upload Modal */}
      {modalType === "upload" && (
        <div className={styles.modalOverlay} onClick={() => setModalType(null)}>
          <form
            className={styles.modalForm}
            onClick={(e) => e.stopPropagation()}
            onSubmit={(e) => {
              e.preventDefault();
              handleFileUpload();
            }}
          >
            <h3>Upload Lead CSV</h3>
            <div
              className={styles.dropzone}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                setFile(e.dataTransfer.files[0]);
              }}
            >
              {file ? <p>{file.name}</p> : <p>Drag & drop or click to browse</p>}
              <input type="file" accept=".csv" hidden id="fileInput" onChange={(e) => setFile(e.target.files[0])} />
              <label htmlFor="fileInput" className={styles.browseButton}>
                Browse File
              </label>
            </div>

            {uploading && (
              <div className={styles.circularWrapper}>
                <svg className={styles.circularProgress} viewBox="0 0 36 36">
                  <path className={styles.bg} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  <path
                    className={styles.progress}
                    strokeDasharray={`${uploadProgress}, 100`}
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <text x="18" y="20.35" className={styles.percentage}>
                    {uploadProgress}%
                  </text>
                </svg>
              </div>
            )}

            <div className={styles.formActions}>
              <button type="submit" disabled={uploading || !file}>Upload</button>
              <button type="button" onClick={() => { setFile(null); setModalType(null); }} disabled={uploading}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Manual Add Modal */}
      {modalType === "manual" && (
        <div className={styles.modalOverlay} onClick={() => setModalType(null)}>
          <form className={styles.modalForm} onClick={(e) => e.stopPropagation()} onSubmit={handleManualSubmit}>
            <h3>Add Lead Manually</h3>
            <input name="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Full Name" required />
            <input name="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="Email" type="email" />
            <input name="phone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="Phone" />
            <select name="location" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} required>
              <option value="">Select Location</option>
              <option value="Pune">Pune</option>
              <option value="Mumbai">Mumbai</option>
              <option value="Bangalore">Bangalore</option>
              <option value="Hyderabad">Hyderabad</option>
              <option value="Delhi">Delhi</option>
              <option value="Chennai">Chennai</option>
            </select>
            <select name="language" value={formData.language} onChange={(e) => setFormData({ ...formData, language: e.target.value })} required>
              <option value="">Select Language</option>
              <option value="Hindi">Hindi</option>
              <option value="English">English</option>
              <option value="Telugu">Telugu</option>
              <option value="Marathi">Marathi</option>
              <option value="Kannada">Kannada</option>
              <option value="Tamil">Tamil</option>
            </select>
            <div className={styles.formActions}>
              <button type="submit">Save</button>
              <button type="button" onClick={() => setModalType(null)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Lead Table */}
      {loading ? (
        <p className={styles.loadingText}>Loading leads...</p>
      ) : (
        <>
          <table className={styles.leadTable}>
            <thead>
              <tr>
                <th onClick={() => handleSort("name")}>Name</th>
                <th onClick={() => handleSort("email")}>Email</th>
                <th onClick={() => handleSort("phone")}>Phone</th>
                <th onClick={() => handleSort("receivedDate")}>Received Date</th>
                <th onClick={() => handleSort("assignedEmployee")}>Assigned To</th>
              </tr>
            </thead>
            <tbody>
              {leads.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: "center" }}>No leads found.</td>
                </tr>
              ) : (
                leads.map((lead) => {
                  const [firstName = "", lastName = ""] = lead.name?.split(" ") || [];
                  return (
                    <tr key={lead._id}>
                      <td><ProfileLogo firstName={firstName} lastName={lastName} showEmail={false} /></td>
                      <td>{lead.email || "-"}</td>
                      <td>{lead.phone || "-"}</td>
                      <td>{lead.receivedDate ? new Date(lead.receivedDate).toLocaleDateString() : "-"}</td>
                      <td>
                        {lead.assignedEmployee
                          ? `${lead.assignedEmployee.firstName} ${lead.assignedEmployee.lastName}`
                          : "-"}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </>
      )}
    </MainLayout>
  );
};

export default Lead;
