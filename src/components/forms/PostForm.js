import React, { useState } from "react";
import './form.css';
import { useUser } from '../../services/UserContext';
import ProfilePhoto from "../../components/common/ProfilePhotoComponent";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faBriefcase, 
  faLocationDot, 
  faIndianRupeeSign, 
  faBuilding, 
  faLink, 
  faFileLines,
  faCalendarXmark,
  faListCheck,
  faUserTie
} from '@fortawesome/free-solid-svg-icons';

const PostForm = ({ onSubmitPost, isLoading, error }) => {
    const [postContent, setPostContent] = useState("");
    const [category, setCategory] = useState("post");
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    // Structured Job fields
    const [jobDetails, setJobDetails] = useState({
        role: "",
        companyName: "",
        location: "",
        salary: "",
        jobType: "Full-time",
        experience: "",
        deadline: "",
        requirements: "",
        applyLinkOrEmail: "",
        aboutRole: ""
    });

    const { user } = useUser();
    const maxWordLimit = 300;

    const countWords = (str) => {
        if (!str || !str.trim()) return 0;
        return str.trim().split(/\s+/).length;
    };

    const handlePostChange = (e) => {
        setPostContent(e.target.value);
    };

    const handleJobFieldChange = (field, value) => {
        if (field === 'aboutRole') {
            const words = value.trim() ? value.trim().split(/\s+/) : [];
            if (words.length > maxWordLimit) {
                return;
            }
        }
        setJobDetails(prev => ({ ...prev, [field]: value }));
    };

    const handleCategoryChange = (e) => {
        setCategory(e.target.value);
    };

    const handlePostSubmit = async () => {
        if (category === 'job') {
            if (!jobDetails.role.trim() || !jobDetails.aboutRole.trim()) {
                alert("Please fill in at least the Job Role and About Role description.");
                return;
            }

            try {
                await onSubmitPost(jobDetails.aboutRole, 'job', jobDetails);
                setJobDetails({
                    role: "",
                    companyName: "",
                    location: "",
                    salary: "",
                    jobType: "Full-time",
                    experience: "",
                    deadline: "",
                    requirements: "",
                    applyLinkOrEmail: "",
                    aboutRole: ""
                });
                setCategory("post");
                setPostContent("");
                closeModal();
            } catch (err) {
                console.error("Error submitting job post:", err);
            }
        } else {
            if (!postContent.trim()) {
                return;
            }

            try {
                await onSubmitPost(postContent, category, null);
                setPostContent("");
                setCategory("post");
                closeModal();
            } catch (err) {
                console.error("Error submitting post:", err);
            }
        }
    };

    const openModal = () => {
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    const aboutRoleWordCount = countWords(jobDetails.aboutRole);

    return (
        <div className="post-form-container">
            {!isModalOpen && (
                <div className="post-form-collapsed" onClick={openModal}>
                    <ProfilePhoto 
                        userId={user?._id}
                        className="rounded-full"
                    />
                    <input
                        type="text"
                        className="collapsed-input"
                        placeholder="Create a post or share a job opening..."
                        readOnly
                    />
                </div>
            )}

            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="form-modal-content" style={{ maxWidth: category === 'job' ? '680px' : '520px', width: '95%', maxHeight: '90vh', overflowY: 'auto' }}>
                        <div className="modal-header">
                            <span style={{ fontWeight: 'bold', fontSize: '1.15rem' }}>
                                {category === 'job' ? '💼 Post a Job Opportunity' : 'Create a Post'}
                            </span>
                            <button className="close-btn" onClick={closeModal}>✖</button>
                        </div>

                        {/* Category Selector */}
                        <div className="category-selector" style={{ marginBottom: '16px' }}>
                            <label htmlFor="category" style={{ fontWeight: '600', marginRight: '8px' }}>Choose a category:</label>
                            <select 
                                id="category"
                                value={category}
                                onChange={handleCategoryChange}
                                style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                            >
                                <option value="post">Regular Post</option>
                                <option value="job">💼 Job Opportunity</option>
                                <option value="education">🎓 Education Opportunity</option>
                            </select>
                        </div>

                        {category === 'job' ? (
                            /* Structured Job Input Form with all fields */
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '16px' }}>
                                {/* Row 1: Role & Company */}
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
                                    <div>
                                        <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#334155', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <FontAwesomeIcon icon={faBriefcase} style={{ color: '#003366' }} /> Job Role / Title *
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="e.g. Frontend Developer, Data Analyst"
                                            value={jobDetails.role}
                                            onChange={(e) => handleJobFieldChange('role', e.target.value)}
                                            style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', marginTop: '4px' }}
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#334155', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <FontAwesomeIcon icon={faBuilding} style={{ color: '#003366' }} /> Company / Organization
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="e.g. Google, TCS, Startup"
                                            value={jobDetails.companyName}
                                            onChange={(e) => handleJobFieldChange('companyName', e.target.value)}
                                            style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', marginTop: '4px' }}
                                        />
                                    </div>
                                </div>

                                {/* Row 2: Location & Salary */}
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
                                    <div>
                                        <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#334155', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <FontAwesomeIcon icon={faLocationDot} style={{ color: '#003366' }} /> Location
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="e.g. Guwahati, Bangalore, Remote"
                                            value={jobDetails.location}
                                            onChange={(e) => handleJobFieldChange('location', e.target.value)}
                                            style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', marginTop: '4px' }}
                                        />
                                    </div>

                                    <div>
                                        <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#334155', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <FontAwesomeIcon icon={faIndianRupeeSign} style={{ color: '#003366' }} /> Salary / Package / Stipend
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="e.g. ₹6-8 LPA, ₹25k/month, Competitive"
                                            value={jobDetails.salary}
                                            onChange={(e) => handleJobFieldChange('salary', e.target.value)}
                                            style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', marginTop: '4px' }}
                                        />
                                    </div>
                                </div>

                                {/* Row 3: Job Type & Experience */}
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
                                    <div>
                                        <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#334155' }}>Job Type</label>
                                        <select
                                            value={jobDetails.jobType}
                                            onChange={(e) => handleJobFieldChange('jobType', e.target.value)}
                                            style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', marginTop: '4px' }}
                                        >
                                            <option value="Full-time">Full-time</option>
                                            <option value="Part-time">Part-time</option>
                                            <option value="Internship">Internship</option>
                                            <option value="Remote">Remote</option>
                                            <option value="Contract">Contract</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#334155', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <FontAwesomeIcon icon={faUserTie} style={{ color: '#003366' }} /> Experience Level
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="e.g. Freshers / 0-2 Years / 3+ Years"
                                            value={jobDetails.experience}
                                            onChange={(e) => handleJobFieldChange('experience', e.target.value)}
                                            style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', marginTop: '4px' }}
                                        />
                                    </div>
                                </div>

                                {/* Row 4: Deadline & Apply Link */}
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
                                    <div>
                                        <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#334155', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <FontAwesomeIcon icon={faCalendarXmark} style={{ color: '#003366' }} /> Application Deadline
                                        </label>
                                        <input
                                            type="date"
                                            value={jobDetails.deadline}
                                            onChange={(e) => handleJobFieldChange('deadline', e.target.value)}
                                            style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', marginTop: '4px' }}
                                        />
                                    </div>

                                    <div>
                                        <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#334155', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <FontAwesomeIcon icon={faLink} style={{ color: '#003366' }} /> Apply Link or Email
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="https://... or hr@company.com"
                                            value={jobDetails.applyLinkOrEmail}
                                            onChange={(e) => handleJobFieldChange('applyLinkOrEmail', e.target.value)}
                                            style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', marginTop: '4px' }}
                                        />
                                    </div>
                                </div>

                                {/* Row 5: Key Requirements / Skills */}
                                <div>
                                    <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#334155', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <FontAwesomeIcon icon={faListCheck} style={{ color: '#003366' }} /> Key Requirements / Skills
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g. React.js, Node.js, Python, Good communication skills"
                                        value={jobDetails.requirements}
                                        onChange={(e) => handleJobFieldChange('requirements', e.target.value)}
                                        style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', marginTop: '4px' }}
                                    />
                                </div>

                                {/* Row 6: About Role (Max 300 Words) */}
                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                        <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#334155', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <FontAwesomeIcon icon={faFileLines} style={{ color: '#003366' }} /> About Role & Responsibilities *
                                        </label>
                                        <span style={{ fontSize: '0.78rem', color: aboutRoleWordCount >= maxWordLimit ? '#ef4444' : '#64748b' }}>
                                            {aboutRoleWordCount}/{maxWordLimit} words
                                        </span>
                                    </div>
                                    <textarea 
                                        placeholder="Describe the job responsibilities, project scope, team background, or special instructions..." 
                                        value={jobDetails.aboutRole} 
                                        onChange={(e) => handleJobFieldChange('aboutRole', e.target.value)} 
                                        disabled={isLoading} 
                                        rows={4}
                                        style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', resize: 'vertical' }}
                                        required
                                    />
                                </div>
                            </div>
                        ) : (
                            /* Regular / Education Post */
                            <div>
                                <textarea 
                                    placeholder="What do you want to talk about?" 
                                    value={postContent} 
                                    onChange={handlePostChange} 
                                    disabled={isLoading} 
                                    maxLength={300}
                                    className="modal-textarea"
                                    rows={4}
                                />
                                <div style={{ textAlign: 'right', fontSize: '0.8rem', color: '#64748b', marginBottom: '10px' }}>
                                    {postContent.length}/300 chars
                                </div>
                            </div>
                        )}

                        <div className="post-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                            <button 
                                onClick={closeModal} 
                                style={{ padding: '8px 16px', backgroundColor: '#e2e8f0', color: '#334155', border: 'none', borderRadius: '6px', fontWeight: '500', cursor: 'pointer' }}
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handlePostSubmit} 
                                disabled={isLoading} 
                                style={{ padding: '8px 20px', backgroundColor: '#003366', color: '#ffffff', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' }}
                            >
                                {isLoading ? "Posting..." : "Publish Job / Post"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PostForm;
