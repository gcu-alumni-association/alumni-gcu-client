import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useUser } from '../../services/UserContext';
import './login-notice.css';

// These pages are already about logging in, so the notice would only repeat them
const AUTH_PAGES = ['/login', '/register', '/forgot-password', '/admin-login'];

export const useLoginNoticeVisible = () => {
  const { user, authChecked } = useUser();
  const { pathname } = useLocation();
  return authChecked && !user && !AUTH_PAGES.includes(pathname);
};

const LoginNotice = () => {
  const isVisible = useLoginNoticeVisible();

  if (!isVisible) return null;

  return (
    <div className="login-notice" role="status">
      <span>
        You're not logged in. <Link to="/login">Log in</Link> or <Link to="/register">register</Link> to access the alumni feed.
      </span>
    </div>
  );
};

export default LoginNotice;
