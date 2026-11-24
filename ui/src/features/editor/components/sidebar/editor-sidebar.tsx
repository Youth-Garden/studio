import type { Node } from '@xyflow/react';
import { Sliders, History, Bot } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TransitionEffect } from '../../../../shared/components';
import { useSettingsStore } from '../../../../shared/store/settings.store';
import { translations, type Locale } from '../../../../lib/i18n';
import type { WorkflowJob, PreviewTabType, SidebarTabType } from '../../types/editor.types';
import { NodeConfigPanel } from './node-config-panel';
import { ExecutionHistoryPanel } from './execution-history-panel';
import { AgentDispatchLogsPanel } from './agent-dispatch-logs-panel';

export interface EditorSidebarProps {
  sidebarTab: SidebarTabType;
  onSidebarTabChange: (tab: SidebarTabType) => void;
  selectedNode: Node | null;
  onUpdateNodeData: (key: string, value: any) => void;
  activeJob: WorkflowJob | null;
  historyJobs: WorkflowJob[];
  previewTab: PreviewTabType;
  onPreviewTabChange: (tab: PreviewTabType) => void;
  onSelectJob: (job: WorkflowJob) => void;
  onRefreshHistory: () => void;
  onStartResizing: (e: React.MouseEvent) => void;
}

export function EditorSidebar({
  sidebarTab,
  onSidebarTabChange,
  selectedNode,
  onUpdateNodeData,
  activeJob,
  historyJobs,
  previewTab,
  onPreviewTabChange,
  onSelectJob,
  onRefreshHistory,
  onStartResizing,
}: EditorSidebarProps) {
  const { isSidebarOpen, sidebarWidth, locale } = useSettingsStore();
  const t = translations[locale as Locale] || translations.vi;

  return (
    <>
      {/* Resizable Splitter */}
      {isSidebarOpen && (
        <div
          onMouseDown={onStartResizing}
          className="w-1.5 h-full bg-zinc-900 hover:bg-zinc-700 active:bg-zinc-500 cursor-col-resize z-30 transition-colors flex items-center justify-center select-none"
          title="Kéo sang trái/phải để chỉnh độ rộng Sidebar"
        >
          <div className="w-0.5 h-6 bg-zinc-600 rounded-full" />
        </div>
      )}

      {/* Sidebar Content */}
      <div 
        style={{ width: isSidebarOpen ? `${sidebarWidth}px` : '0px' }}
        className={`h-full bg-[var(--bg-surface)] flex flex-col z-20 shrink-0 transition-[width] duration-250 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-hidden ${
          !isSidebarOpen && 'pointer-events-none'
        }`}
      >
        <TransitionEffect
          show={isSidebarOpen}
          enter="opacity-0 translate-x-3"
          enterActive="opacity-100 translate-x-0 transition-all duration-250 ease-out"
          exit="opacity-100 translate-x-0"
          exitActive="opacity-0 translate-x-3 transition-all duration-200 ease-in"
          duration={200}
          className="h-full flex flex-col w-full"
        >
          {/* Header Tab */}
          <div className="h-11 px-3 flex items-center justify-between shrink-0 bg-[var(--bg-surface)] border-b border-[var(--border-color)]">
            <Tabs value={sidebarTab} onValueChange={(v) => onSidebarTabChange(v as SidebarTabType)} className="w-full">
              <TabsList className="w-full">
                <TabsTrigger value="config" className="flex-1 gap-1 py-1 text-[11px]">
                  <Sliders className="w-3 h-3" />
                  <span>{t.sidebarConfig}</span>
                </TabsTrigger>
                <TabsTrigger value="history" className="flex-1 gap-1 py-1 text-[11px]">
                  <History className="w-3 h-3" />
                  <span>Jobs</span>
                </TabsTrigger>
                <TabsTrigger value="agent-logs" className="flex-1 gap-1 py-1 text-[11px]">
                  <Bot className="w-3 h-3 text-zinc-400" />
                  <span>Agent Logs</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto px-3.5 py-3 [scrollbar-gutter:stable]">
            {sidebarTab === 'config' && (
              <NodeConfigPanel
                selectedNode={selectedNode}
                onUpdateNodeData={onUpdateNodeData}
              />
            )}
            {sidebarTab === 'history' && (
              <ExecutionHistoryPanel
                activeJob={activeJob}
                historyJobs={historyJobs}
                previewTab={previewTab}
                onPreviewTabChange={onPreviewTabChange}
                onSelectJob={onSelectJob}
                onRefreshHistory={onRefreshHistory}
              />
            )}
            {sidebarTab === 'agent-logs' && (
              <AgentDispatchLogsPanel />
            )}
          </div>
        </TransitionEffect>
      </div>
    </>
  );
}
