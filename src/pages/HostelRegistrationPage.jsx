import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import HostelRegistrationForm from '../components/HostelRegistrationForm';
import PageTitle from '../components/PageTitle';

export default function HostelRegistrationPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    // We can fetch the user details using the profile route, which now returns user even on 403
    fetch('/api/student/profile', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('studentToken') || localStorage.getItem('token')}`
      }
    })
      .then(res => {
        if (res.status === 401) {
          navigate('/', { replace: true });
          return null;
        }
        return res.json();
      })
      .then(data => {
        if (!data) return;
        if (data.application) {
          // Application already exists, bypass registration page
          navigate('/student', { replace: true });
          return;
        }
        if (data.user) {
          setUser(data.user);
        }
      })
      .catch(err => console.error(err));
  }, []);

  return (
    <div style={{ padding: '40px 20px', backgroundColor: '#f3f4f6', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <PageTitle title="Hostel Registration | UniHostel" />
      <div style={{ width: '100%', maxWidth: '900px', textAlign: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '2rem', color: '#111827', marginBottom: '8px', fontWeight: 'bold' }}>Welcome to UniHostel 👋</h1>
        <p style={{ color: '#4b5563', fontSize: '1.1rem' }}>Complete your hostel registration to continue to the Student Portal.</p>
      </div>
      <div style={{ width: '100%', maxWidth: '900px' }}>
        <HostelRegistrationForm user={user} onSuccess={() => navigate('/student')} />
      </div>
    </div>
  );
}
