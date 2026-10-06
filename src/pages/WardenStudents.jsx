import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { useApp, HOSTELS } from '../context/AppContext';
import { Search, RefreshCw, Eye, User as UserIcon, X, Filter } from 'lucide-react';
import './WardenStudents.css';

export default function WardenStudents() {
  const { currentWarden } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  
  // Use HOSTELS context or fallback for the title
  const contextHostel = currentWarden ? HOSTELS.find(h => h.id === currentWarden.assignedHostel || h.id === currentWarden.hostelId) : null;
  const fallbackHostelName = contextHostel ? contextHostel.name : 'your assigned hostel';

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // The backend will populate assignedHostel, we can extract the real name from the first student if available
  const [dbHostelName, setDbHostelName] = useState(null);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [yearFilter, setYearFilter] = useState('All Years');
  
  // Selected Student for Drawer/Modal
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Change Room State
  const [showChangeRoomModal, setShowChangeRoomModal] = useState(false);
  const [availableRoomsList, setAvailableRoomsList] = useState([]);
  const [selectedNewRoomId, setSelectedNewRoomId] = useState('');
  const [selectedNewBedId, setSelectedNewBedId] = useState('');
  const [changingStatus, setChangingStatus] = useState('');

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    if (selectedStudent) {
      document.title = `Student Profile — ${selectedStudent.fullName} | Hostel Management System`;
    } else {
      document.title = 'Students | Hostel Management System';
    }
  }, [selectedStudent]);

  const fetchStudents = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('wardenToken') || localStorage.getItem('token');
      const res = await fetch('/api/warden/students', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!res.ok) throw new Error('Failed to fetch students');
      const data = await res.json();
      
      // Enforce alphabetical sorting just in case
      const sortedData = data.sort((a, b) => 
        (a.fullName || '').toLowerCase().localeCompare((b.fullName || '').toLowerCase())
      );
      
      setStudents(sortedData);
      
      if (sortedData.length > 0 && sortedData[0].assignedHostel && sortedData[0].assignedHostel.name) {
        setDbHostelName(sortedData[0].assignedHostel.name);
      }

      if (location.state?.selectedStudentId) {
        const initialStudent = sortedData.find(s => s._id === location.state.selectedStudentId || s.studentId === location.state.selectedStudentId || s.id === location.state.selectedStudentId);
        if (initialStudent) {
          setSelectedStudent(initialStudent);
        }
      }
    } catch (err) {
      console.error('Error fetching students:', err);
      setError('Unable to load student data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchStudents();
  };

  const fetchAvailableRoomsForAllocation = async () => {
    try {
      const token = localStorage.getItem('wardenToken') || localStorage.getItem('token');
      const res = await fetch('/api/warden/rooms/available-for-allocation', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setAvailableRoomsList(await res.json());
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleChangeRoomInit = () => {
    if (!selectedStudent.assignedRoom || !selectedStudent.assignedBed) {
      alert("Student does not have an assigned room/bed yet.");
      return;
    }
    setSelectedNewRoomId('');
    setSelectedNewBedId('');
    setChangingStatus('');
    setShowChangeRoomModal(true);
    fetchAvailableRoomsForAllocation();
  };

  const submitChangeRoom = async () => {
    if (!selectedNewRoomId || !selectedNewBedId) return;
    try {
      setChangingStatus('Processing...');
      const token = localStorage.getItem('wardenToken') || localStorage.getItem('token');
      const payload = {
        studentId: selectedStudent.studentId, // From HostelApplication schema
        oldRoomId: selectedStudent.assignedRoom._id,
        oldBedId: selectedStudent.assignedBed,
        newRoomId: selectedNewRoomId,
        newBedId: selectedNewBedId
      };
      const res = await fetch('/api/warden/change-room', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setChangingStatus('Success! Room changed.');
        setTimeout(() => {
          setShowChangeRoomModal(false);
          setChangingStatus('');
          setSelectedStudent(null);
          fetchStudents();
        }, 1500);
      } else {
        const errData = await res.json();
        setChangingStatus(`Error: ${errData.message}`);
      }
    } catch (err) {
      setChangingStatus(`Error: ${err.message}`);
    }
  };

  // Compute filtered list dynamically
  const filteredStudents = students.filter(student => {
    // Year filter
    if (yearFilter !== 'All Years' && student.year !== yearFilter) {
      return false;
    }
    
    // Search filter (name, phone, email)
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchName = student.fullName?.toLowerCase().includes(query);
      const matchPhone = student.phone?.toLowerCase().includes(query);
      const matchEmail = student.email?.toLowerCase().includes(query);
      
      if (!matchName && !matchPhone && !matchEmail) return false;
    }
    
    return true;
  });

  const totalStudents = students.length;
  const displayedCount = filteredStudents.length;
  const displayHostelName = dbHostelName || fallbackHostelName;

  const closeDetails = () => setSelectedStudent(null);

  return (
    <DashboardLayout>
      <div className="warden-students-page">
        {/* Header Section */}
        <div className="warden-students-header">
          <div className="header-text">
            <h1>Students</h1>
            <p>Manage students of <strong>{displayHostelName}</strong></p>
          </div>
          
          <div className="stats-card">
            <span className="stats-value">{totalStudents}</span>
            <span className="stats-label">Total Students</span>
          </div>
        </div>

        {/* Toolbar Section */}
        <div className="students-toolbar">
          <div className="toolbar-left">
            <div className="search-wrapper">
              <Search size={18} className="search-icon" />
              <input 
                type="text" 
                placeholder="Search students by name, phone or email..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="filter-wrapper">
              <Filter size={18} className="filter-icon" />
              <select value={yearFilter} onChange={(e) => setYearFilter(e.target.value)}>
                <option value="All Years">All Years</option>
                <option value="1st Year">1st Year</option>
                <option value="2nd Year">2nd Year</option>
                <option value="3rd Year">3rd Year</option>
                <option value="4th Year">4th Year</option>
              </select>
            </div>
          </div>
          
          <div className="toolbar-right">
            <span className="displayed-count">Showing {displayedCount} students</span>
            <button className="refresh-btn" onClick={handleRefresh} disabled={loading}>
              <RefreshCw size={16} className={loading ? 'spinning' : ''} />
              Refresh
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="students-content">
          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading students for {displayHostelName}...</p>
            </div>
          ) : error ? (
            <div className="error-state">
              <p>{error}</p>
              <button onClick={handleRefresh}>Retry</button>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon"><UserIcon size={48} /></div>
              <h3>No students found</h3>
              <p>No students match the current "{yearFilter}" filter and search criteria in {displayHostelName}.</p>
              <button className="clear-filter-btn" onClick={() => { setSearchQuery(''); setYearFilter('All Years'); }}>
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="table-container">
              <table className="students-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Student Name</th>
                    <th>Contact Number</th>
                    <th>Email</th>
                    <th>Year</th>
                    <th>Course / Branch</th>
                    <th>Hostel</th>
                    <th>Room</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((student, index) => (
                    <tr key={student._id || student.id} onClick={() => setSelectedStudent(student)} className="student-row">
                      <td className="serial-col">{index + 1}</td>
                      <td className="name-col">
                        <div className="name-wrapper">
                          <div className="avatar-mini">
                            {student.fullName ? student.fullName.charAt(0).toUpperCase() : 'U'}
                          </div>
                          <span>{student.fullName}</span>
                        </div>
                      </td>
                      <td>{student.phone}</td>
                      <td className="email-col">{student.email}</td>
                      <td>
                        <span className="year-badge">{student.year}</span>
                      </td>
                      <td>{student.course} / {student.department}</td>
                      <td>
                        <span className="hostel-badge">{student.assignedHostel?.name || displayHostelName}</span>
                      </td>
                      <td className="room-col">{student.assignedRoom?.roomNumber || 'Not Assigned'}</td>
                      <td>
                        <span className="status-badge active">Active</span>
                      </td>
                      <td className="actions-col">
                        <button className="action-btn" onClick={(e) => { e.stopPropagation(); setSelectedStudent(student); }}>
                          <Eye size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Student Details Modal/Drawer */}
      {selectedStudent && (
        <div className="student-modal-overlay" onClick={closeDetails}>
          <div className="student-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Student Details</h2>
              <button className="close-btn" onClick={closeDetails}><X size={24} /></button>
            </div>
            
            <div className="modal-body">
              <div className="profile-header">
                <div className="profile-avatar-large">
                  {selectedStudent.fullName ? selectedStudent.fullName.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="profile-titles">
                  <h3>{selectedStudent.fullName}</h3>
                  <span className="status-badge active">Active Student</span>
                </div>
              </div>
              
              <div className="details-grid">
                <div className="detail-group">
                  <label>Email</label>
                  <p>{selectedStudent.email}</p>
                </div>
                <div className="detail-group">
                  <label>Contact Number</label>
                  <p>{selectedStudent.phone}</p>
                </div>
                <div className="detail-group">
                  <label>Year</label>
                  <p>{selectedStudent.year}</p>
                </div>
                <div className="detail-group">
                  <label>Course / Branch</label>
                  <p>{selectedStudent.course} / {selectedStudent.department}</p>
                </div>
                <div className="detail-group">
                  <label>Enrollment / Roll No</label>
                  <p>{selectedStudent.enrollmentNo || 'N/A'}</p>
                </div>
                <div className="detail-group">
                  <label>Application ID</label>
                  <p>{selectedStudent.id}</p>
                </div>
                <div className="detail-group">
                  <label>Hostel Assignment</label>
                  <p>{selectedStudent.assignedHostel?.name || displayHostelName}</p>
                </div>
                <div className="detail-group">
                  <label>Room Number</label>
                  <p>{selectedStudent.assignedRoom?.roomNumber || 'Not Assigned'}</p>
                </div>
                <div className="detail-group">
                  <label>Registration Date</label>
                  <p>{new Date(selectedStudent.submittedAt).toLocaleDateString()}</p>
                </div>
                <div className="detail-group">
                  <label>Guardian Contact</label>
                  <p>{selectedStudent.parentPhone || 'N/A'}</p>
                </div>
              </div>
            </div>
            
            <div className="modal-footer">
              <button 
                className="btn-secondary" 
                onClick={() => {
                  if (selectedStudent.assignedRoom) {
                    navigate('/warden/rooms', { state: { selectedRoomId: selectedStudent.assignedRoom._id } });
                  } else {
                    alert('Student has no assigned room.');
                  }
                }}
              >
                View Room
              </button>
              <button className="btn-secondary" onClick={() => alert('View Complaint History not implemented')}>Complaints</button>
              <button className="btn-secondary" onClick={() => alert('View Leave History not implemented')}>Leaves</button>
              <button className="btn-primary" onClick={handleChangeRoomInit}>Change Room</button>
            </div>
          </div>
        </div>
      )}

      {/* Change Room Modal */}
      {showChangeRoomModal && selectedStudent && (
        <div className="student-modal-overlay" style={{ zIndex: 1100 }}>
          <div className="student-modal" style={{ maxWidth: '500px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Change Room</h2>
              <button className="close-btn" onClick={() => setShowChangeRoomModal(false)}><X size={20}/></button>
            </div>
            <div className="modal-body" style={{ padding: '1.5rem' }}>
              <div style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                <h4 style={{ margin: '0 0 0.5rem 0' }}>Student: {selectedStudent.fullName}</h4>
                <p style={{ margin: 0, color: '#64748b' }}>Current: Room {selectedStudent.assignedRoom.roomNumber} (Bed {selectedStudent.assignedBed.split('-').pop()})</p>
              </div>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Select New Room</label>
                <select 
                  value={selectedNewRoomId} 
                  onChange={(e) => {
                    setSelectedNewRoomId(e.target.value);
                    setSelectedNewBedId('');
                  }}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                >
                  <option value="">-- Select Available Room --</option>
                  {availableRoomsList.map(r => (
                    <option key={r._id} value={r._id}>Room {r.roomNumber} (Floor {r.floor === 0 || r.floor === '0' ? 'Ground' : r.floor === 1 || r.floor === '1' ? 'First' : r.floor}) - {r.availableBeds.length} available beds</option>
                  ))}
                </select>
              </div>

              {selectedNewRoomId && (
                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Select New Bed</label>
                  <select 
                    value={selectedNewBedId} 
                    onChange={(e) => setSelectedNewBedId(e.target.value)}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  >
                    <option value="">-- Select Bed --</option>
                    {availableRoomsList.find(r => r._id === selectedNewRoomId)?.availableBeds.map(b => (
                      <option key={b.bedId} value={b.bedId}>Bed {b.bedId.split('-').pop()}</option>
                    ))}
                  </select>
                </div>
              )}

              {changingStatus && (
                <div style={{ padding: '0.75rem', backgroundColor: changingStatus.includes('Error') ? '#fef2f2' : '#f0fdf4', color: changingStatus.includes('Error') ? '#ef4444' : '#16a34a', borderRadius: '6px', marginBottom: '1rem' }}>
                  {changingStatus}
                </div>
              )}

              <button 
                onClick={submitChangeRoom}
                disabled={!selectedNewRoomId || !selectedNewBedId || changingStatus.includes('Processing') || changingStatus.includes('Success')}
                style={{ width: '100%', padding: '0.75rem', backgroundColor: '#4f46e5', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: (!selectedNewRoomId || !selectedNewBedId || changingStatus.includes('Processing')) ? 'not-allowed' : 'pointer', opacity: (!selectedNewRoomId || !selectedNewBedId) ? 0.5 : 1 }}
              >
                Confirm Room Change
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
