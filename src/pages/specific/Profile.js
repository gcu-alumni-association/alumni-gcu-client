import React, { useEffect, useState } from "react";
import { Link, useParams, useNavigate, useLocation } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import api from "../../services/api";
import ProfilePhoto from "../../components/common/ProfilePhotoComponent";
import Pagination from "../../components/common/Pagination";
import "../pages.css";
import "../../components/common/post-images.css";
import { PREFER_NOT_TO_SAY } from "../../data/profileOptions";
import Spinner from "../../components/common/LoadingSpinner";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLinkedin, faFacebook } from '@fortawesome/free-brands-svg-icons';
import { useUser } from "../../services/UserContext";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Profile = () => {
    const { id } = useParams();
    const { refreshUser } = useUser();
    const [user, setUser] = useState(null);
    const [userPosts, setUserPosts] = useState([]);
    const [isLoggedInUser, setIsLoggedInUser] = useState(false);
    const navigate = useNavigate();
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const location = useLocation();
    const postsPerPage = 5;

    useEffect(() => {
        if (location.state?.message) {
            if (location.state.type === 'success') {
                toast.success(location.state.message, {
                    position: "bottom-center",
                    autoClose: 2000
                });
            } else if (location.state.type === 'error') {
                toast.error(location.state.message, {
                    position: "bottom-center",
                    autoClose: 2000
                });
            }
            
            // Clear the navigation state to prevent showing the toast again on refresh
            window.history.replaceState({}, document.title);
        }
    }, [location]);

    useEffect(() => {
        // Get current user from token
        const token = localStorage.getItem("accessToken");
        if (token) {
            const decodedToken = jwtDecode(token);
            setCurrentUser(decodedToken);
        }
    }, []);

    const fetchUserProfile = async (userId) => {
        try {
            let response;
            if (userId) {
                response = await api.get(`/user/profile/${userId}`);
                setIsLoggedInUser(false);
            } else {
                response = await api.get('/user/user');
                setIsLoggedInUser(true);
            }

            if (response && response.data) {
                return response.data;
            } else {
                console.error('No data found in response');
                return null;
            }
        } catch (err) {
            console.error('Error during HTTP request:', err);
            return null;
        }
    };

    const fetchUserPosts = async (userId, page) => {
        setIsLoading(true);
        try {
            const res = await api.get(`/posts/user/${userId}?page=${page}&limit=${postsPerPage}`);
            if (res && res.data) {
                setUserPosts(res.data.posts);
                setTotalPages(res.data.totalPages);
            }
        } catch (err) {
            console.error('Error fetching user posts:', err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUserProfile(id).then((data) => {
            if (data) {
                setUser(data);
                if (refreshUser && typeof refreshUser === "function") {
                    refreshUser(); // Update context with latest data
                }
                if (!data.limitedView) {
                    fetchUserPosts(data._id, currentPage);
                }
            }
        });
    }, [id, currentPage]);

    const handlePostClick = (post) => {
        navigate(`/welcome/post/${post._id}`);
    };

    const handleClickPage = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const handleChangePicture = () => {
        navigate('/change-profile-picture');
    };

    // Helper function to get role badge color
    const getRoleBadgeColor = (role) => {
        return role === 'admin' ? '#dc3545' : '#6f42c1'; // Red for admin, Purple for superuser
    };

    // What regular alumni see on someone else's profile. The server only sends these details.
    if (user?.limitedView) {
        return (
            <div className="main">
                <div className="user-profile-container">
                    <h1 className="user-profile-main-title">Profile</h1>
                    <div className="user-profile-card">
                        <div className="user-profile-header">
                            <ProfilePhoto
                                userId={user._id}
                                className="user-profile-picture"
                            />
                            <div className="user-profile-info">
                                <div className="user-profile-name-container">
                                    <h2 className="user-profile-name">{user.name}</h2>
                                </div>
                                <p className="user-profile-email">{user.email}</p>
                            </div>
                        </div>
                        <div className="user-profile-details">
                            <p><strong>Current Organization:</strong> {user.company?.name || user.currentWorkingPlace || "Not provided"}</p>
                            <p><strong>Current Designation:</strong> {user.designation || "Not provided"}</p>
                            <p>
                                <strong>LinkedIn:</strong>{' '}
                                {user.socialLinks?.linkedin ? (
                                    <a
                                        href={user.socialLinks.linkedin}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="user-profile-social-link"
                                    >
                                        <FontAwesomeIcon icon={faLinkedin} /> LinkedIn
                                    </a>
                                ) : "Not provided"}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="main">
            <ToastContainer 
                position="bottom-center" 
                autoClose={2000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
            />
            <div className="user-profile-container">
                <h1 className="user-profile-main-title">Profile</h1>
                <div className="user-profile-card">
                    <div className="user-profile-header">
                        <ProfilePhoto
                            userId={user?._id}
                            className="user-profile-picture"
                        />
                        <div className="user-profile-info">
                            <div className="user-profile-name-container">
                                <h2 className="user-profile-name">{user?.name}</h2>
                                {user?.role && user.role !== 'user' && (
                                    <span 
                                        className={`user-profile-role-badge ${user.role.toLowerCase()}`}
                                    >
                                        {user.role}
                                    </span>
                                )}
                            </div>
                            <p className="user-profile-email">{user?.email}</p>
                            {isLoggedInUser && (
                                <button className="user-profile-change-picture-btn" onClick={handleChangePicture}>
                                    Change Picture
                                </button>
                            )}
                        </div>
                    </div>
                    <div className="user-profile-details">
                        <h3>About</h3>
                        <p><strong>Biography:</strong> {user?.biography || "No biography available"}</p>
                        <p><strong>Current Working Place:</strong> {user?.company?.name || user?.currentWorkingPlace || "Not provided"}</p>
                        <p><strong>Designation:</strong> {user?.designation || "Not provided"}</p>
                        <p><strong>Industry / Sector:</strong> {user?.industry || "Not provided"}</p>
                        <p><strong>Area of Expertise:</strong> {user?.areaOfExpertise || "Not provided"}</p>
                        {/* Other people only see a gender the user has chosen to share */}
                        {isLoggedInUser ? (
                            <p><strong>Gender:</strong> {user?.gender || "Not provided"}</p>
                        ) : user?.gender && user.gender !== PREFER_NOT_TO_SAY && (
                            <p><strong>Gender:</strong> {user.gender}</p>
                        )}
                        <p><strong>Batch:</strong> {user?.batch}</p>
                        <p><strong>Branch:</strong> {user?.branch}</p>

                        <h3>Work Experience & Companies</h3>
                        {user?.workHistory && user.workHistory.length > 0 ? (
                            <ul className="user-profile-achievements" style={{ listStyleType: 'none', paddingLeft: 0 }}>
                                {user.workHistory.map((item, index) => {
                                    const logoUrl = item.company?.logo
                                        ? (item.company.logo.startsWith('http') ? item.company.logo : `${process.env.REACT_APP_BASE_URL || 'http://localhost:5000'}${item.company.logo}`)
                                        : null;
                                    return (
                                        <li key={index} style={{ marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            {logoUrl && (
                                                <img src={logoUrl} alt="" style={{ width: '28px', height: '28px', objectFit: 'contain', borderRadius: '4px', border: '1px solid #ddd', padding: '2px', backgroundColor: '#fff' }} />
                                            )}
                                            <div>
                                                <strong>{item.company?.name || 'Company'}</strong>
                                                {item.designation ? ` - ${item.designation}` : ''}
                                                {item.startDate && (
                                                    <span style={{ color: '#666', fontSize: '13px', marginLeft: '6px' }}>
                                                        ({item.startDate} - {item.endDate || 'Present'})
                                                    </span>
                                                )}
                                                {item.isCurrent && (
                                                    <span style={{ backgroundColor: '#28a745', color: '#fff', fontSize: '11px', padding: '2px 6px', borderRadius: '4px', marginLeft: '8px' }}>Current</span>
                                                )}
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>
                        ) : (
                            <p>No extra work history listed</p>
                        )}
                        <h3>Achievements</h3>
                        {user?.achievements && user.achievements.length > 0 ? (
                            <ul className="user-profile-achievements">
                                {user.achievements.map((achievement, index) => (
                                    <li key={index}>{achievement}</li>
                                ))}
                            </ul>
                        ) : (
                            <p>No achievements listed</p>
                        )}
                        <h3>Social Media</h3>
                        {user?.socialLinks?.linkedin || user?.socialLinks?.facebook ? (
                            <div className="user-profile-social-icons">
                            {user?.socialLinks?.linkedin && (
                                <a 
                                href={user.socialLinks.linkedin} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="user-profile-social-link"
                                >
                                <FontAwesomeIcon icon={faLinkedin} /> LinkedIn
                                </a>
                            )}
                            {user?.socialLinks?.facebook && (
                                <a 
                                href={user.socialLinks.facebook} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="user-profile-social-link"
                                >
                                <FontAwesomeIcon icon={faFacebook} /> Facebook
                                </a>
                            )}
                            </div>
                        ) : (
                            <p>No social links provided</p>
                        )}
                        {isLoggedInUser && (
                            <Link to="/update-profile" className="user-profile-update-btn">Update Profile</Link>
                        )}
                        {isLoggedInUser && (
                        <Link to="/reset-password" className="user-profile-reset-pwd-btn">
                            Reset Password
                        </Link>
                        )}
                    </div>
                </div>
                <div className="user-profile-posts-section">
                    <h2 className="user-profile-posts-title">Recent Posts</h2>
                    {isLoading ? (
                        <Spinner />
                    ) : userPosts.length > 0 ? (
                        <div className="user-profile-posts-list">
                            {userPosts.map((post) => (
                                <div key={post._id} className="user-profile-post-link" onClick={() => handlePostClick(post)}>
                                    <div className="user-profile-post-card">
                                        {post.content && <p className="user-profile-post-content">{post.content}</p>}
                                        {post.images?.length > 0 && (
                                            <img
                                                className="user-profile-post-thumbnail"
                                                src={`${process.env.REACT_APP_BASE_URL || 'http://localhost:5000'}${post.images[0]}`}
                                                alt=""
                                                loading="lazy"
                                            />
                                        )}
                                        <small className="user-profile-post-date">{new Date(post.createdAt).toLocaleString()}</small>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="user-profile-no-posts">No recent posts</p>
                    )}
                    {totalPages > 1 && (
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={handleClickPage}
                            stylePrefix="user-profile"
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default Profile;