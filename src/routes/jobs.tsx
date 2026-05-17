import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/ui-kit/Primitives";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Briefcase, MapPin, Sparkles, ArrowRight, Check, Plus } from "lucide-react";

export const Route = createFileRoute("/jobs")({
  head: () => ({ meta: [{ title: "Job Matching — TrueSkill AI" }] }),
  component: JobsPage,
});

const roles = [
  {
    title: "Senior Backend Engineer", company: "Loop Systems", location: "Remote · Worldwide", match: 94,
    required: ["Python", "FastAPI", "PostgreSQL", "Docker", "Kubernetes"],
    strengths: ["Python", "FastAPI", "PostgreSQL", "Docker"],
    missing: ["Kubernetes"],
    learn: "Complete the CKA certification path. Deploy 1 production K8s service.",
    explain: "Your verified backend depth and high authenticity score align directly with role requirements. Single gap is K8s exposure.",
  },
  {
    title: "ML Platform Engineer", company: "Helix AI", location: "Hybrid · Berlin", match: 88,
    required: ["Python", "PyTorch", "MLOps", "AWS", "Airflow"],
    strengths: ["Python", "PyTorch", "AWS"],
    missing: ["MLOps tooling", "Airflow"],
    learn: "Ship one end-to-end MLflow + Airflow pipeline. Add a feature store project.",
    explain: "Strong ML fundamentals with verified Kaggle activity. Add platform-scale orchestration to fully match.",
  },
  {
    title: "Senior Full-stack Engineer", company: "Northwind", location: "Remote · EU", match: 86,
    required: ["React", "Node.js", "TypeScript", "GraphQL", "PostgreSQL"],
    strengths: ["React", "TypeScript", "Node.js", "PostgreSQL"],
    missing: ["GraphQL"],
    learn: "Build one production GraphQL API with caching and federation.",
    explain: "Frontend and backend depth verified. GraphQL is the only meaningful skill gap.",
  },
  {
    title: "Platform SRE", company: "Vertex Labs", location: "Onsite · Bangalore", match: 78,
    required: ["Kubernetes", "Terraform", "Go", "Observability"],
    strengths: ["Docker", "Linux"],
    missing: ["Terraform", "Go", "Observability stack"],
    learn: "Build infra-as-code project. Solid Go fundamentals course. Deploy Prometheus + Grafana.",
    explain: "Adjacent skills match. Targeted infra investment unlocks this path within 3-6 months.",
  },
];

function JobsPage() {
  return (
    <div>
      <PageHeader
        eyebrow="Job Intelligence"
        title="Roles tailored to your verified strengths"
        description="Match scores, capability gaps, and AI-driven learning paths for each opportunity."
        actions={<Button size="sm" className="gradient-primary text-white border-0"><Plus className="mr-2 h-4 w-4" />Add target role</Button>}
      />

      <div className="grid gap-5 p-6 md:grid-cols-2">
        {roles.map((r, i) => (
          <motion.div
            key={r.title}
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="group relative overflow-hidden rounded-2xl border bg-card p-6 elegant-shadow transition hover:border-[var(--indigo)]/50"
          >
            <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-[var(--indigo)]/10 blur-3xl" />
            <div className="relative flex items-start justify-between gap-4">
              <div>
                <div className="mb-1 flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl gradient-primary text-white"><Briefcase className="h-4 w-4" /></div>
                  <div>
                    <p className="font-semibold">{r.title}</p>
                    <p className="text-xs text-muted-foreground">{r.company}</p>
                  </div>
                </div>
                <p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="h-3 w-3" />{r.location}</p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-semibold gradient-text">{r.match}%</p>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Match</p>
              </div>
            </div>

            <div className="mt-4">
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <motion.div
                  initial={{ width: 0 }} whileInView={{ width: `${r.match}%` }} viewport={{ once: true }}
                  transition={{ duration: 1, delay: 0.2 }}
                  className="h-full rounded-full gradient-primary"
                />
              </div>
            </div>

            <div className="mt-4 grid gap-3">
              <div>
                <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Required</p>
                <div className="flex flex-wrap gap-1">
                  {r.required.map(s => (
                    <Badge key={s} variant={r.strengths.includes(s) ? "default" : "outline"} className={r.strengths.includes(s) ? "bg-[var(--success)]/15 text-[var(--success)] border-0" : ""}>
                      {r.strengths.includes(s) && <Check className="mr-1 h-3 w-3" />}{s}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Missing</p>
                <div className="flex flex-wrap gap-1">
                  {r.missing.map(s => <Badge key={s} variant="outline" className="border-[var(--warning)]/40 text-[var(--warning)]">{s}</Badge>)}
                </div>
              </div>
            </div>

            <div className="mt-4 rounded-xl border bg-gradient-to-br from-[var(--indigo)]/8 to-[var(--purple)]/8 p-3">
              <div className="mb-1 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-[var(--purple)]" />
                <p className="text-xs font-semibold">AI Explanation</p>
              </div>
              <p className="text-xs text-muted-foreground">{r.explain}</p>
              <p className="mt-2 text-xs"><span className="font-medium">Learning path: </span><span className="text-muted-foreground">{r.learn}</span></p>
            </div>

            <Button size="sm" variant="ghost" className="mt-4 w-full justify-between group-hover:bg-muted/50">
              View role details <ArrowRight className="h-4 w-4" />
            </Button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
