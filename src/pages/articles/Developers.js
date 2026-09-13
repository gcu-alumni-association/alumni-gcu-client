import React, { useState, useEffect, useMemo } from 'react';
import api from '../../services/api';
import Spinner from '../../components/common/LoadingSpinner';
import Pagination from '../../components/common/Pagination';

const BASE_URL = process.env.REACT_APP_BASE_URL || 'http://localhost:5000';

const Developers = () => {
  const [developers, setDevelopers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const batchesPerPage = 2; // Show 2 batch sections per page

  useEffect(() => {
    const fetchDevelopers = async () => {
      try {
        const response = await api.get('/developers/all');
        setDevelopers(response.data || []);
      } catch (error) {
        console.error('Error fetching developers:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDevelopers();
  }, []);

  // Group developers into batches
  const groupedBatches = useMemo(() => {
    const groups = {};

    developers.forEach((dev) => {
      let batchLabel = 'Core Development Team';
      if (dev.academicYear && dev.academicYear.trim()) {
        batchLabel = dev.academicYear.trim();
      } else if (dev.user?.batch) {
        batchLabel = `Batch of ${dev.user.batch}`;
      }

      if (!groups[batchLabel]) {
        groups[batchLabel] = [];
      }
      groups[batchLabel].push(dev);
    });

    // Sort batches so newest year/batch is at the top
    const sortedBatchKeys = Object.keys(groups).sort((a, b) => {
      const getYear = (str) => {
        const match = str.match(/\d{4}/g);
        return match ? parseInt(match[match.length - 1], 10) : 0;
      };
      return getYear(b) - getYear(a);
    });

    return sortedBatchKeys.map((key) => ({
      batchTitle: key,
      members: groups[key]
    }));
  }, [developers]);

  // Paginate the batch groups
  const totalPages = Math.ceil(groupedBatches.length / batchesPerPage) || 1;
  const currentBatches = useMemo(() => {
    const start = (currentPage - 1) * batchesPerPage;
    return groupedBatches.slice(start, start + batchesPerPage);
  }, [groupedBatches, currentPage, batchesPerPage]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 350, behavior: 'smooth' });
  };

  return (
    <div className="main" style={{ width: '100%', minHeight: '85vh', backgroundColor: '#f8fafc', paddingBottom: '70px' }}>
      {/* Hero Banner Section */}
      <div 
        style={{
          width: '100%',
          backgroundImage: 'linear-gradient(rgba(10, 34, 64, 0.88), rgba(10, 34, 64, 0.88)), url(/assets/gcu-landscape-image.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          color: '#ffffff',
          textAlign: 'center',
          padding: '70px 20px 60px',
          boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
        }}
      >
        <h1 
          style={{
            fontFamily: '"Georgia", serif',
            fontSize: '2.8rem',
            fontWeight: 'bold',
            marginBottom: '10px',
            color: '#ffffff'
          }}
        >
          Meet Our Developers
        </h1>
        <p 
          style={{
            fontSize: '1.2rem',
            fontWeight: '300',
            maxWidth: '600px',
            color: '#cbd5e1',
            margin: '0 auto'
          }}
        >
          The talented people behind this website
        </p>
      </div>

      {/* Main Container */}
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '40px 24px', width: '100%' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
            <Spinner />
          </div>
        ) : developers.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#64748b' }}>No developer profiles found.</p>
        ) : (
          <>
            {/* Render Batches Divided Clearly */}
            {currentBatches.map((batchGroup, groupIndex) => (
              <div key={groupIndex} style={{ marginBottom: '55px' }}>
                {/* Batch Header */}
                <div style={{ textAlign: 'center', marginBottom: '35px' }}>
                  <h2 
                    style={{
                      fontFamily: '"Georgia", serif',
                      color: '#0f2942',
                      fontSize: '2rem',
                      fontWeight: 'bold',
                      marginBottom: '10px'
                    }}
                  >
                    {batchGroup.batchTitle.toLowerCase().includes('batch') || batchGroup.batchTitle.toLowerCase().includes('team')
                      ? batchGroup.batchTitle
                      : `Batch ${batchGroup.batchTitle}`}
                  </h2>
                  <div 
                    style={{
                      width: '50px',
                      height: '3px',
                      backgroundColor: '#f59e0b',
                      margin: '0 auto',
                      borderRadius: '2px'
                    }} 
                  />
                </div>

                {/* Developer Cards Flex-Row */}
                <div 
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    flexWrap: 'wrap',
                    justifyContent: 'center',
                    gap: '24px',
                    width: '100%'
                  }}
                >
                  {batchGroup.members.map((dev) => {
                    const imageSrc = dev.image 
                      ? (dev.image.startsWith('http') ? dev.image : `${BASE_URL}${dev.image.startsWith('/') ? '' : '/'}${dev.image.replace(/\\/g, '/')}`) 
                      : '/assets/profile-placeholder.svg';

                    return (
                      <div 
                        key={dev._id}
                        style={{
                          flex: '1 1 240px',
                          maxWidth: '280px',
                          minWidth: '230px',
                          backgroundColor: '#ffffff',
                          borderRadius: '12px',
                          overflow: 'hidden',
                          boxShadow: '0 4px 18px rgba(0, 0, 0, 0.07)',
                          transition: 'transform 0.25s ease, box-shadow 0.25s ease',
                          display: 'flex',
                          flexDirection: 'column',
                          border: '1px solid #e2e8f0',
                          cursor: 'default'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-6px)';
                          e.currentTarget.style.boxShadow = '0 12px 28px rgba(15, 41, 66, 0.14)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = '0 4px 18px rgba(0, 0, 0, 0.07)';
                        }}
                      >
                        {/* Photo Container */}
                        <div style={{ width: '100%', height: '220px', overflow: 'hidden', backgroundColor: '#e2e8f0' }}>
                          <img 
                            src={imageSrc} 
                            alt={dev.name}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover'
                            }}
                          />
                        </div>

                        {/* Info Section */}
                        <div 
                          style={{
                            padding: '20px 16px',
                            textAlign: 'center',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            flexGrow: 1,
                            justifyContent: 'space-between'
                          }}
                        >
                          <div>
                            <h3 
                              style={{
                                fontSize: '1.25rem',
                                fontWeight: 'bold',
                                color: '#0f2942',
                                margin: '0 0 6px'
                              }}
                            >
                              {dev.name}
                            </h3>
                            <p 
                              style={{
                                fontSize: '0.95rem',
                                color: '#2563eb',
                                fontWeight: '600',
                                margin: '0 0 10px'
                              }}
                            >
                              {dev.role}
                            </p>
                          </div>

                          {/* Academic Year and Branch */}
                          {(dev.branch || dev.academicYear) && (
                            <div 
                              style={{
                                display: 'inline-block',
                                backgroundColor: '#f8fafc',
                                border: '1px solid #e2e8f0',
                                color: '#64748b',
                                fontSize: '0.82rem',
                                fontWeight: '500',
                                padding: '4px 12px',
                                borderRadius: '20px',
                                marginTop: '6px'
                              }}
                            >
                              {dev.branch && `${dev.branch}`}
                              {dev.branch && dev.academicYear && ' • '}
                              {dev.academicYear && `${dev.academicYear}`}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center' }}>
                <Pagination
                  totalPages={totalPages}
                  currentPage={currentPage}
                  onPageChange={handlePageChange}
                  stylePrefix="user-profile"
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Developers;
