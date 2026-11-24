import { useCallback } from 'react';
import type { Node } from '@xyflow/react';
import { Sheet, CodeBlock, CodeBlockHeader, CodeBlockTitle, CodeBlockCopyButton, CodeBlockContent } from '../../../shared/components';
import { usePortal } from '../../../shared/hooks/use-portal';
import { NodePalette, type NodePaletteData } from '../../modals/node-palette-modal';
import { SettingsModal, type SettingsModalData } from '../../modals/settings-modal';
import { useSettingsStore } from '../../../shared/store/settings.store';
import { EditorHeader } from '../components/editor-header';
import { EditorCanvas } from '../components/editor-canvas';
import { EditorSidebar } from '../components/sidebar/editor-sidebar';
import { useEditorWorkflow } from '../hooks/use-editor-workflow';

export interface EditorPageProps {
  workflowId: string;
  onBackToDashboard: () => void;
}

export function EditorPage({ workflowId, onBackToDashboard }: EditorPageProps) {
  const { setSidebarOpen } = useSettingsStore();
  const [presentNodePalette] = usePortal<NodePaletteData>(NodePalette);
  const [presentSettings] = usePortal<SettingsModalData>(SettingsModal);

  const {
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
    fetchHistory,
    updateNodeData,
    handleSaveWorkflow,
    handleExportWorkflow,
    handleExecuteFlow,
    copyWebhookCurl,
    startResizing,
    setNodes,
  } = useEditorWorkflow(workflowId);

  const handleAddNodeFromPalette = useCallback((type: string, title: string, defaultData: any = {}, position?: { x: number; y: number }) => {
    const id = `${type}-${Date.now().toString(36)}`;
    const newNode: Node = {
      id,
      type,
      position: position || { x: 300, y: 250 },
      data: {
        title,
        ...defaultData,
      },
    };
    setNodes((prev) => [...prev, newNode]);
  }, [setNodes]);

  return (
    <div className="flex flex-col h-screen w-full bg-[var(--bg-body)] text-[var(--text-primary)] overflow-hidden font-sans transition-colors duration-200">
      <EditorHeader
        onBackToDashboard={onBackToDashboard}
        onOpenNodePalette={() => presentNodePalette({ onAddNode: handleAddNodeFromPalette })}
        onCopyWebhook={copyWebhookCurl}
        onSaveWorkflow={() => handleSaveWorkflow(workflowId)}
        onExportWorkflow={handleExportWorkflow}
        onExecuteWorkflow={handleExecuteFlow}
        isExecuting={isExecuting}
      />

      <div className="flex flex-1 w-full h-[calc(100vh-3rem)] overflow-hidden relative">
        <EditorCanvas
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={(node) => {
            setSelectedNode(node);
            setSidebarTab('config');
            setSidebarOpen(true);
          }}
          onContextMenu={(e) => {
            e.preventDefault();
            const bounds = e.currentTarget.getBoundingClientRect();
            const clickPos = {
              x: Math.round(e.clientX - bounds.left),
              y: Math.round(e.clientY - bounds.top)
            };
            presentNodePalette({
              onAddNode: (type: string, title: string, data?: any) => handleAddNodeFromPalette(type, title, data, clickPos)
            });
          }}
          onOpenSettings={() => presentSettings({ showCloseButton: true })}
        />

        <EditorSidebar
          sidebarTab={sidebarTab}
          onSidebarTabChange={setSidebarTab}
          selectedNode={selectedNode}
          onUpdateNodeData={updateNodeData}
          activeJob={activeJob}
          historyJobs={historyJobs}
          previewTab={previewTab}
          onPreviewTabChange={setPreviewTab}
          onSelectJob={setActiveJob}
          onRefreshHistory={fetchHistory}
          onStartResizing={startResizing}
        />
      </div>

      <Sheet
        isOpen={isInspectorOpen}
        onClose={() => setIsInspectorOpen(false)}
        title={inspectedNode ? `Node Inspector: ${(inspectedNode.data as any)?.title || inspectedNode.id}` : "Node Inspector"}
        description="Chi tiết dữ liệu cấu hình và trạng thái runtime của Node"
      >
        {inspectedNode && (
          <div className="space-y-4">
            <CodeBlock size="sm">
              <CodeBlockHeader className="py-1 px-2.5">
                <CodeBlockTitle>node-inspector.json</CodeBlockTitle>
                <CodeBlockCopyButton value={JSON.stringify(inspectedNode, null, 2)} />
              </CodeBlockHeader>
              <CodeBlockContent className="p-3 text-[11px] max-h-[80vh]">
                {JSON.stringify(inspectedNode, null, 2)}
              </CodeBlockContent>
            </CodeBlock>
          </div>
        )}
      </Sheet>
    </div>
  );
}
