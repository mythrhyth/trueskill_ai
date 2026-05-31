import { ReactNode } from "react";
import { useRouterState, Link } from "@tanstack/react-router";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { Search, Bell } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAuthStore } from "@/store/useAuthStore";
import { ThemeToggle } from "@/components/theme-toggle";

export function AppShell({ children }: { children: ReactNode }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const { user, logout } = useAuthStore();
  
  // Extract initials
  const initials = user?.name 
    ? user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : "U";
  // Landing page = no shell
  if (path === "/") return <>{children}</>;

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />
        <div className="flex flex-1 flex-col">
          <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b bg-background/70 px-4 backdrop-blur-xl">
            <SidebarTrigger />
            <div className="relative ml-2 hidden max-w-md flex-1 md:block">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#666666] dark:text-[#b0b3b8]" />
              <Input placeholder="Search candidates, skills, roles..." className="h-9 pl-9 bg-muted/40 border-0" />
            </div>
            <div className="ml-auto flex items-center gap-2">
              <ThemeToggle />
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <Bell className="h-4 w-4 text-[#666666] dark:text-[#b0b3b8]" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="h-9 w-9 rounded-full gradient-primary flex items-center justify-center text-xs font-semibold text-white focus:outline-none focus:ring-2 focus:ring-[var(--indigo)] focus:ring-offset-2 focus:ring-offset-background transition-transform hover:scale-105 active:scale-95 shadow-sm">
                    {initials}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 rounded-xl border border-border/50 bg-background/80 backdrop-blur-xl">
                  <DropdownMenuLabel className="font-normal p-3">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user?.name || "User"}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user?.email || "user@example.com"}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="cursor-pointer py-2">
                    Profile Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer py-2">
                    Billing & Plan
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild className="cursor-pointer py-2 text-destructive focus:bg-destructive/10 focus:text-destructive" onClick={logout}>
                    <Link to="/">Sign out</Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>
          <main className="flex-1">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
