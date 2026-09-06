import React from 'react';
import './RoleSelector.css';

export default function RoleSelector({ roles, selectedRole, onSelect }) {
  return (
    <div className="role-selector-container">
      <label className="role-selector-label">SELECT ROLE</label>
      <div className="role-selector-grid">
        {roles.map((role) => (
          <button
            key={role.id}
            type="button"
            className={`role-card ${selectedRole === role.id ? 'selected' : ''}`}
            onClick={() => onSelect(role.id)}
          >
            <role.icon size={20} className="role-icon" />
            <span className="role-name">{role.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
