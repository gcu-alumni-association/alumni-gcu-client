import React from "react";
import PostCard from "../common/PostCard";

const PostList = ({ posts, onDeletePost, currentUser, isLoading, onEditPost, onLike }) => {
    return (
        <div className="gcu-posts-container">
            {isLoading ? (
                <p className="gcu-text-center">Loading posts...</p>
            ) : posts && posts.length > 0 ? (
                posts.map((post) => (
                    <PostCard
                        key={post._id}
                        post={post}
                        onEdit={onEditPost}
                        onDelete={onDeletePost}
                        currentUser={currentUser}
                        onLike={onLike}
                    />
                ))
            ) : (
                <p className="gcu-text-center gcu-text-gray-500 gcu-mt-4">
                    No posts yet. Be the first to post!
                </p>
            )}
        </div>
    );
};

export default PostList;
