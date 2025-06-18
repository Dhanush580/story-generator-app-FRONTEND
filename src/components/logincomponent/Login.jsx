import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './Login.css';
import Navbar from '../navbarcomponent/Navbar';
import { FaEye, FaEyeSlash, FaSpinner, FaTimes } from 'react-icons/fa';

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
  const [isSecurityAnswerVerified, setIsSecurityAnswerVerified] = useState(false);
  const [isGettingQuestion, setIsGettingQuestion] = useState(false);
  const [isVerifyingAnswer, setIsVerifyingAnswer] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  
  // Dialog states
  const [showDialog, setShowDialog] = useState(false);
  const [dialogMessage, setDialogMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const showSuccessDialog = (message) => {
    setDialogMessage(message);
    setShowDialog(true);
  };

  const closeDialog = () => {
    setShowDialog(false);
    setDialogMessage('');
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
        showSuccessDialog(data.message || 'Login failed');
      }
    } catch (error) {
      showSuccessDialog('Server error');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotStep1 = async (e) => {
    e.preventDefault();
    setIsGettingQuestion(true);
    try {
      const res = await fetch(`https://story-generator-app-backend.onrender.com/api/get-security-question?email=${formData.email}`);
      const data = await res.json();
      if (res.ok) {
        setSecurityQuestion(data.securityQuestion);
        setForgotStep(2);
      } else {
        showSuccessDialog(data.message);
      }
    } catch (err) {
      showSuccessDialog('Error retrieving security question');
    } finally {
      setIsGettingQuestion(false);
    }
  };

  const handleVerifyAnswer = async (e) => {
    e.preventDefault();
    setIsVerifyingAnswer(true);
    try {
      const res = await fetch('https://story-generator-app-backend.onrender.com/api/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          securityAnswer,
          newPassword: 'dummy'
        })
      });

      const data = await res.json();

      if (res.ok) {
        setIsSecurityAnswerVerified(true);
        showSuccessDialog('Security answer verified. You can now set a new password.');
      } else {
        showSuccessDialog(data.message || 'Answer verification failed');
      }
    } catch (err) {
      showSuccessDialog('Server error');
    } finally {
      setIsVerifyingAnswer(false);
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setIsResettingPassword(true);
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
        showSuccessDialog('Password reset successful');
        setForgotMode(false);
        setForgotStep(1);
        setIsSecurityAnswerVerified(false);
        setSecurityAnswer('');
        setNewPassword('');
      } else {
        showSuccessDialog(data.message || 'Reset failed');
      }
    } catch (err) {
      showSuccessDialog('Server error');
    } finally {
      setIsResettingPassword(false);
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
            <button type="submit" className="login-btn" disabled={isLoading}>
              {isLoading ? (
                <>
                  <FaSpinner className="spin" /> Logging in...
                </>
              ) : 'Log In'}
            </button>
            <p className="forgot-password" onClick={() => setForgotMode(true)} style={{ cursor: 'pointer', textAlign: 'center', marginTop: '10px', color: 'white'}}>Forgot Password?</p>
          </form>
        ) : (
          <form className="login-form" onSubmit={
            forgotStep === 1
              ? handleForgotStep1
              : isSecurityAnswerVerified
                ? handlePasswordReset
                : handleVerifyAnswer
          }>
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

                {isSecurityAnswerVerified && (
                  <div className="input-group">
                    <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="login-input" placeholder=" " required />
                    <label className="input-label">New Password</label>
                  </div>
                )}
              </>
            )}

            <button type="submit" className="login-btn" disabled={isGettingQuestion || isVerifyingAnswer || isResettingPassword}>
              {forgotStep === 1 ? (
                isGettingQuestion ? (
                  <>
                    <FaSpinner className="spin" /> Getting Question...
                  </>
                ) : 'Get Question'
              ) : isSecurityAnswerVerified ? (
                isResettingPassword ? (
                  <>
                    <FaSpinner className="spin" /> Resetting...
                  </>
                ) : 'Reset Password'
              ) : isVerifyingAnswer ? (
                <>
                  <FaSpinner className="spin" /> Verifying...
                </>
              ) : 'Verify Answer'}
            </button>
            <p style={{ textAlign: 'center', marginTop: '10px' }}>
              <span style={{ cursor: 'pointer', color: 'gray' }} onClick={() => {
                setForgotMode(false);
                setForgotStep(1);
                setIsSecurityAnswerVerified(false);
              }}>Back to Login</span>
            </p>
          </form>
        )}

        <div className="login-footer">
          <p>Don't have an account? <Link to="/signup" state={location.state} className="signup-link">Sign up</Link></p>
          <Link to="/" className='signup-link'>Go back to Home</Link>
        </div>
      </div>

      {/* Success Dialog */}
      {showDialog && (
        <div className="dialog-overlay">
          <div className="dialog-box">
            <button className="dialog-close-btn-wel" onClick={closeDialog}>
              <FaTimes />
            </button>
            <div className="dialog-content">
              <p>{dialogMessage}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;