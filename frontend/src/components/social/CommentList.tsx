import { useState, useEffect } from 'react';
import { commentService, Comment } from '../../services/commentService';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';

interface CommentListProps {
  postId: string;
  onCommentAdded?: () => void;
  onCommentDeleted?: () => void;
}

export default function CommentList({ postId, onCommentAdded, onCommentDeleted }: CommentListProps) {
  const { user, isAuthenticated } = useAuthStore();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    loadComments();
  }, [postId]);

  const loadComments = async () => {
    try {
      setLoading(true);
      const data = await commentService.getPostComments(postId);
      setComments(data.comments);
    } catch (error: any) {
      console.error('Error loading comments:', error);
      if (error?.response?.status !== 401) {
        toast.error('Không thể tải bình luận');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newComment.trim()) {
      toast.error('Vui lòng nhập nội dung bình luận');
      return;
    }

    try {
      setCreating(true);
      const comment = await commentService.createComment(postId, {
        content: newComment
      });
      
      setComments([...comments, comment]);
      setNewComment('');
      
      if (onCommentAdded) {
        onCommentAdded();
      }
      
      toast.success('Đã thêm bình luận');
    } catch (error: any) {
      toast.error(error?.response?.data?.error || 'Thêm bình luận thất bại');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Bạn có chắc muốn xóa bình luận này?')) return;

    try {
      await commentService.deleteComment(commentId);
      setComments(comments.filter(c => c.id !== commentId));
      
      if (onCommentDeleted) {
        onCommentDeleted();
      }
      
      toast.success('Đã xóa bình luận');
    } catch (error: any) {
      toast.error(error?.response?.data?.error || 'Xóa bình luận thất bại');
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

  if (loading) {
    return (
      <div className="flex justify-center items-center py-6">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="border-t pt-4 mt-4">
      {/* Comments List */}
      <div className="space-y-4 mb-4">
        {comments.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-4">
            Chưa có bình luận nào. Hãy là người đầu tiên bình luận!
          </p>
        ) : (
          comments.map((comment) => {
            const canDelete = user?.id === comment.authorId || user?.role === 'ADMIN';
            
            return (
              <div key={comment.id} className="flex gap-3">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-white text-sm font-semibold">
                    {comment.author.avatar ? (
                      <img 
                        src={comment.author.avatar} 
                        alt={comment.author.fullName} 
                        className="w-full h-full rounded-full object-cover" 
                      />
                    ) : (
                      comment.author.fullName.charAt(0).toUpperCase()
                    )}
                  </div>
                </div>
                
                <div className="flex-1">
                  <div className="bg-gray-100 rounded-lg px-4 py-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-sm text-gray-900">
                        {comment.author.fullName}
                      </span>
                      {canDelete && (
                        <button
                          onClick={() => handleDeleteComment(comment.id)}
                          className="text-red-600 hover:text-red-800 text-xs"
                        >
                          Xóa
                        </button>
                      )}
                    </div>
                    <p className="text-gray-800 text-sm whitespace-pre-wrap">
                      {comment.content}
                    </p>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 ml-2">
                    {formatDate(comment.createdAt)}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Create Comment Form */}
      {isAuthenticated && (
        <form onSubmit={handleCreateComment} className="flex gap-3">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-semibold">
              {user?.fullName?.charAt(0).toUpperCase() || 'U'}
            </div>
          </div>
          
          <div className="flex-1">
            <div className="flex gap-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Viết bình luận..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                disabled={creating}
              />
              <button
                type="submit"
                disabled={creating || !newComment.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors"
              >
                {creating ? '...' : 'Gửi'}
              </button>
            </div>
          </div>
        </form>
      )}
      
      {!isAuthenticated && (
        <p className="text-center text-gray-500 text-sm py-4">
          Đăng nhập để bình luận
        </p>
      )}
    </div>
  );
}
