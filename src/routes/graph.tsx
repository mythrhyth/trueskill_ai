import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import cytoscape, { Core } from "cytoscape";
import { PageHeader } from "@/components/ui-kit/Primitives";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/graph")({
  head: () => ({ meta: [{ title: "Skill Graph — TrueSkill AI" }] }),
  component: GraphPage,
});

const elements = [
  { data: { id: "user", label: "Aarav Sharma", type: "user" } },
  // skills
  ...["Python", "React", "ML", "DSA", "SQL", "FastAPI", "Docker"].map((s) => ({ data: { id: s, label: s, type: "skill" } })),
  // frameworks
  ...["PyTorch", "Pandas", "Next.js", "PostgreSQL", "Kubernetes"].map((f) => ({ data: { id: f, label: f, type: "framework" } })),
  // domains
  ...["Backend", "AI/ML", "Frontend", "DevOps", "Data"].map((d) => ({ data: { id: d, label: d, type: "domain" } })),
  // jobs
  ...["Sr. Backend Engineer", "ML Platform Eng.", "Full-stack Engineer"].map((j) => ({ data: { id: j, label: j, type: "job" } })),

  // user → skills
  ...["Python", "React", "ML", "DSA", "SQL", "FastAPI", "Docker"].map((s) => ({ data: { source: "user", target: s } })),
  // skills → frameworks
  { data: { source: "Python", target: "PyTorch" } },
  { data: { source: "Python", target: "Pandas" } },
  { data: { source: "React", target: "Next.js" } },
  { data: { source: "SQL", target: "PostgreSQL" } },
  { data: { source: "Docker", target: "Kubernetes" } },
  // frameworks → domains
  { data: { source: "PyTorch", target: "AI/ML" } },
  { data: { source: "Pandas", target: "Data" } },
  { data: { source: "Next.js", target: "Frontend" } },
  { data: { source: "PostgreSQL", target: "Backend" } },
  { data: { source: "Kubernetes", target: "DevOps" } },
  { data: { source: "FastAPI", target: "Backend" } },
  { data: { source: "ML", target: "AI/ML" } },
  // domains → jobs
  { data: { source: "Backend", target: "Sr. Backend Engineer" } },
  { data: { source: "AI/ML", target: "ML Platform Eng." } },
  { data: { source: "Frontend", target: "Full-stack Engineer" } },
  { data: { source: "Backend", target: "Full-stack Engineer" } },
];

const colorByType: Record<string, string> = {
  user: "#6366f1",
  skill: "#a855f7",
  framework: "#06b6d4",
  domain: "#22c55e",
  job: "#f59e0b",
};

function GraphPage() {
  const ref = useRef<HTMLDivElement | null>(null);
  const cyRef = useRef<Core | null>(null);

  useEffect(() => {
    if (!ref.current) return;
    const cy = cytoscape({
      container: ref.current,
      elements,
      style: [
        {
          selector: "node",
          style: {
            "background-color": (e: any) => colorByType[e.data("type")] || "#888",
            label: "data(label)",
            color: "var(--foreground)" as any,
            "font-size": 11,
            "font-weight": 500,
            "text-valign": "bottom",
            "text-margin-y": 6,
            width: (e: any) => (e.data("type") === "user" ? 60 : e.data("type") === "job" ? 44 : 34),
            height: (e: any) => (e.data("type") === "user" ? 60 : e.data("type") === "job" ? 44 : 34),
            "border-width": 2,
            "border-color": (e: any) => colorByType[e.data("type")] || "#888",
            "border-opacity": 0.4,
            "overlay-padding": 6,
          } as any,
        },
        {
          selector: "edge",
          style: {
            width: 1.5,
            "line-color": "rgba(120,120,140,0.35)",
            "curve-style": "bezier",
            "target-arrow-shape": "triangle",
            "target-arrow-color": "rgba(120,120,140,0.35)",
            "arrow-scale": 0.8,
          } as any,
        },
        { selector: "node:selected", style: { "border-width": 4, "border-opacity": 1 } as any },
      ],
      layout: { name: "concentric", concentric: (n: any) => ({ user: 5, skill: 4, framework: 3, domain: 2, job: 1 } as any)[n.data("type")] || 0, levelWidth: () => 1, minNodeSpacing: 40, animate: true } as any,
    });
    cyRef.current = cy;
    return () => cy.destroy();
  }, []);

  const legend: { type: string; label: string }[] = [
    { type: "user", label: "You" }, { type: "skill", label: "Skill" },
    { type: "framework", label: "Framework" }, { type: "domain", label: "Domain" }, { type: "job", label: "Role" },
  ];

  return (
    <div>
      <PageHeader
        eyebrow="Graph Intelligence"
        title="Your verified skill graph"
        description="An interactive map of your skills, frameworks, domains, and recommended roles — connected by verified evidence."
      />
      <div className="p-6">
        <div className="rounded-2xl border bg-card p-4">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap gap-2">
              {legend.map(l => (
                <Badge key={l.type} variant="outline" className="gap-1.5">
                  <span className="h-2 w-2 rounded-full" style={{ background: colorByType[l.type] }} />{l.label}
                </Badge>
              ))}
            </div>
            <div className="text-xs text-muted-foreground">Drag nodes · scroll to zoom</div>
          </div>
          <div
            ref={ref}
            className="relative h-[640px] w-full overflow-hidden rounded-xl border bg-gradient-to-br from-background to-muted/30 grid-pattern"
          />
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <div className="rounded-xl border bg-muted/20 p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Verified relationships</p>
              <p className="mt-2 text-2xl font-semibold">42</p>
            </div>
            <div className="rounded-xl border bg-muted/20 p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Source credibility</p>
              <p className="mt-2 text-2xl font-semibold text-[var(--success)]">High</p>
            </div>
            <div className="rounded-xl border bg-muted/20 p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Recommended roles</p>
              <p className="mt-2 text-2xl font-semibold">3</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
