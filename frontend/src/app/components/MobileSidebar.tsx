import { useState } from 'react';
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
  Search,
  Menu,
  X
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../../context/AuthContext';

interface MobileSidebarProps {
  userType: 'candidate' | 'recruiter';
}

export function MobileSidebar({ userType }: MobileSidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
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
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed top-4 left-4 z-50 lg:hidden flex h-10 w-10 items-center justify-center rounded-lg bg-card border border-border shadow-sm"
      >
        <Menu className="h-5 w-5" />
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <div
        className={cn(
          'fixed top-0 left-0 h-screen w-64 bg-sidebar border-r border-sidebar-border z-50 lg:hidden transition-transform duration-300',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-6">
          <h1 className="text-xl font-semibold text-primary">TrueSkill AI</h1>
          <button
            onClick={() => setIsOpen(false)}
            className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-sidebar-accent"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 p-4">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path;

            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsOpen(false)}
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
    </>
  );
}
