import { useState, useRef } from 'react';
import { useNavigate } from 'react-router';
import { Sidebar } from '../../components/Sidebar';
import { MobileSidebar } from '../../components/MobileSidebar';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/Card';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { ScoreBar } from '../../components/ScoreBar';
import { LinkInputCard, MultiLinkInputCard, FileUploadCard } from '../../components/IngestionCards';
import { Upload, Github, Linkedin, Globe, FileText, AlertCircle, CheckCircle2, Loader2, AlertTriangle, Trophy, BookOpen, Award } from 'lucide-react';
import { useResumeProcessing } from '../../../hooks/useResumeProcessing';
import { useAuth } from '../../../context/AuthContext';
import { apiClient } from '../../../api/client';

export function CandidateProfile() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { state: { user } } = useAuth();
  const { isLoading, error, result, uploadedFileName, processResume, clearError, clearResult } = useResumeProcessing();
  const [dragActive, setDragActive] = useState(false);
  
  // State for additional ingestion sections
  const [githubUrl, setGithubUrl] = useState('');
  const [isProcessingFull, setIsProcessingFull] = useState(false);

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileSelect = async (file: File) => {
    if (!file.name.match(/\.(pdf|docx?|txt|md)$/i)) {
      alert('Please upload a valid resume file (PDF, DOCX, DOC, TXT, or MD)');
      return;
    }

    try {
      // Check if user is authenticated
      const userId = user ? user.id.toString() : undefined;
      await processResume(file, userId);
    } catch (err) {
      console.error('Resume processing failed:', err);
    }
  };

  const handleChooseFile = () => {
    fileInputRef.current?.click();
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  // API integration handlers
  const handleAddGitHubProfile = async (url: string) => {
    await apiClient.addGitHubProfile(url);
    const response = await apiClient.processExternalProfiles();
    localStorage.setItem('skillsData', JSON.stringify(response));
    // Ideally we should update the local state here too, or force a reload
  };

  const handleAddCPProfiles = async (urls: string[]) => {
    await apiClient.addCPProfiles(urls);
    const response = await apiClient.processExternalProfiles();
    localStorage.setItem('skillsData', JSON.stringify(response));
  };

  const handleAddKaggleProfile = async (url: string) => {
    await apiClient.addKaggleProfile(url);
    const response = await apiClient.processExternalProfiles();
    localStorage.setItem('skillsData', JSON.stringify(response));
  };

  const handleAddResearchProfile = async (url: string) => {
    await apiClient.addResearchProfile(url);
    const response = await apiClient.processExternalProfiles();
    localStorage.setItem('skillsData', JSON.stringify(response));
  };

  const handleUploadProofOfWork = async (files: File[]) => {
    await apiClient.uploadProofOfWork(files);
  };

  const handleFullProcess = async () => {
    setIsProcessingFull(true);
    try {
      const response = await apiClient.processResume(
        new File([''], 'dummy', { type: 'text/plain' }) // Dummy file since we already have data
      );
      
      // Store response and navigate to dashboard
      localStorage.setItem('skillsData', JSON.stringify(response));
      navigate('/candidate/dashboard');
    } catch (error: any) {
      console.error('Full process failed:', error);
    } finally {
      setIsProcessingFull(false);
    }
  };

  const profileStrength = result?.summary.profile_strength ?? 0;
  const totalSkills = result?.summary.total_skills ?? 0;

  return (
    <div className="flex h-screen bg-background">
      <Sidebar userType="candidate" />
      <MobileSidebar userType="candidate" />

      <div className="flex-1 overflow-auto">
        <div className="border-b border-border bg-card px-4 lg:px-8 py-6 pt-20 lg:pt-6">
          <h1 className="text-2xl font-semibold">Profile & Upload</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {result ? 'Your AI-validated skills profile' : 'Build your proof-based profile'}
          </p>
        </div>

        <div className="p-4 lg:p-8 space-y-6">
          {/* Profile Completeness Card */}
          <Card>
            <CardHeader>
              <CardTitle>Profile Completeness</CardTitle>
            </CardHeader>
            <CardContent>
              <ScoreBar score={profileStrength} label="Overall Profile Strength" />
              {result && (
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div className="space-y-1">
                    <p className="text-muted-foreground">✓ Resume analyzed</p>
                    <p className="text-muted-foreground">✓ {totalSkills} skills extracted</p>
                    <p className="text-muted-foreground">✓ Skills validated</p>
                  </div>
                  <div className="space-y-1">
                    {result.is_suspicious && (
                      <p className="text-amber-600">⚠ Suspicious activity detected</p>
                    )}
                    {result.fraud_count > 0 && (
                      <p className="text-red-600">✗ {result.fraud_count} flagged skills</p>
                    )}
                    {result.processing_errors.length > 0 && (
                      <p className="text-amber-600">⚠ {result.processing_errors.length} processing warning(s)</p>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Error Alert */}
          {error && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium text-red-900">{error.message}</p>
                    {error.details && (
                      <p className="text-sm text-red-800 mt-1">{error.details}</p>
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={clearError}
                    className="text-red-600 hover:bg-red-100"
                  >
                    ✕
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Processing Errors */}
          {result && result.processing_errors.length > 0 && (
            <Card className="border-amber-200 bg-amber-50">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium text-amber-900">Processing Warnings</p>
                    <ul className="text-sm text-amber-800 mt-2 space-y-1">
                      {result.processing_errors.map((err: any, idx: number) => (
                        <li key={idx}>• {err}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Upload Resume Card */}
          <Card>
            <CardHeader>
              <CardTitle>Upload Resume</CardTitle>
            </CardHeader>
            <CardContent>
              <div
                onClick={handleChooseFile}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                className={`rounded-lg border-2 border-dashed p-12 text-center space-y-4 transition-colors cursor-pointer ${
                  dragActive
                    ? 'border-primary bg-primary/5'
                    : 'border-border bg-muted/30'
                }`}
              >
                <div className="flex justify-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                    <Upload className="h-8 w-8 text-primary" />
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="font-medium">
                    {isLoading ? 'Processing your resume...' : 'Drag and drop your resume here'}
                  </p>
                  <p className="text-sm text-muted-foreground">or click to browse files</p>
                  <p className="text-xs text-muted-foreground">PDF, DOCX, DOC, TXT, MD (max 5MB)</p>
                </div>
                <Button onClick={handleChooseFile} disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Choose File'
                  )}
                </Button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,.doc,.txt,.md"
                onChange={handleFileInputChange}
                className="hidden"
                disabled={isLoading}
              />

              {uploadedFileName && !isLoading && (
                <div className="mt-4 rounded-lg bg-green-50 border border-green-200 p-3 flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-green-900">{uploadedFileName}</p>
                    <p className="text-xs text-green-800">Processed successfully</p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={clearResult}
                    className="text-green-600 hover:bg-green-100"
                  >
                    Clear
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Extracted Skills */}
          {result && result.skills.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Extracted Skills ({result.skills.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {result.skills.map((skill: any) => (
                    <SkillCard key={skill.name} skill={skill} />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Skills Summary */}
          {result && (
            <Card>
              <CardHeader>
                <CardTitle>Skills Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <SummaryItem
                    label="Total Skills"
                    value={result.summary.total_skills}
                    color="bg-blue-50 text-blue-700"
                  />
                  <SummaryItem
                    label="Strong"
                    value={result.summary.strong}
                    color="bg-green-50 text-green-700"
                  />
                  <SummaryItem
                    label="Moderate"
                    value={result.summary.moderate}
                    color="bg-yellow-50 text-yellow-700"
                  />
                  <SummaryItem
                    label="Weak"
                    value={result.summary.weak}
                    color="bg-red-50 text-red-700"
                  />
                </div>
                <div className="mt-4 text-sm text-muted-foreground">
                  <p>Average Confidence: {result.summary.average_confidence.toFixed(1)}%</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* GitHub Profile */}
          <Card>
            <CardHeader>
              <CardTitle>GitHub Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <LinkInputCard
                title="GitHub"
                placeholder="github.com/username"
                icon={Github}
                onSubmit={handleAddGitHubProfile}
              />
            </CardContent>
          </Card>

          {/* Competitive Programming Profiles */}
          <Card>
            <CardHeader>
              <CardTitle>Competitive Programming Profiles</CardTitle>
            </CardHeader>
            <CardContent>
              <MultiLinkInputCard
                title="Add Your CP Profiles"
                placeholder="Enter your competitive programming profile URLs"
                items={[
                  { label: 'Codeforces', placeholder: 'codeforces.com/profile/username' },
                  { label: 'LeetCode', placeholder: 'leetcode.com/username' },
                  { label: 'CodeChef', placeholder: 'codechef.com/users/username' }
                ]}
                onSubmit={handleAddCPProfiles}
              />
            </CardContent>
          </Card>

          {/* Kaggle Profile */}
          <Card>
            <CardHeader>
              <CardTitle>Kaggle Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <LinkInputCard
                title="Kaggle"
                placeholder="kaggle.com/username"
                icon={Trophy}
                onSubmit={handleAddKaggleProfile}
              />
            </CardContent>
          </Card>

          {/* Research Profile */}
          <Card>
            <CardHeader>
              <CardTitle>Research Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <LinkInputCard
                title="Google Scholar / Research"
                placeholder="scholar.google.com/citations?user=ID"
                icon={BookOpen}
                onSubmit={handleAddResearchProfile}
              />
            </CardContent>
          </Card>

          {/* Proof of Work Upload */}
          <Card>
            <CardHeader>
              <CardTitle>Proof of Work Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <FileUploadCard
                title="Upload Certificates & Documents"
                description="Upload certificates, project documents, and other proof of work"
                acceptedFormats={['.pdf', '.jpg', '.jpeg', '.png', '.docx', '.doc']}
                multiple={true}
                onSubmit={handleUploadProofOfWork}
              />
            </CardContent>
          </Card>

          {/* Add Project Links */}
          <Card>
            <CardHeader>
              <CardTitle>Add Project Links</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex gap-3">
                  <Input placeholder="Project name" className="flex-1" />
                  <Input placeholder="URL" className="flex-1" />
                  <Button>Add</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3">
            {result && <Button variant="outline">Export Profile</Button>}
            <Button 
              onClick={handleFullProcess}
              disabled={isLoading || isProcessingFull}
            >
              {isProcessingFull ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                'Complete Profile & Process Skills'
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface SkillCardProps {
  skill: {
    name: string;
    category?: string;
    confidence_score: number;
    authenticity_score: number;
    status: 'Strong' | 'Moderate' | 'Weak';
    evidence: string[];
    level?: string;
  };
}

function SkillCard({ skill }: SkillCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Strong':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'Moderate':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'Weak':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <div className="flex items-start gap-3 rounded-lg border border-border p-3 hover:bg-muted/50 transition-colors">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <p className="font-medium">{skill.name}</p>
          {skill.category && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
              {skill.category}
            </span>
          )}
        </div>
        <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
          <span>Confidence: {skill.confidence_score.toFixed(1)}%</span>
          <span>Authenticity: {skill.authenticity_score.toFixed(1)}%</span>
          {skill.level && <span>Level: {skill.level}</span>}
        </div>
        {skill.evidence.length > 0 && (
          <div className="mt-2 text-xs text-muted-foreground">
            <p className="font-medium">Evidence:</p>
            <ul className="list-disc list-inside">
              {skill.evidence.slice(0, 2).map((ev, idx) => (
                <li key={idx}>{ev}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(skill.status)}`}>
        {skill.status}
      </span>
    </div>
  );
}

function SummaryItem({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className={`rounded-lg ${color} p-4 text-center`}>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs">{label}</p>
    </div>
  );
}

function ProfileLinkInput({
  icon: Icon,
  label,
  placeholder,
  connected,
  value = '',
}: {
  icon: any;
  label: string;
  placeholder: string;
  connected: boolean;
  value?: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
        <Icon className="h-5 w-5 text-muted-foreground" />
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium mb-1">{label}</p>
        <Input
          placeholder={placeholder}
          defaultValue={value}
          disabled={connected}
        />
      </div>
      {connected ? (
        <Button variant="outline" size="sm">
          Disconnect
        </Button>
      ) : (
        <Button size="sm">Connect</Button>
      )}
    </div>
  );
}
