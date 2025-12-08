import { useState, useEffect } from 'react';
import { Heart, MessageCircle, Trash2, Send } from 'lucide-react';
import { postService, Post } from '../../services/postService';
import { commentService, Comment } from '../../services/commentService';
import { useAuthStore } from '../../store/authStore';
import { Button, Loading } from '../common';
import toast from 'react-hot-toast';

interface PostListProps {
  eventId: string;
}

export default function PostList({ eventId }: PostListProps) {
  const { user } = useAuthStore();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [newPostContent, setNewPostContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, [eventId]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const data = await postService.getEventPosts(eventId);
      setPosts(data.posts);
    } catch (error) {
      console.error('Fetch posts error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostContent.trim()) return;

    try {
      setSubmitting(true);
      await postService.createPost(eventId, { content: newPostContent });
      setNewPostContent('');
      toast.success('Đã đăng bài viết');
      fetchPosts();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Không thể đăng bài');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLike = async (postId: string) => {
    try {
      await postService.toggleLike(postId);
      // Update local state
      setPosts(posts.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            isLiked: !post.isLiked,
            _count: {
              ...post._count,
              likes: post.isLiked ? post._count.likes - 1 : post._count.likes + 1
            }
          };
        }
        return post;
      }));
    } catch (error) {
      toast.error('Không thể thích bài viết');
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm('Bạn có chắc muốn xóa bài viết này?')) return;

    try {
      await postService.deletePost(postId);
      toast.success('Đã xóa bài viết');
      fetchPosts();
    } catch (error) {
      toast.error('Không thể xóa bài viết');
    }
  };

  if (loading) {
    return <Loading text="Đang tải bài viết..." />;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Bảng tin sự kiện</h2>

      {/* Create Post Form */}
      <form onSubmit={handleCreatePost} className="mb-8">
        <div className="flex gap-3">
          <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
            <span className="text-primary-600 font-semibold">
              {user?.fullName?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1">
            <textarea
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              placeholder="Chia sẻ suy nghĩ của bạn về sự kiện..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
              rows={3}
            />
            <div className="mt-2 flex justify-end">
              <Button
                type="submit"
                disabled={!newPostContent.trim() || submitting}
                loading={submitting}
                size="sm"
              >
                <Send className="w-4 h-4 mr-2" />
                Đăng bài
              </Button>
            </div>
          </div>
        </div>
      </form>

      {/* Posts List */}
      {posts.length === 0 ? (
        <div className="text-center py-12">
          <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Chưa có bài viết nào. Hãy là người đầu tiên!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {posts.map((post) => (
            <PostItem
              key={post.id}
              post={post}
              onLike={handleLike}
              onDelete={handleDeletePost}
              onCommentAdded={fetchPosts}
              currentUserId={user?.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Post Item Component
interface PostItemProps {
  post: Post;
  onLike: (postId: string) => void;
  onDelete: (postId: string) => void;
  onCommentAdded: () => void;
  currentUserId?: string;
}

function PostItem({ post, onLike, onDelete, onCommentAdded, currentUserId }: PostItemProps) {
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  const fetchComments = async () => {
    if (comments.length > 0) return; // Already loaded

    try {
      setLoadingComments(true);
      const data = await commentService.getPostComments(post.id);
      setComments(data.comments);
    } catch (error) {
      console.error('Fetch comments error:', error);
    } finally {
      setLoadingComments(false);
    }
  };

  const handleShowComments = () => {
    setShowComments(!showComments);
    if (!showComments && comments.length === 0) {
      fetchComments();
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      setSubmittingComment(true);
      await commentService.createComment(post.id, { content: newComment });
      setNewComment('');
      toast.success('Đã thêm bình luận');
      await fetchComments();
      onCommentAdded();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Không thể thêm bình luận');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Xóa bình luận này?')) return;

    try {
      await commentService.deleteComment(commentId);
      toast.success('Đã xóa bình luận');
      await fetchComments();
      onCommentAdded();
    } catch (error) {
      toast.error('Không thể xóa bình luận');
    }
  };

  const formatDate = (date: string) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'Vừa xong';
    if (minutes < 60) return `${minutes} phút trước`;
    if (hours < 24) return `${hours} giờ trước`;
    if (days < 7) return `${days} ngày trước`;
    return d.toLocaleDateString('vi-VN');
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4">
      {/* Post Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex gap-3">
          <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
            <span className="text-primary-600 font-semibold">
              {post.author.fullName.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <p className="font-semibold text-gray-900">{post.author.fullName}</p>
            <p className="text-sm text-gray-500">{formatDate(post.createdAt)}</p>
          </div>
        </div>
        {currentUserId === post.author.id && (
          <button
            onClick={() => onDelete(post.id)}
            className="text-gray-400 hover:text-red-600 transition"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Post Content */}
      <p className="text-gray-800 mb-4 whitespace-pre-wrap">{post.content}</p>

      {/* Post Actions */}
      <div className="flex items-center gap-6 pt-3 border-t border-gray-100">
        <button
          onClick={() => onLike(post.id)}
          className={`flex items-center gap-2 transition ${
            post.isLiked ? 'text-red-600' : 'text-gray-600 hover:text-red-600'
          }`}
        >
          <Heart className={`w-5 h-5 ${post.isLiked ? 'fill-current' : ''}`} />
          <span className="text-sm font-medium">{post._count.likes}</span>
        </button>
        <button
          onClick={handleShowComments}
          className="flex items-center gap-2 text-gray-600 hover:text-primary-600 transition"
        >
          <MessageCircle className="w-5 h-5" />
          <span className="text-sm font-medium">{post._count.comments}</span>
        </button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          {loadingComments ? (
            <p className="text-center text-gray-500 py-4">Đang tải bình luận...</p>
          ) : (
            <>
              {/* Comment Form */}
              <form onSubmit={handleAddComment} className="mb-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Viết bình luận..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                  <Button
                    type="submit"
                    disabled={!newComment.trim() || submittingComment}
                    loading={submittingComment}
                    size="sm"
                  >
                    Gửi
                  </Button>
                </div>
              </form>

              {/* Comments List */}
              <div className="space-y-3">
                {comments.map((comment) => (
                  <div key={comment.id} className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                      <span className="text-gray-600 text-sm font-semibold">
                        {comment.author.fullName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="bg-gray-50 rounded-lg px-3 py-2">
                        <div className="flex justify-between items-start">
                          <p className="font-semibold text-sm text-gray-900">
                            {comment.author.fullName}
                          </p>
                          {currentUserId === comment.author.id && (
                            <button
                              onClick={() => handleDeleteComment(comment.id)}
                              className="text-gray-400 hover:text-red-600 ml-2"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                        <p className="text-gray-700 text-sm mt-1">{comment.content}</p>
                      </div>
                      <p className="text-xs text-gray-500 mt-1 ml-3">
                        {formatDate(comment.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
