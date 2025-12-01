import { useState } from 'react';
import { Post } from '../../services/postService';
import { postService } from '../../services/postService';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';
import { CommentList } from './index';

interface PostCardProps {
  post: Post;
  onPostDeleted: () => void;
  onPostUpdated: () => void;
}

export default function PostCard({ post, onPostDeleted, onPostUpdated }: PostCardProps) {
  const { user } = useAuthStore();
  const [showComments, setShowComments] = useState(false);
  const [isLiked, setIsLiked] = useState(post.isLiked || false);
  const [likeCount, setLikeCount] = useState(post._count.likes);
  const [commentCount, setCommentCount] = useState(post._count.comments);
  const [deleting, setDeleting] = useState(false);
  const [liking, setLiking] = useState(false);

  const handleDelete = async () => {
    if (!confirm('Bạn có chắc muốn xóa bài viết này?')) return;

    try {
      setDeleting(true);
      await postService.deletePost(post.id);
      toast.success('Đã xóa bài viết');
      onPostDeleted();
    } catch (error: any) {
      toast.error(error?.response?.data?.error || 'Xóa bài viết thất bại');
    } finally {
      setDeleting(false);
    }
  };

  const handleLike = async () => {
    try {
      setLiking(true);
      const result = await postService.toggleLike(post.id);
      setIsLiked(result.isLiked);
      setLikeCount(prev => result.isLiked ? prev + 1 : prev - 1);
    } catch (error: any) {
      toast.error(error?.response?.data?.error || 'Có lỗi xảy ra');
    } finally {
      setLiking(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} ngày trước`;
    if (hours > 0) return `${hours} giờ trước`;
    if (minutes > 0) return `${minutes} phút trước`;
    return 'Vừa xong';
  };

  const canDelete = user?.id === post.authorId || user?.role === 'ADMIN';

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-4">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
            {post.author.avatar ? (
              <img src={post.author.avatar} alt={post.author.fullName} className="w-full h-full rounded-full object-cover" />
            ) : (
              post.author.fullName.charAt(0).toUpperCase()
            )}
          </div>
          <div>
            <h4 className="font-semibold text-gray-900">{post.author.fullName}</h4>
            <p className="text-sm text-gray-500">{formatDate(post.createdAt)}</p>
          </div>
        </div>
        {canDelete && (
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="text-red-600 hover:text-red-800 text-sm disabled:opacity-50"
          >
            {deleting ? 'Đang xóa...' : 'Xóa'}
          </button>
        )}
      </div>

      {/* Content */}
      <div className="mb-4">
        <p className="text-gray-800 whitespace-pre-wrap">{post.content}</p>
      </div>

      {/* Image */}
      {post.imageUrl && (
        <div className="mb-4">
          <img
            src={post.imageUrl}
            alt="Post"
            className="w-full rounded-lg max-h-96 object-cover"
          />
        </div>
      )}

      {/* Stats */}
      <div className="flex items-center gap-4 text-sm text-gray-600 mb-4 pb-4 border-b">
        <span>{likeCount} lượt thích</span>
        <span>{commentCount} bình luận</span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4 mb-4">
        <button
          onClick={handleLike}
          disabled={liking}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
            isLiked
              ? 'bg-blue-100 text-blue-600'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          } disabled:opacity-50`}
        >
          <span>{isLiked ? '❤️' : '🤍'}</span>
          <span>Thích</span>
        </button>
        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 font-medium transition-colors"
        >
          <span>💬</span>
          <span>Bình luận</span>
        </button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <CommentList
          postId={post.id}
          onCommentAdded={() => {
            setCommentCount(prev => prev + 1);
            onPostUpdated();
          }}
          onCommentDeleted={() => {
            setCommentCount(prev => prev - 1);
            onPostUpdated();
          }}
        />
      )}
    </div>
  );
}
