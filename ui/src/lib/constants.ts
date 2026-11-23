export const API_BASE_URL = 'http://localhost:8000';

export const API_ENDPOINTS = {
  WORKFLOW: `${API_BASE_URL}/api/workflow`,
  WORKFLOWS: `${API_BASE_URL}/api/workflows`,
  WORKFLOW_EXECUTE: `${API_BASE_URL}/api/workflow/execute`,
  JOBS: `${API_BASE_URL}/api/jobs`,
  MEDIA_OUTPUT: `${API_BASE_URL}/media/output`,
  MEDIA_TRANSPARENT: `${API_BASE_URL}/media/transparent`,
  MEDIA_RAW: `${API_BASE_URL}/media/raw`,
} as const;

export const CANVAS_CONFIG = {
  DEFAULT_SIDEBAR_WIDTH: 380,
  MIN_SIDEBAR_WIDTH: 260,
  MAX_SIDEBAR_WIDTH: 750,
  DEFAULT_PATTERN: 'dots' as const,
  HISTORY_POLL_INTERVAL_MS: 3000,
} as const;
