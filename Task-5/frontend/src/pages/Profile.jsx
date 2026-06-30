import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getUserDetails, followUser, getUserPosts, updateProfile } from '../api/api';
import Navbar from '../components/Navbar';
import PostCard from '../components/PostCard';
import toast from 'react-hot-toast';
import { FiEdit2, FiCheck, FiX, FiRefreshCw, FiUserPlus, FiUserMinus } from 'react-icons/fi';

const PRESET_COVERS = [
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&h=300&fit=crop',
  'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800&h=300&fit=crop',
  'https://images.unsplash.com/photo-1557683316-973673baf926?w=800&h=300&fit=crop',
  'https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?w=800&h=300&fit=crop'
];

const Profile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user: loggedInUser, updateUserInfo } = useAuth();
  
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSelf, setIsSelf] = useState(false);
  const [notifTrigger, setNotifTrigger] = useState(0);

  // Profile Edit modal states
  const [showEditModal, setShowEditModal] = useState(false);
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState('');
  const [cover, setCover] = useState('');
  const [saving, setSaving] = useState(false);

  const loadProfileAndPosts = async () => {
    setLoading(true);
    try {
      const targetId = userId || loggedInUser?._id;
      if (!targetId) return;

      setIsSelf(targetId === loggedInUser?._id);

      const [pRes, postsRes] = await Promise.all([
        getUserDetails(targetId),
        getUserPosts(targetId)
      ]);

      setProfile(pRes.data.data);
      setPosts(postsRes.data.data);
      
      // Initialize edit fields
      setBio(pRes.data.data.bio || '');
      setAvatar(pRes.data.data.avatar || '');
      setCover(pRes.data.data.coverImage || '');
    } catch {
      toast.error('Failed to load profile details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfileAndPosts();
  }, [userId, loggedInUser]);

  const handleFollowToggle = async () => {
    if (!profile) return;
    try {
      const res = await followUser(profile._id);
      setProfile((prev) => {
        if (!prev) return prev;
        const offset = res.data.following ? 1 : -1;
        return {
          ...prev,
          isFollowing: res.data.following,
          followersCount: Math.max(0, prev.followersCount + offset)
        };
      });
      toast.success(res.data.message);
      setNotifTrigger((prev) => prev + 1);
    } catch {
      toast.error('Could not toggle follow status');
    }
  };

  const regenerateAvatar = () => {
    const seed = Math.floor(Math.random() * 10000);
    setAvatar(`https://api.dicebear.com/7.x/pixel-art/svg?seed=${seed}`);
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await updateProfile({ bio, avatar, coverImage: cover });
      // Update local state
      setProfile(prev => prev ? { ...prev, ...res.data.data } : null);
      // Update AuthContext user state
      updateUserInfo(res.data.data);
      setShowEditModal(false);
      toast.success('Profile updated!');
    } catch {
      toast.error('Failed to save profile changes');
    } finally {
      setSaving(false);
    }
  };

  const handleTagClick = (cleanTag) => {
    navigate(`/explore?tag=${cleanTag}`);
  };

  if (loading && !profile) {
    return (
      <div className="app-layout">
        <Navbar />
        <div className="profile-loading"><p>Retrieving profile data...</p></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="app-layout">
        <Navbar />
        <div className="profile-not-found">
          <h2>Profile not found</h2>
          <button className="btn-primary" onClick={() => navigate('/')}>Return Home</button>
        </div>
      </div>
    );
  }

  return (
    <div className="app-layout">
      <Navbar notifUpdateTrigger={notifTrigger} />

      <div className="profile-page-container">
        {/* Cover Image banner */}
        <div className="profile-cover-wrap">
          <img src={profile.coverImage || PRESET_COVERS[0]} alt="Cover" className="cover-img" />
          {isSelf && (
            <button className="btn-edit-profile-floating" onClick={() => setShowEditModal(true)}>
              <FiEdit2 /> Edit Profile
            </button>
          )}
        </div>

        {/* Profile Card Header overlay */}
        <div className="profile-details-card">
          <div className="profile-details-header">
            <img src={profile.avatar} alt="Avatar" className="profile-avatar-large" />
            <div className="profile-action-row">
              {isSelf ? (
                <button className="btn-outline" onClick={() => setShowEditModal(true)}>
                  <FiEdit2 /> Edit Info
                </button>
              ) : (
                <button
                  className={`btn-follow-toggle-profile ${profile.isFollowing ? 'following' : ''}`}
                  onClick={handleFollowToggle}
                >
                  {profile.isFollowing ? (
                    <><FiUserMinus /> Unfollow</>
                  ) : (
                    <><FiUserPlus /> Follow</>
                  )}
                </button>
              )}
            </div>
          </div>

          <div className="profile-info-body">
            <h1>@{profile.username}</h1>
            <p className="profile-bio-text">{profile.bio}</p>

            <div className="profile-stats-row">
              <div>
                <strong>{profile.followingCount}</strong> <span>Following</span>
              </div>
              <div>
                <strong>{profile.followersCount}</strong> <span>Followers</span>
              </div>
              <div>
                <strong>{posts.length}</strong> <span>Posts</span>
              </div>
            </div>
          </div>
        </div>

        {/* User's Timeline Posts */}
        <div className="profile-posts-section">
          <h2>@{profile.username}'s Grid</h2>
          {posts.length === 0 ? (
            <div className="profile-empty-posts">
              <span className="empty-bubble">📭</span>
              <p>No posts published yet.</p>
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
        </div>
      </div>

      {/* Edit Profile Modal Dialog */}
      {showEditModal && (
        <div className="modal-backdrop">
          <div className="modal-box">
            <div className="modal-header">
              <h2>Customize Profile</h2>
              <button className="btn-icon" onClick={() => setShowEditModal(false)}>
                <FiX />
              </button>
            </div>
            <form onSubmit={handleProfileUpdate} id="profile-edit-form">
              {/* Avatar regenerate */}
              <div className="avatar-edit-wrap">
                <img src={avatar} alt="Avatar" className="profile-avatar-large edit-large" />
                <button type="button" className="btn-regenerate" onClick={regenerateAvatar}>
                  <FiRefreshCw /> Refresh Avatar
                </button>
              </div>

              {/* Bio description */}
              <div className="form-group">
                <label htmlFor="bio-input">About Bio</label>
                <textarea
                  id="bio-input"
                  rows="3"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell us about yourself..."
                />
              </div>

              {/* Cover presets selector */}
              <div className="form-group">
                <label>Select Cover Background</label>
                <div className="cover-picker-grid">
                  {PRESET_COVERS.map((cov, i) => (
                    <button
                      key={i}
                      type="button"
                      className={`cover-picker-btn ${cover === cov ? 'selected' : ''}`}
                      onClick={() => setCover(cov)}
                    >
                      <img src={cov} alt={`Cover option ${i}`} />
                    </button>
                  ))}
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-outline" onClick={() => setShowEditModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" id="save-profile-btn" disabled={saving}>
                  <FiCheck /> {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
