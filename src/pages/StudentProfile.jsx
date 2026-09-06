import React from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { Save } from 'lucide-react';
import './StudentPages.css';

export default function StudentProfile() {
  return (
    <DashboardLayout>
      <div className="page-header">
        <h1>My Profile</h1>
        <p>Manage your personal and academic information.</p>
      </div>

      <div className="page-card">
        <div className="profile-photo-container">
          <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="Student Profile" className="profile-photo" />
          <button className="change-photo-btn">Change Photo</button>
        </div>

        <h2>Personal Details</h2>
        <div className="form-grid">
          <div className="form-group">
            <label>Full Name</label>
            <input type="text" defaultValue="John Doe" disabled />
          </div>
          <div className="form-group">
            <label>Student ID</label>
            <input type="text" defaultValue="STU2023001" disabled />
          </div>
          <div className="form-group">
            <label>Email Address</label>
            <input type="email" defaultValue="john.doe@university.edu" />
          </div>
          <div className="form-group">
            <label>Phone Number</label>
            <input type="tel" defaultValue="+91 9876543210" />
          </div>
        </div>
      </div>

      <div className="page-card">
        <h2>Academic Details</h2>
        <div className="form-grid">
          <div className="form-group">
            <label>Course</label>
            <input type="text" defaultValue="B.Tech Computer Science" disabled />
          </div>
          <div className="form-group">
            <label>Year of Study</label>
            <input type="text" defaultValue="3rd Year" disabled />
          </div>
        </div>
      </div>

      <div className="page-card">
        <h2>Emergency Contact</h2>
        <div className="form-grid">
          <div className="form-group">
            <label>Guardian Name</label>
            <input type="text" placeholder="Enter guardian name" />
          </div>
          <div className="form-group">
            <label>Guardian Contact</label>
            <input type="tel" placeholder="Enter guardian contact" />
          </div>
          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label>Home Address</label>
            <textarea rows="3" placeholder="Enter full home address"></textarea>
          </div>
        </div>
        
        <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
          <button className="btn-primary">
            <Save size={16} /> Save Changes
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
