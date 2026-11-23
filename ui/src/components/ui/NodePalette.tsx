import { 
  Zap, 
  Bot, 
  Layers, 
  LayoutTemplate, 
  Image as ImageIcon,
  Split,
  Stamp,
  Send,
  X
} from 'lucide-react';
import { Button } from './Button';
import { Card } from './Card';
import type { PortalProps } from '../../shared/types/portal.types';

export interface NodePaletteData {
  onAddNode: (type: string, title: string, defaultData?: any) => void;
}

export function NodePalette({
  onDismiss,
  data,
}: PortalProps<NodePaletteData>) {
  const nodeCategories = [
    {
      category: "Trigger & Input",
      items: [
        {
          type: "triggerNode",
          title: "Trigger / Prompt Input",
          desc: "Nhận prompt tạo ảnh qua Webhook hoặc nhập tay",
          icon: Zap,
          data: { title: "1. Trigger / Input", prompt: "A fantasy glowing item" }
        }
      ]
    },
    {
      category: "AI Engines",
      items: [
        {
          type: "geminiNode",
          title: "Gemini Web CDP",
          desc: "Tự động gõ prompt & bắt ảnh kết quả từ tab Gemini Chrome",
          icon: Bot,
          data: { title: "2. Gemini Web CDP", port: 9222 }
        }
      ]
    },
    {
      category: "Image Processing & Matting",
      items: [
        {
          type: "birefnetNode",
          title: "BiRefNet AI Tách Nền",
          desc: "Tách nền siêu nét SOTA (Deep Edge Matting)",
          icon: Layers,
          data: { title: "3. BiRefNet Tách Nền", modelName: "birefnet-general" }
        },
        {
          type: "bannerNode",
          title: "Banner Framing & Filter",
          desc: "Đóng khung ảnh 1280x720, cân chỉnh màu sắc & tương phản",
          icon: LayoutTemplate,
          data: { title: "4. Banner Framing", preset: "youtube_thumbnail", width: 1280, height: 720, bgColor: "#1e1e2e" }
        },
        {
          type: "multiAspectNode",
          title: "Multi-Aspect Splitter",
          desc: "Phân nhánh xuất đồng thời 3 kích thước: 16:9, 1:1, 9:16",
          icon: Split,
          data: { title: "Multi-Aspect Splitter", bgColor: "#1e1e2e" }
        },
        {
          type: "watermarkNode",
          title: "Watermark & Typography",
          desc: "Chèn logo bản quyền hoặc text nghệ thuật lên góc ảnh",
          icon: Stamp,
          data: { title: "Watermark Overlay", text: "© Studio Flow AI", position: "bottom-right", opacity: 180 }
        }
      ]
    },
    {
      category: "Storage & Notification",
      items: [
        {
          type: "telegramNode",
          title: "Telegram Bot Notify",
          desc: "Bắn ảnh kết quả trực tiếp về nhóm chat Telegram",
          icon: Send,
          data: { title: "Telegram Notify", botToken: "", chatId: "" }
        },
        {
          type: "outputNode",
          title: "Banner Output",
          desc: "Lưu trữ tự động và trả kết quả cho Agent / Webhook",
          icon: ImageIcon,
          data: { title: "5. Banner Output" }
        }
      ]
    }
  ];

  return (
    <div className="relative w-full max-w-2xl bg-[#242424] rounded-lg shadow-2xl overflow-hidden p-6 space-y-5 text-zinc-100">
      <div className="flex items-start justify-between pb-3 border-b border-zinc-800 pr-8">
        <div>
          <h3 className="font-semibold text-base text-zinc-100">Thư Viện Node (Node Palette)</h3>
          <p className="text-xs text-zinc-400 mt-0.5">Chọn loại Node muốn thêm vào sơ đồ Canvas</p>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onDismiss} 
          className="absolute top-4 right-4 h-7 w-7 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-md"
          title="Đóng (Esc)"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div className="max-h-[500px] overflow-y-auto space-y-5 pr-1.5 custom-scrollbar">
        {nodeCategories.map((cat, idx) => (
          <div key={idx} className="space-y-2.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
              {cat.category}
            </span>
            <div className="grid grid-cols-2 gap-2.5">
              {cat.items.map((item, itemIdx) => {
                const Icon = item.icon;
                return (
                  <Card
                    key={itemIdx}
                    role="button"
                    tabIndex={0}
                    onClick={() => {
                      data?.onAddNode(item.type, item.title, item.data);
                      onDismiss?.();
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        data?.onAddNode(item.type, item.title, item.data);
                        onDismiss?.();
                      }
                    }}
                    className="p-3 bg-[#1b1b1b] border border-zinc-800 rounded-lg hover:border-zinc-700 transition-colors cursor-pointer flex items-start gap-3 select-none"
                  >
                    <div className="p-2 bg-zinc-900 border border-zinc-800 rounded text-zinc-300 shrink-0">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-zinc-200 truncate">
                        {item.title}
                      </p>
                      <p className="text-[11px] text-zinc-400 leading-relaxed line-clamp-2 mt-0.5">
                        {item.desc}
                      </p>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
