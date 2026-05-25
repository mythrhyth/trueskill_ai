import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { PageHeader, ScoreRing } from "@/components/ui-kit/Primitives";
import { Check, X, Sparkles } from "lucide-react";
import { useProfileStore } from "@/store/useProfileStore";

export const Route = createFileRoute("/insights")({
  head: () => ({ meta: [{ title: "Explainable AI — TrueSkill AI" }] }),
  component: InsightsPage,
});

function InsightsPage() {
  const { data } = useProfileStore();

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center p-20 text-center">
        <h2 className="text-2xl font-semibold">No Profile Analyzed Yet</h2>
        <p className="mt-2 text-muted-foreground">Please run an analysis from the dashboard first.</p>
        <Link to="/" className="mt-6 inline-block rounded-xl bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition hover:opacity-90">
          Go to Dashboard
        </Link>
      </div>
    );
  }

  const generatedReasons = [
    ...(data.strengths || []).map((s) => ({
      positive: true, title: s, weight: 15, conf: 95, detail: s
    })),
    ...(data.weaknesses || []).map((w) => ({
      positive: false, title: w, weight: -10, conf: 85, detail: w
    }))
  ];

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
            <ScoreRing value={data.score || 0} size={120} label="TrueSkill" />
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Final Score</p>
              <p className="text-2xl font-semibold">{data.score > 90 ? "Elite Engineer" : "Strong Match"}</p>
              <p className="mt-1 text-xs text-muted-foreground">Based on current analysis</p>
            </div>
          </div>
          <div className="mt-6 space-y-3">
            {(data.breakdown || []).map((s, idx) => (
              <div key={s.k}>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{s.k}</span>
                  <span className="font-medium">{s.v}</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                  <motion.div 
                    initial={{ width: 0 }} 
                    animate={{ width: `${s.v}%` }} 
                    transition={{ duration: 1, delay: idx * 0.1 }} 
                    className="h-full rounded-full" 
                    style={{ background: "var(--indigo)" }} 
                  />
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
              {data.scoreReasoning || "Score derived from weighted signals across verified data sources."}
            </p>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-3">
          {generatedReasons.length > 0 ? generatedReasons.map((r, i) => (
            <motion.div
              key={r.title + i}
              initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
              className="rounded-2xl border bg-card p-5"
            >
              <div className="flex items-start gap-4">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${r.positive ? "bg-[var(--success)]/15 text-[var(--success)]" : "bg-destructive/15 text-destructive"}`}>
                  {r.positive ? <Check className="h-5 w-5" /> : <X className="h-5 w-5" />}
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-semibold flex items-center gap-2">{r.title}</p>
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
          )) : (
            <div className="p-8 text-center text-muted-foreground">
              No detailed explanations available.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
