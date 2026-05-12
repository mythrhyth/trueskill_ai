import { Link, useLocation } from 'react-router';
import {
  LayoutDashboard,
  Target,
  Upload,
  MessageSquare,
  Lightbulb,
  Users,
  Briefcase,
  UserSearch,
  Filter,
  Search
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  userType: 'candidate' | 'recruiter';
}

export function Sidebar({ userType }: SidebarProps) {
  const location = useLocation();
  const { state: { user } } = useAuth();

  const candidateLinks = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/candidate/dashboard' },
    { icon: Search, label: 'Job Openings', path: '/candidate/jobs' },
    { icon: Target, label: 'Skills', path: '/candidate/skills' },
    { icon: Upload, label: 'Profile', path: '/candidate/profile' },
    { icon: MessageSquare, label: 'AI Recruiter', path: '/candidate/chat' },
    { icon: Lightbulb, label: 'Recommendations', path: '/candidate/recommendations' },
  ];

  const recruiterLinks = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/recruiter/dashboard' },
    { icon: Briefcase, label: 'Create Job', path: '/recruiter/create-job' },
    { icon: UserSearch, label: 'Candidates', path: '/recruiter/candidates' },
    { icon: Filter, label: 'Search', path: '/recruiter/search' },
  ];

  const links = userType === 'candidate' ? candidateLinks : recruiterLinks;

  return (
    <div className="hidden lg:flex h-screen w-64 flex-col border-r border-sidebar-border bg-sidebar">
      <div className="flex h-16 items-center border-b border-sidebar-border px-6">
        <h1 className="text-xl font-semibold text-primary">TrueSkill AI</h1>
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = location.pathname === link.path;

          return (
            <Link
              key={link.path}
              to={link.path}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors',
                isActive
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
              )}
            >
              <Icon className="h-5 w-5" />
              <span>{link.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-sidebar-border p-4">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
            {user?.name?.charAt(0).toUpperCase() || (userType === 'candidate' ? 'C' : 'R')}
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">{user?.name || (userType === 'candidate' ? 'Candidate' : 'Recruiter')}</p>
            <p className="text-xs text-muted-foreground">{user?.email || 'View Profile'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
