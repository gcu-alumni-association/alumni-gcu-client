import React, { useState, useEffect, useRef } from 'react';
import api from '../../services/api';
import './admin.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Modal, Button, Form } from 'react-bootstrap';
import { Plus, Edit2, Trash2, Code, UserCheck } from 'lucide-react';
import { compressImage } from '../../utils/imageCompressor';

const BASE_URL = process.env.REACT_APP_BASE_URL || 'http://localhost:5000';

const AdminDevelopers = () => {
  const [developers, setDevelopers] = useState([]);
  const [enrolledAlumni, setEnrolledAlumni] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingDev, setEditingDev] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [selectedUserId, setSelectedUserId] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [academicYear, setAcademicYear] = useState('');
  const [branch, setBranch] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const fileInputRef = useRef(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [devRes, alumniRes] = await Promise.all([
        api.get('/developers/all'),
        api.get('/user/verified-users?limit=1000')
      ]);

      setDevelopers(devRes.data || []);
      
      const alumniList = alumniRes.data?.users || (Array.isArray(alumniRes.data) ? alumniRes.data : []);
      setEnrolledAlumni(alumniList);
    } catch (error) {
      console.error('Error fetching data:', error);
      alert('Failed to load developer records or alumni list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenModal = (dev = null) => {
    if (dev) {
      setEditingDev(dev);
      setSelectedUserId(dev.user?._id || dev.user || '');
      setName(dev.name || '');
      setRole(dev.role || '');
      setAcademicYear(dev.academicYear || '');
      setBranch(dev.branch || '');
      setImagePreview(dev.image ? (dev.image.startsWith('http') ? dev.image : `${BASE_URL}${dev.image.startsWith('/') ? '' : '/'}${dev.image.replace(/\\/g, '/')}`) : '');
    } else {
      setEditingDev(null);
      setSelectedUserId('');
      setName('');
      setRole('');
      setAcademicYear('');
      setBranch('');
      setImagePreview('');
    }
    setImageFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    setShowModal(true);
  };

  // When an enrolled alumni is selected from dropdown, autofill the form details
  const handleAlumniSelect = (e) => {
    const userId = e.target.value;
    setSelectedUserId(userId);

    if (userId) {
      const selectedAlumnus = enrolledAlumni.find(a => a._id === userId);
      if (selectedAlumnus) {
        setName(selectedAlumnus.name || '');
        setBranch(selectedAlumnus.branch || '');
        setAcademicYear(selectedAlumnus.batch ? `Batch of ${selectedAlumnus.batch}` : '');
        if (selectedAlumnus.profilePhoto) {
          const photoUrl = selectedAlumnus.profilePhoto.startsWith('http') 
            ? selectedAlumnus.profilePhoto 
            : `${BASE_URL}/${selectedAlumnus.profilePhoto.replace(/\\/g, '/')}`;
          setImagePreview(photoUrl);
        } else {
          setImagePreview('');
        }
      }
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !role.trim()) {
      alert('Please provide both Name and Role.');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('userId', selectedUserId);
      formData.append('name', name);
      formData.append('role', role);
      formData.append('academicYear', academicYear);
      formData.append('branch', branch);
      formData.append('category', 'developers');

      if (imageFile) {
        const compressed = await compressImage(imageFile, {
          maxSizeMB: 1,
          maxWidthOrHeight: 1200
        });
        formData.append('images', compressed);
      }

      if (editingDev) {
        await api.put(`/developers/update/${editingDev._id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        alert('Developer profile updated successfully.');
      } else {
        await api.post('/developers/add', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        alert('Developer profile created successfully.');
      }

      setShowModal(false);
      fetchData();
    } catch (error) {
      console.error('Error saving developer profile:', error);
      alert(error.response?.data?.message || 'Failed to save developer profile.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this developer profile?')) return;
    try {
      await api.delete(`/developers/delete/${id}`);
      alert('Developer deleted successfully.');
      setDevelopers(prev => prev.filter(d => d._id !== id));
    } catch (error) {
      console.error('Error deleting developer:', error);
      alert('Failed to delete developer.');
    }
  };

  return (
    <div className="dashboard-container" style={{ width: '100%', maxWidth: '1200px', margin: '0 auto', padding: '10px 0' }}>
      {/* Header Banner */}
      <div 
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: '#ffffff',
          padding: '24px 28px',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          marginBottom: '28px',
          flexWrap: 'wrap',
          gap: '16px',
          border: '1px solid #e2e8f0'
        }}
      >
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#0f2942', margin: 0 }}>
            Manage Developer Team
          </h2>
          <p style={{ color: '#64748b', margin: '6px 0 0', fontSize: '0.95rem' }}>
            Add developers directly from enrolled Alumni members or create custom developer profiles (latest batches shown first).
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          style={{
            backgroundColor: '#003366',
            color: '#ffffff',
            border: 'none',
            borderRadius: '8px',
            padding: '10px 18px',
            fontWeight: '600',
            fontSize: '0.95rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer',
            boxShadow: '0 2px 6px rgba(0,51,102,0.2)'
          }}
        >
          <Plus size={18} /> Add Developer
        </button>
      </div>

      {loading ? (
        <p style={{ textAlign: 'center', color: '#64748b', padding: '40px 0' }}>Loading developers...</p>
      ) : developers.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '50px 0', color: '#64748b', backgroundColor: '#fff', borderRadius: '12px' }}>
          <Code size={40} style={{ color: '#cbd5e1', marginBottom: '12px' }} />
          <p style={{ fontSize: '1.1rem', margin: 0 }}>No developer profiles created yet.</p>
        </div>
      ) : (
        /* Horizontal Row Grid (Latest at top) */
        <div 
          style={{
            display: 'flex',
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: '24px',
            width: '100%'
          }}
        >
          {developers.map((dev) => {
            const imageSrc = dev.image 
              ? (dev.image.startsWith('http') ? dev.image : `${BASE_URL}${dev.image.startsWith('/') ? '' : '/'}${dev.image.replace(/\\/g, '/')}`) 
              : '/assets/profile-placeholder.svg';

            const isLinkedAlumnus = Boolean(dev.user);

            return (
              <div 
                key={dev._id} 
                style={{
                  flex: '0 0 calc(25% - 18px)',
                  minWidth: '220px',
                  maxWidth: '280px',
                  backgroundColor: '#ffffff',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  position: 'relative'
                }}
              >
                {/* Linked Alumni Badge */}
                {isLinkedAlumnus && (
                  <div 
                    style={{
                      position: 'absolute',
                      top: '10px',
                      right: '10px',
                      backgroundColor: 'rgba(0, 51, 102, 0.85)',
                      color: '#fff',
                      fontSize: '0.72rem',
                      fontWeight: '600',
                      padding: '3px 8px',
                      borderRadius: '12px',
                      zIndex: 2,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <UserCheck size={12} /> Enrolled Alumni
                  </div>
                )}

                {/* Photo Area */}
                <div style={{ width: '100%', height: '200px', backgroundColor: '#f1f5f9', overflow: 'hidden' }}>
                  <img 
                    src={imageSrc} 
                    alt={dev.name} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                  />
                </div>

                {/* Body Content */}
                <div 
                  style={{
                    padding: '18px 14px',
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    flexGrow: 1,
                    justifyContent: 'space-between'
                  }}
                >
                  <div>
                    <h4 style={{ margin: '0 0 6px', fontSize: '1.15rem', fontWeight: 'bold', color: '#0f2942' }}>
                      {dev.name}
                    </h4>
                    <p style={{ margin: '0 0 8px', fontSize: '0.9rem', color: '#2563eb', fontWeight: '600' }}>
                      {dev.role}
                    </p>
                    
                    {(dev.academicYear || dev.branch) && (
                      <span 
                        style={{
                          display: 'inline-block',
                          backgroundColor: '#f8fafc',
                          border: '1px solid #e2e8f0',
                          color: '#64748b',
                          fontSize: '0.8rem',
                          fontWeight: '500',
                          padding: '3px 10px',
                          borderRadius: '14px',
                          marginBottom: '14px'
                        }}
                      >
                        {dev.branch && `${dev.branch}`} {dev.branch && dev.academicYear && '•'} {dev.academicYear}
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div 
                    style={{
                      display: 'flex',
                      gap: '8px',
                      justifyContent: 'center',
                      paddingTop: '12px',
                      borderTop: '1px solid #f1f5f9',
                      marginTop: '10px'
                    }}
                  >
                    <button 
                      onClick={() => handleOpenModal(dev)}
                      style={{
                        flex: 1,
                        padding: '6px 12px',
                        backgroundColor: '#ffffff',
                        border: '1px solid #2563eb',
                        color: '#2563eb',
                        borderRadius: '6px',
                        fontSize: '0.85rem',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        cursor: 'pointer'
                      }}
                    >
                      <Edit2 size={13} /> Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(dev._id)}
                      style={{
                        flex: 1,
                        padding: '6px 12px',
                        backgroundColor: '#ffffff',
                        border: '1px solid #ef4444',
                        color: '#ef4444',
                        borderRadius: '6px',
                        fontSize: '0.85rem',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        cursor: 'pointer'
                      }}
                    >
                      <Trash2 size={13} /> Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{editingDev ? 'Edit Developer' : 'Add Developer'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            {/* Choose From Enrolled Alumni Dropdown */}
            <div 
              style={{
                backgroundColor: '#f0fdf4',
                border: '1px solid #bbf7d0',
                padding: '14px',
                borderRadius: '8px',
                marginBottom: '20px'
              }}
            >
              <Form.Label style={{ fontWeight: '600', color: '#166534', marginBottom: '6px' }}>
                Select Enrolled Alumni (Auto-fill Name, Branch, Batch & Profile Photo)
              </Form.Label>
              <Form.Select 
                value={selectedUserId} 
                onChange={handleAlumniSelect}
                style={{ backgroundColor: '#ffffff' }}
              >
                <option value="">-- Choose from Enrolled Alumni --</option>
                {enrolledAlumni.map((alumnus) => (
                  <option key={alumnus._id} value={alumnus._id}>
                    {alumnus.name} ({alumnus.branch || 'N/A'} - Batch of {alumnus.batch || 'N/A'})
                  </option>
                ))}
              </Form.Select>
              <small className="text-muted mt-1 d-block">
                Selecting an alumnus will automatically load their name, academic year, branch, and profile picture.
              </small>
            </div>

            <div className="row">
              <div className="col-md-6 mb-3">
                <Form.Label>Student / Developer Name *</Form.Label>
                <Form.Control 
                  type="text" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  placeholder="e.g. Chinmoy Baruah" 
                  required 
                />
              </div>

              <div className="col-md-6 mb-3">
                <Form.Label>Role / Designation *</Form.Label>
                <Form.Control 
                  type="text" 
                  value={role} 
                  onChange={(e) => setRole(e.target.value)} 
                  placeholder="e.g. Frontend Developer" 
                  required 
                />
              </div>
            </div>

            <div className="row">
              <div className="col-md-6 mb-3">
                <Form.Label>Academic Year / Batch</Form.Label>
                <Form.Control 
                  type="text" 
                  value={academicYear} 
                  onChange={(e) => setAcademicYear(e.target.value)} 
                  placeholder="e.g. 2021-2025 or Batch of 2025" 
                />
              </div>
              <div className="col-md-6 mb-3">
                <Form.Label>Branch / Department</Form.Label>
                <Form.Control 
                  type="text" 
                  value={branch} 
                  onChange={(e) => setBranch(e.target.value)} 
                  placeholder="e.g. CSE" 
                />
              </div>
            </div>

            <div className="mb-3">
              <Form.Label>Custom / Override Photo (Optional)</Form.Label>
              <Form.Control 
                type="file" 
                accept="image/*" 
                onChange={handleFileChange} 
                ref={fileInputRef} 
              />
              <small className="text-muted">If selecting an enrolled alumnus, their existing photo is used automatically unless you upload a new photo here.</small>
            </div>

            {imagePreview && (
              <div className="text-center mb-2 p-2 bg-light rounded">
                <p className="small text-muted mb-1">Photo Preview:</p>
                <img 
                  src={imagePreview} 
                  alt="Preview" 
                  style={{ width: '120px', height: '140px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #ddd' }} 
                />
              </div>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button 
              variant="primary" 
              type="submit" 
              disabled={submitting}
              style={{ backgroundColor: '#003366', borderColor: '#003366' }}
            >
              {submitting ? 'Saving...' : (editingDev ? 'Update Developer' : 'Add Developer')}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminDevelopers;
