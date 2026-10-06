import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { useApp, HOSTELS } from '../context/AppContext';
import {
  Users, FileText, CheckCircle, AlertTriangle, BedDouble,
  Calendar, MoreVertical, ChevronRight, Shield
} from 'lucide-react';
import './WardenDashboard.css';

export default function WardenDashboard() {
  const { currentWarden } = useApp();
  const hostel = currentWarden ? HOSTELS.find(h => h.id === currentWarden.assignedHostel || h.id === currentWarden.hostelId) : null;
  const wardenName = currentWarden ? currentWarden.name || currentWarden.fullName : 'Warden';
  const hostelName = hostel ? hostel.name : 'Assigned Hostel';
  const position = currentWarden?.position === 'WARDEN_1' ? 'Warden 1' : 'Warden';

  const navigate = useNavigate();
  const [assignedApps, setAssignedApps] = useState([]);
  const [stats, setStats] = useState(null);
  const [recentLeaves, setRecentLeaves] = useState([]);
  const [recentComplaints, setRecentComplaints] = useState([]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'Good Morning';
    if (hour >= 12 && hour < 17) return 'Good Afternoon';
    if (hour >= 17 && hour < 21) return 'Good Evening';
    return 'Good Night';
  };

  useEffect(() => {
    if (currentWarden) {
      fetchApplications();
      fetchDashboardData();
    }
  }, [currentWarden]);

  const fetchApplications = async () => {
    try {
      const res = await fetch(`/api/applications/warden/by-email/approved?email=${encodeURIComponent(currentWarden.email)}`);
      if (res.ok) {
        const data = await res.json();
        setAssignedApps(data);
      }
    } catch (err) {
      console.error('Error fetching applications:', err);
    }
  };

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('wardenToken');
      const headers = { 'Authorization': `Bearer ${token}` };

      // Fetch Stats
      const statsRes = await fetch('/api/warden/dashboard-stats', { headers });
      if (statsRes.ok) setStats(await statsRes.json());

      // Fetch Leaves
      const leavesRes = await fetch('/api/warden/leave-requests', { headers });
      if (leavesRes.ok) {
        const leaves = await leavesRes.json();
        setRecentLeaves(leaves.slice(0, 3));
      }

      // Fetch Complaints
      const compRes = await fetch('/api/warden/complaints', { headers });
      if (compRes.ok) {
        const comps = await compRes.json();
        setRecentComplaints(comps.slice(0, 3));
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    }
  };

  return (
    <DashboardLayout>
      <div className="welcome-section">
        <h1>{getGreeting()}, {wardenName} 👋</h1>
        <p>
          <strong>{hostelName}</strong> — Warden: {wardenName}
        </p>
      </div>

      {/* Pending Applications Card */}
      <div className="stats-row" style={{ marginBottom: '2rem' }}>
        <div className="stat-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', border: '1px solid #e2e8f0', backgroundColor: '#fff' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#4338ca' }}>
            <FileText size={24} />
            <h2 style={{ margin: 0, fontSize: '1.25rem' }}>Pending Applications</h2>
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#0f172a' }}>
            {assignedApps.length}
          </div>
          <p style={{ margin: 0, color: '#64748b' }}>
            Applications awaiting hostel/bed allocation
          </p>
          <button 
            onClick={() => navigate('/warden/applications')}
            style={{ 
              marginTop: 'auto', 
              padding: '0.75rem', 
              backgroundColor: '#4338ca', 
              color: 'white', 
              border: 'none', 
              borderRadius: '6px', 
              cursor: 'pointer', 
              fontWeight: '600' 
            }}
          >
            View Applications
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-icon-wrapper purple">
            <Users size={20} />
          </div>
          <div className="stat-details">
            <span className="stat-title">TOTAL STUDENTS</span>
            <span className="stat-value">{stats ? stats.totalStudents : '-'}</span>
            <span className="stat-subtitle">In {hostelName}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper orange">
            <FileText size={20} />
          </div>
          <div className="stat-details">
            <span className="stat-title">LEAVE REQUESTS</span>
            <span className="stat-value">{stats ? stats.pendingLeaves : '-'}</span>
            <span className="stat-subtitle red-text">⚠ Pending</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper red">
            <AlertTriangle size={20} />
          </div>
          <div className="stat-details">
            <span className="stat-title">COMPLAINTS</span>
            <span className="stat-value">{stats ? stats.pendingComplaints : '-'}</span>
            <span className="stat-subtitle red-text">⚠ Open</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper green">
            <CheckCircle size={20} />
          </div>
          <div className="stat-details">
            <span className="stat-title">STUDENTS OUTSIDE</span>
            <span className="stat-value">{stats ? stats.studentsOutside : '-'}</span>
            <span className="stat-subtitle blue-text">Current</span>
          </div>
        </div>
      </div>

      {/* Bento Grid */}
      <div className="warden-grid">
        
        {/* Pending Approvals */}
        <div className="warden-card approvals-card">
          <div className="card-header">
            <h2>Recent Leave Requests</h2>
            <button className="text-btn" onClick={() => navigate('/warden/leave-requests')}>View All <ChevronRight size={14}/></button>
          </div>
          <div className="approval-list">
            {recentLeaves.length === 0 ? (
              <p style={{padding: '1rem', color: '#64748b'}}>No recent leave requests.</p>
            ) : (
              recentLeaves.map(leave => (
                <div key={leave._id} className="approval-item">
                  <div className="approval-avatar purple-avatar">{leave.studentId?.name?.charAt(0) || 'S'}</div>
                  <div className="approval-info">
                    <h4>{leave.studentId?.name || 'Student'} — {leave.leaveType}</h4>
                    <p>{new Date(leave.startDate).toLocaleDateString()} to {new Date(leave.endDate).toLocaleDateString()}</p>
                    <span className="time-ago">Status: {leave.status}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Hostel Capacity */}
        <div className="warden-card occupancy-card">
          <div className="card-header">
            <h2 style={{ textTransform: 'uppercase' }}>Hostel Capacity</h2>
          </div>
          {stats ? (
            <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#0f172a' }}>
                {hostel ? hostel.capacity : stats.officialCapacity}
              </div>
              <div style={{ color: '#64748b', marginBottom: '1rem' }}>
                Total Beds
              </div>
              
              <div style={{ fontSize: '1rem', color: '#334155' }}>
                <strong>Occupied:</strong> {stats.occupiedBeds}
              </div>
              <div style={{ fontSize: '1rem', color: '#334155' }}>
                <strong>Available:</strong> {(hostel ? hostel.capacity : stats.officialCapacity) - stats.occupiedBeds}
              </div>
              <div style={{ fontSize: '1rem', color: '#334155' }}>
                <strong>Occupancy:</strong> {(((stats.occupiedBeds) / (hostel ? hostel.capacity : stats.officialCapacity)) * 100 || 0).toFixed(1)}%
              </div>
            </div>
          ) : (
            <div style={{ marginTop: '2rem', textAlign: 'center', color: '#64748b' }}>Loading capacity...</div>
          )}
        </div>

        {/* Recent Complaints */}
        <div className="warden-card complaints-wide-card">
          <div className="card-header">
            <h2>Recent Complaints</h2>
            <button className="text-btn" onClick={() => navigate('/warden/complaints')}>View All <ChevronRight size={14}/></button>
          </div>
          <table className="custom-table">
            <thead>
              <tr>
                <th>STUDENT</th>
                <th>CATEGORY</th>
                <th>DATE</th>
                <th>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {recentComplaints.length === 0 ? (
                <tr><td colSpan="4" style={{textAlign: 'center', padding: '1rem'}}>No recent complaints.</td></tr>
              ) : (
                recentComplaints.map(comp => (
                  <tr key={comp._id}>
                    <td>{comp.studentId?.name || 'Student'}</td>
                    <td>{comp.category}</td>
                    <td>{new Date(comp.createdAt).toLocaleDateString()}</td>
                    <td><span className={`badge-${comp.status === 'Resolved' ? 'info' : 'warning'}`}>{comp.status}</span></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>
    </DashboardLayout>
  );
}
