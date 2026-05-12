import { useState } from 'react';
import { Sidebar } from '../../components/Sidebar';
import { MobileSidebar } from '../../components/MobileSidebar';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/Card';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Badge } from '../../components/Badge';
import { Search as SearchIcon, SlidersHorizontal, X } from 'lucide-react';

export function RecruiterSearch() {
  const [selectedSkills, setSelectedSkills] = useState<string[]>(['React', 'TypeScript']);
  const [experienceLevel, setExperienceLevel] = useState('senior');
  const [minMatchScore, setMinMatchScore] = useState(70);

  const availableSkills = [
    'React', 'TypeScript', 'Node.js', 'Python', 'Java', 'Go',
    'AWS', 'Docker', 'Kubernetes', 'PostgreSQL', 'MongoDB', 'GraphQL'
  ];

  const toggleSkill = (skill: string) => {
    setSelectedSkills(prev =>
      prev.includes(skill)
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
    );
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar userType="recruiter" />
      <MobileSidebar userType="recruiter" />

      <div className="flex-1 flex flex-col lg:flex-row">
        <div className="flex-1 overflow-auto">
          <div className="border-b border-border bg-card px-4 lg:px-8 py-6 pt-20 lg:pt-6">
            <h1 className="text-2xl font-semibold">Search & Filter</h1>
            <p className="text-sm text-muted-foreground mt-1">Find the perfect candidates</p>
          </div>

          <div className="p-4 lg:p-8">
            <div className="flex gap-3 mb-6">
              <div className="flex-1 relative">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Search candidates by name, role, or keywords..."
                  className="pl-10"
                />
              </div>
              <Button>
                <SearchIcon className="h-4 w-4 mr-2" />
                Search
              </Button>
            </div>

            <div className="space-y-3">
              <SearchResultCard
                name="Sarah Chen"
                role="Senior Full-Stack Developer"
                matchScore={94}
                skills={['React', 'Node.js', 'TypeScript', 'AWS']}
              />
              <SearchResultCard
                name="Michael Rodriguez"
                role="Frontend Engineer"
                matchScore={91}
                skills={['React', 'Vue.js', 'TypeScript', 'CSS']}
              />
              <SearchResultCard
                name="Emily Watson"
                role="DevOps Engineer"
                matchScore={88}
                skills={['Docker', 'Kubernetes', 'AWS', 'CI/CD']}
              />
            </div>
          </div>
        </div>

        <div className="hidden lg:block lg:w-80 border-l border-border bg-card overflow-auto">
          <div className="p-6 border-b border-border">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold">Filters</h2>
              <Button size="sm" variant="ghost">Clear All</Button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            <div>
              <label className="text-sm font-medium mb-3 block">Skills Required</label>
              <div className="flex flex-wrap gap-2">
                {availableSkills.map((skill) => (
                  <button
                    key={skill}
                    onClick={() => toggleSkill(skill)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                      selectedSkills.includes(skill)
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    {skill}
                    {selectedSkills.includes(skill) && (
                      <X className="inline-block ml-1 h-3 w-3" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-3 block">Experience Level</label>
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="experience"
                    value="senior"
                    checked={experienceLevel === 'senior'}
                    onChange={(e) => setExperienceLevel(e.target.value)}
                    className="text-primary"
                  />
                  <span className="text-sm">Senior (5+ years)</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="experience"
                    value="mid"
                    checked={experienceLevel === 'mid'}
                    onChange={(e) => setExperienceLevel(e.target.value)}
                  />
                  <span className="text-sm">Mid-Level (3-5 years)</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="experience"
                    value="junior"
                    checked={experienceLevel === 'junior'}
                    onChange={(e) => setExperienceLevel(e.target.value)}
                  />
                  <span className="text-sm">Junior (0-3 years)</span>
                </label>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-3 block">
                Minimum Match Score: {minMatchScore}%
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={minMatchScore}
                onChange={(e) => setMinMatchScore(parseInt(e.target.value))}
                className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>0%</span>
                <span>50%</span>
                <span>100%</span>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-3 block">Location</label>
              <Input placeholder="Enter location..." />
            </div>

            <div>
              <label className="text-sm font-medium mb-3 block">Availability</label>
              <select className="w-full h-10 rounded-lg border border-border bg-input-background px-3 text-sm">
                <option>All Candidates</option>
                <option>Actively Looking</option>
                <option>Open to Opportunities</option>
                <option>Not Currently Looking</option>
              </select>
            </div>

            <Button className="w-full">Apply Filters</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SearchResultCard({ name, role, matchScore, skills }: any) {
  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer">
      <CardContent className="pt-6">
        <div className="flex flex-col sm:flex-row items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold flex-shrink-0">
            {name.split(' ').map((n: string) => n[0]).join('')}
          </div>

          <div className="flex-1 w-full">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-2 gap-3">
              <div className="flex-1">
                <h3 className="font-semibold">{name}</h3>
                <p className="text-sm text-muted-foreground">{role}</p>
              </div>
              <div className="text-center sm:text-right">
                <p className="text-xl sm:text-2xl font-semibold text-primary">{matchScore}%</p>
                <p className="text-xs text-muted-foreground">Match</p>
              </div>
            </div>

            <div className="flex gap-2 flex-wrap">
              {skills.map((skill: string) => (
                <Badge key={skill} variant="default">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
