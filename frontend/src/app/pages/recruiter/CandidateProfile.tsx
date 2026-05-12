import { Sidebar } from '../../components/Sidebar';
import { MobileSidebar } from '../../components/MobileSidebar';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/Card';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { ScoreBar } from '../../components/ScoreBar';
import { Github, ExternalLink, Mail, Calendar, MapPin, Briefcase, CheckCircle2 } from 'lucide-react';

export function RecruiterCandidateProfile() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar userType="recruiter" />
      <MobileSidebar userType="recruiter" />

      <div className="flex-1 overflow-auto">
        <div className="border-b border-border bg-card px-4 lg:px-8 py-6 pt-20 lg:pt-6">
          <div className="flex flex-col lg:flex-row items-start justify-between gap-4">
            <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary text-2xl font-semibold">
                SC
              </div>
              <div>
                <h1 className="text-2xl font-semibold">Sarah Chen</h1>
                <p className="text-sm text-muted-foreground mt-1">Senior Full-Stack Developer</p>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-2 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    San Francisco, CA
                  </span>
                  <span className="flex items-center gap-1">
                    <Briefcase className="h-4 w-4" />
                    7 years experience
                  </span>
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              <Button variant="outline">
                <Mail className="h-4 w-4 mr-2" />
                Send Message
              </Button>
              <Button variant="outline">
                <Calendar className="h-4 w-4 mr-2" />
                Schedule Interview
              </Button>
              <Button>Shortlist Candidate</Button>
            </div>
          </div>
        </div>

        <div className="p-4 lg:p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
            <Card>
              <CardContent className="pt-6 text-center space-y-2">
                <div className="text-4xl font-bold text-primary">94%</div>
                <p className="text-sm text-muted-foreground">Match Score</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center space-y-2">
                <div className="text-4xl font-bold text-secondary">89%</div>
                <p className="text-sm text-muted-foreground">Interest Score</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center space-y-2">
                <div className="text-4xl font-bold text-[#10b981]">12</div>
                <p className="text-sm text-muted-foreground">Validated Skills</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>AI Match Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="rounded-lg bg-primary/5 border border-primary/20 p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 flex-shrink-0">
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                    </div>
                    <div className="space-y-2">
                      <p className="font-medium">Excellent Match for Senior Full-Stack Role</p>
                      <p className="text-sm text-muted-foreground">
                        Sarah demonstrates strong proficiency in all required skills (React, TypeScript, Node.js)
                        with validated proof from 8 production projects and 3 certifications. Her experience level
                        and technical depth exceed job requirements.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-3">Strengths</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-[#10b981] flex-shrink-0 mt-0.5" />
                        <span>Advanced React architecture skills (95% confidence)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-[#10b981] flex-shrink-0 mt-0.5" />
                        <span>Production-scale AWS deployment experience</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-[#10b981] flex-shrink-0 mt-0.5" />
                        <span>Strong communication skills (AI interview score: 89%)</span>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-3">Considerations</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <span className="text-[#f59e0b] flex-shrink-0 mt-0.5">⚠</span>
                        <span>Limited GraphQL experience (preferred skill)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-[#f59e0b] flex-shrink-0 mt-0.5">⚠</span>
                        <span>No evidence of mobile development</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Validated Skills</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <SkillRow name="React" confidence={95} authenticity={98} />
                <SkillRow name="TypeScript" confidence={92} authenticity={94} />
                <SkillRow name="Node.js" confidence={88} authenticity={90} />
                <SkillRow name="AWS" confidence={85} authenticity={88} />
                <SkillRow name="Docker" confidence={82} authenticity={85} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Evidence & Projects</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <ProjectItem
                  title="E-commerce Platform (Production)"
                  description="Full-stack application serving 50k+ users with React, Node.js, PostgreSQL"
                  link="demo.ecommerce-app.com"
                  validation={96}
                />
                <ProjectItem
                  title="Component Library (Open Source)"
                  description="Reusable React components with TypeScript, 2.5k GitHub stars"
                  link="github.com/sarahchen/ui-components"
                  validation={94}
                />
                <ProjectItem
                  title="SaaS Analytics Dashboard"
                  description="Real-time analytics platform with WebSockets, Redis, and AWS"
                  link="analytics.example.com"
                  validation={91}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Resume Highlights</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-medium">Senior Developer @ TechCorp</h4>
                    <span className="text-sm text-muted-foreground">2021 - Present</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Led team of 5 developers building microservices architecture.
                    Reduced deployment time by 60% through CI/CD improvements.
                  </p>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-medium">Full-Stack Developer @ StartupXYZ</h4>
                    <span className="text-sm text-muted-foreground">2019 - 2021</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Built customer-facing dashboard from scratch. Scaled application to support 10x user growth.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function SkillRow({ name, confidence, authenticity }: { name: string; confidence: number; authenticity: number }) {
  return (
    <div className="space-y-3 rounded-lg border border-border p-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium">{name}</h4>
        <Badge variant="success">Validated</Badge>
      </div>
      <ScoreBar score={confidence} label="Confidence" />
      <ScoreBar score={authenticity} label="Authenticity" />
    </div>
  );
}

function ProjectItem({ title, description, link, validation }: any) {
  return (
    <div className="rounded-lg border border-border p-4">
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <h4 className="font-medium">{title}</h4>
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
          <a href={`https://${link}`} className="text-xs text-primary hover:underline flex items-center gap-1 mt-2">
            {link}
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
        <Badge variant="success">{validation}%</Badge>
      </div>
      <ScoreBar score={validation} showPercentage={false} />
    </div>
  );
}
