import { useState, useEffect } from 'react';
import { Sidebar } from '../../components/Sidebar';
import { MobileSidebar } from '../../components/MobileSidebar';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/Card';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Badge } from '../../components/Badge';
import { Search, MapPin, Building2, Clock, DollarSign, X, Bookmark, Loader2 } from 'lucide-react';
import { apiClient } from '../../../api/client';
import { useAuth } from '../../../context/AuthContext';

export function CandidateJobs() {
  const { state: { user } } = useAuth();
  const [jobs, setJobs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedJobType, setSelectedJobType] = useState<string[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<string[]>([]);
  const [minMatchScore, setMinMatchScore] = useState(0);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);

  const availableSkills = [
    'React', 'TypeScript', 'Node.js', 'Python', 'JavaScript',
    'AWS', 'Docker', 'PostgreSQL', 'GraphQL', 'Next.js'
  ];

  const jobTypes = ['Full-time', 'Contract', 'Part-time', 'Internship'];
  const locations = ['Remote', 'San Francisco, CA', 'New York, NY', 'Austin, TX', 'Boston, MA'];

  const toggleFilter = (value: string, setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    setter(prev =>
      prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]
    );
  };

  useEffect(() => {
    async function fetchJobs() {
      if (user) {
        setIsLoading(true);
        try {
          // Parse user.id if it's a string, or handle as number
          const userId = typeof user.id === 'string' ? parseInt(user.id) : user.id;
          const data = await apiClient.getCandidateJobs(userId);
          
          // Map backend format to component format
          const mappedJobs = data.jobs.map((j: any) => ({
            id: j.job_id,
            title: j.title || 'Unknown Title',
            company: j.company || 'Unknown Company',
            location: 'Remote', // TODO: Get from backend
            type: 'Full-time', // TODO: Get from backend
            salary: 'Competitive', // TODO: Get from backend
            postedDate: new Date(j.computed_at).toLocaleDateString(),
            matchScore: Math.round(j.match_score * 100),
            requiredSkills: j.matched_skills || [],
            preferredSkills: j.missing_skills || [],
            description: j.description || 'No description provided.',
          }));
          
          setJobs(mappedJobs);
        } catch (error) {
          console.error("Failed to fetch jobs:", error);
        } finally {
          setIsLoading(false);
        }
      }
    }
    fetchJobs();
  }, [user]);

  return (
    <div className="flex h-screen bg-background">
      <Sidebar userType="candidate" />
      <MobileSidebar userType="candidate" />

      <div className="flex-1 flex flex-col lg:flex-row">
        <div className="flex-1 overflow-auto">
          <div className="border-b border-border bg-card px-4 lg:px-8 py-6 pt-20 lg:pt-6">
            <h1 className="text-2xl font-semibold">Job Openings</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {jobs.length} jobs matched to your profile
            </p>
          </div>

          <div className="p-4 lg:p-8">
            <div className="flex gap-3 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Search by job title, company, or keywords..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button>
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </div>

            <div className="space-y-4">
              {isLoading ? (
                <div className="flex justify-center p-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : jobs.length === 0 ? (
                <div className="text-center p-12 bg-muted/20 rounded-lg">
                  <p className="text-muted-foreground">No matched jobs found.</p>
                </div>
              ) : (
                jobs.map((job) => (
                  <JobCard key={job.id} job={job} />
                ))
              )}
            </div>
          </div>
        </div>

        <div className="hidden lg:block lg:w-80 border-l border-border bg-card overflow-auto">
          <div className="p-6 border-b border-border">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold">Filters</h2>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setSelectedJobType([]);
                  setSelectedLocation([]);
                  setMinMatchScore(0);
                  setSelectedSkills([]);
                }}
              >
                Clear All
              </Button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            <div>
              <label className="text-sm font-medium mb-3 block">Job Type</label>
              <div className="space-y-2">
                {jobTypes.map((type) => (
                  <label key={type} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedJobType.includes(type)}
                      onChange={() => toggleFilter(type, setSelectedJobType)}
                      className="rounded border-border text-primary focus:ring-primary"
                    />
                    <span className="text-sm">{type}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-3 block">Location</label>
              <div className="space-y-2">
                {locations.map((location) => (
                  <label key={location} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedLocation.includes(location)}
                      onChange={() => toggleFilter(location, setSelectedLocation)}
                      className="rounded border-border text-primary focus:ring-primary"
                    />
                    <span className="text-sm">{location}</span>
                  </label>
                ))}
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
              <label className="text-sm font-medium mb-3 block">Skills</label>
              <div className="flex flex-wrap gap-2">
                {availableSkills.map((skill) => (
                  <button
                    key={skill}
                    onClick={() => toggleFilter(skill, setSelectedSkills)}
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
              <label className="text-sm font-medium mb-3 block">Salary Range</label>
              <select className="w-full h-10 rounded-lg border border-border bg-input-background px-3 text-sm">
                <option>Any</option>
                <option>$0 - $80k</option>
                <option>$80k - $120k</option>
                <option>$120k - $160k</option>
                <option>$160k+</option>
              </select>
            </div>

            <Button className="w-full">Apply Filters</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function JobCard({ job }: { job: any }) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="pt-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-primary/10 text-primary font-semibold text-xl flex-shrink-0">
            {job.company.substring(0, 2).toUpperCase()}
          </div>

          <div className="flex-1">
            <div className="flex flex-col sm:flex-row items-start justify-between mb-3 gap-3">
              <div className="flex-1 w-full">
                <div className="flex flex-col sm:flex-row items-start justify-between gap-2">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{job.title}</h3>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mt-1 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Building2 className="h-4 w-4" />
                        {job.company}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {job.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {job.postedDate}
                      </span>
                    </div>
                  </div>
                  <div className="text-center sm:ml-4">
                    <p className="text-2xl font-semibold text-primary">{job.matchScore}%</p>
                    <p className="text-xs text-muted-foreground">Match</p>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground mt-3">{job.description}</p>

                <div className="flex items-center gap-4 mt-3">
                  <div className="flex items-center gap-1 text-sm">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span>{job.salary}</span>
                  </div>
                  <Badge variant="info">{job.type}</Badge>
                </div>

                <div className="mt-3">
                  <p className="text-xs text-muted-foreground mb-2">Required Skills:</p>
                  <div className="flex gap-2 flex-wrap">
                    {job.requiredSkills.map((skill: string) => (
                      <Badge key={skill} variant="success">
                        {skill}
                      </Badge>
                    ))}
                    {job.preferredSkills.map((skill: string) => (
                      <Badge key={skill} variant="default">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-3 border-t border-border">
              <Button className="flex-1">Apply Now</Button>
              <Button variant="outline" className="flex-1 sm:flex-initial">
                <Bookmark className="h-4 w-4 mr-2" />
                Save
              </Button>
              <Button variant="outline" className="flex-1 sm:flex-initial">View Details</Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
