import React from 'react';
import PageTitle from './components/PageTitle';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Login from './pages/Login';
import StudentApplication from './pages/StudentApplication';
import StudentDashboard from './pages/StudentDashboard';
import StudentProfile from './pages/StudentProfile';
import HostelRegistrationPage from './pages/HostelRegistrationPage';
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
import AdminApplicationDetails from './pages/AdminApplicationDetails';
import WardenApplicationDetails from './pages/WardenApplicationDetails';
import WardenApplications from './pages/WardenApplications';
import AdminWardens from './pages/AdminWardens';
import WardenManagement from './pages/WardenManagement';
import HostelWardenManagementPage from './pages/HostelWardenManagementPage';
import AdminRooms from './pages/AdminRooms';
import AdminStudents from './pages/AdminStudents';

import WardenStudents from './pages/WardenStudents';
import WardenRooms from './pages/WardenRooms';
import WardenLeaveRequests from './pages/WardenLeaveRequests';
import WardenComplaints from './pages/WardenComplaints';
import WardenMovement from './pages/WardenMovement';
import WardenMaintenance from './pages/WardenMaintenance';
import WardenDiscipline from './pages/WardenDiscipline';
import WardenNotices from './pages/WardenNotices';
import WardenProfile from './pages/WardenProfile';
import { useSearchParams } from 'react-router-dom';

function WardenIndexRoute() {
  const [searchParams] = useSearchParams();
  if (searchParams.get('id')) {
    return <><PageTitle title="Warden Management | Hostel Management System" /><WardenManagement /></>;
  }
  return <><PageTitle title="Warden Dashboard | Hostel Management System" /><WardenDashboard /></>;
}

function App() {
  return (
    <AppProvider>
      <Router>
        <Routes>
          <Route path="/" element={<><PageTitle title="Login | Hostel Management System" /><Login /></>} />
          <Route path="/register" element={<><PageTitle title="Student Registration | Hostel Management System" /><StudentApplication /></>} />
          
          <Route path="/student/register" element={<HostelRegistrationPage />} />
          <Route path="/student" element={<><PageTitle title="Student Dashboard | Hostel Management System" /><StudentDashboard /></>} />
          <Route path="/student/dashboard" element={<Navigate to="/student" replace />} />
          <Route path="/student/profile" element={<><PageTitle title="My Profile | Hostel Management System" /><StudentProfile /></>} />
          <Route path="/student/room" element={<><PageTitle title="My Room | Hostel Management System" /><StudentRoom /></>} />
          <Route path="/student/fees" element={<><PageTitle title="My Fees | Hostel Management System" /><StudentFees /></>} />
          <Route path="/student/complaints" element={<><PageTitle title="My Complaints | Hostel Management System" /><StudentComplaints /></>} />
          <Route path="/student/leave" element={<><PageTitle title="Leave Requests | Hostel Management System" /><StudentLeave /></>} />
          <Route path="/student/notices" element={<><PageTitle title="Hostel Notices | Hostel Management System" /><StudentNotices /></>} />
          <Route path="/student/attendance" element={<><PageTitle title="My Attendance | Hostel Management System" /><StudentAttendance /></>} />
          <Route path="/student/settings" element={<><PageTitle title="Settings | Hostel Management System" /><StudentSettings /></>} />

          <Route path="/warden" element={<WardenIndexRoute />} />
          <Route path="/warden/applications" element={<><PageTitle title="Pending Applications | Hostel Management System" /><WardenApplications /></>} />
          <Route path="/warden/applications/:applicationId" element={<WardenApplicationDetails />} />
          <Route path="/warden/students" element={<><PageTitle title="Students | Hostel Management System" /><WardenStudents /></>} />
          <Route path="/warden/rooms" element={<><PageTitle title="Rooms & Beds | Hostel Management System" /><WardenRooms /></>} />
          <Route path="/warden/leave-requests" element={<><PageTitle title="Leave Requests | Hostel Management System" /><WardenLeaveRequests /></>} />
          <Route path="/warden/complaints" element={<><PageTitle title="Complaints | Hostel Management System" /><WardenComplaints /></>} />
          <Route path="/warden/movement" element={<><PageTitle title="Student Movement | Hostel Management System" /><WardenMovement /></>} />
          <Route path="/warden/maintenance" element={<><PageTitle title="Maintenance | Hostel Management System" /><WardenMaintenance /></>} />
          <Route path="/warden/discipline" element={<><PageTitle title="Discipline Records | Hostel Management System" /><WardenDiscipline /></>} />
          <Route path="/warden/notices" element={<><PageTitle title="Hostel Notices | Hostel Management System" /><WardenNotices /></>} />
          <Route path="/warden/profile" element={<><PageTitle title="Warden Profile | Hostel Management System" /><WardenProfile /></>} />
          
          <Route path="/admin" element={<><PageTitle title="Admin Dashboard | Hostel Management System" /><AdminDashboard /></>} />
          <Route path="/admin/students" element={<><PageTitle title="Students | Hostel Management System" /><AdminStudents /></>} />
          <Route path="/admin/applications" element={<><PageTitle title="Applications | Hostel Management System" /><AdminApplications /></>} />
          <Route path="/admin/applications/:applicationId" element={<AdminApplicationDetails />} />
          <Route path="/admin/wardens" element={<><PageTitle title="Wardens | Hostel Management System" /><AdminWardens /></>} />
          <Route path="/admin/wardens/:hostelId" element={<HostelWardenManagementPage />} />
          <Route path="/admin/rooms" element={<><PageTitle title="Rooms & Beds | Hostel Management System" /><AdminRooms /></>} />


          
          {/* Redirect unknown routes to login */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AppProvider>
  );
}

export default App;
