import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { useApp } from '../context/AppContext';
import { Search, Filter, Eye, CheckCircle, AlertTriangle, X } from 'lucide-react';
import './AdminApplications.css';

export default function AdminApplications() {
  const { applications, updateApplicationStatus, getNewApplicationsCount } = useApp();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [appToApprove, setAppToApprove] = useState(null);
  const [processing, setProcessing] = useState(false);

  const [hostels, setHostels] = useState([]);
  const [selectedAssignmentHostel, setSelectedAssignmentHostel] = useState('');
  const [assignmentError, setAssignmentError] = useState('');


  // Room allocation state for the modal
  const [availableRooms, setAvailableRooms] = useState([]);
  const [selectedRoomId, setSelectedRoomId] = useState('');
  const [selectedBed, setSelectedBed] = useState('');
  const [feeAmount, setFeeAmount] = useState(40000);

  useEffect(() => {
    fetchRooms();
    fetchHostels();
  }, []);

  
  const fetchHostels = async () => {
    try {
      const res = await fetch('/api/hostels');
      if (res.ok) {
        const data = await res.json();
        setHostels(data);
      }
    } catch (err) {
      console.error('Error fetching hostels:', err);
    }
  };

  const fetchRooms = async () => {
    try {
      const res = await fetch('/api/rooms/available');
      if (res.ok) {
        const data = await res.json();
        setAvailableRooms(data.rooms || []);
      }
    } catch (err) {
      console.error('Error fetching rooms:', err);
    }
  };

  const filteredApps = applications.filter(app => {
    const matchesSearch = app.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          app.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'ALL' || app.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING':
      case 'NEW': return <span className="status-badge new">PENDING</span>;
      case 'UNDER REVIEW': return <span className="status-badge review">UNDER REVIEW</span>;
      case 'APPROVED': return <span className="status-badge approved">APPROVED</span>;
      case 'ASSIGNED TO WARDEN': return <span className="status-badge" style={{background: '#dbeafe', color: '#1e40af'}}>ASSIGNED TO WARDEN</span>;
      case 'REJECTED': return <span className="status-badge rejected">REJECTED</span>;
      case 'CORRECTION REQUIRED': return <span className="status-badge correction">CORRECTION REQUIRED</span>;
      default: return <span className="status-badge">{status}</span>;
    }
  };

  
  const handleAssignHostel = async () => {
    if (!appToApprove) return;
    setProcessing(true);
    setAssignmentError('');
    try {
      const res = await fetch(`/api/applications/${appToApprove.id}/assign-hostel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hostelId: selectedAssignmentHostel })
      });
      const data = await res.json();
      if (data.success) {
        setShowApproveModal(false);
        setAppToApprove(null);
        setSelectedAssignmentHostel('');
        alert(`Application Assigned Successfully!
Student: ${appToApprove.fullName}
Hostel: ${hostels.find(h=>h._id===selectedAssignmentHostel)?.name}
Notifications: Warden and Student notified.`);
        // Note: applications context is static in AppContext for now, so a refresh might be needed or we rely on the component reloading.
        // A simple window reload to reflect changes in the table since context fetching is not exposed here directly
        window.location.reload(); 
      } else {
        setAssignmentError(data.message || 'Failed to assign application');
      }
    } catch (err) {
      setAssignmentError(err.message);
    }
    setProcessing(false);
  };


  const handleRejectClick = (app) => {
    // Basic inline reject (or redirect to details to reject with reason)
    navigate(`/admin/applications/${app.id}`);
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
            <option value="NEW">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
            <option value="CORRECTION REQUIRED">Correction Required</option>
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
                    <div className="action-buttons-inline">
                      <button className="view-btn" onClick={() => navigate(`/admin/applications/${app.id}`)}>
                        <Eye size={16} /> View
                      </button>
                      {(app.status === 'NEW' || app.status === 'PENDING') && (
                        <>
                          <button className="approve-btn-inline" onClick={() => { setAppToApprove(app); setShowApproveModal(true); }}>
                            <CheckCircle size={16} /> Approve
                          </button>
                          <button className="reject-btn-inline" onClick={() => handleRejectClick(app)}>
                            <AlertTriangle size={16} /> Reject
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showApproveModal && appToApprove && (
        <div className="modal-overlay" onClick={() => !processing && setShowApproveModal(false)}>
          <div className="modal-content approve-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Approve Student Application?</h2>
              <button className="close-btn" onClick={() => setShowApproveModal(false)} disabled={processing}><X size={20}/></button>
            </div>
            <div className="modal-body">
              <div className="app-summary-card">
                <div className="summary-left">
                  <div>
                    <h3>{appToApprove.fullName}</h3>
                    <p>{appToApprove.id}</p>
                  </div>
                </div>
                <div>{getStatusBadge(appToApprove.status)}</div>
              </div>
              
              <div className="form-group" style={{marginTop: '1.5rem', textAlign: 'left'}}>
                <label style={{display:'block', marginBottom:'0.5rem', fontWeight:'500'}}>Select Hostel</label>
                <select 
                  value={selectedAssignmentHostel} 
                  onChange={e => setSelectedAssignmentHostel(e.target.value)}
                  style={{width:'100%', padding:'0.75rem', borderRadius:'6px', border:'1px solid #cbd5e1'}}
                >
                  <option value="">-- Select a Hostel --</option>
                  {hostels.filter(h => h.category.toLowerCase() === (appToApprove.gender?.toLowerCase() === 'female' ? 'girls' : 'boys')).map(h => (
                    <option key={h._id} value={h._id}>
                      {h.name} ({h.capacity - h.occupied} Available | {h.capacity} Total)
                    </option>
                  ))}
                </select>
              </div>

              {selectedAssignmentHostel && (() => {
                const selected = hostels.find(h => h._id === selectedAssignmentHostel);
                if (!selected?.wardenId) {
                  return (
                    <div className="warden-warning-box" style={{marginTop:'1rem', padding:'1rem', backgroundColor:'#fef2f2', color:'#ef4444', borderRadius:'8px', display:'flex', gap:'0.5rem', alignItems:'flex-start', textAlign: 'left'}}>
                      <AlertTriangle size={20} />
                      <p style={{margin:0, fontSize:'0.9rem'}}>No warden is currently assigned to this hostel. Please assign a warden before sending this application.</p>
                    </div>
                  );
                }
                return (
                  <div className="warden-info-box" style={{marginTop:'1rem', padding:'1rem', backgroundColor:'#f0fdfa', border:'1px solid #ccfbf1', borderRadius:'8px', textAlign: 'left'}}>
                    <strong style={{color:'#0f766e', display:'block', marginBottom:'0.25rem'}}>Assigned Warden</strong>
                    <p style={{margin:0, fontSize:'1.05rem', fontWeight:'500'}}>{selected.wardenId.fullName}</p>
                    <p style={{margin:0, fontSize:'0.85rem', color:'#0d9488'}}>{selected.wardenId.email} | {selected.wardenId.phone}</p>
                  </div>
                );
              })()}

              {assignmentError && <p className="error-text" style={{color:'#ef4444', marginTop:'1rem', fontSize:'0.9rem'}}>{assignmentError}</p>}

              <div className="dialog-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
                <button 
                  className="btn-cancel" 
                  onClick={() => setShowApproveModal(false)} 
                  disabled={processing}
                  style={{ padding: '0.5rem 1rem', background: '#fff', border: '1px solid #d1d5db', borderRadius: '6px', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button 
                  className="btn-confirm-approve" 
                  onClick={handleAssignHostel}
                  disabled={processing || !selectedAssignmentHostel || !hostels.find(h => h._id === selectedAssignmentHostel)?.wardenId}
                  style={{ padding: '0.5rem 1rem', background: '#10b981', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '500', opacity: (processing || !selectedAssignmentHostel || !hostels.find(h => h._id === selectedAssignmentHostel)?.wardenId) ? 0.5 : 1 }}
                >
                  {processing ? 'Processing...' : 'Confirm & Send to Warden'}
                </button>
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
