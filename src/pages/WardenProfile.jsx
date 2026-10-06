import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { useApp } from '../context/AppContext';

export default function WardenProfile() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch data here
    setTimeout(() => setLoading(false), 500);
  }, []);

  return (
    <DashboardLayout>
      <div className="warden-page-content" style={{ padding: '2rem' }}>
        <h2>Profile</h2>
        {loading ? <p>Loading...</p> : (
          <div className="card" style={{ padding: '2rem', marginTop: '1rem', background: 'white', borderRadius: '8px' }}>
            <p>Placeholder for Profile</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
