import React from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { Send, Paperclip } from 'lucide-react';
import './StudentPages.css';

export default function StudentComplaints() {
  return (
    <DashboardLayout>
      <div className="page-header">
        <h1>Complaints</h1>
        <p>Submit and track maintenance or general complaints.</p>
      </div>

      <div className="page-card">
        <h2>Submit a New Complaint</h2>
        <div className="form-grid">
          <div className="form-group">
            <label>Category</label>
            <select defaultValue="">
              <option value="" disabled>Select category</option>
              <option value="electrical">Electrical</option>
              <option value="plumbing">Plumbing</option>
              <option value="cleaning">Cleaning & Hygiene</option>
              <option value="internet">Internet/WiFi</option>
              <option value="furniture">Furniture</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="form-group">
            <label>Urgency Level</label>
            <select defaultValue="low">
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label>Description</label>
            <textarea rows="4" placeholder="Describe the issue in detail..."></textarea>
          </div>
        </div>
        
        <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button style={{ background: 'none', border: '1px dashed #c9c9d8', padding: '10px 16px', borderRadius: '8px', color: '#646473', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <Paperclip size={16} /> Attach Image (Optional)
          </button>
          <button className="btn-primary">
            <Send size={16} /> Submit Complaint
          </button>
        </div>
      </div>

      <div className="page-card">
        <h2>My Complaints</h2>
        <table className="custom-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '1px solid #eaeaef', color: '#646473', fontSize: '12px' }}>
              <th style={{ padding: '12px 8px' }}>TICKET ID</th>
              <th style={{ padding: '12px 8px' }}>CATEGORY</th>
              <th style={{ padding: '12px 8px' }}>DATE</th>
              <th style={{ padding: '12px 8px' }}>STATUS</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: '1px solid #f0f0f4' }}>
              <td style={{ padding: '16px 8px', fontSize: '14px', fontWeight: '500' }}>#CPL-1042</td>
              <td style={{ padding: '16px 8px', fontSize: '14px' }}>Electrical - Fan not working</td>
              <td style={{ padding: '16px 8px', fontSize: '14px', color: '#646473' }}>Today, 09:30 AM</td>
              <td style={{ padding: '16px 8px' }}><span style={{ backgroundColor: '#fff0e5', color: '#f97316', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: '600' }}>In Progress</span></td>
            </tr>
            <tr style={{ borderBottom: '1px solid #f0f0f4' }}>
              <td style={{ padding: '16px 8px', fontSize: '14px', fontWeight: '500' }}>#CPL-0988</td>
              <td style={{ padding: '16px 8px', fontSize: '14px' }}>Plumbing - Leaking tap</td>
              <td style={{ padding: '16px 8px', fontSize: '14px', color: '#646473' }}>12 Oct 2023</td>
              <td style={{ padding: '16px 8px' }}><span style={{ backgroundColor: '#f4f4f7', color: '#646473', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: '600' }}>Resolved</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
}
