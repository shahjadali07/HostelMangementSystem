import React, { createContext, useContext, useState } from 'react';

const AppContext = createContext();
export const useApp = () => useContext(AppContext);

// ─── Static Hostel Data ────────────────────────────────────────────────────
export const HOSTELS = [
  { id: 'raman-bhawan', name: 'Raman Bhawan', category: 'BOYS', capacity: 500 },
  { id: 'subhash-bhawan', name: 'Subhash Bhawan', category: 'BOYS', capacity: 455 },
  { id: 'visvesvaraya-bhawan', name: 'Visvesvaraya Bhawan', category: 'BOYS', capacity: 320 },
  { id: 'ramanujam-bhawan', name: 'Ramanujam Bhawan', category: 'BOYS', capacity: 324 },
  { id: 'tagore-bhawan', name: 'Tagore Bhawan', category: 'BOYS', capacity: 240 },
  { id: 'ambedkar-bhawan', name: 'Ambedkar Bhawan', category: 'BOYS', capacity: 230 },
  { id: 'tilak-bhawan', name: 'Tilak Bhawan', category: 'BOYS', capacity: 152 },
  { id: 'saraswati-bhawan', name: 'Saraswati Bhawan', category: 'GIRLS', capacity: 266 },
  { id: 'kalpana-chawla-bhawan', name: 'Kalpana Chawla Bhawan', category: 'GIRLS', capacity: 144 },
  { id: 'sarojini-bhawan', name: 'Sarojini Bhawan', category: 'GIRLS', capacity: 140 },
  { id: 'kasturba-bhawan', name: 'Kasturba Bhawan', category: 'GIRLS', capacity: 140 },
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

  const updateApplicationStatus = async (appId, newStatus, rejectionReason = '', correctionMessage = '') => {
    try {
      const res = await fetch(`/api/applications/${appId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, rejectionReason, correctionMessage })
      });
      const data = await res.json();
      if (data.success) {
        setApplications(prev => prev.map(app => app.id === appId ? { ...app, status: newStatus, rejectionReason, correctionMessage } : app));
        return { success: true };
      } else {
        return { success: false, error: data.message };
      }
    } catch (err) {
      console.error('Error updating status:', err);
      return { success: false, error: err.message };
    }
  };

  const getNewApplicationsCount = () => applications.filter(a => a.status === 'NEW').length;

  // ─── Wardens ───────────────────────────────────────────────────────────
  const [wardens, setWardens] = useState([]);

  React.useEffect(() => {
    fetchWardens();
  }, []);

  const fetchWardens = async () => {
    try {
      const res = await fetch('/api/admin/wardens');
      if (res.ok) {
        const data = await res.json();
        setWardens(data);
      }
    } catch (err) {
      console.error('Error fetching wardens:', err);
    }
  };

  // Currently logged-in warden (set on login)
  const [currentWarden, setCurrentWarden] = useState(null);

  const getWardensByHostel = (hostelId) =>
    wardens.filter(w => w.hostelId === hostelId);

  const getActiveWardenCountByHostel = (hostelId) =>
    wardens.filter(w => w.hostelId === hostelId && w.status === 'ACTIVE').length;

  const addWarden = async (wardenData) => {
    try {
      const res = await fetch('/api/admin/wardens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(wardenData)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setWardens(prev => [...prev, data.warden]);
        return { success: true, warden: data.warden };
      }
      return { success: false, error: data.message || 'Error creating warden' };
    } catch (err) {
      console.error('Error adding warden:', err);
      return { success: false, error: 'Network error creating warden' };
    }
  };

  const updateWarden = async (wardenId, updatedData) => {
    try {
      const res = await fetch(`/api/admin/wardens/${wardenId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setWardens(prev => prev.map(w => w.id === wardenId ? { ...w, ...updatedData } : w));
        return { success: true };
      }
      return { success: false, error: data.message || 'Error updating warden' };
    } catch (err) {
      console.error('Error updating warden:', err);
      return { success: false, error: 'Network error updating warden' };
    }
  };

  const deleteWarden = async (wardenId) => {
    try {
      const res = await fetch(`/api/admin/wardens/${wardenId}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setWardens(prev => prev.map(w => w.id === wardenId ? { ...w, status: 'DELETED' } : w));
        return { success: true };
      }
      return { success: false, error: data.message || 'Error deleting warden' };
    } catch (err) {
      console.error('Error deleting warden:', err);
      return { success: false, error: 'Network error deleting warden' };
    }
  };

  const toggleWardenStatus = async (wardenId) => {
    const warden = wardens.find(w => w.id === wardenId);
    if (!warden) return { success: false, error: 'Warden not found' };
    const newStatus = warden.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      const res = await fetch(`/api/admin/wardens/${wardenId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setWardens(prev => prev.map(w => w.id === wardenId ? { ...w, status: newStatus } : w));
        return { success: true };
      }
      return { success: false, error: data.message || 'Error updating status' };
    } catch (err) {
      console.error('Error updating status:', err);
      return { success: false, error: 'Network error updating status' };
    }
  };

  const resetWardenPassword = async (wardenId, newPassword) => {
    try {
      const res = await fetch(`/api/admin/wardens/${wardenId}/password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        return { success: true };
      }
      return { success: false, error: data.message || 'Error resetting password' };
    } catch (err) {
      console.error('Error resetting password:', err);
      return { success: false, error: 'Network error resetting password' };
    }
  };

  // Called from Login page to authenticate a warden
  const loginWarden = async (email, password) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('wardenToken', data.token);
        setCurrentWarden(data.user);
        return { success: true, warden: data.user };
      }
      return { success: false, error: data.message || 'Invalid credentials' };
    } catch (err) {
      console.error(err);
      return { success: false, error: 'Network error' };
    }
  };

  const logoutWarden = () => {
    localStorage.removeItem('wardenToken');
    setCurrentWarden(null);
  };

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

