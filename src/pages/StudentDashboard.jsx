import React from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { BedDouble, Receipt, AlertTriangle, Calendar, ArrowRight, MoreVertical, Plus, CheckCircle2, CreditCard, DoorClosed, User, Building, Clock, FileText } from 'lucide-react';
import './StudentDashboard.css';

export default function StudentDashboard() {
  const navigate = useNavigate();

  return (
    <DashboardLayout>
      <div className="welcome-section">
        <div className="welcome-text">
          <h1>Good Morning, Student 👋</h1>
          <p>Here's what's happening with your hostel account.</p>
        </div>
      </div>

      <div className="stats-row">
        {/* Profile Completion */}
        <div className="stat-card stat-profile">
          <div className="stat-header">
            <span className="stat-title">PROFILE</span>
            <span className="stat-badge blue-badge">85% Complete</span>
          </div>
          <div className="stat-progress-bar">
            <div className="progress-fill blue-fill" style={{ width: '85%' }}></div>
          </div>
          <span className="stat-subtitle">Missing: Emergency Contact</span>
        </div>

        {/* Room Information */}
        <div className="stat-card stat-room">
          <div className="stat-header">
            <span className="stat-title">ROOM INFO</span>
            <Building size={16} className="stat-icon gray-icon" />
          </div>
          <div className="stat-value-group">
            <span className="stat-main-val">A-204</span>
            <span className="stat-sub-val">Block A • Bed 2</span>
          </div>
          <span className="stat-subtitle">Boys Hostel Main</span>
        </div>

        {/* Fee Status */}
        <div className="stat-card stat-fee">
          <div className="stat-header">
            <span className="stat-title">FEE STATUS</span>
            <span className="stat-badge red-badge">⚠ Pending</span>
          </div>
          <div className="stat-value-group">
            <span className="stat-main-val">₹4,000</span>
            <span className="stat-sub-val">Due of ₹40,000</span>
          </div>
          <span className="stat-subtitle">Paid: ₹36,000</span>
        </div>

        {/* Attendance */}
        <div className="stat-card stat-attendance">
          <div className="stat-header">
            <span className="stat-title">ATTENDANCE</span>
            <span className="stat-badge green-badge">92%</span>
          </div>
          <div className="stat-progress-bar">
            <div className="progress-fill green-fill" style={{ width: '92%' }}></div>
          </div>
          <span className="stat-subtitle">Present: 45 days</span>
        </div>
      </div>

      <div className="quick-actions-section">
        <h3>Quick Actions</h3>
        <div className="quick-actions-grid">
          <button className="quick-action-card" onClick={() => navigate('/student/leave')}>
            <div className="qa-icon-wrapper blue"><Calendar size={20} /></div>
            <span>Apply Leave</span>
          </button>
          <button className="quick-action-card" onClick={() => navigate('/student/complaints')}>
            <div className="qa-icon-wrapper orange"><AlertTriangle size={20} /></div>
            <span>Submit Complaint</span>
          </button>
          <button className="quick-action-card" onClick={() => navigate('/student/room')}>
            <div className="qa-icon-wrapper purple"><DoorClosed size={20} /></div>
            <span>View Room</span>
          </button>
          <button className="quick-action-card" onClick={() => navigate('/student/fees')}>
            <div className="qa-icon-wrapper green"><Receipt size={20} /></div>
            <span>View Fees</span>
          </button>
          <button className="quick-action-card" onClick={() => navigate('/student/profile')}>
            <div className="qa-icon-wrapper gray"><User size={20} /></div>
            <span>Update Profile</span>
          </button>
        </div>
      </div>

      <div className="bento-grid">
        {/* Profile Completion (Keep card structure but repurpose as we have it in stats row now? 
            Wait, instructions say: "DO NOT redesign or replace these existing sections: Fee Alert, Recent Complaints, Leave Requests, Notice Board". 
            But what about "Profile Completion" and "Room Details" from the old bento grid? 
            The instructions say: "Create/improve the dashboard with: 2. Student Overview Cards... Add compact cards for: Profile Completion, Room Information, Fee Status, Attendance".
            And "Only improve and extend the Student Panel around these existing sections." 
            So I should remove the old bento profile-card and room-details-card since they are now stats cards, or I can repurpose the layout. Let's keep the bento grid for the 4 preserved items. */}


        {/* Fee Alert */}
        <div className="bento-card fee-alert-card">
          <div className="fee-header">
            <h2>Fee Alert</h2>
            <span className="urgent-badge">URGENT</span>
          </div>
          <p>Outstanding Mess Fees for current semester.</p>
          <div className="fee-amount">₹4,000</div>
          <button className="pay-now-btn">Pay Now <CreditCard size={16} /></button>
          {/* Faded watermark icon */}
          <Receipt size={120} className="watermark-icon" />
        </div>



        {/* Recent Complaints */}
        <div className="bento-card complaints-card">
          <div className="card-header">
            <h2>Recent Complaints</h2>
            <button className="text-btn">View All</button>
          </div>
          <table className="custom-table">
            <thead>
              <tr>
                <th>TICKET ID</th>
                <th>CATEGORY</th>
                <th>DATE</th>
                <th>STATUS</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="highlight-left">#CPL-1042</td>
                <td>Electrical - Fan not working</td>
                <td>Today, 09:30 AM</td>
                <td><span className="badge-warning">Pending</span></td>
              </tr>
              <tr>
                <td className="highlight-left-blue">#CPL-0988</td>
                <td>Plumbing - Leaking tap</td>
                <td>12 Oct 2023</td>
                <td><span className="badge-gray">Resolved</span></td>
              </tr>
              <tr>
                <td className="highlight-left-blue">#CPL-0950</td>
                <td>Internet - Slow WiFi</td>
                <td>05 Oct 2023</td>
                <td><span className="badge-gray">Resolved</span></td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Notice Board */}
        <div className="bento-card notice-board-card">
          <div className="card-header">
            <h2><AlertTriangle size={18} className="purple-text"/> Notice Board</h2>
          </div>
          <div className="notice-list">
            <div className="notice-item">
              <div className="notice-top">
                <h4>Hostel Timing Update</h4>
                <span className="time">Just now</span>
              </div>
              <p>Curfew timings for weekends have been extended to 10:30 PM effective immediately.</p>
            </div>
            <div className="notice-item">
              <div className="notice-top">
                <h4>Maintenance Drive</h4>
                <span className="time">Yesterday</span>
              </div>
              <p>Routine AC maintenance will be conducted in Block A tomorrow from 10 AM to 2 PM.</p>
            </div>
          </div>
        </div>

        {/* Leave Requests */}
        <div className="bento-card leave-requests-card">
          <div className="card-header">
            <h2><Calendar size={18} className="blue-text"/> Leave Requests</h2>
            <button className="icon-btn-gray"><Plus size={16}/></button>
          </div>
          <div className="leave-list">
            <div className="leave-item">
              <div className="leave-info">
                <h4>Diwali Break</h4>
                <span className="dates">10 Nov - 15 Nov</span>
              </div>
              <span className="badge-success"><CheckCircle2 size={12}/> Approved</span>
            </div>
            <div className="leave-item">
              <div className="leave-info">
                <h4>Weekend Home</h4>
                <span className="dates">22 Sep - 24 Sep</span>
              </div>
              <span className="badge-success"><CheckCircle2 size={12}/> Approved</span>
            </div>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
