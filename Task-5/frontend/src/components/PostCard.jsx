import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { likePost, commentPost, getComments } from '../api/api';
import toast from 'react-hot-toast';
import { FiHeart, FiMessageCircle, FiSend, FiUser } from 'react-icons/fi';

const PostCard = ({ post, onTagClick }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [likesCount, setLikesCount] = useState(post.likes?.length || 0);
  const [isLiked, setIsLiked] = useState(post.likes?.includes(user?._id) || false);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);

  // Toggle Likes
  const handleLike = async () => {
    try {
      const res = await likePost(post._id);
      setIsLiked(res.data.liked);
      setLikesCount((prev) => (res.data.liked ? prev + 1 : prev - 1));
    } catch {
      toast.error('Failed to update likes');
    }
  };

  // Toggle Comments Drawer
  const toggleComments = async () => {
    const nextState = !showComments;
    setShowComments(nextState);
    if (nextState && comments.length === 0) {
      setLoadingComments(true);
      try {
        const res = await getComments(post._id);
        setComments(res.data.data);
      } catch {
        toast.error('Failed to retrieve comments');
      } finally {
        setLoadingComments(false);
      }
    }
  };

  // Submit Comment
  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const res = await commentPost(post._id, { content: newComment.trim() });
      setComments((prev) => [res.data.data, ...prev]);
      setNewComment('');
    } catch {
      toast.error('Failed to post comment');
    }
  };

  // Parse text content to make hashtags clickable
  const renderContentWithHashtags = (text) => {
    if (!text) return '';
    const parts = text.split(/(\s+)/);
    return parts.map((part, index) => {
      if (part.startsWith('#') && part.length > 1) {
        const cleanTag = part.slice(1).replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "");
        return (
          <span
            key={index}
            className="hashtag-span"
            onClick={() => onTagClick && onTagClick(cleanTag)}
            title={`Filter by #${cleanTag}`}
          >
            {part}
          </span>
        );
      }
      return part;
    });
  };

  return (
    <div className="post-card">
      {/* Card Header */}
      <div className="post-card-header">
        <div className="post-author" onClick={() => navigate(`/profile/${post.user._id}`)}>
          <img src={post.user.avatar} alt="Avatar" className="author-avatar" />
          <div>
            <h3>@{post.user.username}</h3>
            <p className="post-time">{new Date(post.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
          </div>
        </div>
      </div>

      {/* Card Body */}
      <div className="post-card-body">
        <p className="post-content">{renderContentWithHashtags(post.content)}</p>

        {/* Media */}
        {post.mediaUrl && (
          <div className="post-media-wrap">
            <img src={post.mediaUrl} alt="Post media" loading="lazy" />
          </div>
        )}
      </div>

      {/* Card Actions */}
      <div className="post-card-actions">
        <button
          className={`action-btn ${isLiked ? 'liked' : ''}`}
          onClick={handleLike}
          id={`like-post-${post._id}`}
          title={isLiked ? 'Unlike' : 'Like'}
        >
          <FiHeart className="action-icon" />
          <span>{likesCount} Likes</span>
        </button>

        <button
          className={`action-btn ${showComments ? 'active' : ''}`}
          onClick={toggleComments}
          id={`comment-btn-${post._id}`}
          title="Comments"
        >
          <FiMessageCircle className="action-icon" />
          <span>{post.commentsCount || comments.length} Comments</span>
        </button>
      </div>

      {/* Comments Drawer */}
      {showComments && (
        <div className="comments-drawer">
          <form onSubmit={handleCommentSubmit} className="comment-form" id={`comment-form-${post._id}`}>
            <input
              id={`comment-input-${post._id}`}
              type="text"
              placeholder="Write a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              required
            />
            <button type="submit" className="btn-icon btn-comment-send" id={`comment-submit-${post._id}`}>
              <FiSend />
            </button>
          </form>

          {loadingComments ? (
            <div className="comments-loading"><p>Retrieving comments...</p></div>
          ) : comments.length === 0 ? (
            <p className="no-comments">No comments yet. Start the conversation!</p>
          ) : (
            <ul className="comments-list">
              {comments.map((comment) => (
                <li key={comment._id} className="comment-item">
                  <img
                    src={comment.user.avatar}
                    alt={comment.user.username}
                    className="comment-avatar"
                    onClick={() => navigate(`/profile/${comment.user._id}`)}
                  />
                  <div className="comment-bubble">
                    <h4 onClick={() => navigate(`/profile/${comment.user._id}`)}>
                      @{comment.user.username}
                    </h4>
                    <p>{comment.content}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default PostCard;
