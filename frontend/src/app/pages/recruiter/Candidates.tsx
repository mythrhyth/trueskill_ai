import { Link } from 'react-router';
import { useState, useEffect } from 'react';
import { Sidebar } from '../../components/Sidebar';
import { MobileSidebar } from '../../components/MobileSidebar';
import { Card, CardContent } from '../../components/Card';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { ArrowUpDown, Loader2 } from 'lucide-react';
import { apiClient } from '../../../api/client';
import { useAuth } from '../../../context/AuthContext';

export function RecruiterCandidates() {
  const { state: { user } } = useAuth();
  const [candidates, setCandidates] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchCandidates() {
      setIsLoading(true);
      try {
        // In a real app, we'd pass the specific job ID. For now, fetch for job ID 1.
        const data = await apiClient.getJobCandidates(1);
        
        const mappedCandidates = data.candidates.map((c: any) => ({
          id: c.candidate_id,
          name: c.name || `Candidate #${c.candidate_id}`,
          role: 'Applicant',
          matchScore: Math.round(c.match_score * 100),
          interestScore: Math.round((c.interest_score || 0) * 100),
          skills: c.matched_skills || [],
          experience: 'View Profile',
        }));
        
        setCandidates(mappedCandidates);
      } catch (error) {
        console.error("Failed to fetch candidates:", error);
      } finally {
        setIsLoading(false);
      }
    }
    
    if (user) {
      fetchCandidates();
    }
  }, [user]);

  return (
    <div className="flex h-screen bg-background">
      <Sidebar userType="recruiter" />
      <MobileSidebar userType="recruiter" />

      <div className="flex-1 overflow-auto">
        <div className="border-b border-border bg-card px-4 lg:px-8 py-6 pt-20 lg:pt-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold">Candidate Matches</h1>
              <p className="text-sm text-muted-foreground mt-1">{candidates.length} candidates matched to your jobs</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <Button variant="outline">
                <ArrowUpDown className="h-4 w-4 mr-2" />
                Sort by Match Score
              </Button>
              <Button>Export List</Button>
            </div>
          </div>
        </div>

        <div className="p-4 lg:p-8">
          <div className="space-y-3">
            {isLoading ? (
              <div className="flex justify-center p-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : candidates.length === 0 ? (
              <div className="text-center p-12 bg-muted/20 rounded-lg">
                <p className="text-muted-foreground">No candidates found for this job.</p>
              </div>
            ) : (
              candidates.map((candidate) => (
                <Link key={candidate.id} to={`/recruiter/candidate/${candidate.id}`}>
                  <CandidateCard candidate={candidate} />
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function CandidateCard({ candidate }: { candidate: any }) {
  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer">
      <CardContent className="pt-6">
        <div className="flex flex-col sm:flex-row items-start gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary text-xl font-semibold flex-shrink-0">
            {candidate.name.split(' ').map((n: string) => n[0]).join('')}
          </div>

          <div className="flex-1 w-full">
            <div className="flex flex-col sm:flex-row items-start justify-between mb-2 gap-3">
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{candidate.name}</h3>
                <p className="text-sm text-muted-foreground">{candidate.role} • {candidate.experience}</p>
              </div>
              <div className="flex gap-6 sm:gap-6">
                <div className="text-center">
                  <p className="text-xl sm:text-2xl font-semibold text-primary">{candidate.matchScore}%</p>
                  <p className="text-xs text-muted-foreground">Match Score</p>
                </div>
                <div className="text-center">
                  <p className="text-xl sm:text-2xl font-semibold text-secondary">{candidate.interestScore}%</p>
                  <p className="text-xs text-muted-foreground">Interest</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap mb-3">
              {candidate.skills.map((skill: string) => (
                <Badge key={skill} variant="default">
                  {skill}
                </Badge>
              ))}
            </div>

            <Button variant="outline" onClick={(e) => e.preventDefault()} className="w-full sm:w-auto">
              View Profile
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
