import React, { useState, useEffect } from 'react';
import { FaFacebook, FaLinkedin, FaBuilding, FaPlus, FaTrash, FaBriefcase, FaUser, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';
import { useUser } from "../../services/UserContext";
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../pages.css';
import api from '../../services/api';
import Spinner from "../../components/common/LoadingSpinner";
import { GENDER_OPTIONS, INDUSTRY_OPTIONS } from '../../data/profileOptions';

const BASE_URL = process.env.REACT_APP_BASE_URL || 'http://localhost:5000';

const UpdateProfile = () => {
  const { user, refreshUser } = useUser();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registeredCompanies, setRegisteredCompanies] = useState([]);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    biography: '',
    companyId: '',
    currentWorkingPlace: '',
    address: '',
    designation: '',
    gender: '',
    areaOfExpertise: '',
    industry: '',
    achievements: '',
    linkedin: '',
    facebook: ''
  });

  // Work History Array State
  const [workHistoryList, setWorkHistoryList] = useState([]);

  // Work History Entry Inputs (for adding new history item)
  const [newWorkItem, setNewWorkItem] = useState({
    companyId: '',
    customCompanyName: '',
    designation: '',
    startDate: '',
    endDate: '',
    isCurrent: false
  });

  useEffect(() => {
    fetchCompanies();
    fetchUserData();
  }, []);

  const fetchCompanies = async () => {
    try {
      const res = await api.get('/user/companies');
      setRegisteredCompanies(res.data || []);
    } catch (err) {
      console.error('Failed to fetch companies:', err);
    }
  };

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/user/user');
      if (response && response.data) {
        const userData = response.data;

        let achievementsStr = '';
        if (userData.achievements) {
          if (Array.isArray(userData.achievements)) {
            achievementsStr = userData.achievements.join('\n');
          } else {
            achievementsStr = userData.achievements;
          }
        }

        setFormData({
          name: userData.name || '',
          phone: userData.phone || '',
          biography: userData.biography || '',
          companyId: userData.company?._id || userData.company || '',
          currentWorkingPlace: userData.currentWorkingPlace || '',
          address: userData.address || '',
          designation: userData.designation || '',
          gender: userData.gender || '',
          areaOfExpertise: userData.areaOfExpertise || '',
          industry: userData.industry || '',
          achievements: achievementsStr,
          linkedin: userData.socialLinks?.linkedin || '',
          facebook: userData.socialLinks?.facebook || ''
        });

        // Initialize Work History list
        if (userData.workHistory && Array.isArray(userData.workHistory)) {
          setWorkHistoryList(
            userData.workHistory.map((item) => ({
              companyId: item.company?._id || item.company,
              companyName: item.company?.name || 'Company',
              companyLogo: item.company?.logo || null,
              designation: item.designation || '',
              startDate: item.startDate || '',
              endDate: item.endDate || '',
              isCurrent: Boolean(item.isCurrent)
            }))
          );
        }
      }
    } catch (err) {
      console.error('Error fetching user data:', err);
      toast.error('Error loading profile data');
    } finally {
      setLoading(false);
    }
  };

  const onChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      // If companyId selected, auto-update currentWorkingPlace
      if (name === 'companyId') {
        const selected = registeredCompanies.find((c) => c._id === value);
        if (selected) {
          updated.currentWorkingPlace = selected.name;
        }
      }
      return updated;
    });
  };

  // Work History Add handler
  const handleAddWorkHistoryItem = () => {
    if (!newWorkItem.companyId && !newWorkItem.customCompanyName.trim()) {
      toast.error('Please select or enter a company name.');
      return;
    }

    let compId = newWorkItem.companyId;
    let compName = newWorkItem.customCompanyName.trim();
    let compLogo = null;

    if (newWorkItem.companyId) {
      const match = registeredCompanies.find((c) => c._id === newWorkItem.companyId);
      if (match) {
        compName = match.name;
        compLogo = match.logo;
      }
    }

    const newItem = {
      companyId: compId,
      companyName: compName,
      companyLogo: compLogo,
      designation: newWorkItem.designation.trim(),
      startDate: newWorkItem.startDate.trim(),
      endDate: newWorkItem.endDate.trim(),
      isCurrent: newWorkItem.isCurrent
    };

    // If marked current, unmark current on other items
    let updatedList = [...workHistoryList];
    if (newItem.isCurrent) {
      updatedList = updatedList.map((item) => ({ ...item, isCurrent: false }));
      // also sync primary company in form
      setFormData((prev) => ({
        ...prev,
        companyId: compId || prev.companyId,
        currentWorkingPlace: compName || prev.currentWorkingPlace,
        designation: newItem.designation || prev.designation
      }));
    }

    setWorkHistoryList([...updatedList, newItem]);
    setNewWorkItem({
      companyId: '',
      customCompanyName: '',
      designation: '',
      startDate: '',
      endDate: '',
      isCurrent: false
    });
    toast.info(`Added ${compName} to your work history!`);
  };

  // Remove work history item
  const handleRemoveWorkHistoryItem = (index) => {
    setWorkHistoryList(workHistoryList.filter((_, idx) => idx !== index));
  };

  const handleBack = () => {
    navigate('/profile');
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);

      let achievementsData = formData.achievements;
      if (typeof formData.achievements === 'string') {
        achievementsData = formData.achievements
          .split('\n')
          .map((item) => item.trim())
          .filter((item) => item.length > 0);
      }

      // Format work history array for API
      const formattedWorkHistory = workHistoryList
        .filter((item) => item.companyId)
        .map((item) => ({
          company: item.companyId,
          designation: item.designation,
          startDate: item.startDate,
          endDate: item.endDate,
          isCurrent: item.isCurrent
        }));

      await api.put('/user/update-profile', {
        name: formData.name,
        phone: formData.phone,
        biography: formData.biography,
        company: formData.companyId || null,
        currentWorkingPlace: formData.currentWorkingPlace,
        address: formData.address,
        designation: formData.designation,
        gender: formData.gender,
        areaOfExpertise: formData.areaOfExpertise,
        industry: formData.industry,
        achievements: achievementsData,
        socialLinks: {
          linkedin: formData.linkedin,
          facebook: formData.facebook
        },
        workHistory: formattedWorkHistory
      });

      if (refreshUser && typeof refreshUser === 'function') {
        await refreshUser();
      }

      navigate('/profile', {
        state: {
          message: 'Profile Updated Successfully!',
          type: 'success'
        }
      });
    } catch (err) {
      console.error(err.response?.data || err);
      toast.error(err.response?.data?.error || 'Error Updating Profile');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="main">
      <ToastContainer position="bottom-center" autoClose={2000} />
      <div className="modern-profile-container">
        <div className="profile-header">
          <h2 className="card-header">Edit Full Profile</h2>
        </div>
        <div className="modern-profile-card">
          <div className="card-body">
            {loading ? (
              <Spinner />
            ) : (
              <form onSubmit={onSubmit} className="update-form">
                {/* SECTION 1: PERSONAL INFORMATION */}
                <h3 style={{ borderBottom: '2px solid #003366', paddingBottom: '6px', color: '#003366', marginBottom: '15px' }}>
                  <FaUser style={{ marginRight: '8px' }} />
                  Personal Information
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '15px' }}>
                  <div className="form-group">
                    <label htmlFor="formName">Full Name:</label>
                    <input
                      className="form-input"
                      type="text"
                      id="formName"
                      name="name"
                      value={formData.name}
                      onChange={onChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="formPhone">
                      <FaPhone style={{ marginRight: '4px' }} /> Phone Number (10 Digits):
                    </label>
                    <input
                      className="form-input"
                      type="text"
                      id="formPhone"
                      name="phone"
                      value={formData.phone}
                      onChange={onChange}
                      placeholder="10 digit phone number"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="formGender">Gender:</label>
                    <select
                      className="form-input"
                      id="formGender"
                      name="gender"
                      value={formData.gender}
                      onChange={onChange}
                    >
                      <option value="">-- Select Gender --</option>
                      {GENDER_OPTIONS.map((option) => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="formAddress">
                    <FaMapMarkerAlt style={{ marginRight: '4px' }} /> Current Address:
                  </label>
                  <input
                    className="form-input"
                    type="text"
                    id="formAddress"
                    name="address"
                    value={formData.address}
                    onChange={onChange}
                    placeholder="City, State, Country"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="formBiography">Biography / About Me:</label>
                  <textarea
                    className="form-input"
                    id="formBiography"
                    name="biography"
                    rows="3"
                    value={formData.biography}
                    onChange={onChange}
                    placeholder="Tell us about yourself..."
                  />
                </div>

                {/* SECTION 2: CURRENT PLACEMENT */}
                <h3 style={{ borderBottom: '2px solid #003366', paddingBottom: '6px', color: '#003366', marginTop: '25px', marginBottom: '15px' }}>
                  <FaBuilding style={{ marginRight: '8px' }} />
                  Current Employment / Placement
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '15px' }}>
                  <div className="form-group">
                    <label htmlFor="formCompanyId">Select Current Company:</label>
                    <select
                      className="form-input"
                      id="formCompanyId"
                      name="companyId"
                      value={formData.companyId}
                      onChange={onChange}
                    >
                      <option value="">-- Choose Registered Company --</option>
                      {registeredCompanies.map((comp) => (
                        <option key={comp._id} value={comp._id}>
                          {comp.name} {comp.industry ? `(${comp.industry})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="formCurrentWorkingPlace">Or Company Name:</label>
                    <input
                      className="form-input"
                      type="text"
                      id="formCurrentWorkingPlace"
                      name="currentWorkingPlace"
                      value={formData.currentWorkingPlace}
                      onChange={onChange}
                      placeholder="e.g. Google, TCS, Startup Inc."
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="formDesignation">Current Designation / Title:</label>
                    <input
                      className="form-input"
                      type="text"
                      id="formDesignation"
                      name="designation"
                      value={formData.designation}
                      onChange={onChange}
                      placeholder="e.g. Senior Software Engineer"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="formIndustry">Industry / Sector:</label>
                    <select
                      className="form-input"
                      id="formIndustry"
                      name="industry"
                      value={formData.industry}
                      onChange={onChange}
                    >
                      <option value="">-- Select Industry / Sector --</option>
                      {INDUSTRY_OPTIONS.map((option) => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="formAreaOfExpertise">Area of Expertise:</label>
                    <input
                      className="form-input"
                      type="text"
                      id="formAreaOfExpertise"
                      name="areaOfExpertise"
                      value={formData.areaOfExpertise}
                      onChange={onChange}
                      maxLength={200}
                      placeholder="e.g. Machine Learning, Corporate Law"
                    />
                  </div>
                </div>

                {/* SECTION 3: WORK HISTORY & PREVIOUS COMPANIES */}
                <h3 style={{ borderBottom: '2px solid #003366', paddingBottom: '6px', color: '#003366', marginTop: '25px', marginBottom: '15px' }}>
                  <FaBriefcase style={{ marginRight: '8px' }} />
                  Work Experience & Companies Worked At
                </h3>

                {/* Existing Work History Items */}
                {workHistoryList.length > 0 ? (
                  <div style={{ marginBottom: '15px' }}>
                    <label>Your Recorded Companies:</label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
                      {workHistoryList.map((item, index) => (
                        <div
                          key={index}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            background: '#f8f9fa',
                            padding: '10px 14px',
                            borderRadius: '6px',
                            border: '1px solid #e2e8f0'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <FaBuilding style={{ color: '#003366' }} />
                            <div>
                              <strong>{item.companyName}</strong>
                              {item.designation && <span> - {item.designation}</span>}
                              {item.startDate && (
                                <small style={{ display: 'block', color: '#666' }}>
                                  {item.startDate} - {item.endDate || 'Present'}
                                </small>
                              )}
                            </div>
                            {item.isCurrent && (
                              <span style={{ backgroundColor: '#28a745', color: '#fff', fontSize: '11px', padding: '2px 8px', borderRadius: '10px', fontWeight: 'bold' }}>
                                Current
                              </span>
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={() => handleRemoveWorkHistoryItem(index)}
                            style={{ background: '#dc3545', color: '#fff', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer' }}
                            title="Remove Company"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p style={{ fontStyle: 'italic', color: '#777' }}>No extra work history added yet.</p>
                )}

                {/* Add Work History Entry Card */}
                <div style={{ background: '#f0f4f8', padding: '15px', borderRadius: '8px', border: '1px solid #cbd5e1', marginBottom: '20px' }}>
                  <h4 style={{ marginTop: 0, marginBottom: '10px', color: '#003366' }}>+ Add a Company to Work History</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
                    <div className="form-group">
                      <label>Select Registered Company:</label>
                      <select
                        className="form-input"
                        value={newWorkItem.companyId}
                        onChange={(e) => setNewWorkItem({ ...newWorkItem, companyId: e.target.value })}
                      >
                        <option value="">-- Choose Company --</option>
                        {registeredCompanies.map((c) => (
                          <option key={c._id} value={c._id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Designation / Role:</label>
                      <input
                        className="form-input"
                        type="text"
                        value={newWorkItem.designation}
                        onChange={(e) => setNewWorkItem({ ...newWorkItem, designation: e.target.value })}
                        placeholder="e.g. Project Lead"
                      />
                    </div>

                    <div className="form-group">
                      <label>Start Year / Date:</label>
                      <input
                        className="form-input"
                        type="text"
                        value={newWorkItem.startDate}
                        onChange={(e) => setNewWorkItem({ ...newWorkItem, startDate: e.target.value })}
                        placeholder="e.g. 2020"
                      />
                    </div>

                    <div className="form-group">
                      <label>End Year / Date:</label>
                      <input
                        className="form-input"
                        type="text"
                        value={newWorkItem.endDate}
                        onChange={(e) => setNewWorkItem({ ...newWorkItem, endDate: e.target.value })}
                        placeholder="e.g. 2023 or Present"
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '10px' }}>
                    <input
                      type="checkbox"
                      id="userIsCurrentCheck"
                      checked={newWorkItem.isCurrent}
                      onChange={(e) => setNewWorkItem({ ...newWorkItem, isCurrent: e.target.checked })}
                    />
                    <label htmlFor="userIsCurrentCheck" style={{ cursor: 'pointer', fontWeight: 'bold' }}>
                      Mark as Current Company
                    </label>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddWorkHistoryItem}
                    style={{ backgroundColor: '#003366', color: '#fff', border: 'none', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer', marginTop: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <FaPlus /> Add Company to Profile
                  </button>
                </div>

                {/* SECTION 4: ACHIEVEMENTS & SOCIAL LINKS */}
                <h3 style={{ borderBottom: '2px solid #003366', paddingBottom: '6px', color: '#003366', marginTop: '25px', marginBottom: '15px' }}>
                  Achievements & Social Media
                </h3>

                <div className="form-group">
                  <label htmlFor="formAchievements">Achievements:</label>
                  <textarea
                    className="form-input"
                    id="formAchievements"
                    name="achievements"
                    rows="3"
                    value={formData.achievements}
                    onChange={onChange}
                    placeholder="Enter each achievement on a new line"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="formLinkedin">
                    <FaLinkedin size={22} style={{ color: '#0a66c2', marginRight: '6px' }} /> LinkedIn Profile URL:
                  </label>
                  <input
                    className="form-input"
                    type="url"
                    id="formLinkedin"
                    name="linkedin"
                    placeholder="https://www.linkedin.com/in/your-profile"
                    value={formData.linkedin}
                    onChange={onChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="formFacebook">
                    <FaFacebook size={22} style={{ color: '#1877f2', marginRight: '6px' }} /> Facebook Profile URL:
                  </label>
                  <input
                    className="form-input"
                    type="url"
                    id="formFacebook"
                    name="facebook"
                    placeholder="https://www.facebook.com/your-profile"
                    value={formData.facebook}
                    onChange={onChange}
                  />
                </div>

                {/* BUTTONS */}
                <div className="button-group" style={{ marginTop: '25px' }}>
                  <button type="button" className="cancel-button" onClick={handleBack} disabled={isSubmitting}>
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="update-button"
                    style={
                      isSubmitting
                        ? {
                            backgroundColor: '#7a7a7a',
                            cursor: 'not-allowed',
                            opacity: 0.8
                          }
                        : { backgroundColor: '#003366' }
                    }
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Saving Profile...' : 'Save & Update Profile'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdateProfile;