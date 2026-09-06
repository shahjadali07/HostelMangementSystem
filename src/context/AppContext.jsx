import React, { createContext, useContext, useState } from 'react';

const AppContext = createContext();
export const useApp = () => useContext(AppContext);

// ─── Static Hostel Data ────────────────────────────────────────────────────
export const HOSTELS = [
  { id: 'raman',        name: 'Raman Bhawan',        category: 'BOYS',   students: 420 },
  { id: 'subhash',      name: 'Subhash Bhawan',       category: 'BOYS',   students: 380 },
  { id: 'visveswaraya', name: 'Visveswaraya Bhawan',  category: 'BOYS',   students: 360 },
  { id: 'tagore',       name: 'Tagore Bhawan',        category: 'BOYS',   students: 400 },
  { id: 'ambedkar',     name: 'Ambedkar Bhawan',      category: 'BOYS',   students: 350 },
  { id: 'tilak',        name: 'Tilak Bhawan',         category: 'BOYS',   students: 300 },
  { id: 'ramanujam',    name: 'Ramanujam Bhawan',     category: 'BOYS',   students: 320 },
  { id: 'saraswati',    name: 'Saraswati Bhawan',     category: 'GIRLS',  students: 280 },
  { id: 'sarojini',     name: 'Sarojini Bhawan',      category: 'GIRLS',  students: 260 },
  { id: 'kalpana',      name: 'Kalpana Bhawan',       category: 'GIRLS',  students: 240 },
  { id: 'kasturba',     name: 'Kasturba Bhawan',      category: 'GIRLS',  students: 220 },
  { id: 'newgirls',     name: 'New Girls Hostel',     category: 'GIRLS',  students: 200 },
];

