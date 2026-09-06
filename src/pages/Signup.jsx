import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User, BookOpen, Phone, Home, Tag, BadgeCheck,
  FileText, Camera, PenLine, Upload, ChevronRight,
  ChevronLeft, Building2, CheckCircle2, X
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import './Signup.css';

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
  { id: 2, title: 'Academic Info',   icon: BookOpen },
  { id: 3, title: 'Parent & Address',icon: Home },
  { id: 4, title: 'Documents',       icon: FileText },
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

  const [form, setForm] = useState({
    // Step 1 – Personal
    fullName: '',
    gender: '',
    dob: '',
    phone: '',
    email: '',
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
      if (!form.gender) e.gender = 'Please select gender';
      if (!form.dob) e.dob = 'Date of birth is required';
      if (!form.phone || !/^\d{10}$/.test(form.phone)) e.phone = 'Valid 10-digit phone required';
      if (!form.email || !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Valid email required';
      if (!form.aadhaar || !/^\d{12}$/.test(form.aadhaar)) e.aadhaar = 'Valid 12-digit Aadhaar required';
      if (!form.category) e.category = 'Category is required';
    }
    if (step === 2) {
      if (!form.department) e.department = 'Department is required';
      if (!form.year) e.year = 'Year is required';
      if (needsApplicationNumber(form.year)) {
        if (!form.jeeApplicationNo && !form.cuetApplicationNo)
          e.jeeApplicationNo = 'Provide at least one application number';
      } else {
        if (!form.enrollmentNo.trim()) e.enrollmentNo = 'Enrollment number is required';
      }
    }
    if (step === 3) {
      if (!form.fatherName.trim()) e.fatherName = 'Father name is required';
      if (!form.parentPhone || !/^\d{10}$/.test(form.parentPhone)) e.parentPhone = 'Valid parent phone required';
      if (!form.permanentAddress.trim()) e.permanentAddress = 'Address is required';
      if (!form.city.trim()) e.city = 'City is required';
      if (!form.state.trim()) e.state = 'State is required';
      if (!form.pincode || !/^\d{6}$/.test(form.pincode)) e.pincode = 'Valid 6-digit pincode required';
    }
    if (step === 4) {
      if (!form.photo) e.photo = 'Passport-size photo is required';
      if (!form.signature) e.signature = 'Signature is required';
      if (!form.aadhaarDoc) e.aadhaarDoc = 'Aadhaar document is required';
      if (form.documents.length === 0) e.documents = 'At least one other supporting document is required';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => { if (validate()) setStep(s => s + 1); };
  const back = () => setStep(s => s - 1);
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validate()) {
      try {
        const formData = new FormData();
        
        // Add all text fields
        Object.keys(form).forEach(key => {
          if (key !== 'photo' && key !== 'signature' && key !== 'aadhaarDoc' && key !== 'documents') {
            formData.append(key, form[key] || '');
          }
        });

        // Add file fields
        if (form.photo) formData.append('photo', form.photo);
        if (form.signature) formData.append('signature', form.signature);
        if (form.aadhaarDoc) formData.append('aadhaarDoc', form.aadhaarDoc);
        
        // Add multiple documents
        if (form.documents && form.documents.length > 0) {
          form.documents.forEach(doc => {
            formData.append('documents', doc);
          });
        }

        const response = await fetch('/api/applications/register', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          let errorMsg = 'Unknown error';
          try {
            const data = await response.json();
            errorMsg = data.message || data.error || `HTTP ${response.status}`;
          } catch(e) {
            errorMsg = `Server error: HTTP ${response.status}`;
          }
          if (response.status === 409) {
            alert(errorMsg);
          } else {
            alert('Registration failed: ' + errorMsg);
          }
          return;
        }

        const data = await response.json();

        if (data.success) {
          setSubmitted(true);
        } else {
          alert('Registration failed: ' + (data.message || data.error || 'Unknown error'));
        }
      } catch (error) {
        console.error('Submit error:', error);
        if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
          alert('Unable to connect to the server. Please try again.');
        } else {
          alert('An error occurred during submission.');
        }
      }
    }
  };

  if (submitted) {
    return (
      <div className="signup-success-screen">
        <div className="success-card">
          <CheckCircle2 size={64} className="success-icon" />
          <h2>Registration Submitted!</h2>
          <p>Your hostel registration has been submitted successfully. You will receive a confirmation on <strong>{form.email}</strong> once approved by the warden.</p>
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
                  <input className={`sf-input ${errors.fullName ? 'err' : ''}`} placeholder="As per Aadhaar card" value={form.fullName} onChange={e => set('fullName', e.target.value)} />
                  {errors.fullName && <span className="err-msg">{errors.fullName}</span>}
                </div>

                <div className="field-group">
                  <label>Gender <span className="req">*</span></label>
                  <select className={`sf-input ${errors.gender ? 'err' : ''}`} value={form.gender} onChange={e => set('gender', e.target.value)}>
                    <option value="">Select gender</option>
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                  {errors.gender && <span className="err-msg">{errors.gender}</span>}
                </div>

                <div className="field-group">
                  <label>Date of Birth <span className="req">*</span></label>
                  <input className={`sf-input ${errors.dob ? 'err' : ''}`} type="date" value={form.dob} onChange={e => set('dob', e.target.value)} />
                  {errors.dob && <span className="err-msg">{errors.dob}</span>}
                </div>

                <div className="field-group">
                  <label>Mobile Number <span className="req">*</span></label>
                  <input className={`sf-input ${errors.phone ? 'err' : ''}`} placeholder="10-digit mobile" maxLength={10} value={form.phone} onChange={e => set('phone', e.target.value.replace(/\D/, ''))} />
                  {errors.phone && <span className="err-msg">{errors.phone}</span>}
                </div>

                <div className="field-group">
                  <label>Email Address <span className="req">*</span></label>
                  <input className={`sf-input ${errors.email ? 'err' : ''}`} type="email" placeholder="your@email.com" value={form.email} onChange={e => set('email', e.target.value)} />
                  {errors.email && <span className="err-msg">{errors.email}</span>}
                </div>

                <div className="field-group">
                  <label>Aadhaar Number <span className="req">*</span></label>
                  <input className={`sf-input ${errors.aadhaar ? 'err' : ''}`} placeholder="12-digit Aadhaar" maxLength={12} value={form.aadhaar} onChange={e => set('aadhaar', e.target.value.replace(/\D/, ''))} />
                  {errors.aadhaar && <span className="err-msg">{errors.aadhaar}</span>}
                </div>

                <div className="field-group">
                  <label>Category <span className="req">*</span></label>
                  <select className={`sf-input ${errors.category ? 'err' : ''}`} value={form.category} onChange={e => set('category', e.target.value)}>
                    <option value="">Select category</option>
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                  {errors.category && <span className="err-msg">{errors.category}</span>}
                </div>
              </div>
            )}

            {/* ── STEP 2: Academic Info ── */}
            {step === 2 && (
              <div className="form-grid">
                <div className="field-group col-span-2">
                  <label>Department <span className="req">*</span></label>
                  <select className={`sf-input ${errors.department ? 'err' : ''}`} value={form.department} onChange={e => set('department', e.target.value)}>
                    <option value="">Select department</option>
                    {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
                  </select>
                  {errors.department && <span className="err-msg">{errors.department}</span>}
                </div>

                <div className="field-group col-span-2">
                  <label>Academic Year <span className="req">*</span></label>
                  <div className="year-options">
                    {YEARS.map(y => (
                      <button type="button" key={y.value}
                        className={`year-pill ${form.year === y.value ? 'selected' : ''}`}
                        onClick={() => { set('year', y.value); set('jeeApplicationNo', ''); set('cuetApplicationNo', ''); set('enrollmentNo', ''); }}>
                        {y.label}
                      </button>
                    ))}
                  </div>
                  {errors.year && <span className="err-msg">{errors.year}</span>}
                </div>

                {/* Conditional: 1st or 2nd Lateral → Application Numbers */}
                {needsApplicationNumber(form.year) && (
                  <>
                    <div className="field-group col-span-2">
                      <div className="conditional-banner">
                        📋 As a <strong>{form.year === '1st' ? '1st Year' : '2nd Year Lateral Entry'}</strong> student, provide at least one application number.
                      </div>
                    </div>
                    <div className="field-group">
                      <label>JEE Main Application Number</label>
                      <input className={`sf-input ${errors.jeeApplicationNo ? 'err' : ''}`} placeholder="e.g. 230110XXXXXXX" value={form.jeeApplicationNo} onChange={e => set('jeeApplicationNo', e.target.value)} />
                    </div>
                    <div className="field-group">
                      <label>CUET UG Application Number</label>
                      <input className="sf-input" placeholder="e.g. 23CU XXXXXXXX" value={form.cuetApplicationNo} onChange={e => set('cuetApplicationNo', e.target.value)} />
                    </div>
                    {errors.jeeApplicationNo && <div className="col-span-2"><span className="err-msg">{errors.jeeApplicationNo}</span></div>}
                  </>
                )}

                {/* Other years → Enrollment Number */}
                {form.year && !needsApplicationNumber(form.year) && (
                  <div className="field-group col-span-2">
                    <label>Enrollment Number <span className="req">*</span></label>
                    <input className={`sf-input ${errors.enrollmentNo ? 'err' : ''}`} placeholder="University Enrollment Number" value={form.enrollmentNo} onChange={e => set('enrollmentNo', e.target.value)} />
                    {errors.enrollmentNo && <span className="err-msg">{errors.enrollmentNo}</span>}
                  </div>
                )}
              </div>
            )}

            {/* ── STEP 3: Parent & Address ── */}
            {step === 3 && (
              <div className="form-grid">
                <div className="section-label col-span-2">Parent / Guardian Details</div>
                <div className="field-group">
                  <label>Father's Name <span className="req">*</span></label>
                  <input className={`sf-input ${errors.fatherName ? 'err' : ''}`} placeholder="Father's full name" value={form.fatherName} onChange={e => set('fatherName', e.target.value)} />
                  {errors.fatherName && <span className="err-msg">{errors.fatherName}</span>}
                </div>
                <div className="field-group">
                  <label>Mother's Name</label>
                  <input className="sf-input" placeholder="Mother's full name" value={form.motherName} onChange={e => set('motherName', e.target.value)} />
                </div>
                <div className="field-group">
                  <label>Parent's Mobile <span className="req">*</span></label>
                  <input className={`sf-input ${errors.parentPhone ? 'err' : ''}`} placeholder="10-digit mobile" maxLength={10} value={form.parentPhone} onChange={e => set('parentPhone', e.target.value.replace(/\D/, ''))} />
                  {errors.parentPhone && <span className="err-msg">{errors.parentPhone}</span>}
                </div>
                <div className="field-group">
                  <label>Parent's Email</label>
                  <input className="sf-input" type="email" placeholder="parent@email.com" value={form.parentEmail} onChange={e => set('parentEmail', e.target.value)} />
                </div>

                <div className="section-label col-span-2" style={{marginTop: '8px'}}>Permanent Address</div>
                <div className="field-group col-span-2">
                  <label>Street Address <span className="req">*</span></label>
                  <textarea className={`sf-input sf-textarea ${errors.permanentAddress ? 'err' : ''}`} placeholder="House No., Street, Locality..." rows={2} value={form.permanentAddress} onChange={e => set('permanentAddress', e.target.value)} />
                  {errors.permanentAddress && <span className="err-msg">{errors.permanentAddress}</span>}
                </div>
                <div className="field-group">
                  <label>City <span className="req">*</span></label>
                  <input className={`sf-input ${errors.city ? 'err' : ''}`} placeholder="City" value={form.city} onChange={e => set('city', e.target.value)} />
                  {errors.city && <span className="err-msg">{errors.city}</span>}
                </div>
                <div className="field-group">
                  <label>State <span className="req">*</span></label>
                  <input className={`sf-input ${errors.state ? 'err' : ''}`} placeholder="State" value={form.state} onChange={e => set('state', e.target.value)} />
                  {errors.state && <span className="err-msg">{errors.state}</span>}
                </div>
                <div className="field-group">
                  <label>Pincode <span className="req">*</span></label>
                  <input className={`sf-input ${errors.pincode ? 'err' : ''}`} placeholder="6-digit pincode" maxLength={6} value={form.pincode} onChange={e => set('pincode', e.target.value.replace(/\D/, ''))} />
                  {errors.pincode && <span className="err-msg">{errors.pincode}</span>}
                </div>
              </div>
            )}

            {/* ── STEP 4: Documents ── */}
            {step === 4 && (
              <div className="form-grid">
                {/* Photo */}
                <div className="field-group">
                  <label><Camera size={14}/> Passport Photo <span className="req">*</span></label>
                  <div className={`file-drop-zone ${errors.photo ? 'err-border' : ''}`}>
                    {form.photo ? (
                      <div className="file-preview-img">
                        <img src={URL.createObjectURL(form.photo)} alt="Photo" />
                        <button type="button" className="remove-file" onClick={() => set('photo', null)}><X size={14}/></button>
                      </div>
                    ) : (
                      <label className="file-drop-inner" htmlFor="photoInput">
                        <Camera size={28} className="upload-icon" />
                        <span>Click to upload photo</span>
                        <span className="file-hint">JPG / PNG, max 2 MB</span>
                        <input id="photoInput" type="file" accept="image/*" hidden onChange={e => handleFile('photo', e.target.files[0])} />
                      </label>
                    )}
                  </div>
                  {errors.photo && <span className="err-msg">{errors.photo}</span>}
                </div>

                {/* Signature */}
                <div className="field-group">
                  <label><PenLine size={14}/> Signature <span className="req">*</span></label>
                  <div className={`file-drop-zone ${errors.signature ? 'err-border' : ''}`}>
                    {form.signature ? (
                      <div className="file-preview-img sig-preview">
                        <img src={URL.createObjectURL(form.signature)} alt="Signature" />
                        <button type="button" className="remove-file" onClick={() => set('signature', null)}><X size={14}/></button>
                      </div>
                    ) : (
                      <label className="file-drop-inner" htmlFor="sigInput">
                        <PenLine size={28} className="upload-icon" />
                        <span>Click to upload signature</span>
                        <span className="file-hint">White background, max 1 MB</span>
                        <input id="sigInput" type="file" accept="image/*" hidden onChange={e => handleFile('signature', e.target.files[0])} />
                      </label>
                    )}
                  </div>
                  {errors.signature && <span className="err-msg">{errors.signature}</span>}
                </div>

                {/* Aadhaar Document */}
                <div className="field-group">
                  <label><FileText size={14}/> Aadhaar Document <span className="req">*</span></label>
                  <div className={`file-drop-zone ${errors.aadhaarDoc ? 'err-border' : ''}`}>
                    {form.aadhaarDoc ? (
                      <div className="file-preview-img sig-preview">
                        <FileText size={48} color="#5142f5" />
                        <span style={{marginTop: 8, fontSize: 12, fontWeight: 500}}>{form.aadhaarDoc.name}</span>
                        <button type="button" className="remove-file" onClick={() => set('aadhaarDoc', null)}><X size={14}/></button>
                      </div>
                    ) : (
                      <label className="file-drop-inner" htmlFor="aadhaarDocInput">
                        <Upload size={28} className="upload-icon" />
                        <span>Upload Aadhaar Card</span>
                        <span className="file-hint">PDF / JPG / PNG, max 2 MB</span>
                        <input id="aadhaarDocInput" type="file" accept=".pdf,image/*" hidden onChange={e => handleFile('aadhaarDoc', e.target.files[0])} />
                      </label>
                    )}
                  </div>
                  {errors.aadhaarDoc && <span className="err-msg">{errors.aadhaarDoc}</span>}
                </div>

                {/* Supporting Documents */}
                <div className="field-group col-span-2">
                  <label><Upload size={14}/> Other Supporting Documents <span className="req">*</span></label>
                  <p className="field-hint">Upload at least one other document (e.g., previous marksheets, income certificate, caste certificate).</p>
                  <label className={`docs-upload-zone ${errors.documents ? 'err-border' : ''}`} htmlFor="docsInput">
                    <Upload size={24} className="upload-icon" />
                    <span>Click to add documents</span>
                    <span className="file-hint">PDF / JPG / PNG, multiple files allowed</span>
                    <input id="docsInput" type="file" accept=".pdf,image/*" multiple hidden onChange={e => handleMultiFile(e.target.files)} />
                  </label>
                  {errors.documents && <span className="err-msg" style={{marginTop: '4px'}}>{errors.documents}</span>}
                  {form.documents.length > 0 && (
                    <ul className="doc-list">
                      {form.documents.map((f, i) => (
                        <li key={i} className="doc-item">
                          <FileText size={16} />
                          <span className="doc-name">{f.name}</span>
                          <span className="doc-size">{(f.size / 1024).toFixed(1)} KB</span>
                          <button type="button" className="remove-doc" onClick={() => removeDoc(i)}><X size={14}/></button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Declaration */}
                <div className="field-group col-span-2">
                  <div className="declaration-box">
                    <input type="checkbox" id="declaration" required />
                    <label htmlFor="declaration">
                      I hereby declare that all information provided is true and correct to the best of my knowledge. I understand that any false information may result in cancellation of my hostel admission.
                    </label>
                  </div>
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

              {step < STEPS.length ? (
                <button type="button" className="next-btn" onClick={next}>
                  Next <ChevronRight size={18}/>
                </button>
              ) : (
                <button type="submit" className="next-btn submit-btn">
                  Submit Registration <CheckCircle2 size={18}/>
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
