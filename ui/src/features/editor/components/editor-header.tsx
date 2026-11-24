import { 
  Copy, 
  Save, 
  Download, 
  Play, 
  RefreshCw, 
  Plus, 
  FolderKanban 
} from 'lucide-react';
import { 
  Button, 
  Badge, 
  Tooltip, 
  TooltipTrigger, 
  TooltipContent, 
  StudioLogo, 
  Separator 
} from '../../../shared/components';
import { Icons } from '../../../shared/icons';
import { useSettingsStore } from '../../../shared/store/settings.store';
import { translations, type Locale } from '../../../lib/i18n';

export interface EditorHeaderProps {
  onBackToDashboard: () => void;
  onOpenNodePalette: () => void;
  onCopyWebhook: () => void;
  onSaveWorkflow: () => void;
  onExportWorkflow: () => void;
  onExecuteWorkflow: () => void;
  isExecuting: boolean;
}

export function EditorHeader({
  onBackToDashboard,
  onOpenNodePalette,
  onCopyWebhook,
  onSaveWorkflow,
  onExportWorkflow,
  onExecuteWorkflow,
  isExecuting,
}: EditorHeaderProps) {
  const { locale, isSidebarOpen, toggleSidebar } = useSettingsStore();
  const t = translations[locale as Locale] || translations.vi;

  return (
    <header className="h-12 bg-[var(--bg-surface)] px-4 flex items-center justify-between z-30 shrink-0">
      <div className="flex items-center gap-2.5">
        <StudioLogo size={18} />
        <h1 className="font-semibold text-xs tracking-wide uppercase text-[var(--text-primary)]">
          {t.title}
        </h1>
        <Badge variant="secondary">{t.engineBadge}</Badge>

        <Button
          variant="secondary"
          size="sm"
          onClick={onBackToDashboard}
          className="ml-2 text-xs flex items-center gap-1.5"
        >
          <FolderKanban className="w-3.5 h-3.5" />
          <span>← Dashboard Hub</span>
        </Button>

        <Button
          variant="secondary"
          size="sm"
          onClick={onOpenNodePalette}
          className="text-xs flex items-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{t.addNode}</span>
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <Tooltip>
          <TooltipTrigger>
            <Button variant="outline" size="sm" onClick={onCopyWebhook}>
              <Copy className="w-3.5 h-3.5" />
              {t.copyWebhook}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">Sao chép cURL trigger Webhook</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger>
            <Button variant="outline" size="sm" onClick={onSaveWorkflow}>
              <Save className="w-3.5 h-3.5" />
              {t.saveFlow}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">Lưu luồng hiện tại</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger>
            <Button variant="outline" size="sm" onClick={onExportWorkflow}>
              <Download className="w-3.5 h-3.5" />
              Xuất JSON
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">Xuất file JSON của sơ đồ luồng</TooltipContent>
        </Tooltip>

        <Button variant="default" size="sm" onClick={onExecuteWorkflow} disabled={isExecuting}>
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

        {/* Separator thanh dọc rõ nét */}
        <Separator orientation="vertical" />

        {/* Nút Đóng / Mở Sidebar tối giản dạng mũi tên icon-only kèm tooltip & shimmer */}
        <Tooltip>
          <TooltipTrigger>
            <Button 
              variant="outline"
              size="icon-sm" 
              shimmer
              onClick={toggleSidebar}
              className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all duration-150"
            >
              <Icons 
                name={isSidebarOpen ? "chevron-right" : "chevron-left"} 
                size={12} 
                className="transition-transform" 
              />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            {isSidebarOpen ? "Đóng bảng cấu hình" : "Mở bảng cấu hình"}
          </TooltipContent>
        </Tooltip>
      </div>
    </header>
  );
}
