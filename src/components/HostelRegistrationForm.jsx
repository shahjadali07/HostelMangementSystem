import React, { useState } from 'react';
import {
  User, BookOpen, Home, FileText, Camera, PenLine, Upload, ChevronRight,
  ChevronLeft, CheckCircle2, X
} from 'lucide-react';
import '../pages/StudentApplication.css';

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

export default function HostelRegistrationForm({ user, onSuccess }) {
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState({
    // Step 1 - Personal
    gender: '',
    dob: '',
    aadhaar: '',
    category: '',
    // Step 2 - Academic
    department: '',
    year: '',
    jeeApplicationNo: '',
    cuetApplicationNo: '',
    enrollmentNo: '',
    // Step 3 - Parent & Address
    fatherName: '',
    motherName: '',
    parentPhone: '',
    parentEmail: '',
    permanentAddress: '',
    city: '',
    state: '',
    pincode: '',
    // Step 4 - Documents
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

  const validate = () => {
    const e = {};
    if (step === 1) {
      if (!form.gender) e.gender = 'Required';
      if (!form.dob) e.dob = 'Required';
      if (!form.aadhaar || form.aadhaar.length !== 12) e.aadhaar = 'Valid 12-digit Aadhaar required';
      if (!form.category) e.category = 'Required';
    }
    if (step === 2) {
      if (!form.department) e.department = 'Required';
      if (!form.year) e.year = 'Required';
    }
    if (step === 3) {
      if (!form.fatherName) e.fatherName = 'Required';
      if (!form.parentPhone || !/^\d{10}$/.test(form.parentPhone)) e.parentPhone = 'Valid 10-digit phone required';
      if (!form.permanentAddress) e.permanentAddress = 'Required';
      if (!form.city) e.city = 'Required';
      if (!form.state) e.state = 'Required';
      if (!form.pincode || !/^\d{6}$/.test(form.pincode)) e.pincode = 'Valid 6-digit pincode required';
    }
    if (step === 4) {
      if (!form.photo) e.photo = 'Photo is required';
      if (!form.signature) e.signature = 'Signature is required';
      if (!form.aadhaarDoc) e.aadhaarDoc = 'Aadhaar document is required';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => { if (validate()) setStep(s => s + 1); };
  const back = () => setStep(s => s - 1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      Object.keys(form).forEach(key => {
        if (key !== 'photo' && key !== 'signature' && key !== 'aadhaarDoc' && key !== 'documents') {
          formData.append(key, form[key]);
        }
      });
      if (form.photo) formData.append('photo', form.photo);
      if (form.signature) formData.append('signature', form.signature);
      if (form.aadhaarDoc) formData.append('aadhaarDoc', form.aadhaarDoc);
      form.documents.forEach(doc => formData.append('documents', doc));

      const token = localStorage.getItem('studentToken') || localStorage.getItem('token');
      const res = await fetch('/api/student/application', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      const data = await res.json();
      if (data.success) {
        onSuccess(data);
      } else {
        alert(data.message || 'Error submitting application');
      }
    } catch (err) {
      console.error(err);
      alert('Unable to connect to the server');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="signup-form-section" style={{ width: '100%', maxWidth: '900px', margin: '0 auto', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)', borderRadius: '12px', minHeight: 'unset', padding: '0' }}>
      <div className="signup-form-container" style={{ margin: '0' }}>
        <div className="signup-form-header">
          <div className="step-indicator">Step {step} of {STEPS.length}</div>
          <h2>{STEPS[step - 1].title}</h2>
          <div className="step-bar">
            <div className="step-bar-fill" style={{ width: `${(step / STEPS.length) * 100}%` }} />
          </div>
        </div>

        <form onSubmit={step === STEPS.length ? handleSubmit : e => e.preventDefault()}>

          {/* STEP 1: Personal Info */}
          {step === 1 && (
            <div className="form-grid">
              <div className="field-group col-span-2">
                <label>Full Name</label>
                <input className="sf-input" value={user?.fullName || ''} disabled style={{ backgroundColor: '#f3f4f6' }} />
              </div>
              <div className="field-group">
                <label>Email Address</label>
                <input className="sf-input" value={user?.email || ''} disabled style={{ backgroundColor: '#f3f4f6' }} />
              </div>
              <div className="field-group">
                <label>Phone Number</label>
                <input className="sf-input" value={user?.phone || ''} disabled style={{ backgroundColor: '#f3f4f6' }} />
              </div>
              <div className="field-group">
                <label>Gender <span className="req">*</span></label>
                <div className="radio-group">
                  <label className={`radio-btn ${form.gender === 'Male' ? 'selected' : ''}`}>
                    <input type="radio" name="gender" value="Male" checked={form.gender === 'Male'} onChange={e => set('gender', e.target.value)} />
                    Male
                  </label>
                  <label className={`radio-btn ${form.gender === 'Female' ? 'selected' : ''}`}>
                    <input type="radio" name="gender" value="Female" checked={form.gender === 'Female'} onChange={e => set('gender', e.target.value)} />
                    Female
                  </label>
                  <label className={`radio-btn ${form.gender === 'Other' ? 'selected' : ''}`}>
                    <input type="radio" name="gender" value="Other" checked={form.gender === 'Other'} onChange={e => set('gender', e.target.value)} />
                    Other
                  </label>
                </div>
                {errors.gender && <span className="err-msg">{errors.gender}</span>}
              </div>
              <div className="field-group">
                <label>Date of Birth <span className="req">*</span></label>
                <input type="date" className={`sf-input ${errors.dob ? 'err' : ''}`} value={form.dob} onChange={e => set('dob', e.target.value)} />
                {errors.dob && <span className="err-msg">{errors.dob}</span>}
              </div>
              <div className="field-group">
                <label>Aadhaar Number <span className="req">*</span></label>
                <input className={`sf-input ${errors.aadhaar ? 'err' : ''}`} placeholder="12-digit Aadhaar" maxLength={12} value={form.aadhaar} onChange={e => set('aadhaar', e.target.value.replace(/\D/, ''))} />
                {errors.aadhaar && <span className="err-msg">{errors.aadhaar}</span>}
              </div>
              <div className="field-group">
                <label>Category <span className="req">*</span></label>
                <select className={`sf-input ${errors.category ? 'err' : ''}`} value={form.category} onChange={e => set('category', e.target.value)}>
                  <option value="">Select Category</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                {errors.category && <span className="err-msg">{errors.category}</span>}
              </div>
            </div>
          )}

          {/* STEP 2: Academic Info */}
          {step === 2 && (
            <div className="form-grid">
              <div className="field-group col-span-2">
                <label>Department / Course <span className="req">*</span></label>
                <select className={`sf-input ${errors.department ? 'err' : ''}`} value={form.department} onChange={e => set('department', e.target.value)}>
                  <option value="">Select Department</option>
                  {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                {errors.department && <span className="err-msg">{errors.department}</span>}
              </div>
              <div className="field-group col-span-2">
                <label>Year of Study <span className="req">*</span></label>
                <div className="radio-group flex-wrap">
                  {YEARS.map(y => (
                    <label key={y.value} className={`radio-btn ${form.year === y.value ? 'selected' : ''}`}>
                      <input type="radio" name="year" value={y.value} checked={form.year === y.value} onChange={e => set('year', e.target.value)} />
                      {y.label}
                    </label>
                  ))}
                </div>
                {errors.year && <span className="err-msg">{errors.year}</span>}
              </div>
              <div className="field-group">
                <label>JEE Application No. {form.year === '1st' && <span className="req">*</span>}</label>
                <input className={`sf-input ${errors.jeeApplicationNo ? 'err' : ''}`} placeholder="If applicable" value={form.jeeApplicationNo} onChange={e => set('jeeApplicationNo', e.target.value)} />
                {errors.jeeApplicationNo && <span className="err-msg">{errors.jeeApplicationNo}</span>}
              </div>
              <div className="field-group">
                <label>CUET Application No.</label>
                <input className="sf-input" placeholder="If applicable" value={form.cuetApplicationNo} onChange={e => set('cuetApplicationNo', e.target.value)} />
              </div>
              <div className="field-group col-span-2">
                <label>University Enrollment No. (If already allotted)</label>
                <input className="sf-input" placeholder="For 2nd/3rd/Final year students" value={form.enrollmentNo} onChange={e => set('enrollmentNo', e.target.value)} />
              </div>
            </div>
          )}

          {/* STEP 3: Parent & Address */}
          {step === 3 && (
            <div className="form-grid">
              <div className="field-group">
                <label>Father's Name <span className="req">*</span></label>
                <input className={`sf-input ${errors.fatherName ? 'err' : ''}`} placeholder="Father's Name" value={form.fatherName} onChange={e => set('fatherName', e.target.value)} />
                {errors.fatherName && <span className="err-msg">{errors.fatherName}</span>}
              </div>
              <div className="field-group">
                <label>Mother's Name</label>
                <input className="sf-input" placeholder="Mother's Name" value={form.motherName} onChange={e => set('motherName', e.target.value)} />
              </div>
              <div className="field-group">
                <label>Parent/Guardian Phone <span className="req">*</span></label>
                <input className={`sf-input ${errors.parentPhone ? 'err' : ''}`} placeholder="10-digit phone number" value={form.parentPhone} onChange={e => set('parentPhone', e.target.value.replace(/\D/, ''))} maxLength={10} />
                {errors.parentPhone && <span className="err-msg">{errors.parentPhone}</span>}
              </div>
              <div className="field-group">
                <label>Parent/Guardian Email</label>
                <input type="email" className="sf-input" placeholder="Optional" value={form.parentEmail} onChange={e => set('parentEmail', e.target.value)} />
              </div>
              <div className="field-group col-span-2">
                <label>Permanent Address <span className="req">*</span></label>
                <textarea className={`sf-input ${errors.permanentAddress ? 'err' : ''}`} rows={3} placeholder="Full address" value={form.permanentAddress} onChange={e => set('permanentAddress', e.target.value)} />
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

          {/* STEP 4: Documents */}
          {step === 4 && (
            <div className="form-grid">
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
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="form-nav">
            {step > 1 ? (
              <button type="button" className="back-btn" onClick={back}>
                <ChevronLeft size={18}/> Back
              </button>
            ) : <div/>}

            {step < STEPS.length ? (
              <button type="button" className="next-btn" onClick={next}>
                Next <ChevronRight size={18}/>
              </button>
            ) : (
              <button type="submit" className="next-btn submit-btn" disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Submit Registration'} <CheckCircle2 size={18}/>
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
