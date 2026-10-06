
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LogOut, User, LayoutDashboard, Users, DoorClosed, 
  FileText, CreditCard, AlertTriangle, CalendarRange, 
  UserCheck, Bot, Settings, Search, Bell, HelpCircle,
  Plus, ShieldCheck, Check
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import './DashboardLayout.css';

export default function DashboardLayout({ children, notifications = [], fetchDashboard, applicationStatus, hasAllocation }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [showNotifications, setShowNotifications] = useState(false);
  const { getNewApplicationsCount, logoutWarden } = useApp();
  
  const newAppCount = getNewApplicationsCount();
  const isAdmin = location.pathname.startsWith('/admin');
  const isStudent = location.pathname.startsWith('/student');
  const isWarden = location.pathname.startsWith('/warden');
  
  const [checkingAuth, setCheckingAuth] = useState(isStudent && location.pathname !== '/student/register');

  React.useEffect(() => {
    if (isStudent && location.pathname !== '/student/register') {
      fetch('/api/student/application/status', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('studentToken') || localStorage.getItem('token')}`
        }
      })
        .then(res => {
          if (!res.ok) {
            if (res.status === 401 || res.status === 403) {
              navigate('/', { replace: true });
              return null;
            }
            throw new Error('Failed to fetch status');
          }
          return res.json();
        })
        .then(data => {
          if (!data) return; // already redirected
          if (!data.hasApplication) {
            navigate('/student/register', { replace: true });
          } else {
            setCheckingAuth(false);
          }
        })
        .catch(err => {
          console.error(err);
          setCheckingAuth(false);
        });
    }
  }, [isStudent, location.pathname, navigate]);

  if (checkingAuth) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f3f4f6' }}>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ color: '#4b5563' }}>Checking application status...</h2>
        </div>
      </div>
    );
  }

  const isApproved = ['APPROVED', 'ASSIGNED TO WARDEN', 'FORWARDED_TO_WARDEN', 'BED_ALLOCATION_PENDING', 'BED_ALLOCATED'].includes(applicationStatus);

  const handleStudentNav = (path) => {
    if (path === '/student/room') {
      if (!isApproved) {
        alert('Your hostel application is currently under review. This feature will be available after your application is approved.');
        return;
      }
      if (!hasAllocation) {
        alert('Your application is approved, but a room has not been allocated yet. Please wait for the warden to allocate your room.');
        return;
      }
    }
    const isProtected = ['/student/fees', '/student/complaints', '/student/leave', '/student/notices', '/student/attendance'];
    if (isProtected.includes(path) && !isApproved) {
      alert('Your hostel application is currently under review. This feature will be available after your application is approved.');
      return;
    }
    navigate(path);
  };

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
        
        {!isWarden && (
          <div className="sidebar-action">
            <button className="new-entry-btn" onClick={() => navigate('/signup')}>
              <Plus size={16} /> New Entry
            </button>
          </div>
        )}

        {isStudent ? (
          <nav className="sidebar-nav">
            <button className={`nav-item ${location.pathname === '/student' ? 'active' : ''}`} onClick={() => handleStudentNav('/student')}>
              <LayoutDashboard size={20} />
              <span>Dashboard</span>
            </button>
            <button className={`nav-item ${location.pathname === '/student/profile' ? 'active' : ''}`} onClick={() => handleStudentNav('/student/profile')}>
              <User size={20} />
              <span>My Profile</span>
            </button>
            <button className={`nav-item ${location.pathname === '/student/room' ? 'active' : ''} ${!isApproved || !hasAllocation ? 'locked' : ''}`} onClick={() => handleStudentNav('/student/room')}>
              <DoorClosed size={20} />
              <span>My Room {(!isApproved || !hasAllocation) && '🔒'}</span>
            </button>
            <button className={`nav-item ${location.pathname === '/student/fees' ? 'active' : ''} ${!isApproved ? 'locked' : ''}`} onClick={() => handleStudentNav('/student/fees')}>
              <CreditCard size={20} />
              <span>Fees {!isApproved && '🔒'}</span>
            </button>
            <button className={`nav-item ${location.pathname === '/student/complaints' ? 'active' : ''} ${!isApproved ? 'locked' : ''}`} onClick={() => handleStudentNav('/student/complaints')}>
              <AlertTriangle size={20} />
              <span>Complaints {!isApproved && '🔒'}</span>
            </button>
            <button className={`nav-item ${location.pathname === '/student/leave' ? 'active' : ''} ${!isApproved ? 'locked' : ''}`} onClick={() => handleStudentNav('/student/leave')}>
              <CalendarRange size={20} />
              <span>Leave Requests {!isApproved && '🔒'}</span>
            </button>
            <button className={`nav-item ${location.pathname === '/student/notices' ? 'active' : ''} ${!isApproved ? 'locked' : ''}`} onClick={() => handleStudentNav('/student/notices')}>
              <FileText size={20} />
              <span>Notices {!isApproved && '🔒'}</span>
            </button>
            <button className={`nav-item ${location.pathname === '/student/attendance' ? 'active' : ''} ${!isApproved ? 'locked' : ''}`} onClick={() => handleStudentNav('/student/attendance')}>
              <UserCheck size={20} />
              <span>Attendance {!isApproved && '🔒'}</span>
            </button>
            <button className={`nav-item ${location.pathname === '/student/settings' ? 'active' : ''}`} onClick={() => handleStudentNav('/student/settings')}>
              <Settings size={20} />
              <span>Settings</span>
            </button>
          </nav>
        ) : isWarden ? (
          <nav className="sidebar-nav">
            <button className={`nav-item ${location.pathname === '/warden' ? 'active' : ''}`} onClick={() => navigate('/warden')}>
              <LayoutDashboard size={20} />
              <span>Dashboard</span>
            </button>
            <div className="nav-section-title" style={{fontSize: '0.75rem', color: '#94a3b8', padding: '1rem 1rem 0.5rem', textTransform: 'uppercase', fontWeight: 'bold'}}>Management</div>
            <button className={`nav-item ${location.pathname === '/warden/students' ? 'active' : ''}`} onClick={() => navigate('/warden/students')}>
              <Users size={20} />
              <span>Students</span>
            </button>
            <button className={`nav-item ${location.pathname === '/warden/rooms' ? 'active' : ''}`} onClick={() => navigate('/warden/rooms')}>
              <DoorClosed size={20} />
              <span>Rooms & Beds</span>
            </button>
            <button className={`nav-item ${location.pathname === '/warden/leave-requests' ? 'active' : ''}`} onClick={() => navigate('/warden/leave-requests')}>
              <CalendarRange size={20} />
              <span>Leave Requests</span>
            </button>
            <button className={`nav-item ${location.pathname === '/warden/complaints' ? 'active' : ''}`} onClick={() => navigate('/warden/complaints')}>
              <AlertTriangle size={20} />
              <span>Complaints</span>
            </button>
            <button className={`nav-item ${location.pathname === '/warden/movement' ? 'active' : ''}`} onClick={() => navigate('/warden/movement')}>
              <UserCheck size={20} />
              <span>Movement</span>
            </button>
            <button className={`nav-item ${location.pathname === '/warden/maintenance' ? 'active' : ''}`} onClick={() => navigate('/warden/maintenance')}>
              <Settings size={20} />
              <span>Maintenance</span>
            </button>
            <button className={`nav-item ${location.pathname === '/warden/discipline' ? 'active' : ''}`} onClick={() => navigate('/warden/discipline')}>
              <ShieldCheck size={20} />
              <span>Discipline</span>
            </button>
            <div className="nav-section-title" style={{fontSize: '0.75rem', color: '#94a3b8', padding: '1rem 1rem 0.5rem', textTransform: 'uppercase', fontWeight: 'bold'}}>Communication</div>
            <button className={`nav-item ${location.pathname === '/warden/notices' ? 'active' : ''}`} onClick={() => navigate('/warden/notices')}>
              <FileText size={20} />
              <span>Notices</span>
            </button>
          </nav>
        ) : (
          <nav className="sidebar-nav">
            <button className="nav-item active">
              <LayoutDashboard size={20} />
              <span>Dashboard</span>
            </button>
            <button 
              className={`nav-item ${location.pathname === '/admin/students' ? 'active' : ''}`}
              onClick={() => isAdmin && navigate('/admin/students')}
            >
              <Users size={20} />
              <span>Students</span>
            </button>
            <button 
              className={`nav-item ${location.pathname === '/admin/rooms' ? 'active' : ''}`}
              onClick={() => isAdmin && navigate('/admin/rooms')}
            >
              <DoorClosed size={20} />
              <span>Rooms & Beds</span>
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
          {!isStudent && !isWarden && (
            <button className="nav-item">
              <User size={20} />
              <span>Profile</span>
            </button>
          )}
          {isWarden && (
            <button className={`nav-item ${location.pathname === '/warden/profile' ? 'active' : ''}`} onClick={() => navigate('/warden/profile')}>
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
            <div className="notification-container" style={{ position: 'relative' }}>
              <button className="icon-btn" onClick={() => setShowNotifications(!showNotifications)}>
                <Bell size={20} />
                {notifications.filter(n => !n.isRead).length > 0 && (
                  <span className="badge">{notifications.filter(n => !n.isRead).length}</span>
                )}
              </button>
              
              {showNotifications && (
                <div className="notifications-dropdown">
                  <div className="dropdown-header">
                    <h4>Notifications</h4>
                  </div>
                  <div className="dropdown-list">
                    {notifications.length === 0 ? (
                      <div className="no-notifications">No new notifications</div>
                    ) : (
                      notifications.map(n => (
                        <div key={n._id} className={`notification-item ${n.isRead ? 'read' : 'unread'}`}>
                          <div className="notif-content">
                            <strong>{n.title}</strong>
                            <p>{n.message}</p>
                            <span className="notif-time">{new Date(n.createdAt).toLocaleDateString()}</span>
                          </div>
                          {!n.isRead && (
                            <button className="mark-read-btn" onClick={async () => {
                              await fetch(`/api/student/notifications/${n._id}/read`, { method: 'PUT' });
                              if(fetchDashboard) fetchDashboard();
                            }}>
                              <Check size={14} />
                            </button>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
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
