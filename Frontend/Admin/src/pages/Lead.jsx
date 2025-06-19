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

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/leads/batches`);
      setLeads(res.data);
    } catch (err) {
      console.error('Error fetching leads:', err);
    }
  };

  const handleFileUpload = async () => {
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);

    try {
      setUploading(true);
      await axios.post(`${API_BASE}/api/leads/upload`, formData, {
        onUploadProgress: (e) => {
          setUploadProgress(Math.round((e.loaded * 100) / e.total));
        },
      });
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

  const filteredLeads = leads.filter((lead) =>
    lead.name.toLowerCase().includes(searchTerm.toLowerCase())
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
      {/* Modal */}
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

      {/* Table */}
      <table className={styles.leadTable}>
        <thead>
          <tr>
            <th>No.</th>
            <th>Name</th>
            <th>Date</th>
            <th>No. of Leads</th>
            <th>Assigned</th>
            <th>Unassigned</th>
            <th>Closed</th>
          </tr>
        </thead>
        <tbody>
          {filteredLeads.map((lead, index) => (
            <tr key={index}>
              <td>{index + 1}</td>
              <td>{lead.name}</td>
              <td>{new Date(lead.date).toLocaleDateString()}</td>
              <td>{lead.total}</td>
              <td>{lead.assigned}</td>
              <td>{lead.unassigned}</td>
              <td>{lead.closed}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </MainLayout>
  );
};

export default Lead;
