import React, { useEffect, useState } from 'react';
import axios from 'axios';
import MainLayout from '../components/Layout';
import styles from '../styles/Lead.module.css';
import Pagination from '../components/Pagination';
import { sortData } from '../utils/sort';

const API_BASE = import.meta.env.VITE_API_BASE;

const Lead = () => {
  const [leads, setLeads] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [file, setFile] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: '', direction: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const leadsPerPage = 8;

  useEffect(() => {
    fetchLeads();
  }, []);

  useEffect(() => {
    setCurrentPage(1); // reset to first page on search or sort change
  }, [searchTerm, sortConfig]);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/api/leads`);
      setLeads(res.data);
    } catch (err) {
      console.error('Error fetching leads:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      setUploading(true);
      const response = await axios.post(`${API_BASE}/api/leads/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (e) => {
          setUploadProgress(Math.round((e.loaded * 100) / e.total));
        }
      });

      alert(response.data.message || 'File uploaded successfully');

      setUploading(false);
      setUploadProgress(0);
      setFile(null);
      setModalOpen(false);
      fetchLeads();
    } catch (err) {
      console.error('Upload error:', err);
      alert('❌ Upload failed. Please try again.');
      setUploading(false);
    }
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const indexOfLast = currentPage * leadsPerPage;
  const indexOfFirst = indexOfLast - leadsPerPage;

  const filteredLeads = leads.filter((lead) =>
    lead.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedLeads = sortData(filteredLeads, sortConfig);
  const currentLeads = sortedLeads.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredLeads.length / leadsPerPage);

  return (
    <MainLayout
      onSearch={(val) => setSearchTerm(val)}
      rightElement={
        <button className={styles.addLeadButton} onClick={() => setModalOpen(true)}>
          ➕ Add Lead
        </button>
      }
    >
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
              <label htmlFor="fileInput" className={styles.browseButton}>Browse File</label>
            </div>
            {uploading && <progress value={uploadProgress} max="100" />}
            <div className={styles.formActions}>
              <button type="submit" disabled={uploading || !file}>Upload</button>
              <button type="button" onClick={() => { setFile(null); setModalOpen(false); }} disabled={uploading}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <p className={styles.loadingText}>Loading leads...</p>
      ) : (
        <>
          <table className={styles.leadTable}>
            <thead>
              <tr>
                <th onClick={() => handleSort('name')} style={{ cursor: 'pointer' }}>Name</th>
                <th onClick={() => handleSort('email')} style={{ cursor: 'pointer' }}>Email</th>
                <th onClick={() => handleSort('phone')} style={{ cursor: 'pointer' }}>Phone</th>
                <th onClick={() => handleSort('receivedDate')} style={{ cursor: 'pointer' }}>Received Date</th>
                <th onClick={() => handleSort('status')} style={{ cursor: 'pointer' }}>Status</th>
                <th onClick={() => handleSort('type')} style={{ cursor: 'pointer' }}>Type</th>
                <th onClick={() => handleSort('language')} style={{ cursor: 'pointer' }}>Language</th>
                <th onClick={() => handleSort('location')} style={{ cursor: 'pointer' }}>Location</th>
                <th onClick={() => handleSort('assignedEmployee')} style={{ cursor: 'pointer' }}>Assigned Employee</th>
              </tr>
            </thead>
            <tbody>
              {currentLeads.length === 0 ? (
                <tr>
                  <td colSpan="10" style={{ textAlign: 'center' }}>No leads found.</td>
                </tr>
              ) : (
                currentLeads.map((lead, index) => (
                  <tr key={lead._id || index}>
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

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => setCurrentPage(page)}
          />
        </>
      )}
    </MainLayout>
  );
};

export default Lead;
