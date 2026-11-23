import { Handle, Position } from '@xyflow/react';
import { 
  Zap, 
  Bot, 
  Layers, 
  LayoutTemplate, 
  Image as ImageIcon,
  Split,
  Stamp,
  Send
} from 'lucide-react';
import { Badge } from './components/ui/Badge';
import { StatusBadge, type JobStatusType } from './components/ui/StatusBadge';
import { NodeToolbar } from './components/ui/NodeToolbar';

function getNodeBorderClass(status?: string, isBypassed?: boolean) {
  if (isBypassed) return 'border-zinc-700 opacity-60 line-through';
  if (status === 'running' || status === 'processing') return 'border-amber-500 ring-2 ring-amber-500/30';
  if (status === 'success' || status === 'completed') return 'border-emerald-600/90';
  if (status === 'error' || status === 'failed') return 'border-red-500 ring-2 ring-red-500/30';
  return 'border-zinc-800';
}

export function TriggerNode({ id, data }: { id: string; data: any }) {
  return (
    <div className={`group relative w-64 bg-zinc-900 border rounded-lg shadow-sm text-xs text-zinc-100 transition-all ${getNodeBorderClass(data.status, data.isBypassed)}`}>
      <NodeToolbar
        nodeId={id}
        isBypassed={data.isBypassed}
        onInspect={data.onInspect}
        onTestStep={data.onTestStep}
        onToggleBypass={data.onToggleBypass}
        onDuplicate={data.onDuplicate}
        onDelete={data.onDelete}
      />
      <div className="px-3 py-2 border-b border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-1.5 font-medium text-zinc-200">
          <Zap className="w-3.5 h-3.5 text-zinc-400" />
          <span>{data.title || "Trigger / Input"}</span>
        </div>
        {data.status ? <StatusBadge status={data.status as JobStatusType} /> : <Badge variant="secondary">Webhook</Badge>}
      </div>
      <div className="p-3 space-y-1.5">
        <label className="text-[10px] text-zinc-400 font-medium">Prompt tạo ảnh:</label>
        <p className="bg-zinc-950 p-2 rounded border border-zinc-800/80 text-[11px] text-zinc-300 line-clamp-2 leading-relaxed">
          {data.prompt || "Chưa có prompt..."}
        </p>
      </div>
      <Handle type="source" position={Position.Right} className="w-2.5 h-2.5 bg-zinc-500 border border-zinc-900 rounded-full" />
    </div>
  );
}

export function GeminiNode({ id, data }: { id: string; data: any }) {
  return (
    <div className={`group relative w-64 bg-zinc-900 border rounded-lg shadow-sm text-xs text-zinc-100 transition-all ${getNodeBorderClass(data.status, data.isBypassed)}`}>
      <NodeToolbar
        nodeId={id}
        isBypassed={data.isBypassed}
        onInspect={data.onInspect}
        onTestStep={data.onTestStep}
        onToggleBypass={data.onToggleBypass}
        onDuplicate={data.onDuplicate}
        onDelete={data.onDelete}
      />
      <Handle type="target" position={Position.Left} className="w-2.5 h-2.5 bg-zinc-500 border border-zinc-900 rounded-full" />
      <div className="px-3 py-2 border-b border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-1.5 font-medium text-zinc-200">
          <Bot className="w-3.5 h-3.5 text-zinc-400" />
          <span>{data.title || "Gemini CDP"}</span>
        </div>
        {data.status ? <StatusBadge status={data.status as JobStatusType} /> : <Badge variant="secondary">Port 9222</Badge>}
      </div>
      <div className="p-3 space-y-1 text-[11px] text-zinc-400">
        <p>• Điều khiển tab Chrome Gemini</p>
        <p>• Tự gõ prompt & bắt ảnh kết quả</p>
      </div>
      <Handle type="source" position={Position.Right} className="w-2.5 h-2.5 bg-zinc-500 border border-zinc-900 rounded-full" />
    </div>
  );
}

