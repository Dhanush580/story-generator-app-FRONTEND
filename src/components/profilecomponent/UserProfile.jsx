import React, { useEffect, useState } from 'react';
import './UserProfile.css';
import { FaPen } from 'react-icons/fa';

const UserProfile = () => {
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
  const [message, setMessage] = useState('');

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

  const handleEditClick = (field) => {
    setEditMode({ ...editMode, [field]: true });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
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
    setMessage(data.message);
    setEditMode({ name: false, password: false, profilePic: false });

    // Refresh data
    const refreshed = await fetch('https://story-generator-app-backend.onrender.com/api/profile', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const refreshedUser = await refreshed.json();
    setUser(refreshedUser);
    setFormData((prev) => ({ ...prev, password: '' }));

    setTimeout(() => setMessage(''), 3000);
  };

  if (!user) return <div className="profile-container">Loading...</div>;

  return (
    <div className="profile-container">
      <div className="profile-card">
        <h2>User Profile</h2>

        <div className="profile-picture-container">
          <img
            src={formData.profilePic || 'https://via.placeholder.com/120'}
            alt="Profile"
            className="profile-picture"
          />
          {editMode.profilePic ? (
            <input
              type="text"
              name="profilePic"
              value={formData.profilePic}
              onChange={handleChange}
              placeholder="Profile image URL"
              className="profile-input"
            />
          ) : (
            <button onClick={() => handleEditClick('profilePic')} className="edit-btn">
              <FaPen />
            </button>
          )}
        </div>

        <div className="profile-field">
          <label>Name:</label>
          {editMode.name ? (
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="profile-input"
            />
          ) : (
            <>
              <span className="profile-value">{formData.name}</span>
              <button onClick={() => handleEditClick('name')} className="edit-btn">
                <FaPen />
              </button>
            </>
          )}
        </div>

        <div className="profile-field">
          <label>Email:</label>
          <span className="profile-value">{user.email}</span>
        </div>

        <div className="profile-field">
          <label>Password:</label>
          {editMode.password ? (
            <input
              type="text"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="profile-input"
            />
          ) : (
            <>
              <span className="profile-value">*******</span>
              <button onClick={() => handleEditClick('password')} className="edit-btn">
                <FaPen />
              </button>
            </>
          )}
        </div>

        <button onClick={handleSave} className="save-btn">
          Save Changes
        </button>
        {message && <div className="success-message">{message}</div>}
      </div>
    </div>
  );
};

export default UserProfile;
