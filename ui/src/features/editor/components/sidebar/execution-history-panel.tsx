import { AlertCircle, RotateCcw, CheckCircle2, RefreshCw, Download } from 'lucide-react';
import { 
  Card, 
  Button, 
  StatusBadge, 
  Tabs, 
  TabsList, 
  TabsTrigger,
  Alert,
  AlertTitle,
  AlertDescription,
  Tooltip
} from '../../../../shared/components';
import type { WorkflowJob, PreviewTabType } from '../../types/editor.types';
import { translations, type Locale } from '../../../../lib/i18n';
import { useSettingsStore } from '../../../../shared/store/settings.store';

export interface ExecutionHistoryPanelProps {
  activeJob: WorkflowJob | null;
  historyJobs: WorkflowJob[];
  previewTab: PreviewTabType;
  onPreviewTabChange: (tab: PreviewTabType) => void;
  onSelectJob: (job: WorkflowJob) => void;
  onRefreshHistory: () => void;
}

export function ExecutionHistoryPanel({
  activeJob,
  historyJobs,
  previewTab,
  onPreviewTabChange,
  onSelectJob,
  onRefreshHistory,
}: ExecutionHistoryPanelProps) {
  const { locale } = useSettingsStore();
  const t = translations[locale as Locale] || translations.vi;

  return (
    <div className="flex-1 space-y-4 text-xs">
      {activeJob ? (
        <Card className="space-y-3 p-3.5 border-0">
          <div className="flex items-center justify-between">
            <div className="truncate pr-2">
              <p className="font-semibold text-zinc-100 text-xs truncate">{activeJob.title}</p>
              <p className="text-[10px] text-zinc-500 font-mono">ID: {activeJob.id}</p>
            </div>
            <StatusBadge status={activeJob.status} />
          </div>

          {activeJob.status === 'failed' && activeJob.error && (
            <Alert variant="destructive">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <div className="space-y-1">
                <AlertTitle>Nguyên nhân lỗi:</AlertTitle>
                <AlertDescription className="font-mono text-[10px] text-rose-300/90 leading-relaxed break-words whitespace-pre-wrap">
                  {activeJob.error}
                </AlertDescription>
              </div>
            </Alert>
          )}

          <Tabs value={previewTab} onValueChange={(v) => onPreviewTabChange(v as PreviewTabType)} className="w-full">
            <TabsList className="w-full">
              <TabsTrigger value="output" className="flex-1" title={`Banner (${activeJob.width}x${activeJob.height})`}>
                Banner
              </TabsTrigger>
              <TabsTrigger value="transparent" className="flex-1">
                Tách nền
              </TabsTrigger>
              <TabsTrigger value="raw" className="flex-1">
                Ảnh Raw
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Preview Image Box */}
          <div className="w-full aspect-video bg-[#121214] rounded-lg overflow-hidden flex items-center justify-center relative border-0">
            {previewTab === 'output' && (
              activeJob.output_filename ? (
                <img
                  src={`http://localhost:8000/media/output/${activeJob.output_filename}`}
                  alt="Banner preview"
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="text-zinc-600 text-center space-y-1">
                  <p className="text-[11px]">Chưa có kết quả Banner</p>
                  <p className="text-[10px] text-zinc-600">Thực thi hoàn tất để xem ảnh</p>
                </div>
              )
            )}

            {previewTab === 'transparent' && (
              activeJob.transparent_filename ? (
                <div 
                  className="w-full h-full flex items-center justify-center"
                  style={{
                    backgroundImage: `linear-gradient(45deg, #1c1c1f 25%, transparent 25%), linear-gradient(-45deg, #1c1c1f 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #1c1c1f 75%), linear-gradient(-45deg, transparent 75%, #1c1c1f 75%)`,
                    backgroundSize: '16px 16px',
                    backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0px',
                  }}
                >
                  <img
                    src={`http://localhost:8000/media/transparent/${activeJob.transparent_filename}`}
                    alt="Transparent asset"
                    className="max-w-full max-h-full object-contain p-2"
                  />
                </div>
              ) : (
                <div 
                  className="w-full h-full flex items-center justify-center text-zinc-600"
                  style={{
                    backgroundImage: `linear-gradient(45deg, #1c1c1f 25%, transparent 25%), linear-gradient(-45deg, #1c1c1f 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #1c1c1f 75%), linear-gradient(-45deg, transparent 75%, #1c1c1f 75%)`,
                    backgroundSize: '16px 16px',
                    backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0px',
                  }}
                >
                  <p className="text-[11px] bg-zinc-900/80 px-2 py-1 rounded">Chưa có ảnh tách nền</p>
                </div>
              )
            )}

            {previewTab === 'raw' && (
              activeJob.raw_filename ? (
                <img
                  src={`http://localhost:8000/media/raw/${activeJob.raw_filename}`}
                  alt="Raw generated asset"
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="text-zinc-600 text-center">
                  <p className="text-[11px]">Chưa có ảnh Raw</p>
                </div>
              )
            )}
          </div>

          {/* Download Actions */}
          <div className="flex gap-2 pt-1">
            {activeJob.output_filename && (
              <a
                href={`http://localhost:8000/media/output/${activeJob.output_filename}`}
                download
                className="flex-1"
                target="_blank"
                rel="noreferrer"
              >
                <Button variant="outline" size="sm" className="w-full text-[11px] gap-1.5 border-0 bg-zinc-800/80">
                  <Download className="w-3 h-3" />
                  <span>Tải Banner</span>
                </Button>
              </a>
            )}
            {activeJob.transparent_filename && (
              <a
                href={`http://localhost:8000/media/transparent/${activeJob.transparent_filename}`}
                download
                className="flex-1"
                target="_blank"
                rel="noreferrer"
              >
                <Button variant="outline" size="sm" className="w-full text-[11px] gap-1.5 border-0 bg-zinc-800/80">
                  <Download className="w-3 h-3" />
                  <span>Tải PNG Tách Nền</span>
                </Button>
              </a>
            )}
          </div>
        </Card>
      ) : (
        <Card className="p-4 text-center text-zinc-400 border-0">
          {t.selectNodeHint}
        </Card>
      )}

      {/* Execution Run List */}
      <div className="space-y-2 pt-2">
        <div className="flex items-center justify-between text-zinc-400 pb-1">
          <span className="font-medium text-[11px] uppercase tracking-wider">{t.historyTitle}</span>
          <Tooltip content="Làm mới lịch sử chạy (Refresh)">
            <Button variant="ghost" size="icon" onClick={onRefreshHistory} className="h-6 w-6 text-zinc-400 hover:text-zinc-200">
              <RotateCcw className="w-3 h-3" />
            </Button>
          </Tooltip>
        </div>

        <div className="space-y-1.5 max-h-[300px] overflow-y-auto pr-1">
          {historyJobs.map((job) => (
            <Card
              key={job.id}
              role="button"
              tabIndex={0}
              variant="solid"
              active={activeJob?.id === job.id}
              onClick={() => onSelectJob(job)}
              className="p-2.5 rounded-lg border-0 transition-colors cursor-pointer flex items-center justify-between"
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
  );
}
