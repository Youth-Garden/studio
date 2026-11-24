import { useState, useEffect } from 'react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { Tooltip, TooltipTrigger, TooltipContent } from '../components/ui/Tooltip';
import { Icons } from '../shared/icons';
import { translations, type Locale } from '../lib/i18n';
import { API_ENDPOINTS } from '../lib/constants';
import { useSettingsStore } from '../shared/store/settings.store';
import type { WorkflowItem } from '../components/ui/FlowHubModal';

interface DashboardViewProps {
  currentWorkflowId: string;
  locale: Locale;
  onOpenWorkflow: (id: string) => void;
  onOpenSettings: () => void;
  onImportWorkflow: (flowData: any) => void;
}

export function DashboardView({
  currentWorkflowId,
  locale,
  onOpenWorkflow,
  onOpenSettings,
  onImportWorkflow,
}: DashboardViewProps) {
  const { theme, toggleTheme } = useSettingsStore();
  const [workflows, setWorkflows] = useState<WorkflowItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [newFlowName, setNewFlowName] = useState('');
  const t = translations[locale] || translations.vi;

  const fetchWorkflows = async () => {
    try {
      const res = await fetch(API_ENDPOINTS.WORKFLOWS);
      if (res.ok) {
        const list = await res.json();
        setWorkflows(list);
      }
    } catch (err) {
      console.error("Lỗi tải danh sách workflows:", err);
    }
  };

  useEffect(() => {
    fetchWorkflows();
  }, []);

  const handleCreateNew = async () => {
    if (!newFlowName.trim()) return;
    const newId = `flow_${Date.now().toString().slice(-6)}`;
    const newFlow = {
      id: newId,
      name: newFlowName.trim(),
      description: "Workflow tùy chỉnh",
      nodes: [
        {
          id: `node-trigger-${Date.now()}`,
          type: "triggerNode",
          position: { x: 100, y: 200 },
          data: { title: "1. Trigger / Input", prompt: "A futuristic cyberpunk city" }
        }
      ],
      edges: []
    };

    try {
      await fetch(`http://localhost:8000/api/workflows/${newId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newFlow)
      });
      setNewFlowName('');
      setIsCreating(false);
      fetchWorkflows();
      onOpenWorkflow(newId);
    } catch (err) {
      console.error("Lỗi tạo workflow:", err);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (id === 'gemini_banner_pipeline') {
      alert("Không thể xóa workflow mặc định của hệ thống.");
      return;
    }
    if (!confirm("Bạn có chắc chắn muốn xóa Workflow này?")) return;

    try {
      await fetch(`http://localhost:8000/api/workflows/${id}`, {
        method: 'DELETE'
      });
      fetchWorkflows();
    } catch (err) {
      console.error("Lỗi xóa workflow:", err);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const flowData = JSON.parse(event.target?.result as string);
        onImportWorkflow(flowData);
      } catch (err) {
        alert("File JSON không hợp lệ!");
      }
    };
    reader.readAsText(file);
  };

  const filteredWorkflows = workflows.filter((w) =>
    w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    w.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#18181b] text-zinc-100 flex flex-col font-sans select-none">
      {/* Top Header - Bỏ border dưới, chuyển sang nền phẳng tinh tế */}
      <header className="h-14 bg-[#1e1e1e] px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Logo Studio Flow Hub độc quyền tự động generate - bỏ border */}
          <div className="w-8 h-8 rounded-lg bg-[#262628] flex items-center justify-center">
            <Icons name="logo" size={18} />
          </div>
          <div>
            <h1 className="font-semibold text-sm tracking-wide text-zinc-100">{t.title} HUB</h1>
            <p className="text-[10px] text-zinc-400">{t.dashboardTitle}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Nút Toggle Theme Sáng / Tối trực tiếp trên Dashboard */}
          <Tooltip>
            <TooltipTrigger>
              <Button
                variant="secondary"
                size="sm"
                onClick={toggleTheme}
                className="text-xs gap-1.5"
              >
                <Icons name={theme === 'light' ? "moon" : "sun"} size={14} className="text-zinc-400" />
                <span>{theme === 'light' ? "Giao diện Tối" : "Giao diện Sáng"}</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              {theme === 'light' ? "Chuyển sang giao diện Tối" : "Chuyển sang giao diện Sáng"}
            </TooltipContent>
          </Tooltip>

          {/* Nút Cài đặt - đồng bộ variant secondary với Import JSON */}
          <Tooltip>
            <TooltipTrigger>
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={onOpenSettings}
                className="text-xs gap-1.5"
              >
                <Icons name="settings" size={14} className="text-zinc-400" />
                <span>{t.settings}</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              Tùy chỉnh ngôn ngữ, lưới nền và chủ đề giao diện
            </TooltipContent>
          </Tooltip>

          {/* Import JSON */}
          <label className="cursor-pointer">
            <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
            <Button variant="secondary" size="sm" type="button" className="gap-1.5 text-xs pointer-events-none">
              <Icons name="upload" size={14} className="text-zinc-400" />
              Import JSON
            </Button>
          </label>

          {/* Nút Tạo Mới */}
          <Button 
            variant="default" 
            size="sm" 
            onClick={() => setIsCreating(true)} 
            className="gap-1.5 text-xs"
          >
            <Icons name="plus" size={14} className="text-zinc-900" />
            {t.createNewWorkflow}
          </Button>
        </div>
      </header>

      {/* Main Content Dashboard */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-6 space-y-6">
        {/* Banner Tổng Quan Metric - Bỏ viền quanh card & icon container */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="p-4 bg-[#202022] flex items-center gap-4">
            <div className="p-2.5 rounded-lg bg-[#28282a] text-zinc-300">
              <Icons name="check-circle-2" size={16} className="text-zinc-300" />
            </div>
            <div>
              <p className="text-xs text-zinc-400">Tổng Workflows Sẵn Sàng</p>
              <h3 className="text-lg font-semibold text-zinc-100">{workflows.length}</h3>
            </div>
          </Card>

          <Card className="p-4 bg-[#202022] flex items-center gap-4">
            <div className="p-2.5 rounded-lg bg-[#28282a] text-zinc-300">
              <Icons name="bot" size={16} className="text-zinc-300" />
            </div>
            <div>
              <p className="text-xs text-zinc-400">Gemini CDP + BiRefNet Engine</p>
              <h3 className="text-lg font-semibold text-zinc-100 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Online
              </h3>
            </div>
          </Card>

          <Card className="p-4 bg-[#202022] flex items-center gap-4">
            <div className="p-2.5 rounded-lg bg-[#28282a] text-zinc-300">
              <Icons name="sparkles" size={16} className="text-zinc-300" />
            </div>
            <div>
              <p className="text-xs text-zinc-400">Topological Sort DAG</p>
              <h3 className="text-lg font-semibold text-zinc-100">Kahn Parallel</h3>
            </div>
          </Card>
        </div>

        {/* Input tạo nhanh workflow */}
        {isCreating && (
          <div className="flex items-center gap-2 p-3 bg-[#242426] border border-zinc-700/80 rounded-lg shadow-lg">
            <Input
              value={newFlowName}
              onChange={(e) => setNewFlowName(e.target.value)}
              placeholder={t.newWorkflowPlaceholder}
              className="text-xs flex-1 bg-zinc-900 border-zinc-700"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreateNew();
                if (e.key === 'Escape') setIsCreating(false);
              }}
            />
            <Button variant="default" size="sm" onClick={handleCreateNew}>
              {t.createAndOpen}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setIsCreating(false)}>
              {t.cancel}
            </Button>
          </div>
        )}

        {/* Thanh Tìm Kiếm và Filter */}
        <div className="flex items-center justify-between pt-2">
          <div className="relative w-72">
            <Icons name="search" size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.searchWorkflow}
              className="pl-8 text-xs bg-[#202022] border-zinc-800"
            />
          </div>
          <div className="text-xs text-zinc-400">
            {t.workflowsCount.replace('{count}', String(filteredWorkflows.length))}
          </div>
        </div>

        {/* Danh sách Workflows Card Grid - Phẳng, không viền border quanh card, dùng nền phân tách hiện đại */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredWorkflows.map((flow) => {
            const isCurrent = flow.id === currentWorkflowId;
            return (
              <Card
                key={flow.id}
                onClick={() => onOpenWorkflow(flow.id)}
                isActive={isCurrent}
                variant={isCurrent ? undefined : "interactive"}
                className={`p-5 flex flex-col justify-between hover:shadow-lg transition-all ${
                  isCurrent ? 'bg-[#202022]' : 'bg-[#202022]'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm text-zinc-100 flex items-center gap-2 truncate">
                      <Icons name="workflow" size={16} className="shrink-0 text-zinc-400" />
                      {flow.name}
                    </span>
                    {isCurrent && (
                      <Badge variant="secondary" className="text-[10px] bg-zinc-800 text-zinc-300 font-medium px-2 py-0.5">
                        {t.lastOpened}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                    {flow.description || "Quy trình xử lý tự động studio."}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-zinc-800/40 flex items-center justify-between text-[11px] text-zinc-400">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1 text-zinc-400">
                      <Icons name="layers" size={12} className="text-zinc-500" />
                      {t.nodesCount.replace('{count}', String(flow.nodesCount))}
                    </span>
                    <span>•</span>
                    <span className="text-zinc-400">{t.edgesCount.replace('{count}', String(flow.edgesCount))}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {flow.id !== 'gemini_banner_pipeline' && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => handleDelete(e, flow.id)}
                        className="h-6 w-6 text-zinc-400 hover:text-red-400 hover:bg-zinc-800"
                        title="Xóa Workflow"
                      >
                        <Icons name="trash-2" size={12} />
                      </Button>
                    )}
                    <span className="text-zinc-300 font-medium flex items-center gap-0.5 group-hover:text-zinc-100 transition-colors">
                      Mở Editor <Icons name="arrow-right" size={12} className="ml-0.5" />
                    </span>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </main>
    </div>
  );
}
