import { useState, useCallback, useRef, useEffect } from 'react';
import { 
  useNodesState, 
  useEdgesState, 
  addEdge, 
  type Connection, 
  type Node, 
  type Edge 
} from '@xyflow/react';
import { toast } from '../../../shared/components/Toast';
import { API_ENDPOINTS } from '../../../lib/constants';
import { translations, type Locale } from '../../../lib/i18n';
import { useSettingsStore } from '../../../shared/store/settings.store';
import type { PreviewTabType, SidebarTabType } from '../types/editor.types';
import { useWorkflowExecution } from './use-workflow-execution';

export function useEditorWorkflow(initialWorkflowId: string) {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [inspectedNode, setInspectedNode] = useState<any>(null);
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);
  const [previewTab, setPreviewTab] = useState<PreviewTabType>('output');
  const [sidebarTab, setSidebarTab] = useState<SidebarTabType>('config');

  const { locale, setSidebarWidth, setSidebarOpen } = useSettingsStore();
  const t = translations[locale as Locale] || translations.vi;
  const isResizingRef = useRef(false);

  const {
    isExecuting,
    activeJob,
    setActiveJob,
    historyJobs,
    fetchHistory,
    handleExecuteFlow,
  } = useWorkflowExecution(initialWorkflowId, nodes, edges, setNodes, setSidebarTab, setSidebarOpen);

  const enrichNodeData = useCallback((nodeList: Node[]) => {
    return nodeList.map((node) => ({
      ...node,
      data: {
        ...node.data,
        onInspect: (id: string) => {
          const target = nodeList.find((n) => n.id === id);
          if (target) {
            setInspectedNode(target);
            setIsInspectorOpen(true);
          }
        },
        onTestStep: (id: string) => {
          toast.success("Test riêng bước: " + ((node.data as any).title || id), "Đang thực thi test độc lập cho node này...");
        },
        onToggleBypass: (id: string) => {
          setNodes((prev) => prev.map((n) => n.id === id ? { ...n, data: { ...n.data, bypassed: !n.data.bypassed } } : n));
        },
        onDuplicate: (id: string) => {
          const source = nodeList.find((n) => n.id === id);
          if (!source) return;
          const newId = `${source.type}-${Date.now().toString(36)}`;
          setNodes((prev) => [...prev, {
            ...source,
            id: newId,
            position: { x: source.position.x + 40, y: source.position.y + 40 },
            data: { ...source.data, title: `${(source.data as any).title || source.type} (Copy)` },
          }]);
          toast.success("Đã nhân bản node", `Tạo bản sao: ${newId}`);
        },
        onDelete: (id: string) => {
          setNodes((prev) => prev.filter((n) => n.id !== id));
          setEdges((prev) => prev.filter((e) => e.source !== id && e.target !== id));
          toast.show("Đã xóa node", `Xóa node: ${id}`);
        },
        onInlineUpdate: (id: string, key: string, value: any) => {
          setNodes((prev) => prev.map((n) => n.id === id ? { ...n, data: { ...n.data, [key]: value } } : n));
        },
      },
    }));
  }, [setNodes, setEdges]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const fetchWorkflow = useCallback(async (workflowId: string, showToast = false) => {
    try {
      const res = await fetch(`${API_ENDPOINTS.WORKFLOWS}/${workflowId}`);
      if (!res.ok) throw new Error("Không thể tải workflow");
      const data = await res.json();
      setNodes(enrichNodeData(data.nodes || []));
      setEdges(data.edges || []);
      if (showToast) {
        toast.success(t.savedWorkflowNotice, `Đã nạp workflow: ${data.name || workflowId}`);
      }
    } catch {
      toast.error(t.errorSaveNotice, "Không thể tải luồng từ máy chủ.");
    }
  }, [enrichNodeData, setNodes, setEdges, t]);

  useEffect(() => {
    fetchWorkflow(initialWorkflowId);
    fetchHistory();
  }, [initialWorkflowId, fetchWorkflow, fetchHistory]);

  const updateNodeData = useCallback((key: string, value: any) => {
    if (!selectedNode) return;
    setNodes((prevNodes) =>
      prevNodes.map((node) => {
        if (node.id === selectedNode.id) {
          const updated = {
            ...node,
            data: {
              ...node.data,
              [key]: value,
            },
          };
          setSelectedNode(updated);
          return updated;
        }
        return node;
      })
    );
  }, [selectedNode, setNodes]);

  const handleSaveWorkflow = useCallback(async (currentWorkflowId: string) => {
    try {
      const payload = {
        name: "Studio Workflow",
        nodes: nodes.map(({ id, type, position, data }) => {
          const { onInspect, onTestStep, onToggleBypass, onDuplicate, onDelete, onInlineUpdate, ...cleanData } = data as any;
          return { id, type, position, data: cleanData };
        }),
        edges,
      };
      const res = await fetch(`${API_ENDPOINTS.WORKFLOWS}/${currentWorkflowId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) toast.success(t.savedWorkflowNotice, t.savedWorkflowDesc);
      else toast.error(t.errorSaveNotice, t.errorSaveDesc);
    } catch {
      toast.error(t.errorSaveNotice, t.errorSaveDesc);
    }
  }, [nodes, edges, t]);

  const handleExportWorkflow = useCallback(() => {
    const payload = {
      name: "Studio Workflow Export",
      exported_at: new Date().toISOString(),
      nodes: nodes.map(({ id, type, position, data }) => {
        const { onInspect, onTestStep, onToggleBypass, onDuplicate, onDelete, onInlineUpdate, ...cleanData } = data as any;
        return { id, type, position, data: cleanData };
      }),
      edges,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `workflow-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Xuất file JSON thành công", "File đã được tải về máy của bạn.");
  }, [nodes, edges]);

  const copyWebhookCurl = useCallback(() => {
    const curlCommand = `curl -X POST "http://localhost:8000/api/workflow/execute" -H "Content-Type: application/json" -d "{\\"prompt\\":\\"A clean 2.5D game piece\\",\\"width\\":1280,\\"height\\":720,\\"bg_color\\":\\"#1e1e2e\\",\\"model_name\\":\\"birefnet-general\\"}"`;
    navigator.clipboard.writeText(curlCommand);
    toast.success(t.copiedWebhookNotice, t.copiedWebhookDesc);
  }, [t]);

  const startResizing = useCallback((mouseDownEvent: React.MouseEvent) => {
    mouseDownEvent.preventDefault();
    isResizingRef.current = true;
    const handleMouseMove = (mouseMoveEvent: MouseEvent) => {
      if (!isResizingRef.current) return;
      const newWidth = document.body.clientWidth - mouseMoveEvent.clientX;
      if (newWidth >= 280 && newWidth <= 700) setSidebarWidth(newWidth);
    };
    const handleMouseUp = () => {
      isResizingRef.current = false;
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  }, [setSidebarWidth]);

  return {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    selectedNode,
    setSelectedNode,
    inspectedNode,
    isInspectorOpen,
    setIsInspectorOpen,
    isExecuting,
    activeJob,
    setActiveJob,
    historyJobs,
    previewTab,
    setPreviewTab,
    sidebarTab,
    setSidebarTab,
    fetchWorkflow,
    fetchHistory,
    updateNodeData,
    handleSaveWorkflow,
    handleExportWorkflow,
    handleExecuteFlow,
    copyWebhookCurl,
    startResizing,
    setNodes,
  };
}
