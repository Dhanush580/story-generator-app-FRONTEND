import React, { useEffect, useState, useRef } from 'react';
import './UserProfile.css';
import { FaPen, FaArrowLeft, FaSpinner } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const UserProfile = () => {
  const navigate = useNavigate();
  const handleGoBack = () => {
    navigate(-1); // Goes back to previous page
  };
  const [user, setUser] = useState(null);
  const [editMode, setEditMode] = useState({
    name: false,
    password: false,
    profilePic: false
  });
  const [formData, setFormData] = useState({
    name: '',
    password: '',
    profilePic: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false); // New state for loading indicator

  const nameInputRef = useRef(null);
  const passwordInputRef = useRef(null);
  const profilePicInputRef = useRef(null);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token');
      const res = await fetch('https://story-generator-app-backend.onrender.com/api/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setUser(data);
      setFormData({
        name: data.name,
        password: '',
        profilePic: data.profilePic || ''
      });
    };
    fetchUser();
  }, []);

  useEffect(() => {
    if (editMode.name && nameInputRef.current) {
      nameInputRef.current.focus();
    }
    if (editMode.password && passwordInputRef.current) {
      passwordInputRef.current.focus();
    }
    if (editMode.profilePic && profilePicInputRef.current) {
      profilePicInputRef.current.focus();
    }
  }, [editMode]);

  const handleEditClick = (field) => {
    setEditMode({ ...editMode, [field]: true });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleBlur = (field) => {
    setTimeout(() => {
      const activeElement = document.activeElement;
      if (!activeElement || !activeElement.closest('.input-with-button')) {
        setEditMode({ ...editMode, [field]: false });
      }
    }, 200);
  };

  const handleSave = async () => {
    setIsSaving(true); // Start loading
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('https://story-generator-app-backend.onrender.com/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      setSuccessMessage(data.message);
      setShowSuccessDialog(true);
      setEditMode({ name: false, password: false, profilePic: false });
      setShowPassword(false);

      const refreshed = await fetch('https://story-generator-app-backend.onrender.com/api/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const refreshedUser = await refreshed.json();
      setUser(refreshedUser);
      setFormData((prev) => ({ ...prev, password: '' }));
    } catch (error) {
      console.error('Error saving profile:', error);
      setSuccessMessage('Error saving profile. Please try again.');
      setShowSuccessDialog(true);
    } finally {
      setIsSaving(false); // Stop loading regardless of success or failure
    }
  };

  if (!user) return <div className="profile-container loading-message">Loading...</div>;

  return (
    <div className="profile-container">
      <div className="profile-card">
        <div className="profile-header">
          <button onClick={handleGoBack} className="back-button">
            <FaArrowLeft />
          </button>
          <h2>User Profile</h2>
        </div>

        <div className="profile-picture-container">
          <img
            src={formData.profilePic || 'https://t3.ftcdn.net/jpg/05/16/27/58/360_F_516275801_f3Fsp17x6HQK0xQgDQEELoTuERO4SsWV.jpg'}
            alt="Profile"
            className="profile-picture"
          />
          {editMode.profilePic ? (
            <div className="input-with-button">
              <input
                type="text"
                name="profilePic"
                value={formData.profilePic}
                onChange={handleChange}
                placeholder="Enter image URL"
                className="profile-input"
                ref={profilePicInputRef}
                onBlur={() => handleBlur('profilePic')}
              />
              <button 
                onClick={() => handleBlur('profilePic')} 
                className="edit-btn"
              >
                <FaPen />
              </button>
            </div>
          ) : (
            <button 
              onClick={() => handleEditClick('profilePic')} 
              className="edit-btn profile-pic-edit-btn"
            >
              <FaPen />
            </button>
          )}
        </div>

        <div className="profile-field">
          <label>Name:</label>
          <div className="input-with-button">
            {editMode.name ? (
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="profile-input"
                ref={nameInputRef}
                onBlur={() => handleBlur('name')}
              />
            ) : (
              <span className="profile-value">{formData.name}</span>
            )}
            <button 
              onClick={() => editMode.name ? handleBlur('name') : handleEditClick('name')} 
              className="edit-btn"
            >
              <FaPen />
            </button>
          </div>
        </div>

        <div className="profile-field">
          <label>Email:</label>
          <div className="input-with-button">
            <span className="profile-value">{user.email}</span>
          </div>
        </div>

        <div className="profile-field">
          <label>Password:</label>
          <div className="input-with-button">
            {editMode.password ? (
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="profile-input"
                ref={passwordInputRef}
                onBlur={() => handleBlur('password')}
              />
            ) : (
              <span className="profile-value">
                {showPassword ? formData.password || '' : '••••••••'}
              </span>
            )}
            
            <button 
              onClick={() => editMode.password ? handleBlur('password') : handleEditClick('password')} 
              className="edit-btn"
            >
              <FaPen />
            </button>
          </div>
        </div>

        <button 
          onClick={handleSave} 
          className="save-btn"
          disabled={isSaving} // Disable button while saving
        >
          {isSaving ? (
            <>
              <FaSpinner className="spin" /> Saving...
            </>
          ) : (
            'Save Changes'
          )}
        </button>
      </div>

      {showSuccessDialog && (
        <div className="success-dialog-overlay">
          <div className="success-dialog">
            <p>{successMessage}</p>
            <button 
              onClick={() => {
                setShowSuccessDialog(false);
                setSuccessMessage('');
              }}
              className="dialog-close-btn"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;