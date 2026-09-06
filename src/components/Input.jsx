import React from 'react';
import './Input.css';

export default function Input({ label, icon: Icon, rightIcon: RightIcon, onClickRightIcon, className = '', ...props }) {
  return (
    <div className={`input-container ${className}`}>
      {label && <label className="input-label">{label}</label>}
      <div className="input-wrapper">
        {Icon && <Icon className="input-icon-left" size={18} />}
        <input className={`input-field ${Icon ? 'has-left-icon' : ''} ${RightIcon ? 'has-right-icon' : ''}`} {...props} />
        {RightIcon && (
          <button type="button" className="input-icon-right" onClick={onClickRightIcon}>
            <RightIcon size={18} />
          </button>
        )}
      </div>
    </div>
  );
}
