import { useState, useEffect } from 'react';
import { PortalRenderer } from './shared/components/portal/portal-renderer';
import { usePortal } from './shared/hooks/use-portal';
import { SettingsModal, type SettingsModalData } from './features/modals/settings-modal';
import { useSettingsStore } from './shared/store/settings.store';
import { DashboardPage } from './features/dashboard/pages/dashboard-page';
import { EditorPage } from './features/editor/pages/editor-page';
import { API_ENDPOINTS } from './lib/constants';
import { toast, Toaster } from './shared/components/Toast';

const getInitialRoute = () => {
  const path = window.location.pathname;
  if (path.startsWith('/flow/')) {
    const flowId = path.replace('/flow/', '');
    return { view: 'editor' as const, flowId: flowId || 'default-banner-flow' };
  }
  return { view: 'dashboard' as const, flowId: 'default-banner-flow' };
};

export default function App() {
  const initialRoute = getInitialRoute();
  const [currentView, setCurrentView] = useState<'dashboard' | 'editor'>(initialRoute.view);
  const [currentWorkflowId, setCurrentWorkflowId] = useState(initialRoute.flowId);

  const { locale } = useSettingsStore();
  const [presentSettings] = usePortal<SettingsModalData>(SettingsModal);

  const navigateToDashboard = () => {
    setCurrentView('dashboard');
    window.history.pushState({}, '', '/dashboard');
  };

  const navigateToEditor = (workflowId: string) => {
    setCurrentView('editor');
    setCurrentWorkflowId(workflowId);
    window.history.pushState({}, '', `/flow/${workflowId}`);
  };

  useEffect(() => {
    const handlePopState = () => {
      const route = getInitialRoute();
      setCurrentView(route.view);
      setCurrentWorkflowId(route.flowId);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleImportWorkflow = async (flowData: any) => {
    try {
      const payload = {
        name: flowData.name || "Imported Workflow",
        description: flowData.description || "Luồng import từ file JSON bên ngoài",
        nodes: flowData.nodes || [],
        edges: flowData.edges || [],
      };
      const res = await fetch(API_ENDPOINTS.WORKFLOWS, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const created = await res.json();
        toast.success("Import JSON thành công", `Đã tạo workflow: ${created.name}`);
        navigateToEditor(created.id);
      } else {
        toast.error("Import thất bại", "Máy chủ từ chối file JSON này.");
      }
    } catch {
      toast.error("Lỗi Import", "Không thể gửi dữ liệu lên máy chủ.");
    }
  };

  return (
    <>
      <Toaster />

      {currentView === 'dashboard' ? (
        <DashboardPage
          currentWorkflowId={currentWorkflowId}
          locale={locale}
          onOpenWorkflow={navigateToEditor}
          onOpenSettings={() => presentSettings({ showCloseButton: true })}
          onImportWorkflow={handleImportWorkflow}
        />
      ) : (
        <EditorPage
          workflowId={currentWorkflowId}
          onBackToDashboard={navigateToDashboard}
        />
      )}

      {/* Centralized EzGame Portal Renderer */}
      <PortalRenderer />
    </>
  );
}
