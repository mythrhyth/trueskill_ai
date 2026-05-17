import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { PageHeader, ScoreRing } from "@/components/ui-kit/Primitives";
import { Check, X, Sparkles, ShieldCheck, Github, Award, Code2, Cpu } from "lucide-react";

export const Route = createFileRoute("/insights")({
  head: () => ({ meta: [{ title: "Explainable AI — TrueSkill AI" }] }),
  component: InsightsPage,
});

const reasons = [
  { positive: true, icon: Github, title: "Strong GitHub consistency", weight: 22, conf: 96, detail: "247★ across 18 repos · 26-week active streak · meaningful commits, not boilerplate." },
  { positive: true, icon: Award, title: "Verified certifications", weight: 14, conf: 100, detail: "5 verified credentials including AWS SA-Associate, Kubernetes CKAD." },
  { positive: true, icon: Code2, title: "High backend project complexity", weight: 18, conf: 92, detail: "3 production-grade APIs with auth, observability, and >70% test coverage." },
  { positive: true, icon: Cpu, title: "Strong DSA profile", weight: 16, conf: 90, detail: "1,820 LeetCode solved · 124 hard problems · contest rating 1862." },
  { positive: true, icon: ShieldCheck, title: "Cross-source authenticity", weight: 12, conf: 97, detail: "Activity timelines align across GitHub, LinkedIn, and coding platforms." },
  { positive: false, icon: Cpu, title: "Limited DevOps exposure", weight: -8, conf: 80, detail: "No production Kubernetes or IaC repos in the past 12 months." },
  { positive: false, icon: Code2, title: "Frontend depth narrow", weight: -4, conf: 70, detail: "React present, but no advanced state mgmt or design-system contributions." },
];

function InsightsPage() {
  return (
    <div>
      <PageHeader
        eyebrow="Explainable AI"
        title="Why did the system generate this score?"
        description="Every score includes the signals, weight, and confidence behind it. Fully auditable, fully transparent."
      />

      <div className="grid gap-6 p-6 lg:grid-cols-3">
        <div className="rounded-2xl border bg-gradient-to-br from-[var(--indigo)]/10 to-[var(--purple)]/10 p-6 elegant-shadow">
          <div className="flex items-center gap-4">
            <ScoreRing value={92} size={120} label="TrueSkill" />
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Final Score</p>
              <p className="text-2xl font-semibold">Elite Engineer</p>
              <p className="mt-1 text-xs text-muted-foreground">Top 6% across analyzed profiles</p>
            </div>
          </div>
          <div className="mt-6 space-y-3">
            {[
              { l: "Depth", v: 88, c: "var(--indigo)" },
              { l: "Authenticity", v: 97, c: "var(--success)" },
              { l: "Diversity", v: 76, c: "var(--cyan)" },
              { l: "Consistency", v: 91, c: "var(--purple)" },
            ].map(s => (
              <div key={s.l}>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{s.l}</span>
                  <span className="font-medium">{s.v}</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${s.v}%` }} transition={{ duration: 1 }} className="h-full rounded-full" style={{ background: s.c }} />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 rounded-xl border bg-card/60 p-3">
            <div className="mb-1 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[var(--purple)]" />
              <p className="text-xs font-semibold">Model summary</p>
            </div>
            <p className="text-xs text-muted-foreground">
              Score derived from 7 weighted signals across 4 verified data sources. 96% reasoning confidence.
            </p>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-3">
          {reasons.map((r, i) => (
            <motion.div
              key={r.title}
              initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
              className="rounded-2xl border bg-card p-5"
            >
              <div className="flex items-start gap-4">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${r.positive ? "bg-[var(--success)]/15 text-[var(--success)]" : "bg-destructive/15 text-destructive"}`}>
                  {r.positive ? <Check className="h-5 w-5" /> : <X className="h-5 w-5" />}
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-semibold flex items-center gap-2"><r.icon className="h-4 w-4 text-muted-foreground" />{r.title}</p>
                    <div className="flex items-center gap-3 text-xs">
                      <span className={`font-medium ${r.weight > 0 ? "text-[var(--success)]" : "text-destructive"}`}>
                        {r.weight > 0 ? "+" : ""}{r.weight} pts
                      </span>
                      <span className="text-muted-foreground">{r.conf}% confidence</span>
                    </div>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{r.detail}</p>
                  <div className="mt-3 grid grid-cols-2 gap-3">
                    <div>
                      <p className="mb-1 text-[10px] uppercase tracking-wider text-muted-foreground">Contribution</p>
                      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                        <div className={`h-full rounded-full ${r.positive ? "gradient-primary" : "bg-destructive"}`} style={{ width: `${Math.abs(r.weight) * 4}%` }} />
                      </div>
                    </div>
                    <div>
                      <p className="mb-1 text-[10px] uppercase tracking-wider text-muted-foreground">Confidence</p>
                      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                        <div className="h-full rounded-full bg-[var(--cyan)]" style={{ width: `${r.conf}%` }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
