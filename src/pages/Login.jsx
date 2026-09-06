import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GraduationCap, Shield, UserCog, Mail, Lock, Eye, EyeOff, Building2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import Input from '../components/Input';
import Button from '../components/Button';
import RoleSelector from '../components/RoleSelector';
import './Login.css';

const ROLES = [
  { id: 'student', name: 'Student', icon: GraduationCap },
  { id: 'warden', name: 'Warden', icon: Shield },
  { id: 'admin', name: 'Admin', icon: UserCog },
];

export default function Login() {
  const [selectedRole, setSelectedRole] = useState('student');
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const navigate = useNavigate();
  const { loginWarden } = useApp();

  const handleLogin = (e) => {
    e.preventDefault();
    setLoginError('');
    if (selectedRole === 'student') {
      navigate('/student');
    } else if (selectedRole === 'warden') {
      // Authenticate via context
      const result = loginWarden(email, password);
      if (result.success) {
        navigate('/warden');
      } else {
        setLoginError('Invalid warden credentials or account inactive. Please check your email and password.');
      }
    } else if (selectedRole === 'admin') {
      navigate('/admin');
    }
  };

  return (
    <div className="login-layout">
      {/* Left side image/branding */}
      <div className="login-banner">
        <div className="login-banner-overlay" />
        <div className="login-banner-content">
          <h1>Your Home Away From Home.</h1>
          <p>
            Seamlessly manage your hostel life. From room assignments to instant maintenance requests, experience campus living simplified.
          </p>
        </div>
      </div>

      {/* Right side form */}
      <div className="login-form-section">
        <div className="login-form-container">
          
          <div className="login-header">
            <div className="logo-icon-container">
              <Building2 size={24} className="logo-icon" />
            </div>
            <h2>Welcome Back</h2>
            <p className="subtitle">Sign in to continue to UniHostel</p>
          </div>

          <form onSubmit={handleLogin}>
            <RoleSelector 
              roles={ROLES} 
              selectedRole={selectedRole} 
              onSelect={setSelectedRole} 
            />

            <Input 
              label="Email Address" 
              placeholder="Enter your university email" 
              type="email"
              icon={Mail}
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
            />

            <div className="password-field-container">
              <div className="password-label-row">
                <label className="input-label">Password</label>
                <a href="#" className="forgot-password-link">Forgot Password?</a>
              </div>
              <Input 
                placeholder="Enter your password" 
                type={showPassword ? 'text' : 'password'}
                icon={Lock}
                rightIcon={showPassword ? EyeOff : Eye}
                onClickRightIcon={() => setShowPassword(!showPassword)}
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>

            {loginError && (
              <div className="login-error-msg">{loginError}</div>
            )}

            <div className="remember-me">
              <input type="checkbox" id="remember" className="checkbox-input" />
              <label htmlFor="remember" className="checkbox-label">Remember me on this device</label>
            </div>

            <Button type="submit" className="login-submit-btn">
              SIGN IN
            </Button>
          </form>

          <p className="signup-link-row">
            New student? Don't have an account?{' '}
            <Link to="/signup" className="signup-link">Register Here →</Link>
          </p>

        </div>
      </div>
    </div>
  );
}
