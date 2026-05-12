import { Link } from 'react-router';
import { Button } from '../components/Button';
import { CheckCircle2, Brain, FileCheck, TrendingUp } from 'lucide-react';

export function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <nav className="border-b border-border bg-card/80 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 lg:px-6 py-4 flex items-center justify-between">
          <h1 className="text-lg lg:text-xl font-semibold text-primary">TrueSkill AI V2</h1>
          <div className="hidden md:flex items-center gap-4">
            <Link to="/candidate/dashboard">
              <Button variant="ghost">For Candidates</Button>
            </Link>
            <Link to="/recruiter/dashboard">
              <Button variant="ghost">For Recruiters</Button>
            </Link>
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-7xl px-4 lg:px-6 py-12 lg:py-20">
        <div className="text-center space-y-6 mb-16">
          <h2 className="text-3xl lg:text-5xl font-bold text-foreground">
            Proof-based hiring,
            <br />
            <span className="text-primary">powered by AI</span>
          </h2>
          <p className="text-base lg:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
            Move beyond resumes. Validate real skills with AI-driven evidence and build trust in every hire.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link to="/candidate/dashboard">
              <Button size="lg" className="w-full sm:w-auto">Get Started as Candidate</Button>
            </Link>
            <Link to="/recruiter/dashboard">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">I'm Recruiting</Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mt-12 lg:mt-20">
          <FeatureCard
            icon={CheckCircle2}
            title="Skill Validation"
            description="AI analyzes your projects, code, and certifications to validate real expertise, not just claims."
          />
          <FeatureCard
            icon={Brain}
            title="AI Recruiter"
            description="Interactive AI interviews that assess communication, depth of knowledge, and problem-solving."
          />
          <FeatureCard
            icon={FileCheck}
            title="Proof-Based Profiles"
            description="Every skill backed by evidence. Candidates showcase GitHub, portfolios, and real work."
          />
        </div>

        <div className="mt-12 lg:mt-20 bg-card rounded-2xl border border-border p-6 lg:p-12 text-center">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 mb-4">
            <TrendingUp className="h-8 w-8 text-primary" />
            <h3 className="text-xl lg:text-2xl font-semibold">Data → Validation → Insight → Decision</h3>
          </div>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Our platform transforms raw data into validated insights, helping you make confident hiring decisions backed by proof.
          </p>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, description }: { icon: any; title: string; description: string }) {
  return (
    <div className="bg-card rounded-xl border border-border p-6 space-y-3 hover:shadow-md transition-shadow">
      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
        <Icon className="h-6 w-6 text-primary" />
      </div>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
