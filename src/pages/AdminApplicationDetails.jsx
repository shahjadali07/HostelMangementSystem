import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { useApp } from '../context/AppContext';
import { ArrowLeft, CheckCircle, Clock, AlertTriangle, FileText, Download, User, X } from 'lucide-react';
import './AdminApplicationDetails.css';

export default function AdminApplicationDetails() {
  const { applicationId } = useParams();
  const navigate = useNavigate();
  const { updateApplicationStatus } = useApp();
  
  const [app, setApp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Dialog state
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showCorrectionDialog, setShowCorrectionDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [correctionMessage, setCorrectionMessage] = useState('');
  const [updating, setUpdating] = useState(false);
  
  // Room Allocation State
  const [availableRooms, setAvailableRooms] = useState([]);
  const [selectedRoomId, setSelectedRoomId] = useState('');
  const [selectedBed, setSelectedBed] = useState('');
  const [feeAmount, setFeeAmount] = useState(40000);
  const [allocating, setAllocating] = useState(false);

  // Assignment State
  const [showHostelSelection, setShowHostelSelection] = useState(false);
  const [hostels, setHostels] = useState([]);
  const [selectedAssignmentHostel, setSelectedAssignmentHostel] = useState('');
  const [assignmentError, setAssignmentError] = useState('');


  useEffect(() => {
    fetchApplication();
    fetchRooms();
    fetchHostels();
  }, [applicationId]);

  
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

  const fetchApplication = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/applications/${applicationId}`);
      if (!res.ok) {
        throw new Error('Application not found or server error');
      }
      const data = await res.json();
      setApp(data);
      document.title = `${data.id}${data.fullName ? ` — ${data.fullName}` : ''} | Hostel Management System`;
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING':
      case 'NEW': return <span className="app-status-badge new">PENDING</span>;
      case 'UNDER REVIEW': return <span className="app-status-badge review">UNDER REVIEW</span>;
      case 'APPROVED': return <span className="app-status-badge approved">APPROVED</span>;
      case 'REJECTED': return <span className="app-status-badge rejected">REJECTED</span>;
      case 'CORRECTION REQUIRED': return <span className="app-status-badge correction">CORRECTION REQUIRED</span>;
      default: return <span className="app-status-badge">{status}</span>;
    }
  };

  const handleStatusUpdate = async (newStatus, reason = '', correctionMsg = '') => {
    setUpdating(true);
    const result = await updateApplicationStatus(applicationId, newStatus, reason, correctionMsg);
    if (result.success) {
      // Re-fetch to get updated state from server
      await fetchApplication();
      setShowRejectDialog(false);
      setShowCorrectionDialog(false);
    } else {
      alert(`Failed to update status: ${result.error}`);
    }
    setUpdating(false);
  };

  
  const handleAssignHostel = async () => {
    setUpdating(true);
    setAssignmentError('');
    try {
      const res = await fetch(`/api/applications/${app.id}/assign-hostel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hostelId: selectedAssignmentHostel })
      });
      const data = await res.json();
      if (data.success) {
        setShowHostelSelection(false);
        alert(`Application Assigned Successfully!
Student: ${app.fullName}
Hostel: ${hostels.find(h=>h._id===selectedAssignmentHostel)?.name}
Notifications: Warden and Student notified.`);
        fetchApplication();
      } else {
        setAssignmentError(data.message || 'Failed to assign application');
      }
    } catch (err) {
      setAssignmentError(err.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleAllocateRoom = async () => {
    if (!selectedRoomId || !selectedBed) {
      alert('Please select a room and a bed.');
      return;
    }
    setAllocating(true);
    try {
      const res = await fetch('/api/rooms/allocate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicationId: app.id,
          studentId: app.studentId,
          roomId: selectedRoomId,
          bedNumber: selectedBed,
          feeAmount: feeAmount
        })
      });
      const data = await res.json();
      if (data.success) {
        alert('Room allocated successfully! Notification sent to student.');
        fetchRooms(); // Refresh rooms
      } else {
        alert(`Allocation failed: ${data.message}`);
      }
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
    setAllocating(false);
  };

  const handleDownload = (url, fallbackName) => {
    if (!url) return;
    const a = document.createElement('a');
    a.href = `/${url}`;
    a.download = fallbackName;
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="details-loading-state">
          <div className="spinner"></div>
          <p>Loading application details...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !app) {
    return (
      <DashboardLayout>
        <div className="details-error-state">
          <AlertTriangle size={48} />
          <h2>Error Loading Application</h2>
          <p>{error}</p>
          <button className="back-btn" onClick={() => navigate('/admin/applications')}>
            <ArrowLeft size={16} /> Back to Applications
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="app-details-page">
        {/* Header Action */}
        <div className="app-details-top-bar">
          <button className="back-btn" onClick={() => navigate('/admin/applications')}>
            <ArrowLeft size={16} /> Back to Applications
          </button>
        </div>

        {/* Profile Header */}
        <div className="app-details-header card">
          <div className="header-profile-section">
            <div className="header-avatar-container">
              {app.photoUrl ? (
                <img src={`/${app.photoUrl}`} alt="Profile" className="header-avatar-img" />
              ) : (
                <div className="header-avatar-fallback"><User size={48} /></div>
              )}
            </div>
            <div className="header-info">
              <h1>{app.fullName}</h1>
              <div className="header-meta">
                <span className="meta-item id-badge">{app.id}</span>
                <span className="meta-item">Enrollment: {app.enrollmentNo || 'N/A'}</span>
              </div>
              <div className="header-status">
                Status: {getStatusBadge(app.status)}
                <span className="meta-item date-badge">
                  Submitted: {new Date(app.submittedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="app-details-content">
          <div className="content-main-col">
            
            {/* Personal Info */}
            <div className="details-section card">
              <h2>Personal Information</h2>
              <div className="info-grid">
                <div className="info-item">
                  <label>Full Name</label>
                  <p>{app.fullName}</p>
                </div>
                <div className="info-item">
                  <label>Date of Birth</label>
                  <p>{app.dob ? new Date(app.dob).toLocaleDateString() : 'N/A'}</p>
                </div>
                <div className="info-item">
                  <label>Gender</label>
                  <p>{app.gender}</p>
                </div>
                <div className="info-item">
                  <label>Category</label>
                  <p>{app.category}</p>
                </div>
                <div className="info-item">
                  <label>Mobile Number</label>
                  <p>{app.phone}</p>
                </div>
                <div className="info-item">
                  <label>Email Address</label>
                  <p>{app.email}</p>
                </div>
                <div className="info-item">
                  <label>Aadhaar Number</label>
                  <p>{app.aadhaar}</p>
                </div>
                <div className="info-item full-width">
                  <label>Permanent Address</label>
                  <p>{app.permanentAddress}, {app.city}, {app.state} - {app.pincode}</p>
                </div>
              </div>
            </div>

            {/* Academic Info */}
            <div className="details-section card">
              <h2>Academic Information</h2>
              <div className="info-grid">
                <div className="info-item">
                  <label>Course / Department</label>
                  <p>{app.course || app.department}</p>
                </div>
                <div className="info-item">
                  <label>Year</label>
                  <p>{app.year}</p>
                </div>
                <div className="info-item">
                  <label>Enrollment Number</label>
                  <p>{app.enrollmentNo || 'N/A'}</p>
                </div>
                <div className="info-item">
                  <label>JEE Application No</label>
                  <p>{app.jeeApplicationNo || 'N/A'}</p>
                </div>
                <div className="info-item">
                  <label>CUET Application No</label>
                  <p>{app.cuetApplicationNo || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Parent Info */}
            <div className="details-section card">
              <h2>Parent / Guardian Information</h2>
              <div className="info-grid">
                <div className="info-item">
                  <label>Father's Name</label>
                  <p>{app.fatherName}</p>
                </div>
                <div className="info-item">
                  <label>Mother's Name</label>
                  <p>{app.motherName || 'N/A'}</p>
                </div>
                <div className="info-item">
                  <label>Parent Mobile Number</label>
                  <p>{app.parentPhone}</p>
                </div>
                <div className="info-item">
                  <label>Parent Email</label>
                  <p>{app.parentEmail || 'N/A'}</p>
                </div>
              </div>
            </div>
            
            {/* Documents */}
            <div className="details-section card">
              <h2>Documents & Attachments</h2>
              <div className="documents-grid">
                {app.photoUrl && (
                  <div className="document-card">
                    <div className="doc-preview img-preview" style={{backgroundImage: `url(/${app.photoUrl})`}}></div>
                    <div className="doc-info">
                      <h4>Profile Photo</h4>
                      <div className="doc-actions">
                        <button onClick={() => window.open(`/${app.photoUrl}`, '_blank')}>View</button>
                        <button onClick={() => handleDownload(app.photoUrl, 'photo.jpg')}>Download</button>
                      </div>
                    </div>
                  </div>
                )}
                {app.signatureUrl && (
                  <div className="document-card">
                    <div className="doc-preview img-preview" style={{backgroundImage: `url(/${app.signatureUrl})`, backgroundSize: 'contain'}}></div>
                    <div className="doc-info">
                      <h4>Signature</h4>
                      <div className="doc-actions">
                        <button onClick={() => window.open(`/${app.signatureUrl}`, '_blank')}>View</button>
                        <button onClick={() => handleDownload(app.signatureUrl, 'signature.jpg')}>Download</button>
                      </div>
                    </div>
                  </div>
                )}
                {app.aadhaarDocUrl && (
                  <div className="document-card">
                    <div className="doc-preview icon-preview">
                      <FileText size={32} />
                    </div>
                    <div className="doc-info">
                      <h4>Aadhaar Document</h4>
                      <div className="doc-actions">
                        <button onClick={() => window.open(`/${app.aadhaarDocUrl}`, '_blank')}>View</button>
                        <button onClick={() => handleDownload(app.aadhaarDocUrl, 'aadhaar_doc')}>Download</button>
                      </div>
                    </div>
                  </div>
                )}
                {app.otherDocumentsUrls && app.otherDocumentsUrls.map((url, i) => (
                  <div className="document-card" key={i}>
                    <div className="doc-preview icon-preview">
                      <FileText size={32} />
                    </div>
                    <div className="doc-info">
                      <h4>Other Document {i+1}</h4>
                      <div className="doc-actions">
                        <button onClick={() => window.open(`/${url}`, '_blank')}>View</button>
                        <button onClick={() => handleDownload(url, `document_${i+1}`)}>Download</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          <div className="content-side-col">
            {/* Review Section */}
            <div className="details-section card sticky-card">
              <h2>Application Review</h2>
              <div className="review-meta">
                <p><strong>Current Status:</strong> {getStatusBadge(app.status)}</p>
                {app.reviewedDate && (
                  <p><strong>Last Reviewed:</strong> {new Date(app.reviewedDate).toLocaleDateString()} by {app.reviewedBy}</p>
                )}
                {app.status === 'REJECTED' && app.rejectionReason && (
                  <div className="rejection-reason-box">
                    <strong>Rejection Reason:</strong>
                    <p>{app.rejectionReason}</p>
                  </div>
                )}
                {app.status === 'CORRECTION REQUIRED' && app.correctionMessage && (
                  <div className="correction-reason-box">
                    <strong>Correction Required:</strong>
                    <p>{app.correctionMessage}</p>
                  </div>
                )}
              </div>

              {(['ASSIGNED TO WARDEN', 'BED_ALLOCATION_PENDING', 'BED_ALLOCATED'].includes(app.status) || (app.status === 'APPROVED' && app.assignedWarden)) ? (
                <div className="room-allocation-section" style={{padding: '1rem', backgroundColor: '#f0fdfa', borderRadius: '8px', border: '1px solid #ccfbf1'}}>
                  <h3 style={{color: '#0f766e', marginTop: 0}}>Application Assigned</h3>
                  <p>This application has been successfully assigned to the warden for room allocation.</p>
                </div>
              ) : (
                <div className="review-actions">
                  <button 
                    className="review-btn btn-reviewing" 
                    onClick={() => handleStatusUpdate('UNDER REVIEW')}
                    disabled={updating || app.status === 'UNDER REVIEW'}
                  >
                    <Clock size={16}/> Mark Under Review
                  </button>
                  <button 
                    className="review-btn btn-approve" 
                    onClick={() => setShowHostelSelection(true)}
                    disabled={updating || ['ASSIGNED TO WARDEN', 'BED_ALLOCATION_PENDING', 'BED_ALLOCATED'].includes(app.status) || app.assignedWarden}
                  >
                    <CheckCircle size={16}/> {app.status === 'APPROVED' ? 'Assign Hostel' : 'Approve & Assign'}
                  </button>
                  <button 
                    className="review-btn btn-correction" 
                    onClick={() => setShowCorrectionDialog(true)}
                    disabled={updating || app.status === 'CORRECTION REQUIRED'}
                  >
                    <AlertTriangle size={16}/> Request Correction
                  </button>
                  <button 
                    className="review-btn btn-reject" 
                    onClick={() => setShowRejectDialog(true)}
                    disabled={updating || app.status === 'REJECTED'}
                  >
                    <X size={16}/> Reject Application
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Reject Dialog */}
      {showRejectDialog && (
        <div className="modal-overlay" onClick={() => !updating && setShowRejectDialog(false)}>
          <div className="modal-content reject-dialog" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Reject Application</h2>
              <button className="close-btn" onClick={() => setShowRejectDialog(false)} disabled={updating}><X size={20}/></button>
            </div>
            <div className="modal-body">
              <p>Please provide a reason for rejecting this application. This will be recorded in the system.</p>
              <textarea 
                className="rejection-textarea" 
                placeholder="Enter rejection reason..."
                value={rejectionReason}
                onChange={e => setRejectionReason(e.target.value)}
                rows={4}
              ></textarea>
              <div className="dialog-actions">
                <button className="btn-cancel" onClick={() => setShowRejectDialog(false)} disabled={updating}>Cancel</button>
                <button 
                  className="btn-confirm-reject" 
                  onClick={() => handleStatusUpdate('REJECTED', rejectionReason, '')}
                  disabled={updating || !rejectionReason.trim()}
                >
                  {updating ? 'Processing...' : 'Confirm Rejection'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Correction Dialog */}
      {showCorrectionDialog && (
        <div className="modal-overlay" onClick={() => !updating && setShowCorrectionDialog(false)}>
          <div className="modal-content correction-dialog" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Request Correction</h2>
              <button className="close-btn" onClick={() => setShowCorrectionDialog(false)} disabled={updating}><X size={20}/></button>
            </div>
            <div className="modal-body">
              <p>Please specify what the student needs to correct in their application.</p>
              <textarea 
                className="rejection-textarea" 
                placeholder="E.g., Please re-upload a clearer Aadhaar card image..."
                value={correctionMessage}
                onChange={e => setCorrectionMessage(e.target.value)}
                rows={4}
              ></textarea>
              <div className="dialog-actions">
                <button className="btn-cancel" onClick={() => setShowCorrectionDialog(false)} disabled={updating}>Cancel</button>
                <button 
                  className="btn-confirm-correction" 
                  onClick={() => handleStatusUpdate('CORRECTION REQUIRED', '', correctionMessage)}
                  disabled={updating || !correctionMessage.trim()}
                  style={{ padding: '0.5rem 1rem', background: '#eab308', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' }}
                >
                  {updating ? 'Processing...' : 'Send Request'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hostel Selection Dialog */}
      {showHostelSelection && (
        <div className="modal-overlay" onClick={() => !updating && setShowHostelSelection(false)}>
          <div className="modal-content assign-dialog" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Select Hostel for Student</h2>
              <button className="close-btn" onClick={() => setShowHostelSelection(false)} disabled={updating}><X size={20}/></button>
            </div>
            <div className="modal-body">
              <div className="student-summary-box" style={{display:'flex', alignItems:'center', gap:'1rem', padding:'1rem', backgroundColor:'#f8fafc', borderRadius:'8px', border:'1px solid #e2e8f0'}}>
                {app.photoUrl ? (
                  <img src={`/${app.photoUrl}`} alt="Profile" style={{width:'50px', height:'50px', borderRadius:'50%', objectFit:'cover'}} />
                ) : (
                  <div style={{width:'50px', height:'50px', borderRadius:'50%', backgroundColor:'#e2e8f0', display:'flex', alignItems:'center', justifyContent:'center'}}><User size={24} /></div>
                )}
                <div className="summary-info" style={{display:'flex', flexDirection:'column'}}>
                  <strong style={{fontSize:'1.1rem'}}>{app.fullName}</strong>
                  <span style={{fontSize:'0.85rem', color:'#64748b'}}>App ID: {app.id} | Enroll: {app.enrollmentNo || 'N/A'}</span>
                  <span style={{fontSize:'0.85rem', color:'#64748b'}}>{app.course || app.department} - {app.year}</span>
                </div>
              </div>

              <div className="form-group" style={{marginTop: '1.5rem'}}>
                <label style={{display:'block', marginBottom:'0.5rem', fontWeight:'500'}}>Select Hostel</label>
                <select 
                  value={selectedAssignmentHostel} 
                  onChange={e => setSelectedAssignmentHostel(e.target.value)}
                  style={{width:'100%', padding:'0.75rem', borderRadius:'6px', border:'1px solid #cbd5e1'}}
                >
                  <option value="">-- Select a Hostel --</option>
                  {hostels.filter(h => h.category.toLowerCase() === (app.gender?.toLowerCase() === 'female' ? 'girls' : 'boys')).map(h => (
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
                    <div className="warden-warning-box" style={{marginTop:'1rem', padding:'1rem', backgroundColor:'#fef2f2', color:'#ef4444', borderRadius:'8px', display:'flex', gap:'0.5rem', alignItems:'flex-start'}}>
                      <AlertTriangle size={20} />
                      <p style={{margin:0, fontSize:'0.9rem'}}>No warden is currently assigned to this hostel. Please assign a warden before sending this application.</p>
                    </div>
                  );
                }
                return (
                  <div className="warden-info-box" style={{marginTop:'1rem', padding:'1rem', backgroundColor:'#f0fdfa', border:'1px solid #ccfbf1', borderRadius:'8px'}}>
                    <strong style={{color:'#0f766e', display:'block', marginBottom:'0.25rem'}}>Assigned Warden</strong>
                    <p style={{margin:0, fontSize:'1.05rem', fontWeight:'500'}}>{selected.wardenId.fullName}</p>
                    <p style={{margin:0, fontSize:'0.85rem', color:'#0d9488'}}>{selected.wardenId.email} | {selected.wardenId.phone}</p>
                  </div>
                );
              })()}

              {assignmentError && <p className="error-text" style={{color:'#ef4444', marginTop:'1rem', fontSize:'0.9rem'}}>{assignmentError}</p>}

              <div className="dialog-actions" style={{marginTop:'2rem', display:'flex', justifyContent:'flex-end', gap:'1rem'}}>
                <button className="btn-cancel" onClick={() => setShowHostelSelection(false)} disabled={updating} style={{padding:'0.5rem 1rem', borderRadius:'6px', border:'1px solid #cbd5e1', background:'white'}}>Cancel</button>
                <button 
                  onClick={handleAssignHostel}
                  disabled={updating || !selectedAssignmentHostel || !hostels.find(h => h._id === selectedAssignmentHostel)?.wardenId}
                  style={{padding:'0.5rem 1rem', borderRadius:'6px', border:'none', background:'#10b981', color:'white', fontWeight:'500', opacity: (updating || !selectedAssignmentHostel || !hostels.find(h => h._id === selectedAssignmentHostel)?.wardenId) ? 0.5 : 1, cursor: 'pointer'}}
                >
                  {updating ? 'Processing...' : 'Confirm & Send to Warden'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </DashboardLayout>
  );
}
