import { ArrowRight, Trash2 } from 'lucide-react';
import { Card, Badge } from '../../../shared/components';
import { translations, type Locale } from '../../../lib/i18n';
import type { WorkflowItem } from '../../modals/flow-hub-modal';

export interface WorkflowCardProps {
  workflow: WorkflowItem;
  locale: Locale;
  onOpen: (id: string) => void;
  onDelete?: (id: string) => void;
}

export function WorkflowCard({ workflow, locale, onOpen, onDelete }: WorkflowCardProps) {
  const t = translations[locale] || translations.vi;

  return (
    <Card
      role="button"
      tabIndex={0}
      variant="solid"
      onClick={() => onOpen(workflow.id)}
      className="p-5 flex flex-col justify-between hover:border-zinc-700/80 transition-colors cursor-pointer group relative overflow-hidden"
    >
      <div>
        <div className="flex items-start justify-between gap-2 mb-2">
          {/* Giữ nguyên màu chữ, không đổi màu khi hover */}
          <h3 className="font-semibold text-sm text-[var(--text-primary)] transition-colors">
            {workflow.name}
          </h3>
          <Badge variant="outline" className="text-[10px] shrink-0 font-normal">
            {t.lastOpened}
          </Badge>
        </div>

        <p className="text-xs text-[var(--text-secondary)] line-clamp-2 leading-relaxed">
          {workflow.description || "Quy trình xử lý ảnh tự động với AI"}
        </p>
      </div>

      <div className="pt-4 mt-4 border-t border-[var(--border-color)] flex items-center justify-between text-[11px] text-[var(--text-secondary)]">
        <div className="flex items-center gap-3">
          <span>{workflow.nodesCount || 5} Nodes</span>
          <span>•</span>
          <span>{workflow.edgesCount || 4} Edges</span>
        </div>

        <div className="flex items-center gap-1">
          {onDelete && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(workflow.id);
              }}
              className="p-1 hover:text-red-400 transition-colors text-zinc-500"
              title="Xóa workflow"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}

          <span className="text-[var(--text-primary)] font-medium flex items-center gap-1">
            Mở Editor <ArrowRight className="w-3 h-3" />
          </span>
        </div>
      </div>
    </Card>
  );
}
