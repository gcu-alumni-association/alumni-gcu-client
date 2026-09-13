import React, { useState, useEffect, useRef } from "react";
import { Link } from 'react-router-dom';
import '../components.css';
import ProfilePhoto from "../../components/common/ProfilePhotoComponent";
import CommentModal from "./CommentModal";
import api from "../../services/api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
    faEllipsisH,
    faThumbsUp, 
    faComment,
    faShare,
    faFlag,
    faBriefcase,
    faBuilding,
    faLocationDot,
    faCalendarXmark,
    faUserTie,
    faListCheck,
    faArrowUpRightFromSquare
} from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const PostCard = ({ post, onDelete, onEdit, onLike, currentUser, isInFeedView = false, onCommentClick }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editedContent, setEditedContent] = useState(post.content);
    const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
    const [comments, setComments] = useState(post.comments || []);
    const [showMenu, setShowMenu] = useState(false);
    const [showShareToast, setShowShareToast] = useState(false);
    const navigate = useNavigate();
    const menuRef = useRef(null);
    const menuButtonRef = useRef(null);

    // Track menu state with ref
    const menuOpenRef = useRef(showMenu);
    useEffect(() => {
        menuOpenRef.current = showMenu;
    }, [showMenu]);

    // Handle clicks outside menu
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (showMenu && menuRef.current && 
                !menuRef.current.contains(event.target) &&
                !menuButtonRef.current.contains(event.target)) {
                setShowMenu(false);
            }
        };

        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, [showMenu]);

    const handleCommentButtonClick = (e) => {
        e.stopPropagation();
        if (isInFeedView && onCommentClick) {
            onCommentClick();
        } else {
            setIsCommentModalOpen(true);
        }
    };

    const handlePostClick = (e) => {
        // Prevent navigation if menu is open or clicking interactive elements
        if (menuOpenRef.current || 
            e.target.closest('button') || 
            e.target.closest('a') || 
            e.target.closest('.gcu-edit-form') ||
            e.target.closest('.gcu-comment-form')) {
            return;
        }
        navigate(`/welcome/post/${post._id}`);
    };

    const handleDelete = async () => {
        if (window.confirm("Are you sure you want to delete this post?")) {
            await onDelete(post._id);
        }
        setShowMenu(false);
    };

    const handleEdit = async () => {
        await onEdit(post._id, editedContent);
        setIsEditing(false);
    };

    const handleLike = async () => {
        try {
            await onLike(post._id);
        } catch (error) {
            console.error("Error liking post:", error);
        }
    };

    const handleCommentSubmit = async (commentText) => {
        try {
            const response = await api.post(`/posts/${post._id}/comments`, {
                text: commentText
            });
            setComments([...comments, response.data]);
            toast.success('Comment added successfully!', {
                position: "bottom-center",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true
            });
        } catch (error) {
            console.error("Error posting comment:", error);
            toast.error('Failed to add comment. Please try again.', {
                position: "bottom-center",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true
            });
        }
    };

    const handleDeleteComment = async (commentId) => {
        try {
            await api.delete(`/posts/${post._id}/comments/${commentId}`);
            setComments(comments.filter(comment => comment._id !== commentId));
            toast.success('Comment deleted successfully!', {
                position: "bottom-center",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true
            });
        } catch (error) {
            console.error("Error deleting comment:", error);
            toast.error('Failed to delete comment. Please try again.', {
                position: "bottom-center",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true
            });
        }
    };

    const handleReport = async (e) => {
        e.stopPropagation();
        try {
            await api.post(`/posts/report`, { postId: post._id });
            toast.success('Post reported successfully!', {
                position: "bottom-center",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true
            });
        } catch (err) {
            console.error('Error reporting post:', err);
            toast.error('Failed to report post. Please try again.', {
                position: "bottom-center",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true
            });
        }
    };

    const getRelativeTime = (dateString) => {
        const postDate = new Date(dateString);
        const now = new Date();
        const diffInMs = now - postDate;
        const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
        const diffInHours = Math.floor(diffInMinutes / 60);
        const diffInDays = Math.floor(diffInHours / 24);

        if (diffInMinutes < 1) {
            return 'Just now';
        } else if (diffInMinutes < 60) {
            return `${diffInMinutes} min`;
        } else if (diffInHours < 24) {
            return `${diffInHours} hr${diffInHours > 1 ? 's' : ''}`;
        } else {
            return `${diffInDays} day${diffInDays > 1 ? 's' : ''}`;
        }
    };

    const canEdit = currentUser && (currentUser.id === post.author._id);
    const canDelete = currentUser && (currentUser.role === 'admin' || currentUser.role === 'superuser' || currentUser.id === post.author._id);
    const hasLiked = Array.isArray(post.likes) && post.likes.includes(currentUser.id);
    const canReport = currentUser && (currentUser.id !== post.author._id);

    const handleShare = async (e) => {
        e.stopPropagation();
        const postUrl = `${window.location.origin}/welcome/post/${post._id}`;
        
        try {
            await navigator.clipboard.writeText(postUrl);
            setShowShareToast(true);
            setTimeout(() => setShowShareToast(false), 2000);
        } catch (err) {
            console.error('Failed to copy URL:', err);
        }
    };

    return (
        <div className="gcu-post-card" onClick={handlePostClick}>
            <div className="gcu-post-card-wrapper">
                {/* Three-dot menu */}
                {(canEdit || canDelete) && (
                    <div className="gcu-top-actions">
                        <div className="relative" ref={menuRef}>
                            <button 
                                ref={menuButtonRef}
                                className="gcu-menu-button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setShowMenu(!showMenu);
                                }}
                            >
                                <FontAwesomeIcon icon={faEllipsisH} />
                            </button>
                            {showMenu && (
                                <div className="gcu-dropdown-menu">
                                    {canEdit && !isEditing && (
                                        <button
                                            className="gcu-menu-item"
                                            onClick={() => {
                                                setIsEditing(true);
                                                setShowMenu(false);
                                            }}
                                        >
                                            Edit
                                        </button>
                                    )}
                                    {canDelete && (
                                        <button className="gcu-menu-item" onClick={handleDelete}>
                                            Delete
                                        </button>
                                    )}
                                </div>
                            )}

                        </div>
                    </div>
                )}

                {/* Left Section with Author Info */}
                <div className="gcu-post-card-left">
                    <Link to={`/profile/${post.author?._id}`}>
                        <ProfilePhoto 
                            userId={post.author?._id}
                            className="gcu-post-author-avatar"
                        />
                    </Link>
                    <div className="gcu-post-author-info">
                        <Link to={`/profile/${post.author?._id}`} className="gcu-post-author-name">
                            <h3>{post.author?.name || 'Anonymous'}</h3>
                        </Link>
                        <p className="gcu-post-author-details">
                            {post.author?.role === 'admin' || post.author?.role === 'superuser' ? (
                                <span style={{ fontSize: '0.75rem', backgroundColor: '#e0f2fe', color: '#0369a1', padding: '1px 6px', borderRadius: '4px', fontWeight: '600' }}>
                                    Administrator
                                </span>
                            ) : (
                                <>
                                    {post.author?.batch && `${post.author.batch} - `}
                                    {post.author?.branch || ''}
                                </>
                            )}
                        </p>
                        <p className="gcu-post-timestamp">
                            {getRelativeTime(post.createdAt)}
                        </p>
                        {post.lastEditedAt && (
                            <p className="gcu-post-edit-timestamp">
                                Last Edited: {getRelativeTime(post.lastEditedAt)}
                            </p>
                        )}
                    </div>
                </div>

                {/* Middle Section - Post Content */}
                <div className="gcu-post-card-middle">
                    {isEditing ? (
                        <div className="gcu-edit-form">
                            <textarea
                                value={editedContent}
                                onChange={(e) => setEditedContent(e.target.value)}
                                className="gcu-edit-textarea"
                                placeholder="Edit your post..."
                            />
                            <div className="gcu-edit-buttons">
                                <button onClick={handleEdit} className="gcu-edit-save-button">
                                    Save
                                </button>
                                <button 
                                    onClick={() => {
                                        setIsEditing(false);
                                        setEditedContent(post.content);
                                    }} 
                                    className="gcu-edit-cancel-button"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div>
                            {post.category === 'job' && post.jobDetails ? (
                                <div style={{ marginBottom: '14px', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '18px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px', marginBottom: '10px' }}>
                                        <div>
                                            <h4 style={{ margin: 0, fontSize: '1.2rem', color: '#0f2942', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <FontAwesomeIcon icon={faBriefcase} style={{ color: '#003366', fontSize: '14px' }} />
                                                {post.jobDetails.role}
                                            </h4>
                                            {post.jobDetails.companyName && (
                                                <p style={{ margin: '4px 0 0', fontSize: '0.9rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                    <FontAwesomeIcon icon={faBuilding} style={{ fontSize: '12px' }} /> {post.jobDetails.companyName}
                                                </p>
                                            )}
                                        </div>
                                        {post.jobDetails.jobType && (
                                            <span style={{ fontSize: '0.78rem', backgroundColor: '#f8fafc', color: '#334155', border: '1px solid #e2e8f0', padding: '4px 10px', borderRadius: '6px', fontWeight: '600' }}>
                                                {post.jobDetails.jobType}
                                            </span>
                                        )}
                                    </div>

                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', fontSize: '0.8rem', marginTop: '8px', marginBottom: '12px' }}>
                                        {post.jobDetails.location && (
                                            <span style={{ backgroundColor: '#f8fafc', color: '#475569', padding: '4px 10px', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                                                <FontAwesomeIcon icon={faLocationDot} style={{ color: '#94a3b8', fontSize: '11px' }} /> {post.jobDetails.location}
                                            </span>
                                        )}
                                        {post.jobDetails.salary && (
                                            <span style={{ backgroundColor: '#f8fafc', color: '#1e293b', padding: '4px 10px', borderRadius: '8px', border: '1px solid #e2e8f0', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                                {post.jobDetails.salary}
                                            </span>
                                        )}
                                        {post.jobDetails.experience && (
                                            <span style={{ backgroundColor: '#f8fafc', color: '#475569', padding: '4px 10px', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                                                <FontAwesomeIcon icon={faUserTie} style={{ color: '#64748b', fontSize: '11px' }} /> {post.jobDetails.experience}
                                            </span>
                                        )}
                                        {post.jobDetails.deadline && (
                                            <span style={{ backgroundColor: '#f8fafc', color: '#475569', padding: '4px 10px', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                                                <FontAwesomeIcon icon={faCalendarXmark} style={{ color: '#64748b', fontSize: '11px' }} /> Deadline: {post.jobDetails.deadline}
                                            </span>
                                        )}
                                    </div>

                                    {post.jobDetails.requirements && (
                                        <div style={{ marginTop: '8px', marginBottom: '12px', fontSize: '0.85rem', color: '#334155', backgroundColor: '#f8fafc', padding: '10px 12px', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                                            <strong style={{ color: '#0f2942', display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '4px' }}>
                                                <FontAwesomeIcon icon={faListCheck} style={{ color: '#003366', fontSize: '12px' }} /> Key Requirements:
                                            </strong>
                                            <span>{post.jobDetails.requirements}</span>
                                        </div>
                                    )}

                                    {/* Clean About Role Description */}
                                    <p className="gcu-post-content" style={{ margin: '10px 0 14px', whiteSpace: 'pre-line', color: '#475569', fontSize: '0.92rem', lineHeight: '1.6' }}>
                                        {post.jobDetails.aboutRole || post.content.replace(/^.*?(About Role:|\n\n)/s, '').trim() || post.content}
                                    </p>

                                    {post.jobDetails.applyLinkOrEmail && (
                                        <div style={{ marginTop: '10px' }}>
                                            <a 
                                                href={post.jobDetails.applyLinkOrEmail.startsWith('http') ? post.jobDetails.applyLinkOrEmail : `mailto:${post.jobDetails.applyLinkOrEmail}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: '#10b981', color: '#ffffff', padding: '8px 16px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: '600', textDecoration: 'none' }}
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                Apply Now <FontAwesomeIcon icon={faArrowUpRightFromSquare} style={{ fontSize: '11px' }} />
                                            </a>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <p className="gcu-post-content" style={{ whiteSpace: 'pre-line' }}>{post.content}</p>
                            )}
                        </div>
                    )}
                </div>
                
                <hr className="gcu-horizontal-line" />

                {/* Bottom action buttons */}
                <div className="gcu-post-actions">
                    <button
                        className={`gcu-action-button ${hasLiked ? 'liked' : ''}`}
                        onClick={handleLike}
                        title={hasLiked ? "Unlike post" : "Like post"}
                    >
                        <FontAwesomeIcon icon={faThumbsUp} /> {post.likes.length}
                    </button>
                    <button
                        className="gcu-action-button"
                        onClick={handleCommentButtonClick}
                        title="Comment on post"
                    >
                        <FontAwesomeIcon icon={faComment} /> {comments.length}
                    </button>
                    <button
                        className="gcu-action-button"
                        onClick={handleShare}
                        title="Share post"
                    >
                        <FontAwesomeIcon icon={faShare} />
                    </button>
                    {canReport && (
                        <button
                            className="gcu-action-button"
                            onClick={handleReport}
                            title="Report post"
                        >
                            <FontAwesomeIcon icon={faFlag} />
                        </button>
                    )}
                </div>

                {showShareToast && (
                    <div className="gcu-share-toast">
                        Link copied to clipboard!
                    </div>
                )}

                {!isInFeedView && (
                    <CommentModal
                        isOpen={isCommentModalOpen}
                        onClose={() => setIsCommentModalOpen(false)}
                        onSubmitComment={handleCommentSubmit}
                        onDeleteComment={handleDeleteComment}
                        comments={comments}
                        currentUser={currentUser}
                    />
                )}
            </div>
        </div>
    );
};

export default PostCard;
