import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";
import { useRipple } from "../../shared/hooks/use-ripple";

export const cardVariants = cva(
  "relative overflow-hidden rounded-xl text-[var(--text-primary)] transition-colors select-none border-0",
  {
    variants: {
      variant: {
        default: "bg-[var(--bg-card)]",
        subtle: "bg-[var(--bg-surface)]",
        solid: "bg-[var(--bg-card)] cursor-pointer hover:bg-[var(--bg-surface)]",
        interactive: "bg-[var(--bg-surface)] cursor-pointer hover:bg-[var(--bg-card)]",
        active: "bg-[#2d2d31] text-[var(--text-primary)] cursor-pointer ring-1 ring-white/10",
      },
      active: {
        true: "cursor-pointer bg-[#2d2d31] ring-1 ring-white/10",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      active: false,
    },
  }
);

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  isActive?: boolean;
  disableRipple?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, active, isActive, disableRipple = false, onClick, children, ...props }, ref) => {
    const isActuallyActive = Boolean(active ?? isActive);
    const isClickable = variant === "solid" || variant === "interactive" || Boolean(onClick);
    const { createRipple, RippleContainer } = useRipple<HTMLDivElement>();

    const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
      if (!disableRipple && isClickable) {
        createRipple(e);
      }
      onClick?.(e);
    };

    return (
      <div
        ref={ref}
        onClick={handleClick}
        className={cn(
          cardVariants({ 
            variant: isActuallyActive && !variant ? "active" : variant,
            active: isActuallyActive,
          }),
          className
        )}
        {...props}
      >
        {children}
        {!disableRipple && isClickable && <RippleContainer />}
      </div>
    );
  }
);

Card.displayName = "Card";

export function CardHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex flex-col space-y-1.5 p-4", className)}
      {...props}
    />
  );
}

export function CardTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn("font-medium tracking-tight text-[var(--text-primary)]", className)}
      {...props}
    />
  );
}

export function CardDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn("text-xs text-[var(--text-secondary)]", className)}
      {...props}
    />
  );
}

export function CardContent({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-4 pt-0", className)} {...props} />;
}

export function CardFooter({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex items-center p-4 pt-0", className)}
      {...props}
    />
  );
}
