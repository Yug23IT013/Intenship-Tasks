import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import CreatePost from '../components/CreatePost';
import PostCard from '../components/PostCard';
import Suggestions from '../components/Suggestions';
import { getTimelinePosts, getExplorePosts } from '../api/api';
import toast from 'react-hot-toast';
import { FiHash, FiGrid, FiFeather, FiTrendingUp } from 'react-icons/fi';

const Feed = ({ isExplore = false }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notifTrigger, setNotifTrigger] = useState(0);

  const tag = searchParams.get('tag');
  const search = searchParams.get('search');

  const fetchFeed = async () => {
    setLoading(true);
    try {
      let res;
      if (isExplore || tag || search) {
        const params = {};
        if (tag) params.tag = tag;
        if (search) params.search = search;
        res = await getExplorePosts(params);
      } else {
        res = await getTimelinePosts();
      }
      setPosts(res.data.data);
    } catch {
      toast.error('Failed to load posts feed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeed();
  }, [isExplore, tag, search]);

  const handlePostCreated = (newPost) => {
    // Append to feed list
    setPosts((prev) => [newPost, ...prev]);
  };

  const handleTagClick = (cleanTag) => {
    // Navigate to explore with tag query
    navigate(`/explore?tag=${cleanTag}`);
  };

  const handleFollowChange = () => {
    // Refresh feed and unread notifs counter
    fetchFeed();
    setNotifTrigger((prev) => prev + 1);
  };

  return (
    <div className="app-layout">
      <Navbar notifUpdateTrigger={notifTrigger} />

      <div className="main-content-layout">
        {/* Left Column Navigation (Visual) */}
        <nav className="left-sidebar-navigation">
          <div className="nav-profile-preview">
            <span className="logo-preview">✨</span>
            <h2>VibeGrid</h2>
            <p>Your social vibe grid</p>
          </div>
          <ul className="left-nav-list">
            <li className={!isExplore && !tag && !search ? 'active' : ''} onClick={() => navigate('/')}>
              <FiFeather /> Timeline
            </li>
            <li className={isExplore && !tag && !search ? 'active' : ''} onClick={() => navigate('/explore')}>
              <FiGrid /> Explore Global
            </li>
            {tag && (
              <li className="active hashtags-active">
                <FiHash /> #{tag}
              </li>
            )}
          </ul>
        </nav>

        {/* Center Feed Column */}
        <main className="feed-center-column">
          {/* Header context */}
          <div className="feed-header-banner">
            <h2>
              {tag ? (
                <># {tag}</>
              ) : search ? (
                <>Search: "{search}"</>
              ) : isExplore ? (
                <>Explore Global Feed</>
              ) : (
                <>Timeline</>
              )}
            </h2>
          </div>

          {/* Create Post (only on main timeline, or when not searching/tag filtering) */}
          {!tag && !search && !isExplore && (
            <CreatePost onPostCreated={handlePostCreated} />
          )}

          {/* Posts list */}
          {loading ? (
            <div className="feed-loading"><p>Retrieving posts...</p></div>
          ) : posts.length === 0 ? (
            <div className="feed-empty">
              <span className="empty-bubble">📭</span>
              <h3>No posts to show</h3>
              <p>Try sharing a post, following other users, or exploring trending hashtags!</p>
            </div>
          ) : (
            <div className="posts-feed-list">
              {posts.map((post) => (
                <PostCard
                  key={post._id}
                  post={post}
                  onTagClick={handleTagClick}
                />
              ))}
            </div>
          )}
        </main>

        {/* Right Column Sidebar (Follow suggestions & Trending) */}
        <Suggestions
          onTagClick={handleTagClick}
          onFollowChange={handleFollowChange}
        />
      </div>
    </div>
  );
};

export default Feed;
