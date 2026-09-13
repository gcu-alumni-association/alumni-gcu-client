import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Spinner from '../../components/common/LoadingSpinner';
import Pagination from '../../components/common/Pagination';
import ProfilePhoto from '../../components/common/ProfilePhotoComponent';
import { useUser } from '../../services/UserContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faBriefcase, 
  faPlus, 
  faLocationDot, 
  faBuilding, 
  faArrowUpRightFromSquare,
  faComments,
  faCalendarXmark,
  faListCheck,
  faUserTie,
  faLock,
  faRightToBracket,
  faXmark
} from '@fortawesome/free-solid-svg-icons';
import './articles.css';

const JobsOpportunity = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPosts, setTotalPosts] = useState(0);
  const [selectedJobForModal, setSelectedJobForModal] = useState(null);
  const limit = 6;

  const fetchJobs = async (page = 1) => {
    try {
      setLoading(true);
      const response = await api.get(`/posts/public-jobs?page=${page}&limit=${limit}`);
      setJobs(response.data?.jobs || []);
      setTotalPages(response.data?.totalPages || 1);
      setTotalPosts(response.data?.totalPosts || 0);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs(currentPage);
  }, [currentPage]);

  const handlePostJobClick = () => {
    if (user) {
      navigate('/welcome', { state: { tab: 'jobs' } });
    } else {
      navigate('/login', { state: { from: '/opportunity/jobs' } });
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="main" style={{ minHeight: '85vh', backgroundColor: '#f8fafc', paddingBottom: '70px' }}>
      {/* Hero Header Banner */}
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
          Career & Job Opportunities
        </h1>
        <p 
          style={{
            fontSize: '1.2rem',
            fontWeight: '300',
            maxWidth: '650px',
            color: '#cbd5e1',
            margin: '0 auto'
          }}
        >
          Explore job openings, internships, and hiring opportunities shared directly by our alumni community.
        </p>
      </div>

      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '40px 20px', width: '100%' }}>
        {/* Actions Bar */}
        <div 
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px',
            marginBottom: '35px',
            backgroundColor: '#ffffff',
            padding: '20px 24px',
            borderRadius: '12px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
            border: '1px solid #e2e8f0'
          }}
        >
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#0f2942', margin: 0 }}>
              <FontAwesomeIcon icon={faBriefcase} style={{ color: '#003366', marginRight: '10px' }} />
              Active Job Postings ({totalPosts})
            </h2>
            <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '0.9rem' }}>
              Discover career openings shared by fellow GCU graduates
            </p>
          </div>

          <button
            onClick={handlePostJobClick}
            style={{
              backgroundColor: '#003366',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              padding: '10px 20px',
              fontWeight: '600',
              fontSize: '0.95rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(0,51,102,0.2)'
            }}
          >
            <FontAwesomeIcon icon={faPlus} /> {user ? 'Post a Job Opening' : 'Login to Post Job'}
          </button>
        </div>

        {/* Jobs List */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
            <Spinner />
          </div>
        ) : jobs.length === 0 ? (
          <div 
            style={{
              textAlign: 'center',
              padding: '60px 20px',
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              color: '#64748b'
            }}
          >
            <FontAwesomeIcon icon={faBriefcase} style={{ fontSize: '48px', color: '#cbd5e1', marginBottom: '16px' }} />
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#334155', marginBottom: '8px' }}>
              No Job Openings Yet
            </h3>
            <p style={{ margin: 0, fontSize: '0.95rem' }}>
              Be the first to share an opportunity with fellow alumni!
            </p>
            <button
              onClick={handlePostJobClick}
              style={{
                marginTop: '18px',
                backgroundColor: '#003366',
                color: '#fff',
                border: 'none',
                padding: '8px 18px',
                borderRadius: '6px',
                fontSize: '0.9rem',
                fontWeight: '500',
                cursor: 'pointer'
              }}
            >
              Post Opportunity
            </button>
          </div>
        ) : (
          /* Cards Grid Layout */
          <div 
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
              gap: '24px',
              width: '100%'
            }}
          >
            {jobs.map((job, index) => {
              const author = job.author;
              const details = job.jobDetails || {};
              const roleTitle = details.role || 'Job Opportunity';
              const company = details.companyName || author?.currentWorkingPlace || 'Organization';
              const location = details.location || '';
              const salary = details.salary;
              const jobType = details.jobType || 'Full-time';
              const experience = details.experience;
              const deadline = details.deadline;
              const requirements = details.requirements;
              const aboutRole = details.aboutRole || job.content;
              const applyLink = details.applyLinkOrEmail;

              const postedDateFormatted = job.createdAt
                ? new Date(job.createdAt).toLocaleDateString('en-GB')
                : '';

              const deadlineFormatted = deadline
                ? (deadline.includes('-')
                    ? new Date(deadline).toLocaleDateString('en-GB')
                    : deadline)
                : null;
              
              // Blur all cards beyond the first 2 if visitor is not signed in
              const isBlurred = !user && index >= 2;

              return (
                <div key={job._id} className={`job-card-container ${isBlurred ? 'job-card-blurred-container' : ''}`}>
                  {/* Sign In Overlay for blurred cards */}
                  {isBlurred && (
                    <div className="job-card-signin-overlay">
                      <div className="job-card-lock-icon">
                        <FontAwesomeIcon icon={faLock} />
                      </div>
                      <h4 className="job-card-signin-title">Member Only Content</h4>
                      <p className="job-card-signin-desc">
                        Sign in with your GCU alumni account to view full job details and apply.
                      </p>
                      <button
                        onClick={() => navigate('/login', { state: { from: '/opportunity/jobs' } })}
                        className="job-card-signin-btn"
                      >
                        <FontAwesomeIcon icon={faRightToBracket} /> Sign In to View
                      </button>
                    </div>
                  )}

                  <div className={isBlurred ? 'job-card-blur-content' : ''} style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
                    <div>
                      {/* Top row: Posted Date */}
                      {postedDateFormatted && (
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '8px' }}>
                          <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: '500' }}>
                            {postedDateFormatted}
                          </span>
                        </div>
                      )}

                      {/* Role Title */}
                      <h3 className="job-card-title">
                        {roleTitle}
                      </h3>

                      {/* Subheader: Company, Location & Job Type */}
                      <div className="job-card-meta-line">
                        <span className="job-card-meta-item" style={{ fontWeight: '600', color: '#334155' }}>
                          <FontAwesomeIcon icon={faBuilding} style={{ color: '#64748b', fontSize: '13px' }} />
                          {company}
                        </span>

                        {location && (
                          <span className="job-card-meta-item">
                            <FontAwesomeIcon icon={faLocationDot} style={{ color: '#94a3b8', fontSize: '12px' }} />
                            {location}
                          </span>
                        )}

                        <span className="job-card-meta-item" style={{ color: '#64748b' }}>
                          • {jobType}
                        </span>
                      </div>

                      {/* Description excerpt with View Details button */}
                      <p className="job-card-description">
                        {aboutRole}
                      </p>
                      <button
                        onClick={() => setSelectedJobForModal(job)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#2563eb',
                          fontSize: '0.82rem',
                          fontWeight: '600',
                          cursor: 'pointer',
                          padding: 0,
                          marginTop: '-6px',
                          marginBottom: '14px',
                          display: 'inline-block'
                        }}
                      >
                        View Full Details & About ↗
                      </button>

                      {/* Badges / Tags row: Salary, Experience, Deadline */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '14px' }}>
                        {salary && (
                          <span className="job-card-tag tag-highlight">
                            {salary}
                          </span>
                        )}

                        {experience && (
                          <span className="job-card-tag">
                            <FontAwesomeIcon icon={faUserTie} style={{ color: '#64748b', fontSize: '11px' }} /> {experience}
                          </span>
                        )}

                        {deadlineFormatted && (
                          <span className="job-card-tag">
                            <FontAwesomeIcon icon={faCalendarXmark} style={{ color: '#64748b', fontSize: '11px' }} /> Deadline: {deadlineFormatted}
                          </span>
                        )}
                      </div>

                      {/* Explicitly Labeled Requirements Section */}
                      {requirements && (
                        <div style={{ marginBottom: '16px' }}>
                          <div style={{ fontSize: '0.82rem', fontWeight: '700', color: '#1e293b', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <FontAwesomeIcon icon={faListCheck} style={{ color: '#003366', fontSize: '11px' }} /> Requirements:
                          </div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                            {requirements.split(/[,•\n]+/).filter(r => r.trim()).slice(0, 3).map((skill, idx) => (
                              <span key={idx} className="job-card-tag" style={{ fontSize: '0.78rem' }}>
                                • {skill.trim()}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div>
                      {/* Posted by author section */}
                      <div 
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '10px 0',
                          borderTop: '1px solid #f1f5f9',
                          marginBottom: '14px'
                        }}
                      >
                        <div style={{ width: '28px', height: '28px', borderRadius: '50%', overflow: 'hidden', backgroundColor: '#e2e8f0', flexShrink: 0 }}>
                          <ProfilePhoto
                            userId={author?._id}
                            photoPath={author?.profilePhoto}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        </div>
                        <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                          Shared by <strong style={{ color: '#334155' }}>{author?.name || 'Alumnus'}</strong>
                          {author?.role === 'admin' || author?.role === 'superuser' ? (
                            <span style={{ marginLeft: '4px', fontSize: '0.75rem', backgroundColor: '#e0f2fe', color: '#0369a1', padding: '1px 6px', borderRadius: '4px', fontWeight: '600' }}>
                              Admin
                            </span>
                          ) : author?.batch ? (
                            ` (Batch ${author.batch})`
                          ) : ''}
                        </span>
                      </div>

                      {/* Action buttons: Green Apply Button & Details Button */}
                      <div style={{ display: 'flex', gap: '10px' }}>
                        {applyLink ? (
                          <a
                            href={applyLink.startsWith('http') ? applyLink : `mailto:${applyLink}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="job-btn-primary"
                            tabIndex={isBlurred ? -1 : 0}
                          >
                            Apply Now <FontAwesomeIcon icon={faArrowUpRightFromSquare} style={{ fontSize: '11px' }} />
                          </a>
                        ) : null}

                        <button
                          onClick={() => {
                            if (user) {
                              navigate(`/welcome/post/${job._id}`);
                            } else {
                              navigate('/login', { state: { from: `/welcome/post/${job._id}` } });
                            }
                          }}
                          className="job-btn-secondary"
                          style={{ flex: applyLink ? '0 0 auto' : 1 }}
                          tabIndex={isBlurred ? -1 : 0}
                        >
                          <FontAwesomeIcon icon={faComments} style={{ fontSize: '12px' }} /> Discussion ({job.comments?.length || 0})
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Full Details Job Modal */}
        {selectedJobForModal && (
          <div 
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100vw',
              height: '100vh',
              backgroundColor: 'rgba(15, 23, 42, 0.65)',
              backdropFilter: 'blur(4px)',
              zIndex: 9999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px'
            }}
            onClick={() => setSelectedJobForModal(null)}
          >
            <div 
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '16px',
                width: '100%',
                maxWidth: '650px',
                maxHeight: '90vh',
                overflowY: 'auto',
                boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
                position: 'relative',
                padding: '28px 24px'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #e2e8f0', paddingBottom: '14px', marginBottom: '16px' }}>
                <div>
                  <h2 style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#0f2942', margin: 0 }}>
                    {selectedJobForModal.jobDetails?.role || selectedJobForModal.role || 'Job Opportunity'}
                  </h2>
                  <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <FontAwesomeIcon icon={faBuilding} style={{ fontSize: '13px' }} />
                    {selectedJobForModal.jobDetails?.companyName || selectedJobForModal.author?.currentWorkingPlace || 'Organization'}
                    {selectedJobForModal.jobDetails?.location && ` • 📍 ${selectedJobForModal.jobDetails.location}`}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedJobForModal(null)}
                  style={{
                    background: '#f1f5f9',
                    border: 'none',
                    borderRadius: '50%',
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: '#64748b'
                  }}
                >
                  <FontAwesomeIcon icon={faXmark} />
                </button>
              </div>

              {/* Modal Metadata Tags */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '20px' }}>
                {selectedJobForModal.jobDetails?.jobType && (
                  <span className="job-card-tag tag-success">
                    💼 {selectedJobForModal.jobDetails.jobType}
                  </span>
                )}
                {selectedJobForModal.jobDetails?.salary && (
                  <span className="job-card-tag tag-highlight">
                    💰 {selectedJobForModal.jobDetails.salary}
                  </span>
                )}
                {selectedJobForModal.jobDetails?.experience && (
                  <span className="job-card-tag">
                    <FontAwesomeIcon icon={faUserTie} style={{ color: '#64748b', fontSize: '11px' }} /> {selectedJobForModal.jobDetails.experience}
                  </span>
                )}
                {selectedJobForModal.jobDetails?.deadline && (
                  <span className="job-card-tag">
                    <FontAwesomeIcon icon={faCalendarXmark} style={{ color: '#64748b', fontSize: '11px' }} /> Deadline: {selectedJobForModal.jobDetails.deadline}
                  </span>
                )}
              </div>

              {/* Requirements Section */}
              {selectedJobForModal.jobDetails?.requirements && (
                <div style={{ marginBottom: '20px', backgroundColor: '#f8fafc', padding: '14px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 'bold', color: '#0f2942', margin: '0 0 8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <FontAwesomeIcon icon={faListCheck} style={{ color: '#003366', fontSize: '13px' }} /> Key Requirements:
                  </h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {selectedJobForModal.jobDetails.requirements.split(/[,•\n]+/).filter(r => r.trim()).map((skill, idx) => (
                      <span key={idx} className="job-card-tag" style={{ backgroundColor: '#ffffff', fontSize: '0.82rem' }}>
                        • {skill.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Complete About Role */}
              <div style={{ marginBottom: '24px' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: 'bold', color: '#0f2942', marginBottom: '8px' }}>
                  About Role & Responsibilities:
                </h4>
                <div style={{ color: '#334155', fontSize: '0.95rem', lineHeight: '1.7', whiteSpace: 'pre-line', backgroundColor: '#f8fafc', padding: '16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  {selectedJobForModal.jobDetails?.aboutRole || selectedJobForModal.content}
                </div>
              </div>

              {/* Modal Footer */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #e2e8f0', paddingTop: '16px', flexWrap: 'wrap', gap: '10px' }}>
                <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
                  Shared by <strong style={{ color: '#334155' }}>{selectedJobForModal.author?.name || 'Alumnus'}</strong>
                  {selectedJobForModal.author?.role === 'admin' || selectedJobForModal.author?.role === 'superuser' ? (
                    <span style={{ marginLeft: '4px', fontSize: '0.75rem', backgroundColor: '#e0f2fe', color: '#0369a1', padding: '1px 6px', borderRadius: '4px', fontWeight: '600' }}>
                      Admin
                    </span>
                  ) : selectedJobForModal.author?.batch ? (
                    ` (Batch ${selectedJobForModal.author.batch})`
                  ) : ''}
                </span>

                <div style={{ display: 'flex', gap: '10px' }}>
                  {selectedJobForModal.jobDetails?.applyLinkOrEmail && (
                    <a
                      href={selectedJobForModal.jobDetails.applyLinkOrEmail.startsWith('http') ? selectedJobForModal.jobDetails.applyLinkOrEmail : `mailto:${selectedJobForModal.jobDetails.applyLinkOrEmail}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="job-btn-primary"
                      style={{ padding: '8px 20px' }}
                    >
                      Apply Now <FontAwesomeIcon icon={faArrowUpRightFromSquare} style={{ fontSize: '11px' }} />
                    </a>
                  )}
                  <button
                    onClick={() => setSelectedJobForModal(null)}
                    style={{ padding: '8px 18px', backgroundColor: '#e2e8f0', color: '#334155', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ marginTop: '40px', display: 'flex', justifyContent: 'center' }}>
            <Pagination
              totalPages={totalPages}
              currentPage={currentPage}
              onPageChange={handlePageChange}
              stylePrefix="user-profile"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default JobsOpportunity;
