import { Button, RainbowButton, Tooltip, TooltipTrigger, TooltipContent } from '../../../shared/components';
import { Icons } from '../../../shared/icons';
import { translations, type Locale } from '../../../lib/i18n';

export interface DashboardHeaderProps {
  locale: Locale;
  onOpenSettings: () => void;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCreateNew: () => void;
}

export function DashboardHeader({
  locale,
  onOpenSettings,
  onFileUpload,
  onCreateNew,
}: DashboardHeaderProps) {
  const t = translations[locale] || translations.vi;

  return (
    <header className="h-14 bg-[var(--bg-surface)] px-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-[var(--bg-body)] flex items-center justify-center">
          <Icons name="logo" size={18} />
        </div>
        <div>
          <h1 className="font-semibold text-sm tracking-wide text-[var(--text-primary)]">{t.title} HUB</h1>
          <p className="text-[10px] text-[var(--text-secondary)]">{t.dashboardTitle}</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Tooltip>
          <TooltipTrigger>
            <Button 
              variant="secondary" 
              size="sm" 
              onClick={onOpenSettings}
              className="text-xs gap-1.5"
            >
              <Icons name="settings" size={14} className="text-[var(--text-secondary)]" />
              <span>{t.settings}</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            Tùy chỉnh ngôn ngữ, lưới nền và chủ đề giao diện
          </TooltipContent>
        </Tooltip>

        <label className="cursor-pointer">
          <input type="file" accept=".json" onChange={onFileUpload} className="hidden" />
          <Button variant="secondary" size="sm" type="button" className="gap-1.5 text-xs pointer-events-none">
            <Icons name="upload" size={14} className="text-[var(--text-secondary)]" />
            Import JSON
          </Button>
        </label>

        {/* Nút Tạo Workflow tích hợp Rainbow Button với hiệu ứng viền cầu vồng chuyển động */}
        <RainbowButton 
          size="default" 
          onClick={onCreateNew} 
          className="gap-1.5"
        >
          <Icons name="plus" size={14} />
          <span>{t.createNewWorkflow}</span>
        </RainbowButton>
      </div>
    </header>
  );
}
