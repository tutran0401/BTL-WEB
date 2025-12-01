import api from '../lib/api';

export interface Comment {
  id: string;
  content: string;
  authorId: string;
  postId: string;
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    fullName: string;
    avatar?: string;
  };
}

export interface CreateCommentData {
  content: string;
}

export interface CommentsResponse {
  comments: Comment[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const commentService = {
  // Lấy danh sách comments của một post
  async getPostComments(postId: string, page = 1, limit = 50): Promise<CommentsResponse> {
    const response = await api.get(`/comments/posts/${postId}`, {
      params: { page, limit }
    });
    return response.data;
  },

  // Tạo comment mới
  async createComment(postId: string, data: CreateCommentData): Promise<Comment> {
    const response = await api.post(`/comments/posts/${postId}`, data);
    return response.data.comment;
  },

  // Xóa comment
  async deleteComment(commentId: string): Promise<void> {
    await api.delete(`/comments/${commentId}`);
  }
};