export const AppProvider = ({ children }) => {
  const [applications, setApplications] = useState([]);

  React.useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const res = await fetch('/api/applications');
      if (res.ok) {
        const data = await res.json();
        setApplications(data);
      }
    } catch (err) {
      console.error('Error fetching applications:', err);
    }
  };

  const addApplication = (studentData) => {
    // This is now handled directly via API in Signup.jsx
    // but we can leave a local fallback or refetch logic if needed.
    fetchApplications();
  };

  const updateApplicationStatus = (appId, newStatus) => {
    // Ideally this should also call a PUT /api/applications/:id/status
    // For now we'll just update local state to preserve UI functionality if API isn't built yet
    setApplications(prev => prev.map(app => app.id === appId ? { ...app, status: newStatus } : app));
  };

  const getNewApplicationsCount = () => applications.filter(a => a.status === 'NEW').length;

  // ─── Wardens ───────────────────────────────────────────────────────────
  // Simulated warden accounts (acts as our User + WardenProfile tables)
  const [wardens, setWardens] = useState([
    {
      id: 'w-001',
      fullName: 'Dr. Anita Sharma',
      email: 'warden.raman1@hostel.edu',
      phone: '9811001100',
      employeeId: 'EMP-101',
      designation: 'Chief Warden',
      hostelId: 'raman',
      position: 'WARDEN_1',
      status: 'ACTIVE',
      username: 'warden.raman1@hostel.edu',
      // password stored as plain-text mock (in real app use bcrypt)
      passwordHash: 'Warden@123',
      role: 'WARDEN',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'w-002',
      fullName: 'Mr. Ravi Menon',
      email: 'warden.raman2@hostel.edu',
      phone: '9811002200',
      employeeId: 'EMP-102',
      designation: 'Resident Warden',
      hostelId: 'raman',
      position: 'WARDEN_2',
      status: 'ACTIVE',
      username: 'warden.raman2@hostel.edu',
      passwordHash: 'Warden@456',
      role: 'WARDEN',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'w-003',
      fullName: 'Ms. Priya Nair',
      email: 'warden.saraswati1@hostel.edu',
      phone: '9811003300',
      employeeId: 'EMP-103',
      designation: 'Chief Warden',
      hostelId: 'saraswati',
      position: 'WARDEN_1',
      status: 'ACTIVE',
      username: 'warden.saraswati1@hostel.edu',
      passwordHash: 'Warden@789',
      role: 'WARDEN',
      createdAt: new Date().toISOString(),
    },
  ]);

  // Currently logged-in warden (set on login)
  const [currentWarden, setCurrentWarden] = useState(null);

  const getWardensByHostel = (hostelId) =>
    wardens.filter(w => w.hostelId === hostelId);

  const getActiveWardenCountByHostel = (hostelId) =>
    wardens.filter(w => w.hostelId === hostelId && w.status === 'ACTIVE').length;

  const addWarden = (wardenData) => {
    // Validate 2-warden limit
    const activeCount = getActiveWardenCountByHostel(wardenData.hostelId);
    if (activeCount >= 2) {
      return { success: false, error: 'Maximum 2 active wardens can be assigned to this hostel.' };
    }
    // Check position conflict
    const positionTaken = wardens.some(
      w => w.hostelId === wardenData.hostelId && w.position === wardenData.position && w.status === 'ACTIVE'
    );
    if (positionTaken) {
      return { success: false, error: `${wardenData.position === 'WARDEN_1' ? 'Warden 1' : 'Warden 2'} position is already taken in this hostel.` };
    }
    // Check email uniqueness
    if (wardens.some(w => w.email === wardenData.email)) {
      return { success: false, error: 'A warden with this email already exists.' };
    }
    // Check employeeId uniqueness
    if (wardens.some(w => w.employeeId === wardenData.employeeId)) {
      return { success: false, error: 'Employee ID already in use.' };
    }

    const newWarden = {
      ...wardenData,
      id: `w-${Date.now()}`,
      role: 'WARDEN',
      username: wardenData.email,
      createdAt: new Date().toISOString(),
    };
    setWardens(prev => [...prev, newWarden]);
    return { success: true, warden: newWarden };
  };

  const updateWarden = (wardenId, updatedData) => {
    // If changing hostel, validate new hostel's limit
    const original = wardens.find(w => w.id === wardenId);
    if (updatedData.hostelId && updatedData.hostelId !== original.hostelId) {
      const activeCount = getActiveWardenCountByHostel(updatedData.hostelId);
      if (activeCount >= 2) {
        return { success: false, error: 'Destination hostel already has 2 active wardens.' };
      }
    }
    setWardens(prev => prev.map(w => w.id === wardenId ? { ...w, ...updatedData } : w));
    return { success: true };
  };

  const deleteWarden = (wardenId) => {
    // Soft delete: set status to DELETED
    setWardens(prev => prev.map(w => w.id === wardenId ? { ...w, status: 'DELETED' } : w));
    return { success: true };
  };

  const toggleWardenStatus = (wardenId) => {
    setWardens(prev => prev.map(w =>
      w.id === wardenId ? { ...w, status: w.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' } : w
    ));
  };

  const resetWardenPassword = (wardenId, newPassword) => {
    setWardens(prev => prev.map(w => w.id === wardenId ? { ...w, passwordHash: newPassword } : w));
    return { success: true };
  };

  // Called from Login page to authenticate a warden
  const loginWarden = (email, password) => {
    const warden = wardens.find(
      w => w.email === email && w.passwordHash === password && w.role === 'WARDEN' && w.status === 'ACTIVE'
    );
    if (warden) {
      setCurrentWarden(warden);
      return { success: true, warden };
    }
    return { success: false };
  };

  const logoutWarden = () => setCurrentWarden(null);

  return (
    <AppContext.Provider value={{
      // Applications
      applications, addApplication, updateApplicationStatus, getNewApplicationsCount,
      // Hostels
      hostels: HOSTELS,
      // Wardens
      wardens, currentWarden,
      getWardensByHostel, getActiveWardenCountByHostel,
      addWarden, updateWarden, deleteWarden, toggleWardenStatus, resetWardenPassword,
      loginWarden, logoutWarden,
    }}>
      {children}
    </AppContext.Provider>
  );
};

