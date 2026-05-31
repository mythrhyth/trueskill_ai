import { createFileRoute } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer,
  AreaChart, Area, XAxis, YAxis, Tooltip, BarChart, Bar, CartesianGrid,
} from "recharts";
import { 
  Github, Trophy, ShieldCheck, BadgeCheck, Sparkles, TrendingUp, Code2, Cpu, 
  Search, AlertCircle, RefreshCcw, CheckCircle2, Linkedin, Check, X,
  ArrowRight, Briefcase, PlusCircle, MinusCircle, Shield, Clock, Activity, Network, Brain
} from "lucide-react";
import { PageHeader, StatCard, GlassCard, ScoreRing } from "@/components/ui-kit/Primitives";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useProfileStore } from "@/store/useProfileStore";
import { useAuthStore } from "@/store/useAuthStore";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/candidate")({
  head: () => ({ meta: [{ title: "Candidate Dashboard — TrueSkill AI" }] }),
  component: CandidatePage,
});

const iconMap: Record<string, any> = {
  Cpu,
  Code2,
  Trophy,
  ShieldCheck
};

function SkillProofModal({ skill, onClose }: { skill: any, onClose: () => void }) {
  if (!skill) return null;
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
        animate={{ opacity: 1, backdropFilter: "blur(12px)" }}
        exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-background/60 p-4 sm:p-6"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 30 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative flex h-[90vh] w-full max-w-6xl flex-col overflow-hidden rounded-[2rem] border border-border bg-card shadow-2xl elegant-shadow backdrop-blur-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Futuristic background elements */}
          <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-[var(--indigo)]/20 blur-[120px] pointer-events-none" />
          <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-[var(--purple)]/20 blur-[120px] pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--indigo)]/5 to-[var(--cyan)]/5 pointer-events-none" />
          <div className="absolute inset-0 grid-pattern opacity-10 pointer-events-none" />
          
          {/* Header */}
          <div className="relative flex items-center justify-between border-b border-border/40 bg-background/40 px-8 py-6 backdrop-blur-md">
            <div className="flex items-center gap-5">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl gradient-primary text-white shadow-lg shadow-[var(--indigo)]/20 relative group">
                <div className="absolute inset-0 rounded-2xl bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                <Code2 className="h-7 w-7" />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h2 className="text-3xl font-bold tracking-tight text-foreground">{skill.name}</h2>
                  <Badge variant="outline" className="bg-[var(--indigo)]/10 text-[var(--indigo)] border-[var(--indigo)]/30 px-2 py-0.5 text-xs font-semibold uppercase tracking-wider">
                    Verified Skill
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5"><Trophy className="h-4 w-4 text-[var(--warning)]" /> Top 5% Globally</span>
                  <span className="flex items-center gap-1.5"><Network className="h-4 w-4 text-[var(--indigo)]" /> {skill.repos} Repositories</span>
                  <span className="flex items-center gap-1.5"><Clock className="h-4 w-4 text-[var(--cyan)]" /> {skill.activeMonths} Months Active</span>
                </div>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="rounded-full bg-muted/40 p-3 text-muted-foreground hover:bg-muted hover:text-foreground transition-all duration-300 cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Body */}
          <div className="relative flex-1 overflow-y-auto p-8 custom-scrollbar">
            <div className="grid gap-8 lg:grid-cols-12">
              
              {/* Left Column: AI Reasoning & Confidence */}
              <div className="lg:col-span-7 space-y-8">
                <motion.div 
                  initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
                  className="rounded-3xl border border-[var(--indigo)]/20 bg-gradient-to-br from-[var(--indigo)]/10 to-transparent p-6 sm:p-8 relative overflow-hidden"
                >
                  <div className="absolute right-0 top-0 opacity-10"><Brain className="h-32 w-32 -mt-4 -mr-4" /></div>
                  <div className="mb-4 flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-[var(--indigo)]" />
                    <h3 className="text-lg font-semibold tracking-tight">AI Deep Insight</h3>
                  </div>
                  <p className="text-base leading-relaxed text-foreground/90 relative z-10 font-medium">
                    {skill.reasoning}
                  </p>
                </motion.div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                    className="rounded-2xl border border-border/40 bg-card/40 p-6 backdrop-blur-sm"
                  >
                    <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">Depth of Knowledge</h3>
                    <div className="flex items-end gap-2 mb-2">
                      <span className="text-4xl font-bold text-foreground">{skill.conf}</span>
                      <span className="text-sm text-muted-foreground mb-1">/ 100</span>
                    </div>
                    <div className="h-2.5 overflow-hidden rounded-full bg-muted/50">
                      <motion.div 
                        initial={{ width: 0 }} animate={{ width: `${skill.conf}%` }} transition={{ duration: 1.2, delay: 0.4, ease: "easeOut" }}
                        className="h-full rounded-full gradient-primary relative"
                      >
                        <div className="absolute inset-0 bg-white/20 animate-pulse" />
                      </motion.div>
                    </div>
                  </motion.div>

                  <motion.div 
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                    className="rounded-2xl border border-[var(--success)]/20 bg-[var(--success)]/5 p-6 backdrop-blur-sm"
                  >
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--success)]/80 mb-4">Authenticity Meter</h3>
                    <div className="flex items-end gap-2 mb-2">
                      <span className="text-4xl font-bold text-[var(--success)]">{skill.auth}</span>
                      <span className="text-sm text-[var(--success)]/60 mb-1">% Verified</span>
                    </div>
                    <div className="h-2.5 overflow-hidden rounded-full bg-[var(--success)]/20">
                      <motion.div 
                        initial={{ width: 0 }} animate={{ width: `${skill.auth}%` }} transition={{ duration: 1.2, delay: 0.5, ease: "easeOut" }}
                        className="h-full rounded-full bg-[var(--success)] relative shadow-[0_0_15px_rgba(var(--success-rgb),0.6)]"
                      >
                        <div className="absolute inset-0 bg-white/20 animate-pulse" />
                      </motion.div>
                    </div>
                  </motion.div>
                </div>
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                >
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2">
                    <Activity className="h-4 w-4" /> Contribution Timeline
                  </h3>
                  <div className="h-32 rounded-2xl border border-border/40 bg-card/40 p-4 flex items-end gap-1 overflow-hidden">
                    {/* Mock timeline bars based on skill length */}
                    {Array.from({ length: 30 }).map((_, i) => {
                      const height = Math.random() * 80 + 20;
                      return (
                        <motion.div
                          key={i}
                          initial={{ height: 0 }}
                          animate={{ height: `${height}%` }}
                          transition={{ delay: 0.5 + i * 0.02, duration: 0.5 }}
                          className="flex-1 rounded-t-sm bg-gradient-to-t from-[var(--indigo)]/80 to-[var(--cyan)]/80 opacity-70 hover:opacity-100 transition-opacity"
                        />
                      );
                    })}
                  </div>
                </motion.div>
              </div>

              {/* Right Column: Evidence & Sources */}
              <div className="lg:col-span-5 space-y-6">
                <motion.div 
                  initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
                  className="rounded-3xl border border-border/40 bg-card/60 p-6 sm:p-8 h-full backdrop-blur-md"
                >
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-6 flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-[var(--success)]" /> Why This Skill Is Trusted
                  </h3>
                  
                  <div className="space-y-4">
                    {skill.evidence?.map((ev: string, i: number) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 + (i * 0.1) }}
                        className="group flex gap-4 rounded-2xl border border-[var(--success)]/10 bg-background/40 p-4 hover:bg-[var(--success)]/5 hover:border-[var(--success)]/30 hover:-translate-y-0.5 transition-all duration-300"
                      >
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--success)]/20 text-[var(--success)] group-hover:scale-110 group-hover:shadow-[0_0_15px_rgba(var(--success-rgb),0.5)] transition-all">
                          <Check className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-foreground/90">{ev}</p>
                          <p className="text-xs text-[var(--success)]/70 mt-1 flex items-center gap-1">
                            <Network className="h-3 w-3" /> Cross-verified via coding profiles
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  <div className="mt-8 pt-6 border-t border-border/40">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">Detected Sources</h3>
                    <div className="flex flex-wrap gap-2">
                      {skill.sources.map((src: string, i: number) => (
                        <motion.div 
                          key={src} 
                          initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.6 + i * 0.1 }}
                        >
                          <Badge variant="secondary" className="px-3 py-1.5 text-xs bg-muted/50 hover:bg-muted transition-colors border border-border/40">
                            <span className="h-1.5 w-1.5 rounded-full bg-[var(--cyan)] mr-2 animate-pulse" />
                            {src}
                          </Badge>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              </div>

            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function SkillCard({ skill, index, onOpenModal }: { skill: any, index: number, onOpenModal: (skill: any) => void }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + (index * 0.05) }}
      className={`relative overflow-hidden rounded-2xl border p-5 transition-all duration-300 bg-card/60 backdrop-blur-sm cursor-pointer group ${expanded ? 'border-primary/50 shadow-[0_0_15px_rgba(var(--primary-rgb),0.15)] scale-[1.02]' : 'hover:border-border hover:shadow-xl hover:scale-[1.02] hover:-translate-y-1'}`}
      onClick={() => onOpenModal(skill)}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="relative z-10 flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-foreground tracking-tight">{skill.name}</span>
          <button 
            className={`rounded-full p-1.5 transition-all duration-300 ${expanded ? 'bg-[var(--indigo)]/20 shadow-[0_0_10px_rgba(var(--indigo-rgb),0.3)]' : 'bg-muted/50 hover:bg-muted group-hover:bg-[var(--indigo)]/10'}`}
            onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
          >
            <Sparkles className={`h-4 w-4 transition-colors ${expanded ? 'text-[var(--indigo)]' : 'text-muted-foreground opacity-50 group-hover:opacity-100 group-hover:text-[var(--indigo)]'}`} />
          </button>
        </div>
        <span className="text-sm font-bold text-foreground">{skill.conf}<span className="text-[10px] font-normal text-muted-foreground ml-0.5">%</span></span>
      </div>
      <div className="relative z-10 h-1.5 overflow-hidden rounded-full bg-muted/60 mb-4">
        <motion.div 
          initial={{ width: 0 }} animate={{ width: `${skill.conf}%` }} transition={{ duration: 1, delay: 0.5 + (index * 0.1) }}
          className="h-full rounded-full gradient-primary" 
        />
      </div>
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-2">
        <div className="flex gap-1.5">
          {skill.sources.map((src: string) => (
            <span key={src} className="rounded-md border border-border/40 bg-background/50 px-2 py-0.5 text-[10px] font-medium text-muted-foreground shadow-sm">{src}</span>
          ))}
        </div>
        <div className="flex items-center gap-1 text-[10px] font-semibold text-[var(--success)]">
          <ShieldCheck className="h-3 w-3" /> Auth {skill.auth}%
        </div>
      </div>
      <AnimatePresence>
        {expanded && skill.reasoning && (
          <motion.div
            initial={{ height: 0, opacity: 0, marginTop: 0 }}
            animate={{ height: "auto", opacity: 1, marginTop: 16 }}
            exit={{ height: 0, opacity: 0, marginTop: 0 }}
            className="overflow-hidden relative z-10"
          >
            <div className="rounded-xl border border-[var(--indigo)]/20 bg-gradient-to-br from-[var(--indigo)]/10 to-[var(--indigo)]/5 p-3 text-xs text-foreground/80 leading-relaxed shadow-inner">
              <span className="block mb-1.5 font-bold text-[var(--indigo)] text-[10px] uppercase tracking-widest flex items-center gap-1">
                <Brain className="h-3 w-3" /> AI Insight
              </span>
              {skill.reasoning}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function CandidatePage() {
  const { status, currentStep, error, data, profileUrl, setProfileUrl, submitProfile, reset } = useProfileStore();
  const { user } = useAuthStore();
  const [selectedSkill, setSelectedSkill] = useState<any>(null);

  return (
    <div className="min-h-screen bg-background">
      {selectedSkill && <SkillProofModal skill={selectedSkill} onClose={() => setSelectedSkill(null)} />}
      
      <AnimatePresence mode="wait">
        {status === "idle" && (
          <motion.div
            key="idle"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4 }}
            className="flex min-h-[80vh] items-center justify-center p-6"
          >
            <div className="w-full max-w-md">
              <GlassCard className="p-8 text-center elegant-shadow">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--indigo)]/20 to-[var(--purple)]/20">
                  <Search className="h-8 w-8 text-[var(--indigo)]" />
                </div>
                <p className="text-sm font-medium text-[var(--indigo)] mb-2 tracking-wide uppercase">Welcome back, {user?.name?.split(' ')[0] || 'Candidate'}</p>
                <h1 className="mb-2 text-2xl font-semibold tracking-tight">Evidence-Backed Skill Verification</h1>
                <p className="mb-8 text-sm text-muted-foreground">
                  Enter a candidate's GitHub or LinkedIn profile to generate explainable hiring intelligence.
                </p>
                <form 
                  onSubmit={(e) => { e.preventDefault(); submitProfile(); }}
                  className="space-y-4"
                >
                  <Input 
                    type="text" 
                    placeholder="https://github.com/username" 
                    value={profileUrl}
                    onChange={(e) => setProfileUrl(e.target.value)}
                    className="h-12 border-[var(--border)] bg-background/50 backdrop-blur"
                  />
                  <Button 
                    type="submit" 
                    disabled={!profileUrl.trim()} 
                    className="h-12 w-full gradient-primary border-0 text-white transition-all hover:opacity-90 glow"
                  >
                    Generate Intelligence
                  </Button>
                </form>
                <div className="mt-6 flex justify-center gap-4 text-muted-foreground">
                  <Github className="h-5 w-5 opacity-50 transition hover:opacity-100" />
                  <Linkedin className="h-5 w-5 opacity-50 transition hover:opacity-100" />
                </div>
              </GlassCard>
            </div>
          </motion.div>
        )}

        {status === "loading" && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex min-h-[80vh] flex-col items-center justify-center p-6"
          >
            <div className="w-full max-w-sm">
              <div className="mb-10 text-center">
                <div className="relative mx-auto h-24 w-24">
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 rounded-full border-2 border-[var(--indigo)]/20 border-t-[var(--indigo)]"
                  />
                  <motion.div 
                    animate={{ rotate: -360 }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-2 rounded-full border-2 border-[var(--cyan)]/20 border-b-[var(--cyan)]"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Sparkles className="h-6 w-6 text-[var(--purple)] animate-pulse" />
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <AnimatePresence mode="popLayout">
                  <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex items-center gap-3 rounded-xl border bg-card/60 p-4 backdrop-blur"
                  >
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--success)]/20 text-[var(--success)]">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: "spring" }}
                      >
                        <Check className="h-4 w-4" />
                      </motion.div>
                    </div>
                    <span className="text-sm font-medium">{currentStep}</span>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        )}

        {status === "error" && (
          <motion.div
            key="error"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex min-h-[80vh] items-center justify-center p-6"
          >
            <GlassCard className="max-w-md p-8 text-center border-destructive/30">
              <AlertCircle className="mx-auto mb-4 h-12 w-12 text-destructive" />
              <h2 className="mb-2 text-xl font-semibold">Analysis Failed</h2>
              <p className="mb-6 text-sm text-muted-foreground">{error}</p>
              <Button onClick={() => reset()} variant="outline" className="w-full">
                <RefreshCcw className="mr-2 h-4 w-4" /> Try Again
              </Button>
            </GlassCard>
          </motion.div>
        )}

        {status === "success" && data && (
          <motion.div
            key="success"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, staggerChildren: 0.1 }}
          >
            <PageHeader
              eyebrow="AI-Generated Recruiter Insights"
              title={data.name && data.name !== "Unknown User" ? data.name : (user?.name || data.name)}
              description={`Verified ${data.role || user?.role || 'Software Engineer'} profile dynamically compiled from ${profileUrl}`}
              actions={
                <>
                  <Button onClick={() => submitProfile()} variant="outline" size="sm">
                    <RefreshCcw className="mr-2 h-4 w-4" /> Re-sync
                  </Button>
                  <Button size="sm" className="gradient-primary text-white border-0">Share Profile</Button>
                </>
              }
            />

            <div className="space-y-6 p-6">
              
              {/* Recruiter AI Summary Panel */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
                className="rounded-3xl border bg-gradient-to-br from-[var(--indigo)]/10 via-[var(--purple)]/5 to-transparent p-6 sm:p-8 elegant-shadow relative overflow-hidden group"
              >
                <div className="absolute left-0 top-0 h-96 w-96 bg-[var(--indigo)]/20 blur-[120px] rounded-full pointer-events-none transition-transform duration-1000 group-hover:scale-110" />
                <div className="absolute right-0 bottom-0 h-64 w-64 bg-[var(--cyan)]/10 blur-[100px] rounded-full pointer-events-none" />
                
                <div className="mb-8 flex items-center gap-3 relative z-10">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-primary text-white shadow-lg shadow-[var(--indigo)]/30">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold tracking-tight">Recruiter Intelligence</h2>
                    <p className="text-sm text-muted-foreground">AI-verified hiring confidence and role alignment</p>
                  </div>
                </div>

                <div className="grid gap-8 lg:grid-cols-12 relative z-10">
                  {/* Left: Hire Confidence (Centerpiece) */}
                  <div className="lg:col-span-4 flex flex-col items-center justify-center space-y-6 rounded-3xl bg-card/40 p-8 border border-border/40 backdrop-blur-md shadow-2xl relative overflow-hidden group-hover:border-primary/30 transition-colors">
                    <div className="absolute inset-0 bg-gradient-to-t from-[var(--indigo)]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    
                    <div className="text-center relative">
                      <p className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-6">Overall Confidence</p>
                      <div className="relative">
                        <div className="absolute inset-0 rounded-full bg-[var(--indigo)]/20 blur-2xl animate-pulse" />
                        <ScoreRing value={data.hireConfidence} size={160} label="Hire Match" />
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 rounded-full border border-[var(--success)]/30 bg-[var(--success)]/10 px-4 py-1.5 text-[var(--success)]">
                      <ShieldCheck className="h-4 w-4" />
                      <span className="text-xs font-semibold tracking-wide uppercase">Highly Recommended</span>
                    </div>
                  </div>

                  {/* Right: Insights & Roles */}
                  <div className="lg:col-span-8 space-y-6">
                    <motion.p 
                      initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
                      className="text-base text-foreground leading-relaxed bg-card/60 p-5 rounded-2xl border border-border/40 backdrop-blur-sm shadow-sm"
                    >
                      <span className="font-serif text-3xl leading-none text-[var(--indigo)] opacity-50 mr-2">"</span>
                      {data.hiringSummary}
                    </motion.p>
                    
                    <div className="grid gap-4 sm:grid-cols-2">
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                        className="rounded-2xl border bg-card/40 p-5 hover:bg-card/60 transition-colors backdrop-blur-sm relative overflow-hidden group/card"
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-[var(--success)]/5 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity" />
                        <div className="mb-4 flex items-center gap-2 text-[var(--success)]">
                          <div className="rounded-full bg-[var(--success)]/20 p-1"><PlusCircle className="h-4 w-4" /></div>
                          <span className="font-semibold text-sm tracking-wide">Key Strengths</span>
                        </div>
                        <ul className="space-y-3 relative z-10">
                          {data.strengths.map((str, i) => (
                            <li key={i} className="flex items-center gap-3 text-sm text-muted-foreground">
                              <Check className="h-4 w-4 text-[var(--success)]" /> {str}
                            </li>
                          ))}
                        </ul>
                      </motion.div>

                      <motion.div 
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                        className="rounded-2xl border bg-card/40 p-5 hover:bg-card/60 transition-colors backdrop-blur-sm relative overflow-hidden group/card"
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-[var(--warning)]/5 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity" />
                        <div className="mb-4 flex items-center gap-2 text-[var(--warning)]">
                          <div className="rounded-full bg-[var(--warning)]/20 p-1"><MinusCircle className="h-4 w-4" /></div>
                          <span className="font-semibold text-sm tracking-wide">Growth Areas</span>
                        </div>
                        <ul className="space-y-3 relative z-10">
                          {data.weaknesses.map((wk, i) => (
                            <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                              <AlertCircle className="h-4 w-4 mt-0.5 text-[var(--warning)] shrink-0" /> {wk}
                            </li>
                          ))}
                        </ul>
                      </motion.div>
                    </div>

                    <motion.div 
                      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
                      className="pt-2"
                    >
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Target Roles</p>
                      <div className="flex flex-wrap gap-2">
                        {data.recommendedRoles.map((role, i) => (
                          <div key={i} className="flex items-center gap-2 rounded-xl border bg-background/50 px-4 py-2 text-sm font-medium hover:border-[var(--indigo)]/50 transition-colors cursor-default shadow-sm">
                            <Briefcase className="h-4 w-4 text-[var(--indigo)]" />
                            {role}
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  </div>
                </div>
              </motion.div>

              {/* Top stats */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
              >
                <StatCard label="TrueSkill Score" value={data.score.toString()} delta="+4 this month" hint="Top 6% of engineers" accent="indigo" reasoning={data.scoreReasoning} />
                <StatCard label="Match Percentage" value={`${data.matchPercentage}%`} delta="+2%" hint="vs target roles" accent="purple" reasoning={data.matchReasoning} />
                <StatCard label="Authenticity" value={`${data.authenticity}%`} hint="Multi-source verified" accent="success" reasoning={data.authenticityReasoning} />
                <StatCard label="Consistency" value={`${data.consistency}%`} hint="26 weeks of activity" accent="cyan" reasoning={data.consistencyReasoning} />
              </motion.div>

              {/* Skills */}
              <div className="grid gap-6 lg:grid-cols-3">
                <motion.div 
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                  className="lg:col-span-2 rounded-2xl border bg-card p-6"
                >
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="font-semibold">Verified Skills</h3>
                    <Badge variant="outline" className="text-xs">
                      <BadgeCheck className="mr-1 h-3 w-3 text-[var(--success)]" />Live
                    </Badge>
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    {data.skills.map((s, i) => (
                      <SkillCard key={s.name} skill={s} index={i} onOpenModal={setSelectedSkill} />
                    ))}
                  </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                  <GlassCard className="flex h-full flex-col items-center justify-center text-center">
                    <ScoreRing value={data.score} size={140} label="TrueSkill" />
                    <p className="mt-4 text-sm font-medium">Elite Engineer Profile</p>
                    <p className="mt-1 text-xs text-muted-foreground px-4">
                      You rank in the top 6% of engineers analyzed across 12,400 profiles this month.
                    </p>
                    <div className="mt-5 grid w-full grid-cols-3 gap-2 px-4 text-center">
                      {[{ l: "GitHub", v: "247★" }, { l: "LeetCode", v: "1,820" }, { l: "Certs", v: "5" }].map(s => (
                        <div key={s.l} className="rounded-lg border bg-background/40 p-2">
                          <p className="text-xs font-semibold">{s.v}</p>
                          <p className="text-[10px] text-muted-foreground">{s.l}</p>
                        </div>
                      ))}
                    </div>
                  </GlassCard>
                </motion.div>
              </div>

              {/* Charts */}
              <div className="grid gap-6 lg:grid-cols-3">
                <motion.div 
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                  className="rounded-2xl border bg-card p-5"
                >
                  <h3 className="mb-1 font-semibold">Domain Radar</h3>
                  <p className="mb-3 text-xs text-muted-foreground">Cross-domain capability profile</p>
                  <ResponsiveContainer width="100%" height={260}>
                    <RadarChart data={data.radar}>
                      <PolarGrid stroke="var(--border)" />
                      <PolarAngleAxis dataKey="skill" tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: "var(--muted-foreground)", fontSize: 9 }} />
                      <Radar dataKey="v" stroke="var(--indigo)" fill="var(--indigo)" fillOpacity={0.35} />
                    </RadarChart>
                  </ResponsiveContainer>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
                  className="rounded-2xl border bg-card p-5 lg:col-span-2"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">Activity Timeline</h3>
                      <p className="text-xs text-muted-foreground">Weekly GitHub commits & coding consistency</p>
                    </div>
                    <Badge variant="outline" className="text-xs"><TrendingUp className="mr-1 h-3 w-3 text-[var(--success)]" />Trending up</Badge>
                  </div>
                  <ResponsiveContainer width="100%" height={240}>
                    <AreaChart data={data.activity}>
                      <defs>
                        <linearGradient id="actGrad" x1="0" x2="0" y1="0" y2="1">
                          <stop offset="0%" stopColor="var(--indigo)" stopOpacity={0.55} />
                          <stop offset="100%" stopColor="var(--indigo)" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="w" tick={{ fill: "var(--muted-foreground)", fontSize: 10 }} />
                      <YAxis tick={{ fill: "var(--muted-foreground)", fontSize: 10 }} />
                      <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8 }} />
                      <Area type="monotone" dataKey="commits" stroke="var(--indigo)" strokeWidth={2} fill="url(#actGrad)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </motion.div>
              </div>

              <div className="grid gap-6 lg:grid-cols-3">
                <motion.div 
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
                  className="rounded-2xl border bg-card p-5 lg:col-span-2"
                >
                  <h3 className="mb-3 font-semibold">Score Breakdown</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={data.breakdown}>
                      <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="k" tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} />
                      <YAxis tick={{ fill: "var(--muted-foreground)", fontSize: 10 }} />
                      <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8 }} />
                      <Bar dataKey="v" fill="var(--purple)" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
                  className="rounded-2xl border bg-gradient-to-br from-[var(--indigo)]/10 to-[var(--purple)]/10 p-5"
                >
                  <div className="mb-3 flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-[var(--purple)]" />
                    <h3 className="font-semibold">AI Suggestions</h3>
                  </div>
                  <div className="space-y-3">
                    {data.suggestions.map((s, i) => {
                      const Icon = iconMap[s.icon] || CheckCircle2;
                      return (
                        <motion.div 
                          key={s.title} 
                          initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.8 + (i * 0.1) }}
                          className="rounded-xl border bg-card/80 backdrop-blur p-3"
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--indigo)]/15">
                              <Icon className="h-4 w-4 text-[var(--indigo)]" />
                            </div>
                            <div>
                              <p className="text-sm font-medium">{s.title}</p>
                              <p className="text-xs text-muted-foreground">{s.desc}</p>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
