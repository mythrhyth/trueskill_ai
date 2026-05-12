import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Sidebar } from '../../components/Sidebar';
import { MobileSidebar } from '../../components/MobileSidebar';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/Card';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { Sparkles, CheckCircle2, X, Loader2 } from 'lucide-react';
import { apiClient } from '../../../api/client';

export function RecruiterCreateJob() {
  const navigate = useNavigate();
  const [jobDescription, setJobDescription] = useState('');
  const [extracted, setExtracted] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  
  const [requiredSkills, setRequiredSkills] = useState<any[]>([]);
  const [preferredSkills, setPreferredSkills] = useState<any[]>([]);
  
  // Job Details
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [salary, setSalary] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('Senior (5+ years)');

  const handleExtract = async () => {
    if (!jobDescription || jobDescription.length < 50) {
      alert("Please provide a longer job description.");
      return;
    }
    
    setIsExtracting(true);
    try {
      const data = await apiClient.extractJobSkills(jobDescription);
      setRequiredSkills(data.required_skills);
      setPreferredSkills(data.preferred_skills);
      setExtracted(true);
    } catch (error) {
      console.error("Failed to extract skills:", error);
      alert("Failed to extract skills from job description.");
    } finally {
      setIsExtracting(false);
    }
  };

  const handlePublish = async () => {
    if (!title) {
      alert("Please provide a job title.");
      return;
    }
    
    setIsPublishing(true);
    try {
      const jobData = {
        title,
        company: "My Company", // Placeholder, would come from recruiter profile
        location,
        type: "Full-time", // Placeholder
        salary,
        description: jobDescription,
        required_skills: requiredSkills,
        preferred_skills: preferredSkills
      };
      
      const data = await apiClient.createJob(jobData);
      navigate('/recruiter/candidates'); // Redirect to view matched candidates
    } catch (error) {
      console.error("Failed to create job:", error);
      alert("Failed to create job.");
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar userType="recruiter" />
      <MobileSidebar userType="recruiter" />

      <div className="flex-1 overflow-auto">
        <div className="border-b border-border bg-card px-4 lg:px-8 py-6 pt-20 lg:pt-6">
          <h1 className="text-2xl font-semibold">Create Job</h1>
          <p className="text-sm text-muted-foreground mt-1">AI-powered job description analysis</p>
        </div>

        <div className="p-4 lg:p-8 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Job Description</CardTitle>
            </CardHeader>
            <CardContent>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste your job description here... AI will extract required and preferred skills automatically."
                className="w-full min-h-[200px] rounded-lg border border-border bg-input-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
              />
              <div className="flex justify-end mt-4">
                <Button onClick={handleExtract} disabled={isExtracting || jobDescription.length < 50}>
                  {isExtracting ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4 mr-2" />
                  )}
                  {isExtracting ? 'Extracting...' : 'Extract Skills with AI'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {extracted && (
            <>
              <Card className="border-primary/20 bg-primary/5">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 flex-shrink-0">
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                    </div>
                    <div className="space-y-1">
                      <p className="font-medium">AI Analysis Complete</p>
                      <p className="text-sm text-muted-foreground">
                        Extracted {requiredSkills.length} required skills and {preferredSkills.length} preferred skills.
                        You can edit these below.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Required Skills</CardTitle>
                    <Button size="sm" variant="outline">+ Add Skill</Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {requiredSkills.map((skill) => (
                      <SkillTag
                        key={skill.name || skill}
                        skill={skill.name || skill}
                        variant="success"
                        onRemove={() => setRequiredSkills(requiredSkills.filter(s => (s.name || s) !== (skill.name || skill)))}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Preferred Skills</CardTitle>
                    <Button size="sm" variant="outline">+ Add Skill</Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {preferredSkills.map((skill) => (
                      <SkillTag
                        key={skill.name || skill}
                        skill={skill.name || skill}
                        variant="info"
                        onRemove={() => setPreferredSkills(preferredSkills.filter(s => (s.name || s) !== (skill.name || skill)))}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Job Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Job Title</label>
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g. Senior Full-Stack Developer"
                        className="w-full h-10 rounded-lg border border-border bg-input-background px-3 text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Experience Level</label>
                      <select 
                        value={experienceLevel}
                        onChange={(e) => setExperienceLevel(e.target.value)}
                        className="w-full h-10 rounded-lg border border-border bg-input-background px-3 text-sm"
                      >
                        <option>Senior (5+ years)</option>
                        <option>Mid-Level (3-5 years)</option>
                        <option>Junior (0-3 years)</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Location</label>
                      <input
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="e.g. Remote, San Francisco"
                        className="w-full h-10 rounded-lg border border-border bg-input-background px-3 text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Salary Range</label>
                      <input
                        type="text"
                        value={salary}
                        onChange={(e) => setSalary(e.target.value)}
                        placeholder="e.g. $120k - $180k"
                        className="w-full h-10 rounded-lg border border-border bg-input-background px-3 text-sm"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end gap-3">
                <Button variant="outline">Save as Draft</Button>
                <Button onClick={handlePublish} disabled={isPublishing || !title}>
                  {isPublishing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                  {isPublishing ? 'Publishing...' : 'Publish Job & Find Candidates'}
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function SkillTag({
  skill,
  variant,
  onRemove
}: {
  skill: string;
  variant: 'success' | 'info';
  onRemove: () => void;
}) {
  return (
    <div className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full border border-border bg-card">
      <Badge variant={variant}>{skill}</Badge>
      <button
        onClick={onRemove}
        className="ml-1 rounded-full hover:bg-muted p-0.5 transition-colors"
      >
        <X className="h-3 w-3" />
      </button>
    </div>
  );
}
