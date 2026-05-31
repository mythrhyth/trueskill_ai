import { ReactNode, useState } from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 border-b bg-gradient-to-b from-muted/30 to-transparent px-6 py-8 md:flex-row md:items-end md:justify-between">
      <div>
        {eyebrow && (
          <span className="inline-flex items-center gap-1.5 rounded-full border bg-background/60 px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--indigo)] animate-pulse-glow" />
            {eyebrow}
          </span>
        )}
        <h1 className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl hover-text-shimmer cursor-default">{title}</h1>
        {description && <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

export function StatCard({
  label,
  value,
  delta,
  hint,
  accent = "indigo",
  reasoning,
}: {
  label: string;
  value: string | number;
  delta?: string;
  hint?: string;
  accent?: "indigo" | "purple" | "cyan" | "success";
  reasoning?: string;
}) {
  const [expanded, setExpanded] = useState(false);
  
  const accentMap = {
    indigo: "from-[var(--indigo)]/15 to-[var(--indigo)]/5",
    purple: "from-[var(--purple)]/15 to-[var(--purple)]/5",
    cyan: "from-[var(--cyan)]/15 to-[var(--cyan)]/5",
    success: "from-[var(--success)]/15 to-[var(--success)]/5",
  } as const;
  const glowMap = {
    indigo: "group-hover:shadow-[0_0_20px_rgba(var(--indigo-rgb),0.2)] group-hover:border-[var(--indigo)]/40",
    purple: "group-hover:shadow-[0_0_20px_rgba(var(--purple-rgb),0.2)] group-hover:border-[var(--purple)]/40",
    cyan: "group-hover:shadow-[0_0_20px_rgba(var(--cyan-rgb),0.2)] group-hover:border-[var(--cyan)]/40",
    success: "group-hover:shadow-[0_0_20px_rgba(var(--success-rgb),0.2)] group-hover:border-[var(--success)]/40",
  } as const;
  const ringMap = {
    indigo: "text-[var(--indigo)]",
    purple: "text-[var(--purple)]",
    cyan: "text-[var(--cyan)]",
    success: "text-[var(--success)]",
  } as const;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      className={cn("group relative overflow-hidden rounded-2xl border bg-card/60 p-5 elegant-shadow transition-all duration-300 hover:-translate-y-1 backdrop-blur-sm", glowMap[accent], expanded && "border-[var(--indigo)]/40")}
    >
      <div className={cn("absolute inset-0 bg-gradient-to-br pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity duration-300", accentMap[accent])} />
      <div className="absolute -top-10 -right-10 h-24 w-24 rounded-full bg-white/5 blur-2xl group-hover:bg-white/10 transition-colors" />
      <div className="relative z-10">
        <div className="flex items-start justify-between">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
          {reasoning && (
            <button 
              onClick={() => setExpanded(!expanded)}
              className="flex h-6 w-6 items-center justify-center rounded-full bg-muted/50 hover:bg-muted transition-colors relative"
            >
              <Sparkles className={cn("h-3.5 w-3.5 transition-colors", expanded ? "text-[var(--indigo)]" : "text-muted-foreground group-hover:text-foreground")} />
              {expanded && <div className="absolute inset-0 rounded-full animate-ping bg-[var(--indigo)]/20" />}
            </button>
          )}
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <motion.span 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className={cn("text-3xl font-bold tracking-tight", ringMap[accent])}
          >
            {value}
          </motion.span>
          {delta && <span className="text-xs font-bold text-[var(--success)] tracking-wide">{delta}</span>}
        </div>
        {hint && <p className="mt-1 text-xs text-muted-foreground/80">{hint}</p>}
        
        <AnimatePresence>
          {expanded && reasoning && (
            <motion.div
              initial={{ height: 0, opacity: 0, marginTop: 0 }}
              animate={{ height: "auto", opacity: 1, marginTop: 14 }}
              exit={{ height: 0, opacity: 0, marginTop: 0 }}
              className="overflow-hidden"
            >
              <div className="rounded-xl border border-white/10 bg-background/60 p-3 backdrop-blur-md text-xs text-foreground/90 leading-relaxed shadow-inner">
                {reasoning}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

export function GlassCard({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("glass rounded-2xl p-5", className)}>{children}</div>;
}

export function ScoreRing({ value, size = 80, label }: { value: number; size?: number; label?: string }) {
  const r = (size - 10) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (value / 100) * c;
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <div className="absolute inset-0 bg-[var(--indigo)]/10 blur-xl rounded-full animate-pulse" />
      <motion.svg 
        width={size} 
        height={size} 
        className="-rotate-90 relative z-10 drop-shadow-[0_0_12px_rgba(var(--indigo-rgb),0.5)]"
      >
        <circle cx={size / 2} cy={size / 2} r={r} stroke="var(--muted)" strokeWidth="6" fill="none" />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="url(#ringGrad)"
          strokeWidth="6"
          fill="none"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.8, ease: "easeOut", delay: 0.1 }}
          strokeLinecap="round"
        />
        <defs>
          <linearGradient id="ringGrad" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="var(--indigo)" />
            <stop offset="100%" stopColor="var(--purple)" />
          </linearGradient>
        </defs>
      </motion.svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
        <motion.span 
          initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.8, duration: 0.5 }}
          className="text-lg font-bold tracking-tight text-foreground"
        >
          {value}
        </motion.span>
        {label && (
          <motion.span 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1, duration: 0.5 }}
            className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground mt-0.5"
          >
            {label}
          </motion.span>
        )}
      </div>
    </div>
  );
}
