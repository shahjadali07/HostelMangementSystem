import React from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { useApp } from '../context/AppContext';
import {
  Building2, DollarSign, Activity, Users, ShieldCheck,
  FileText, LayoutGrid, BedDouble, AlertCircle, 
  UserSquare, CalendarClock, PieChart, Bell, ChevronRight
} from 'lucide-react';
import './AdminDashboard.css';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { getNewApplicationsCount, wardens } = useApp();
  
  const newAppCount = getNewApplicationsCount();
  const totalWardens = wardens ? wardens.filter(w => w.status === 'ACTIVE').length : 0;

  const MANAGEMENT_MODULES = [
    { id: 'students', title: 'Students', icon: Users, desc: 'Manage 1,084 active students', color: 'blue' },
    { id: 'applications', title: 'New Applications', icon: FileText, desc: `${newAppCount} pending hostel forms`, color: 'orange', path: '/admin/applications' },
    { id: 'wardens', title: 'Wardens', icon: ShieldCheck, desc: `${totalWardens} active wardens assigned`, color: 'purple', path: '/admin/wardens' },
    { id: 'rooms', title: 'Rooms', icon: BedDouble, desc: 'Manage room allocations', color: 'green' },
    { id: 'blocks', title: 'Blocks', icon: LayoutGrid, desc: 'Configure hostel blocks', color: 'indigo' },
    { id: 'fees', title: 'Hostel Fees', icon: DollarSign, desc: 'Track payments & dues', color: 'emerald' },
    { id: 'complaints', title: 'Complaints', icon: AlertCircle, desc: '3 unresolved issues', color: 'red' },
    { id: 'visitors', title: 'Visitors', icon: UserSquare, desc: 'Track guest entries', color: 'teal' },
    { id: 'leave', title: 'Leave Applications', icon: CalendarClock, desc: '5 pending requests', color: 'amber' },
    { id: 'analytics', title: 'Analytics', icon: PieChart, desc: 'View system reports', color: 'fuchsia' },
    { id: 'notifications', title: 'Notifications', icon: Bell, desc: 'Send announcements', color: 'rose' },
  ];

  return (
    <DashboardLayout>
      <div className="welcome-section">
        <h1>Good Morning, Admin 👋</h1>
        <p>Here is your system-wide overview for today.</p>
      </div>

      {/* Stats Row (Kept for high-level overview) */}
      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-icon-wrapper blue">
            <Building2 size={20} />
          </div>
          <div className="stat-details">
            <span className="stat-title">TOTAL CAPACITY</span>
            <span className="stat-value">1,200</span>
            <span className="stat-subtitle">Beds</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper green">
            <DollarSign size={20} />
          </div>
          <div className="stat-details">
            <span className="stat-title">MONTHLY REVENUE</span>
            <span className="stat-value">₹1.45L</span>
            <span className="stat-subtitle blue-text">↑ 8% vs last month</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper purple">
            <Users size={20} />
          </div>
          <div className="stat-details">
            <span className="stat-title">ACTIVE STUDENTS</span>
            <span className="stat-value">1,084</span>
            <span className="stat-subtitle">of 1,200 capacity</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper orange">
            <Activity size={20} />
          </div>
          <div className="stat-details">
            <span className="stat-title">SYSTEM HEALTH</span>
            <span className="stat-value">99.9%</span>
            <span className="stat-subtitle blue-text">Uptime</span>
          </div>
        </div>
      </div>

      {/* Control Center - Management Grid */}
      <div className="control-center-header">
        <h2>System Management</h2>
        <p>Full control over hostel modules and resources</p>
      </div>
      
      <div className="management-grid">
        {MANAGEMENT_MODULES.map(mod => (
          <div className="module-card" key={mod.id}>
            <div className="module-card-content">
              <div className={`module-icon-wrapper ${mod.color}`}>
                <mod.icon size={22} />
              </div>
              <div className="module-text">
                <h3>{mod.title}</h3>
                <p>{mod.desc}</p>
              </div>
            </div>
            <button className="module-btn" onClick={() => {
              if (mod.path) {
                if (mod.id === 'wardens') {
                  window.open(mod.path, '_blank', 'noopener,noreferrer');
                } else {
                  navigate(mod.path);
                }
              }
            }}>
              Manage <ChevronRight size={16} />
            </button>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}
