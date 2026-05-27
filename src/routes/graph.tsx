import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import cytoscape, { Core } from "cytoscape";
import { PageHeader } from "@/components/ui-kit/Primitives";
import { Badge } from "@/components/ui/badge";
import { useProfileStore } from "@/store/useProfileStore";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

export const Route = createFileRoute("/graph")({
  head: () => ({ meta: [{ title: "Skill Graph — TrueSkill AI" }] }),
  component: GraphPage,
});

const colorByType: Record<string, string> = {
  user: "#6366f1",
  skill: "#a855f7",
  framework: "#06b6d4",
  domain: "#22c55e",
  job: "#f59e0b",
  source: "#06b6d4",
};

function GraphPage() {
  const ref = useRef<HTMLDivElement | null>(null);
  const cyRef = useRef<Core | null>(null);
  const { data } = useProfileStore();

  const graphData = data?.graph;
  const elements: any[] = [];

  if (graphData) {
    if (graphData.nodes) {
      graphData.nodes.forEach((n: any) => {
        elements.push({
          data: {
            id: n.id,
            label: n.label,
            type: n.type.toLowerCase(),
          },
        });
      });
    }
    if (graphData.edges) {
      graphData.edges.forEach((e: any) => {
        elements.push({
          data: {
            source: e.source,
            target: e.target,
            relation: e.relation,
          },
        });
      });
    }
  }

  useEffect(() => {
    if (!ref.current || elements.length === 0) return;
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
      layout: {
        name: "concentric",
        concentric: (n: any) =>
          ({ user: 5, skill: 4, framework: 3, domain: 2, job: 1, source: 1 } as any)[n.data("type")] || 0,
        levelWidth: () => 1,
        minNodeSpacing: 40,
        animate: true,
      } as any,
    });
    cyRef.current = cy;
    return () => cy.destroy();
  }, [elements.length]);

  const legend: { type: string; label: string }[] = [
    { type: "user", label: "Candidate" },
    { type: "skill", label: "Skill" },
    { type: "source", label: "Verification Source" },
  ];

  if (!data || !graphData || elements.length === 0) {
    return (
      <div>
        <PageHeader
          eyebrow="Graph Intelligence"
          title="Dynamic skill graph mapping"
          description="View verified relationships, skill nodes, and target role alignments mapped interactively."
        />
        <div className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center">
          <div className="w-full max-w-md rounded-2xl border bg-card/60 p-8 backdrop-blur-md elegant-shadow text-center animate-fade-in">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--indigo)]/20 to-[var(--purple)]/20">
              <Search className="h-8 w-8 text-[var(--indigo)]" />
            </div>
            <h2 className="text-xl font-bold tracking-tight mb-2">No Profile Analyzed Yet</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Please analyze a GitHub profile from the Candidate Dashboard to construct and explore their interactive skill graph.
            </p>
            <Button asChild className="gradient-primary text-white border-0 hover:opacity-90">
              <Link to="/candidate">Go to Dashboard</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const relationshipCount = (graphData.nodes?.length || 0) + (graphData.edges?.length || 0);

  return (
    <div>
      <PageHeader
        eyebrow="Graph Intelligence"
        title="Your verified skill graph"
        description="An interactive map of your skills, frameworks, domains, and recommended roles — connected by verified evidence."
      />
      <div className="p-6 animate-fade-in">
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
              <p className="mt-2 text-2xl font-semibold">{relationshipCount}</p>
            </div>
            <div className="rounded-xl border bg-muted/20 p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Source credibility</p>
              <p className="mt-2 text-2xl font-semibold text-[var(--success)]">
                {data.authenticity > 80 ? "High" : data.authenticity > 60 ? "Medium" : "Low"}
              </p>
            </div>
            <div className="rounded-xl border bg-muted/20 p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Recommended roles</p>
              <p className="mt-2 text-2xl font-semibold">{data.recommendedRoles?.length || 0}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
