import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faEdit,
    faTrash,
    faThumbsUp,
    faSave,
    faTimes,
    faComment,
    faShare,
} from "@fortawesome/free-solid-svg-icons";
import ProfilePhoto from "../../components/common/ProfilePhotoComponent";

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
        return `${diffInMinutes} min ago`;
    } else if (diffInHours < 24) {
        return `${diffInHours} hr${diffInHours > 1 ? "s" : ""} ago`;
    } else {
        return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`;
    }
};

const PostCard = ({ post, onDelete, onEdit, onLike, onComment, onDeleteComment, currentUser }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editedContent, setEditedContent] = useState(post.content);
    const [replyContent, setReplyContent] = useState("");
    const [showReplyModal, setShowReplyModal] = useState(false);
    const [comments, setComments] = useState(post.comments);


    const handleDelete = async () => {
        if (window.confirm("Are you sure you want to delete this post?")) {
            await onDelete(post._id);
        }
    };

    const handleEdit = async () => {
        await onEdit(post._id, editedContent);
        setIsEditing(false);
    };

    const handleLike = async () => {
        await onLike(post._id);
    };

    const handleCommentSubmit = async () => {
        if (replyContent.trim()) {
            await onComment(post._id, replyContent);
            setReplyContent("");
        }
    };

    const handleCommentDelete = async (commentId) => {
        await onDeleteComment(post._id, commentId);
        setComments(comments.filter((comment) => comment._id !== commentId));
    };

    const canEdit = currentUser && currentUser.id === post.author._id;
    const canDelete = currentUser && (currentUser.role === "admin" || currentUser.id === post.author._id);
    const hasLiked = Array.isArray(post.likes) && post.likes.includes(currentUser.id);

    return (
        <div className="gcu-post-card">
            <div className="gcu-post-card-wrapper">
                {(canEdit || canDelete) && (
                    <div className="gcu-top-actions">
                        {canEdit && !isEditing && (
                            <button
                                className="gcu-edit-button"
                                onClick={() => setIsEditing(true)}
                                title="Edit post"
                            >
                                <FontAwesomeIcon icon={faEdit} />
                            </button>
                        )}
                        {canDelete && (
                            <button
                                className="gcu-delete-button"
                                onClick={handleDelete}
                                title="Delete post"
                            >
                                <FontAwesomeIcon icon={faTrash} />
                            </button>
                        )}
                    </div>
                )}

                <div className="gcu-post-card-left">
                    <Link to={`/profile/${post.author?._id}`}>
                        <ProfilePhoto userId={post.author?._id} className="gcu-post-author-avatar" />
                    </Link>
                    <div className="gcu-post-author-info">
                        <Link to={`/profile/${post.author?._id}`} className="gcu-post-author-name">
                            <h3>{post.author?.name || "Anonymous"}</h3>
                        </Link>
                        <p className="gcu-post-timestamp">{getRelativeTime(post.createdAt)}</p>
                        {post.lastEditedAt && (
                            <p className="gcu-post-edit-timestamp">
                                Last Edited: {getRelativeTime(post.lastEditedAt)}
                            </p>
                        )}
                    </div>
                </div>

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
                                    <FontAwesomeIcon icon={faSave} /> Save
                                </button>
                                <button
                                    onClick={() => setIsEditing(false)}
                                    className="gcu-edit-cancel-button"
                                >
                                    <FontAwesomeIcon icon={faTimes} /> Cancel
                                </button>
                            </div>
                        </div>
                    ) : (
                        <p className="gcu-post-content">{post.content}</p>
                    )}
                </div>

                <div className="gcu-post-actions">
                    <button
                        className={`gcu-action-button ${hasLiked ? "liked" : ""}`}
                        onClick={handleLike}
                        title={hasLiked ? "Unlike post" : "Like post"}
                    >
                        <FontAwesomeIcon icon={faThumbsUp} /> {post.likes.length}
                    </button>
                    <button
                        className="gcu-action-button"
                        onClick={() => setShowReplyModal(true)}
                        title="View replies"
                    >
                        <FontAwesomeIcon icon={faComment} /> {post.comments.length}
                    </button>
                    <button className="gcu-action-button" title="Share post">
                        <FontAwesomeIcon icon={faShare} />
                    </button>
                </div>

                {showReplyModal && (
                    <div className="gcu-reply-modal">
                        <div className="gcu-modal-header">
                            <h3>Replies</h3>
                            <button
                                onClick={() => setShowReplyModal(false)}
                                className="gcu-close-modal-button"
                            >
                                <FontAwesomeIcon icon={faTimes} />
                            </button>
                        </div>
                        <div className="gcu-comments-container">
                            {post.comments.length > 0 ? (
                                post.comments.map((comment) => (
                                    <div key={comment._id} className="gcu-comment-card">
                                        <p>
                                            <strong>{comment.author.name}</strong> -{" "}
                                            {getRelativeTime(comment.createdAt)}
                                        </p>
                                        <p>{comment.content}</p>
                                        {(currentUser.id === comment.author._id || currentUser.role === "admin") && (
                                            <button
                                                className="gcu-reply-delete-button"
                                                onClick={() => handleCommentDelete(comment._id)}
                                            >
                                                <FontAwesomeIcon icon={faTrash} />
                                            </button>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <p>No replies yet.</p>
                            )}
                        </div>
                        <div className="gcu-reply-form">
                            <textarea
                                value={replyContent}
                                onChange={(e) => setReplyContent(e.target.value)}
                                placeholder="Write a reply..."
                                className="gcu-reply-textarea"
                            />
                            <div className="gcu-reply-buttons">
                                <button onClick={handleCommentSubmit} className="gcu-reply-submit-button">
                                    Submit
                                </button>
                                <button
                                    onClick={() => setReplyContent("")}
                                    className="gcu-reply-cancel-button"
                                >
                                    Clear
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PostCard;