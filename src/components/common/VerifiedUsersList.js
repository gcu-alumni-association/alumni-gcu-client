import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import "../components.css";
import ProfilePhoto from "../../components/common/ProfilePhotoComponent";
import Pagination from "../../components/common/Pagination";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass, faSort, faBuilding, faUser, faArrowRight } from '@fortawesome/free-solid-svg-icons';

const BASE_URL = process.env.REACT_APP_BASE_URL || 'http://localhost:5000';

const VerifiedUsersList = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('name_asc');
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const limit = 10;

  const fetchUsers = useCallback(async (queryParam = search, sortParam = sortBy, pageNum = currentPage) => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (queryParam && queryParam.trim()) {
        query.append('search', queryParam.trim());
      }
      if (sortParam) {
        query.append('sortBy', sortParam);
      }
      query.append('page', pageNum);
      query.append('limit', limit);

      const response = await api.get(`/user/verified-users?${query.toString()}`);
      if (response.data && response.data.users) {
        setUsers(response.data.users || []);
        setTotalPages(response.data.totalPages || 1);
        setTotalUsers(response.data.totalUsers || 0);
      } else if (Array.isArray(response.data)) {
        setUsers(response.data.slice((pageNum - 1) * limit, pageNum * limit));
        setTotalPages(Math.ceil(response.data.length / limit) || 1);
        setTotalUsers(response.data.length);
      }
      setError('');
    } catch (err) {
      console.error('Error fetching alumni users:', err);
      setError('Failed to load alumni list');
    } finally {
      setLoading(false);
    }
  }, [search, sortBy, currentPage]);

  useEffect(() => {
    fetchUsers(search, sortBy, currentPage);
  }, [currentPage, sortBy]);

  const handleInputChange = (e) => {
    const val = e.target.value;
    setSearch(val);
    setCurrentPage(1);
    fetchUsers(val, sortBy, 1);
  };

  const handleSortChange = (e) => {
    const sortVal = e.target.value;
    setSortBy(sortVal);
    setCurrentPage(1);
    fetchUsers(search, sortVal, 1);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchUsers(search, sortBy, 1);
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCardClick = (userId) => {
    navigate(`/profile/${userId}`);
  };

  return (
    <div className="verified-users-container full-width-container" style={{ padding: '25px', backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.06)', width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <h2 style={{ color: '#003366', margin: 0, fontSize: '24px', fontWeight: 'bold' }}>
            Alumni
          </h2>
          <p style={{ margin: '4px 0 0', color: '#666', fontSize: '14px' }}>
            Connect with verified alumni across batches and branches ({totalUsers} members)
          </p>
        </div>

        {/* Sort selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FontAwesomeIcon icon={faSort} style={{ color: '#003366' }} />
          <select
            value={sortBy}
            onChange={handleSortChange}
            style={{ padding: '8px 14px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#f8f9fa', fontSize: '14px', cursor: 'pointer', fontWeight: '500' }}
          >
            <option value="name_asc">Sort: Name (A-Z)</option>
            <option value="batch_desc">Sort: Batch (Newest First)</option>
            <option value="batch_asc">Sort: Batch (Oldest First)</option>
          </select>
        </div>
      </div>

      {/* Search Input */}
      <form onSubmit={handleSearchSubmit} style={{ marginBottom: '25px' }}>
        <div style={{ display: 'flex', alignItems: 'center', border: '2px solid #e2e8f0', borderRadius: '8px', padding: '4px 12px', background: '#fff', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <FontAwesomeIcon icon={faMagnifyingGlass} style={{ color: '#94a3b8', marginRight: '10px', fontSize: '16px' }} />
          <input
            type="text"
            placeholder="Search by name, branch, batch year, or company..."
            value={search}
            onChange={handleInputChange}
            style={{ border: 'none', outline: 'none', width: '100%', padding: '10px 0', fontSize: '15px' }}
          />
        </div>
      </form>

      {loading && <p style={{ textAlign: 'center', color: '#666', padding: '30px 0' }}>Loading alumni directory...</p>}
      {error && <p className="error" style={{ color: '#dc3545', textAlign: 'center', padding: '20px 0' }}>{error}</p>}

      {/* Vertical Cards Grid with Uniform Sizing */}
      {!loading && users.length > 0 ? (
        <>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
              gap: '20px',
              width: '100%'
            }}
          >
            {users.map((user) => {
              const companyLogo = user.company?.logo
                ? (user.company.logo.startsWith('http') ? user.company.logo : `${BASE_URL}${user.company.logo}`)
                : null;
              const companyName = user.company?.name || user.currentWorkingPlace;

              return (
                <div
                  key={user._id}
                  onClick={() => handleCardClick(user._id)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    padding: '24px 18px',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    backgroundColor: '#ffffff',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                    cursor: 'pointer',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
                    position: 'relative',
                    overflow: 'hidden',
                    height: '320px', // Exact uniform height for all cards
                    boxSizing: 'border-box'
                  }}
                  className="vertical-alumni-card"
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-6px)';
                    e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,51,102,0.12)';
                    e.currentTarget.style.borderColor = '#003366';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)';
                    e.currentTarget.style.borderColor = '#e2e8f0';
                  }}
                >
                  {/* Profile Photo Avatar Circular Frame */}
                  <div 
                    style={{ 
                      width: '90px', 
                      height: '90px', 
                      minWidth: '90px', 
                      minHeight: '90px', 
                      borderRadius: '50%', 
                      overflow: 'hidden', 
                      border: '3px solid #003366', 
                      boxShadow: '0 3px 8px rgba(0,0,0,0.15)',
                      marginBottom: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: '#f1f5f9'
                    }}
                  >
                    <ProfilePhoto
                      userId={user._id}
                      photoPath={user.profilePhoto}
                      style={{
                        width: '100%',
                        height: '100%',
                        borderRadius: '50%',
                        objectFit: 'cover'
                      }}
                    />
                  </div>

                  {/* Name */}
                  <h3
                    style={{
                      margin: '0 0 6px',
                      fontSize: '17px',
                      fontWeight: '700',
                      color: '#003366',
                      width: '100%',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}
                    title={user.name}
                  >
                    {user.name}
                  </h3>

                  {/* Branch & Batch */}
                  <div
                    style={{
                      fontSize: '12px',
                      color: '#475569',
                      backgroundColor: '#f1f5f9',
                      padding: '4px 10px',
                      borderRadius: '12px',
                      fontWeight: '600',
                      marginBottom: '10px',
                      maxWidth: '100%',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}
                  >
                    {user.branch ? user.branch : 'Alumni'} · Batch of {user.batch}
                  </div>

                  {/* Company / Designation Badge */}
                  <div style={{ height: '30px', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>
                    {companyName ? (
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          fontSize: '12px',
                          color: '#059669',
                          fontWeight: '600',
                          backgroundColor: '#ecfdf5',
                          padding: '4px 10px',
                          borderRadius: '6px',
                          maxWidth: '100%'
                        }}
                      >
                        {companyLogo ? (
                          <img src={companyLogo} alt="" style={{ width: '14px', height: '14px', objectFit: 'contain' }} />
                        ) : (
                          <FontAwesomeIcon icon={faBuilding} />
                        )}
                        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {companyName}
                        </span>
                      </div>
                    ) : null}
                  </div>

                  {/* View Profile Action Button */}
                  <div
                    style={{
                      marginTop: 'auto',
                      width: '100%',
                      padding: '8px 0',
                      backgroundColor: '#003366',
                      color: '#ffffff',
                      borderRadius: '6px',
                      fontSize: '13px',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px'
                    }}
                  >
                    View Profile <FontAwesomeIcon icon={faArrowRight} style={{ fontSize: '11px' }} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div style={{ marginTop: '30px', display: 'flex', justifyContent: 'center' }}>
              <Pagination
                totalPages={totalPages}
                currentPage={currentPage}
                onPageChange={handlePageChange}
                stylePrefix="user-profile"
              />
            </div>
          )}
        </>
      ) : !loading ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>
          <FontAwesomeIcon icon={faUser} style={{ fontSize: '32px', marginBottom: '10px', color: '#cbd5e1' }} />
          <p style={{ margin: 0, fontSize: '15px' }}>
            {search ? `No alumni found matching "${search}".` : 'No alumni records found.'}
          </p>
        </div>
      ) : null}
    </div>
  );
};

export default VerifiedUsersList;
