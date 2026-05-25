import { Link, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, Users, Briefcase, Network, Sparkles, Home, Brain } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";

const items = [
  { title: "Home", url: "/", icon: Home },
  { title: "Candidate", url: "/candidate", icon: LayoutDashboard },
  { title: "Recruiter", url: "/recruiter", icon: Users },
  { title: "Job Matching", url: "/jobs", icon: Briefcase },
  { title: "Skill Graph", url: "/graph", icon: Network },
  { title: "Explainable AI", url: "/insights", icon: Sparkles },
];

export function AppSidebar() {
  const currentPath = useRouterState({ select: (s) => s.location.pathname });

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <Link to="/" className="flex items-center gap-2 px-2 py-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl gradient-primary glow">
            <Brain className="h-5 w-5 text-white" />
          </div>
          <div className="flex flex-col leading-tight group-data-[collapsible=icon]:hidden">
            <span className="text-sm font-semibold">TrueSkill AI</span>
            <span className="text-[10px] text-muted-foreground">Talent Intelligence</span>
          </div>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Platform</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={currentPath === item.url}>
                    <Link to={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className="rounded-xl border bg-gradient-to-br from-indigo/10 to-purple/10 p-3 text-xs group-data-[collapsible=icon]:hidden">
          <p className="font-medium">Pro tier</p>
          <p className="text-muted-foreground mt-1">Unlock unlimited candidate analysis.</p>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
