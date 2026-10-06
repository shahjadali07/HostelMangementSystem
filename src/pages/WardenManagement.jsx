import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { HOSTELS } from '../context/AppContext';
import {
  ArrowLeft, User, Mail, Phone, Shield, Building, Key,
  Trash2, Edit2, CheckCircle, XCircle, Power
} from 'lucide-react';
import { WardenModal } from './AdminWardens';
import './AdminWardens.css';

export default function WardenManagement() {
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');
  const navigate = useNavigate();

  const [warden, setWarden] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const fetchWarden = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch all wardens instead of using the new /wardens/:id endpoint 
      // (to avoid requiring a backend restart)
      const res = await fetch('/api/admin/wardens');
      const allWardens = await res.json();
      const foundWarden = allWardens.find(w => w.id === id || w._id === id);

      if (foundWarden) {
        // Fetch hostels to attach hostel data
        const hostelsRes = await fetch('/api/hostels');
        const allHostels = await hostelsRes.json();
        const foundHostel = allHostels.find(h => h._id === foundWarden.hostelId || h.id === foundWarden.hostelId || h.name === foundWarden.hostelId);
        
        foundWarden.name = foundWarden.fullName;
        
        foundWarden.hostel = foundHostel ? {
          _id: foundHostel._id,
          name: foundHostel.name,
          type: foundHostel.category,
          capacity: foundHostel.capacity,
          occupied: foundHostel.occupied
        } : { name: foundWarden.hostelId || 'Unknown' };

        setWarden(foundWarden);
        document.title = `Warden — ${foundWarden.name} | Hostel Management System`;
      } else {
        setError('Warden not found');
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred while fetching warden details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchWarden();
    } else {
      setError('No warden ID provided.');
      setLoading(false);
    }
  }, [id]);

  const toggleStatus = async () => {
    try {
      const newStatus = warden.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      const res = await fetch(`/api/admin/wardens/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        setWarden({ ...warden, status: newStatus });
      } else {
        alert(data.message || 'Failed to update status');
      }
    } catch (err) {
      alert('Error updating status');
    }
  };

  const deleteWarden = async () => {
    if (!window.confirm('Are you sure you want to delete this warden?')) return;
    try {
      const res = await fetch(`/api/admin/wardens/${id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        navigate('/admin/wardens');
      } else {
        alert(data.message || 'Failed to delete warden');
      }
    } catch (err) {
      alert('Error deleting warden');
    }
  };

  const handleEditSave = async (formData) => {
    try {
      const res = await fetch(`/api/admin/wardens/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        setShowEditModal(false);
        fetchWarden(); // Refresh data to get correct hostel name and other fields
      } else {
        alert(data.message || 'Failed to update warden');
      }
    } catch (err) {
      alert('Error updating warden');
    }
  };

  const editWarden = () => {
    setShowEditModal(true);
  };

  const resetPassword = async () => {
    const newPassword = prompt('Enter new password (min 6 chars):');
    if (!newPassword) return;
    if (newPassword.length < 6) return alert('Password too short');

    try {
      const res = await fetch(`/api/admin/wardens/${id}/password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword })
      });
      const data = await res.json();
      if (data.success) {
        alert('Password reset successfully!');
      } else {
        alert(data.message || 'Failed to reset password');
      }
    } catch (err) {
      alert('Error resetting password');
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div style={{ padding: '2rem', textAlign: 'center' }}>Loading Warden Data...</div>
      </DashboardLayout>
    );
  }

  if (error || !warden) {
    return (
      <DashboardLayout>
        <div style={{ padding: '2rem' }}>
          <button onClick={() => navigate('/admin/wardens')} className="wca-btn" style={{ marginBottom: '1rem', background: '#e2e8f0', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer' }}>
            <ArrowLeft size={16} style={{ display: 'inline', verticalAlign: 'middle' }} /> Back to Dashboard
          </button>
          <div style={{ color: 'red', textAlign: 'center', marginTop: '2rem' }}>
            <h2>Error / Not Found</h2>
            <p>{error || 'Warden not found'}</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="warden-management-page" style={{ padding: '1rem 2rem' }}>
        <button onClick={() => navigate('/admin/wardens')} className="wca-btn" style={{ marginBottom: '1.5rem', background: '#e2e8f0', color: '#0f172a', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold' }}>
          <ArrowLeft size={16} /> Back to Wardens
        </button>

        <h1 style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Shield size={24} style={{ color: '#4338ca' }} /> Warden Management
        </h1>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          
          {/* Profile Card */}
          <div className="warden-card" style={{ padding: '1.5rem' }}>
            <h2 style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem', marginBottom: '1rem' }}>Warden Profile</h2>
            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
              <div style={{ width: 80, height: 80, borderRadius: '50%', backgroundColor: '#6366f1', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 'bold' }}>
                {warden.name ? warden.name.charAt(0) : 'W'}
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '1.5rem', margin: '0 0 0.5rem 0' }}>{warden.name}</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', marginBottom: '0.5rem' }}>
                  <Mail size={16} /> {warden.email}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', marginBottom: '0.5rem' }}>
                  <Phone size={16} /> {warden.phone}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', marginBottom: '0.5rem' }}>
                  <User size={16} /> ID: {warden.employeeId}
                </div>
                <div style={{ marginTop: '1rem' }}>
                  <span className={`warden-badge ${warden.status === 'ACTIVE' ? 'warden-badge-active' : 'warden-badge-inactive'}`}>
                    {warden.status}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Assigned Hostel Card */}
          <div className="warden-card" style={{ padding: '1.5rem' }}>
            <h2 style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem', marginBottom: '1rem' }}>Assigned Hostel</h2>
            {warden.hostel && warden.hostel.name !== 'Unknown' ? (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                  <Building size={40} style={{ color: '#4338ca' }} />
                  <div>
                    <h3 style={{ margin: '0 0 0.25rem 0' }}>{warden.hostel.name}</h3>
                    <p style={{ margin: 0, color: '#64748b' }}>{warden.hostel.type} Hostel</p>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1.5rem' }}>
                  <div style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '8px', textAlign: 'center' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{warden.hostel.capacity}</div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase' }}>Capacity</div>
                  </div>
                  <div style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '8px', textAlign: 'center' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{warden.hostel.occupied || 0}</div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase' }}>Occupied</div>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ color: '#64748b', fontStyle: 'italic', padding: '1rem 0' }}>No hostel assigned or hostel not found.</div>
            )}
          </div>

          {/* Warden Information */}
          <div className="warden-card" style={{ padding: '1.5rem' }}>
            <h2 style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem', marginBottom: '1rem' }}>Warden Information</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Designation</span>
                <strong>{warden.designation || 'N/A'}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Position</span>
                <strong>{warden.position === 'WARDEN_1' ? 'Warden 1' : warden.position === 'WARDEN_2' ? 'Warden 2' : warden.position}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Created Date</span>
                <strong>{new Date(warden.createdAt).toLocaleDateString()}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Last Updated</span>
                <strong>{new Date(warden.updatedAt || warden.createdAt).toLocaleDateString()}</strong>
              </div>
            </div>
          </div>

          {/* Management Actions */}
          <div className="warden-card" style={{ padding: '1.5rem' }}>
            <h2 style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem', marginBottom: '1rem' }}>Actions</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <button onClick={editWarden} style={{ padding: '0.75rem 1rem', background: '#e0e7ff', color: '#4338ca', border: '1px solid #c7d2fe', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold' }}>
                <Edit2 size={18} /> Edit Warden
              </button>

              <button onClick={toggleStatus} style={{ padding: '0.75rem 1rem', background: warden.status === 'ACTIVE' ? '#fffbeb' : '#f0fdf4', color: warden.status === 'ACTIVE' ? '#b45309' : '#16a34a', border: '1px solid ' + (warden.status === 'ACTIVE' ? '#fcd34d' : '#bbf7d0'), borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold' }}>
                <Power size={18} /> {warden.status === 'ACTIVE' ? 'Deactivate Warden' : 'Activate Warden'}
              </button>

              <button onClick={resetPassword} style={{ padding: '0.75rem 1rem', background: '#f1f5f9', color: '#0f172a', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold' }}>
                <Key size={18} /> Reset Password
              </button>

              <button onClick={deleteWarden} style={{ padding: '0.75rem 1rem', background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold' }}>
                <Trash2 size={18} /> Delete Warden
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {showEditModal && (
        <WardenModal 
          initialData={{
            id: warden._id,
            fullName: warden.name,
            email: warden.email,
            phone: warden.phone,
            employeeId: warden.employeeId,
            designation: warden.designation,
            hostelId: warden.hostel?._id,
            position: warden.position,
            status: warden.status
          }}
          onClose={() => setShowEditModal(false)}
          onSave={handleEditSave}
        />
      )}
    </DashboardLayout>
  );
}
