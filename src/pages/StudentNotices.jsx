import React, { useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { AlertTriangle, Info, Wrench, Utensils, BookOpen, Clock } from 'lucide-react';
import './StudentPages.css';

export default function StudentNotices() {
  const [activeTab, setActiveTab] = useState('All');
  
  const categories = ['All', 'General', 'Hostel', 'Mess', 'Maintenance', 'Emergency', 'Academic'];
  
  return (
    <DashboardLayout>
      <div className="page-header">
        <h1>Notice Board</h1>
        <p>Stay updated with official announcements and alerts.</p>
      </div>

      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '16px', marginBottom: '8px' }}>
        {categories.map(cat => (
          <button 
            key={cat}
            onClick={() => setActiveTab(cat)}
            style={{ 
              padding: '8px 16px', 
              borderRadius: '20px', 
              border: activeTab === cat ? 'none' : '1px solid #eaeaef',
              backgroundColor: activeTab === cat ? '#1a1a24' : '#fff',
              color: activeTab === cat ? '#fff' : '#646473',
              fontSize: '13px',
              fontWeight: '500',
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div className="page-card" style={{ marginBottom: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: '#fff0e5', color: '#f97316', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Clock size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1a1a24' }}>Hostel Timing Update</h3>
                <span style={{ fontSize: '12px', color: '#8c8c9a' }}>Hostel • Today, 10:00 AM</span>
              </div>
            </div>
            <span style={{ backgroundColor: '#e5edff', color: '#3b82f6', fontSize: '11px', fontWeight: '600', padding: '2px 8px', borderRadius: '12px' }}>New</span>
          </div>
          <p style={{ color: '#505060', fontSize: '14px', lineHeight: '1.6' }}>
            Curfew timings for weekends have been extended to 10:30 PM effective immediately. Students are required to scan their ID cards at the main gate before the deadline.
          </p>
        </div>

        <div className="page-card" style={{ marginBottom: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: '#f3e5ff', color: '#a855f7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Wrench size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1a1a24' }}>Maintenance Drive</h3>
                <span style={{ fontSize: '12px', color: '#8c8c9a' }}>Maintenance • Yesterday, 04:30 PM</span>
              </div>
            </div>
          </div>
          <p style={{ color: '#505060', fontSize: '14px', lineHeight: '1.6' }}>
            Routine AC maintenance will be conducted in Block A tomorrow from 10 AM to 2 PM. Please ensure your rooms are accessible during this time.
          </p>
        </div>
        
        <div className="page-card" style={{ marginBottom: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: '#ffe5e5', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <AlertTriangle size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1a1a24' }}>Water Supply Interruption</h3>
                <span style={{ fontSize: '12px', color: '#8c8c9a' }}>Emergency • 15 Oct, 09:00 AM</span>
              </div>
            </div>
          </div>
          <p style={{ color: '#505060', fontSize: '14px', lineHeight: '1.6' }}>
            Due to emergency pipe repair, water supply to Block A & B will be interrupted today from 2 PM to 5 PM. Inconvenience is regretted.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
