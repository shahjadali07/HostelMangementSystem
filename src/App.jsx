import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Login from './pages/Login';
import Signup from './pages/Signup';
import StudentDashboard from './pages/StudentDashboard';
import StudentProfile from './pages/StudentProfile';
import StudentRoom from './pages/StudentRoom';
import StudentFees from './pages/StudentFees';
import StudentComplaints from './pages/StudentComplaints';
import StudentLeave from './pages/StudentLeave';
import StudentNotices from './pages/StudentNotices';
import StudentAttendance from './pages/StudentAttendance';
import StudentSettings from './pages/StudentSettings';
import WardenDashboard from './pages/WardenDashboard';
import AdminDashboard from './pages/AdminDashboard';
import AdminApplications from './pages/AdminApplications';
import AdminWardens from './pages/AdminWardens';

function App() {
  return (
    <AppProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          
          <Route path="/student" element={<StudentDashboard />} />
          <Route path="/student/profile" element={<StudentProfile />} />
          <Route path="/student/room" element={<StudentRoom />} />
          <Route path="/student/fees" element={<StudentFees />} />
          <Route path="/student/complaints" element={<StudentComplaints />} />
          <Route path="/student/leave" element={<StudentLeave />} />
          <Route path="/student/notices" element={<StudentNotices />} />
          <Route path="/student/attendance" element={<StudentAttendance />} />
          <Route path="/student/settings" element={<StudentSettings />} />

          <Route path="/warden" element={<WardenDashboard />} />
          
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/applications" element={<AdminApplications />} />
          <Route path="/admin/wardens" element={<AdminWardens />} />
          
          {/* Redirect unknown routes to login */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AppProvider>
  );
}

export default App;
