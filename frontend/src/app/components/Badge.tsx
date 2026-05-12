import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '../lib/utils';

interface BadgeProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
}

export const Badge = forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    const variants = {
      default: 'bg-primary/10 text-primary',
      success: 'bg-[#10b981]/10 text-[#10b981]',
      warning: 'bg-[#f59e0b]/10 text-[#f59e0b]',
      danger: 'bg-[#ef4444]/10 text-[#ef4444]',
      info: 'bg-[#06b6d4]/10 text-[#06b6d4]',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
          variants[variant],
          className
        )}
        {...props}
      />
    );
  }
);

Badge.displayName = 'Badge';
