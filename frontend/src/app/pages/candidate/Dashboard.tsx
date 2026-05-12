import { useState, useEffect } from 'react';
import { Sidebar } from '../../components/Sidebar';
import { MobileSidebar } from '../../components/MobileSidebar';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { useAuth } from '../../../context/AuthContext';
import { apiClient } from '../../../api/client';

interface Skill {
  name: string;
  category?: string;
  confidence_score: number;
  authenticity_score: number;
  status: 'Strong' | 'Moderate' | 'Weak';
  evidence: string[];
  level?: string;
  signals: any[];
  source_count: number;
  created_at?: string;
}

export function CandidateDashboard() {
  const { state: { user, isLoading: authLoading } } = useAuth();
  const [userSkills, setUserSkills] = useState<Skill[]>([]);
  const [uploadStatus, setUploadStatus] = useState<any>(null);
  const [githubStatus, setGithubStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Fetch upload status
        try {
          const uploadStatusResponse = await apiClient.getUploadStatus();
          setUploadStatus(uploadStatusResponse);
        } catch (uploadError) {
          console.log('Failed to fetch upload status, using default');
          setUploadStatus({
            has_resume: false,
            has_github: false,
            has_kaggle: false,
            has_research: false,
            resume_uploaded_at: null,
            github_connected_at: null,
            last_updated: null
          });
        }

        // Fetch GitHub skills status
        try {
          const githubStatusResponse = await apiClient.getGitHubSkillsStatus();
          setGithubStatus(githubStatusResponse.github_status);
        } catch (githubError) {
          console.log('Failed to fetch GitHub status, using default');
          setGithubStatus({
            github_skills_extracted: false,
            github_url: null,
            github_last_extracted: null,
            github_connected: false
          });
        }

        // Fetch user skills from the authenticated endpoint
        try {
          const skillsResponse = await apiClient.getUserSkills();
          // Map backend SkillResponse to frontend Skill interface
          const mappedSkills = skillsResponse.skills.map((skill: any) => ({
            name: skill.name,
            category: skill.category,
            confidence_score: skill.confidence_score,
            authenticity_score: skill.authenticity_score,
            status: skill.status,
            evidence: skill.evidence || [],
            level: skill.level,
            signals: skill.signals || [],
            source_count: skill.source_count || 1,
            created_at: skill.created_at
          }));
          setUserSkills(mappedSkills);
        } catch (skillsError) {
          console.log('No user skills found, showing empty state');
          // Don't throw error when there is no user data
          setUserSkills([]);
        }
      } catch (error) {
        console.error('Failed to fetch user data:', error);
        setError('Failed to load your profile data');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Strong':
        return 'bg-green-100 text-green-800';
      case 'Moderate':
        return 'bg-yellow-100 text-yellow-800';
      case 'Weak':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar userType="candidate" />
      <MobileSidebar userType="candidate" />
      <div className="flex-1 overflow-auto">
        <div className="border-b border-border bg-card px-4 lg:px-8 py-6 pt-20">
          <h1 className="text-2xl font-semibold">Welcome back, {user.name}!</h1>
          <p className="text-sm text-muted-foreground mt-1">Here's your skills and profile overview</p>
        </div>

        <div className="p-4 lg:p-8">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Your Skills Profile</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                </div>
              ) : userSkills.length > 0 ? (
                <div className="space-y-4">
                  {userSkills.map((skill, index) => (
                    <div
                      key={index}
                      className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 text-lg">{skill.name}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            {skill.category && (
                              <span className="text-sm text-gray-600 bg-gray-200 px-2 py-1 rounded">
                                {skill.category}
                              </span>
                            )}
                            {skill.level && (
                              <span className="text-sm text-blue-600 bg-blue-100 px-2 py-1 rounded">
                                {skill.level}
                              </span>
                            )}
                            <span className="text-sm text-gray-500">
                              from {skill.source_count} source{skill.source_count > 1 ? 's' : ''}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-sm text-gray-600">Confidence</p>
                            <p className="text-lg font-semibold text-gray-900">
                              {skill.confidence_score.toFixed(1)}%
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-600">Authenticity</p>
                            <p className="text-lg font-semibold text-gray-900">
                              {skill.authenticity_score.toFixed(1)}%
                            </p>
                          </div>
                          <Badge className={`${getStatusColor(skill.status)}`}>
                            {skill.status}
                          </Badge>
                        </div>
                      </div>
                      
                      {/* Evidence Section */}
                      {skill.evidence && skill.evidence.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <p className="text-sm font-medium text-gray-700 mb-2">Evidence:</p>
                          <div className="space-y-1">
                            {skill.evidence.map((evidence, evidenceIndex) => (
                              <p key={evidenceIndex} className="text-sm text-gray-600 pl-3 border-l-2 border-gray-300">
                                {evidence}
                              </p>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Signals Section */}
                      {skill.signals && skill.signals.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <p className="text-sm font-medium text-gray-700 mb-2">Detection Signals:</p>
                          <div className="flex flex-wrap gap-1">
                            {skill.signals.map((signal, signalIndex) => (
                              <span key={signalIndex} className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">
                                {typeof signal === 'string' ? signal : JSON.stringify(signal)}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Upload Status</h3>
                    <div className="flex justify-center gap-4 mb-4">
                      <div className={`px-3 py-1 rounded-full text-sm ${
                        uploadStatus?.has_resume 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        Resume: {uploadStatus?.has_resume ? 'Uploaded' : 'Not uploaded'}
                      </div>
                      <div className={`px-3 py-1 rounded-full text-sm ${
                        uploadStatus?.has_github 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        GitHub: {uploadStatus?.has_github ? 'Connected' : 'Not connected'}
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 mb-4">
                    {githubStatus?.github_skills_extracted 
                      ? 'GitHub link already added and skills extracted'
                      : uploadStatus?.has_resume 
                        ? 'No skills extracted yet. Re-upload your resume or add more profiles to get started!'
                        : 'No skills found yet. Upload your resume or connect GitHub to get started!'
                    }
                  </p>
                  
                  <div className="flex justify-center gap-3">
                    <a
                      href="/candidate/profile"
                      className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      {uploadStatus?.has_resume ? 'Re-upload Resume' : 'Upload Resume'}
                    </a>
                    {!uploadStatus?.has_github && !githubStatus?.github_skills_extracted && (
                      <a
                        href="/candidate/profile"
                        className="inline-block px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                      >
                        Connect GitHub
                      </a>
                    )}
                    {githubStatus?.github_skills_extracted && (
                      <button
                        onClick={() => window.location.href = githubStatus.github_url}
                        className="inline-block px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                      >
                        View GitHub Profile
                      </button>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="mb-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">Resume Status:</span>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      uploadStatus?.has_resume 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {uploadStatus?.has_resume ? 'Uploaded' : 'Not uploaded'}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">GitHub Status:</span>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      uploadStatus?.has_github 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {uploadStatus?.has_github ? 'Connected' : 'Not connected'}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">GitHub Skills:</span>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      githubStatus?.github_skills_extracted 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {githubStatus?.github_skills_extracted ? 'Extracted' : 'Not extracted'}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">Kaggle Status:</span>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      uploadStatus?.has_kaggle 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {uploadStatus?.has_kaggle ? 'Connected' : 'Not connected'}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">Research Status:</span>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      uploadStatus?.has_research 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {uploadStatus?.has_research ? 'Connected' : 'Not connected'}
                    </span>
                  </div>
                  
                  {uploadStatus?.last_updated && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">Last Updated:</span>
                      <span className="text-sm text-gray-600">
                        {new Date(uploadStatus.last_updated).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  
                  {uploadStatus?.resume_uploaded_at && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">Resume Uploaded:</span>
                      <span className="text-sm text-gray-600">
                        {new Date(uploadStatus.resume_uploaded_at).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  
                  {githubStatus?.github_last_extracted && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">GitHub Skills Extracted:</span>
                      <span className="text-sm text-gray-600">
                        {new Date(githubStatus.github_last_extracted).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
