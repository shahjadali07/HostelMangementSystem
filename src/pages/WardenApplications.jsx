import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { useApp } from '../context/AppContext';
import { Search, Filter, Eye, UserPlus, FileText, ChevronRight } from 'lucide-react';
import './WardenApplications.css'; // Optional styling if needed

export default function WardenApplications() {
  const { currentWarden } = useApp();
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('BED_ALLOCATION_PENDING'); // all | BED_ALLOCATION_PENDING | BED_ALLOCATED
  
  useEffect(() => {
    if (currentWarden) {
      fetchApplications();
    }
  }, [currentWarden]);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/applications/warden/by-email/approved?email=${encodeURIComponent(currentWarden.email)}`);
      if (res.ok) {
        const data = await res.json();
        setApplications(data);
      }
    } catch (err) {
      console.error('Error fetching pending applications:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredApplications = applications.filter(app => {
    // Determine pseudo-status for filter
    let pseudoStatus = 'BED_ALLOCATION_PENDING';
    if (app.status === 'BED_ALLOCATED' || app.hostelAssignmentStatus === 'Allocated') {
      pseudoStatus = 'BED_ALLOCATED';
    }

    if (statusFilter !== 'all' && pseudoStatus !== statusFilter) {
      return false;
    }

    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      if (!app.fullName?.toLowerCase().includes(lowerSearch) && !app.id?.toLowerCase().includes(lowerSearch)) {
        return false;
      }
    }
    
    return true;
  });

  return (
    <DashboardLayout>
      <div className="admin-header">
        <div>
          <h1>Pending Applications</h1>
          <p>Applications approved by Admin and awaiting room & bed allocation.</p>
        </div>
      </div>

      <div className="applications-controls">
        <div className="search-bar">
          <Search size={18} />
          <input 
            type="text" 
            placeholder="Search Student or Application ID..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <Filter size={18} />
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="BED_ALLOCATION_PENDING">Pending Allocation</option>
            <option value="BED_ALLOCATED">Allocated</option>
            <option value="all">All</option>
          </select>
        </div>
      </div>

      <div className="applications-list">
        {loading ? (
          <p>Loading applications...</p>
        ) : filteredApplications.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon"><FileText size={48} /></div>
            <h3>No Pending Applications</h3>
            <p>There are currently no Admin-approved applications waiting for bed allocation.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Application ID</th>
                  <th>Student Name</th>
                  <th>Course & Year</th>
                  <th>Approval Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredApplications.map(app => {
                  const isAllocated = app.status === 'BED_ALLOCATED' || app.hostelAssignmentStatus === 'Allocated';
                  
                  return (
                    <tr key={app.id}>
                      <td>{app.id}</td>
                      <td><strong>{app.fullName}</strong></td>
                      <td>{app.course || 'N/A'} • {app.year}</td>
                      <td>{new Date(app.assignedAt || app.submittedAt).toLocaleDateString()}</td>
                      <td>
                        <span className={`status-badge ${isAllocated ? 'approved' : 'review'}`}>
                          {isAllocated ? 'Allocated' : 'Bed Allocation Pending'}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons" style={{ display: 'flex', gap: '0.5rem' }}>
                          <button 
                            className="btn-outline-primary btn-sm"
                            onClick={() => navigate(`/warden/applications/${app.id}`)}
                          >
                            <Eye size={14} style={{ marginRight: '4px' }} /> View
                          </button>
                          {!isAllocated && (
                            <button 
                              className="btn-primary btn-sm"
                              onClick={() => navigate(`/warden/applications/${app.id}`)}
                            >
                              <UserPlus size={14} style={{ marginRight: '4px' }} /> Allocate Bed
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
