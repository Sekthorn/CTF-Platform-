import apiClient from './api';

export type LabStatus =
  | 'NOT_STARTED'
  | 'STARTING'
  | 'RUNNING'
  | 'STOPPING'
  | 'STOPPED'
  | 'RESETTING'
  | 'EXPIRED'
  | 'FAILED';

export interface LabStatusResponse {
  status: LabStatus;
  instanceId: string | null;
  challengeId?: string;
  challengeSlug?: string;
  targetUrl: string | null;
  startedAt?: string | null;
  expiresAt?: string | null;
  secondsRemaining: number;
}

export const labService = {
  /**
   * Get target URL and environment details for challenge
   */
  async getTarget(challengeId: string): Promise<LabStatusResponse> {
    const response = await apiClient.get<any>(`/labs/${challengeId}/target`);
    return response.data?.data || response.data;
  },

  /**
   * Start or resume a lab instance for a challenge
   */
  async startLab(challengeId: string): Promise<LabStatusResponse> {
    const response = await apiClient.post<any>(`/labs/${challengeId}/start`);
    return response.data?.data || response.data;
  },

  /**
   * Stop an active lab instance
   */
  async stopLab(challengeId: string): Promise<{ success: boolean; status: LabStatus; message: string }> {
    const response = await apiClient.post<any>(`/labs/${challengeId}/stop`);
    return response.data?.data || response.data;
  },

  /**
   * Reset lab instance with fresh target and new dynamic flag
   */
  async resetLab(challengeId: string): Promise<LabStatusResponse> {
    const response = await apiClient.post<any>(`/labs/${challengeId}/reset`);
    return response.data?.data || response.data;
  },

  /**
   * Query current lab status and seconds remaining
   */
  async getStatus(challengeId: string): Promise<LabStatusResponse> {
    const response = await apiClient.get<any>(`/labs/${challengeId}/status`);
    return response.data?.data || response.data;
  },
};

export default labService;
