import { useState, useEffect, useRef } from 'react';
import { Heart, MessageCircle, Trash2, Send } from 'lucide-react';
import { postService, Post } from '../../services/postService';
import { commentService, Comment } from '../../services/commentService';
import { useAuthStore } from '../../store/authStore';
import { Button, Loading } from '../common';
import CreatePostBox from './CreatePostBox';
import { getImageUrl } from '../../lib/api';
import toast from 'react-hot-toast';

interface PostListProps {
  eventId: string;
  highlightPostId?: string; // For scrolling to specific post from notification
}

export default function PostList({ eventId, highlightPostId }: PostListProps) {
  const { user } = useAuthStore();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const hasScrolled = useRef(false); // Track if we've already scrolled

  useEffect(() => {
    fetchPosts();
    // Reset scroll tracker when eventId changes
    hasScrolled.current = false;
  }, [eventId]);

  // Reset scroll tracker when highlightPostId changes
  useEffect(() => {
    if (highlightPostId) {
      hasScrolled.current = false;
    }
  }, [highlightPostId]);

  // Scroll to highlighted post - ONLY ONCE
  useEffect(() => {
    // Only scroll if we have highlightPostId, posts are loaded, and haven't scrolled yet
    if (highlightPostId && posts.length > 0 && !hasScrolled.current) {
      // Small delay to ensure posts are rendered
      const timer = setTimeout(() => {
        const element = document.getElementById(`post-${highlightPostId}`);
        if (element) {
          // Mark as scrolled BEFORE scrolling to prevent re-triggers
          hasScrolled.current = true;

          // Scroll to post
          element.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
          });

          // Add highlight animation
          element.classList.add('ring-4', 'ring-blue-400', 'ring-opacity-50', 'transition-all');

          // Remove highlight after 3 seconds
          setTimeout(() => {
            element.classList.remove('ring-4', 'ring-blue-400', 'ring-opacity-50');
          }, 3000);
        }
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [highlightPostId, posts]);

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

  const handleCreatePost = async (content: string, images?: File[]) => {
    await postService.createPost(eventId, { content }, images);
    await fetchPosts();
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
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Bảng tin sự kiện</h2>

      {/* Create Post Box - Facebook Style */}
      <CreatePostBox
        onSubmit={handleCreatePost}
        placeholder="Chia sẻ suy nghĩ của bạn về sự kiện..."
      />

      {/* Posts List */}
      {posts.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Chưa có bài viết nào. Hãy là người đầu tiên!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostItem
              key={post.id}
              post={post}
              onLike={handleLike}
              onDelete={handleDeletePost}
              onCommentAdded={fetchPosts}
              currentUserId={user?.id}
              isHighlighted={highlightPostId === post.id}
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
  isHighlighted?: boolean; // For highlighting when scrolled to from notification
}

function PostItem({ post, onLike, onDelete, onCommentAdded, currentUserId, isHighlighted }: PostItemProps) {
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

  const getInitials = () => {
    const names = post.author.fullName.split(' ');
    if (names.length >= 2) {
      return names[0][0] + names[names.length - 1][0];
    }
    return post.author.fullName[0];
  };

  return (
    <div
      id={`post-${post.id}`}
      className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
    >
      {/* Post Header */}
      <div className="flex items-start justify-between p-4">
        <div className="flex gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-md">
            <span className="text-white font-bold text-sm">
              {getInitials()}
            </span>
          </div>
          <div>
            <p className="font-semibold text-gray-900 hover:text-blue-600 cursor-pointer">
              {post.author.fullName}
            </p>
            <p className="text-xs text-gray-500">{formatDate(post.createdAt)}</p>
          </div>
        </div>
        {currentUserId === post.author.id && (
          <button
            onClick={() => onDelete(post.id)}
            className="text-gray-400 hover:text-red-600 transition p-2 hover:bg-gray-100 rounded-full"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Post Content */}
      {post.content && (
        <div className="px-4 pb-3">
          <p className="text-gray-800 whitespace-pre-wrap">{post.content}</p>
        </div>
      )}

      {/* Post Images */}
      {post.imageUrl && (
        <div className="w-full">
          <img
            src={getImageUrl(post.imageUrl)}
            alt="Post image"
            className="w-full max-h-[500px] object-cover cursor-pointer hover:opacity-95 transition"
            onClick={() => window.open(getImageUrl(post.imageUrl), '_blank')}
          />
        </div>
      )}

      {/* Like/Comment Count Bar */}
      {(post._count.likes > 0 || post._count.comments > 0) && (
        <div className="px-4 py-2 flex items-center justify-between text-sm text-gray-500 border-t border-gray-100">
          <div className="flex items-center gap-1">
            {post._count.likes > 0 && (
              <div className="flex items-center gap-1">
                <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                  <Heart className="w-3 h-3 text-white fill-current" />
                </div>
                <span>{post._count.likes}</span>
              </div>
            )}
          </div>
          {post._count.comments > 0 && (
            <button
              onClick={handleShowComments}
              className="hover:underline"
            >
              {post._count.comments} bình luận
            </button>
          )}
        </div>
      )}

      {/* Post Actions */}
      <div className="flex items-center gap-1 px-2 py-1 border-t border-gray-100">
        <button
          onClick={() => onLike(post.id)}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg transition ${post.isLiked
            ? 'text-red-600 hover:bg-red-50'
            : 'text-gray-600 hover:bg-gray-100'
            }`}
        >
          <Heart className={`w-5 h-5 ${post.isLiked ? 'fill-current' : ''}`} />
          <span className="text-sm font-medium">Thích</span>
        </button>
        <button
          onClick={handleShowComments}
          className="flex-1 flex items-center justify-center gap-2 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
        >
          <MessageCircle className="w-5 h-5" />
          <span className="text-sm font-medium">Bình luận</span>
        </button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="px-4 pb-4 pt-2 border-t border-gray-100 bg-gray-50">
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
                    className="flex-1 px-4 py-2 bg-white border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                  <Button
                    type="submit"
                    disabled={!newComment.trim() || submittingComment}
                    loading={submittingComment}
                    size="sm"
                  >
                    <Send className="w-4 h-4" />
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
