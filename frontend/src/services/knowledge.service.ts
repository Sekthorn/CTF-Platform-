import apiClient from './api';
import {
  KnowledgeLessonListItem,
  KnowledgeLessonDetail,
  KnowledgeProgress,
} from '../types';

export interface GetLessonsParams {
  category?: string;
  difficulty?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedLessonsResponse {
  items: KnowledgeLessonListItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const knowledgeService = {
  /**
   * Fetch paginated list of lessons with user unlock/completion state
   */
  async getLessons(params?: GetLessonsParams): Promise<PaginatedLessonsResponse> {
    const response = await apiClient.get<any>('/knowledge/lessons', {
      params,
    });
    return response.data?.data || response.data;
  },

  /**
   * Fetch full lesson detail by slug
   */
  async getLessonBySlug(slug: string): Promise<KnowledgeLessonDetail> {
    const response = await apiClient.get<any>(`/knowledge/lessons/${slug}`);
    return response.data?.data || response.data;
  },

  /**
   * Mark lesson as completed
   */
  async completeLesson(id: string): Promise<{ success: boolean; message: string; completedAt: string }> {
    const response = await apiClient.post<any>(`/knowledge/lessons/${id}/complete`);
    return response.data?.data || response.data;
  },

  /**
   * Get learning progress analytics
   */
  async getProgress(): Promise<KnowledgeProgress> {
    const response = await apiClient.get<any>('/knowledge/progress');
    return response.data?.data || response.data;
  },

  /**
   * Admin: Create lesson
   */
  async createLesson(data: any): Promise<KnowledgeLessonDetail> {
    const response = await apiClient.post<any>('/knowledge/admin/lessons', data);
    return response.data?.data || response.data;
  },

  /**
   * Admin: Update lesson
   */
  async updateLesson(id: string, data: any): Promise<KnowledgeLessonDetail> {
    const response = await apiClient.patch<any>(`/knowledge/admin/lessons/${id}`, data);
    return response.data?.data || response.data;
  },

  /**
   * Admin: Delete lesson
   */
  async deleteLesson(id: string): Promise<{ success: boolean }> {
    const response = await apiClient.delete<any>(`/knowledge/admin/lessons/${id}`);
    return response.data?.data || response.data;
  },
};

export default knowledgeService;
