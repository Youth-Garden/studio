import { useState, useEffect } from 'react';
import { 
  Plus, 
  Workflow, 
  Download, 
  Upload, 
  Trash2, 
  ArrowRight,
  Layers,
  X
} from 'lucide-react';
import { Button } from './Button';
import { Input } from './Input';
import { Badge } from './Badge';
import { Card } from './Card';
import type { PortalProps } from '../../shared/types/portal.types';

export interface WorkflowItem {
  id: string;
  name: string;
  description: string;
  nodesCount: number;
  edgesCount: number;
  updated_at: number;
}

export interface FlowHubData {
  currentWorkflowId: string;
  onSelectWorkflow: (id: string) => void;
  onImportWorkflow: (flowData: any) => void;
  onExportWorkflow: () => void;
  showCloseButton?: boolean;
}

export function FlowHubModal({
  onDismiss,
  data,
}: PortalProps<FlowHubData>) {
  const [workflows, setWorkflows] = useState<WorkflowItem[]>([]);
  const [newFlowName, setNewFlowName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const currentWorkflowId = data?.currentWorkflowId || 'gemini_banner_pipeline';

  const fetchList = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/workflows');
      if (res.ok) {
        const list = await res.json();
        setWorkflows(list);
      }
    } catch (err) {
      console.error("Lỗi tải danh sách workflows:", err);
    }
  };

  useEffect(() => {
    fetchList();
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
          data: { title: "1. Trigger / Input", prompt: "A glowing magic ring" }
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
      fetchList();
      data?.onSelectWorkflow(newId);
      onDismiss?.();
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
    if (!confirm("Bạn có chắc chắn muốn xóa Flow này?")) return;

    try {
      await fetch(`http://localhost:8000/api/workflows/${id}`, {
        method: 'DELETE'
      });
      fetchList();
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
        data?.onImportWorkflow(flowData);
        onDismiss?.();
      } catch (err) {
        alert("File JSON không hợp lệ!");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="w-full max-w-3xl bg-[#262626] border border-white/10 rounded-lg shadow-2xl overflow-hidden p-6 space-y-5 text-zinc-100">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-md bg-[#1b1b1b] border border-zinc-800">
            <Layers className="w-5 h-5 text-zinc-300" />
          </div>
          <div>
            <h2 className="font-semibold text-sm text-zinc-100">Workflow Hub & Dashboard</h2>
            <p className="text-[11px] text-zinc-400">Quản lý, tạo mới, và Import/Export các sơ đồ tự động hóa</p>
          </div>
        </div>
        
        <div className="flex items-center gap-1.5">
          <label className="cursor-pointer">
            <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
            <Button variant="secondary" size="sm" type="button" className="gap-1.5 text-xs pointer-events-none">
              <Upload className="w-3.5 h-3.5" />
              Import JSON
            </Button>
          </label>
          <Button 
            variant="secondary" 
            size="sm" 
            onClick={() => data?.onExportWorkflow()}
            className="gap-1.5 text-xs"
          >
            <Download className="w-3.5 h-3.5" />
            Export Flow
          </Button>
          <Button 
            variant="default" 
            size="sm" 
            onClick={() => setIsCreating(true)} 
            className="gap-1.5 text-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            Tạo Workflow Mới
          </Button>
          {data?.showCloseButton !== false && onDismiss && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onDismiss}
              className="h-7 w-7 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 ml-1"
              title="Đóng (Esc)"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Thanh input khi đang tạo flow */}
      {isCreating && (
        <div className="flex items-center gap-2 p-2.5 bg-zinc-900 border border-zinc-800 rounded-md">
          <Input
            value={newFlowName}
            onChange={(e) => setNewFlowName(e.target.value)}
            placeholder="Nhập tên Workflow mới (ví dụ: Flow Tách Nền E-commerce)..."
            className="text-xs flex-1"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCreateNew();
              if (e.key === 'Escape') setIsCreating(false);
            }}
          />
          <Button variant="default" size="sm" onClick={handleCreateNew}>
            Tạo
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setIsCreating(false)}>
            Hủy
          </Button>
        </div>
      )}

      {/* Danh sách các Flow dạng Card Grid (dùng Shared Card component chuẩn) */}
      <div className="grid grid-cols-2 gap-3 max-h-[380px] overflow-y-auto pr-1">
        {workflows.map((flow) => {
          const isCurrent = flow.id === currentWorkflowId;
          return (
            <Card
              key={flow.id}
              role="button"
              tabIndex={0}
              variant="solid"
              active={isCurrent}
              onClick={() => {
                data?.onSelectWorkflow(flow.id);
                onDismiss?.();
              }}
              className="p-4 transition-all cursor-pointer flex flex-col justify-between"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs text-zinc-100 flex items-center gap-1.5 truncate">
                    <Workflow className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                    {flow.name}
                  </span>
                  {isCurrent && (
                    <Badge variant="secondary" className="text-[9px] bg-zinc-800 text-zinc-300 font-medium">
                      Active
                    </Badge>
                  )}
                </div>
                <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">
                  {flow.description}
                </p>
              </div>

              <div className="pt-3 border-t border-zinc-800/40 flex items-center justify-between text-[10px] text-zinc-500">
                <div className="flex items-center gap-2">
                  <span>{flow.nodesCount} Nodes</span>
                  <span>•</span>
                  <span>{flow.edgesCount} Dây nối</span>
                </div>
                <div className="flex items-center gap-1">
                  {flow.id !== 'gemini_banner_pipeline' && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => handleDelete(e, flow.id)}
                      className="h-6 w-6 text-zinc-500 hover:text-red-400"
                      title="Xóa Flow"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  )}
                  <span className="text-zinc-400 flex items-center gap-0.5">
                    Mở <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
