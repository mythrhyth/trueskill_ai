import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader, StatCard } from "@/components/ui-kit/Primitives";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search, Filter, Download, FileText, Sparkles } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";

export const Route = createFileRoute("/recruiter")({
  head: () => ({ meta: [{ title: "Recruiter Dashboard — TrueSkill AI" }] }),
  component: RecruiterDashboard,
});

type Candidate = {
  id: string; name: string; role: string; score: number; auth: number; match: number;
  skills: string[]; rec: string; avatar: string;
};

const candidates: Candidate[] = [
  { id: "1", name: "Aarav Sharma", role: "Backend Engineer", score: 92, auth: 97, match: 94, skills: ["Python", "FastAPI", "PostgreSQL", "Docker"], rec: "Senior Backend Engineer", avatar: "AS" },
  { id: "2", name: "Maya Chen", role: "ML Engineer", score: 89, auth: 95, match: 91, skills: ["PyTorch", "MLOps", "Python", "AWS"], rec: "ML Platform Engineer", avatar: "MC" },
  { id: "3", name: "Diego Romero", role: "Full-stack", score: 86, auth: 93, match: 88, skills: ["React", "Node", "GraphQL", "TypeScript"], rec: "Senior Full-stack Engineer", avatar: "DR" },
  { id: "4", name: "Priya Nair", role: "DevOps", score: 84, auth: 92, match: 85, skills: ["Kubernetes", "Terraform", "AWS", "Go"], rec: "Platform SRE", avatar: "PN" },
  { id: "5", name: "Liam O'Connor", role: "Frontend", score: 82, auth: 90, match: 83, skills: ["React", "Next.js", "Design Systems"], rec: "Senior Frontend Engineer", avatar: "LO" },
  { id: "6", name: "Sora Tanaka", role: "Data Engineer", score: 81, auth: 88, match: 80, skills: ["Spark", "Airflow", "Python", "SQL"], rec: "Data Platform Engineer", avatar: "ST" },
  { id: "7", name: "Noah Müller", role: "Backend", score: 79, auth: 86, match: 78, skills: ["Go", "Postgres", "gRPC"], rec: "Backend Engineer II", avatar: "NM" },
  { id: "8", name: "Zara Khan", role: "ML / Research", score: 77, auth: 84, match: 76, skills: ["NLP", "Transformers", "PyTorch"], rec: "Applied Researcher", avatar: "ZK" },
];

function scoreColor(n: number) {
  if (n >= 90) return "text-[var(--success)]";
  if (n >= 80) return "text-[var(--indigo)]";
  return "text-[var(--warning)]";
}

function RecruiterDashboard() {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState<Candidate | null>(null);
  const { user } = useAuthStore();
  const filtered = candidates.filter(c => `${c.name} ${c.role} ${c.skills.join(" ")}`.toLowerCase().includes(q.toLowerCase()));

  return (
    <div>
      <PageHeader
        eyebrow={`Recruiter · ${user?.name || 'Northwind Talent'}`}
        title={`Welcome back, ${user?.name?.split(' ')[0] || 'Recruiter'}`}
        description="Ranked candidates, verified scores, and AI-powered matching across your active roles."
        actions={<><Button variant="outline" size="sm"><Download className="mr-2 h-4 w-4" />Export</Button><Button size="sm" className="gradient-primary text-white border-0">New Search</Button></>}
      />

      <div className="space-y-6 p-6">
        <div className="grid gap-4 md:grid-cols-4">
          <StatCard label="Active candidates" value="248" delta="+12" hint="Past 7 days" accent="indigo" />
          <StatCard label="Avg TrueSkill" value="84.2" hint="Across pipeline" accent="purple" />
          <StatCard label="Verified profiles" value="91%" hint="Multi-source" accent="success" />
          <StatCard label="Open roles" value="14" hint="6 hiring managers" accent="cyan" />
        </div>

        <div className="rounded-2xl border bg-card">
          <div className="flex flex-wrap items-center gap-3 border-b p-4">
            <div className="relative flex-1 min-w-64">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name, skill, role..." className="pl-9 bg-muted/30 border-0" />
            </div>
            <Button variant="outline" size="sm"><Filter className="mr-2 h-4 w-4" />Skills</Button>
            <Button variant="outline" size="sm"><Filter className="mr-2 h-4 w-4" />Domains</Button>
            <Button variant="outline" size="sm"><Filter className="mr-2 h-4 w-4" />Score</Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="px-4 py-3 font-medium">Candidate</th>
                  <th className="px-4 py-3 font-medium">Score</th>
                  <th className="px-4 py-3 font-medium">Authenticity</th>
                  <th className="px-4 py-3 font-medium">Match %</th>
                  <th className="px-4 py-3 font-medium">Top Skills</th>
                  <th className="px-4 py-3 font-medium">Recommended Role</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(c => (
                  <tr key={c.id} className="border-b transition hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full gradient-primary text-xs font-semibold text-white">{c.avatar}</div>
                        <div>
                          <p className="font-medium">{c.name}</p>
                          <p className="text-xs text-muted-foreground">{c.role}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3"><span className={`font-semibold ${scoreColor(c.score)}`}>{c.score}</span></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
                          <div className="h-full rounded-full bg-[var(--success)]" style={{ width: `${c.auth}%` }} />
                        </div>
                        <span className="text-xs text-muted-foreground">{c.auth}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
                          <div className="h-full rounded-full gradient-primary" style={{ width: `${c.match}%` }} />
                        </div>
                        <span className="text-xs text-muted-foreground">{c.match}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {c.skills.slice(0, 3).map(s => <Badge key={s} variant="outline" className="text-[10px]">{s}</Badge>)}
                        {c.skills.length > 3 && <span className="text-[10px] text-muted-foreground">+{c.skills.length - 3}</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs">{c.rec}</td>
                    <td className="px-4 py-3 text-right">
                      <Button size="sm" variant="ghost" onClick={() => setOpen(c)}>View</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Dialog open={!!open} onOpenChange={(v) => !v && setOpen(null)}>
        <DialogContent className="max-w-2xl">
          {open && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full gradient-primary text-sm font-semibold text-white">{open.avatar}</div>
                  <div>
                    <p>{open.name}</p>
                    <p className="text-xs font-normal text-muted-foreground">{open.role} · Recommended: {open.rec}</p>
                  </div>
                </DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-3 gap-3">
                <StatCard label="TrueSkill" value={open.score} accent="indigo" />
                <StatCard label="Authenticity" value={`${open.auth}%`} accent="success" />
                <StatCard label="Match" value={`${open.match}%`} accent="purple" />
              </div>
              <div className="rounded-xl border bg-gradient-to-br from-[var(--indigo)]/10 to-[var(--purple)]/10 p-4">
                <div className="mb-2 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-[var(--purple)]" />
                  <p className="text-sm font-semibold">AI Summary</p>
                </div>
                <p className="text-sm text-muted-foreground">
                  {open.name} demonstrates verified depth in {open.skills.slice(0, 2).join(" and ")}, with consistent contribution patterns
                  across the past 6 months. Authenticity signals are strong across GitHub, certifications, and platform metrics.
                  Recommended for {open.rec} with minimal ramp-up.
                </p>
              </div>
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Verified Skills</p>
                <div className="flex flex-wrap gap-1.5">
                  {open.skills.map(s => <Badge key={s} className="bg-muted text-foreground">{s}</Badge>)}
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" size="sm"><FileText className="mr-2 h-4 w-4" />Download Report</Button>
                <Button size="sm" className="gradient-primary text-white border-0">Shortlist</Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
