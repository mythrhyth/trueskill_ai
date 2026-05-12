import { Sidebar } from '../../components/Sidebar';
import { MobileSidebar } from '../../components/MobileSidebar';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/Card';
import { ScoreBar } from '../../components/ScoreBar';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { Github, ExternalLink, Award, FileText, CheckCircle2 } from 'lucide-react';

export function CandidateSkills() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar userType="candidate" />
      <MobileSidebar userType="candidate" />

      <div className="flex-1 overflow-auto">
        <div className="border-b border-border bg-card px-4 lg:px-8 py-6 pt-20 lg:pt-6">
          <h1 className="text-2xl font-semibold">Skill Details: React</h1>
          <p className="text-sm text-muted-foreground mt-1">Deep dive into validated expertise</p>
        </div>

        <div className="p-4 lg:p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center space-y-2">
                  <div className="text-4xl font-bold text-primary">92%</div>
                  <p className="text-sm text-muted-foreground">Confidence Score</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center space-y-2">
                  <div className="text-4xl font-bold text-[#10b981]">95%</div>
                  <p className="text-sm text-muted-foreground">Authenticity Score</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center space-y-2">
                  <Badge variant="success" className="text-base px-4 py-1">Strong</Badge>
                  <p className="text-sm text-muted-foreground">Status</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>AI Validation Explanation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg bg-primary/5 border border-primary/20 p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 flex-shrink-0">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                  </div>
                  <div className="space-y-2 text-sm">
                    <p className="font-medium">Strong Evidence of Expertise</p>
                    <p className="text-muted-foreground">
                      Based on analysis of 8 GitHub repositories, 3 production projects, and 2 certifications,
                      your React expertise demonstrates advanced component architecture, state management proficiency,
                      and modern best practices including hooks, context, and performance optimization.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Evidence & Proof</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <EvidenceItem
                  icon={Github}
                  title="E-commerce Platform"
                  description="Full-stack React application with Redux, TypeScript, and advanced patterns"
                  score={95}
                  link="github.com/user/ecommerce"
                />
                <EvidenceItem
                  icon={Github}
                  title="Component Library"
                  description="Reusable React component library with Storybook documentation"
                  score={88}
                  link="github.com/user/ui-lib"
                />
                <EvidenceItem
                  icon={Award}
                  title="React Advanced Certification"
                  description="Completed advanced React certification from Meta"
                  score={92}
                  link="credentials.meta.com/cert123"
                />
                <EvidenceItem
                  icon={ExternalLink}
                  title="Production SaaS Dashboard"
                  description="Live production application serving 10k+ users"
                  score={90}
                  link="dashboard.example.com"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Improvement Suggestions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <SuggestionItem
                  title="Add Server-Side Rendering Project"
                  description="Demonstrate Next.js or similar SSR framework expertise to complement your React skills"
                />
                <SuggestionItem
                  title="Contribute to Open Source"
                  description="Contribute to popular React libraries to showcase collaboration and code quality"
                />
                <SuggestionItem
                  title="Write Technical Content"
                  description="Create blog posts or tutorials about React patterns you've mastered"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function EvidenceItem({
  icon: Icon,
  title,
  description,
  score,
  link
}: {
  icon: any;
  title: string;
  description: string;
  score: number;
  link: string;
}) {
  return (
    <div className="rounded-lg border border-border p-4 space-y-3">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 flex-shrink-0">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1 space-y-1">
          <h4 className="font-medium">{title}</h4>
          <p className="text-sm text-muted-foreground">{description}</p>
          <a href={`https://${link}`} className="text-xs text-primary hover:underline flex items-center gap-1">
            {link}
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
        <Badge variant="success">{score}%</Badge>
      </div>
      <ScoreBar score={score} showPercentage={false} />
    </div>
  );
}

function SuggestionItem({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-border p-4">
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary/10 flex-shrink-0">
        <FileText className="h-4 w-4 text-secondary" />
      </div>
      <div className="flex-1 space-y-1">
        <h4 className="font-medium text-sm">{title}</h4>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <Button size="sm" variant="outline">View</Button>
    </div>
  );
}
