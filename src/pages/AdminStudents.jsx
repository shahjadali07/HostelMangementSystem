import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { Search, RefreshCw, Eye, User as UserIcon, X, Filter } from 'lucide-react';
import './AdminStudents.css';

export default function AdminStudents() {
  const navigate = useNavigate();
  
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [yearFilter, setYearFilter] = useState('All Years');
  
  // Selected Student for Drawer/Modal
  const [selectedStudent, setSelectedStudent] = useState(null);

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
      const res = await fetch('/api/applications/admin/approved-students');
      if (!res.ok) throw new Error('Failed to fetch students');
      const data = await res.json();
      
      // Alphabetical sorting is handled mostly by backend, but let's enforce it here just to be safe
      const sortedData = data.sort((a, b) => 
        a.fullName.toLowerCase().localeCompare(b.fullName.toLowerCase())
      );
      
      setStudents(sortedData);
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

  // Compute filtered list dynamically without state duplication
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

  const closeDetails = () => setSelectedStudent(null);

  return (
    <DashboardLayout>
      <div className="admin-students-page">
        {/* Header Section */}
        <div className="admin-students-header">
          <div className="header-text">
            <h1>Students</h1>
            <p>Manage and view all approved hostel students</p>
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
              <p>Loading students...</p>
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
              <p>No students match the current "{yearFilter}" filter and search criteria.</p>
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
                            {student.fullName.charAt(0).toUpperCase()}
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
                  {selectedStudent.fullName.charAt(0).toUpperCase()}
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
                  <p>{selectedStudent.hostelAssignmentStatus || 'Pending'}</p>
                </div>
                <div className="detail-group">
                  <label>Registration Date</label>
                  <p>{new Date(selectedStudent.submittedAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
            
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => alert('View Full Profile not implemented in this scope')}>View Profile</button>
              <button className="btn-secondary" onClick={() => alert('Edit Student not implemented')}>Edit Student</button>
              <button className="btn-danger" onClick={() => alert('Deactivate Student not implemented')}>Deactivate</button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
