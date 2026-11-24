import { useState, useCallback, useEffect } from 'react';
import type { Node, Edge } from '@xyflow/react';
import { toast } from '../../../shared/components/Toast';
import { API_ENDPOINTS } from '../../../lib/constants';
import type { WorkflowJob, SidebarTabType } from '../types/editor.types';

export function useWorkflowExecution(
  workflowId: string,
  nodes: Node[],
  edges: Edge[],
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>,
  setSidebarTab: (tab: SidebarTabType) => void,
  setSidebarOpen: (open: boolean) => void
) {
  const [isExecuting, setIsExecuting] = useState(false);
  const [activeJob, setActiveJob] = useState<WorkflowJob | null>(null);
  const [historyJobs, setHistoryJobs] = useState<WorkflowJob[]>([]);

  const fetchHistory = useCallback(async () => {
    try {
      const res = await fetch(API_ENDPOINTS.JOBS);
      if (res.ok) {
        const data = await res.json();
        setHistoryJobs(data);
        if (data.length > 0 && !activeJob) setActiveJob(data[0]);
      }
    } catch (err) {
      console.error("Lỗi lấy lịch sử chạy:", err);
    }
  }, [activeJob]);

  // Đồng bộ real-time node_status của activeJob lên từng Node trên Canvas
  useEffect(() => {
    if (!activeJob) return;
    setNodes((prevNodes) =>
      prevNodes.map((node, index) => {
        let nodeStatus = activeJob.node_status?.[node.id];
        if (!nodeStatus && activeJob.node_status) {
          if (node.type === 'triggerNode' && activeJob.node_status['node-trigger']) {
            nodeStatus = activeJob.node_status['node-trigger'];
          } else if (node.type === 'agentBuilderNode') {
            nodeStatus = activeJob.node_status['node-gemini'] || (activeJob.status === 'failed' ? 'error' : activeJob.status === 'completed' ? 'success' : undefined);
          } else if (node.type === 'outputNode') {
            nodeStatus = activeJob.node_status['node-output'] || activeJob.node_status['node-banner'] || (activeJob.status === 'completed' ? 'success' : 'idle');
          } else {
            const statusValues = Object.values(activeJob.node_status);
            if (index < statusValues.length) nodeStatus = statusValues[index];
          }
        }
        if (nodeStatus && (node.data as any)?.status !== nodeStatus) {
          return { ...node, data: { ...node.data, status: nodeStatus } };
        }
        return node;
      })
    );
  }, [activeJob, setNodes]);

  // Polling tự động khi job đang xử lý
  useEffect(() => {
    if (!activeJob || (activeJob.status !== 'processing' && activeJob.status !== 'queued')) return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${API_ENDPOINTS.JOBS}/${activeJob.id}`);
        if (res.ok) {
          const updated = await res.json();
          setActiveJob(updated);
          if (updated.status !== 'processing' && updated.status !== 'queued') {
            fetchHistory();
          }
        }
      } catch (err) {
        console.error("Lỗi polling job:", err);
      }
    }, 1500);

    return () => clearInterval(interval);
  }, [activeJob?.id, activeJob?.status, fetchHistory]);

  const handleExecuteFlow = useCallback(async () => {
    setIsExecuting(true);
    // Phản hồi thị giác lập tức: đưa node đầu tiên vào trạng thái running
    setNodes((prev) => prev.map((n, idx) => ({
      ...n,
      data: {
        ...n.data,
        status: (n.type === 'triggerNode' || idx === 0) ? 'running' : 'idle',
      }
    })));
    toast.show("Bắt đầu thực thi", "Đang gửi trigger Webhook chạy toàn bộ luồng...");
    try {
      const triggerNode = nodes.find((n) => n.id === 'node-trigger' || n.type === 'triggerNode');
      const bannerNode = nodes.find((n) => n.id === 'node-banner' || n.type === 'bannerNode');
      const birefnetNode = nodes.find((n) => n.id === 'node-birefnet' || n.type === 'birefnetNode');

      const cleanNodes = nodes.map(({ id, type, position, data }) => {
        const { onInspect, onTestStep, onToggleBypass, onDuplicate, onDelete, onInlineUpdate, ...cleanData } = data as any;
        return { id, type, position, data: cleanData };
      });

      const payload = {
        prompt: (triggerNode?.data as any)?.prompt || "A clean game item asset",
        width: (bannerNode?.data as any)?.width || 1280,
        height: (bannerNode?.data as any)?.height || 720,
        bg_color: (bannerNode?.data as any)?.bgColor || "#1e1e2e",
        model_name: (birefnetNode?.data as any)?.modelName || "birefnet-general",
        workflow_id: workflowId,
        workflow_data: { nodes: cleanNodes, edges },
      };

      const res = await fetch(API_ENDPOINTS.WORKFLOW_EXECUTE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Lỗi mạng khi kích hoạt workflow");
      const job = await res.json();
      setActiveJob(job);
      setSidebarTab('history');
      setSidebarOpen(true);
      fetchHistory();
      toast.success("Khởi tạo tiến trình thành công", `Job ID: ${job.id}`);
    } catch (err: any) {
      toast.error("Thực thi thất bại", err.message || "Không thể kết nối đến máy chủ.");
    } finally {
      setIsExecuting(false);
    }
  }, [nodes, edges, workflowId, setNodes, setSidebarOpen, setSidebarTab, fetchHistory]);

  return {
    isExecuting,
    activeJob,
    setActiveJob,
    historyJobs,
    fetchHistory,
    handleExecuteFlow,
  };
}
