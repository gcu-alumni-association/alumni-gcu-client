import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { FaTachometerAlt, FaNewspaper, FaCalendarAlt, FaArrowLeft, FaImages, FaAddressBook, FaBuilding, FaCode } from 'react-icons/fa';
import { IoPersonAdd } from "react-icons/io5";
import { MdAttachEmail, MdFeed, MdFeedback } from "react-icons/md";
import "./admin.css";
import { useUser } from '../../services/UserContext';

const getActiveClass = ({ isActive }) => (isActive ? "active-link" : "");

const AdminLayout = () => {
  const { user } = useUser();
  return (
    <div className="admin-layout">
      <div className="admin-nav-bar">
      <nav className="admin-sidebar">
      {/* <div className="logo-container">
        <img src="./assets/LOGO 1.jpg"  alt="Logo" className="admin-logo" />
      </div> */}
      <ul>
        {user?.role === 'reviewer' ? (
          <>
            <li>
              <NavLink to="/reviewer-dashboard" className={getActiveClass}>
                <FaTachometerAlt />
                <span>Reviewer Stats</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/admin-dashboard" className={getActiveClass}>
                <FaTachometerAlt />
                <span>Approve</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/alumni-archive" className={getActiveClass}>
                <FaAddressBook />
                <span>Alumni-Archive</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/view-feedback" className={getActiveClass}>
                <MdFeedback />
                <span>Feedbacks</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/flagged-posts" className={getActiveClass}>
                <MdFeed />
                <span>Flagged Posts</span>
              </NavLink>
            </li>
          </>
        ) : (
          <>
            <li>
              <NavLink to="/admin-stats" className={getActiveClass}>
                <FaTachometerAlt />
                <span>Dashboard</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/reviewer-dashboard" className={getActiveClass}>
                <FaTachometerAlt />
                <span>Reviewer Stats</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/admin-dashboard" className={getActiveClass}>
                <FaTachometerAlt />
                <span>Approve</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/alumni-archive" className={getActiveClass}>
                <FaAddressBook />
                <span>Alumni-Archive</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/admin-companies" className={getActiveClass}>
                <FaBuilding />
                <span>Companies</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/admin-developers" className={getActiveClass}>
                <FaCode />
                <span>Developers</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/news-form" className={getActiveClass}>
                <FaNewspaper />
                <span>Create New News</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/events-form" className={getActiveClass}>
                <FaCalendarAlt />
                <span>Create New Event</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/photo-upload-form" className={getActiveClass}>
                <FaImages />
                <span>Upload Images</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/admin-alumni-faces" className={getActiveClass}>
                <FaImages />
                <span>Alumni Face Show</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/email-form" className={getActiveClass}>
                <MdAttachEmail />
                <span>Send Mail</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/add-bulk-alumni" className={getActiveClass}>
                <IoPersonAdd />
                <span>Add Alumni</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/view-feedback" className={getActiveClass}>
                <MdFeedback />
                <span>Feedbacks</span>
              </NavLink>
            </li>
            {user?.role === 'superuser' && (
              <li>
                <NavLink to="/create-admin" className={getActiveClass}>
                  <IoPersonAdd />
                  <span>Create Admin</span>            
                </NavLink>
              </li>
            )}
            <li>
              <NavLink to="/flagged-posts" className={getActiveClass}>
                <MdFeed />
                <span>Flagged Posts</span>
              </NavLink>
            </li>
          </>
        )}
        <li>
          <NavLink to="/" className={getActiveClass}>
            <FaArrowLeft />
            <span>Back to Website</span>
          </NavLink>
        </li>
      </ul>
    </nav>
    </div>
      <div className="admin-content">
        <Outlet />
      </div>
    </div>
  );
};


export default AdminLayout;

