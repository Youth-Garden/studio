import type { Node, Edge } from '@xyflow/react';

export interface WorkflowJob {
  id: string;
  status: 'processing' | 'completed' | 'failed' | 'queued';
  title?: string;
  error?: string;
  width?: number;
  height?: number;
  created_at: number;
  output_filename?: string;
  transparent_filename?: string;
  raw_filename?: string;
  node_status?: Record<string, string>;
  progress?: number;
}

export type PreviewTabType = 'output' | 'transparent' | 'raw';
export type SidebarTabType = 'config' | 'history' | 'agent-logs';

export interface AgentDispatchLog {
  id: string;
  timestamp: number;
  caller: string;
  plan_name: string;
  plan_path: string;
  extra_note?: string;
  target_agent: string;
  status: 'processing' | 'success' | 'failed';
  output?: string;
  error?: string;
}

export interface EditorWorkflowData {
  nodes: Node[];
  edges: Edge[];
  selectedNode: Node | null;
  activeJob: WorkflowJob | null;
  historyJobs: WorkflowJob[];
  isExecuting: boolean;
  previewTab: PreviewTabType;
}
