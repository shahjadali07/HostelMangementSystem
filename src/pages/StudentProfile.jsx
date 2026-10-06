import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { User, Book, ClipboardList, Home } from 'lucide-react';
import './StudentPages.css';

export default function StudentProfile() {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/student/profile', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('studentToken') || localStorage.getItem('token')}`
        }
      });
      const data = await res.json();
      if (data.code === 'HOSTEL_REGISTRATION_REQUIRED') {
        window.location.href = '/student/register';
        return;
      }
      if (data.success) {
        setProfileData(data);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <DashboardLayout><div>Loading Profile...</div></DashboardLayout>;
  }

  const { user, application, allocation } = profileData || {};

  const approvedStatuses = ['APPROVED', 'ASSIGNED TO WARDEN', 'FORWARDED_TO_WARDEN', 'BED_ALLOCATION_PENDING', 'BED_ALLOCATED'];
  const isApproved = application && approvedStatuses.includes(application.status);
  const hasAllocation = !!allocation;

  return (
    <DashboardLayout applicationStatus={application?.status} hasAllocation={hasAllocation}>
      <div className="page-header">
        <h1>My Profile & Application</h1>
        <p>View your personal, academic, and hostel application information.</p>
      </div>

      <div className="page-card">
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><User size={20} /> Personal Details</h2>
        <div className="form-grid">
          <div className="form-group">
            <label>Full Name</label>
            <input type="text" value={user?.fullName || ''} disabled />
          </div>
          <div className="form-group">
            <label>Email Address</label>
            <input type="email" value={user?.email || ''} disabled />
          </div>
          <div className="form-group">
            <label>Phone Number</label>
            <input type="tel" value={user?.phone || ''} disabled />
          </div>
          <div className="form-group">
            <label>Account Status</label>
            <input type="text" value={user?.accountStatus || 'Pending'} disabled />
          </div>
        </div>
      </div>

      <div className="page-card">
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Book size={20} /> Academic Details</h2>
        {application ? (
          <div className="form-grid">
            <div className="form-group">
              <label>Application Number (HMS)</label>
              <input type="text" value={application.id || ''} disabled />
            </div>
            <div className="form-group">
              <label>Roll / Enrollment Number</label>
              <input type="text" value={application.enrollmentNo || application.jeeApplicationNo || application.cuetApplicationNo || ''} disabled />
            </div>
            <div className="form-group">
              <label>Department</label>
              <input type="text" value={application.department || ''} disabled />
            </div>
            <div className="form-group">
              <label>Year of Study</label>
              <input type="text" value={application.year || ''} disabled />
            </div>
          </div>
        ) : (
          <div style={{ color: '#666', padding: '16px 0' }}>No academic application details found.</div>
        )}
      </div>

      <div className="page-card">
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><ClipboardList size={20} /> Application Status</h2>
        {application ? (
          <div className="form-grid">
            <div className="form-group">
              <label>Status</label>
              <div style={{ padding: '10px 14px', borderRadius: '6px', fontWeight: 600, border: '1px solid #e2e8f0', backgroundColor: isApproved ? '#dcfce7' : application.status === 'REJECTED' ? '#fee2e2' : '#fef9c3', color: isApproved ? '#166534' : application.status === 'REJECTED' ? '#991b1b' : '#854d0e' }}>
                {application.status}
              </div>
            </div>
            <div className="form-group">
              <label>Submitted On</label>
              <input type="text" value={new Date(application.submittedAt).toLocaleDateString()} disabled />
            </div>
            {(application.reviewedDate || application.assignedAt) && (
              <div className="form-group">
                <label>{application.status === 'APPROVED' ? 'Approved On' : 'Reviewed On'}</label>
                <input type="text" value={new Date(application.reviewedDate || application.assignedAt).toLocaleDateString()} disabled />
              </div>
            )}
            {application.rejectionReason && application.status === 'REJECTED' && (
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label>Rejection Reason</label>
                <textarea rows="2" value={application.rejectionReason} disabled style={{ backgroundColor: '#fff5f5', color: '#c53030' }}></textarea>
              </div>
            )}
          </div>
        ) : (
          <div style={{ color: '#666', padding: '16px 0' }}>No application submitted yet.</div>
        )}
      </div>

      <div className="page-card">
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Home size={20} /> Hostel Allocation</h2>
        {allocation ? (
          <div className="form-grid">
            <div className="form-group">
              <label>Hostel Name</label>
              <input type="text" value={allocation.hostelName || ''} disabled />
            </div>
            <div className="form-group">
              <label>Block / Floor</label>
              <input type="text" value={`${allocation.block || '-'} / ${allocation.floor || '-'}`} disabled />
            </div>
            <div className="form-group">
              <label>Room Number</label>
              <input type="text" value={allocation.roomNumber || ''} disabled />
            </div>
            <div className="form-group">
              <label>Bed Number</label>
              <input type="text" value={allocation.bed || ''} disabled />
            </div>
          </div>
        ) : (
          <div style={{ backgroundColor: '#f8fafc', padding: '24px', borderRadius: '8px', border: '1px dashed #cbd5e1', textAlign: 'center' }}>
            <h3 style={{ color: '#475569', margin: '0 0 8px 0' }}>Not Allocated Yet</h3>
            {isApproved 
              ? <p style={{ color: '#64748b', margin: 0 }}>Your application has been approved. Hostel and room details will appear here once a room is allocated by the warden.</p>
              : <p style={{ color: '#64748b', margin: 0 }}>Room allocation will be processed after your application is approved.</p>
            }
          </div>
        )}
      </div>

    </DashboardLayout>
  );
}
