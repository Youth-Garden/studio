import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  ReactFlow, 
  Background, 
  Controls, 
  ControlButton,
  MiniMap,
  useNodesState, 
  useEdgesState, 
  addEdge,
  BackgroundVariant,
  type Connection,
  type Node,
  type Edge
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { 
  Play, 
  Save, 
  RefreshCw, 
  Sliders, 
  Download, 
  CheckCircle2, 
  History,
  AlertCircle,
  Copy,
  RotateCcw,
  Plus,
  FolderKanban,
  Settings
} from 'lucide-react';

import { Icons } from './shared/icons';

import { nodeTypes } from './CustomNodes';
import { Button } from './components/ui/Button';
import { Input, FormField } from './components/ui/Input';
import { Select } from './components/ui/Select';
import { Textarea } from './components/ui/Textarea';
import { Badge } from './components/ui/Badge';
import { StatusBadge } from './components/ui/StatusBadge';
import { Card, CardHeader, CardTitle, CardContent } from './components/ui/Card';
import { Tabs, TabsList, TabsTrigger } from './components/ui/Tabs';
import { Tooltip, TooltipTrigger, TooltipContent } from './components/ui/Tooltip';
import { CodeBlock, CodeBlockHeader, CodeBlockTitle, CodeBlockCopyButton, CodeBlockContent } from './components/ui/CodeBlock';
import { Sheet } from './components/ui/Sheet';
import { Toaster, toast } from './components/ui/Toast';
import { NodePalette, type NodePaletteData } from './components/ui/NodePalette';
import { SettingsModal, type SettingsModalData } from './components/ui/SettingsModal';
import { StudioLogo } from './components/ui/StudioLogo';
import { PortalRenderer } from './shared/components/portal/portal-renderer';
import { usePortal } from './shared/hooks/use-portal';
import { NotificationModal, type ModalData } from './components/ui/NotificationModal';
import { TransitionEffect } from './shared/components/TransitionEffect';
import { translations, type Locale } from './lib/i18n';
import { DashboardView } from './views/DashboardView';
import { useSettingsStore } from './shared/store/settings.store';

