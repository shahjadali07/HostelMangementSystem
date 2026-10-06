import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import HostelRegistrationForm from '../components/HostelRegistrationForm';
import { BedDouble, Receipt, AlertTriangle, Calendar, ArrowRight, MoreVertical, Plus, CheckCircle2, CreditCard, DoorClosed, User, Building, Clock, FileText } from 'lucide-react';
import './StudentDashboard.css';

export default function StudentDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await fetch('/api/student/dashboard', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('studentToken') || localStorage.getItem('token')}`
        }
      });
      const json = await res.json();
      if (json.code === 'HOSTEL_REGISTRATION_REQUIRED') {
        navigate('/student/register');
        return;
      }
      if (json.success) {
        setData(json);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f3f4f6' }}>
      <div style={{ textAlign: 'center' }}>
        <h2 style={{ color: '#4b5563' }}>Checking application status...</h2>
      </div>
    </div>
  );

  const { application, roomAllocation, fee, notifications } = data || {};
  
  const approvedStatuses = ['APPROVED', 'ASSIGNED TO WARDEN', 'FORWARDED_TO_WARDEN', 'BED_ALLOCATION_PENDING', 'BED_ALLOCATED'];
  const isApproved = application && approvedStatuses.includes(application.status);
  const isRejected = application?.status === 'REJECTED';
  const hasAllocation = !!roomAllocation;

  const statusColors = {
    'NEW': 'gray', 'PENDING': 'gray',
    'UNDER REVIEW': 'orange',
    'APPROVED': 'green',
    'REJECTED': 'red',
    'CORRECTION REQUIRED': 'orange',
    'ASSIGNED TO WARDEN': 'green',
    'FORWARDED_TO_WARDEN': 'green',
    'BED_ALLOCATION_PENDING': 'green',
    'BED_ALLOCATED': 'green'
  };

  const handleQuickAction = (path) => {
    if (path === '/student/room') {
      if (!isApproved) {
        alert('Your hostel application is currently under review. This feature will be available after your application is approved.');
        return;
      }
      if (!hasAllocation) {
        alert('Your application is approved, but a room has not been allocated yet. Please wait for the warden to allocate your room.');
        return;
      }
    }
    const isProtected = ['/student/leave', '/student/complaints', '/student/fees'];
    if (isProtected.includes(path) && !isApproved) {
      alert('Your hostel application is currently under review. This feature will be available after your application is approved.');
      return;
    }
    navigate(path);
  };

  return (
    <DashboardLayout notifications={notifications} fetchDashboard={fetchDashboard} applicationStatus={application?.status} hasAllocation={hasAllocation}>
      
      {isRejected ? (
            <div className="pending-application-banner" style={{ backgroundColor: '#fee2e2', padding: '16px', borderRadius: '8px', marginBottom: '24px', border: '1px solid #ef4444' }}>
              <h2 style={{ color: '#b91c1c', margin: '0 0 8px 0', fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertTriangle size={20} /> APPLICATION REJECTED
              </h2>
              <p style={{ color: '#7f1d1d', margin: 0 }}>
                Your hostel application has been rejected. Please contact administration for more details.
              </p>
            </div>
          ) : isApproved && hasAllocation ? (
            <div className="pending-application-banner" style={{ backgroundColor: '#dcfce7', padding: '16px', borderRadius: '8px', marginBottom: '24px', border: '1px solid #22c55e' }}>
              <h2 style={{ color: '#15803d', margin: '0 0 8px 0', fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={20} /> HOSTEL ALLOCATION CONFIRMED
              </h2>
              <p style={{ color: '#166534', margin: 0 }}>
                Your bed has been successfully allocated. Check your room details below.
              </p>
            </div>
          ) : isApproved && !hasAllocation ? (
            <div className="pending-application-banner" style={{ backgroundColor: '#e0f2fe', padding: '16px', borderRadius: '8px', marginBottom: '24px', border: '1px solid #38bdf8' }}>
              <h2 style={{ color: '#0369a1', margin: '0 0 8px 0', fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={20} /> APPLICATION APPROVED
              </h2>
              <p style={{ color: '#075985', margin: 0 }}>
                Your hostel application has been approved. Hostel/room allocation is pending.
              </p>
            </div>
          ) : (
            <div className="pending-application-banner" style={{ backgroundColor: '#fef3c7', padding: '16px', borderRadius: '8px', marginBottom: '24px', border: '1px solid #f59e0b' }}>
              <h2 style={{ color: '#b45309', margin: '0 0 8px 0', fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertTriangle size={20} /> APPLICATION UNDER REVIEW
              </h2>
              <p style={{ color: '#92400e', margin: 0 }}>
                Your hostel application has been submitted successfully and is currently waiting for administrator approval.
              </p>
            </div>
          )}

          <div className="welcome-section">
            <div className="welcome-text">
              <h1>Good Morning, {data?.user?.fullName?.split(' ')[0] || 'Student'} 👋</h1>
              <p>Here's what's happening with your hostel account.</p>
            </div>
          </div>

      <div className="stats-row">
        {/* Profile Completion */}
        {/* Application Status */}
        <div className="stat-card stat-profile">
          <div className="stat-header">
            <span className="stat-title">APPLICATION STATUS</span>
            <span className={`stat-badge ${statusColors[application?.status || 'NEW']}-badge`}>
              {isApproved ? 'Approved' : application?.status || 'Pending'}
            </span>
          </div>
          <div className="stat-progress-bar">
            <div className={`progress-fill ${statusColors[application?.status || 'NEW']}-fill`} style={{ width: isApproved ? '100%' : '50%' }}></div>
          </div>
          <span className="stat-subtitle">{isApproved ? 'Approved for hostel assignment' : 'Pending administrator review'}</span>
        </div>

        {/* Room / Allocation Information */}
        <div className="stat-card stat-room">
          <div className="stat-header">
            <span className="stat-title">ALLOCATION STATUS</span>
            {hasAllocation ? (
              <span className="stat-badge green-badge">Allocated</span>
            ) : isApproved ? (
              <span className="stat-badge orange-badge">Pending Room</span>
            ) : (
              <span className="stat-badge gray-badge">Not Ready</span>
            )}
          </div>
          {hasAllocation ? (
            <div className="stat-value-group">
              <span className="stat-main-val">Room {roomAllocation.roomNumber}</span>
              <span className="stat-sub-val">Block {roomAllocation.block} • Bed {roomAllocation.bed}</span>
            </div>
          ) : (
            <div className="stat-value-group">
              <span className="stat-main-val" style={{ fontSize: '1.1rem', color: '#6b7280' }}>
                {isApproved ? 'Not Allocated Yet' : 'Not Allocated'}
              </span>
            </div>
          )}
          <span className="stat-subtitle">{hasAllocation ? roomAllocation.hostelName : (isApproved ? 'Waiting for warden allocation' : 'Waiting for application approval')}</span>
        </div>

        {/* Fee Status */}
        <div className="stat-card stat-fee">
          <div className="stat-header">
            <span className="stat-title">FEE STATUS</span>
            {fee ? (
               <span className={`stat-badge ${fee.status === 'Paid' ? 'green-badge' : 'red-badge'}`}>
                 {fee.status === 'Paid' ? 'Paid' : '⚠ Pending'}
               </span>
            ) : (
               <span className="stat-badge gray-badge">N/A</span>
            )}
          </div>
          <div className="stat-value-group">
            <span className="stat-main-val">₹{fee ? fee.pendingAmount.toLocaleString() : '0'}</span>
            <span className="stat-sub-val">{fee ? `Due of ₹${fee.totalFee.toLocaleString()}` : ''}</span>
          </div>
          <span className="stat-subtitle">Paid: ₹{fee ? fee.paidAmount.toLocaleString() : '0'}</span>
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
          <button className="quick-action-card" onClick={() => handleQuickAction('/student/leave')}>
            <div className="qa-icon-wrapper blue"><Calendar size={20} /></div>
            <span>Apply Leave</span>
          </button>
          <button className="quick-action-card" onClick={() => handleQuickAction('/student/complaints')}>
            <div className="qa-icon-wrapper orange"><AlertTriangle size={20} /></div>
            <span>Submit Complaint</span>
          </button>
          <button className="quick-action-card" onClick={() => handleQuickAction('/student/room')}>
            <div className="qa-icon-wrapper purple"><DoorClosed size={20} /></div>
            <span>View Room</span>
          </button>
          <button className="quick-action-card" onClick={() => handleQuickAction('/student/fees')}>
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
        {fee && fee.pendingAmount > 0 ? (
          <div className="bento-card fee-alert-card">
            <div className="fee-header">
              <h2>Fee Alert</h2>
              <span className="urgent-badge">URGENT</span>
            </div>
            <p>Outstanding Mess/Hostel Fees for current semester.</p>
            <div className="fee-amount">₹{fee.pendingAmount.toLocaleString()}</div>
            <button className="pay-now-btn">Pay Now <CreditCard size={16} /></button>
            <Receipt size={120} className="watermark-icon" />
          </div>
        ) : (
          <div className="bento-card fee-alert-card" style={{ background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
            <div className="fee-header">
              <h2 style={{ color: '#166534' }}>Fee Status</h2>
              <span className="badge-success">Clear</span>
            </div>
            <p style={{ color: '#15803d' }}>No outstanding fees at the moment.</p>
            <div className="fee-amount" style={{ color: '#166534' }}>₹0</div>
            <CheckCircle2 size={120} className="watermark-icon" style={{ opacity: 0.1, color: '#166534' }} />
          </div>
        )}



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
