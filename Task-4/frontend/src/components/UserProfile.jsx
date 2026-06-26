import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { updateProfile } from '../api/api';
import toast from 'react-hot-toast';
import { FiX, FiCheck, FiRefreshCw } from 'react-icons/fi';

const UserProfile = ({ onClose }) => {
  const { user, updateUserInfo } = useAuth();
  const { changeStatus } = useSocket();
  const [bio, setBio] = useState(user?.bio || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [status, setStatus] = useState(user?.status || 'online');
  const [updating, setUpdating] = useState(false);

  const handleStatusChange = (newStatus) => {
    setStatus(newStatus);
    changeStatus(newStatus);
    updateUserInfo({ status: newStatus });
  };

  const regenerateAvatar = () => {
    const randomSeed = Math.floor(Math.random() * 10000);
    setAvatar(`https://api.dicebear.com/7.x/bottts/svg?seed=${randomSeed}`);
  };

  const handleSave = async () => {
    setUpdating(true);
    try {
      const res = await updateProfile({ bio, avatar });
      updateUserInfo(res.data.data);
      toast.success('Profile updated successfully');
      onClose();
    } catch (err) {
      toast.error('Failed to update profile');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="profile-drawer">
      <div className="drawer-header">
        <h2>My Profile</h2>
        <button className="btn-icon" onClick={onClose} id="close-profile-btn" aria-label="Close Profile">
          <FiX />
        </button>
      </div>

      <div className="drawer-body">
        {/* Avatar */}
        <div className="avatar-edit-wrap">
          <img src={avatar} alt="Profile" className="profile-large-avatar" />
          <button className="btn-regenerate" onClick={regenerateAvatar} title="Generate random avatar">
            <FiRefreshCw /> Change Avatar
          </button>
        </div>

        {/* Username & Email (Readonly) */}
        <div className="form-group-readonly">
          <label>Username</label>
          <p>@{user?.username}</p>
        </div>
        <div className="form-group-readonly">
          <label>Email Address</label>
          <p>{user?.email}</p>
        </div>

        {/* Bio */}
        <div className="form-group">
          <label htmlFor="bio-input">About / Bio</label>
          <textarea
            id="bio-input"
            rows="3"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Hey there! I am using LocalChat."
          />
        </div>

        {/* Presence Status Selector */}
        <div className="form-group">
          <label>Presence Status</label>
          <div className="status-selector">
            {[
              { value: 'online', label: '🟢 Online' },
              { value: 'away', label: '🟡 Away' },
              { value: 'offline', label: '⚫ Offline' }
            ].map((opt) => (
              <button
                key={opt.value}
                type="button"
                className={`status-opt-btn ${status === opt.value ? 'active' : ''}`}
                onClick={() => handleStatusChange(opt.value)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <button className="btn-primary btn-save" onClick={handleSave} disabled={updating} id="save-profile-btn">
          <FiCheck /> {updating ? 'Saving...' : 'Save Profile'}
        </button>
      </div>
    </div>
  );
};

export default UserProfile;