export function BirefnetNode({ id, data }: { id: string; data: any }) {
  return (
    <div className={`group relative w-64 bg-zinc-900 border rounded-lg shadow-sm text-xs text-zinc-100 transition-all ${getNodeBorderClass(data.status, data.isBypassed)}`}>
      <NodeToolbar
        nodeId={id}
        isBypassed={data.isBypassed}
        onInspect={data.onInspect}
        onTestStep={data.onTestStep}
        onToggleBypass={data.onToggleBypass}
        onDuplicate={data.onDuplicate}
        onDelete={data.onDelete}
      />
      <Handle type="target" position={Position.Left} className="w-2.5 h-2.5 bg-zinc-500 border border-zinc-900 rounded-full" />
      <div className="px-3 py-2 border-b border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-1.5 font-medium text-zinc-200">
          <Layers className="w-3.5 h-3.5 text-zinc-400" />
          <span>{data.title || "BiRefNet AI"}</span>
        </div>
        {data.status ? <StatusBadge status={data.status as JobStatusType} /> : <Badge variant="secondary">Active</Badge>}
      </div>
      <div className="p-3 space-y-1.5 text-[11px]">
        <div className="flex justify-between items-center text-zinc-400">
          <span>Model:</span>
          <span className="font-mono text-zinc-200">{data.modelName || "birefnet-general"}</span>
        </div>
      </div>
      <Handle type="source" position={Position.Right} className="w-2.5 h-2.5 bg-zinc-500 border border-zinc-900 rounded-full" />
    </div>
  );
}

export function BannerNode({ id, data }: { id: string; data: any }) {
  return (
    <div className={`group relative w-64 bg-zinc-900 border rounded-lg shadow-sm text-xs text-zinc-100 transition-all ${getNodeBorderClass(data.status, data.isBypassed)}`}>
      <NodeToolbar
        nodeId={id}
        isBypassed={data.isBypassed}
        onInspect={data.onInspect}
        onTestStep={data.onTestStep}
        onToggleBypass={data.onToggleBypass}
        onDuplicate={data.onDuplicate}
        onDelete={data.onDelete}
      />
      <Handle type="target" position={Position.Left} className="w-2.5 h-2.5 bg-zinc-500 border border-zinc-900 rounded-full" />
      <div className="px-3 py-2 border-b border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-1.5 font-medium text-zinc-200">
          <LayoutTemplate className="w-3.5 h-3.5 text-zinc-400" />
          <span>{data.title || "Banner Framing"}</span>
        </div>
        {data.status ? <StatusBadge status={data.status as JobStatusType} /> : <Badge variant="secondary">{data.width}x{data.height}</Badge>}
      </div>
      <div className="p-3 space-y-1 text-[11px] text-zinc-400">
        <div className="flex justify-between">
          <span>Preset:</span>
          <span className="text-zinc-200 font-medium">{data.preset || "youtube_thumbnail"}</span>
        </div>
        <div className="flex justify-between items-center">
          <span>Màu nền:</span>
          <span className="font-mono text-zinc-200">{data.bgColor || "#1e1e2e"}</span>
        </div>
      </div>
      <Handle type="source" position={Position.Right} className="w-2.5 h-2.5 bg-zinc-500 border border-zinc-900 rounded-full" />
    </div>
  );
}

export function MultiAspectNode({ id, data }: { id: string; data: any }) {
  return (
    <div className={`group relative w-64 bg-zinc-900 border rounded-lg shadow-sm text-xs text-zinc-100 transition-all ${getNodeBorderClass(data.status, data.isBypassed)}`}>
      <NodeToolbar
        nodeId={id}
        isBypassed={data.isBypassed}
        onInspect={data.onInspect}
        onTestStep={data.onTestStep}
        onToggleBypass={data.onToggleBypass}
        onDuplicate={data.onDuplicate}
        onDelete={data.onDelete}
      />
      <Handle type="target" position={Position.Left} className="w-2.5 h-2.5 bg-zinc-500 border border-zinc-900 rounded-full" />
      <div className="px-3 py-2 border-b border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-1.5 font-medium text-zinc-200">
          <Split className="w-3.5 h-3.5 text-zinc-400" />
          <span>{data.title || "Multi-Aspect Splitter"}</span>
        </div>
        {data.status ? <StatusBadge status={data.status as JobStatusType} /> : <Badge variant="secondary">3 Formats</Badge>}
      </div>
      <div className="p-3 space-y-1.5 text-[11px] text-zinc-400">
        <p className="text-zinc-300 font-mono">1. YouTube 16:9 (1280x720)</p>
        <p className="text-zinc-300 font-mono">2. Instagram 1:1 (1080x1080)</p>
        <p className="text-zinc-300 font-mono">3. TikTok/Story 9:16 (1080x1920)</p>
      </div>
      <Handle type="source" position={Position.Right} className="w-2.5 h-2.5 bg-zinc-500 border border-zinc-900 rounded-full" />
    </div>
  );
}

