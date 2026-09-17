import React, { useState, useEffect, useRef } from 'react';
import "../components.css";
import { useUser } from '../../services/UserContext';
import { NavLink, Link, useLocation } from 'react-router-dom'; // Changed to NavLink
import ProfilePhoto from "../../components/common/ProfilePhotoComponent";
import { Camera, LogOut } from 'lucide-react';

const Topbar = () => {
  const location = useLocation();
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { user, logout, loading, updateUserProfile } = useUser(); // Assuming that you have a method to update the user profile
  const dropdownRef = useRef(null);
  const menuToggleRef = useRef(null);
  const navContentRef = useRef(null);

  const isAboutActive = () => {
    const aboutRoutes = ['/overview', '/vision', '/vcmsg', '/council', '/presmsg', '/cmsg', '/registrarmsg', '/developers'];
    return aboutRoutes.some(route => location.pathname.startsWith(route));
  };

  // Toggle mobile navigation
  const toggleNav = () => {
    setIsNavOpen((prev) => !prev);
    document.querySelector('.header-nav')?.classList.toggle('open');
  };

  // Close mobile navigation
  const closeNav = () => {
    setIsNavOpen(false);
    document.querySelector('.header-nav')?.classList.remove('open');
  };

  // Logout handler
  const handleLogout = async () => {
    try {
      await logout();
      setIsDropdownOpen(false);
    } catch (err) {
      console.error('Error during logout:', err);
    }
  };

  // Toggle dropdown visibility
  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        isNavOpen &&
        !menuToggleRef.current?.contains(event.target) &&
        !navContentRef.current?.contains(event.target) &&
        !dropdownRef.current?.contains(event.target)
      ) {
        closeNav();
        setIsDropdownOpen(false);
      }
    };

    const handleNavClick = (event) => {
      // Close the nav tab if a link inside .nav-content is clicked
      if (event.target.closest(".nav-content a")) {
        closeNav();
      }
    };

    document.addEventListener("click", handleOutsideClick);
    document.addEventListener("click", handleNavClick);

    return () => {
      document.removeEventListener("click", handleOutsideClick);
      document.removeEventListener("click", handleNavClick);
    };
  }, []);

  // If loading, show loading screen
  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <header className="App-header">
      <div className="header-container">
        {/* Logo Section */}
        <div className="logo">
          <Link to="/">
            <img src="/assets/LOGO 1.jpg" alt="University Alumni Logo" />
          </Link>
        </div>

        {/* Navigation Section */}
        <nav className="header-nav">
          <button ref={menuToggleRef} className="menu-toggle" onClick={toggleNav}>
            &#9776;
          </button>
          <div ref={navContentRef} className={`nav-content ${isNavOpen ? 'open' : ''}`}>
            <ul>
              <li><NavLink to="/" className={({ isActive }) => isActive ? 'active' : ''}>Home</NavLink></li>
              <li>
                <NavLink
                  to="/overview"
                  className={({ isActive }) =>
                    isActive || isAboutActive() ? 'active' : ''
                  }
                >
                  About
                </NavLink>
                <ul className='sub-menus'>
                  <li><NavLink to='/overview' className={({ isActive }) => isActive ? 'active' : ''}>Overview</NavLink></li>
                  <li><NavLink to='/vision' className={({ isActive }) => isActive ? 'active' : ''}>Vision and Mission</NavLink></li>
                  <li><NavLink to='/presmsg' className={({ isActive }) => isActive ? 'active' : ''}>President's Message</NavLink></li>
                  <li><NavLink to='/cmsg' className={({ isActive }) => isActive ? 'active' : ''}>Chancellor's Message</NavLink></li>
                  <li><NavLink to='/vcmsg' className={({ isActive }) => isActive ? 'active' : ''}>Vice Chancellor's Message</NavLink></li>
                  <li><NavLink to='/registrarmsg' className={({ isActive }) => isActive ? 'active' : ''}>Registrar's Message</NavLink></li>
                  <li><NavLink to='/council' className={({ isActive }) => isActive ? 'active' : ''}>Governing Council</NavLink></li>
                  <li><NavLink to='/developers' className={({ isActive }) => isActive ? 'active' : ''}>Developers</NavLink></li>
                </ul>
              </li>
              <li><NavLink to="/association-members" className={({ isActive }) => isActive ? 'active' : ''}>Association Members</NavLink></li>
              <li><NavLink to="/alumni-achievers" className={({ isActive }) => isActive ? 'active' : ''}>Alumni-Achievers</NavLink></li>
              <li><NavLink to="/scholarship" className={({ isActive }) => isActive ? 'active' : ''}>Scholarships</NavLink></li>
              <li>
                <NavLink 
                  to="/opportunity/jobs" 
                  className={({ isActive }) => isActive || location.pathname.startsWith('/opportunity') ? 'active' : ''}
                >
                  Opportunity
                </NavLink>
                <ul className='sub-menus'>
                  <li>
                    <NavLink 
                      to="/opportunity/jobs" 
                      className={({ isActive }) => isActive ? 'active' : ''}
                    >
                      Job
                    </NavLink>
                  </li>
                </ul>
              </li>
              <li><NavLink to="/news" className={({ isActive }) => isActive ? 'active' : ''}>News</NavLink></li>
              <li><NavLink to="/events" className={({ isActive }) => isActive ? 'active' : ''}>Events</NavLink></li>
              <li><NavLink to="/gallery" className={({ isActive }) => isActive ? 'active' : ''}>Gallery</NavLink></li>
              <li><NavLink to="/alumni-face-show" className={({ isActive }) => isActive ? 'active' : ''}>Alumni</NavLink></li>
              {user && (
                <>
                  <li><NavLink to="/welcome" className={({ isActive }) => isActive ? 'active' : ''}>Feed</NavLink></li>
                  {(user.role === 'admin' || user.role === 'superuser') && (
                    <li><NavLink to="/admin-stats" className={({ isActive }) => isActive ? 'active' : ''}>Admin Dashboard</NavLink></li>
                  )}
                  {user.role === 'reviewer' && (
                    <li><NavLink to="/reviewer-dashboard" className={({ isActive }) => isActive ? 'active' : ''}>Reviewer Dashboard</NavLink></li>
                  )}
                </>
              )}
            </ul>
          </div>
        </nav>

        {/* Authentication Section */}
        <div className="auth-container">
          {!user ? (
            <div className="auth-links">
              <Link to="/register" className="auth-link">Register</Link>
              <span className="separator">|</span>
              <Link to="/login" className="auth-link">Login</Link>
            </div>
          ) : (
            <div className="dropdown" ref={dropdownRef}>
              {/* Profile Picture Section */}
              <div className="dropdown-toggle" onClick={toggleDropdown}>
                <ProfilePhoto userId={user._id} className="rounded-full" key={user.profilePhoto} />
                <span className="dropdown-username">{user.name}</span>
              </div>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div className="dropdown-menu">
                  <Link className="dropdown-item" to="/profile" onClick={() => setIsDropdownOpen(false)}>
                    <Camera style={{ marginRight: '8px' }} /> Profile
                  </Link>
                  <Link className="dropdown-item" to="/" onClick={handleLogout}>
                    <LogOut style={{ marginRight: '8px' }} /> Logout
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Topbar;
