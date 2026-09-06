import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LogOut, User, LayoutDashboard, Users, DoorClosed, 
  FileText, CreditCard, AlertTriangle, CalendarRange, 
  UserCheck, Bot, Settings, Search, Bell, HelpCircle,
  Plus, ShieldCheck
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import './DashboardLayout.css';

export default function DashboardLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { getNewApplicationsCount, logoutWarden } = useApp();
  
  const newAppCount = getNewApplicationsCount();
  const isAdmin = location.pathname.startsWith('/admin');
  const isStudent = location.pathname.startsWith('/student');

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className="dashboard-sidebar">
        <div className="sidebar-header">
          <div className="logo-placeholder">U</div>
          <div className="logo-text-group">
            <span className="logo-title">UniHostel</span>
            <span className="logo-subtitle">SaaS Management</span>
          </div>
        </div>
        
        <div className="sidebar-action">
          <button className="new-entry-btn">
            <Plus size={16} /> New Entry
          </button>
        </div>

        {isStudent ? (
          <nav className="sidebar-nav">
            <button className={`nav-item ${location.pathname === '/student' ? 'active' : ''}`} onClick={() => navigate('/student')}>
              <LayoutDashboard size={20} />
              <span>Dashboard</span>
            </button>
            <button className={`nav-item ${location.pathname === '/student/profile' ? 'active' : ''}`} onClick={() => navigate('/student/profile')}>
              <User size={20} />
              <span>My Profile</span>
            </button>
            <button className={`nav-item ${location.pathname === '/student/room' ? 'active' : ''}`} onClick={() => navigate('/student/room')}>
              <DoorClosed size={20} />
              <span>My Room</span>
            </button>
            <button className={`nav-item ${location.pathname === '/student/fees' ? 'active' : ''}`} onClick={() => navigate('/student/fees')}>
              <CreditCard size={20} />
              <span>Fees</span>
            </button>
            <button className={`nav-item ${location.pathname === '/student/complaints' ? 'active' : ''}`} onClick={() => navigate('/student/complaints')}>
              <AlertTriangle size={20} />
              <span>Complaints</span>
            </button>
            <button className={`nav-item ${location.pathname === '/student/leave' ? 'active' : ''}`} onClick={() => navigate('/student/leave')}>
              <CalendarRange size={20} />
              <span>Leave Requests</span>
            </button>
            <button className={`nav-item ${location.pathname === '/student/notices' ? 'active' : ''}`} onClick={() => navigate('/student/notices')}>
              <FileText size={20} />
              <span>Notices</span>
            </button>
            <button className={`nav-item ${location.pathname === '/student/attendance' ? 'active' : ''}`} onClick={() => navigate('/student/attendance')}>
              <UserCheck size={20} />
              <span>Attendance</span>
            </button>
            <button className={`nav-item ${location.pathname === '/student/settings' ? 'active' : ''}`} onClick={() => navigate('/student/settings')}>
              <Settings size={20} />
              <span>Settings</span>
            </button>
          </nav>
        ) : (
          <nav className="sidebar-nav">
            <button className="nav-item active">
              <LayoutDashboard size={20} />
              <span>Dashboard</span>
            </button>
            <button className="nav-item">
              <Users size={20} />
              <span>Students</span>
            </button>
            <button className="nav-item">
              <DoorClosed size={20} />
              <span>Rooms</span>
            </button>
            <button 
              className={`nav-item ${location.pathname === '/admin/applications' ? 'active' : ''}`}
              onClick={() => isAdmin && navigate('/admin/applications')}
            >
              <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
                <FileText size={20} />
                <span>Applications</span>
              </div>
              {isAdmin && newAppCount > 0 && (
                <span className="sidebar-badge">{newAppCount}</span>
              )}
            </button>
            <button 
              className={`nav-item ${location.pathname === '/admin/wardens' ? 'active' : ''}`}
              onClick={() => isAdmin && navigate('/admin/wardens')}
            >
              <ShieldCheck size={20} />
              <span>Wardens</span>
            </button>
            <button className="nav-item">
              <CreditCard size={20} />
              <span>Fees</span>
            </button>
            <button className="nav-item">
              <AlertTriangle size={20} />
              <span>Complaints</span>
            </button>
            <button className="nav-item">
              <CalendarRange size={20} />
              <span>Leave</span>
            </button>
            <button className="nav-item">
              <UserCheck size={20} />
              <span>Attendance</span>
            </button>
            <button className="nav-item">
              <Bot size={20} />
              <span>AI Assistant</span>
            </button>
            <button className="nav-item">
              <Settings size={20} />
              <span>Settings</span>
            </button>
          </nav>
        )}

        <div className="sidebar-footer">
          {/* Profile link should be dynamic based on role, but for now keep as is */}
          {!isStudent && (
            <button className="nav-item">
              <User size={20} />
              <span>Profile</span>
            </button>
          )}
          <button className="nav-item" onClick={() => { logoutWarden(); navigate('/'); }}>
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="dashboard-main">
        <header className="dashboard-topbar">
          <div className="topbar-tabs">
            <button className="topbar-tab active">Overview</button>
            <button className="topbar-tab">Reports</button>
            <button className="topbar-tab">Logs</button>
          </div>
          <div className="topbar-actions">
            <div className="search-bar">
              <Search size={16} className="search-icon" />
              <input type="text" placeholder="Search..." />
            </div>
            <button className="quick-action-btn">Quick Action</button>
            <button className="icon-btn">
              <Bell size={20} />
              <span className="badge"></span>
            </button>
            <button className="icon-btn">
              <HelpCircle size={20} />
            </button>
            <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="Profile" className="profile-img" />
          </div>
        </header>

        <div className="dashboard-content">
          {children}
        </div>
      </main>
    </div>
  );
}
