import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { useApp } from '../context/AppContext';
import { ArrowLeft, CheckCircle, Clock, AlertTriangle, FileText, Download, User, X } from 'lucide-react';
import './WardenApplicationDetails.css';

export default function WardenApplicationDetails() {
  const { applicationId } = useParams();
  const navigate = useNavigate();
  const { updateApplicationStatus } = useApp();
  
  const [app, setApp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedRoomId, setSelectedRoomId] = useState('');
  const [selectedBed, setSelectedBed] = useState('');
  const [feeAmount, setFeeAmount] = useState('');
  const [allocating, setAllocating] = useState(false);
  const [availableRooms, setAvailableRooms] = useState([]);

  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const [hostels, setHostels] = useState([]);
  
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
      const token = localStorage.getItem('wardenToken');
      const res = await fetch('/api/warden/rooms/available-for-allocation', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAvailableRooms(data || []);
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

  

  
  

  
  const handleAllocateRoom = async () => {
    if (!selectedRoomId || !selectedBed) {
      alert('Please select a room and a bed.');
      return;
    }
    setAllocating(true);
    try {
      const token = localStorage.getItem('wardenToken');
      const res = await fetch('/api/warden/allocate-bed', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          applicationId: app.id,
          studentId: app.studentId,
          roomId: selectedRoomId,
          bedId: selectedBed
        })
      });
      const data = await res.json();
      if (res.ok) {
        alert('Room allocated successfully! Notification sent to student.');
        setShowConfirmModal(false);
        fetchApplication(); // Refresh to see updated status
      } else {
        alert(`Allocation failed: ${data.message}`);
        setShowConfirmModal(false);
        fetchRooms(); // Refresh available beds in case someone else took it
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
          <button className="back-btn" onClick={() => navigate('/warden')}>
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
          <button className="back-btn" onClick={() => navigate('/warden')}>
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
            <div className="details-section card sticky-card" style={{border: '1px solid #bbf7d0', backgroundColor: '#f0fdf4'}}>
              <h2 style={{color: '#16a34a'}}>Application Approved</h2>
              <div className="review-meta">
                <p><strong>Status:</strong> {getStatusBadge(app.status)}</p>
                <p><strong>Approved by:</strong> Admin</p>
                {app.assignedAt && <p><strong>Assigned Date:</strong> {new Date(app.assignedAt).toLocaleDateString()}</p>}
                {app.assignedHostel && <p><strong>Assigned Hostel:</strong> {app.assignedHostel.name || 'Your Hostel'}</p>}
              </div>

              
              <div className="room-allocation-section" style={{marginTop: '1.5rem'}}>
                <h3 style={{borderBottom: '1px solid #bbf7d0', paddingBottom: '0.5rem', marginBottom: '1rem'}}>Room Allocation</h3>
                
                {app.hostelAssignmentStatus === 'Allocated' || app.assignedBed ? (
                  <div style={{ backgroundColor: '#fff', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#16a34a', marginBottom: '1rem', fontWeight: 'bold' }}>
                      <CheckCircle size={20} /> Bed Allocated Successfully
                    </div>
                    <p style={{ margin: '0 0 0.5rem 0' }}><strong>Hostel:</strong> {app.assignedHostel?.name}</p>
                    <p style={{ margin: '0 0 0.5rem 0' }}><strong>Room:</strong> {app.assignedRoom?.roomNumber || 'Unknown'}</p>
                    <p style={{ margin: '0' }}><strong>Bed ID:</strong> {app.assignedBed}</p>
                  </div>
                ) : (
                  <div className="allocation-form">
                    <div className="form-group" style={{marginBottom: '1rem'}}>
                      <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 500}}>Select Room</label>
                      <select 
                        value={selectedRoomId} 
                        onChange={e => { setSelectedRoomId(e.target.value); setSelectedBed(''); }}
                        style={{width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #cbd5e1'}}
                      >
                        <option value="">-- Select Room --</option>
                        {availableRooms.map(room => (
                          <option key={room._id} value={room._id}>
                            Room {room.roomNumber} — {room.availableBeds.length} Available Bed(s)
                          </option>
                        ))}
                      </select>
                    </div>
                    {selectedRoomId && (
                      <div className="form-group" style={{marginBottom: '1rem'}}>
                        <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 500}}>Select Bed</label>
                        <select 
                          value={selectedBed} 
                          onChange={e => setSelectedBed(e.target.value)}
                          style={{width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #cbd5e1'}}
                        >
                          <option value="">-- Select Bed --</option>
                          {availableRooms.find(r => r._id === selectedRoomId)?.availableBeds.map(b => (
                            <option key={b.bedId} value={b.bedId}>
                              {b.bedId} — Available
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                    <button 
                      className="allocate-btn" 
                      onClick={() => setShowConfirmModal(true)} 
                      disabled={allocating || !selectedRoomId || !selectedBed}
                      style={{width: '100%', padding: '1rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', opacity: (allocating || !selectedRoomId || !selectedBed) ? 0.5 : 1}}
                    >
                      Allocate Room & Assign Bed
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Confirmation Modal */}
        {showConfirmModal && (
          <div className="modal-overlay" style={{position:'fixed',top:0,left:0,right:0,bottom:0,background:'rgba(0,0,0,0.5)',display:'flex',justifyContent:'center',alignItems:'center',zIndex:1000}}>
            <div className="modal-content" style={{background:'white',padding:'2rem',borderRadius:'8px',width:'90%',maxWidth:'400px'}}>
              <h2>Confirm Bed Allocation</h2>
              <div style={{margin:'1.5rem 0', background:'#f8fafc', padding:'1rem', borderRadius:'8px', border:'1px solid #e2e8f0'}}>
                <p style={{margin:'0 0 0.5rem 0'}}><strong>Student:</strong> {app.fullName}</p>
                <p style={{margin:'0 0 0.5rem 0'}}><strong>Room:</strong> {availableRooms.find(r => r._id === selectedRoomId)?.roomNumber}</p>
                <p style={{margin:'0'}}><strong>Bed ID:</strong> {selectedBed}</p>
              </div>
              <p style={{color:'#64748b', marginBottom:'1.5rem'}}>Are you sure you want to assign this bed? This action will mark the bed as OCCUPIED.</p>
              <div style={{display:'flex',gap:'1rem'}}>
                <button onClick={() => setShowConfirmModal(false)} style={{flex:1,padding:'0.75rem',background:'#e2e8f0',border:'none',borderRadius:'4px',cursor:'pointer'}}>Cancel</button>
                <button onClick={handleAllocateRoom} disabled={allocating} style={{flex:1,padding:'0.75rem',background:'#3b82f6',color:'white',border:'none',borderRadius:'4px',cursor:'pointer'}}>
                  {allocating ? 'Confirming...' : 'Confirm Allocation'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
