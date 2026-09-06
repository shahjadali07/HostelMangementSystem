import React, { useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { useApp } from '../context/AppContext';
import { Search, Filter, Eye, X, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import './AdminApplications.css';

export default function AdminApplications() {
  const { applications, updateApplicationStatus } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  
  const [selectedApp, setSelectedApp] = useState(null);

  const filteredApps = applications.filter(app => {
    const matchesSearch = app.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          app.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'ALL' || app.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'NEW': return <span className="status-badge new">NEW</span>;
      case 'UNDER REVIEW': return <span className="status-badge review">UNDER REVIEW</span>;
      case 'APPROVED': return <span className="status-badge approved">APPROVED</span>;
      case 'REJECTED': return <span className="status-badge rejected">REJECTED</span>;
      default: return <span className="status-badge">{status}</span>;
    }
  };

  const handleStatusChange = (appId, newStatus) => {
    if (window.confirm(`Are you sure you want to change the status to ${newStatus}?`)) {
      updateApplicationStatus(appId, newStatus);
      if (selectedApp) {
        setSelectedApp({ ...selectedApp, status: newStatus });
      }
    }
  };

  return (
    <DashboardLayout>
      <div className="admin-page-header">
        <div>
          <h1>New Applications</h1>
          <p>Review and process incoming hostel applications.</p>
        </div>
      </div>

      <div className="admin-filters">
        <div className="search-box">
          <Search size={18} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search applications..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-dropdown">
          <Filter size={18} className="filter-icon" />
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="ALL">All Status</option>
            <option value="NEW">New</option>
            <option value="UNDER REVIEW">Under Review</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
      </div>

      <div className="admin-table-container">
        {filteredApps.length === 0 ? (
          <div className="empty-state">
            <FileTextIcon />
            <h3>No Applications Found</h3>
            <p>New student registrations will appear here.</p>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Application ID</th>
                <th>Student</th>
                <th>Course</th>
                <th>Year</th>
                <th>Date</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredApps.map(app => (
                <tr key={app.id}>
                  <td className="fw-600">{app.id}</td>
                  <td>
                    <div className="td-student-info">
                      <div className="td-avatar">{app.fullName.charAt(0)}</div>
                      <span>{app.fullName}</span>
                    </div>
                  </td>
                  <td>{app.course}</td>
                  <td>{app.year}</td>
                  <td>{new Date(app.submittedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                  <td>{getStatusBadge(app.status)}</td>
                  <td>
                    <button className="view-btn" onClick={() => setSelectedApp(app)}>
                      <Eye size={16} /> View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Application Details Modal */}
      {selectedApp && (
        <div className="modal-overlay" onClick={() => setSelectedApp(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Application Details</h2>
              <button className="close-btn" onClick={() => setSelectedApp(null)}><X size={20}/></button>
            </div>
            <div className="modal-body">
              <div className="app-summary-card">
                <div className="summary-left">
                  <div className="large-avatar">{selectedApp.fullName.charAt(0)}</div>
                  <div>
                    <h3>{selectedApp.fullName}</h3>
                    <p>{selectedApp.id}</p>
                  </div>
                </div>
                <div>{getStatusBadge(selectedApp.status)}</div>
              </div>

              <div className="app-details-grid">
                <div className="detail-group">
                  <label>Email Address</label>
                  <p>{selectedApp.email}</p>
                </div>
                <div className="detail-group">
                  <label>Phone Number</label>
                  <p>{selectedApp.phone}</p>
                </div>
                <div className="detail-group">
                  <label>Enrollment / App No</label>
                  <p>{selectedApp.enrollmentNo}</p>
                </div>
                <div className="detail-group">
                  <label>Course & Branch</label>
                  <p>{selectedApp.course}</p>
                </div>
                <div className="detail-group">
                  <label>Year</label>
                  <p>{selectedApp.year}</p>
                </div>
                <div className="detail-group">
                  <label>Gender & Category</label>
                  <p>{selectedApp.gender} ({selectedApp.category})</p>
                </div>
              </div>

              <div className="status-actions">
                <h4>Update Status</h4>
                <div className="action-buttons">
                  <button 
                    className="status-btn btn-review" 
                    onClick={() => handleStatusChange(selectedApp.id, 'UNDER REVIEW')}
                    disabled={selectedApp.status === 'UNDER REVIEW'}
                  >
                    <Clock size={16}/> Under Review
                  </button>
                  <button 
                    className="status-btn btn-approve" 
                    onClick={() => handleStatusChange(selectedApp.id, 'APPROVED')}
                    disabled={selectedApp.status === 'APPROVED'}
                  >
                    <CheckCircle size={16}/> Approve
                  </button>
                  <button 
                    className="status-btn btn-reject" 
                    onClick={() => handleStatusChange(selectedApp.id, 'REJECTED')}
                    disabled={selectedApp.status === 'REJECTED'}
                  >
                    <AlertTriangle size={16}/> Reject
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

    </DashboardLayout>
  );
}

const FileTextIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#a0a0b0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{marginBottom: 16}}>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
    <polyline points="14 2 14 8 20 8"></polyline>
    <line x1="16" y1="13" x2="8" y2="13"></line>
    <line x1="16" y1="17" x2="8" y2="17"></line>
    <polyline points="10 9 9 9 8 9"></polyline>
  </svg>
);
