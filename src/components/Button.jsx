import React from 'react';
import './Button.css';

export default function Button({ children, className = '', ...props }) {
  return (
    <button className={`btn-primary ${className}`} {...props}>
      {children}
    </button>
  );
}
