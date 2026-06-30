import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchUsers, followUser, getTrendingTags } from '../api/api';
import toast from 'react-hot-toast';
import { FiPlus, FiUserCheck, FiTrendingUp, FiSearch } from 'react-icons/fi';

const Suggestions = ({ onTagClick, onFollowChange }) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [trending, setTrending] = useState([]);
  const [followingMap, setFollowingMap] = useState({});

  // Load recommendations and trending tags
  const loadSidebarData = async () => {
    try {
      const [uRes, tRes] = await Promise.all([
        searchUsers(''),
        getTrendingTags()
      ]);
      // Recommend up to 3-4 users
      setUsers(uRes.data.data.slice(0, 4));
      setTrending(tRes.data.data);
    } catch {
      console.error('Error fetching sidebar recommendations');
    }
  };

  useEffect(() => {
    loadSidebarData();
  }, [onFollowChange]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/explore?search=${encodeURIComponent(query.trim())}`);
      setQuery('');
    }
  };

  const handleFollowToggle = async (userId) => {
    try {
      const res = await followUser(userId);
      setFollowingMap(prev => ({ ...prev, [userId]: res.data.following }));
      toast.success(res.data.message);
      if (onFollowChange) onFollowChange();
    } catch {
      toast.error('Could not toggle follow status');
    }
  };

  return (
    <aside className="suggestions-sidebar">
      {/* Search Widget */}
      <form className="sidebar-search-form" onSubmit={handleSearchSubmit}>
        <FiSearch className="search-icon" />
        <input
          id="explore-search"
          type="text"
          placeholder="Search posts..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </form>

      {/* Recommended Users */}
      <div className="sidebar-section">
        <h3>Who to Follow</h3>
        {users.length === 0 ? (
          <p className="sidebar-empty">No recommendations found</p>
        ) : (
          <ul className="suggestions-list">
            {users.map((u) => {
              const isFollowing = followingMap[u._id] || false;
              return (
                <li key={u._id} className="suggestion-item">
                  <div className="suggestion-user-info" onClick={() => navigate(`/profile/${u._id}`)}>
                    <img src={u.avatar} alt={u.username} className="suggestion-avatar" />
                    <span>@{u.username}</span>
                  </div>
                  <button
                    className={`btn-follow-toggle ${isFollowing ? 'following' : ''}`}
                    onClick={() => handleFollowToggle(u._id)}
                  >
                    {isFollowing ? <FiUserCheck /> : <FiPlus />}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Trending Hashtags */}
      <div className="sidebar-section">
        <h3>
          <FiTrendingUp className="trending-icon" /> Trending Tags
        </h3>
        {trending.length === 0 ? (
          <p className="sidebar-empty">No trending tags yet</p>
        ) : (
          <ul className="trending-list">
            {trending.map((t) => (
              <li
                key={t.tag}
                className="trending-item"
                onClick={() => onTagClick && onTagClick(t.tag)}
                title={`Filter by #${t.tag}`}
              >
                <span className="tag-name">#{t.tag}</span>
                <span className="tag-count">{t.count} posts</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </aside>
  );
};

export default Suggestions;
