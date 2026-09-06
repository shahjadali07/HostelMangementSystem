import React from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { DoorClosed, User, Calendar } from 'lucide-react';
import './StudentPages.css';

export default function StudentRoom() {
  return (
    <DashboardLayout>
      <div className="page-header">
        <h1>My Room</h1>
        <p>Details about your current room allocation.</p>
      </div>

      <div className="page-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
          <div style={{ padding: '16px', backgroundColor: '#f4f4f7', borderRadius: '12px', color: '#505060' }}>
            <DoorClosed size={48} />
          </div>
          <div>
            <h2 style={{ marginBottom: '4px', border: 'none', padding: 0 }}>Room A-204</h2>
            <span style={{ backgroundColor: '#e5ffe8', color: '#22c55e', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: '600' }}>Occupied</span>
          </div>
        </div>

        <div className="detail-list">
          <div className="detail-item">
            <span className="detail-label">Hostel</span>
            <span className="detail-value">Boys Hostel Main</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Block</span>
            <span className="detail-value">Block A (North Wing)</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Floor</span>
            <span className="detail-value">2nd Floor</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Room Type</span>
            <span className="detail-value">2 Seater Non-AC</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Bed Number</span>
            <span className="detail-value">Bed 2</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Allocation Date</span>
            <span className="detail-value">01 Aug 2023</span>
          </div>
        </div>
      </div>

      <div className="page-card">
        <h2>Roommates</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', border: '1px solid #eaeaef', borderRadius: '8px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#e5edff', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <User size={20} />
          </div>
          <div>
            <p style={{ fontWeight: '600', color: '#1a1a24', fontSize: '14px' }}>Alex Johnson</p>
            <p style={{ color: '#646473', fontSize: '12px' }}>Bed 1 • 3rd Year B.Tech</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
