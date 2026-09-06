import React from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { Save, Key, Bell, Shield } from 'lucide-react';
import './StudentPages.css';

export default function StudentSettings() {
  return (
    <DashboardLayout>
      <div className="page-header">
        <h1>Settings</h1>
        <p>Manage your account settings and preferences.</p>
      </div>

      <div className="page-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <Key size={20} color="#5142f5" />
          <h2 style={{ border: 'none', padding: 0, margin: 0 }}>Change Password</h2>
        </div>
        
        <div className="form-grid">
          <div className="form-group">
            <label>Current Password</label>
            <input type="password" placeholder="Enter current password" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', gridColumn: '1 / -1' }}>
            <div className="form-group">
              <label>New Password</label>
              <input type="password" placeholder="Enter new password" />
            </div>
            <div className="form-group">
              <label>Confirm New Password</label>
              <input type="password" placeholder="Confirm new password" />
            </div>
          </div>
        </div>
        
        <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
          <button className="btn-primary">
            Update Password
          </button>
        </div>
      </div>

      <div className="page-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <Bell size={20} color="#5142f5" />
          <h2 style={{ border: 'none', padding: 0, margin: 0 }}>Notification Preferences</h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
            <input type="checkbox" defaultChecked style={{ width: '18px', height: '18px', accentColor: '#5142f5' }} />
            <div>
              <p style={{ fontWeight: '600', color: '#1a1a24', fontSize: '14px' }}>Email Notifications</p>
              <p style={{ color: '#646473', fontSize: '13px' }}>Receive updates about fees and complaints via email.</p>
            </div>
          </label>
          
          <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
            <input type="checkbox" defaultChecked style={{ width: '18px', height: '18px', accentColor: '#5142f5' }} />
            <div>
              <p style={{ fontWeight: '600', color: '#1a1a24', fontSize: '14px' }}>SMS Alerts</p>
              <p style={{ color: '#646473', fontSize: '13px' }}>Get urgent notices and leave approvals via SMS.</p>
            </div>
          </label>
        </div>
      </div>

      <div className="page-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <Shield size={20} color="#5142f5" />
          <h2 style={{ border: 'none', padding: 0, margin: 0 }}>Account Settings</h2>
        </div>
        <p style={{ color: '#646473', fontSize: '14px', marginBottom: '16px' }}>
          If you need to change your primary registered email or phone number, please contact the hostel administration office.
        </p>
        <button style={{ backgroundColor: '#fff0e5', color: '#f97316', border: '1px solid #ffedd5', padding: '10px 20px', borderRadius: '8px', fontWeight: '600', fontSize: '14px', cursor: 'pointer' }}>
          Contact Administration
        </button>
      </div>
    </DashboardLayout>
  );
}
