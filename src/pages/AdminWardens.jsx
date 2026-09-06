import React, { useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { useApp, HOSTELS } from '../context/AppContext';
import {
  ShieldCheck, Plus, Edit2, Trash2, Eye, EyeOff, RotateCcw,
  X, Check, AlertTriangle, ChevronDown, Search, Filter, User
} from 'lucide-react';
import './AdminWardens.css';

// ─── Toast Notification ───────────────────────────────────────────────────
function Toast({ msg, type, onClose }) {
  if (!msg) return null;
  return (
    <div className={`warden-toast warden-toast-${type}`}>
      {type === 'success' ? <Check size={16} /> : <AlertTriangle size={16} />}
      <span>{msg}</span>
      <button onClick={onClose}><X size={14} /></button>
    </div>
  );
}

// ─── Status Badge ─────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const cls = status === 'ACTIVE' ? 'warden-badge-active' : status === 'INACTIVE' ? 'warden-badge-inactive' : 'warden-badge-deleted';
  return <span className={`warden-badge ${cls}`}>{status}</span>;
}

// ─── Position Badge ───────────────────────────────────────────────────────
function PositionBadge({ position }) {
  return (
    <span className="warden-position-badge">
      {position === 'WARDEN_1' ? 'Warden 1' : 'Warden 2'}
    </span>
  );
}

