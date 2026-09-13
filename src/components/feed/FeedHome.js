import React, { useState, useEffect, useRef, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import api from "../../services/api";
import PostForm from "../../components/forms/PostForm";
import PostList from "../../components/common/PostList";
import RecommendedUsersList from "../../components/common/RecommendedUsersList";
import FeedLayout from "./FeedLayout";
import FeedNavbar from "./FeedNavbar";
import VerifiedUsersList from "../common/VerifiedUsersList";
import CompanyList from "../common/CompanyList";
import Spinner from "../common/LoadingSpinner"; // Import Spinner
import { useParams, useNavigate } from 'react-router-dom';
import FeedPostView from './FeedPostView';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Welcome = () => {
    const location = useLocation();
    const { postId } = useParams();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [isFetchingMore, setIsFetchingMore] = useState(false); // New state for infinite scrolling
    const [error, setError] = useState(null);
    const [posts, setPosts] = useState([]);
    const [totalPages, setTotalPages] = useState(1);
    const [currentUser, setCurrentUser] = useState(null);
    const [activeTab, setActiveTab] = useState(() => {
        return location.state?.tab || "home";
    });
    const [hasMore, setHasMore] = useState(true);
    const loaderRef = useRef(null);
    const currentPageRef = useRef(1);
    const postsPerPage = 6;

    // Get current user
    useEffect(() => {
        const token = localStorage.getItem("accessToken");
        if (token) {
            const decodedToken = jwtDecode(token);
            setCurrentUser(decodedToken);
        }
    }, []);

    // Fetch posts function
    const fetchPosts = useCallback(
        async (page, category = "post", reset = false) => {
            if (!currentUser) return;

            if (!reset) setIsFetchingMore(true);

            try {
                let endpoint;
                if (activeTab === "my-posts") {
                    endpoint = `/posts/user/${currentUser.id}?page=${page}&limit=${postsPerPage}`;
                } else {
                    endpoint = `/posts/get-post?page=${page}&limit=${postsPerPage}&category=${category}`;
                    if (activeTab !== "my-posts") {
                        endpoint += `&excludeUser=${currentUser?.id}`;
                    }
                }

                const response = await api.get(endpoint);

                setPosts((prevPosts) => {
                    if (reset) return response.data.posts;
                    return [...prevPosts, ...response.data.posts];
                });

                currentPageRef.current = page;
                setTotalPages(response.data.totalPages);
                setHasMore(page < response.data.totalPages);
            } catch (err) {
                setError("Failed to load posts. Please try again later.");
            } finally {
                if (!reset) setIsFetchingMore(false);
                setIsLoading(false);
            }
        },
        [currentUser, activeTab]
    );

    // Initial posts fetch when tab changes
    useEffect(() => {
        if (currentUser) {
            setIsLoading(true);
            setPosts([]);
            currentPageRef.current = 1;
            setHasMore(true);
            const category =
                activeTab === "jobs"
                    ? "job"
                    : activeTab === "education"
                    ? "education"
                    : activeTab === "my-posts"
                    ? "all"
                    : "post";
            fetchPosts(1, category, true);
        }
    }, [activeTab, currentUser, fetchPosts]);

    // Infinite scroll observer
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                const first = entries[0];
                if (first.isIntersecting && hasMore && !isFetchingMore && posts.length > 0) {
                    const category =
                        activeTab === "jobs"
                            ? "job"
                            : activeTab === "education"
                            ? "education"
                            : activeTab === "my-posts"
                            ? "all"
                            : "post";
                    fetchPosts(currentPageRef.current + 1, category);
                }
            },
            { threshold: 0.1, rootMargin: "100px" }
        );

        if (loaderRef.current) observer.observe(loaderRef.current);

        return () => observer.disconnect();
    }, [hasMore, isFetchingMore, posts.length, activeTab, fetchPosts]);

    const handleSubmitPost = async (content, category, jobDetails = null) => {
        try {
            setIsLoading(true);
            await api.post("/posts/create", { content, category, jobDetails });
    
            const currentCategory =
                activeTab === "jobs"
                    ? "job"
                    : activeTab === "education"
                    ? "education"
                    : "post";
    
            await fetchPosts(1, currentCategory, true);
    
            toast.success(
                <div>
                    Post created successfully!{' '}
                    <span 
                        style={{ 
                            textDecoration: 'underline', 
                            cursor: 'pointer',
                            color: '#2563eb',
                            backgroundColor: 'transparent'
                        }}
                        onClick={() => {
                            setActiveTab("my-posts");
                            navigate("/welcome");
                        }}
                    >
                        View in My Posts
                    </span>
                </div>
            );
        } catch (err) {
            if (err.response?.status === 429) {
                const remainingTime = err.response.data.remainingTime || 0;
    
                toast.error(
                    `You're posting too quickly! Please wait ${remainingTime} seconds before trying again.`,
                    { autoClose: false } // Keeps the toast visible for better UX
                );
            } else {
                setError("Failed to submit post. Please try again.");
                toast.error("Failed to create post. Please try again.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeletePost = async (postId) => {
        try {
            await api.delete(`/posts/${postId}`);
            setPosts((prevPosts) => prevPosts.filter((post) => post._id !== postId));
            toast.success("Post deleted successfully!");
        } catch (err) {
            setError("Failed to delete post. Please try again.");
            toast.error("Failed to delete post. Please try again.");
        }
    };

    const handleEditPost = async (postId, newContent) => {
        try {
            await api.put(`/posts/${postId}`, { content: newContent });
            setPosts((prevPosts) =>
                prevPosts.map((post) =>
                    post._id === postId ? { ...post, content: newContent } : post
                )
            );
            toast.success("Post updated successfully!");
        } catch (err) {
            setError("Failed to edit post. Please try again.");
            toast.error("Failed to edit post. Please try again.");
        }
    };

    const handleLike = async (postId) => {
        try {
            const response = await api.put(`/posts/${postId}/like`);
            setPosts((prevPosts) =>
                prevPosts.map((post) =>
                    post._id === postId ? { ...post, likes: response.data.likes } : post
                )
            );
        } catch (err) {
            setError("Failed to toggle like. Please try again.");
            toast.error("Failed to toggle like. Please try again.");
        }
    };

    useEffect(() => {
        if (location.state?.tab && location.state.tab !== activeTab) {
            setActiveTab(location.state.tab);
        }
        if (location.state?.refresh) {
            // Reset everything
            setPosts([]);
            currentPageRef.current = 1;
            setHasMore(true);
            const targetTab = location.state.tab || activeTab;
            const category = targetTab === "jobs" ? "job" : 
                            targetTab === "education" ? "education" : 
                            targetTab === "my-posts" ? "all" : "post";
            fetchPosts(1, category, true);
            
            navigate(".", { replace: true, state: {} });
        }
    }, [location.state, activeTab, fetchPosts, navigate]);

    const mainContent = (
        <>
            {postId ? (
                <FeedPostView onBack={() => navigate("/welcome")} />
            ) : (
                <div className="flex flex-col">
                    {activeTab !== "friends" && activeTab !== "companies" && (
                        <PostForm onSubmitPost={handleSubmitPost} isLoading={isLoading} error={error} />
                    )}
                    {activeTab !== "friends" && activeTab !== "companies" && (
                        <>
                            {isLoading && posts.length === 0 ? (
                                <div className="flex justify-center py-4">
                                    <Spinner />
                                </div>
                            ) : (
                                <>
                                    <PostList
                                        posts={posts}
                                        onDeletePost={handleDeletePost}
                                        onEditPost={handleEditPost}
                                        currentUser={currentUser}
                                        isLoading={isLoading}
                                        onLike={handleLike}
                                    />
                                    <div className="mt-4">
                                        {isFetchingMore && (
                                            <div className="flex justify-center items-center h-12">
                                                <Spinner />
                                            </div>
                                        )}
                                        <div ref={loaderRef} style={{ height: "20px" }} />
                                    </div>
                                </>
                            )}
                        </>
                    )}
                    {activeTab === "friends" && <VerifiedUsersList />}
                    {activeTab === "companies" && <CompanyList />}
                </div>
            )}
            <ToastContainer
                position="bottom-center"
                autoClose={3500}
                hideProgressBar={false}
                newestOnTop
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
            />
        </>
    );

    return (
        <FeedLayout
            fullWidth={activeTab === "friends" || activeTab === "companies"}
            leftSidebar={<FeedNavbar activeTab={activeTab} setActiveTab={setActiveTab} />}
            mainContent={mainContent}
            rightSidebar={
                <>
                    {activeTab === "home" && (
                        <RecommendedUsersList onSwitchToFriends={() => setActiveTab("friends")} />
                    )}
                    {activeTab === "jobs" && (
                        <RecommendedUsersList onSwitchToFriends={() => setActiveTab("friends")} />
                    )}
                    {activeTab === "education" && <VerifiedUsersList />}
                    {activeTab === "companies" && (
                        <RecommendedUsersList onSwitchToFriends={() => setActiveTab("friends")} />
                    )}
                    {activeTab === "my-posts" && (
                        <RecommendedUsersList onSwitchToFriends={() => setActiveTab("friends")} />
                    )}
                </>
            }
        />
    );
};

export default Welcome;