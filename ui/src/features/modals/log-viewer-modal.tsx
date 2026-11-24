import { Terminal, Copy, Check, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from '../../shared/components/Button';
import { Badge } from '../../shared/components/Badge';
import type { PortalProps } from '../../shared/types/portal.types';
import type { AgentDispatchLog } from '../editor/types/editor.types';

export interface LogViewerModalData {
  log: AgentDispatchLog;
}

export function LogViewerModal({
  onDismiss,
  data,
}: PortalProps<LogViewerModalData>) {
  const [copied, setCopied] = useState(false);
  const log = data?.log;

  if (!log) return null;

  const handleCopy = () => {
    const textToCopy = log.error || log.output || JSON.stringify(log, null, 2);
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatTime = (ts: number) => {
    return new Date(ts * 1000).toLocaleString('vi-VN');
  };

  return (
    <div className="relative w-full max-w-3xl bg-[var(--bg-surface)] border-0 rounded-2xl shadow-2xl overflow-hidden p-6 space-y-4 text-[var(--text-primary)]">
      <div className="flex items-start justify-between pb-3 pr-8 border-b border-[var(--border-color)]">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-[var(--bg-card)] rounded-xl text-zinc-300">
            <Terminal className="w-4 h-4 text-zinc-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-sm text-[var(--text-primary)]">
                Chi tiết thực thi: {log.plan_name}
              </h3>
              <Badge 
                variant={log.status === 'success' ? 'success' : 'outline'} 
                className={`text-[10px] ${log.status === 'failed' ? 'text-rose-400 bg-rose-500/10 border-0' : log.status === 'success' ? 'border-0' : 'text-zinc-400 border-0'}`}
              >
                {log.status === 'success' ? 'Thành công' : log.status === 'failed' ? 'Thất bại' : 'Đang xử lý'}
              </Badge>
            </div>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5 font-mono">
              ID: {log.id} • {log.caller} ➔ {log.target_agent} • {formatTime(log.timestamp)}
            </p>
          </div>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onDismiss} 
          className="absolute top-4 right-4 h-7 w-7 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/10 rounded-lg"
          title="Đóng (Esc)"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {log.extra_note && (
        <div className="bg-[var(--bg-card)] px-3 py-2 rounded-xl text-xs text-zinc-300 border-0">
          <span className="text-zinc-500 font-medium">Ghi chú điều phối: </span>
          {log.extra_note}
        </div>
      )}

      <div className="relative">
        <div className="flex items-center justify-between pb-1.5 text-xs text-zinc-400">
          <span className="font-medium">Nội dung Terminal / Log chi tiết:</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className="h-6 px-2 text-[11px] gap-1 text-zinc-400 hover:text-zinc-200"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            <span>{copied ? 'Đã sao chép' : 'Sao chép log'}</span>
          </Button>
        </div>
        <div className="bg-[var(--bg-body)] p-4 rounded-xl border-0 font-mono text-[11px] text-zinc-200 max-h-[480px] overflow-y-auto whitespace-pre-wrap leading-relaxed select-text">
          {log.error ? (
            <span className="text-rose-400">{log.error}</span>
          ) : log.output ? (
            log.output
          ) : (
            <span className="text-zinc-500">Đang chờ Web Agent phản hồi dữ liệu...</span>
          )}
        </div>
      </div>
    </div>
  );
}
