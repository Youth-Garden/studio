import {
  ReactFlow,
  Background,
  Controls,
  ControlButton,
  MiniMap,
  BackgroundVariant,
  type Node,
  type Edge,
  type OnNodesChange,
  type OnEdgesChange,
  type OnConnect,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Settings } from 'lucide-react';
import { nodeTypes } from '../../../CustomNodes';
import { useSettingsStore } from '../../../shared/store/settings.store';
import { translations, type Locale } from '../../../lib/i18n';

export interface EditorCanvasProps {
  nodes: Node[];
  edges: Edge[];
  onNodesChange: OnNodesChange<Node>;
  onEdgesChange: OnEdgesChange<Edge>;
  onConnect: OnConnect;
  onNodeClick: (node: Node) => void;
  onContextMenu: (e: React.MouseEvent<HTMLDivElement>) => void;
  onOpenSettings: () => void;
}

export function EditorCanvas({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  onNodeClick,
  onContextMenu,
  onOpenSettings,
}: EditorCanvasProps) {
  const { canvasPattern, locale } = useSettingsStore();
  const t = translations[locale as Locale] || translations.vi;

  return (
    <div className="flex-1 h-full relative overflow-hidden">
      <div 
        className="w-full h-full relative"
        onContextMenu={onContextMenu}
      >
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          onNodeClick={(_, node) => onNodeClick(node)}
          fitView
          className="bg-[var(--bg-body)]"
        >
          {canvasPattern !== 'none' && (
            <Background 
              variant={
                canvasPattern === 'dots' 
                  ? BackgroundVariant.Dots 
                  : canvasPattern === 'lines' 
                  ? BackgroundVariant.Lines 
                  : BackgroundVariant.Cross
              }
              color="var(--border-emphasized)" 
              gap={20} 
              size={canvasPattern === 'cross' ? 6 : 1} 
            />
          )}
          <Controls className="bg-[var(--bg-surface)] border border-[var(--border-color)] text-[var(--text-primary)] fill-[var(--text-primary)]">
            <ControlButton
              onClick={onOpenSettings}
              title={t.settings}
              aria-label={t.settings}
            >
              <Settings className="w-3.5 h-3.5 text-zinc-300 hover:text-zinc-100" />
            </ControlButton>
          </Controls>
          <MiniMap 
            nodeColor="#525252" 
            maskColor="rgba(27, 27, 27, 0.85)" 
            className="bg-[#262626] border border-zinc-800 rounded-md" 
          />
        </ReactFlow>
      </div>
    </div>
  );
}
