import { Sidebar } from '../../components/Sidebar';
import { MobileSidebar } from '../../components/MobileSidebar';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { Lightbulb, TrendingUp, Award, Code, FileText } from 'lucide-react';

export function CandidateRecommendations() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar userType="candidate" />
      <MobileSidebar userType="candidate" />

      <div className="flex-1 overflow-auto">
        <div className="border-b border-border bg-card px-4 lg:px-8 py-6 pt-20 lg:pt-6">
          <h1 className="text-2xl font-semibold">Recommendations</h1>
          <p className="text-sm text-muted-foreground mt-1">Personalized suggestions to improve your profile</p>
        </div>

        <div className="p-4 lg:p-8 space-y-6">
          <Card className="bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/20 flex-shrink-0">
                  <Lightbulb className="h-6 w-6 text-primary" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold">AI Insight</h3>
                  <p className="text-sm text-muted-foreground">
                    Your profile is 68% complete. Adding 2 more validated projects and connecting your
                    LinkedIn could increase your match score by up to 15% and attract 3x more recruiters.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div>
            <h2 className="text-lg font-semibold mb-4">Improve Projects</h2>
            <div className="space-y-3">
              <RecommendationCard
                icon={Code}
                title="Add a Full-Stack Project"
                description="Showcase both frontend and backend skills by adding a complete CRUD application with authentication"
                impact="High Impact"
                impactVariant="success"
                action="Start Building"
              />
              <RecommendationCard
                icon={Code}
                title="Contribute to Open Source"
                description="Make contributions to React or TypeScript projects to demonstrate collaboration and code quality"
                impact="Medium Impact"
                impactVariant="warning"
                action="Find Projects"
              />
              <RecommendationCard
                icon={Code}
                title="Build a Mobile App"
                description="Expand your skill set with React Native to demonstrate cross-platform development capability"
                impact="Medium Impact"
                impactVariant="warning"
                action="Explore"
              />
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-4">Add Missing Proofs</h2>
            <div className="space-y-3">
              <RecommendationCard
                icon={Award}
                title="Get AWS Certification"
                description="Validate your cloud knowledge with AWS Solutions Architect certification"
                impact="High Impact"
                impactVariant="success"
                action="Learn More"
              />
              <RecommendationCard
                icon={FileText}
                title="Connect LinkedIn Profile"
                description="Link your LinkedIn to import endorsements and recommendations"
                impact="Quick Win"
                impactVariant="info"
                action="Connect Now"
              />
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-4">Suggested Skills to Learn</h2>
            <div className="space-y-3">
              <RecommendationCard
                icon={TrendingUp}
                title="Docker & Kubernetes"
                description="High demand skills that complement your backend expertise (78% match with your profile)"
                impact="Trending"
                impactVariant="default"
                action="Start Learning"
              />
              <RecommendationCard
                icon={TrendingUp}
                title="GraphQL"
                description="Modern API technology that pairs well with your React skills (85% match)"
                impact="Trending"
                impactVariant="default"
                action="Explore"
              />
              <RecommendationCard
                icon={TrendingUp}
                title="System Design"
                description="Essential for senior roles you're targeting (92% relevance)"
                impact="Career Growth"
                impactVariant="success"
                action="View Resources"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function RecommendationCard({
  icon: Icon,
  title,
  description,
  impact,
  impactVariant,
  action
}: {
  icon: any;
  title: string;
  description: string;
  impact: string;
  impactVariant: 'success' | 'warning' | 'info' | 'default';
  action: string;
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col sm:flex-row items-start gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 flex-shrink-0">
            <Icon className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 space-y-2 w-full">
            <div className="flex flex-col sm:flex-row items-start justify-between gap-2 sm:gap-4">
              <h4 className="font-medium">{title}</h4>
              <Badge variant={impactVariant}>{impact}</Badge>
            </div>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
          <Button variant="outline" size="sm" className="w-full sm:w-auto">{action}</Button>
        </div>
      </CardContent>
    </Card>
  );
}
