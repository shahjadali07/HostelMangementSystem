import React from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { useApp, HOSTELS } from '../context/AppContext';
import {
  Users, FileText, CheckCircle, AlertTriangle, BedDouble,
  Calendar, MoreVertical, ChevronRight, Shield
} from 'lucide-react';
import './WardenDashboard.css';

export default function WardenDashboard() {
  const { currentWarden } = useApp();
  const hostel = currentWarden ? HOSTELS.find(h => h.id === currentWarden.hostelId) : null;
  const wardenName = currentWarden ? currentWarden.fullName : 'Warden';
  const hostelName = hostel ? hostel.name : 'Assigned Hostel';
  const position = currentWarden?.position === 'WARDEN_1' ? 'Warden 1' : 'Warden 2';

  return (
    <DashboardLayout>
      <div className="welcome-section">
        <h1>Good Morning, {wardenName} 👋</h1>
        <p>
          <Shield size={14} style={{display:'inline',marginRight:4,color:'#9333ea'}}/>
          {position} — <strong>{hostelName}</strong>
        </p>
      </div>

      {/* Stats Row */}
      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-icon-wrapper purple">
            <Users size={20} />
          </div>
          <div className="stat-details">
            <span className="stat-title">TOTAL STUDENTS</span>
            <span className="stat-value">{hostel?.students || 450}</span>
            <span className="stat-subtitle">In {hostelName}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper orange">
            <FileText size={20} />
          </div>
          <div className="stat-details">
            <span className="stat-title">LEAVE REQUESTS</span>
            <span className="stat-value">12</span>
            <span className="stat-subtitle red-text">⚠ Pending</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper red">
            <AlertTriangle size={20} />
          </div>
          <div className="stat-details">
            <span className="stat-title">COMPLAINTS</span>
            <span className="stat-value">8</span>
            <span className="stat-subtitle red-text">⚠ Open</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper green">
            <CheckCircle size={20} />
          </div>
          <div className="stat-details">
            <span className="stat-title">RESOLVED</span>
            <span className="stat-value">38</span>
            <span className="stat-subtitle blue-text">This week</span>
          </div>
        </div>
      </div>

      {/* Bento Grid */}
      <div className="warden-grid">
        {/* Pending Approvals */}
        <div className="warden-card approvals-card">
          <div className="card-header">
            <h2>Pending Approvals</h2>
            <button className="text-btn">View All <ChevronRight size={14}/></button>
          </div>
          <div className="approval-list">
            <div className="approval-item">
              <div className="approval-avatar purple-avatar">JS</div>
              <div className="approval-info">
                <h4>Leave Request — John Smith</h4>
                <p>Room 102 · Medical emergency · Oct 15–20</p>
                <span className="time-ago">Requested 2 hrs ago</span>
              </div>
              <div className="approval-actions">
                <button className="approve-btn">Approve</button>
                <button className="reject-btn">Reject</button>
              </div>
            </div>
            <div className="approval-item">
              <div className="approval-avatar blue-avatar">AJ</div>
              <div className="approval-info">
                <h4>Room Change — Alex Johnson</h4>
                <p>Room 304 · Moving with study partner</p>
                <span className="time-ago">Requested yesterday</span>
              </div>
              <div className="approval-actions">
                <button className="approve-btn">Approve</button>
                <button className="reject-btn">Reject</button>
              </div>
            </div>
            <div className="approval-item">
              <div className="approval-avatar orange-avatar">PK</div>
              <div className="approval-info">
                <h4>Leave Request — Priya Kumar</h4>
                <p>Room 210 · Family function · Oct 20–22</p>
                <span className="time-ago">Requested 5 hrs ago</span>
              </div>
              <div className="approval-actions">
                <button className="approve-btn">Approve</button>
                <button className="reject-btn">Reject</button>
              </div>
            </div>
          </div>
        </div>

        {/* Room Occupancy */}
        <div className="warden-card occupancy-card">
          <div className="card-header">
            <h2>Room Occupancy</h2>
            <button className="more-btn"><MoreVertical size={18}/></button>
          </div>
          <div className="occupancy-stats">
            <div className="occ-item">
              <div className="occ-bar-wrapper">
                <div className="occ-bar" style={{width: '88%', background: '#5142f5'}}></div>
              </div>
              <div className="occ-labels">
                <span>Block A</span>
                <strong>88%</strong>
              </div>
            </div>
            <div className="occ-item">
              <div className="occ-bar-wrapper">
                <div className="occ-bar" style={{width: '72%', background: '#3b82f6'}}></div>
              </div>
              <div className="occ-labels">
                <span>Block B</span>
                <strong>72%</strong>
              </div>
            </div>
            <div className="occ-item">
              <div className="occ-bar-wrapper">
                <div className="occ-bar" style={{width: '95%', background: '#f59e0b'}}></div>
              </div>
              <div className="occ-labels">
                <span>Block C</span>
                <strong>95%</strong>
              </div>
            </div>
            <div className="occ-item">
              <div className="occ-bar-wrapper">
                <div className="occ-bar" style={{width: '60%', background: '#10b981'}}></div>
              </div>
              <div className="occ-labels">
                <span>Block D</span>
                <strong>60%</strong>
              </div>
            </div>
          </div>
          <div className="occ-summary">
            <div className="occ-sum-item">
              <span className="occ-sum-value">420</span>
              <span className="occ-sum-label">Occupied</span>
            </div>
            <div className="occ-sum-item">
              <span className="occ-sum-value">80</span>
              <span className="occ-sum-label">Vacant</span>
            </div>
            <div className="occ-sum-item">
              <span className="occ-sum-value">500</span>
              <span className="occ-sum-label">Total Beds</span>
            </div>
          </div>
        </div>

        {/* Recent Complaints */}
        <div className="warden-card complaints-wide-card">
          <div className="card-header">
            <h2>Recent Complaints</h2>
            <button className="text-btn">View All <ChevronRight size={14}/></button>
          </div>
          <table className="custom-table">
            <thead>
              <tr>
                <th>TICKET ID</th>
                <th>STUDENT</th>
                <th>CATEGORY</th>
                <th>DATE</th>
                <th>STATUS</th>
                <th>ACTION</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="highlight-left">#CPL-1042</td>
                <td>John Smith</td>
                <td>Electrical — Fan not working</td>
                <td>Today, 09:30 AM</td>
                <td><span className="badge-warning">Pending</span></td>
                <td><button className="table-action-btn">Assign</button></td>
              </tr>
              <tr>
                <td className="highlight-left-blue">#CPL-1041</td>
                <td>Sarah Lee</td>
                <td>Plumbing — Leaking tap</td>
                <td>Yesterday</td>
                <td><span className="badge-info">In Progress</span></td>
                <td><button className="table-action-btn">View</button></td>
              </tr>
              <tr>
                <td className="highlight-left-green">#CPL-1040</td>
                <td>Raj Patel</td>
                <td>Internet — Slow WiFi</td>
                <td>12 Oct 2023</td>
                <td><span className="badge-gray">Resolved</span></td>
                <td><button className="table-action-btn">View</button></td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Attendance Overview */}
        <div className="warden-card attendance-card">
          <div className="card-header">
            <h2><BedDouble size={18} className="purple-text"/> Tonight's Attendance</h2>
            <span className="date-badge">Oct 13, 2023</span>
          </div>
          <div className="attendance-summary">
            <div className="att-item present">
              <span className="att-count">412</span>
              <span className="att-label">Present</span>
            </div>
            <div className="att-item absent">
              <span className="att-count">28</span>
              <span className="att-label">On Leave</span>
            </div>
            <div className="att-item pending">
              <span className="att-count">10</span>
              <span className="att-label">Unaccounted</span>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