// ─── Add / Edit Warden Modal ──────────────────────────────────────────────
function WardenModal({ initialData, defaultHostelId, onClose, onSave }) {
  const [form, setForm] = useState({
    fullName: '', email: '', phone: '',
    employeeId: '', designation: '',
    hostelId: defaultHostelId || '',
    position: 'WARDEN_1', status: 'ACTIVE',
    password: '', confirmPassword: '',
    ...initialData,
    // Don't pre-fill password on edit
    password: '', confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [showPw, setShowPw] = useState(false);
  const isEdit = !!initialData?.id;

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const validate = () => {
    const e = {};
    if (!form.fullName.trim()) e.fullName = 'Required';
    if (!form.email.trim()) e.email = 'Required';
    if (!form.phone.trim()) e.phone = 'Required';
    if (!form.employeeId.trim()) e.employeeId = 'Required';
    if (!form.hostelId) e.hostelId = 'Required';
    if (!isEdit) {
      if (!form.password) e.password = 'Required';
      if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    onSave({ ...form, passwordHash: form.password || initialData?.passwordHash });
  };

  const boysHostels = HOSTELS.filter(h => h.category === 'BOYS');
  const girlsHostels = HOSTELS.filter(h => h.category === 'GIRLS');

  return (
    <div className="warden-modal-overlay" onClick={onClose}>
      <div className="warden-modal" onClick={e => e.stopPropagation()}>
        <div className="warden-modal-header">
          <h2>{isEdit ? 'Edit Warden' : '+ Add Warden'}</h2>
          <button className="warden-close-btn" onClick={onClose}><X size={20} /></button>
        </div>
        <div className="warden-modal-body">
          {/* Personal Information */}
          <div className="warden-form-section">
            <h3>Personal Information</h3>
            <div className="warden-form-grid">
              <div className={`warden-field ${errors.fullName ? 'error' : ''}`}>
                <label>Full Name *</label>
                <input value={form.fullName} onChange={e => set('fullName', e.target.value)} placeholder="Dr. Raj Kumar" />
                {errors.fullName && <span className="field-error">{errors.fullName}</span>}
              </div>
              <div className={`warden-field ${errors.email ? 'error' : ''}`}>
                <label>Email Address *</label>
                <input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="warden@hostel.edu" />
                {errors.email && <span className="field-error">{errors.email}</span>}
              </div>
              <div className={`warden-field ${errors.phone ? 'error' : ''}`}>
                <label>Phone Number *</label>
                <input value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="98XXXXXXXX" />
                {errors.phone && <span className="field-error">{errors.phone}</span>}
              </div>
            </div>
          </div>

          {/* Professional Information */}
          <div className="warden-form-section">
            <h3>Professional Information</h3>
            <div className="warden-form-grid">
              <div className={`warden-field ${errors.employeeId ? 'error' : ''}`}>
                <label>Employee ID *</label>
                <input value={form.employeeId} onChange={e => set('employeeId', e.target.value)} placeholder="EMP-XXX" />
                {errors.employeeId && <span className="field-error">{errors.employeeId}</span>}
              </div>
              <div className="warden-field">
                <label>Designation</label>
                <input value={form.designation} onChange={e => set('designation', e.target.value)} placeholder="Chief Warden / Resident Warden" />
              </div>
              <div className={`warden-field ${errors.hostelId ? 'error' : ''}`}>
                <label>Hostel *</label>
                <select value={form.hostelId} onChange={e => set('hostelId', e.target.value)}>
                  <option value="">— Select Hostel —</option>
                  <optgroup label="Boys' Hostels">
                    {boysHostels.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
                  </optgroup>
                  <optgroup label="Girls' Hostels">
                    {girlsHostels.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
                  </optgroup>
                </select>
                {errors.hostelId && <span className="field-error">{errors.hostelId}</span>}
              </div>
              <div className="warden-field">
                <label>Warden Position *</label>
                <select value={form.position} onChange={e => set('position', e.target.value)}>
                  <option value="WARDEN_1">Warden 1</option>
                  <option value="WARDEN_2">Warden 2</option>
                </select>
              </div>
            </div>
          </div>

          {/* Account Information */}
          {!isEdit && (
            <div className="warden-form-section">
              <h3>Account Credentials</h3>
              <div className="warden-form-grid">
                <div className={`warden-field ${errors.password ? 'error' : ''}`}>
                  <label>Password *</label>
                  <div className="pw-input-wrap">
                    <input type={showPw ? 'text' : 'password'} value={form.password} onChange={e => set('password', e.target.value)} placeholder="Minimum 6 characters" />
                    <button type="button" onClick={() => setShowPw(v => !v)}>{showPw ? <EyeOff size={16} /> : <Eye size={16} />}</button>
                  </div>
                  {errors.password && <span className="field-error">{errors.password}</span>}
                </div>
                <div className={`warden-field ${errors.confirmPassword ? 'error' : ''}`}>
                  <label>Confirm Password *</label>
                  <input type={showPw ? 'text' : 'password'} value={form.confirmPassword} onChange={e => set('confirmPassword', e.target.value)} placeholder="Re-enter password" />
                  {errors.confirmPassword && <span className="field-error">{errors.confirmPassword}</span>}
                </div>
              </div>
            </div>
          )}

          {/* Status */}
          <div className="warden-form-section">
            <h3>Status</h3>
            <div className="warden-status-toggle">
              <button className={`status-option ${form.status === 'ACTIVE' ? 'selected-active' : ''}`} onClick={() => set('status', 'ACTIVE')}>Active</button>
              <button className={`status-option ${form.status === 'INACTIVE' ? 'selected-inactive' : ''}`} onClick={() => set('status', 'INACTIVE')}>Inactive</button>
            </div>
          </div>
        </div>
        <div className="warden-modal-footer">
          <button className="warden-cancel-btn" onClick={onClose}>Cancel</button>
          <button className="warden-save-btn" onClick={handleSave}>{isEdit ? 'Save Changes' : 'Create Warden'}</button>
        </div>
      </div>
    </div>
  );
}

// ─── Reset Password Modal ─────────────────────────────────────────────────
function ResetPasswordModal({ warden, onClose, onReset }) {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [err, setErr] = useState('');

  const handleReset = () => {
    if (!password || password.length < 6) { setErr('Password must be at least 6 characters.'); return; }
    if (password !== confirm) { setErr('Passwords do not match.'); return; }
    onReset(warden.id, password);
    onClose();
  };

  return (
    <div className="warden-modal-overlay" onClick={onClose}>
      <div className="warden-modal warden-modal-sm" onClick={e => e.stopPropagation()}>
        <div className="warden-modal-header">
          <h2>Reset Password</h2>
          <button className="warden-close-btn" onClick={onClose}><X size={20} /></button>
        </div>
        <div className="warden-modal-body">
          <p className="reset-subtext">Reset password for <strong>{warden.fullName}</strong></p>
          <div className="warden-field" style={{ marginBottom: 12 }}>
            <label>New Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="New password" />
          </div>
          <div className="warden-field">
            <label>Confirm Password</label>
            <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Confirm password" />
          </div>
          {err && <p className="field-error" style={{ marginTop: 8 }}>{err}</p>}
        </div>
        <div className="warden-modal-footer">
          <button className="warden-cancel-btn" onClick={onClose}>Cancel</button>
          <button className="warden-save-btn" onClick={handleReset}>Reset Password</button>
        </div>
      </div>
    </div>
  );
}

// ─── Delete Confirm Modal ─────────────────────────────────────────────────
function DeleteModal({ warden, onClose, onConfirm }) {
  return (
    <div className="warden-modal-overlay" onClick={onClose}>
      <div className="warden-modal warden-modal-sm" onClick={e => e.stopPropagation()}>
        <div className="warden-modal-header danger">
          <h2>Delete Warden?</h2>
          <button className="warden-close-btn" onClick={onClose}><X size={20} /></button>
        </div>
        <div className="warden-modal-body">
          <p>This will remove <strong>{warden.fullName}</strong>'s access to the Hostel Management System and deactivate their account. Historical records will be preserved.</p>
        </div>
        <div className="warden-modal-footer">
          <button className="warden-cancel-btn" onClick={onClose}>Cancel</button>
          <button className="warden-delete-btn" onClick={() => { onConfirm(warden.id); onClose(); }}>Delete Warden</button>
        </div>
      </div>
    </div>
  );
}

// ─── Warden Card ──────────────────────────────────────────────────────────
function WardenCard({ warden, onEdit, onDelete, onToggleStatus, onResetPw }) {
  const hostel = HOSTELS.find(h => h.id === warden.hostelId);
  return (
    <div className="warden-card">
      <div className="warden-card-header">
        <div className="warden-avatar-wrap">
          <div className="warden-avatar">{warden.fullName.charAt(0)}</div>
          <div>
            <h4>{warden.fullName}</h4>
            <span className="warden-designation">{warden.designation || 'Warden'}</span>
          </div>
        </div>
        <div className="warden-card-badges">
          <PositionBadge position={warden.position} />
          <StatusBadge status={warden.status} />
        </div>
      </div>
      <div className="warden-card-details">
        <div className="wcd-item"><span>Email</span><p>{warden.email}</p></div>
        <div className="wcd-item"><span>Phone</span><p>{'*'.repeat(6) + warden.phone.slice(-4)}</p></div>
        <div className="wcd-item"><span>Employee ID</span><p>{warden.employeeId}</p></div>
        <div className="wcd-item"><span>Hostel</span><p>{hostel?.name}</p></div>
      </div>
      <div className="warden-card-actions">
        <button className="wca-btn wca-edit" onClick={() => onEdit(warden)}><Edit2 size={14} /> Edit</button>
        <button className="wca-btn wca-toggle" onClick={() => onToggleStatus(warden.id)}>
          {warden.status === 'ACTIVE' ? <><EyeOff size={14} /> Deactivate</> : <><Eye size={14} /> Activate</>}
        </button>
        <button className="wca-btn wca-reset" onClick={() => onResetPw(warden)}><RotateCcw size={14} /> Reset PW</button>
        <button className="wca-btn wca-delete" onClick={() => onDelete(warden)}><Trash2 size={14} /> Delete</button>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────
export default function AdminWardens() {
  const { wardens, addWarden, updateWarden, deleteWarden, toggleWardenStatus, resetWardenPassword, getActiveWardenCountByHostel } = useApp();

  const [selectedHostelId, setSelectedHostelId] = useState('raman');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingWarden, setEditingWarden] = useState(null);
  const [deletingWarden, setDeletingWarden] = useState(null);
  const [resetPwWarden, setResetPwWarden] = useState(null);
  const [toast, setToast] = useState({ msg: '', type: 'success' });

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: '', type: 'success' }), 4000);
  };

  const selectedHostel = HOSTELS.find(h => h.id === selectedHostelId);
  const activeCount = getActiveWardenCountByHostel(selectedHostelId);

  // Wardens for selected hostel (excluding DELETED)
  const hostelWardens = wardens.filter(w => w.hostelId === selectedHostelId && w.status !== 'DELETED');

  // All-wardens search view
  const allSearchWardens = wardens.filter(w => {
    if (w.status === 'DELETED') return false;
    const matchSearch = !searchTerm || w.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.employeeId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'ALL' || w.status === statusFilter;
    const hostel = HOSTELS.find(h => h.id === w.hostelId);
    const matchCategory = categoryFilter === 'ALL' || hostel?.category === categoryFilter;
    return matchSearch && matchStatus && matchCategory;
  });

  const handleAddWarden = (formData) => {
    const hostelName = HOSTELS.find(h => h.id === formData.hostelId)?.name;
    const result = addWarden(formData);
    if (result.success) {
      setShowAddModal(false);
      showToast(`${hostelName} Warden created successfully.`);
    } else {
      showToast(result.error, 'error');
    }
  };

  const handleEditWarden = (formData) => {
    const original = wardens.find(w => w.id === formData.id);
    const hostelChanged = formData.hostelId !== original?.hostelId;
    const fromName = HOSTELS.find(h => h.id === original?.hostelId)?.name;
    const toName = HOSTELS.find(h => h.id === formData.hostelId)?.name;

    if (hostelChanged && !window.confirm(`Move this warden from ${fromName} to ${toName}?`)) return;

    const result = updateWarden(formData.id, formData);
    if (result.success) {
      setEditingWarden(null);
      showToast(hostelChanged ? `Warden reassigned to ${toName}.` : 'Warden details updated successfully.');
    } else {
      showToast(result.error, 'error');
    }
  };

  const handleDelete = (wardenId) => {
    deleteWarden(wardenId);
    showToast('Warden removed successfully.');
  };

  const handleToggle = (wardenId) => {
    toggleWardenStatus(wardenId);
    showToast('Warden status updated.');
  };

  const handleResetPw = (wardenId, newPassword) => {
    resetWardenPassword(wardenId, newPassword);
    showToast('Warden password updated successfully.');
  };

  const boysHostels = HOSTELS.filter(h => h.category === 'BOYS');
  const girlsHostels = HOSTELS.filter(h => h.category === 'GIRLS');
  const isSearchMode = searchTerm.length > 0;

  return (
    <DashboardLayout>
      <Toast msg={toast.msg} type={toast.type} onClose={() => setToast({ msg: '' })} />

      <div className="admin-page-header">
        <div>
          <h1><ShieldCheck size={22} className="page-title-icon" /> Warden Management</h1>
          <p>Manage wardens across all 12 hostels.</p>
        </div>
      </div>

      {/* ── Hostel Overview Grid ─────────────────────────────────────── */}
      <div className="hostel-overview-section">
        <div className="hostel-cat-tabs">
          <button className={`hcat-btn ${categoryFilter !== 'GIRLS' ? 'active' : ''}`} onClick={() => setCategoryFilter(categoryFilter === 'BOYS' ? 'ALL' : 'BOYS')}>🏫 Boys' Hostels</button>
          <button className={`hcat-btn ${categoryFilter !== 'BOYS' ? 'active' : ''}`} onClick={() => setCategoryFilter(categoryFilter === 'GIRLS' ? 'ALL' : 'GIRLS')}>🏠 Girls' Hostels</button>
        </div>

        {(categoryFilter === 'ALL' || categoryFilter === 'BOYS') && (
          <>
            <p className="hostel-category-label">Boys' Hostels</p>
            <div className="hostel-overview-grid">
              {boysHostels.map(h => {
                const count = getActiveWardenCountByHostel(h.id);
                return (
                  <div key={h.id} className={`hostel-overview-card ${selectedHostelId === h.id ? 'selected' : ''}`} onClick={() => setSelectedHostelId(h.id)}>
                    <div className="hoc-name">{h.name}</div>
                    <div className="hoc-meta">
                      <span className={`hoc-count ${count === 2 ? 'full' : count === 0 ? 'empty' : ''}`}>Wardens: {count}/2</span>
                      <span className="hoc-students">{h.students} Students</span>
                    </div>
                    <button className="hoc-manage-btn">Manage →</button>
                  </div>
                );
              })}
            </div>
          </>
        )}
        {(categoryFilter === 'ALL' || categoryFilter === 'GIRLS') && (
          <>
            <p className="hostel-category-label" style={{ marginTop: 20 }}>Girls' Hostels</p>
            <div className="hostel-overview-grid">
              {girlsHostels.map(h => {
                const count = getActiveWardenCountByHostel(h.id);
                return (
                  <div key={h.id} className={`hostel-overview-card ${selectedHostelId === h.id ? 'selected' : ''}`} onClick={() => setSelectedHostelId(h.id)}>
                    <div className="hoc-name">{h.name}</div>
                    <div className="hoc-meta">
                      <span className={`hoc-count ${count === 2 ? 'full' : count === 0 ? 'empty' : ''}`}>Wardens: {count}/2</span>
                      <span className="hoc-students">{h.students} Students</span>
                    </div>
                    <button className="hoc-manage-btn">Manage →</button>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* ── Search & Filter Bar ──────────────────────────────────────── */}
      <div className="warden-filter-bar">
        <div className="search-box">
          <Search size={16} className="search-icon" />
          <input type="text" placeholder="Search by name, email, or employee ID..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>
        <div className="filter-dropdown">
          <Filter size={16} className="filter-icon" />
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="ALL">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </div>
      </div>

      {/* ── Hostel Warden Detail Panel ───────────────────────────────── */}
      {!isSearchMode && (
        <div className="warden-hostel-panel">
          <div className="whp-header">
            <div>
              <h2>{selectedHostel?.name}</h2>
              <span className={`whp-count-badge ${activeCount === 2 ? 'full' : activeCount === 0 ? 'empty' : 'partial'}`}>
                {activeCount} / 2 Active Wardens
              </span>
            </div>
            <button
              className="add-warden-btn"
              onClick={() => { if (activeCount < 2) setShowAddModal(true); }}
              disabled={activeCount >= 2}
              title={activeCount >= 2 ? 'Maximum 2 wardens can be assigned to this hostel.' : ''}
            >
              <Plus size={16} /> Add Warden
            </button>
          </div>
          {activeCount >= 2 && (
            <div className="warden-limit-notice">
              <AlertTriangle size={15} /> Maximum 2 wardens can be assigned to this hostel.
            </div>
          )}

          {hostelWardens.length === 0 ? (
            <div className="warden-empty-state">
              <User size={40} />
              <h3>No Wardens Assigned</h3>
              <p>This hostel currently has no active wardens.</p>
              <button className="add-warden-btn" onClick={() => setShowAddModal(true)}><Plus size={16} /> Add Warden</button>
            </div>
          ) : (
            <div className="warden-cards-grid">
              {hostelWardens.map(w => (
                <WardenCard
                  key={w.id}
                  warden={w}
                  onEdit={setEditingWarden}
                  onDelete={setDeletingWarden}
                  onToggleStatus={handleToggle}
                  onResetPw={setResetPwWarden}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Search Results ───────────────────────────────────────────── */}
      {isSearchMode && (
        <div className="warden-hostel-panel">
          <h2 style={{ marginBottom: 16 }}>Search Results ({allSearchWardens.length})</h2>
          {allSearchWardens.length === 0 ? (
            <div className="warden-empty-state">
              <Search size={40} />
              <h3>No Wardens Found</h3>
              <p>Try a different name, email, or employee ID.</p>
            </div>
          ) : (
            <div className="warden-cards-grid">
              {allSearchWardens.map(w => (
                <WardenCard
                  key={w.id}
                  warden={w}
                  onEdit={setEditingWarden}
                  onDelete={setDeletingWarden}
                  onToggleStatus={handleToggle}
                  onResetPw={setResetPwWarden}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Modals ─────────────────────────────────────────────────── */}
      {showAddModal && (
        <WardenModal
          defaultHostelId={selectedHostelId}
          onClose={() => setShowAddModal(false)}
          onSave={handleAddWarden}
        />
      )}
      {editingWarden && (
        <WardenModal
          initialData={editingWarden}
          defaultHostelId={editingWarden.hostelId}
          onClose={() => setEditingWarden(null)}
          onSave={handleEditWarden}
        />
      )}
      {deletingWarden && (
        <DeleteModal
          warden={deletingWarden}
          onClose={() => setDeletingWarden(null)}
          onConfirm={handleDelete}
        />
      )}
      {resetPwWarden && (
        <ResetPasswordModal
          warden={resetPwWarden}
          onClose={() => setResetPwWarden(null)}
          onReset={handleResetPw}
        />
      )}
    </DashboardLayout>
  );
}
