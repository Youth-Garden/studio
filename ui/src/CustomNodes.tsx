import { 
  Zap, 
  Bot, 
  Layers, 
  LayoutTemplate, 
  Image as ImageIcon,
  Split, 
  Stamp, 
  Send, 
  Cpu 
} from 'lucide-react';
import { BaseNodeCard } from './features/editor/components/nodes/base-node-card';

export function TriggerNode({ id, data }: { id: string; data: any }) {
  return (
    <BaseNodeCard
      id={id}
      data={data}
      icon={<Zap className="w-3.5 h-3.5 text-zinc-400" />}
      title={data.title || "Trigger / Input"}
      badgeLabel="Webhook"
      hasInput={false}
      hasOutput={true}
    >
      <div className="space-y-2 pt-0.5">
        <label className="text-[10px] text-zinc-400 font-medium">Prompt tạo ảnh / Payload:</label>
        <p className="bg-[var(--bg-body)] p-2.5 rounded-lg border-0 text-[11px] text-zinc-300 line-clamp-2 leading-relaxed font-mono">
          {data.prompt || "Chưa có prompt..."}
        </p>
      </div>
    </BaseNodeCard>
  );
}

export function GeminiNode({ id, data }: { id: string; data: any }) {
  return (
    <BaseNodeCard
      id={id}
      data={data}
      icon={<Bot className="w-3.5 h-3.5 text-zinc-400" />}
      title={data.title || "Gemini CDP"}
      badgeLabel="Port 9222"
    >
      <div className="space-y-1 text-zinc-400">
        <p className="text-zinc-300">• Điều khiển tab Chrome Gemini CDP</p>
        <p>• Tự gõ prompt & bắt ảnh kết quả</p>
      </div>
    </BaseNodeCard>
  );
}

export function BirefnetNode({ id, data }: { id: string; data: any }) {
  return (
    <BaseNodeCard
      id={id}
      data={data}
      icon={<Layers className="w-3.5 h-3.5 text-zinc-400" />}
      title={data.title || "BiRefNet AI"}
      badgeLabel="Active"
    >
      <div className="flex justify-between items-center text-zinc-400">
        <span>Model:</span>
        <span className="font-mono text-zinc-200 bg-[var(--bg-body)] px-1.5 py-0.5 rounded border-0">
          {data.modelName || "birefnet-general"}
        </span>
      </div>
    </BaseNodeCard>
  );
}

export function BannerNode({ id, data }: { id: string; data: any }) {
  return (
    <BaseNodeCard
      id={id}
      data={data}
      icon={<LayoutTemplate className="w-3.5 h-3.5 text-zinc-400" />}
      title={data.title || "Banner Framing"}
      badgeLabel={`${data.width || 1280}x${data.height || 720}`}
    >
      <div className="space-y-1 text-zinc-400">
        <div className="flex justify-between">
          <span>Preset:</span>
          <span className="text-zinc-200 font-medium">{data.preset || "youtube_thumbnail"}</span>
        </div>
        <div className="flex justify-between items-center">
          <span>Màu nền:</span>
          <span className="font-mono text-zinc-200">{data.bgColor || "#1e1e2e"}</span>
        </div>
      </div>
    </BaseNodeCard>
  );
}

export function MultiAspectNode({ id, data }: { id: string; data: any }) {
  return (
    <BaseNodeCard
      id={id}
      data={data}
      icon={<Split className="w-3.5 h-3.5 text-zinc-400" />}
      title={data.title || "Multi-Aspect Splitter"}
      badgeLabel="3 Formats"
    >
      <div className="space-y-1 text-zinc-400 font-mono text-[10px]">
        <p className="text-zinc-300">1. YouTube 16:9 (1280x720)</p>
        <p className="text-zinc-300">2. Instagram 1:1 (1080x1080)</p>
        <p className="text-zinc-300">3. TikTok/Story 9:16 (1080x1920)</p>
      </div>
    </BaseNodeCard>
  );
}

export function WatermarkNode({ id, data }: { id: string; data: any }) {
  return (
    <BaseNodeCard
      id={id}
      data={data}
      icon={<Stamp className="w-3.5 h-3.5 text-zinc-400" />}
      title={data.title || "Watermark Overlay"}
      badgeLabel="Overlay"
    >
      <div className="space-y-1 text-zinc-400">
        <p className="truncate text-zinc-200 font-mono">Text: {data.text || "© Studio Flow AI"}</p>
        <p>Vị trí: {data.position || "bottom-right"}</p>
      </div>
    </BaseNodeCard>
  );
}

export function TelegramNode({ id, data }: { id: string; data: any }) {
  return (
    <BaseNodeCard
      id={id}
      data={data}
      icon={<Send className="w-3.5 h-3.5 text-zinc-400" />}
      title={data.title || "Telegram Notify"}
      badgeLabel="Webhook"
    >
      <div className="space-y-1 text-zinc-400">
        <p className="text-zinc-300">Tự động bắn ảnh về Chat ID</p>
        <p className="truncate font-mono text-zinc-500">Chat: {data.chatId || "Chưa nhập ID"}</p>
      </div>
    </BaseNodeCard>
  );
}

export function OutputNode({ id, data }: { id: string; data: any }) {
  return (
    <BaseNodeCard
      id={id}
      data={data}
      icon={<ImageIcon className="w-3.5 h-3.5 text-zinc-400" />}
      title={data.title || "Banner Output"}
      badgeLabel="PNG RGBA"
      hasInput={true}
      hasOutput={false}
    >
      <div className="space-y-1 text-zinc-400">
        <p className="text-zinc-300">✓ Lưu tự động storage/output/</p>
        <p>✓ Trả URL ảnh về cho Agent</p>
      </div>
    </BaseNodeCard>
  );
}

export function AgentBuilderNode({ id, data }: { id: string; data: any }) {
  return (
    <BaseNodeCard
      id={id}
      data={data}
      icon={<Cpu className="w-3.5 h-3.5 text-zinc-400" />}
      title={data.title || "Agent Code Builder"}
      badgeLabel="CDP + AkiMCP"
    >
      <div className="space-y-1 text-zinc-400">
        <div className="flex items-center justify-between">
          <span className="text-zinc-500">Target Agent:</span>
          <span className="text-zinc-200 font-mono">{data.targetAgent || "Gemini Web (AkiMCP)"}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-zinc-500">CDP Port:</span>
          <span className="text-zinc-200 font-mono">9222 (Auto Pool)</span>
        </div>
        <p className="text-zinc-400 truncate font-mono text-[10px]">
          {data.planPath ? `Plan: ${data.planPath.split('\\').pop()}` : "Chờ Orca dispatch plan..."}
        </p>
      </div>
    </BaseNodeCard>
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
  agentBuilderNode: AgentBuilderNode,
};
