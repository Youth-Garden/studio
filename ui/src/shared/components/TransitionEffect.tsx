import * as React from 'react';
import { cn } from '../../lib/utils';

export interface TransitionEffectProps extends React.HTMLAttributes<HTMLDivElement> {
  show: boolean;
  /** Class CSS khi mount / bắt đầu xuất hiện (ví dụ: 'opacity-0 scale-95') */
  enter?: string;
  /** Class CSS khi đã mount hoàn tất (ví dụ: 'opacity-100 scale-100 transition-all duration-200') */
  enterActive?: string;
  /** Class CSS khi chuẩn bị unmount / biến mất (ví dụ: 'opacity-100 scale-100') */
  exit?: string;
  /** Class CSS trong quá trình biến mất (ví dụ: 'opacity-0 scale-95 transition-all duration-150') */
  exitActive?: string;
  /** Thời gian unmount timeout tính bằng ms để remove DOM sau khi fade out xong. Mặc định 200ms */
  duration?: number;
  /** Có unmount hẳn khỏi DOM khi show = false hay chỉ ẩn css. Mặc định true (unmount on exit) */
  unmountOnExit?: boolean;
  children: React.ReactNode;
}

export function TransitionEffect({
  show,
  enter = 'opacity-0',
  enterActive = 'opacity-100 transition-opacity duration-200 ease-out',
  exit = 'opacity-100',
  exitActive = 'opacity-0 transition-opacity duration-150 ease-in',
  duration = 200,
  unmountOnExit = true,
  className,
  children,
  ...props
}: TransitionEffectProps) {
  const [shouldRender, setShouldRender] = React.useState(show);
  const [stage, setStage] = React.useState<'mounted' | 'entering' | 'exiting' | 'idle'>(
    show ? 'mounted' : 'idle'
  );

  React.useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    if (show) {
      setShouldRender(true);
      setStage('entering');
      // Cho một tick animation frame để trình duyệt áp dụng class enter trước
      const raf = requestAnimationFrame(() => {
        setStage('mounted');
      });
      return () => cancelAnimationFrame(raf);
    } else {
      setStage('exiting');
      timer = setTimeout(() => {
        setStage('idle');
        if (unmountOnExit) {
          setShouldRender(false);
        }
      }, duration);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [show, duration, unmountOnExit]);

  if (!shouldRender && unmountOnExit) {
    return null;
  }

  let transitionClass = '';
  if (stage === 'entering') {
    transitionClass = enter;
  } else if (stage === 'mounted') {
    transitionClass = enterActive;
  } else if (stage === 'exiting') {
    transitionClass = exitActive;
  } else if (stage === 'idle' && !unmountOnExit) {
    transitionClass = 'opacity-0 pointer-events-none hidden';
  }

  return (
    <div className={cn(transitionClass, className)} {...props}>
      {children}
    </div>
  );
}
