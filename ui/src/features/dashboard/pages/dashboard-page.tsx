import { useState, useEffect, useCallback } from 'react';
import { Search, Layers, Plus } from 'lucide-react';
import { Input, Button, Card } from '../../../shared/components';
import { usePortal } from '../../../shared/hooks/use-portal';
import { CreateWorkflowModal, type CreateWorkflowModalData } from '../../modals/create-workflow-modal';
import { translations, type Locale } from '../../../lib/i18n';
import { API_ENDPOINTS } from '../../../lib/constants';
import type { WorkflowItem } from '../../modals/flow-hub-modal';
import { DashboardHeader } from '../components/dashboard-header';
import { WorkflowCard } from '../components/workflow-card';

export interface DashboardPageProps {
  currentWorkflowId: string;
  locale: Locale;
  onOpenWorkflow: (id: string) => void;
  onOpenSettings: () => void;
  onImportWorkflow: (flowData: any) => void;
}

export function DashboardPage({
  locale,
  onOpenWorkflow,
  onOpenSettings,
  onImportWorkflow,
}: DashboardPageProps) {
  const [workflows, setWorkflows] = useState<WorkflowItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const t = translations[locale] || translations.vi;

  const fetchWorkflows = useCallback(async () => {
    try {
      const res = await fetch(API_ENDPOINTS.WORKFLOWS);
      if (res.ok) {
        const list = await res.json();
        setWorkflows(list);
      }
    } catch (err) {
      console.error("Lỗi tải danh sách workflows:", err);
    }
  }, []);

  useEffect(() => {
    fetchWorkflows();
  }, [fetchWorkflows]);

  const handleCreateNewWorkflow = useCallback(async (newFlowName: string) => {
    try {
      const payload = {
        name: newFlowName,
        description: "Quy trình thiết kế mới tạo từ Dashboard Hub",
        nodes: [
          {
            id: 'node-trigger',
            type: 'triggerNode',
            position: { x: 100, y: 150 },
            data: { title: '1. Trigger / Input', prompt: 'Create a high-detail 2D game asset' },
          },
          {
            id: 'node-output',
            type: 'outputNode',
            position: { x: 600, y: 150 },
            data: { title: '2. Banner Output' },
          },
        ],
        edges: [
          { id: 'edge-1-2', source: 'node-trigger', target: 'node-output' },
        ],
      };

      const res = await fetch(API_ENDPOINTS.WORKFLOWS, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const created = await res.json();
        onOpenWorkflow(created.id);
      }
    } catch (err) {
      console.error("Lỗi tạo workflow mới:", err);
    }
  }, [onOpenWorkflow]);

  // Kích hoạt qua EzGame Centralized Portal Stack (chuẩn usePortal)
  const [presentCreateWorkflow] = usePortal<CreateWorkflowModalData>(CreateWorkflowModal);

  const openCreateDialog = () => {
    presentCreateWorkflow({
      onCreate: handleCreateNewWorkflow,
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        onImportWorkflow(json);
      } catch {
        alert("File JSON không hợp lệ.");
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const filteredWorkflows = workflows.filter((w) =>
    w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    w.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[var(--bg-body)] text-[var(--text-primary)] flex flex-col font-sans select-none transition-colors duration-200">
      <DashboardHeader
        locale={locale}
        onOpenSettings={onOpenSettings}
        onFileUpload={handleFileUpload}
        onCreateNew={openCreateDialog}
      />

      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-8 space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.searchWorkflow}
              className="pl-9 text-xs bg-[#202022] border-zinc-800"
            />
          </div>

          <div className="text-xs text-zinc-400">
            {t.workflowsCount.replace('{count}', filteredWorkflows.length.toString())}
          </div>
        </div>

        {filteredWorkflows.length === 0 ? (
          <Card className="p-12 text-center space-y-4 max-w-md mx-auto border-dashed border-zinc-800 bg-[#1c1c1f]">
            <div className="w-12 h-12 rounded-full bg-zinc-800/80 flex items-center justify-center mx-auto text-zinc-400">
              <Layers className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-semibold text-sm text-zinc-200">Chưa có luồng nào</h3>
              <p className="text-xs text-zinc-400">Tạo workflow đầu tiên hoặc Import file JSON từ máy tính.</p>
            </div>
            <Button variant="default" size="sm" onClick={openCreateDialog} className="gap-1.5 mx-auto">
              <Plus className="w-3.5 h-3.5" />
              Tạo Workflow Mới
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredWorkflows.map((workflow) => (
              <WorkflowCard
                key={workflow.id}
                workflow={workflow}
                locale={locale}
                onOpen={onOpenWorkflow}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
