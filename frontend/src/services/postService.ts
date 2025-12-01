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

  // Tạo post mới
  async createPost(eventId: string, data: CreatePostData): Promise<Post> {
    const response = await api.post(`/posts/events/${eventId}`, data);
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
