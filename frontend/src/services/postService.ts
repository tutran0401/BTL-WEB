import api from '../lib/api';

export interface Post {
  id: string;
  content: string;
  imageUrl?: string;
  authorId: string;
  eventId: string;
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    fullName: string;
    avatar?: string;
  };
  _count: {
    comments: number;
    likes: number;
  };
  isLiked?: boolean;
}

export interface CreatePostData {
  content: string;
  imageUrl?: string;
}

export interface PostsResponse {
  posts: Post[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const postService = {
  // Lấy danh sách posts của một event
  async getEventPosts(eventId: string, page = 1, limit = 20): Promise<PostsResponse> {
    const response = await api.get(`/posts/events/${eventId}`, {
      params: { page, limit }
    });
    return response.data;
  },

  // Tạo post mới (với hỗ trợ upload ảnh)
  async createPost(eventId: string, data: CreatePostData, images?: File[]): Promise<Post> {
    const formData = new FormData();
    formData.append('content', data.content);

    // Add images if provided
    if (images && images.length > 0) {
      images.forEach((image) => {
        formData.append('images', image);
      });
    }

    const response = await api.post(`/posts/events/${eventId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.post;
  },

  // Xóa post
  async deletePost(postId: string): Promise<void> {
    await api.delete(`/posts/${postId}`);
  },

  // Like/Unlike post
  async toggleLike(postId: string): Promise<{ message: string; isLiked: boolean }> {
    const response = await api.post(`/posts/${postId}/like`);
    return response.data;
  }
};
