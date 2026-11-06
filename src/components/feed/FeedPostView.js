import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import api from "../../services/api";
import PostCard from "../common/PostCard";
import Spinner from "../common/LoadingSpinner";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { toast } from 'react-toastify';
import "./feed.css";

const FeedPostView = ({ onBack }) => {
    const [post, setPost] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [commentText, setCommentText] = useState("");
    const { postId } = useParams();
    const MAX_CHAR_LIMIT = 150;
    const navigate = useNavigate();

    const commentInputRef = useRef(null);

    const focusCommentInput = () => {
        if (commentInputRef.current) {
            commentInputRef.current.focus();
        }
    };

    useEffect(() => {
        const fetchPost = async () => {
            try {
                setIsLoading(true);
                const response = await api.get(`/posts/${postId}`);
                const postData = response.data.post;

                if (!postData) {
                    throw new Error("Post not found");
                }
                setPost(postData);
            } catch (err) {
                setError("Failed to load post. Please try again later.");
                console.error("Error fetching post:", err);
            } finally {
                setIsLoading(false);
            }
        };

        const token = localStorage.getItem("accessToken");
        if (token) {
            const decodedToken = jwtDecode(token);
            setCurrentUser(decodedToken);
        }

        fetchPost();
    }, [postId]);

    const handleDelete = async (postId) => {
        try {
            await api.delete(`/posts/${postId}`);
            onBack();
        } catch (err) {
            setError("Failed to delete post. Please try again.");
        }
    };

    const handleEdit = async (postId, newContent) => {
        try {
            const response = await api.put(`/posts/${postId}`, {
                content: newContent,
            });
            
            setPost(prevPost => ({
                ...prevPost,
                content: response.data.content,
                lastEditedAt: response.data.lastEditedAt,
            }));
            navigate(0);
            
        } catch (err) {
            setError("Failed to edit post. Please try again.");
        }
    };

    const handleLike = async (postId) => {
        try {
            const response = await api.put(`/posts/${postId}/like`);
            setPost(prevPost => ({
                ...prevPost,
                likes: response.data.likes || []
            }));
        } catch (err) {
            setError("Failed to toggle like. Please try again.");
        }
    };

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (commentText.trim() && commentText.length <= MAX_CHAR_LIMIT) {
            try {
                const response = await api.post(`/posts/${postId}/comments`, {
                    text: commentText,
                });
                setPost({
                    ...post,
                    comments: response.data, // The API returns the post's full comment list
                });
                setCommentText("");
                toast.success('Comment posted successfully!', {
                    position: "bottom-center",
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true
                });
            } catch (error) {
                console.error("Error posting comment:", error);
                toast.error('Failed to post comment. Please try again.', {
                    position: "bottom-center",
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true
                });
            }
        }
    };

    const handleDeleteComment = async (commentId) => {
        const userConfirmed = window.confirm("Are you sure you want to delete this comment?");
  
        if (!userConfirmed) {
            return;
        }
        try {
            await api.delete(`/posts/${postId}/comments/${commentId}`);
            setPost({
                ...post,
                comments: post.comments.filter((comment) => comment._id !== commentId),
            });
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

    const getRelativeTime = (dateString) => {
        const postDate = new Date(dateString);
        const now = new Date();
        const diffInMs = now - postDate;
        const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
        const diffInHours = Math.floor(diffInMinutes / 60);
        const diffInDays = Math.floor(diffInHours / 24);

        if (diffInMinutes < 1) {
            return "Just now";
        } else if (diffInMinutes < 60) {
            return `${diffInMinutes} min${diffInMinutes > 1 ? "s" : ""} ago`;
        } else if (diffInHours < 24) {
            return `${diffInHours} hr${diffInHours > 1 ? "s" : ""} ago`;
        } else {
            return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`;
        }
    };

    if (isLoading) return <Spinner />;
    if (error) return <div className="error-message">{error}</div>;
    if (!post) return <div className="not-found-message">Post not found</div>;

    return (
        <div className="feed-post-container">
            <button 
                onClick={() => {
                    navigate("/welcome", { 
                        replace: true,
                        state: { refresh: true } 
                    });
                }} 
                className="back-button"
            >
                <FontAwesomeIcon icon={faArrowLeft} /> 
            </button>

            <PostCard
                post={post}
                onDelete={handleDelete}
                onEdit={handleEdit}
                currentUser={currentUser}
                onLike={handleLike}
                isInFeedView={true}
                onCommentClick={focusCommentInput}
            />

            <div className="comments-section">
                <h3 className="comments-header">
                    Comments ({post.comments?.length || 0})
                </h3>

                <form onSubmit={handleCommentSubmit} className="comment-form">
                    <textarea
                        ref={commentInputRef}
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder="Write a comment..."
                        rows="3"
                        maxLength={MAX_CHAR_LIMIT}
                        className="comment-textarea"
                    />
                    <div className="comment-form-footer">
                        <span className="char-counter">
                            {MAX_CHAR_LIMIT - commentText.length} characters remaining
                        </span>
                        <button
                            type="submit"
                            disabled={
                                !commentText.trim() || commentText.length > MAX_CHAR_LIMIT
                            }
                            className="post-comment-button"
                        >
                            Post Comment
                        </button>
                    </div>
                </form>

                <div className="comments-list">
                    {post.comments?.length > 0 ? (
                        post.comments.map((comment) => (
                            <div key={comment._id} className="comment-card">
                                <div className="comment-header">
                                    <div className="comment-author">{comment.author?.name}</div>
                                    <div className="comment-meta">
                                        <span className="comment-time">
                                            {getRelativeTime(comment.createdAt)}
                                        </span>
                                        {(currentUser?.id === comment.author?._id ||
                                            currentUser?.role === "admin") && (
                                            <button
                                                onClick={() => handleDeleteComment(comment._id)}
                                                className="delete-comment-button"
                                            >
                                                <FontAwesomeIcon icon={faTrash} size="sm" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <div className="comment-text">{comment.text}</div>
                            </div>
                        ))
                    ) : (
                        <p className="no-comments">No comments yet.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FeedPostView;