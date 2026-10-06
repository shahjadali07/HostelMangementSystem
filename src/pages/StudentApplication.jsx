import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User, BookOpen, Phone, Home, Tag, BadgeCheck,
  FileText, Camera, PenLine, Upload, ChevronRight,
  ChevronLeft, Building2, CheckCircle2, X
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import './StudentApplication.css';

const DEPARTMENTS = [
  'Computer Science & Engineering',
  'Information Technology',
  'Electronics & Communication',
  'Mechanical Engineering',
  'Civil Engineering',
  'Electrical Engineering',
  'Chemical Engineering',
  'Biotechnology',
  'MBA',
  'MCA',
  'Other',
];

const CATEGORIES = ['General', 'OBC', 'OBC-NCL', 'SC', 'ST', 'EWS', 'PWD'];

const YEARS = [
  { value: '1st', label: '1st Year' },
  { value: '2nd', label: '2nd Year' },
  { value: '2nd_lateral', label: '2nd Year (Lateral Entry)' },
  { value: '3rd', label: '3rd Year' },
  { value: 'final', label: 'Final Year' },
];

const STEPS = [
  { id: 1, title: 'Personal Info',   icon: User },
  { id: 2, title: 'Verify Email',    icon: BadgeCheck },
  { id: 3, title: 'Create Password', icon: BookOpen },
];

function needsApplicationNumber(year) {
  return year === '1st' || year === '2nd_lateral';
}

