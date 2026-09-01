import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import Spinner from './LoadingSpinner';
import { useUser } from '../../services/UserContext';

const BASE_URL = process.env.REACT_APP_BASE_URL || 'http://localhost:5000';

const ProfilePhoto = ({ userId, photoPath, className = '', style = {} }) => {
  const [profilePhoto, setProfilePhoto] = useState(photoPath || null);
  const [loading, setLoading] = useState(!photoPath);
  const { user } = useUser();

  useEffect(() => {
    if (photoPath !== undefined) {
      setProfilePhoto(photoPath);
      setLoading(false);
      return;
    }

    const fetchProfilePhoto = async () => {
      if (!userId) return;
      try {
        const response = await api.get(`/user/profile-photo/${userId}`);
        setProfilePhoto(response.data?.profilePhoto || null);
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Error fetching profile photo:', error);
          setProfilePhoto(null);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfilePhoto();
  }, [userId, photoPath, user?.profilePhoto]);

  if (loading) return <div><Spinner /></div>;

  return (
    <img
      src={profilePhoto ? `${BASE_URL}/${profilePhoto.replace(/\\/g, "/")}` : `/assets/profile-placeholder.svg`}
      alt="Profile"
      className={`profile-photo ${className}`}
      style={style}
    />
  );
};

export default ProfilePhoto;