export function WatermarkNode({ id, data }: { id: string; data: any }) {
  return (
    <div className={`group relative w-64 bg-zinc-900 border rounded-lg shadow-sm text-xs text-zinc-100 transition-all ${getNodeBorderClass(data.status, data.isBypassed)}`}>
      <NodeToolbar
        nodeId={id}
        isBypassed={data.isBypassed}
        onInspect={data.onInspect}
        onTestStep={data.onTestStep}
        onToggleBypass={data.onToggleBypass}
        onDuplicate={data.onDuplicate}
        onDelete={data.onDelete}
      />
      <Handle type="target" position={Position.Left} className="w-2.5 h-2.5 bg-zinc-500 border border-zinc-900 rounded-full" />
      <div className="px-3 py-2 border-b border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-1.5 font-medium text-zinc-200">
          <Stamp className="w-3.5 h-3.5 text-zinc-400" />
          <span>{data.title || "Watermark Overlay"}</span>
        </div>
        {data.status ? <StatusBadge status={data.status as JobStatusType} /> : <Badge variant="secondary">Logo / Text</Badge>}
      </div>
      <div className="p-3 space-y-1 text-[11px] text-zinc-400">
        <p className="truncate text-zinc-200 font-mono">Text: {data.text || "© Studio Flow AI"}</p>
        <p>Vị trí: {data.position || "bottom-right"}</p>
      </div>
      <Handle type="source" position={Position.Right} className="w-2.5 h-2.5 bg-zinc-500 border border-zinc-900 rounded-full" />
    </div>
  );
}

export function TelegramNode({ id, data }: { id: string; data: any }) {
  return (
    <div className={`group relative w-64 bg-zinc-900 border rounded-lg shadow-sm text-xs text-zinc-100 transition-all ${getNodeBorderClass(data.status, data.isBypassed)}`}>
      <NodeToolbar
        nodeId={id}
        isBypassed={data.isBypassed}
        onInspect={data.onInspect}
        onTestStep={data.onTestStep}
        onToggleBypass={data.onToggleBypass}
        onDuplicate={data.onDuplicate}
        onDelete={data.onDelete}
      />
      <Handle type="target" position={Position.Left} className="w-2.5 h-2.5 bg-zinc-500 border border-zinc-900 rounded-full" />
      <div className="px-3 py-2 border-b border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-1.5 font-medium text-zinc-200">
          <Send className="w-3.5 h-3.5 text-zinc-400" />
          <span>{data.title || "Telegram Notify"}</span>
        </div>
        {data.status ? <StatusBadge status={data.status as JobStatusType} /> : <Badge variant="secondary">Bot Webhook</Badge>}
      </div>
      <div className="p-3 space-y-1 text-[11px] text-zinc-400">
        <p className="text-zinc-300">Tự động bắn ảnh về Chat ID</p>
        <p className="truncate font-mono text-zinc-500">Chat: {data.chatId || "Chưa nhập ID"}</p>
      </div>
      <Handle type="source" position={Position.Right} className="w-2.5 h-2.5 bg-zinc-500 border border-zinc-900 rounded-full" />
    </div>
  );
}

export function OutputNode({ id, data }: { id: string; data: any }) {
  return (
    <div className={`group relative w-64 bg-zinc-900 border rounded-lg shadow-sm text-xs text-zinc-100 transition-all ${getNodeBorderClass(data.status, data.isBypassed)}`}>
      <NodeToolbar
        nodeId={id}
        isBypassed={data.isBypassed}
        onInspect={data.onInspect}
        onTestStep={data.onTestStep}
        onToggleBypass={data.onToggleBypass}
        onDuplicate={data.onDuplicate}
        onDelete={data.onDelete}
      />
      <Handle type="target" position={Position.Left} className="w-2.5 h-2.5 bg-zinc-500 border border-zinc-900 rounded-full" />
      <div className="px-3 py-2 border-b border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-1.5 font-medium text-zinc-200">
          <ImageIcon className="w-3.5 h-3.5 text-zinc-400" />
          <span>{data.title || "Banner Output"}</span>
        </div>
        {data.status ? <StatusBadge status={data.status as JobStatusType} /> : <Badge variant="secondary">PNG RGBA</Badge>}
      </div>
      <div className="p-3 space-y-1 text-[11px] text-zinc-400">
        <p className="text-zinc-300">✓ Lưu tự động storage/output/</p>
        <p>✓ Trả URL ảnh về cho Agent</p>
      </div>
    </div>
  );
}

export const nodeTypes = {
  triggerNode: TriggerNode,
  geminiNode: GeminiNode,
  birefnetNode: BirefnetNode,
  bannerNode: BannerNode,
  multiAspectNode: MultiAspectNode,
  watermarkNode: WatermarkNode,
  telegramNode: TelegramNode,
  outputNode: OutputNode,
};
