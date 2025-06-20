import React, { useEffect, useState } from 'react';
import axios from 'axios';
import MainLayout from '../components/Layout';
import styles from '../styles/Lead.module.css';

const API_BASE = import.meta.env.VITE_API_BASE;

const Lead = () => {
  const [leads, setLeads] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [file, setFile] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Load leads on component mount
  useEffect(() => {
    fetchLeads();
  }, []);

  // Fetch all leads from backend
  const fetchLeads = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/api/leads`);
      console.log("Fetched leads:", res.data); // Debugging
      setLeads(res.data);
    } catch (err) {
      console.error('Error fetching leads:', err);
    } finally {
      setLoading(false);
    }
  };

  // Upload CSV to backend
  const handleFileUpload = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      setUploading(true);
      await axios.post(`${API_BASE}/api/leads/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (e) => {
          setUploadProgress(Math.round((e.loaded * 100) / e.total));
        }
      });

      // Reset state and reload leads
      setUploading(false);
      setUploadProgress(0);
      setFile(null);
      setModalOpen(false);
      fetchLeads();
    } catch (err) {
      console.error('Upload error:', err);
      setUploading(false);
    }
  };

  // Filter leads based on search term
  const filteredLeads = leads.filter((lead) =>
    lead.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <MainLayout
      onSearch={(val) => setSearchTerm(val)}
      rightElement={
        <button className={styles.addLeadButton} onClick={() => setModalOpen(true)}>
          ➕ Add Lead
        </button>
      }
    >
      {/* Upload Modal */}
      {modalOpen && (
        <div className={styles.modalOverlay}>
          <form
            className={styles.modalForm}
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

              <input
                type="file"
                accept=".csv"
                hidden
                id="fileInput"
                onChange={(e) => setFile(e.target.files[0])}
              />

              <label htmlFor="fileInput" className={styles.browseButton}>
                Browse File
              </label>
            </div>

            {uploading && <progress value={uploadProgress} max="100" />}

            <div className={styles.formActions}>
              <button type="submit" disabled={uploading || !file}>
                Upload
              </button>
              <button
                type="button"
                onClick={() => {
                  setFile(null);
                  setModalOpen(false);
                }}
                disabled={uploading}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Table Section */}
      {loading ? (
        <p className={styles.loadingText}>Loading leads...</p>
      ) : (
        <table className={styles.leadTable}>
          <thead>
            <tr>
              <th>No.</th>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Received Date</th>
              <th>Status</th>
              <th>Type</th>
              <th>Language</th>
              <th>Location</th>
              <th>Assigned Employee</th>
            </tr>
          </thead>
          <tbody>
            {filteredLeads.length === 0 ? (
              <tr>
                <td colSpan="10" style={{ textAlign: 'center' }}>
                  No leads found.
                </td>
              </tr>
            ) : (
              filteredLeads.map((lead, index) => (
                <tr key={lead._id || index}>
                  <td>{index + 1}</td>
                  <td>{lead.name}</td>
                  <td>{lead.email || '-'}</td>
                  <td>{lead.phone || '-'}</td>
                  <td>{lead.receivedDate ? new Date(lead.receivedDate).toLocaleDateString() : '-'}</td>
                  <td>{lead.status || 'Open'}</td>
                  <td>{lead.type || 'Warm'}</td>
                  <td>{lead.language || '-'}</td>
                  <td>{lead.location || '-'}</td>
                  <td>{lead.assignedEmployee || '-'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </MainLayout>
  );
};

export default Lead;
