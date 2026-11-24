import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { 
  CheckCircle2,
  AlertCircle,
  Loader2,
  Circle
} from 'lucide-react';
import { Badge } from '../../../../shared/components/Badge';
import { NodeToolbar } from '../../../../shared/components/NodeToolbar';

export function getNodeVisualStatus(status?: string, isBypassed?: boolean) {
  if (isBypassed) {
    return {
      border: 'border-zinc-700/60 opacity-60 line-through',
      glow: 'shadow-none',
      badgeVariant: 'secondary' as const,
      icon: <Circle className="w-2.5 h-2.5 text-zinc-500" />,
      text: 'Bypassed'
    };
  }
  const s = status?.toLowerCase();
  if (s === 'running' || s === 'processing') {
    return {
      border: 'border-amber-400 ring-2 ring-amber-400/40',
      glow: 'shadow-[0_0_24px_rgba(251,191,36,0.25)] animate-pulse',
      badgeVariant: 'outline' as const,
      badgeClass: 'text-amber-300 border-0 bg-amber-500/10',
      icon: <Loader2 className="w-2.5 h-2.5 text-amber-400 animate-spin" />,
      text: 'Running'
    };
  }
  if (s === 'success' || s === 'completed') {
    return {
      border: 'border-emerald-500 ring-2 ring-emerald-500/40',
      glow: 'shadow-[0_0_24px_rgba(16,185,129,0.25)]',
      badgeVariant: 'success' as const,
      badgeClass: 'border-0',
      icon: <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />,
      text: 'Success'
    };
  }
  if (s === 'error' || s === 'failed') {
    return {
      border: 'border-rose-500 ring-2 ring-rose-500/40',
      glow: 'shadow-[0_0_24px_rgba(244,63,94,0.25)]',
      badgeVariant: 'outline' as const,
      badgeClass: 'text-rose-300 border-0 bg-rose-500/10',
      icon: <AlertCircle className="w-2.5 h-2.5 text-rose-400" />,
      text: 'Failed'
    };
  }
  return {
    border: 'border-0',
    glow: 'shadow-sm',
    badgeVariant: 'secondary' as const,
    badgeClass: 'border-0',
    icon: null,
    text: null
  };
}

interface BaseNodeCardProps {
  id: string;
  data: any;
  icon: React.ReactNode;
  title: string;
  badgeLabel?: string;
  hasInput?: boolean;
  hasOutput?: boolean;
  children: React.ReactNode;
}

export function BaseNodeCard({
  id,
  data,
  icon,
  title,
  badgeLabel,
  hasInput = true,
  hasOutput = true,
  children
}: BaseNodeCardProps) {
  const visual = getNodeVisualStatus(data.status, data.isBypassed);

  return (
    <div className={`group relative w-72 rounded-xl bg-[var(--bg-surface)] backdrop-blur-md ${visual.border} ${visual.glow} text-xs text-[var(--text-primary)] transition-all duration-200 select-none`}>
      <NodeToolbar
        nodeId={id}
        isBypassed={data.isBypassed}
        onInspect={data.onInspect}
        onTestStep={data.onTestStep}
        onToggleBypass={data.onToggleBypass}
        onDuplicate={data.onDuplicate}
        onDelete={data.onDelete}
      />
      {hasInput && (
        <Handle
          type="target"
          position={Position.Left}
          className="!w-2.5 !h-2.5 !-left-1.5 !bg-zinc-400 hover:!bg-zinc-100 !border-2 !border-[var(--bg-surface)] !rounded-full transition-colors"
        />
      )}
      <div className="px-3.5 py-2.5 flex items-center justify-between gap-2 bg-white/[0.02]">
        <div className="flex items-center gap-2 font-medium truncate">
          <span className="shrink-0 text-zinc-400">{icon}</span>
          <span className="truncate text-zinc-100 tracking-tight">{title}</span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {visual.text ? (
            <Badge variant={visual.badgeVariant} className={`gap-1 ${visual.badgeClass || ''}`}>
              {visual.icon}
              {visual.text}
            </Badge>
          ) : badgeLabel ? (
            <Badge variant="secondary" className="border-0 text-zinc-400 bg-zinc-800/80">
              {badgeLabel}
            </Badge>
          ) : null}
        </div>
      </div>
      <div className="px-3.5 pb-3.5 pt-2 text-[11px] space-y-2.5">
        {children}
      </div>
      {hasOutput && (
        <Handle
          type="source"
          position={Position.Right}
          className="!w-2.5 !h-2.5 !-right-1.5 !bg-zinc-400 hover:!bg-zinc-100 !border-2 !border-[var(--bg-surface)] !rounded-full transition-colors"
        />
      )}
    </div>
  );
}
