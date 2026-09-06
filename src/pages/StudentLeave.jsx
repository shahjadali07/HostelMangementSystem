import React from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { Calendar, CheckCircle2, XCircle, Clock } from 'lucide-react';
import './StudentPages.css';

export default function StudentLeave() {
  return (
    <DashboardLayout>
      <div className="page-header">
        <h1>Leave Requests</h1>
        <p>Apply for outpass or home leaves and view history.</p>
      </div>

      <div className="page-card">
        <h2>Apply for Leave</h2>
        <div className="form-grid">
          <div className="form-group">
            <label>Leave Type</label>
            <select defaultValue="">
              <option value="" disabled>Select leave type</option>
              <option value="home">Home Leave</option>
              <option value="outpass">Day Outpass</option>
              <option value="medical">Medical Leave</option>
            </select>
          </div>
          <div className="form-group">
            <label>Destination (City/Place)</label>
            <input type="text" placeholder="Where are you going?" />
          </div>
          <div className="form-group">
            <label>Start Date</label>
            <input type="date" />
          </div>
          <div className="form-group">
            <label>End Date</label>
            <input type="date" />
          </div>
          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label>Reason</label>
            <textarea rows="3" placeholder="State the reason for leave..."></textarea>
          </div>
        </div>
        
        <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
          <button className="btn-primary">
            Submit Request
          </button>
        </div>
      </div>

      <div className="page-card">
        <h2>Leave History</h2>
        <table className="custom-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '1px solid #eaeaef', color: '#646473', fontSize: '12px' }}>
              <th style={{ padding: '12px 8px' }}>TYPE & REASON</th>
              <th style={{ padding: '12px 8px' }}>DATES</th>
              <th style={{ padding: '12px 8px' }}>STATUS</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: '1px solid #f0f0f4' }}>
              <td style={{ padding: '16px 8px', fontSize: '14px' }}>
                <div style={{ fontWeight: '500', color: '#1a1a24' }}>Diwali Break</div>
                <div style={{ fontSize: '12px', color: '#646473', marginTop: '4px' }}>Home Leave</div>
              </td>
              <td style={{ padding: '16px 8px', fontSize: '14px', color: '#646473' }}>10 Nov 2023 - 15 Nov 2023</td>
              <td style={{ padding: '16px 8px' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', backgroundColor: '#e5ffe8', color: '#22c55e', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: '600' }}>
                  <CheckCircle2 size={12} /> Approved
                </span>
              </td>
            </tr>
            <tr style={{ borderBottom: '1px solid #f0f0f4' }}>
              <td style={{ padding: '16px 8px', fontSize: '14px' }}>
                <div style={{ fontWeight: '500', color: '#1a1a24' }}>Cousin's Wedding</div>
                <div style={{ fontSize: '12px', color: '#646473', marginTop: '4px' }}>Home Leave</div>
              </td>
              <td style={{ padding: '16px 8px', fontSize: '14px', color: '#646473' }}>05 Oct 2023 - 08 Oct 2023</td>
              <td style={{ padding: '16px 8px' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', backgroundColor: '#ffe5e5', color: '#ef4444', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: '600' }}>
                  <XCircle size={12} /> Rejected
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
}
