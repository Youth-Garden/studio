import React from 'react';
import { CheckCircle2, RefreshCw, AlertCircle, Clock } from 'lucide-react';
import { cn } from '../../lib/utils';

export type JobStatusType = 'queued' | 'pending' | 'processing' | 'running' | 'completed' | 'success' | 'failed' | 'error' | 'idle';

export interface StatusBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  status: JobStatusType;
  showIcon?: boolean;
  label?: string;
}

export function StatusBadge({ status, showIcon = true, label, className, ...props }: StatusBadgeProps) {
  const normalized = status?.toLowerCase() as JobStatusType;

  const config = {
    // Hoàn thành / Thành công -> Xanh lá (Emerald)
    completed: {
      text: label || 'completed',
      classes: 'bg-emerald-950/60 text-emerald-400 border-emerald-800/50',
      icon: CheckCircle2,
    },
    success: {
      text: label || 'success',
      classes: 'bg-emerald-950/60 text-emerald-400 border-emerald-800/50',
      icon: CheckCircle2,
    },
    // Thất bại / Lỗi -> Đỏ (Red)
    failed: {
      text: label || 'failed',
      classes: 'bg-red-950/60 text-red-400 border-red-800/50',
      icon: AlertCircle,
    },
    error: {
      text: label || 'failed',
      classes: 'bg-red-950/60 text-red-400 border-red-800/50',
      icon: AlertCircle,
    },
    // Đang xử lý -> Vàng cam (Amber)
    processing: {
      text: label || 'running',
      classes: 'bg-amber-950/60 text-amber-400 border-amber-800/50',
      icon: RefreshCw,
      animate: true,
    },
    running: {
      text: label || 'running',
      classes: 'bg-amber-950/60 text-amber-400 border-amber-800/50',
      icon: RefreshCw,
      animate: true,
    },
    // Hàng đợi / Chờ -> Xanh dương hoặc Xám (Zinc / Sky)
    queued: {
      text: label || 'queued',
      classes: 'bg-sky-950/50 text-sky-400 border-sky-800/40',
      icon: Clock,
    },
    pending: {
      text: label || 'pending',
      classes: 'bg-zinc-900 text-zinc-400 border-zinc-700/60',
      icon: Clock,
    },
    idle: {
      text: label || 'idle',
      classes: 'bg-zinc-900 text-zinc-500 border-zinc-800',
      icon: Clock,
    },
  }[normalized] || {
    text: label || status,
    classes: 'bg-zinc-900 text-zinc-400 border-zinc-800',
    icon: Clock,
    animate: false,
  };

  const Icon = config.icon;

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 rounded-sm px-1.5 py-0.5 text-[10px] font-mono tracking-tight font-medium transition-colors",
        config.classes.replace(/border[^\s]*/g, ''),
        className
      )}
      {...props}
    >
      {showIcon && Icon && (
        <Icon className={cn("w-3 h-3", (config as any).animate && "animate-spin")} />
      )}
      <span>{config.text}</span>
    </div>
  );
}
