import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../services/api";
import '../pages.css'; 

const Profile = () => {
    const [user, setUser] = useState(null);
    const [userPosts, setUserPosts] = useState([]);
    const navigate = useNavigate();
    const [currentPage, setCurrentPage] = useState(1);
    const postsPerPage = 5;

    const sendRequest = async () => {
        try {
            const res = await api.get('/user/user');
            if (res && res.data) {
                return res.data;
            } else {
                console.error('No data found in response');
                return null;
            }
        } catch (err) {
            console.error('Error during HTTP request:', err);
            return null;
        }
    };

    const fetchUserPosts = async (userId) => {
        try {
            const res = await api.get(`/posts/user/${userId}`);
            if (res && res.data) {
                setUserPosts(res.data);
            }
        } catch (err) {
            console.error('Error fetching user posts:', err);
        }
    };

    useEffect(() => {
        sendRequest().then((data) => {
            if (data) {
                setUser(data);
                fetchUserPosts(data._id);
            }
        });
    }, []);

    const handlePostClick = () => {
        navigate('/welcome');
    };

    // Pagination logic
    const indexOfLastPost = currentPage * postsPerPage;
    const indexOfFirstPost = indexOfLastPost - postsPerPage;
    const currentPosts = userPosts.slice(indexOfFirstPost, indexOfLastPost);
    const totalPages = Math.ceil(userPosts.length / postsPerPage);

    const handleClickPage = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    return (
        <div className="user-profile-container">
            <h1 className="user-profile-main-title">Profile</h1>
            <div className="user-profile-card">
                <div className="user-profile-header">
                    <img 
                        src={user?.profilePicture || "https://via.placeholder.com/150"} 
                        alt="Profile" 
                        className="user-profile-picture" 
                    />
                    <div className="user-profile-info">
                        <h2 className="user-profile-name">{user?.name}</h2>
                        <p className="user-profile-email">{user?.email}</p>
                        <button className="user-profile-change-picture-btn">Change Picture</button>
                    </div>
                </div>
                <div className="user-profile-details">
                    <h3>About</h3>
                    <p><strong>Biography:</strong> {user?.biography || "No biography available"}</p>
                    <p><strong>Current Working Place:</strong> {user?.currentWorkingPlace || "Not provided"}</p>
                    <p><strong>Batch:</strong> {user?.batch}</p>
                    <p><strong>Branch:</strong> {user?.branch}</p>
                    <Link to="/update-profile" className="user-profile-update-btn">Update Profile</Link>
                </div>
            </div>
            <div className="user-profile-posts-section">
                <h2 className="user-profile-posts-title">Recent Posts</h2>
                {currentPosts.length > 0 ? (
                    <div className="user-profile-posts-list">
                        {currentPosts.map((post) => (
                            <div key={post._id} className="user-profile-post-link" onClick={handlePostClick}>
                                <div className="user-profile-post-card">
                                    <p className="user-profile-post-content">{post.content}</p>
                                    <small className="user-profile-post-date">{new Date(post.createdAt).toLocaleString()}</small>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="user-profile-no-posts">No recent posts</p>
                )}
                {/* Pagination */}
                {userPosts.length > postsPerPage && (
                    <div className="user-profile-pagination">
                        {Array.from({ length: totalPages }, (_, index) => (
                            <button 
                                key={index + 1} 
                                className={`user-profile-page-number ${currentPage === index + 1 ? 'user-profile-page-number-active' : ''}`} 
                                onClick={() => handleClickPage(index + 1)}
                            >
                                {index + 1}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Profile;
