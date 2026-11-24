import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "../../lib/utils";

interface AccordionContextType {
  openItems: string[];
  toggleItem: (value: string) => void;
}

const AccordionContext = React.createContext<AccordionContextType | undefined>(undefined);

export function Accordion({
  children,
  defaultValue = [],
  className,
}: {
  children: React.ReactNode;
  defaultValue?: string[];
  className?: string;
}) {
  const [openItems, setOpenItems] = React.useState<string[]>(defaultValue);

  const toggleItem = (value: string) => {
    setOpenItems((prev) =>
      prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]
    );
  };

  return (
    <AccordionContext.Provider value={{ openItems, toggleItem }}>
      <div className={cn("space-y-1.5", className)}>{children}</div>
    </AccordionContext.Provider>
  );
}

export function AccordionItem({
  value,
  children,
  className,
}: {
  value: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("rounded-lg bg-[var(--bg-surface)] border-0 overflow-hidden", className)}>
      {React.Children.map(children, (child) =>
        React.isValidElement(child) ? React.cloneElement(child as any, { value }) : child
      )}
    </div>
  );
}

export function AccordionTrigger({
  value,
  children,
  className,
}: {
  value?: string;
  children: React.ReactNode;
  className?: string;
}) {
  const context = React.useContext(AccordionContext);
  if (!context || !value) return null;

  const isOpen = context.openItems.includes(value);

  return (
    <button
      type="button"
      onClick={() => context.toggleItem(value)}
      className={cn(
        "flex w-full items-center justify-between px-3.5 py-2.5 text-xs font-medium text-zinc-200 transition-colors hover:text-zinc-100 select-none",
        className
      )}
    >
      <span>{children}</span>
      <ChevronDown
        className={cn(
          "w-3.5 h-3.5 text-zinc-400 transition-transform duration-200",
          isOpen && "rotate-180"
        )}
      />
    </button>
  );
}

export function AccordionContent({
  value,
  children,
  className,
}: {
  value?: string;
  children: React.ReactNode;
  className?: string;
}) {
  const context = React.useContext(AccordionContext);
  if (!context || !value) return null;

  const isOpen = context.openItems.includes(value);
  if (!isOpen) return null;

  return (
    <div className={cn("px-3.5 pb-3 text-xs text-zinc-400 pt-1", className)}>
      {children}
    </div>
  );
}
