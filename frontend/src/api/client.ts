/**
 * API client for TrueSkill AI backend.
 * Fixed version with proper TypeScript types and syntax.
 */

import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';

// Basic type imports
type Get = <T>(url: string, config?: any) => Promise<T>;
type Post = <T>(url: string, data?: any, config?: any) => Promise<T>;

// Response interfaces
export interface ApiError {
  message: string;
  status?: number;
  details?: string;
}

export interface SkillResponse {
  name: string;
  category?: string;
  confidence_score: number;
  authenticity_score: number;
  status: 'Strong' | 'Moderate' | 'Weak';
  evidence?: string;
  level?: string;
}

export interface SkillsSummary {
  total_skills: number;
  strong: number;
  moderate: number;
  weak: number;
  average_confidence: number;
  profile_strength: number;
}

export interface FullProcessResponse {
  user_id?: string;
  skills: SkillResponse[];
  summary: SkillsSummary;
  is_suspicious: boolean;
  fraud_count: number;
  timestamp: string;
  processing_errors: string[];
}

export interface ResumeExtractionResponse {
  raw_text: string;
  metadata: Record<string, any>;
  source_file?: string;
}

export interface MatchScoreResponse {
  score: number;
  explanation: string[];
  matched_skills: string[];
  missing_skills: string[];
  coverage_ratio: number;
}

export interface InterestScoreResponse {
  score: number;
  breakdown: {
    engagement: number;
    depth: number;
    consistency: number;
  };
  metrics: {
    total_messages: number;
    user_messages: number;
    avg_response_length: number;
    session_duration_hours: number;
    questions_asked: number;
  };
}