export default function Signup() {
  const navigate = useNavigate();
  const { addApplication } = useApp();
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});

  const [otpStatus, setOtpStatus] = useState('idle');
  const [otp, setOtp] = useState('');
  const [verifyStatus, setVerifyStatus] = useState('idle');
  
  const [form, setForm] = useState({
    // Step 1 – Personal
    fullName: '',
    email: '',
    identifier: '',
    phone: '',
    emailVerified: false,
    
    // Step 3 – Password
    password: '',
    confirmPassword: '',
    email: '',
    identifier: '',
    phone: '',
    emailVerified: false,
    
    gender: '',
    dob: '',
    aadhaar: '',
    category: '',
    // Step 2 – Academic
    department: '',
    year: '',
    jeeApplicationNo: '',
    cuetApplicationNo: '',
    enrollmentNo: '',
    // Step 3 – Parent & Address
    fatherName: '',
    motherName: '',
    parentPhone: '',
    parentEmail: '',
    permanentAddress: '',
    city: '',
    state: '',
    pincode: '',
    // Step 4 – Documents
    photo: null,
    signature: null,
    aadhaarDoc: null,
    documents: [],
  });

  const set = (key, val) => {
    setForm(prev => ({ ...prev, [key]: val }));
    setErrors(prev => ({ ...prev, [key]: '' }));
  };

  const handleFile = (key, file) => set(key, file);

  const handleMultiFile = (files) => {
    setForm(prev => ({ ...prev, documents: [...prev.documents, ...Array.from(files)] }));
  };

  const removeDoc = (idx) => {
    setForm(prev => ({ ...prev, documents: prev.documents.filter((_, i) => i !== idx) }));
  };

  // Basic per-step validation
  const validate = () => {
    const e = {};
    if (step === 1) {
      if (!form.fullName.trim()) e.fullName = 'Full name is required';
      if (!form.email || !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Valid email required';
      if (!form.identifier.trim()) e.identifier = 'Application number or roll number is required';
      if (!form.phone || !/^\d{10}$/.test(form.phone)) e.phone = 'Valid 10-digit phone required';
    }
    if (step === 3) {
      if (!form.password) {
        e.password = 'Password is required';
      } else {
        if (form.password.length < 8) e.password = 'Minimum 8 characters required';
        else if (!/[A-Z]/.test(form.password)) e.password = 'At least 1 uppercase letter required';
        else if (!/[a-z]/.test(form.password)) e.password = 'At least 1 lowercase letter required';
        else if (!/[0-9]/.test(form.password)) e.password = 'At least 1 number required';
        else if (!/[^A-Za-z0-9]/.test(form.password)) e.password = 'At least 1 special character required';
      }
      if (form.password !== form.confirmPassword) {
        e.confirmPassword = 'Passwords do not match';
      }
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => { if (validate()) setStep(s => s + 1); };
  const back = () => setStep(s => s - 1);
  
  const sendOtp = async () => {
    if (validate()) {
      try {
        setOtpStatus('sending');
        const res = await fetch('/api/auth/send-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fullName: form.fullName,
            email: form.email,
            identifier: form.identifier,
            phone: form.phone
          })
        });
        const data = await res.json();
        if (res.ok) {
          setOtpStatus('sent');
          setStep(2);
        } else {
          setOtpStatus('idle');
          if (res.status === 409) {
            alert('An account already exists with this email. Please login instead.');
          } else {
            alert(data.message || 'Error sending verification code');
          }
        }
      } catch (err) {
        setOtpStatus('idle');
        alert('Unable to connect to the server. Please try again.');
      }
    }
  };

  const verifyOtp = async () => {
    if (!otp || otp.length !== 6) {
      alert("Please enter a 6-digit verification code.");
      return;
    }
    try {
      setVerifyStatus('verifying');
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, otp })
      });
      const data = await res.json();
      if (res.ok) {
        setVerifyStatus('idle');
        setForm(prev => ({ ...prev, emailVerified: true }));
        setStep(3);
      } else {
        setVerifyStatus('idle');
        alert(data.message || 'Invalid verification code.');
      }
    } catch (err) {
      setVerifyStatus('idle');
      alert('Unable to verify the code right now. Please try again.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validate()) {
      try {
        const response = await fetch('/api/auth/create-account', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fullName: form.fullName,
            email: form.email,
            identifier: form.identifier,
            phone: form.phone,
            password: form.password
          })
        });

        if (!response.ok) {
          let errorMsg = 'Unknown error';
          try {
            const data = await response.json();
            errorMsg = data.message || data.error || `HTTP ${response.status}`;
          } catch(e) {
            errorMsg = `Server error: HTTP ${response.status}`;
          }
          alert(errorMsg);
          return;
        }

        const data = await response.json();

        if (data.success) {
          setSubmitted(true);
        } else {
          alert(data.message || 'Unknown error');
        }
      } catch (error) {
        console.error('Submit error:', error);
        alert('An error occurred during submission.');
      }
    }
  };

  if (submitted) {
    return (
      <div className="signup-success-screen">
        <div className="success-card">
          <CheckCircle2 size={64} className="success-icon" />
          <h2>Account Created Successfully</h2>
          <p>Your account has been created successfully. Your email has been verified.</p>
          <p>You can now login using your email and password.</p>
          <button className="success-btn" onClick={() => navigate('/')}>Return to Login</button>
        </div>
      </div>
    );
  }

  return (
    <div className="signup-layout">
      {/* Left Banner */}
      <div className="signup-banner">
        <div className="signup-banner-overlay" />
        <div className="signup-banner-content">
          <Building2 size={40} className="banner-logo" />
          <h1>Join UniHostel</h1>
          <p>Register to access your hostel portal and manage everything from room assignments to fee payments.</p>
          <div className="step-progress">
            {STEPS.map(s => (
              <div key={s.id} className={`step-dot ${step >= s.id ? 'active' : ''} ${step > s.id ? 'done' : ''}`}>
                <div className="step-dot-inner">
                  {step > s.id ? <CheckCircle2 size={14} /> : <s.icon size={14} />}
                </div>
                <span>{s.title}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Form Panel */}
      <div className="signup-form-section">
        <div className="signup-form-container">
          <div className="signup-form-header">
            <div className="step-indicator">Step {step} of {STEPS.length}</div>
            <h2>{STEPS[step - 1].title}</h2>
            <div className="step-bar">
              <div className="step-bar-fill" style={{ width: `${(step / STEPS.length) * 100}%` }} />
            </div>
          </div>

          <form onSubmit={step === STEPS.length ? handleSubmit : e => e.preventDefault()}>

            {/* ── STEP 1: Personal Info ── */}
            {step === 1 && (
              <div className="form-grid">
                <div className="field-group col-span-2">
                  <label>Full Name <span className="req">*</span></label>
                  <input className={`sf-input ${errors.fullName ? 'err' : ''}`} placeholder="Enter your full name" value={form.fullName} onChange={e => set('fullName', e.target.value)} />
                  {errors.fullName && <span className="err-msg">{errors.fullName}</span>}
                </div>

                <div className="field-group col-span-2">
                  <label>Email Address <span className="req">*</span></label>
                  <input className={`sf-input ${errors.email ? 'err' : ''}`} type="email" placeholder="e.g. shahjad@gmail.com" value={form.email} onChange={e => set('email', e.target.value)} />
                  <p className="field-hint">Personal or university email accepted. You must have access to this email for verification.</p>
                  {errors.email && <span className="err-msg">{errors.email}</span>}
                </div>
                
                <div className="field-group col-span-2">
                  <label>Application Number / Roll Number <span className="req">*</span></label>
                  <input className={`sf-input ${errors.identifier ? 'err' : ''}`} placeholder="Enter application number or roll number" value={form.identifier} onChange={e => set('identifier', e.target.value)} />
                  {errors.identifier && <span className="err-msg">{errors.identifier}</span>}
                </div>

                <div className="field-group col-span-2">
                  <label>Phone Number <span className="req">*</span></label>
                  <input className={`sf-input ${errors.phone ? 'err' : ''}`} placeholder="10-digit mobile" maxLength={10} value={form.phone} onChange={e => set('phone', e.target.value.replace(/\D/, ''))} />
                  {errors.phone && <span className="err-msg">{errors.phone}</span>}
                </div>
              </div>
            )}

            {/* ── STEP 2: Verify Email ── */}
            {step === 2 && (
              <div className="form-grid">
                <div className="field-group col-span-2">
                  <div style={{textAlign: 'center', margin: '2rem 0'}}>
                    <BadgeCheck size={48} color="#5142f5" style={{marginBottom: '1rem'}} />
                    <h3>Verify Your Email</h3>
                    <p style={{marginBottom: '0.5rem', color: '#666'}}>We sent a verification code to your email.</p>
                    <p style={{fontSize: '1.1rem'}}><strong>{form.email.replace(/(.{1})(.*)(?=@)/, (match, p1, p2) => p1 + p2.replace(/./g, '*'))}</strong></p>
                    <div style={{marginTop: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem'}}>
                      <input 
                        className="sf-input" 
                        style={{textAlign: 'center', letterSpacing: '0.5rem', fontSize: '1.5rem', width: '200px', fontWeight: 'bold'}}
                        placeholder="000000" 
                        maxLength={6} 
                        value={otp} 
                        onChange={e => setOtp(e.target.value.replace(/\D/, ''))} 
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── STEP 3: Create Password ── */}
            {step === 3 && (
              <div className="form-grid">
                <div className="field-group col-span-2">
                  <label>Password <span className="req">*</span></label>
                  <input className={`sf-input ${errors.password ? 'err' : ''}`} type="password" placeholder="Create a strong password" value={form.password} onChange={e => set('password', e.target.value)} />
                  {errors.password && <span className="err-msg">{errors.password}</span>}
                  
                  <div style={{marginTop: '0.5rem', fontSize: '0.85rem', color: '#666'}}>
                    <div style={{color: form.password.length >= 8 ? 'green' : 'inherit'}}>
                      {form.password.length >= 8 ? '✓' : '○'} At least 8 characters
                    </div>
                    <div style={{color: /[A-Z]/.test(form.password) ? 'green' : 'inherit'}}>
                      {/[A-Z]/.test(form.password) ? '✓' : '○'} Uppercase letter
                    </div>
                    <div style={{color: /[a-z]/.test(form.password) ? 'green' : 'inherit'}}>
                      {/[a-z]/.test(form.password) ? '✓' : '○'} Lowercase letter
                    </div>
                    <div style={{color: /[0-9]/.test(form.password) ? 'green' : 'inherit'}}>
                      {/[0-9]/.test(form.password) ? '✓' : '○'} Number
                    </div>
                    <div style={{color: /[^A-Za-z0-9]/.test(form.password) ? 'green' : 'inherit'}}>
                      {/[^A-Za-z0-9]/.test(form.password) ? '✓' : '○'} Special character
                    </div>
                  </div>
                </div>

                <div className="field-group col-span-2">
                  <label>Confirm Password <span className="req">*</span></label>
                  <input className={`sf-input ${errors.confirmPassword ? 'err' : ''}`} type="password" placeholder="Re-enter password" value={form.confirmPassword} onChange={e => set('confirmPassword', e.target.value)} />
                  {errors.confirmPassword && <span className="err-msg">{errors.confirmPassword}</span>}
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="form-nav">
              {step > 1 ? (
                <button type="button" className="back-btn" onClick={back}>
                  <ChevronLeft size={18}/> Back
                </button>
              ) : (
                <button type="button" className="back-btn" onClick={() => navigate('/')}>
                  <ChevronLeft size={18}/> Login
                </button>
              )}

              {step === 1 ? (
                <button type="button" className="next-btn" onClick={sendOtp} disabled={otpStatus === 'sending'}>
                  {otpStatus === 'sending' ? 'Sending...' : 'Send Verification Code'} <ChevronRight size={18}/>
                </button>
              ) : step === 2 ? (
                <div style={{display: 'flex', gap: '10px', marginLeft: 'auto'}}>
                  <button type="button" className="back-btn" onClick={sendOtp} disabled={otpStatus === 'sending'}>
                     {otpStatus === 'sending' ? 'Sending...' : 'Resend Code'}
                  </button>
                  <button type="button" className="next-btn" onClick={verifyOtp} disabled={verifyStatus === 'verifying'}>
                    {verifyStatus === 'verifying' ? 'Verifying...' : 'Verify Email'} <ChevronRight size={18}/>
                  </button>
                </div>
              ) : step < STEPS.length ? (
                <button type="button" className="next-btn" onClick={next}>
                  Next <ChevronRight size={18}/>
                </button>
              ) : (
                <button type="submit" className="next-btn submit-btn">
                  Create Account <CheckCircle2 size={18}/>
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
