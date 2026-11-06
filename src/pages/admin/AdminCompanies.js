import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import './admin.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faBuilding, 
  faPlus, 
  faEdit, 
  faTrash, 
  faUserTie, 
  faMagnifyingGlass, 
  faCheck,
  faXmark,
  faBriefcase,
  faHistory
} from '@fortawesome/free-solid-svg-icons';
import { compressImage } from '../../utils/imageCompressor';

const BASE_URL = process.env.REACT_APP_BASE_URL || 'http://localhost:5000';

const getLogoUrl = (logo) => {
  if (!logo) return null;
  if (logo.startsWith('http://') || logo.startsWith('https://')) return logo;
  return `${BASE_URL}${logo}`;
};

const AdminCompanies = () => {
  const [activeTab, setActiveTab] = useState('companies'); // 'companies' | 'assign'

  // Companies state
  const [companies, setCompanies] = useState([]);
  const [loadingCompanies, setLoadingCompanies] = useState(false);
  const [companySearch, setCompanySearch] = useState('');
  
  // Company form state
  const [companyForm, setCompanyForm] = useState({
    name: '',
    industry: '',
    location: '',
    website: '',
    description: '',
    logo: ''
  });
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [editingCompanyId, setEditingCompanyId] = useState(null);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  // Alumni state
  const [alumni, setAlumni] = useState([]);
  const [loadingAlumni, setLoadingAlumni] = useState(false);
  const [alumniSearch, setAlumniSearch] = useState('');
  
  // Quick assignment state
  const [selectedAlumniId, setSelectedAlumniId] = useState('');
  const [selectedCompanyId, setSelectedCompanyId] = useState('');
  const [assignMessage, setAssignMessage] = useState({ type: '', text: '' });

  // Work History Modal state
  const [historyModalUser, setHistoryModalUser] = useState(null);
  const [historyForm, setHistoryForm] = useState({
    companyId: '',
    designation: '',
    startDate: '',
    endDate: '',
    isCurrent: false
  });
  const [historyMessage, setHistoryMessage] = useState({ type: '', text: '' });
  const [submittingHistory, setSubmittingHistory] = useState(false);

  useEffect(() => {
    fetchCompanies();
    fetchAlumni();
  }, []);

  const fetchCompanies = async () => {
    setLoadingCompanies(true);
    try {
      const res = await api.get('/admin/companies');
      setCompanies(res.data);
    } catch (err) {
      console.error('Failed to fetch companies:', err);
    } finally {
      setLoadingCompanies(false);
    }
  };

  const fetchAlumni = async () => {
    setLoadingAlumni(true);
    try {
      const res = await api.get('/admin/approved-users');
      setAlumni(res.data);

      // If history modal is currently open, update its user state
      if (historyModalUser) {
        const updatedModalUser = res.data.find((u) => u._id === historyModalUser._id);
        if (updatedModalUser) {
          setHistoryModalUser(updatedModalUser);
        }
      }
    } catch (err) {
      console.error('Failed to fetch alumni:', err);
    } finally {
      setLoadingAlumni(false);
    }
  };

  // Handle Company Form input change
  const handleCompanyInputChange = (e) => {
    const { name, value } = e.target;
    setCompanyForm({ ...companyForm, [name]: value });
  };

  // Handle logo file selection
  const handleLogoFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  // Submit company (Add or Update)
  const handleCompanySubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!companyForm.name.trim()) {
      setFormError('Company name is required.');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('name', companyForm.name);
      formData.append('industry', companyForm.industry);
      formData.append('location', companyForm.location);
      formData.append('website', companyForm.website);
      formData.append('description', companyForm.description);
      formData.append('logo', companyForm.logo);
      if (logoFile) {
        const compressedLogo = await compressImage(logoFile, {
          maxSizeMB: 0.5,
          maxWidthOrHeight: 800
        });
        formData.append('logoFile', compressedLogo);
      }

      const config = {
        headers: { 'Content-Type': 'multipart/form-data' }
      };

      if (editingCompanyId) {
        await api.put(`/admin/company/${editingCompanyId}`, formData, config);
        setFormSuccess('Company updated successfully!');
      } else {
        await api.post('/admin/company', formData, config);
        setFormSuccess('Company created successfully!');
      }

      setCompanyForm({ name: '', industry: '', location: '', website: '', description: '', logo: '' });
      setLogoFile(null);
      setLogoPreview(null);
      setEditingCompanyId(null);
      fetchCompanies();
      fetchAlumni();
    } catch (err) {
      setFormError(err.response?.data?.error || 'Failed to save company.');
    }
  };

  // Edit company handler
  const handleEditClick = (company) => {
    setEditingCompanyId(company._id);
    setCompanyForm({
      name: company.name || '',
      industry: company.industry || '',
      location: company.location || '',
      website: company.website || '',
      description: company.description || '',
      logo: company.logo || ''
    });
    setLogoFile(null);
    setLogoPreview(getLogoUrl(company.logo));
    setFormError('');
    setFormSuccess('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Cancel edit
  const handleCancelEdit = () => {
    setEditingCompanyId(null);
    setCompanyForm({ name: '', industry: '', location: '', website: '', description: '', logo: '' });
    setLogoFile(null);
    setLogoPreview(null);
    setFormError('');
    setFormSuccess('');
  };

  // Delete company
  const handleDeleteCompany = async (companyId, companyName) => {
    if (!window.confirm(`Are you sure you want to delete "${companyName}"? This will unassign all alumni belonging to this company.`)) {
      return;
    }
    try {
      await api.delete(`/admin/company/${companyId}`);
      fetchCompanies();
      fetchAlumni();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete company.');
    }
  };

  // Quick primary company assignment
  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    setAssignMessage({ type: '', text: '' });

    if (!selectedAlumniId) {
      setAssignMessage({ type: 'error', text: 'Please select an alumni user.' });
      return;
    }

    try {
      await api.post('/admin/assign-company', {
        userId: selectedAlumniId,
        companyId: selectedCompanyId || null
      });
      setAssignMessage({ type: 'success', text: 'Primary company updated successfully!' });
      setSelectedAlumniId('');
      setSelectedCompanyId('');
      fetchAlumni();
      fetchCompanies();
    } catch (err) {
      setAssignMessage({ type: 'error', text: err.response?.data?.error || 'Failed to assign company.' });
    }
  };

  // Work History Modal Open
  const openHistoryModal = (user) => {
    setHistoryModalUser(user);
    setHistoryForm({
      companyId: '',
      designation: '',
      startDate: '',
      endDate: '',
      isCurrent: false
    });
    setHistoryMessage({ type: '', text: '' });
  };

  // Add item to Work History
  const handleAddWorkHistory = async (e) => {
    e.preventDefault();
    if (!historyForm.companyId) {
      setHistoryMessage({ type: 'error', text: 'Please select a company.' });
      return;
    }
    setSubmittingHistory(true);
    setHistoryMessage({ type: '', text: '' });
    try {
      const res = await api.post('/admin/work-history/add', {
        userId: historyModalUser._id,
        ...historyForm
      });
      setHistoryMessage({ type: 'success', text: 'Work history added successfully!' });
      setHistoryForm({ companyId: '', designation: '', startDate: '', endDate: '', isCurrent: false });
      setHistoryModalUser(res.data.user);
      fetchAlumni();
      fetchCompanies();
    } catch (err) {
      setHistoryMessage({ type: 'error', text: err.response?.data?.error || 'Failed to add work history.' });
    } finally {
      setSubmittingHistory(false);
    }
  };

  // Remove item from Work History
  const handleRemoveWorkHistory = async (workHistoryId) => {
    try {
      const res = await api.post('/admin/work-history/remove', {
        userId: historyModalUser._id,
        workHistoryId
      });
      setHistoryModalUser(res.data.user);
      fetchAlumni();
      fetchCompanies();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to remove item.');
    }
  };

  // Filtered companies
  const filteredCompanies = companies.filter((c) =>
    c.name.toLowerCase().includes(companySearch.toLowerCase()) ||
    (c.industry && c.industry.toLowerCase().includes(companySearch.toLowerCase())) ||
    (c.location && c.location.toLowerCase().includes(companySearch.toLowerCase()))
  );

  // Filtered alumni
  const filteredAlumni = alumni.filter((a) =>
    a.name.toLowerCase().includes(alumniSearch.toLowerCase()) ||
    a.email.toLowerCase().includes(alumniSearch.toLowerCase()) ||
    (a.branch && a.branch.toLowerCase().includes(alumniSearch.toLowerCase())) ||
    (a.company?.name && a.company.name.toLowerCase().includes(alumniSearch.toLowerCase())) ||
    (a.workHistory && a.workHistory.some((w) => w.company?.name?.toLowerCase().includes(alumniSearch.toLowerCase())))
  );

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1 className="admin-form-header">Company & Placement Management</h1>
      </div>

      {/* Tab Navigation */}
      <div className="admin-tab-buttons" style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '20px' }}>
        <button
          className={`admin-form-button ${activeTab === 'companies' ? 'active-tab' : ''}`}
          onClick={() => setActiveTab('companies')}
          style={{
            backgroundColor: activeTab === 'companies' ? '#003366' : '#6c757d',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <FontAwesomeIcon icon={faBuilding} />
          Manage Companies ({companies.length})
        </button>
        <button
          className={`admin-form-button ${activeTab === 'assign' ? 'active-tab' : ''}`}
          onClick={() => setActiveTab('assign')}
          style={{
            backgroundColor: activeTab === 'assign' ? '#003366' : '#6c757d',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <FontAwesomeIcon icon={faUserTie} />
          Alumni Work History & Placements
        </button>
      </div>

      {/* TAB 1: MANAGE COMPANIES */}
      {activeTab === 'companies' && (
        <>
          <div className="admin-form-container" style={{ marginBottom: '30px', background: '#f8f9fa', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <h2>{editingCompanyId ? 'Edit Company' : 'Add New Company'}</h2>
            
            {formError && <div className="error-message" style={{ color: '#dc3545', marginBottom: '15px', fontWeight: 'bold' }}>{formError}</div>}
            {formSuccess && <div className="success-message" style={{ color: '#28a745', marginBottom: '15px', fontWeight: 'bold' }}>{formSuccess}</div>}

            <form onSubmit={handleCompanySubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '15px' }}>
                <div className="admin-form-group">
                  <label>Company Name *</label>
                  <input
                    type="text"
                    name="name"
                    className="admin-form-input"
                    value={companyForm.name}
                    onChange={handleCompanyInputChange}
                    placeholder="e.g. Google, TCS, Infosys"
                    required
                  />
                </div>

                <div className="admin-form-group">
                  <label>Industry</label>
                  <input
                    type="text"
                    name="industry"
                    className="admin-form-input"
                    value={companyForm.industry}
                    onChange={handleCompanyInputChange}
                    placeholder="e.g. IT & Software, Finance"
                  />
                </div>

                <div className="admin-form-group">
                  <label>Location</label>
                  <input
                    type="text"
                    name="location"
                    className="admin-form-input"
                    value={companyForm.location}
                    onChange={handleCompanyInputChange}
                    placeholder="e.g. Bengaluru, Remote, Global"
                  />
                </div>

                <div className="admin-form-group">
                  <label>Website</label>
                  <input
                    type="url"
                    name="website"
                    className="admin-form-input"
                    value={companyForm.website}
                    onChange={handleCompanyInputChange}
                    placeholder="https://example.com"
                  />
                </div>

                <div className="admin-form-group">
                  <label>Company Logo Image File</label>
                  <input
                    type="file"
                    accept="image/*"
                    className="admin-form-input"
                    onChange={handleLogoFileChange}
                  />
                </div>

                <div className="admin-form-group">
                  <label>Or Company Logo Image URL</label>
                  <input
                    type="text"
                    name="logo"
                    className="admin-form-input"
                    value={companyForm.logo}
                    onChange={handleCompanyInputChange}
                    placeholder="https://example.com/logo.png"
                  />
                </div>
              </div>

              {/* Logo Preview */}
              {(logoPreview || companyForm.logo) && (
                <div style={{ marginTop: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontWeight: 'bold' }}>Logo Preview:</span>
                  <img
                    src={logoPreview || getLogoUrl(companyForm.logo)}
                    alt="Logo Preview"
                    style={{ width: '50px', height: '50px', objectFit: 'contain', borderRadius: '6px', border: '1px solid #ccc', padding: '2px', backgroundColor: '#fff' }}
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                </div>
              )}

              <div className="admin-form-group" style={{ marginTop: '15px' }}>
                <label>Description</label>
                <textarea
                  name="description"
                  className="admin-form-input"
                  rows="3"
                  value={companyForm.description}
                  onChange={handleCompanyInputChange}
                  placeholder="Brief description of company or hiring details..."
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                <button type="submit" className="admin-form-button" style={{ backgroundColor: '#003366', color: '#fff' }}>
                  <FontAwesomeIcon icon={editingCompanyId ? faCheck : faPlus} style={{ marginRight: '6px' }} />
                  {editingCompanyId ? 'Update Company' : 'Add Company'}
                </button>
                {editingCompanyId && (
                  <button type="button" className="admin-form-button" onClick={handleCancelEdit} style={{ backgroundColor: '#6c757d', color: '#fff' }}>
                    <FontAwesomeIcon icon={faXmark} style={{ marginRight: '6px' }} />
                    Cancel Edit
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Companies List */}
          <h2>Registered Companies</h2>
          <div className="search-group" style={{ marginBottom: '15px' }}>
            <input
              type="text"
              className="search-input"
              placeholder="Search company by name, industry, or location..."
              value={companySearch}
              onChange={(e) => setCompanySearch(e.target.value)}
            />
            <button className="search-button">
              <FontAwesomeIcon icon={faMagnifyingGlass} />
            </button>
          </div>

          {loadingCompanies ? (
            <p>Loading companies...</p>
          ) : filteredCompanies.length > 0 ? (
            <table className="user-table table-striped">
              <thead>
                <tr>
                  <th>Logo</th>
                  <th>Company Name</th>
                  <th>Industry</th>
                  <th>Location</th>
                  <th>Website</th>
                  <th>Alumni Count</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCompanies.map((comp) => {
                  const logoSrc = getLogoUrl(comp.logo);
                  return (
                    <tr key={comp._id}>
                      <td style={{ textAlign: 'center', width: '60px' }}>
                        {logoSrc ? (
                          <img
                            src={logoSrc}
                            alt={comp.name}
                            style={{ width: '40px', height: '40px', objectFit: 'contain', borderRadius: '4px', border: '1px solid #ddd', padding: '2px', backgroundColor: '#fff' }}
                            onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/40?text=C'; }}
                          />
                        ) : (
                          <div style={{ width: '40px', height: '40px', borderRadius: '4px', backgroundColor: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: 'auto' }}>
                            <FontAwesomeIcon icon={faBuilding} style={{ color: '#003366' }} />
                          </div>
                        )}
                      </td>
                      <td><strong>{comp.name}</strong></td>
                      <td>{comp.industry || '-'}</td>
                      <td>{comp.location || '-'}</td>
                      <td>
                        {comp.website ? (
                          <a href={comp.website} target="_blank" rel="noopener noreferrer" style={{ color: '#003366', textDecoration: 'underline' }}>
                            {comp.website}
                          </a>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td>
                        <span className="badge" style={{ padding: '6px 12px', borderRadius: '16px', backgroundColor: '#003366', color: '#ffffff', fontWeight: 'bold', fontSize: '12px', display: 'inline-block' }}>
                          {comp.alumniCount || 0} Alumni
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            onClick={() => handleEditClick(comp)}
                            className="admin-form-button"
                            style={{ padding: '4px 10px', fontSize: '13px', backgroundColor: '#ffc107', color: '#000' }}
                            title="Edit"
                          >
                            <FontAwesomeIcon icon={faEdit} /> Edit
                          </button>
                          <button
                            onClick={() => handleDeleteCompany(comp._id, comp.name)}
                            className="admin-form-button"
                            style={{ padding: '4px 10px', fontSize: '13px', backgroundColor: '#dc3545', color: '#fff' }}
                            title="Delete"
                          >
                            <FontAwesomeIcon icon={faTrash} /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <p>No companies found.</p>
          )}
        </>
      )}

      {/* TAB 2: WORK HISTORY & PLACEMENTS */}
      {activeTab === 'assign' && (
        <>
          <div className="admin-form-container" style={{ marginBottom: '30px', background: '#f8f9fa', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <h2>Quick Set Primary Company</h2>

            {assignMessage.text && (
              <div
                style={{
                  color: assignMessage.type === 'success' ? '#28a745' : '#dc3545',
                  marginBottom: '15px',
                  fontWeight: 'bold'
                }}
              >
                {assignMessage.text}
              </div>
            )}

            <form onSubmit={handleAssignSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '15px' }}>
                <div className="admin-form-group">
                  <label>Select Alumni User *</label>
                  <select
                    className="admin-form-input"
                    value={selectedAlumniId}
                    onChange={(e) => setSelectedAlumniId(e.target.value)}
                    required
                  >
                    <option value="">-- Choose Alumni --</option>
                    {alumni.map((user) => (
                      <option key={user._id} value={user._id}>
                        {user.name} ({user.email}) - {user.branch || 'No branch'} Batch {user.batch}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="admin-form-group">
                  <label>Primary / Current Company</label>
                  <select
                    className="admin-form-input"
                    value={selectedCompanyId}
                    onChange={(e) => setSelectedCompanyId(e.target.value)}
                  >
                    <option value="">-- None / Unassigned --</option>
                    {companies.map((comp) => (
                      <option key={comp._id} value={comp._id}>
                        {comp.name} {comp.industry ? `(${comp.industry})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="admin-form-button"
                style={{ backgroundColor: '#003366', color: '#fff', marginTop: '15px' }}
              >
                <FontAwesomeIcon icon={faCheck} style={{ marginRight: '6px' }} />
                Set Primary Company
              </button>
            </form>
          </div>

          {/* Alumni Placements & Work History Table */}
          <h2>Alumni Career & Work History List</h2>
          <div className="search-group" style={{ marginBottom: '15px' }}>
            <input
              type="text"
              className="search-input"
              placeholder="Search alumni by name, email, branch, or company..."
              value={alumniSearch}
              onChange={(e) => setAlumniSearch(e.target.value)}
            />
            <button className="search-button">
              <FontAwesomeIcon icon={faMagnifyingGlass} />
            </button>
          </div>

          {loadingAlumni ? (
            <p>Loading alumni...</p>
          ) : filteredAlumni.length > 0 ? (
            <table className="user-table table-striped">
              <thead>
                <tr>
                  <th>Alumni Name</th>
                  <th>Email</th>
                  <th>Batch / Branch</th>
                  <th>Companies Worked At</th>
                  <th>Manage Work History</th>
                </tr>
              </thead>
              <tbody>
                {filteredAlumni.map((user) => {
                  // Collect unique companies (primary + workHistory)
                  const allWorkItems = user.workHistory || [];
                  
                  return (
                    <tr key={user._id}>
                      <td><strong>{user.name}</strong></td>
                      <td>{user.email}</td>
                      <td>{user.batch} ({user.branch || '-'})</td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          {/* Display primary company if set */}
                          {user.company && !allWorkItems.some((w) => w.company?._id === user.company._id) && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              {getLogoUrl(user.company.logo) ? (
                                <img src={getLogoUrl(user.company.logo)} alt={user.company.name} style={{ width: '20px', height: '20px', objectFit: 'contain' }} />
                              ) : (
                                <FontAwesomeIcon icon={faBuilding} style={{ color: '#003366' }} />
                              )}
                              <span style={{ fontWeight: 'bold', color: '#003366' }}>{user.company.name}</span>
                              <span className="badge" style={{ backgroundColor: '#28a745', color: '#fff', fontSize: '11px', padding: '2px 6px', borderRadius: '4px' }}>Current</span>
                            </div>
                          )}

                          {/* Display work history companies */}
                          {allWorkItems.length > 0 ? (
                            allWorkItems.map((item, idx) => {
                              const logo = getLogoUrl(item.company?.logo);
                              return (
                                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  {logo ? (
                                    <img src={logo} alt={item.company?.name} style={{ width: '20px', height: '20px', objectFit: 'contain' }} />
                                  ) : (
                                    <FontAwesomeIcon icon={faBuilding} style={{ color: '#6c757d' }} />
                                  )}
                                  <span style={{ fontWeight: item.isCurrent ? 'bold' : 'normal', color: item.isCurrent ? '#003366' : '#333' }}>
                                    {item.company?.name}
                                  </span>
                                  {item.designation && <small style={{ color: '#555' }}>({item.designation})</small>}
                                  {item.startDate && <small style={{ color: '#777' }}>[{item.startDate} - {item.endDate || 'Present'}]</small>}
                                  {item.isCurrent && (
                                    <span className="badge" style={{ backgroundColor: '#28a745', color: '#fff', fontSize: '11px', padding: '2px 6px', borderRadius: '4px' }}>Current</span>
                                  )}
                                </div>
                              );
                            })
                          ) : !user.company ? (
                            <span style={{ color: '#888', fontStyle: 'italic' }}>No companies recorded</span>
                          ) : null}
                        </div>
                      </td>
                      <td>
                        <button
                          onClick={() => openHistoryModal(user)}
                          className="admin-form-button"
                          style={{ backgroundColor: '#003366', color: '#fff', padding: '4px 12px', fontSize: '13px' }}
                        >
                          <FontAwesomeIcon icon={faBriefcase} style={{ marginRight: '6px' }} />
                          Manage Companies ({allWorkItems.length + (user.company && !allWorkItems.some((w) => w.company?._id === user.company._id) ? 1 : 0)})
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <p>No alumni users found.</p>
          )}
        </>
      )}

      {/* WORK HISTORY MODAL */}
      {historyModalUser && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
          }}
        >
          <div
            style={{
              backgroundColor: '#fff',
              borderRadius: '8px',
              maxWidth: '650px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '25px',
              boxShadow: '0 5px 15px rgba(0,0,0,0.3)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '2px solid #e2e8f0', paddingBottom: '10px' }}>
              <h2 style={{ margin: 0 }}>
                <FontAwesomeIcon icon={faHistory} style={{ marginRight: '8px', color: '#003366' }} />
                Work History: {historyModalUser.name}
              </h2>
              <button
                onClick={() => setHistoryModalUser(null)}
                style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#666' }}
              >
                <FontAwesomeIcon icon={faXmark} />
              </button>
            </div>

            {historyMessage.text && (
              <div
                style={{
                  color: historyMessage.type === 'success' ? '#28a745' : '#dc3545',
                  marginBottom: '15px',
                  fontWeight: 'bold'
                }}
              >
                {historyMessage.text}
              </div>
            )}

            {/* Existing Work History List */}
            <h3 style={{ marginBottom: '10px' }}>Companies Worked At</h3>
            {historyModalUser.workHistory && historyModalUser.workHistory.length > 0 ? (
              <table className="user-table" style={{ marginBottom: '20px' }}>
                <thead>
                  <tr>
                    <th>Company</th>
                    <th>Role / Designation</th>
                    <th>Period</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {historyModalUser.workHistory.map((item) => (
                    <tr key={item._id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          {getLogoUrl(item.company?.logo) && (
                            <img src={getLogoUrl(item.company.logo)} alt={item.company?.name} style={{ width: '22px', height: '22px', objectFit: 'contain' }} />
                          )}
                          <strong>{item.company?.name || 'Unknown'}</strong>
                        </div>
                      </td>
                      <td>{item.designation || '-'}</td>
                      <td>
                        {item.startDate ? `${item.startDate} - ${item.endDate || 'Present'}` : '-'}
                      </td>
                      <td>
                        {item.isCurrent ? (
                          <span style={{ backgroundColor: '#28a745', color: '#fff', padding: '2px 8px', borderRadius: '10px', fontSize: '12px' }}>Current</span>
                        ) : (
                          <span style={{ backgroundColor: '#6c757d', color: '#fff', padding: '2px 8px', borderRadius: '10px', fontSize: '12px' }}>Past</span>
                        )}
                      </td>
                      <td>
                        <button
                          onClick={() => handleRemoveWorkHistory(item._id)}
                          style={{ backgroundColor: '#dc3545', color: '#fff', border: 'none', padding: '3px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
                        >
                          <FontAwesomeIcon icon={faTrash} /> Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p style={{ color: '#666', fontStyle: 'italic', marginBottom: '20px' }}>No company history recorded yet.</p>
            )}

            {/* Add New Work History Form */}
            <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '6px', border: '1px solid #ddd' }}>
              <h4 style={{ marginTop: 0, marginBottom: '15px' }}>Add a Company Entry</h4>
              <form onSubmit={handleAddWorkHistory}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                  <div className="admin-form-group">
                    <label>Company *</label>
                    <select
                      className="admin-form-input"
                      value={historyForm.companyId}
                      onChange={(e) => setHistoryForm({ ...historyForm, companyId: e.target.value })}
                      required
                    >
                      <option value="">-- Select Company --</option>
                      {companies.map((c) => (
                        <option key={c._id} value={c._id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="admin-form-group">
                    <label>Designation / Role</label>
                    <input
                      type="text"
                      className="admin-form-input"
                      value={historyForm.designation}
                      onChange={(e) => setHistoryForm({ ...historyForm, designation: e.target.value })}
                      placeholder="e.g. Senior Software Engineer"
                    />
                  </div>

                  <div className="admin-form-group">
                    <label>Start Year / Date</label>
                    <input
                      type="text"
                      className="admin-form-input"
                      value={historyForm.startDate}
                      onChange={(e) => setHistoryForm({ ...historyForm, startDate: e.target.value })}
                      placeholder="e.g. 2021"
                    />
                  </div>

                  <div className="admin-form-group">
                    <label>End Year / Date</label>
                    <input
                      type="text"
                      className="admin-form-input"
                      value={historyForm.endDate}
                      onChange={(e) => setHistoryForm({ ...historyForm, endDate: e.target.value })}
                      placeholder="e.g. 2024 or Present"
                    />
                  </div>
                </div>

                <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="checkbox"
                    id="isCurrentCheck"
                    checked={historyForm.isCurrent}
                    onChange={(e) => setHistoryForm({ ...historyForm, isCurrent: e.target.checked })}
                  />
                  <label htmlFor="isCurrentCheck" style={{ cursor: 'pointer', fontWeight: 'bold' }}>
                    Mark as Current Company
                  </label>
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                  <button
                    type="submit"
                    className="admin-form-button"
                    disabled={submittingHistory}
                    style={{ backgroundColor: '#003366', color: '#fff' }}
                  >
                    <FontAwesomeIcon icon={faPlus} style={{ marginRight: '6px' }} />
                    {submittingHistory ? 'Adding...' : 'Add to History'}
                  </button>
                  <button
                    type="button"
                    className="admin-form-button"
                    onClick={() => setHistoryModalUser(null)}
                    style={{ backgroundColor: '#6c757d', color: '#fff' }}
                  >
                    Close
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCompanies;
