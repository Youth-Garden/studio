import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../../shared/components/Dialog";
import { Button } from "../../shared/components/Button";
import type { PortalProps } from "../../shared/types/portal.types";

export interface ModalData {
  title: string;
  description?: string;
  content?: string;
  showCloseButton?: boolean;
}

export function NotificationModal({
  onDismiss,
  data,
}: PortalProps<ModalData>) {
  return (
    <Dialog 
      onDismiss={onDismiss} 
      showCloseButton={data?.showCloseButton !== false}
      className="max-w-md bg-[#242424]"
    >
      <DialogHeader>
        <DialogTitle>{data?.title || "Thông báo"}</DialogTitle>
      </DialogHeader>
      
      <DialogDescription>
        {data?.description || data?.content}
      </DialogDescription>

      <DialogFooter>
        <Button variant="default" size="sm" onClick={onDismiss}>
          Xác nhận
        </Button>
      </DialogFooter>
    </Dialog>
  );
}

