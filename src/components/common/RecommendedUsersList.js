import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import "../components.css";
import ProfilePhoto from "../../components/common/ProfilePhotoComponent";

const RecommendedUsersList = ({ onSwitchToFriends }) => {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRecommendedUsers = async () => {
      try {
        const response = await api.get('/user/recommend-users');
        setUsers(response.data);
      } catch (error) {
        console.error('Error fetching recommended users:', error);
        setError('Error fetching recommended users');
      }
    };
    fetchRecommendedUsers();
  }, []);

  const containerStyle = {
    padding: '20px',
    backgroundColor: '#fff',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    margin: '20px 0',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  };

  const headerStyle = {
    fontSize: '1.5em',
    fontWeight: 'bold',
    marginBottom: '20px',
    textAlign: 'center',
    color: '#333'
  };

  const userCardStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    padding: '15px',
    borderRadius: '8px',
    border: '1px solid #ddd',
    textDecoration: 'none',
    color: 'inherit',
    transition: 'transform 0.2s'
  };

  const nameStyle = {
    fontSize: '1.2em',
    margin: '0 0 5px'
  };

  const branchBatchStyle = {
    fontSize: '0.9em',
    color: '#999'
  };

  const buttonStyle = {
    marginTop: '20px',
    display: 'block',
    textAlign: 'center',
    backgroundColor: '#3498db',
    color: '#fff',
    padding: '10px',
    borderRadius: '8px',
    textDecoration: 'none',
    cursor: 'pointer',
    border: 'none'
  };

  const handleMouseEnter = (e) => {
    e.currentTarget.style.transform = 'scale(1.05)';
  };

  const handleMouseLeave = (e) => {
    e.currentTarget.style.transform = 'scale(1)';
  };

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>Recommended Users</div>
      {error && <p style={{ color: '#e74c3c' }}>{error}</p>}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {users.map(user => (
          <Link 
            to={`/profile/${user._id}`} 
            key={user._id} 
            style={userCardStyle}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <ProfilePhoto 
              userId={user?._id}
              photoPath={user?.profilePhoto}
              className="recommended-profile-picture"
            />
            <div>
              <h4 style={nameStyle}>{user.name}</h4>
              <p style={branchBatchStyle}>{user.branch}, {user.batch}</p>
            </div>
          </Link>
        ))}
      </div>
      <button 
        onClick={onSwitchToFriends}
        style={buttonStyle}
      >
        View All Alumni
      </button>
    </div>
  );
};

export default RecommendedUsersList;