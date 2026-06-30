import { useState, useRef } from 'react';
import { createPost, uploadPhoto } from '../api/api';
import toast from 'react-hot-toast';
import { FiImage, FiSend, FiX, FiUploadCloud } from 'react-icons/fi';

const PRESET_PHOTOS = [
  { name: '✈️ Travel', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=500&fit=crop' },
  { name: '💻 Coding', url: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&h=500&fit=crop' },
  { name: '🌳 Nature', url: 'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=800&h=500&fit=crop' },
  { name: '🍔 Foodie', url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&h=500&fit=crop' }
];

const CreatePost = ({ onPostCreated }) => {
  const [content, setContent] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [showPhotoPicker, setShowPhotoPicker] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const fileInputRef = useRef(null);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size exceeds 5MB limit');
      return;
    }

    const formData = new FormData();
    formData.append('image', file);

    setUploading(true);
    try {
      const res = await uploadPhoto(formData);
      setMediaUrl(res.data.url);
      toast.success('Photo uploaded!');
      setShowPhotoPicker(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to upload image');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() && !mediaUrl) {
      toast.error('Post content cannot be empty');
      return;
    }

    setSubmitting(true);
    try {
      const res = await createPost({
        content: content.trim(),
        mediaUrl,
        mediaType: mediaUrl ? 'image' : ''
      });
      toast.success('Post shared successfully!');
      setContent('');
      setMediaUrl('');
      setShowPhotoPicker(false);
      if (onPostCreated) onPostCreated(res.data.data);
    } catch {
      toast.error('Failed to publish post');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="create-post-card">
      <form onSubmit={handleSubmit} id="create-post-form">
        <textarea
          id="post-input"
          placeholder="What's on your mind? Add tags like #coding or #travel!"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows="3"
          required
        />

        {/* Selected Media Preview */}
        {mediaUrl && (
          <div className="media-preview-wrap">
            <img src={mediaUrl} alt="Preview" className="media-preview-img" />
            <button
              type="button"
              className="btn-icon remove-preview"
              onClick={() => setMediaUrl('')}
              title="Remove photo"
            >
              <FiX />
            </button>
          </div>
        )}

        <div className="create-post-footer">
          <div className="footer-left">
            <button
              type="button"
              className={`btn-media-picker ${showPhotoPicker ? 'active' : ''}`}
              onClick={() => setShowPhotoPicker(!showPhotoPicker)}
              title="Add photo"
            >
              <FiImage /> <span>{uploading ? 'Uploading...' : 'Add Photo'}</span>
            </button>
          </div>

          <button
            type="submit"
            className="btn-primary btn-post-submit"
            id="post-submit-btn"
            disabled={submitting || uploading || (!content.trim() && !mediaUrl)}
          >
            <FiSend /> {submitting ? 'Sharing...' : 'Share Post'}
          </button>
        </div>

        {/* Custom Upload and Preset Photo Picker */}
        {showPhotoPicker && (
          <div className="preset-photo-picker-row">
            <div className="picker-options-header">
              <h4>Choose Photo Option</h4>
              <button
                type="button"
                className="btn-upload-custom"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                <FiUploadCloud /> {uploading ? 'Uploading...' : 'Upload Image File'}
              </button>
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                accept="image/*"
                onChange={handleFileChange}
              />
            </div>
            
            <div className="picker-divider">OR USE A PRESET</div>
            
            <div className="picker-grid">
              {PRESET_PHOTOS.map((photo, i) => (
                <button
                  key={i}
                  type="button"
                  className={`picker-photo-btn ${mediaUrl === photo.url ? 'selected' : ''}`}
                  onClick={() => {
                    setMediaUrl(photo.url);
                    setShowPhotoPicker(false);
                  }}
                >
                  {photo.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default CreatePost;
