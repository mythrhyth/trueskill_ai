import { Sidebar } from '../../components/Sidebar';
import { MobileSidebar } from '../../components/MobileSidebar';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/Card';
import { Users, TrendingUp, Briefcase, Clock } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const candidateTrendData = [
  { id: 'jan', month: 'Jan', candidates: 45 },
  { id: 'feb', month: 'Feb', candidates: 52 },
  { id: 'mar', month: 'Mar', candidates: 61 },
  { id: 'apr', month: 'Apr', candidates: 58 },
  { id: 'may', month: 'May', candidates: 72 },
];

const skillDistribution = [
  { id: 'frontend', name: 'Frontend', value: 35 },
  { id: 'backend', name: 'Backend', value: 28 },
  { id: 'fullstack', name: 'Full-Stack', value: 22 },
  { id: 'devops', name: 'DevOps', value: 15 },
];

const COLORS = ['#4f46e5', '#8b5cf6', '#06b6d4', '#10b981'];

export function RecruiterDashboard() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar userType="recruiter" />
      <MobileSidebar userType="recruiter" />

      <div className="flex-1 overflow-auto">
        <div className="border-b border-border bg-card px-4 lg:px-8 py-6 pt-20 lg:pt-6">
          <h1 className="text-2xl font-semibold">Recruiter Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Overview of candidates and hiring metrics</p>
        </div>

        <div className="p-4 lg:p-8 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            <StatCard
              icon={Users}
              label="Total Candidates"
              value="247"
              trend="+12 this week"
            />
            <StatCard
              icon={TrendingUp}
              label="Avg Match Score"
              value="78%"
              trend="+5% from last month"
            />
            <StatCard
              icon={Briefcase}
              label="Active Jobs"
              value="8"
              trend="2 closing soon"
            />
            <StatCard
              icon={Clock}
              label="Time to Hire"
              value="18 days"
              trend="-3 days improvement"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
            <Card key="candidate-growth-card">
              <CardHeader>
                <CardTitle>Candidate Growth</CardTitle>
              </CardHeader>
              <CardContent>
                <div key="line-chart-wrapper">
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={candidateTrendData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="month" stroke="#64748b" />
                      <YAxis stroke="#64748b" />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="candidates"
                        stroke="#4f46e5"
                        strokeWidth={2}
                        dot={{ fill: '#4f46e5', r: 4 }}
                        isAnimationActive={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card key="skill-distribution-pie-card">
              <CardHeader>
                <CardTitle>Skill Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div key="pie-chart-wrapper">
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                      <Pie
                        data={skillDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        isAnimationActive={false}
                      >
                        {skillDistribution.map((entry, idx) => (
                          <Cell key={`cell-${entry.id}`} fill={COLORS[idx % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Top Matches</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <CandidateRow
                  name="Sarah Chen"
                  role="Senior Full-Stack Developer"
                  matchScore={94}
                  interestScore={89}
                  skills={['React', 'Node.js', 'TypeScript', 'AWS']}
                />
                <CandidateRow
                  name="Michael Rodriguez"
                  role="Frontend Engineer"
                  matchScore={91}
                  interestScore={92}
                  skills={['React', 'Vue.js', 'CSS', 'Design Systems']}
                />
                <CandidateRow
                  name="Emily Watson"
                  role="DevOps Engineer"
                  matchScore={88}
                  interestScore={85}
                  skills={['Docker', 'Kubernetes', 'AWS', 'CI/CD']}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  trend
}: {
  icon: any;
  label: string;
  value: string;
  trend: string;
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="text-3xl font-semibold">{value}</p>
            <p className="text-xs text-muted-foreground">{trend}</p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
            <Icon className="h-6 w-6 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function CandidateRow({
  name,
  role,
  matchScore,
  interestScore,
  skills
}: {
  name: string;
  role: string;
  matchScore: number;
  interestScore: number;
  skills: string[];
}) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 rounded-lg border border-border p-4 hover:bg-accent/50 transition-colors cursor-pointer">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold flex-shrink-0">
        {name.split(' ').map(n => n[0]).join('')}
      </div>
      <div className="flex-1 w-full sm:w-auto">
        <h4 className="font-medium">{name}</h4>
        <p className="text-sm text-muted-foreground">{role}</p>
      </div>
      <div className="flex gap-6 sm:gap-8">
        <div className="text-center">
          <p className="text-xl sm:text-2xl font-semibold text-primary">{matchScore}%</p>
          <p className="text-xs text-muted-foreground">Match</p>
        </div>
        <div className="text-center">
          <p className="text-xl sm:text-2xl font-semibold text-secondary">{interestScore}%</p>
          <p className="text-xs text-muted-foreground">Interest</p>
        </div>
      </div>
      <div className="flex gap-2 flex-wrap w-full sm:w-auto sm:max-w-xs">
        {skills.slice(0, 3).map((skill) => (
          <span key={skill} className="px-2 py-1 rounded-full bg-primary/10 text-xs text-primary">
            {skill}
          </span>
        ))}
        {skills.length > 3 && (
          <span className="px-2 py-1 rounded-full bg-muted text-xs text-muted-foreground">
            +{skills.length - 3}
          </span>
        )}
      </div>
    </div>
  );
}
