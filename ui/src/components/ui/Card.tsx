import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";
import { useRipple } from "../../shared/hooks/use-ripple";

export const cardVariants = cva(
  "relative overflow-hidden rounded-lg text-zinc-100 transition-colors select-none",
  {
    variants: {
      variant: {
        default: "bg-[#262626]",
        subtle: "bg-[#1b1b1b]",
        solid: "bg-[#18181a] cursor-pointer hover:bg-[#1d1d20]",
        interactive: "bg-[#1b1b1b] cursor-pointer hover:bg-[#1f1f22]",
        active: "bg-[#2d2d32] text-zinc-100 cursor-pointer",
      },
      active: {
        true: "cursor-pointer",
        false: "",
      },
    },
    compoundVariants: [
      // Khi variant là "solid", active nâng sáng background vừa phải (#2b2b30), không shadow, không chói
      {
        variant: "solid",
        active: true,
        className: "bg-[#2b2b30]",
      },
      // Khi variant là "interactive"
      {
        variant: "interactive",
        active: true,
        className: "bg-[#28282c] cursor-pointer",
      },
      // Khi variant là "default" hoặc "subtle"
      {
        variant: "default",
        active: true,
        className: "bg-[#323236]",
      },
      {
        variant: "subtle",
        active: true,
        className: "bg-[#26262a]",
      },
    ],
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
            active: isActuallyActive 
          }), 
          className
        )}
        {...props}
      >
        {children}
        <RippleContainer />
      </div>
    );
  }
);
Card.displayName = "Card";

export const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col space-y-1.5 p-4", className)} {...props} />
  )
);
CardHeader.displayName = "CardHeader";

export const CardTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn("text-xs font-semibold leading-none tracking-tight text-zinc-100", className)}
      {...props}
    />
  )
);
CardTitle.displayName = "CardTitle";

export const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn("text-[11px] text-zinc-400", className)} {...props} />
  )
);
CardDescription.displayName = "CardDescription";

export const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("p-4 pt-0 text-xs", className)} {...props} />
  )
);
CardContent.displayName = "CardContent";

export const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex items-center p-4 pt-0", className)} {...props} />
  )
);
CardFooter.displayName = "CardFooter";
