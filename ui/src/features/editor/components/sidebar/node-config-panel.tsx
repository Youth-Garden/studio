import type { Node } from '@xyflow/react';
import { Sliders } from 'lucide-react';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent, 
  Badge, 
  Input, 
  FormField, 
  Select, 
  Textarea, 
  CodeBlock, 
  CodeBlockHeader, 
  CodeBlockTitle, 
  CodeBlockCopyButton, 
  CodeBlockContent 
} from '../../../../shared/components';

export interface NodeConfigPanelProps {
  selectedNode: Node | null;
  onUpdateNodeData: (key: string, value: any) => void;
}

export function NodeConfigPanel({
  selectedNode,
  onUpdateNodeData,
}: NodeConfigPanelProps) {
  if (!selectedNode) {
    return (
      <Card className="p-5 text-center text-zinc-400 space-y-2 border-0">
        <Sliders className="w-5 h-5 mx-auto text-zinc-500" />
        <p>Click vào một Node bất kỳ trên sơ đồ để chỉnh sửa thông số.</p>
      </Card>
    );
  }

  const data = selectedNode.data as Record<string, any>;

  return (
    <div className="flex-1 space-y-3 text-xs">
      <Card className="border-0">
        <CardHeader className="p-3.5 border-b border-[var(--border-color)]">
          <div className="flex justify-between items-center">
            <CardTitle className="text-xs font-semibold">{data.title || selectedNode.id}</CardTitle>
            <Badge variant="secondary" className="border-0 text-[10px]">{selectedNode.type}</Badge>
          </div>
        </CardHeader>
        <CardContent className="p-3.5 space-y-4">
          {/* Node Trigger Form */}
          {(selectedNode.type === 'triggerNode' || selectedNode.id.includes('trigger')) && (
            <div className="space-y-2 mb-4">
              <label className="text-[11px] text-zinc-400 font-medium">Prompt tạo ảnh / Payload:</label>
              <Textarea
                rows={4}
                value={data.prompt || ''}
                placeholder="Nhập nội dung prompt chi tiết..."
                onChange={(e) => onUpdateNodeData('prompt', e.target.value)}
              />
              <div className="text-[10px] text-zinc-400 pt-1">
                Endpoint: <code className="text-zinc-200 font-mono">POST /api/workflow/execute</code>
              </div>
            </div>
          )}

          {/* Node Banner Form */}
          {(selectedNode.type === 'bannerNode' || selectedNode.id.includes('banner')) && (
            <div className="space-y-2.5">
              <FormField label="Preset Kích thước:">
                <Select
                  value={data.preset || 'youtube_thumbnail'}
                  onValueChange={(val) => {
                    if (val === 'youtube_thumbnail') { 
                      onUpdateNodeData('width', 1280); 
                      onUpdateNodeData('height', 720); 
                    } else if (val === 'fhd_banner') { 
                      onUpdateNodeData('width', 1920); 
                      onUpdateNodeData('height', 1080); 
                    } else if (val === 'square_post') { 
                      onUpdateNodeData('width', 1080); 
                      onUpdateNodeData('height', 1080); 
                    }
                    onUpdateNodeData('preset', val);
                  }}
                  options={[
                    { value: 'youtube_thumbnail', label: 'YouTube Thumbnail (1280x720)' },
                    { value: 'fhd_banner', label: 'Full HD (1920x1080)' },
                    { value: 'square_post', label: 'Square (1080x1080)' },
                  ]}
                />
              </FormField>

              <div className="space-y-1">
                <label className="text-[11px] text-zinc-400 font-medium">Màu nền Banner:</label>
                <div className="flex items-center gap-2">
                  <input 
                    type="color" 
                    value={data.bgColor || '#1e1e2e'}
                    onChange={(e) => onUpdateNodeData('bgColor', e.target.value)}
                    className="w-7 h-7 rounded border-0 bg-transparent cursor-pointer"
                  />
                  <Input
                    value={data.bgColor || '#1e1e2e'}
                    onChange={(e) => onUpdateNodeData('bgColor', e.target.value)}
                    className="font-mono text-[11px]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Node Gemini Form */}
          {selectedNode.type === 'geminiNode' && (
            <div className="space-y-1.5">
              <FormField 
                label="Cổng Chrome Remote Debugging (CDP):"
                description="Mặc định: 9222 (Chrome attach session)"
              >
                <Input
                  type="number"
                  value={data.port || 9222}
                  onChange={(e) => onUpdateNodeData('port', parseInt(e.target.value) || 9222)}
                  className="font-mono text-xs"
                />
              </FormField>
            </div>
          )}

          {/* Node BiRefNet Form */}
          {(selectedNode.id === 'node-birefnet' || selectedNode.type === 'birefnetNode') && (
            <div className="space-y-1.5">
              <FormField label="Model AI Tách nền:">
                <Select
                  value={data.modelName || 'birefnet-general'}
                  onValueChange={(val) => onUpdateNodeData('modelName', val)}
                  options={[
                    { 
                      value: 'birefnet-general', 
                      label: 'BiRefNet (SOTA 2024 - Khuyên dùng)',
                      description: 'Độ chính xác cao nhất, tách tóc và biên mờ mịn màng'
                    },
                    { 
                      value: 'isnet-general-use', 
                      label: 'IS-Net DIS',
                      description: 'Model nhẹ, tốc độ suy luận nhanh'
                    },
                  ]}
                />
              </FormField>
            </div>
          )}

          {/* Node Agent Builder Form */}
          {selectedNode.type === 'agentBuilderNode' && (
            <div className="space-y-3">
              <FormField label="Target Web Agent:">
                <Select
                  value={data.targetAgent || 'gemini'}
                  onValueChange={(val) => onUpdateNodeData('targetAgent', val)}
                  options={[
                    { value: 'gemini', label: 'Gemini Web (CDP + AkiMCP)' },
                    { value: 'claude', label: 'Claude.ai Web' },
                    { value: 'chatgpt', label: 'ChatGPT Web' },
                  ]}
                />
              </FormField>
              <FormField label="Đường dẫn Plan Markdown:" description="Tệp kế hoạch từ Orca Architect">
                <Input
                  value={data.planPath || ''}
                  onChange={(e) => onUpdateNodeData('planPath', e.target.value)}
                  placeholder="docs/plans/..."
                  className="font-mono text-[11px]"
                />
              </FormField>
            </div>
          )}

          {/* Runtime JSON CodeBlock có khoảng cách gap rộng rãi, rõ ràng */}
          <div className="pt-5 mt-4 border-t border-[var(--border-color)] space-y-2.5">
            <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block">
              Thông số Runtime JSON:
            </label>
            <CodeBlock size="sm" className="max-h-52 border-0">
              <CodeBlockHeader className="py-1 px-2.5">
                <CodeBlockTitle>data.json</CodeBlockTitle>
                <CodeBlockCopyButton value={JSON.stringify(data, null, 2)} />
              </CodeBlockHeader>
              <CodeBlockContent className="p-2.5 text-[10px] max-h-40">
                {JSON.stringify(data, null, 2)}
              </CodeBlockContent>
            </CodeBlock>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
