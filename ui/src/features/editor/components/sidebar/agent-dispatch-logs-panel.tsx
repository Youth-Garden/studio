import { useEffect, useState } from 'react';
import { 
  Terminal, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  RefreshCw,
  FileCode2,
  Clock,
  Maximize2
} from 'lucide-react';
import { Card, Button, Badge, Tooltip } from '../../../../shared/components';
import { usePortal } from '../../../../shared/hooks/use-portal';
import { LogViewerModal, type LogViewerModalData } from '../../../modals/log-viewer-modal';
import type { AgentDispatchLog } from '../../types/editor.types';

export function AgentDispatchLogsPanel() {
  const [logs, setLogs] = useState<AgentDispatchLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLog, setSelectedLog] = useState<AgentDispatchLog | null>(null);
  const [presentLogModal] = usePortal<LogViewerModalData>(LogViewerModal);

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('http://127.0.0.1:8000/api/agent/dispatch-logs');
      if (res.ok) {
        const data = await res.json();
        setLogs(data);
        if (data.length > 0 && !selectedLog) {
          setSelectedLog(data[0]);
        }
      }
    } catch (e) {
      console.error('Không thể tải dispatch logs:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 4000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (ts: number) => {
    const d = new Date(ts * 1000);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <div className="flex-1 space-y-3 text-xs flex flex-col h-full select-none">
      <div className="flex items-center justify-between px-1">
        <span className="text-[11px] font-medium text-zinc-400">
          Lịch sử điều phối ({logs.length})
        </span>
        <Tooltip content="Làm mới danh sách log">
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchLogs}
            disabled={isLoading}
            className="h-6 px-2 text-zinc-400 hover:text-zinc-200"
          >
            <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </Tooltip>
      </div>

      {logs.length === 0 ? (
        <Card className="p-6 text-center text-zinc-500 border-0 bg-[var(--bg-card)] rounded-xl">
          <Terminal className="w-8 h-8 mx-auto mb-2 opacity-40 text-zinc-400" />
          <p className="font-medium text-zinc-300">Chưa có lượt điều phối nào</p>
          <p className="text-[11px] text-zinc-500 mt-1">
            Mỗi khi Orca gửi plan tới Gateway, toàn bộ prompt, caller và kết quả sẽ hiển thị tại đây.
          </p>
        </Card>
      ) : (
        <div className="space-y-2 overflow-y-auto max-h-[360px] pr-1">
          {logs.map((log) => {
            const isSelected = selectedLog?.id === log.id;
            return (
              <Card
                key={log.id}
                role="button"
                tabIndex={0}
                variant="solid"
                active={isSelected}
                onClick={() => setSelectedLog(log)}
                className={`p-3 rounded-xl cursor-pointer border-0 transition-colors ${
                  isSelected ? 'bg-[var(--bg-surface)] ring-1 ring-white/10' : 'bg-[var(--bg-card)] hover:bg-[var(--bg-surface)]'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-semibold text-zinc-200 flex items-center gap-1.5 truncate">
                    <FileCode2 className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                    <span className="truncate">{log.plan_name}</span>
                  </span>
                  {log.status === 'success' && (
                    <Badge variant="success" className="gap-1 text-[10px] py-0 border-0">
                      <CheckCircle2 className="w-2.5 h-2.5" />
                      Thành công
                    </Badge>
                  )}
                  {log.status === 'failed' && (
                    <Badge variant="outline" className="gap-1 text-[10px] py-0 text-rose-400 bg-rose-500/10 border-0">
                      <AlertCircle className="w-2.5 h-2.5" />
                      Thất bại
                    </Badge>
                  )}
                  {log.status === 'processing' && (
                    <Badge variant="outline" className="gap-1 text-[10px] py-0 text-amber-300 bg-amber-500/10 border-0">
                      <Loader2 className="w-2.5 h-2.5 animate-spin" />
                      Đang xử lý
                    </Badge>
                  )}
                </div>

                <div className="flex items-center justify-between text-[11px] text-zinc-400">
                  <span className="text-zinc-500">{log.caller} ➔ {log.target_agent}</span>
                  <span className="flex items-center gap-1 text-[10px] text-zinc-500">
                    <Clock className="w-2.5 h-2.5" />
                    {formatTime(log.timestamp)}
                  </span>
                </div>

                {log.extra_note && (
                  <p className="mt-1.5 text-[10px] text-zinc-400 bg-[var(--bg-body)] px-2 py-1 rounded-lg truncate">
                    Ghi chú: {log.extra_note}
                  </p>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {selectedLog && (
        <div className="mt-2 pt-2 border-t border-[var(--border-color)] space-y-2">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-zinc-400 font-medium">Chi tiết thực thi ({selectedLog.id})</span>
            <div className="flex items-center gap-1">
              <span className="text-[10px] font-mono text-zinc-500 mr-1">{formatTime(selectedLog.timestamp)}</span>
              <Tooltip content="Mở toàn màn hình xem chi tiết">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => presentLogModal({ log: selectedLog })}
                  className="h-5 w-5 text-zinc-400 hover:text-zinc-200"
                >
                  <Maximize2 className="w-3 h-3" />
                </Button>
              </Tooltip>
            </div>
          </div>

          <div 
            onClick={() => presentLogModal({ log: selectedLog })}
            title="Click để phóng to log"
            className="bg-[var(--bg-body)] p-3 rounded-xl border-0 font-mono text-[10px] text-zinc-300 max-h-40 overflow-y-auto whitespace-pre-wrap leading-relaxed cursor-pointer hover:bg-zinc-900/60 transition-colors"
          >
            {selectedLog.error ? (
              <span className="text-rose-400">{selectedLog.error}</span>
            ) : selectedLog.output ? (
              selectedLog.output
            ) : (
              <span className="text-zinc-500">Đang chờ Web Agent phản hồi...</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
