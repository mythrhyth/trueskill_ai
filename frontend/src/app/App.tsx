import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import { AuthProvider } from '../context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import { Landing } from './pages/Landing';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { CandidateDashboard } from './pages/candidate/Dashboard';
import { CandidateJobs } from './pages/candidate/Jobs';
import { CandidateSkills } from './pages/candidate/Skills';
import { CandidateProfile } from './pages/candidate/Profile';
import { CandidateChat } from './pages/candidate/Chat';
import { CandidateRecommendations } from './pages/candidate/Recommendations';
import { RecruiterDashboard } from './pages/recruiter/Dashboard';
import { RecruiterCreateJob } from './pages/recruiter/CreateJob';
import { RecruiterCandidates } from './pages/recruiter/Candidates';
import { RecruiterCandidateProfile } from './pages/recruiter/CandidateProfile';
import { RecruiterSearch } from './pages/recruiter/Search';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/candidate/dashboard" element={
            <ProtectedRoute requiredRole="candidate">
              <CandidateDashboard />
            </ProtectedRoute>
          } />
          <Route path="/candidate/jobs" element={
            <ProtectedRoute requiredRole="candidate">
              <CandidateJobs />
            </ProtectedRoute>
          } />
          <Route path="/candidate/skills" element={
            <ProtectedRoute requiredRole="candidate">
              <CandidateSkills />
            </ProtectedRoute>
          } />
          <Route path="/candidate/profile" element={<CandidateProfile />} />
          <Route path="/candidate/chat" element={
            <ProtectedRoute requiredRole="candidate">
              <CandidateChat />
            </ProtectedRoute>
          } />
          <Route path="/candidate/recommendations" element={
            <ProtectedRoute requiredRole="candidate">
              <CandidateRecommendations />
            </ProtectedRoute>
          } />

          <Route path="/recruiter/dashboard" element={
            <ProtectedRoute requiredRole="recruiter">
              <RecruiterDashboard />
            </ProtectedRoute>
          } />
          <Route path="/recruiter/create-job" element={
            <ProtectedRoute requiredRole="recruiter">
              <RecruiterCreateJob />
            </ProtectedRoute>
          } />
          <Route path="/recruiter/candidates" element={
            <ProtectedRoute requiredRole="recruiter">
              <RecruiterCandidates />
            </ProtectedRoute>
          } />
          <Route path="/recruiter/candidate/:id" element={
            <ProtectedRoute requiredRole="recruiter">
              <RecruiterCandidateProfile />
            </ProtectedRoute>
          } />
          <Route path="/recruiter/search" element={
            <ProtectedRoute requiredRole="recruiter">
              <RecruiterSearch />
            </ProtectedRoute>
          } />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
