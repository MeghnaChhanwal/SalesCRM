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
  const [modalOpen, setModalOpen] = useState(false);
  const [uploadStep, setUploadStep] = useState("select");
  const [loading, setLoading] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: "receivedDate", direction: "desc" });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [manualModalOpen, setManualModalOpen] = useState(false);
  const [manualForm, setManualForm] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    language: "",
  });

  const leadsPerPage = 6;

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
        const res = await API.post("/api/leads/upload", formData, {
          onUploadProgress: (e) => {
            setUploadProgress(Math.round((e.loaded * 100) / e.total));
          },
        });

        alert(
          `${res.data.message}\nUploaded: ${res.data.uploaded}\nInvalid Rows: ${res.data.invalidRows}`
        );

        setUploading(false);
        setUploadProgress(0);
        setFile(null);
        setModalOpen(false);
        setUploadStep("select");
        setCurrentPage(1);
        fetchLeads();
      } catch (err) {
        console.error("Upload error:", err);
        alert("Upload failed. Please try again.");
        setUploading(false);
      }
    });
  };

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const handleNext = () => {
    if (!file) return;
    setUploadStep("upload");
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    const requiredFields = ["name", "email", "phone", "location", "language"];
    const hasEmpty = requiredFields.some((f) => manualForm[f].trim() === "");
    if (hasEmpty) return alert("All fields are required.");

    if (!/^\d{10}$/.test(manualForm.phone)) {
      return alert("Phone number must be exactly 10 digits.");
    }

    try {
      await API.post("/api/leads", manualForm);
      alert("Lead added successfully");
      setManualModalOpen(false);
      setManualForm({ name: "", email: "", phone: "", location: "", language: "" });
      fetchLeads();
    } catch (err) {
      console.error("Manual entry error:", err);
      alert("Failed to add lead");
    }
  };

  return (
    <MainLayout
      onSearch={(val) => {
        setSearchTerm(val);
        setCurrentPage(1);
      }}
      rightElement={
        <div className={styles.actionButtons}>
          <button className={styles.addManual} onClick={() => setManualModalOpen(true)}>
            Add Manually
          </button>
          <button className={styles.addLeadButton} onClick={() => setModalOpen(true)}>
            Upload CSV
          </button>
        </div>
      }
    >
      {/* ==== Upload Modal ==== */}
      {modalOpen && (
        <div className={styles.uploadModal}>
          <div
            className={styles.uploadBox}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const droppedFile = e.dataTransfer.files[0];
              if (droppedFile && droppedFile.type === "text/csv") {
                setFile(droppedFile);
              } else {
                alert("Please upload a valid CSV file.");
              }
            }}
          >
            <div className={styles.uploadInner}>
              {uploadStep === "select" && (
                <>
                  <img src="/folder.png" alt="Upload" className={styles.folderIcon} />
                  <p>Drag your file(s) to start uploading</p>
                  <span>OR</span>
                  <label className={styles.browseButton}>
                    Browse files
                    <input
                      type="file"
                      accept=".csv"
                      hidden
                      onChange={(e) => {
                        const selected = e.target.files[0];
                        if (selected && selected.type === "text/csv") {
                          setFile(selected);
                        } else {
                          alert("Only CSV files are allowed.");
                        }
                      }}
                    />
                  </label>
                  <a href="/leadsample.csv" download className={styles.sampleDownload}>
                    📥 Download Sample File
                  </a>
                  {file && <div className={styles.dropzone}>📄 {file.name}</div>}
                </>
              )}

              {uploadStep === "upload" && file && (
                <div className={styles.dropzone}>📄 {file.name}</div>
              )}

              {uploadStep === "upload" && uploading && (
                <div className={styles.circularWrapper}>
                  <svg className={styles.circularProgress} viewBox="0 0 36 36">
                    <path className={styles.bg} d="M18 2.0845a15.9155 15.9155 0 1 1 0 31.831" />
                    <path
                      className={styles.progress}
                      strokeDasharray={`${uploadProgress}, 100`}
                      d="M18 2.0845a15.9155 15.9155 0 1 1 0 31.831"
                    />
                    <text x="18" y="20.35" className={styles.percentage}>
                      {uploadProgress}%
                    </text>
                  </svg>
                </div>
              )}
            </div>

            <div className={styles.buttonRow}>
              <button
                className={styles.cancelButton}
                onClick={() => {
                  setModalOpen(false);
                  setFile(null);
                  setUploadStep("select");
                }}
                disabled={uploading}
              >
                Cancel
              </button>
              {uploadStep === "select" ? (
                <button className={styles.nextButton} disabled={!file} onClick={handleNext}>
                  Next
                </button>
              ) : (
                <button
                  className={styles.nextButton}
                  onClick={handleFileUpload}
                  disabled={!file || uploading}
                >
                  Upload
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ==== Manual Add Modal ==== */}
      {manualModalOpen && (
        <div className={styles.modalOverlay}>
          <form className={styles.modalForm} onSubmit={handleManualSubmit}>
            <h3>Add Lead Manually</h3>
            <input
              type="text"
              placeholder="Full Name"
              value={manualForm.name}
              onChange={(e) => setManualForm({ ...manualForm, name: e.target.value })}
            />
            <input
              type="email"
              placeholder="Email"
              value={manualForm.email}
              onChange={(e) => setManualForm({ ...manualForm, email: e.target.value })}
            />
            <input
              type="tel"
              placeholder="Phone"
              value={manualForm.phone}
              onChange={(e) => setManualForm({ ...manualForm, phone: e.target.value })}
            />
            <select
              value={manualForm.location}
              onChange={(e) => setManualForm({ ...manualForm, location: e.target.value })}
            >
              <option value="">Select Location</option>
              <option value="Pune">Pune</option>
              <option value="Mumbai">Mumbai</option>
              <option value="Bangalore">Bangalore</option>
              <option value="Hyderabad">Hyderabad</option>
              <option value="Delhi">Delhi</option>
              <option value="Chennai">Chennai</option>
            </select>
            <select
              value={manualForm.language}
              onChange={(e) => setManualForm({ ...manualForm, language: e.target.value })}
            >
              <option value="">Select Language</option>
              <option value="English">English</option>
              <option value="Hindi">Hindi</option>
              <option value="Marathi">Marathi</option>
              <option value="Telugu">Telugu</option>
              <option value="Tamil">Tamil</option>
            </select>
            <div className={styles.formActions}>
              <button type="submit">Save</button>
              <button type="button" onClick={() => setManualModalOpen(false)}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ==== Lead Table ==== */}
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
                  <td colSpan="5" style={{ textAlign: "center" }}>
                    No leads found.
                  </td>
                </tr>
              ) : (
                leads.map((lead, index) => {
                  const [firstName = "", lastName = ""] = lead.name?.split(" ") || [];
                  return (
                    <tr key={`${lead._id}-${index}`}>
                      <td>
                        <ProfileLogo firstName={firstName} lastName={lastName} showEmail={false} />
                      </td>
                      <td>{lead.email || "-"}</td>
                      <td>{lead.phone || "-"}</td>
                      <td>
                        {lead.receivedDate
                          ? new Date(lead.receivedDate).toLocaleDateString()
                          : "-"}
                      </td>
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
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </>
      )}
    </MainLayout>
  );
};

export default Lead;