export interface JobCandidatesResponse {
  job_id: number;
  candidates: Array<{
    candidate_id: number;
    match_score: number;
    interest_score: number;
    combined_score: number;
    matched_skills: string[];
    missing_skills: string[];
  }>;
  total: number;
  limit: number;
  offset: number;
}

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8000';
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 60000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  // Response interceptor for error handling
  private setupInterceptors() {
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        console.error('API Error:', error);
        const responseData = error.response?.data as any;
        return Promise.reject(this.handleError(error));
      }
    );
  }

  private handleError(error: any): ApiError {
    if (error.response) {
      const responseData = error.response?.data as any;
      return {
        message: responseData?.detail || error.message || 'API request failed',
        status: error.response?.status,
        details: responseData?.error || JSON.stringify(responseData),
      };
    } else if (error.request) {
      return {
        message: 'No response from server. Check if backend is running.',
        details: error.message,
      };
    } else {
      return {
        message: error.message || 'Network error occurred',
        details: 'Request failed',
      };
    }
  }

  // Get authentication headers
  private getAuthHeaders(): Record<string, string> {
    const token = localStorage.getItem('access_token');
    const tokenType = localStorage.getItem('token_type') || 'bearer';
    
    if (token) {
      return {
        'Authorization': `${tokenType} ${token}`
      };
    }
    
    return {};
  }

  /**
   * Register a new user.
   */
  async register(
    name: string,
    email: string,
    password: string
  ): Promise<{
    id: number;
    name: string;
    email: string;
    is_active: boolean;
    roles: string[];
    created_at: string;
  }> {
    const response = await this.client.post('/api/auth/register', {
      name,
      email,
      password
    });
    
    return response.data;
  }

  /**
   * Login user and get access token.
   */
  async login(
    email: string,
    password: string
  ): Promise<{
    access_token: string;
    token_type: string;
    expires_in: number;
  }> {
    const response = await this.client.post('/api/auth/login', {
      email,
      password
    });
    
    return response.data;
  }

  /**
   * Get current user information.
   */
  async getCurrentUser(): Promise<{
    id: number;
    name: string;
    email: string;
    is_active: boolean;
    roles: string[];
    created_at: string;
  }> {
    const response = await this.client.get('/api/auth/me', {
      headers: this.getAuthHeaders()
    });
    
    return response.data;
  }

  /**
   * Add role to current user.
   */
  async addRole(role: string): Promise<{
    message: string;
    success: boolean;
  }> {
    const response = await this.client.post('/api/auth/add-role', {
      role
    }, {
      headers: this.getAuthHeaders()
    });
    
    return response.data;
  }

  /**
   * Get user skills.
   */
  async getUserSkills(): Promise<{
    skills: SkillResponse[];
  }> {
    const response = await this.client.get('/api/auth/me/skills', {
      headers: this.getAuthHeaders()
    });
    
    return response.data;
  }

  /**
   * Get candidate scores.
   */
  async getCandidateScores(userId: number): Promise<{
    candidate_id: number;
    average_match_score: number | null;
    match_scores: any[];
    interest_scores: any[];
  }> {
    const response = await this.client.get(`/api/users/${userId}/scores`, {
      headers: this.getAuthHeaders()
    });
    
    return response.data;
  }

  /**
   * Get candidate interest scores.
   */
  async getCandidateInterestScores(userId: number): Promise<{
    average_interest_score: number | null;
    interest_scores: any[];
  }> {
    const response = await this.client.get(`/api/users/${userId}/interest-scores`, {
      headers: this.getAuthHeaders()
    });
    
    return response.data;
  }

  /**
   * Get matched jobs for a candidate.
   */
  async getCandidateJobs(userId: number, limit = 10, offset = 0): Promise<{
    candidate_id: number;
    jobs: any[];
    total: number;
    limit: number;
    offset: number;
  }> {
    const response = await this.client.get(`/api/candidate/${userId}/jobs?limit=${limit}&offset=${offset}`, {
      headers: this.getAuthHeaders()
    });
    
    return response.data;
  }

  /**
   * Get matched candidates for a job.
   */
  async getJobCandidates(jobId: number, limit = 10, offset = 0): Promise<JobCandidatesResponse> {
    const response = await this.client.get(`/api/job/${jobId}/candidates?limit=${limit}&offset=${offset}`, {
      headers: this.getAuthHeaders()
    });
    
    return response.data;
  }

  /**
   * Extract skills from a job description.
   */
  async extractJobSkills(description: string): Promise<{
    required_skills: any[];
    preferred_skills: any[];
  }> {
    const response = await this.client.post('/api/jobs/extract', { description }, {
      headers: this.getAuthHeaders()
    });
    
    return response.data;
  }

  /**
   * Create a new job.
   */
  async createJob(jobData: any): Promise<{
    success: boolean;
    job_id: number;
    message: string;
  }> {
    const response = await this.client.post('/api/jobs', jobData, {
      headers: this.getAuthHeaders()
    });
    
    return response.data;
  }

  /**
   * Logout current user.
   */
  async logout(): Promise<{
    message: string;
    success: boolean;
  }> {
    const response = await this.client.post('/api/auth/logout', {}, {
      headers: this.getAuthHeaders()
    });
    
    return response.data;
  }

  /**
   * Process resume with optional authentication.
   */
  async processResume(file: File): Promise<FullProcessResponse> {
    const formData = new FormData();
    formData.append('file', file);
    
    // Get auth headers - will be empty if no token exists
    const authHeaders = this.getAuthHeaders();
    
    const response = await this.client.post('/api/candidate/full-process', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        ...authHeaders // Include auth headers if available
      },
    });
    
    return response.data;
  }

  /**
   * Add GitHub profile to user account.
   */
  async addGitHubProfile(url: string): Promise<{
    message: string;
    success: boolean;
  }> {
    const response = await this.client.post('/ingestion/github', {
      url
    }, {
      headers: this.getAuthHeaders()
    });
    
    return response.data;
  }

  /**
   * Add competitive programming profiles to user account.
   */
  async addCPProfiles(urls: string[]): Promise<{
    message: string;
    success: boolean;
  }> {
    const response = await this.client.post('/ingestion/cp', {
      urls
    }, {
      headers: this.getAuthHeaders()
    });
    
    return response.data;
  }

  /**
   * Add Kaggle profile to user account.
   */
  async addKaggleProfile(url: string): Promise<{
    message: string;
    success: boolean;
  }> {
    const response = await this.client.post('/ingestion/kaggle', {
      url
    }, {
      headers: this.getAuthHeaders()
    });
    
    return response.data;
  }

  /**
   * Add research profile to user account.
   */
  async addResearchProfile(url: string): Promise<{
    message: string;
    success: boolean;
  }> {
    const response = await this.client.post('/ingestion/research', {
      url
    }, {
      headers: this.getAuthHeaders()
    });
    
    return response.data;
  }

  /**
   * Get user's upload status.
   */
  async getUploadStatus(): Promise<{
    has_resume: boolean;
    has_github: boolean;
    has_kaggle: boolean;
    has_research: boolean;
    resume_uploaded_at: string | null;
    github_connected_at: string | null;
    last_updated: string | null;
  }> {
    const response = await this.client.get('/api/auth/me/upload-status', {
      headers: this.getAuthHeaders()
    });
    
    return response.data;
  }

  /**
   * Extract skills from GitHub repositories.
   */
  async extractGitHubSkills(username: string, token?: string): Promise<{
    status: string;
    message: string;
    skills_count: number;
    languages_found?: number;
    github_username?: string;
    github_url?: string;
  }> {
    const response = await this.client.post('/api/github/extract-skills', {
      github_username: username,
      github_token: token
    }, {
      headers: this.getAuthHeaders()
    });
    
    return response.data;
  }

  /**
   * Get GitHub skills extraction status.
   */
  async getGitHubSkillsStatus(): Promise<{
    status: string;
    github_status: {
      github_skills_extracted: boolean;
      github_url: string | null;
      github_last_extracted: string | null;
      github_connected: boolean;
    };
  }> {
    const response = await this.client.get('/api/github/skills-status', {
      headers: this.getAuthHeaders()
    });
    
    return response.data;
  }

  /**
   * Upload proof of work documents.
   */
  async uploadProofOfWork(files: File[]): Promise<{
    message: string;
    success: boolean;
  }> {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    
    const response = await this.client.post('/ingestion/proof-of-work', formData, {
      headers: this.getAuthHeaders()
    });
    
    return response.data;
  }

  /**
   * Process all external profiles (GitHub, Kaggle, CP) without requiring resume file.
   */
  async processExternalProfiles(): Promise<FullProcessResponse> {
    const response = await this.client.post('/api/candidate/external-process', {}, {
      headers: this.getAuthHeaders()
    });
    
    return response.data;
  }

  /**
   * Health check endpoint.
   */
  async healthCheck(): Promise<{
    status: string;
    service: string;
    timestamp: string;
    version: string;
    uptime: number;
  }> {
    const response = await this.client.get('/', {
      timeout: 5000,
    });
    
    return response.data;
  }

  /**
   * Get available endpoints.
   */
  getApiUrl(): string {
    return (import.meta as any).env?.VITE_API_URL || 'http://localhost:8000';
  }
}

// Export singleton instance
export const apiClient = new ApiClient();