export default function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [selectedNode, setSelectedNode] = useState<any>(null);

  // Global Persistent Settings Store (Zustand + LocalStorage)
  const { 
    locale, 
    theme,
    toggleTheme,
    canvasPattern, 
    sidebarWidth, 
    isSidebarOpen, 
    setSidebarWidth, 
    toggleSidebar, 
    setSidebarOpen 
  } = useSettingsStore();
  const t = translations[locale as Locale] || translations.vi;

  // Sidebar controls
  const [sidebarTab, setSidebarTab] = useState<'config' | 'history'>('config');
  const isResizingRef = useRef(false);

  // Workflow Execution & History
  const [isExecuting, setIsExecuting] = useState(false);
  const [activeJob, setActiveJob] = useState<any>(null);
  const [historyJobs, setHistoryJobs] = useState<any[]>([]);
  const [previewTab, setPreviewTab] = useState<'output' | 'transparent' | 'raw'>('output');

  // EzGame Portal Stack Hook
  const [presentNotice] = usePortal<ModalData>(NotificationModal);
  const [presentNodePalette] = usePortal<NodePaletteData>(NodePalette);
  const [presentSettings] = usePortal<SettingsModalData>(SettingsModal);

  // Tự động đồng bộ Route URL (/, /dashboard, /flow/:id)
  const getInitialRoute = () => {
    const path = window.location.pathname;
    if (path.startsWith('/flow/')) {
      const flowId = path.replace('/flow/', '').trim();
      return { view: 'editor' as const, flowId: flowId || 'gemini_banner_pipeline' };
    }
    if (path === '/editor') {
      return { view: 'editor' as const, flowId: 'gemini_banner_pipeline' };
    }
    // Mặc định truy cập vào là Trang Dashboard Hub
    return { view: 'dashboard' as const, flowId: 'gemini_banner_pipeline' };
  };

  const initialRoute = getInitialRoute();

  // View state: 'dashboard' hoặc 'editor'
  const [currentView, setCurrentView] = useState<'dashboard' | 'editor'>(initialRoute.view);

  // Workflow Hub & Node Palette Modal states
  const [currentWorkflowId, setCurrentWorkflowId] = useState(initialRoute.flowId);

  // Cập nhật URL khi chuyển đổi trang
  const navigateToDashboard = () => {
    setCurrentView('dashboard');
    window.history.pushState({}, '', '/dashboard');
  };

  const navigateToEditor = (workflowId: string) => {
    setCurrentView('editor');
    setCurrentWorkflowId(workflowId);
    window.history.pushState({}, '', `/flow/${workflowId}`);
    fetchWorkflow(workflowId);
  };

  // Bắt sự kiện Back / Forward nút trình duyệt (PopState)
  useEffect(() => {
    const handlePopState = () => {
      const route = getInitialRoute();
      setCurrentView(route.view);
      setCurrentWorkflowId(route.flowId);
      if (route.view === 'editor') {
        fetchWorkflow(route.flowId);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Node Inspector Sheet
  const [inspectedNode, setInspectedNode] = useState<any>(null);
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);

  // Gắn các hàm Action Toolbar vào Node Data để CustomNodes gọi
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
          toast.success("Test riêng bước: " + (node.data.title || id), "Đang thực thi test độc lập cho node này...");
        },
        onToggleBypass: (id: string) => {
          setNodes((nds) =>
            nds.map((n) => (n.id === id ? { ...n, data: { ...n.data, isBypassed: !n.data.isBypassed } } : n))
          );
        },
        onDuplicate: (id: string) => {
          const target = nodeList.find((n) => n.id === id);
          if (!target) return;
          const newId = `${target.type}-${Date.now().toString().slice(-4)}`;
          const cloneNode: Node = {
            ...target,
            id: newId,
            position: { x: target.position.x + 30, y: target.position.y + 40 },
            data: { ...target.data, title: `${target.data.title} (Copy)` }
          };
          setNodes((nds) => [...nds, cloneNode]);
          toast.show("Đã nhân bản Node", String(target.data.title || id));
        },
        onDelete: (id: string) => {
          setNodes((nds) => nds.filter((n) => n.id !== id));
          setEdges((eds) => eds.filter((e) => e.source !== id && e.target !== id));
          toast.show("Đã xóa Node", id);
        }
      }
    }));
  }, [setNodes, setEdges]);

  // Fetch Workflow config by ID
  const fetchWorkflow = async (workflowId = currentWorkflowId) => {
    try {
      const res = await fetch(`http://localhost:8000/api/workflows/${workflowId}`);
      if (res.ok) {
        const data = await res.json();
        setNodes(enrichNodeData(data.nodes || []));
        setEdges(data.edges || []);
        setCurrentWorkflowId(workflowId);
      }
    } catch (err) {
      console.error("Lỗi tải workflow:", err);
    }
  };

  // Thêm Node mới từ Palette (hỗ trợ vị trí click chuột)
  const handleAddNodeFromPalette = (type: string, title: string, defaultData: any, customPos?: { x: number; y: number }) => {
    const newId = `node-${type.replace('Node', '')}-${Date.now().toString().slice(-4)}`;
    const newNode: Node = {
      id: newId,
      type,
      position: customPos || { x: 250 + Math.random() * 200, y: 180 + Math.random() * 150 },
      data: {
        ...defaultData,
        title,
        status: 'idle'
      }
    };
    setNodes((nds) => [...enrichNodeData([...nds, newNode])]);
    toast.success("Đã thêm Node mới", title);
  };

  // Export Workflow JSON
  const handleExportWorkflow = () => {
    const flowData = { id: currentWorkflowId, name: "Exported Studio Flow", nodes, edges };
    const blob = new Blob([JSON.stringify(flowData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${currentWorkflowId}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Import Workflow JSON
  const handleImportWorkflow = (flowData: any) => {
    if (flowData.nodes) {
      setNodes(enrichNodeData(flowData.nodes));
      setEdges(flowData.edges || []);
      if (flowData.id) setCurrentWorkflowId(flowData.id);
      presentNotice({
        title: "Import Flow Thành Công",
        description: `Đã nhập sơ đồ gồm ${flowData.nodes.length} nodes.`
      });
    }
  };

  // Fetch Lịch sử chạy (Execution History)
  const fetchHistory = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/jobs');
      if (res.ok) {
        const data = await res.json();
        setHistoryJobs(data || []);
        if (data.length > 0 && !activeJob) {
          setActiveJob(data[0]);
        }
      }
    } catch (err) {
      console.error("Lỗi tải lịch sử jobs:", err);
    }
  };

  useEffect(() => {
    fetchWorkflow();
    fetchHistory();
    const interval = setInterval(fetchHistory, 3000);
    return () => clearInterval(interval);
  }, []);

  // Xử lý kéo thả thay đổi chiều rộng sidebar
  const startResizing = useCallback(() => {
    isResizingRef.current = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';

    const handleMouseMove = (event: MouseEvent) => {
      if (!isResizingRef.current) return;
      const newWidth = window.innerWidth - event.clientX;
      if (newWidth >= 260 && newWidth <= 750) {
        setSidebarWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      isResizingRef.current = false;
      document.body.style.cursor = 'default';
      document.body.style.userSelect = 'auto';
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  }, []);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge({ ...params, animated: true }, eds)),
    [setEdges]
  );

  const handleSaveWorkflow = async () => {
    try {
      await fetch('http://localhost:8000/api/workflow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: "Studio Workflow", nodes, edges })
      });
      toast.success(t.savedWorkflowNotice, t.savedWorkflowDesc);
    } catch (err) {
      toast.error(t.errorSaveNotice, t.errorSaveDesc);
    }
  };

  const handleExecuteFlow = async () => {
    setIsExecuting(true);
    setSidebarTab('history');
    setSidebarOpen(true);

    const triggerNode = nodes.find((n) => n.id === 'node-trigger') || nodes[0];
    const bannerNode = nodes.find((n) => n.id === 'node-banner');

    const payload = {
      prompt: (triggerNode?.data?.prompt as string) || "A fantasy moss rock",
      width: (bannerNode?.data?.width as number) || 1280,
      height: (bannerNode?.data?.height as number) || 720,
      bg_color: (bannerNode?.data?.bgColor as string) || "#1e1e2e",
      contrast: (bannerNode?.data?.contrast as number) || 1.05,
      sharpness: (bannerNode?.data?.sharpness as number) || 1.2
    };

    try {
      const res = await fetch('http://localhost:8000/api/workflow/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      const jobId = data.job_id;

      const interval = setInterval(async () => {
        const jobRes = await fetch(`http://localhost:8000/api/jobs/${jobId}`);
        if (jobRes.ok) {
          const job = await jobRes.json();
          setActiveJob(job);

          // Cập nhật trạng thái viền sáng & icon status trực tiếp trên từng Node
          if (job.node_status) {
            setNodes((nds) =>
              nds.map((n) => ({
                ...n,
                data: {
                  ...n.data,
                  status: job.node_status[n.id] || "idle"
                }
              }))
            );
          }

          if (job.status === 'completed' || job.status === 'failed') {
            clearInterval(interval);
            setIsExecuting(false);
            fetchHistory();
          }
        }
      }, 1000);
    } catch (err) {
      presentNotice({
        title: "Lỗi Thực Thi",
        description: "Không thể gửi lệnh thực thi workflow đến server."
      });
      setIsExecuting(false);
    }
  };

  const updateNodeData = (key: string, value: any) => {
    if (!selectedNode) return;
    setNodes((nds) =>
      nds.map((n) => {
        if (n.id === selectedNode.id) {
          return {
            ...n,
            data: {
              ...n.data,
              [key]: value
            }
          };
        }
        return n;
      })
    );
    setSelectedNode((prev: any) => ({
      ...prev,
      data: {
        ...prev.data,
        [key]: value
      }
    }));
  };

  const copyWebhookCurl = () => {
    const curl = `curl -X POST http://localhost:8000/api/workflow/execute -H "Content-Type: application/json" -d '{"prompt": "fantasy moss rock"}'`;
    navigator.clipboard.writeText(curl);
    toast.success(t.copiedWebhookNotice, t.copiedWebhookDesc);
  };

  return (
    <>
      {currentView === 'dashboard' ? (
        <DashboardView
          currentWorkflowId={currentWorkflowId}
          locale={locale}
          onOpenWorkflow={(id) => navigateToEditor(id)}
          onOpenSettings={() => {
            presentSettings({
              showCloseButton: true,
            });
          }}
          onImportWorkflow={handleImportWorkflow}
        />
      ) : (
        <div className="flex flex-col h-screen w-full bg-[#1b1b1b] text-zinc-200 overflow-hidden font-sans">
          {/* THANH TOP NAVBAR TOÀN PHẦN (CỐ ĐỊNH FULL CHIỀU NGANG, BỎ BORDER DƯỚI) */}
          <header className="h-12 bg-[#1e1e1e] px-4 flex items-center justify-between z-30 shrink-0">
            <div className="flex items-center gap-2.5">
              <StudioLogo size={18} />
              <h1 className="font-semibold text-xs tracking-wide uppercase text-zinc-100">
                {t.title}
              </h1>
              <Badge variant="secondary">{t.engineBadge}</Badge>

              {/* Nút Quay lại Dashboard */}
              <Button
                variant="secondary"
                size="sm"
                onClick={navigateToDashboard}
                className="ml-2 text-xs flex items-center gap-1.5"
              >
                <FolderKanban className="w-3.5 h-3.5" />
                <span>← Dashboard Hub</span>
              </Button>

              {/* Nút Thêm Node mới */}
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  presentNodePalette({
                    onAddNode: handleAddNodeFromPalette,
                  });
                }}
                className="text-xs flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{t.addNode}</span>
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Tooltip>
                <TooltipTrigger>
                  <Button variant="outline" size="sm" onClick={copyWebhookCurl}>
                    <Copy className="w-3.5 h-3.5" />
                    {t.copyWebhook}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">Sao chép cURL trigger Webhook</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger>
                  <Button variant="outline" size="sm" onClick={handleSaveWorkflow}>
                    <Save className="w-3.5 h-3.5" />
                    {t.saveFlow}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">Lưu luồng hiện tại</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger>
                  <Button variant="outline" size="sm" onClick={handleExportWorkflow}>
                    <Download className="w-3.5 h-3.5" />
                    Xuất JSON
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">Xuất file JSON của sơ đồ luồng</TooltipContent>
              </Tooltip>

              <Button variant="default" size="sm" onClick={handleExecuteFlow} disabled={isExecuting}>
                {isExecuting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    {t.running}
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    {t.runWorkflow}
                  </>
                )}
              </Button>

              {/* Nút Toggle Theme Sáng / Tối */}
              <Tooltip>
                <TooltipTrigger>
                  <Button
                    variant="outline"
                    size="icon-sm"
                    onClick={toggleTheme}
                    className="text-zinc-300 hover:text-zinc-100 hover:border-zinc-600 transition-all"
                  >
                    <Icons name={theme === 'light' ? "moon" : "sun"} size={13} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  {theme === 'light' ? "Chuyển sang giao diện Tối" : "Chuyển sang giao diện Sáng"}
                </TooltipContent>
              </Tooltip>

              {/* Divider rõ nét hơn */}
              <div className="h-4 w-px bg-zinc-700/80 mx-1.5" />

              {/* Nút Đóng / Mở Sidebar tối giản dạng mũi tên icon-only kèm tooltip & shimmer */}
              <Tooltip>
                <TooltipTrigger>
                  <Button 
                    variant="outline"
                    size="icon-sm" 
                    shimmer
                    onClick={toggleSidebar}
                    className="text-zinc-300 hover:text-zinc-100 hover:border-zinc-600 transition-all duration-150"
                  >
                    <Icons 
                      name={isSidebarOpen ? "chevron-right" : "chevron-left"} 
                      size={12} 
                      className="text-zinc-300 transition-transform" 
                    />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  {isSidebarOpen ? "Đóng bảng cấu hình" : "Mở bảng cấu hình"}
                </TooltipContent>
              </Tooltip>
            </div>
          </header>

          {/* KHÔNG GIAN BÊN DƯỚI HEADER (CHỨA CANVAS VÀ SIDEBAR NẰM BÊN DƯỚI) */}
          <div className="flex flex-1 w-full h-[calc(100vh-3rem)] overflow-hidden relative">
            {/* KHU VỰC CANVAS REACT FLOW */}
            <div className="flex-1 h-full relative overflow-hidden">
              <div 
                className="w-full h-full relative"
                onContextMenu={(e) => {
                  e.preventDefault();
                  const bounds = e.currentTarget.getBoundingClientRect();
                  const clickPos = {
                    x: Math.round(e.clientX - bounds.left),
                    y: Math.round(e.clientY - bounds.top)
                  };
                  presentNodePalette({
                    onAddNode: (type, title, data) => handleAddNodeFromPalette(type, title, data, clickPos)
                  });
                }}
              >
                <ReactFlow
                  nodes={nodes}
                  edges={edges}
                  onNodesChange={onNodesChange}
                  onEdgesChange={onEdgesChange}
                  onConnect={onConnect}
                  nodeTypes={nodeTypes}
                  onNodeClick={(_, node) => {
                    setSelectedNode(node);
                    setSidebarTab('config');
                    setSidebarOpen(true);
                  }}
                  fitView
                  className="bg-[#1b1b1b]"
                >
                  {canvasPattern !== 'none' && (
                    <Background 
                      variant={
                        canvasPattern === 'dots' 
                          ? BackgroundVariant.Dots 
                          : canvasPattern === 'lines' 
                          ? BackgroundVariant.Lines 
                          : BackgroundVariant.Cross
                      }
                      color="#2e2e2e" 
                      gap={20} 
                      size={canvasPattern === 'cross' ? 6 : 1} 
                    />
                  )}
                  <Controls className="bg-[#262626] border border-zinc-800 text-zinc-300 fill-zinc-300">
                    <ControlButton
                      onClick={() => {
                        presentSettings({
                          showCloseButton: true,
                        });
                      }}
                      title={t.settings}
                      aria-label={t.settings}
                    >
                      <Settings className="w-3.5 h-3.5 text-zinc-300 hover:text-zinc-100" />
                    </ControlButton>
                  </Controls>
                  <MiniMap 
                    nodeColor="#525252" 
                    maskColor="rgba(27, 27, 27, 0.85)" 
                    className="bg-[#262626] border border-zinc-800 rounded-md" 
                  />
                </ReactFlow>
              </div>
            </div>

            {/* THANH KÉO RESIZE (RESIZABLE SPLITTER) */}
            {isSidebarOpen && (
              <div
                onMouseDown={startResizing}
                className="w-1.5 h-full bg-zinc-900 hover:bg-zinc-700 active:bg-zinc-500 cursor-col-resize z-30 transition-colors flex items-center justify-center select-none"
                title="Kéo sang trái/phải để chỉnh độ rộng Sidebar"
              >
                <div className="w-0.5 h-6 bg-zinc-600 rounded-full" />
              </div>
            )}

            {/* CỘT PHẢI: BẢNG CẤU HÌNH NODE & LỊCH SỬ CHẠY OUTPUT (BỎ BORDER TRÁI) */}
            <div 
              style={{ width: isSidebarOpen ? `${sidebarWidth}px` : '0px' }}
              className={`h-full bg-[#1b1b1b] flex flex-col z-20 shrink-0 transition-[width] duration-300 ease-in-out ${
                isSidebarOpen ? 'overflow-hidden' : 'overflow-hidden pointer-events-none'
              }`}
            >
              <TransitionEffect
                show={isSidebarOpen}
                enter="opacity-0 translate-x-2"
                enterActive="opacity-100 translate-x-0 transition-all duration-250 ease-out"
                exit="opacity-100 translate-x-0"
                exitActive="opacity-0 translate-x-2 transition-all duration-150 ease-in"
                duration={150}
                className="h-full flex flex-col w-full"
                style={{ width: `${sidebarWidth}px` }}
              >
                {/* Header Tab của Sidebar (Nằm bên dưới Header chính) */}
                <div className="h-11 px-3 flex items-center justify-between shrink-0 bg-[#212121]">
                  <Tabs value={sidebarTab} onValueChange={(v) => setSidebarTab(v as any)} className="w-full">
                    <TabsList className="w-full">
                      <TabsTrigger value="config" className="flex-1 gap-1.5 py-1">
                        <Sliders className="w-3.5 h-3.5" />
                        <span>{t.sidebarConfig}</span>
                      </TabsTrigger>
                      <TabsTrigger value="history" className="flex-1 gap-1.5 py-1">
                        <History className="w-3.5 h-3.5" />
                        <span>{t.sidebarHistory} ({historyJobs.length})</span>
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>

                {/* Nội dung Sidebar (Cuộn dọc độc lập, cố định gutter để không bị nhảy layout) */}
                <div className="flex-1 overflow-y-auto [scrollbar-gutter:stable]">

        {/* TAB 1: CẤU HÌNH NODE */}
        {sidebarTab === 'config' && (
          <div className="flex-1 p-4 space-y-4 text-xs">
            {selectedNode ? (
              <Card>
                <CardHeader className="pb-3 border-b border-zinc-800">
                  <div className="flex justify-between items-center">
                    <CardTitle>{selectedNode.data.title || selectedNode.id}</CardTitle>
                    <Badge variant="outline">{selectedNode.type}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-3 space-y-3">
                  {/* Node Trigger Form */}
                  {selectedNode.id === 'node-trigger' && (
                    <div className="space-y-2">
                      <label className="text-[11px] text-zinc-400 font-medium">Prompt Gemini:</label>
                      <Textarea
                        rows={5}
                        value={selectedNode.data.prompt || ''}
                        onChange={(e) => updateNodeData('prompt', e.target.value)}
                      />
                      <div className="text-[10px] text-zinc-400 pt-1">
                        Endpoint: <code className="text-zinc-200 font-mono">POST /api/workflow/execute</code>
                      </div>
                    </div>
                  )}

                  {/* Node Banner Form */}
                  {selectedNode.id === 'node-banner' && (
                    <div className="space-y-3">
                      <FormField label="Preset Kích thước:">
                        <Select
                          value={selectedNode.data.preset || 'youtube_thumbnail'}
                          onValueChange={(val) => {
                            if (val === 'youtube_thumbnail') { updateNodeData('width', 1280); updateNodeData('height', 720); }
                            else if (val === 'fhd_banner') { updateNodeData('width', 1920); updateNodeData('height', 1080); }
                            else if (val === 'square_post') { updateNodeData('width', 1080); updateNodeData('height', 1080); }
                            updateNodeData('preset', val);
                          }}
                          options={[
                            { value: 'youtube_thumbnail', label: 'YouTube Thumbnail (1280x720)' },
                            { value: 'fhd_banner', label: 'Full HD (1920x1080)' },
                            { value: 'square_post', label: 'Square (1080x1080)' },
                          ]}
                        />
                      </FormField>

                      <div className="space-y-1">
                        <label className="text-[11px] text-zinc-400 font-medium">Màu nền Banner:</label>
                        <div className="flex items-center gap-2">
                          <input 
                            type="color" 
                            value={selectedNode.data.bgColor || '#1e1e2e'}
                            onChange={(e) => updateNodeData('bgColor', e.target.value)}
                            className="w-7 h-7 rounded border border-zinc-700 bg-transparent cursor-pointer"
                          />
                          <Input
                            value={selectedNode.data.bgColor || '#1e1e2e'}
                            onChange={(e) => updateNodeData('bgColor', e.target.value)}
                            className="font-mono text-[11px]"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Node Gemini Form */}
                  {selectedNode.type === 'geminiNode' && (
                    <div className="space-y-2">
                      <FormField 
                        label="Cổng Chrome Remote Debugging (CDP):"
                        description="Mặc định: 9222 (Chrome attach session)"
                      >
                        <Input
                          type="number"
                          value={selectedNode.data.port || 9222}
                          onChange={(e) => updateNodeData('port', parseInt(e.target.value) || 9222)}
                          className="font-mono text-xs"
                        />
                      </FormField>
                    </div>
                  )}

                  {/* Node BiRefNet Form */}
                  {(selectedNode.id === 'node-birefnet' || selectedNode.type === 'birefnetNode') && (
                    <div className="space-y-2">
                      <FormField label="Model AI Tách nền:">
                        <Select
                          value={selectedNode.data.modelName || 'birefnet-general'}
                          onValueChange={(val) => updateNodeData('modelName', val)}
                          options={[
                            { 
                              value: 'birefnet-general', 
                              label: 'BiRefNet (SOTA 2024 - Khuyên dùng)',
                              description: 'Độ chính xác cao nhất, tách tóc và biên mờ mịn màng'
                            },
                            { 
                              value: 'isnet-general-use', 
                              label: 'IS-Net DIS',
                              description: 'Model nhẹ, tốc độ suy luận nhanh'
                            },
                          ]}
                        />
                      </FormField>
                    </div>
                  )}

                  {/* Thông số JSON Runtime Inspector ngay trên Sidebar dùng chuẩn CodeBlock */}
                  <div className="pt-2 border-t border-zinc-800/80 space-y-1.5">
                    <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Thông số Runtime JSON:</label>
                    <CodeBlock size="sm" className="max-h-48">
                      <CodeBlockHeader className="py-1 px-2.5">
                        <CodeBlockTitle>data.json</CodeBlockTitle>
                        <CodeBlockCopyButton value={JSON.stringify(selectedNode.data, null, 2)} />
                      </CodeBlockHeader>
                      <CodeBlockContent className="p-2.5 text-[10px] max-h-36">
                        {JSON.stringify(selectedNode.data, null, 2)}
                      </CodeBlockContent>
                    </CodeBlock>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="p-5 text-center text-zinc-400 space-y-2">
                <Sliders className="w-5 h-5 mx-auto text-zinc-500" />
                <p>Click vào một Node bất kỳ trên sơ đồ để chỉnh sửa thông số.</p>
              </Card>
            )}
          </div>
        )}

        {/* TAB 2: LỊCH SỬ CHẠY OUTPUT & SO SÁNH RAW (EXECUTION HISTORY) */}
        {sidebarTab === 'history' && (
          <div className="flex-1 p-4 space-y-4 text-xs">
            {/* Chi tiết Job đang chọn xem */}
            {activeJob ? (
              <Card className="space-y-3 p-3">
                <div className="flex items-center justify-between">
                  <div className="truncate pr-2">
                    <p className="font-semibold text-zinc-100 text-xs truncate">{activeJob.title}</p>
                    <p className="text-[10px] text-zinc-500 font-mono">ID: {activeJob.id}</p>
                  </div>
                  <StatusBadge status={activeJob.status} />
                </div>

                {/* Hiển thị chi tiết lỗi nếu Job bị Failed */}
                {activeJob.status === 'failed' && activeJob.error && (
                  <div className="p-2.5 bg-red-950/30 border border-red-900/50 rounded text-[11px] text-red-300 space-y-1">
                    <p className="font-semibold flex items-center gap-1 text-red-400">
                      <AlertCircle className="w-3.5 h-3.5" />
                      Nguyên nhân lỗi:
                    </p>
                    <p className="font-mono text-[10px] leading-relaxed break-words whitespace-pre-wrap text-red-300/90">
                      {activeJob.error}
                    </p>
                  </div>
                )}

                {/* Tabs xem 3 định dạng: Banner Output / BiRefNet Transparent / Raw Gemini */}
                <Tabs value={previewTab} onValueChange={(v) => setPreviewTab(v as any)} className="w-full">
                  <TabsList className="w-full">
                    <TabsTrigger value="output" className="flex-1" title={`Banner (${activeJob.width}x${activeJob.height})`}>
                      Banner
                    </TabsTrigger>
                    <TabsTrigger value="transparent" className="flex-1" title="Ảnh tách nền PNG">
                      Tách nền
                    </TabsTrigger>
                    <TabsTrigger value="raw" className="flex-1" title="Ảnh gốc Raw từ Gemini">
                      Ảnh Raw
                    </TabsTrigger>
                  </TabsList>
                </Tabs>

                {/* Khung hiển thị ảnh Preview - phẳng, không border thừa */}
                <div className={`rounded overflow-hidden min-h-[180px] flex items-center justify-center ${
                  previewTab === 'transparent' ? 'checkerboard-bg' : 'bg-zinc-950'
                }`}>
                  {previewTab === 'output' && activeJob.output_filename && (
                    <img
                      src={`http://localhost:8000/media/output/${activeJob.output_filename}`}
                      alt="Banner Output"
                      className="w-full object-contain max-h-[260px]"
                    />
                  )}
                  {previewTab === 'transparent' && activeJob.transparent_filename && (
                    <img
                      src={`http://localhost:8000/media/transparent/${activeJob.transparent_filename}`}
                      alt="BiRefNet Transparent"
                      className="w-full object-contain max-h-[260px]"
                    />
                  )}
                  {previewTab === 'raw' && activeJob.raw_filename && (
                    <img
                      src={`http://localhost:8000/media/raw/${activeJob.raw_filename}`}
                      alt="Raw Input"
                      className="w-full object-contain max-h-[260px]"
                    />
                  )}
                </div>

                {/* Các nút tiện ích: Tải về / Mở link trực tiếp - Đồng bộ chung variant="secondary" */}
                <div className="flex items-center gap-2 pt-1">
                  {activeJob.output_filename && (
                    <a
                      href={`http://localhost:8000/media/output/${activeJob.output_filename}`}
                      download
                      className="flex-1"
                    >
                      <Button variant="secondary" size="sm" className="w-full gap-1.5 text-[11px]">
                        <Download className="w-3.5 h-3.5 shrink-0" />
                        <span>Tải Banner</span>
                      </Button>
                    </a>
                  )}
                  {activeJob.transparent_filename && (
                    <a
                      href={`http://localhost:8000/media/transparent/${activeJob.transparent_filename}`}
                      download
                      className="flex-1"
                    >
                      <Button variant="secondary" size="sm" className="w-full gap-1.5 text-[11px]">
                        <Download className="w-3.5 h-3.5 shrink-0" />
                        <span>Tải PNG Tách Nền</span>
                      </Button>
                    </a>
                  )}
                </div>
              </Card>
            ) : (
              <Card className="p-4 text-center text-zinc-400">
                {t.selectNodeHint}
              </Card>
            )}

            {/* Danh sách các lần chạy trước (Execution Run List) - Bỏ border-b thô */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between text-zinc-400 pb-1">
                <span className="font-medium text-[11px] uppercase tracking-wider">{t.historyTitle}</span>
                <Button variant="ghost" size="icon" onClick={fetchHistory} className="h-6 w-6">
                  <RotateCcw className="w-3 h-3 text-zinc-400" />
                </Button>
              </div>

              <div className="space-y-1.5 max-h-[300px] overflow-y-auto pr-1">
                {historyJobs.map((job) => (
                  <Card
                    key={job.id}
                    role="button"
                    tabIndex={0}
                    variant="solid"
                    active={activeJob?.id === job.id}
                    onClick={() => setActiveJob(job)}
                    className="p-2.5 rounded transition-colors cursor-pointer flex items-center justify-between"
                  >
                    <div className="truncate pr-2">
                      <p className="font-medium text-zinc-200 truncate text-[11px]">{job.title}</p>
                      <p className="text-[10px] text-zinc-500 font-mono">
                        {new Date(job.created_at * 1000).toLocaleTimeString()} • {job.width}x{job.height}
                      </p>
                    </div>
                    {job.status === 'completed' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                    {job.status === 'processing' && <RefreshCw className="w-3.5 h-3.5 text-zinc-400 animate-spin shrink-0" />}
                    {job.status === 'failed' && <AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />}
                  </Card>
                ))}
              </div>
            </div>
          </div>
        )}
                </div>
              </TransitionEffect>
            </div>
          </div>
        </div>
      )}

      {/* Mount EzGame Portal Renderer tại Root (Toàn bộ Modal, FlowHub, NodePalette render tập trung tại đây) */}
      <PortalRenderer />
      
      {/* Node Inspector Sheet (Soi dữ liệu chi tiết Input / Output JSON của từng Node) */}
      <Sheet
        isOpen={isInspectorOpen}
        onClose={() => setIsInspectorOpen(false)}
        title={inspectedNode ? `Node Inspector: ${inspectedNode.data?.title || inspectedNode.id}` : "Node Inspector"}
        description="Chi tiết dữ liệu cấu hình và trạng thái runtime của Node"
      >
        {inspectedNode && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <span className="font-mono text-zinc-400 text-xs">ID: {inspectedNode.id}</span>
              <StatusBadge status={inspectedNode.data?.status || 'idle'} />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-zinc-300">Thông số cấu hình (Config):</label>
              <CodeBlock size="sm" className="max-h-60">
                <CodeBlockHeader className="py-1 px-3">
                  <CodeBlockTitle>config.json</CodeBlockTitle>
                  <CodeBlockCopyButton value={JSON.stringify(inspectedNode.data, null, 2)} />
                </CodeBlockHeader>
                <CodeBlockContent className="p-3 text-[11px] max-h-48">
                  {JSON.stringify(inspectedNode.data, null, 2)}
                </CodeBlockContent>
              </CodeBlock>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-zinc-300">Tọa độ trên Canvas:</label>
              <div className="p-2.5 bg-zinc-950 border border-zinc-800 rounded text-xs font-mono text-zinc-400 flex gap-4">
                <span>X: {Math.round(inspectedNode.position?.x || 0)}px</span>
                <span>Y: {Math.round(inspectedNode.position?.y || 0)}px</span>
              </div>
            </div>

            <div className="p-3 bg-zinc-900/60 border border-zinc-800/80 rounded text-[11px] text-zinc-400 space-y-1">
              <p className="font-medium text-zinc-300">💡 Gợi ý Auto Flow:</p>
              <p>Node này nhận dữ liệu tự động từ các dây nối trước đó và truyền kết quả cho các node kế tiếp qua DAG Runner.</p>
            </div>
          </div>
        )}
      </Sheet>

      {/* Toast Notification Container */}
      <Toaster />
    </>
  );
}
