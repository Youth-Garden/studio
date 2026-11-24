import { Play, Power, Copy, Trash2, Code2 } from 'lucide-react';
import { Button } from './Button';
import { Tooltip } from './Tooltip';

export interface NodeToolbarProps {
  nodeId: string;
  isBypassed?: boolean;
  onInspect?: (id: string) => void;
  onTestStep?: (id: string) => void;
  onToggleBypass?: (id: string) => void;
  onDuplicate?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export function NodeToolbar({
  nodeId,
  isBypassed = false,
  onInspect,
  onTestStep,
  onToggleBypass,
  onDuplicate,
  onDelete,
}: NodeToolbarProps) {
  return (
    <div className="absolute -top-9 right-0 flex items-center gap-1 bg-[#1e1e1e] border border-zinc-700/80 rounded-md px-1.5 py-1 shadow-xl z-20 opacity-0 group-hover:opacity-100 transition-all duration-150 transform group-hover:translate-y-0 translate-y-1">
      {onInspect && (
        <Tooltip content="Soi JSON dữ liệu (Inspect)">
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onInspect(nodeId);
            }}
            className="h-6 w-6 text-zinc-300 hover:text-sky-400 hover:bg-zinc-800"
          >
            <Code2 className="w-3 h-3" />
          </Button>
        </Tooltip>
      )}

      {onTestStep && (
        <Tooltip content="Test riêng bước này (Test Step)">
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onTestStep(nodeId);
            }}
            className="h-6 w-6 text-zinc-300 hover:text-emerald-400 hover:bg-zinc-800"
          >
            <Play className="w-3 h-3 fill-current" />
          </Button>
        </Tooltip>
      )}

      {onToggleBypass && (
        <Tooltip content={isBypassed ? "Bật lại Node (Unmute)" : "Tạm tắt Node (Bypass)"}>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onToggleBypass(nodeId);
            }}
            className={`h-6 w-6 hover:bg-zinc-800 ${isBypassed ? 'text-amber-400 bg-amber-500/10' : 'text-zinc-300 hover:text-amber-400'}`}
          >
            <Power className="w-3 h-3" />
          </Button>
        </Tooltip>
      )}

      {onDuplicate && (
        <Tooltip content="Nhân bản (Clone)">
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onDuplicate(nodeId);
            }}
            className="h-6 w-6 text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800"
          >
            <Copy className="w-3 h-3" />
          </Button>
        </Tooltip>
      )}

      {onDelete && (
        <Tooltip content="Xóa Node">
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(nodeId);
            }}
            className="h-6 w-6 text-zinc-400 hover:text-red-400 hover:bg-zinc-800"
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </Tooltip>
      )}
    </div>
  );
}
