import React from 'react';
import DashboardLayout from '../components/DashboardLayout';
import './StudentPages.css';

export default function StudentAttendance() {
  return (
    <DashboardLayout>
      <div className="page-header">
        <h1>Attendance</h1>
        <p>Track your hostel in/out and overall attendance records.</p>
      </div>

      <div className="form-grid" style={{ marginBottom: '24px' }}>
        <div className="page-card" style={{ marginBottom: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1a1a24' }}>Overall Attendance</h3>
            <span style={{ backgroundColor: '#e5ffe8', color: '#22c55e', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: '600' }}>Good Standing</span>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <div className="progress-circle" style={{ width: '120px', height: '120px' }}>
              <svg viewBox="0 0 36 36" className="circular-chart">
                <path className="circle-bg"
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                  stroke="#eaeaef" strokeWidth="3" fill="none"
                />
                <path className="circle"
                  strokeDasharray="92, 100"
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                  stroke="#22c55e" strokeWidth="3" fill="none" strokeLinecap="round"
                />
                <text x="18" y="20.35" fill="#1a1a24" fontSize="8" fontWeight="bold" textAnchor="middle">92%</text>
              </svg>
            </div>
            
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <span style={{ fontSize: '13px', color: '#646473' }}>Total Days</span>
                <p style={{ fontSize: '18px', fontWeight: '600', color: '#1a1a24' }}>50</p>
              </div>
              <div style={{ display: 'flex', gap: '20px' }}>
                <div>
                  <span style={{ fontSize: '13px', color: '#646473' }}>Present</span>
                  <p style={{ fontSize: '18px', fontWeight: '600', color: '#22c55e' }}>45</p>
                </div>
                <div>
                  <span style={{ fontSize: '13px', color: '#646473' }}>Absent</span>
                  <p style={{ fontSize: '18px', fontWeight: '600', color: '#ef4444' }}>5</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="page-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2>Recent Logs</h2>
          <select style={{ padding: '6px 12px', border: '1px solid #eaeaef', borderRadius: '6px', outline: 'none' }}>
            <option>This Month</option>
            <option>Last Month</option>
          </select>
        </div>
        
        <table className="custom-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '1px solid #eaeaef', color: '#646473', fontSize: '12px' }}>
              <th style={{ padding: '12px 8px' }}>DATE</th>
              <th style={{ padding: '12px 8px' }}>STATUS</th>
              <th style={{ padding: '12px 8px' }}>IN TIME</th>
              <th style={{ padding: '12px 8px' }}>OUT TIME</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: '1px solid #f0f0f4' }}>
              <td style={{ padding: '16px 8px', fontSize: '14px', fontWeight: '500' }}>Today, 24 Oct</td>
              <td style={{ padding: '16px 8px' }}><span style={{ backgroundColor: '#e5ffe8', color: '#22c55e', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: '600' }}>Present</span></td>
              <td style={{ padding: '16px 8px', fontSize: '14px', color: '#646473' }}>08:15 AM</td>
              <td style={{ padding: '16px 8px', fontSize: '14px', color: '#646473' }}>--</td>
            </tr>
            <tr style={{ borderBottom: '1px solid #f0f0f4' }}>
              <td style={{ padding: '16px 8px', fontSize: '14px', fontWeight: '500' }}>Yesterday, 23 Oct</td>
              <td style={{ padding: '16px 8px' }}><span style={{ backgroundColor: '#e5ffe8', color: '#22c55e', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: '600' }}>Present</span></td>
              <td style={{ padding: '16px 8px', fontSize: '14px', color: '#646473' }}>08:30 AM</td>
              <td style={{ padding: '16px 8px', fontSize: '14px', color: '#646473' }}>09:15 PM</td>
            </tr>
            <tr style={{ borderBottom: '1px solid #f0f0f4' }}>
              <td style={{ padding: '16px 8px', fontSize: '14px', fontWeight: '500' }}>22 Oct</td>
              <td style={{ padding: '16px 8px' }}><span style={{ backgroundColor: '#ffe5e5', color: '#ef4444', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: '600' }}>Absent</span></td>
              <td style={{ padding: '16px 8px', fontSize: '14px', color: '#646473' }}>--</td>
              <td style={{ padding: '16px 8px', fontSize: '14px', color: '#646473' }}>--</td>
            </tr>
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
}
