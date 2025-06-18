import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './Login.css';
import Navbar from '../navbarcomponent/Navbar';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Forgot password states
  const [forgotMode, setForgotMode] = useState(false);
  const [forgotStep, setForgotStep] = useState(1);
  const [securityQuestion, setSecurityQuestion] = useState('');
  const [securityAnswer, setSecurityAnswer] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch('https://story-generator-app-backend.onrender.com/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('token', data.token);
        navigate('/story-generation', { state: location.state });
      } else {
        alert(data.message || 'Login failed');
      }
    } catch (error) {
      alert('Server error');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotStep1 = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`https://story-generator-app-backend.onrender.com/api/get-security-question?email=${formData.email}`);
      const data = await res.json();
      if (res.ok) {
        setSecurityQuestion(data.securityQuestion);
        setForgotStep(2);
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert('Error retrieving security question');
    }
  };

  const handleForgotStep2 = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('https://story-generator-app-backend.onrender.com/api/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          securityAnswer,
          newPassword
        })
      });
      const data = await res.json();
      if (res.ok) {
        alert('Password reset successful');
        setForgotMode(false);
        setForgotStep(1);
      } else {
        alert(data.message || 'Reset failed');
      }
    } catch (err) {
      alert('Server error');
    }
  };

  return (
    <div className="login-container">
      <div className="login-holder">
        <div className="login-header">
          <h1 className="login-heading">{forgotMode ? 'Reset Password' : 'Welcome Back'}</h1>
          <p className="login-subtitle">{forgotMode ? 'Answer the question to reset password' : 'Log in to continue your creative journey'}</p>
        </div>

        {!forgotMode ? (
          <form className="login-form" onSubmit={handleLoginSubmit}>
            <div className="input-group">
              <input type="email" name="email" value={formData.email} onChange={handleChange} className="login-input" placeholder=" " required />
              <label className="input-label">Email Address</label>
            </div>
            <div className="input-group password-group">
              <input type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange} className="login-input" placeholder=" " required />
              <label className="input-label">Password</label>
              <button type="button" className="toggle-password-btn" onClick={() => setShowPassword(p => !p)} tabIndex={-1}>
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            <button type="submit" className={`login-btn ${isLoading ? 'loading' : ''}`} disabled={isLoading}>
              {isLoading ? <span className="spinner"></span> : <span>Log In</span>}
            </button>
            <p className="forgot-password" onClick={() => setForgotMode(true)} style={{ cursor: 'pointer', textAlign: 'center', marginTop: '10px', color: 'white'}}>Forgot Password?</p>
          </form>
        ) : (
          <form className="login-form" onSubmit={forgotStep === 1 ? handleForgotStep1 : handleForgotStep2}>
            <div className="input-group">
              <input type="email" name="email" value={formData.email} onChange={handleChange} className="login-input" placeholder=" " required />
              <label className="input-label">Email Address</label>
            </div>

            {forgotStep === 2 && (
              <>
                <div className="input-group">
                  <input type="text" value={securityQuestion} className="login-input" disabled />
                  <label className="input-label">Security Question</label>
                </div>
                <div className="input-group">
                  <input type="text" value={securityAnswer} onChange={(e) => setSecurityAnswer(e.target.value)} className="login-input" placeholder=" " required />
                  <label className="input-label">Your Answer</label>
                </div>
                <div className="input-group">
                  <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="login-input" placeholder=" " required />
                  <label className="input-label">New Password</label>
                </div>
              </>
            )}

            <button type="submit" className="login-btn">{forgotStep === 1 ? 'Get Question' : 'Reset Password'}</button>
            <p style={{ textAlign: 'center', marginTop: '10px' }}>
              <span style={{ cursor: 'pointer', color: 'gray' }} onClick={() => { setForgotMode(false); setForgotStep(1); }}>Back to Login</span>
            </p>
          </form>
        )}

        <div className="login-footer">
          <p>Don't have an account? <Link to="/signup" state={location.state} className="signup-link">Sign up</Link></p>
          <Link to="/" className='signup-link'>Go back to Home</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
