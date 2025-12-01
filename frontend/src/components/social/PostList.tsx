import { useState, useEffect } from 'react';
import { postService, Post } from '../../services/postService';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';
import PostCard from './PostCard';

interface PostListProps {
  eventId: string;
}

export default function PostList({ eventId }: PostListProps) {
  const { isAuthenticated } = useAuthStore();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostImage, setNewPostImage] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    loadPosts();
  }, [eventId]);

  const loadPosts = async () => {
    try {
      setLoading(true);
      const data = await postService.getEventPosts(eventId);
      setPosts(data.posts);
    } catch (error: any) {
      console.error('Error loading posts:', error);
      // Don't show error toast if user is not authenticated
      if (error?.response?.status !== 401) {
        toast.error('Không thể tải bài viết');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newPostContent.trim()) {
      toast.error('Vui lòng nhập nội dung bài viết');
      return;
    }

    try {
      setCreating(true);
      const newPost = await postService.createPost(eventId, {
        content: newPostContent,
        imageUrl: newPostImage || undefined
      });
      
      // Add new post to the beginning of the list
      setPosts([newPost, ...posts]);
      
      // Reset form
      setNewPostContent('');
      setNewPostImage('');
      setShowCreateForm(false);
      
      toast.success('Đã đăng bài viết');
    } catch (error: any) {
      toast.error(error?.response?.data?.error || 'Đăng bài thất bại');
    } finally {
      setCreating(false);
    }
  };

  const handlePostDeleted = (postId: string) => {
    setPosts(posts.filter(p => p.id !== postId));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Bảng tin sự kiện</h2>
        {isAuthenticated && (
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {showCreateForm ? 'Đóng' : '✏️ Viết bài'}
          </button>
        )}
      </div>

      {/* Create Post Form */}
      {showCreateForm && isAuthenticated && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <form onSubmit={handleCreatePost}>
            <textarea
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              placeholder="Bạn muốn chia sẻ điều gì về sự kiện này?"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={4}
              disabled={creating}
            />
            
            <input
              type="url"
              value={newPostImage}
              onChange={(e) => setNewPostImage(e.target.value)}
              placeholder="URL hình ảnh (tùy chọn)"
              className="w-full mt-3 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={creating}
            />
            
            <div className="flex justify-end gap-3 mt-4">
              <button
                type="button"
                onClick={() => {
                  setShowCreateForm(false);
                  setNewPostContent('');
                  setNewPostImage('');
                }}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                disabled={creating}
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={creating || !newPostContent.trim()}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {creating ? 'Đang đăng...' : 'Đăng bài'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Posts List */}
      {posts.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <div className="text-6xl mb-4">📝</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            Chưa có bài viết nào
          </h3>
          <p className="text-gray-600">
            {isAuthenticated
              ? 'Hãy là người đầu tiên chia sẻ về sự kiện này!'
              : 'Đăng nhập để xem và chia sẻ bài viết'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onPostDeleted={() => handlePostDeleted(post.id)}
              onPostUpdated={loadPosts}
            />
          ))}
        </div>
      )}
    </div>
  );
}
