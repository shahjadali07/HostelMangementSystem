import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { ArrowLeft, User, Plus, Building, ShieldCheck } from 'lucide-react';
import { WardenCard, WardenModal } from './AdminWardens';
import { useApp } from '../context/AppContext';
import './AdminWardens.css';

export default function HostelWardenManagementPage() {
  const { hostelId } = useParams();
  const navigate = useNavigate();
  const { addWarden } = useApp();

  const [hostel, setHostel] = useState(null);
  const [wardens, setWardens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const fetchHostelData = async () => {
    try {
      setLoading(true);
      
      // Fetch hostels
      const hostelsRes = await fetch('/api/hostels');
      const allHostels = await hostelsRes.json();
      const foundHostel = allHostels.find(h => h._id === hostelId || h.id === hostelId);
      
      if (!foundHostel) {
        setError('Hostel not found');
        setLoading(false);
        return;
      }

      // Fetch wardens
      const wardensRes = await fetch('/api/admin/wardens');
      const allWardens = await wardensRes.json();
      
      const hostelWardens = allWardens.filter(w => 
        w.hostelId === hostelId || 
        w.hostelId === foundHostel.name || 
        w.hostelId === foundHostel._id?.toString()
      ).map(w => ({
        ...w,
        hostel: { name: foundHostel.name, id: foundHostel._id?.toString() || foundHostel.id }
      }));

      setHostel(foundHostel);
      setWardens(hostelWardens);
      document.title = `${foundHostel.name} | Hostel Management System`;
    } catch (err) {
      console.error(err);
      setError('An error occurred while fetching hostel details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHostelData();
  }, [hostelId]);

  const handleManage = (wardenId) => {
    navigate(`/warden?id=${wardenId}`);
  };

  const handleAddWarden = async (formData) => {
    // Add logic here to add a warden for this hostel
    const result = await addWarden({ ...formData, hostelId: hostel._id || hostelId });
    if (result.success) {
      setShowAddModal(false);
      fetchHostelData();
    } else {
      alert(result.error);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div style={{ padding: '2rem', textAlign: 'center' }}>Loading Hostel Data...</div>
      </DashboardLayout>
    );
  }

  if (error || !hostel) {
    return (
      <DashboardLayout>
        <div style={{ padding: '2rem' }}>
          <button onClick={() => navigate('/admin/wardens')} className="wca-btn" style={{ marginBottom: '1rem', background: '#e2e8f0', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer' }}>
            <ArrowLeft size={16} style={{ display: 'inline', verticalAlign: 'middle' }} /> Back to Warden Management
          </button>
          <div style={{ color: 'red', textAlign: 'center', marginTop: '2rem' }}>
            <h2>Error / Not Found</h2>
            <p>{error || 'Hostel not found'}</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Only active wardens
  const activeWardens = wardens.filter(w => w.status !== 'DELETED');
  const activeCount = activeWardens.filter(w => w.status === 'ACTIVE').length;

  return (
    <DashboardLayout>
      <div style={{ padding: '1rem 2rem' }}>
        <button onClick={() => navigate('/admin/wardens')} className="wca-btn" style={{ marginBottom: '1.5rem', background: '#e2e8f0', color: '#0f172a', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold' }}>
          <ArrowLeft size={16} /> Back to Warden Management
        </button>

        <h1 style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ShieldCheck size={24} style={{ color: '#4338ca' }} /> Warden Management
        </h1>
        <p style={{ color: '#64748b', marginBottom: '2rem' }}>Selected hostel: <strong>{hostel.name}</strong></p>

        {/* Hostel Info */}
        <div className="warden-card" style={{ padding: '1.5rem', marginBottom: '2rem', display: 'flex', gap: '2rem', alignItems: 'center' }}>
          <Building size={48} style={{ color: '#6366f1' }} />
          <div>
            <h2 style={{ margin: '0 0 0.5rem 0' }}>{hostel.name}</h2>
            <div style={{ display: 'flex', gap: '1.5rem', color: '#64748b' }}>
              <span><strong>{hostel.students || 0}</strong> Students</span>
              <span>Capacity: <strong>{hostel.capacity}</strong></span>
              <span>Wardens: <strong>{activeCount}/2</strong> Active</span>
            </div>
          </div>
        </div>

        {/* Wardens List */}
        <div className="warden-hostel-panel" style={{ marginTop: '0', background: 'transparent', padding: '0', border: 'none' }}>
          <div className="whp-header" style={{ marginBottom: '1rem' }}>
            <h2>Wardens</h2>
            <button
              className="add-warden-btn"
              onClick={() => { if (activeCount < 2) setShowAddModal(true); }}
              disabled={activeCount >= 2}
              title={activeCount >= 2 ? 'Maximum 2 wardens can be assigned to this hostel.' : ''}
            >
              <Plus size={16} /> Add Warden
            </button>
          </div>
          
          <hr style={{ border: 'none', borderBottom: '1px solid #e2e8f0', marginBottom: '1.5rem' }} />

          {activeWardens.length === 0 ? (
            <div className="warden-empty-state" style={{ background: '#fff', borderRadius: '8px', padding: '3rem 1rem' }}>
              <User size={40} />
              <h3>No active wardens</h3>
              <p>This hostel currently has no active wardens.</p>
              <button className="add-warden-btn" onClick={() => setShowAddModal(true)}><Plus size={16} /> Add Warden</button>
            </div>
          ) : (
            <div className="warden-cards-grid">
              {activeWardens.map(w => (
                <WardenCard
                  key={w.id}
                  warden={w}
                  onManage={handleManage}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {showAddModal && (
        <WardenModal
          defaultHostelId={hostel._id || hostelId}
          fixedHostel={hostel}
          onClose={() => setShowAddModal(false)}
          onSave={handleAddWarden}
        />
      )}
    </DashboardLayout>
  );
}
