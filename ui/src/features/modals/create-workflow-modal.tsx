import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter, Input, Button } from '../../shared/components';
import type { PortalProps } from '../../shared/types/portal.types';
import { translations, type Locale } from '../../lib/i18n';
import { useSettingsStore } from '../../shared/store/settings.store';

export interface CreateWorkflowModalData {
  onCreate: (name: string) => void;
}

export function CreateWorkflowModal({
  onDismiss,
  data,
}: PortalProps<CreateWorkflowModalData>) {
  const [flowName, setFlowName] = useState('');
  const { locale } = useSettingsStore();
  const t = translations[locale as Locale] || translations.vi;

  const handleCreate = () => {
    if (!flowName.trim()) return;
    data?.onCreate(flowName.trim());
    onDismiss?.();
  };

  return (
    <Dialog onDismiss={onDismiss} className="max-w-md bg-[#222225]">
      <DialogHeader>
        <DialogTitle>{t.createNewWorkflow}</DialogTitle>
        <DialogDescription>
          Đặt tên cho quy trình đồ họa của bạn. Bạn có thể kéo thả bổ sung các Node sau.
        </DialogDescription>
      </DialogHeader>

      <div className="py-3">
        <Input
          value={flowName}
          onChange={(e) => setFlowName(e.target.value)}
          placeholder={t.newWorkflowPlaceholder}
          autoFocus
          onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
        />
      </div>

      <DialogFooter>
        <Button 
          variant="default" 
          size="sm" 
          onClick={handleCreate} 
          disabled={!flowName.trim()} 
          className="gap-1.5"
        >
          <span>{t.createAndOpen}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
