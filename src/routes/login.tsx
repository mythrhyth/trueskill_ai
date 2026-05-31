import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { Brain, Mail, Lock, ArrowRight, Github, Chrome } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useAuthStore } from "@/store/useAuthStore";

export const Route = createFileRoute("/login")({
  component: Login,
});

function Login() {
  const navigate = useNavigate();
  const [role, setRole] = useState<"candidate" | "recruiter">("candidate");
  const login = useAuthStore((s) => s.login);

  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const enteredName = (formData.get("name") as string)?.trim();
    // Use entered name if available, otherwise derive from email
    const name = enteredName || email.split('@')[0].split(/[._-]/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') || 'User';
    const id = `user_${Date.now()}`;

    console.log('[Login] Logging in user:', { id, name, email, role });
    login({ id, name, email, role });
    navigate({ to: role === "candidate" ? "/candidate" : "/recruiter" });
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background">
      {/* Animated Background */}
      <div className="absolute inset-0 gradient-mesh opacity-80" />
      <div className="absolute inset-0 grid-pattern opacity-40" />
      <motion.div
        className="absolute top-[10%] left-[20%] h-96 w-96 rounded-full bg-[var(--purple)]/30 blur-[100px]"
        animate={{ x: [0, 50, 0], y: [0, -50, 0] }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-[10%] right-[20%] h-96 w-96 rounded-full bg-[var(--cyan)]/30 blur-[100px]"
        animate={{ x: [0, -50, 0], y: [0, 50, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />

      {/* Floating Particles */}
      {[...Array(15)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute h-1 w-1 rounded-full bg-white/40 shadow-[0_0_8px_rgba(255,255,255,0.6)]"
          style={{
            left: Math.random() * 100 + "%",
            top: Math.random() * 100 + "%",
          }}
          animate={{
            y: [0, -40, 0],
            opacity: [0, 0.8, 0],
            scale: [0.8, 1.2, 0.8],
          }}
          transition={{
            duration: Math.random() * 4 + 4,
            repeat: Infinity,
            delay: Math.random() * 3,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Login Card */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md p-8 sm:p-10"
      >
        <div className="absolute inset-0 rounded-[2.5rem] bg-card/85 backdrop-blur-2xl border border-border/40 shadow-[0_20px_50px_rgba(0,0,0,0.06)]" />
        <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-br from-card/30 to-transparent pointer-events-none" />
        
        <div className="relative flex flex-col items-center">
          <Link to="/" className="mb-8 flex h-14 w-14 items-center justify-center rounded-2xl gradient-primary shadow-xl hover:scale-105 transition-transform">
            <Brain className="h-7 w-7 text-white" />
          </Link>
          
          <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">Welcome back</h1>
          <p className="text-sm text-muted-foreground mb-8 text-center font-medium">
            Sign in to access your TrueSkill AI dashboard.
          </p>
 
          <Tabs
            defaultValue="candidate"
            className="w-full mb-8"
            onValueChange={(v) => setRole(v as "candidate" | "recruiter")}
          >
            <TabsList className="grid w-full grid-cols-2 bg-muted border border-border p-1 rounded-xl h-12">
              <TabsTrigger value="candidate" className="rounded-lg text-sm data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all text-muted-foreground cursor-pointer">
                Candidate
              </TabsTrigger>
              <TabsTrigger value="recruiter" className="rounded-lg text-sm data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all text-muted-foreground cursor-pointer">
                Recruiter
              </TabsTrigger>
            </TabsList>
          </Tabs>
 
          <form onSubmit={handleLogin} className="w-full space-y-5">
            <div className="space-y-4">
              <div className="space-y-1.5 relative group">
                <Label htmlFor="name" className="text-xs font-bold text-muted-foreground ml-1 uppercase tracking-wider">Full Name</Label>
                <div className="relative flex items-center">
                  <svg className="absolute left-3 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Jane Doe"
                    className="pl-10 h-12 bg-background/40 border-border text-foreground placeholder-muted-foreground focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary transition-all rounded-xl shadow-inner"
                  />
                </div>
              </div>
              <div className="space-y-1.5 relative group">
                <Label htmlFor="email" className="text-xs font-bold text-muted-foreground ml-1 uppercase tracking-wider">Email address</Label>
                <div className="relative flex items-center">
                  <Mail className="absolute left-3 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="name@example.com"
                    required
                    className="pl-10 h-12 bg-background/40 border-border text-foreground placeholder-muted-foreground focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary transition-all rounded-xl shadow-inner"
                  />
                </div>
              </div>
              
              <div className="space-y-1.5 relative group">
                <div className="flex items-center justify-between ml-1">
                  <Label htmlFor="password" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Password</Label>
                  <a href="#" className="text-xs font-bold text-primary hover:text-primary-hover transition-colors">Forgot password?</a>
                </div>
                <div className="relative flex items-center">
                  <Lock className="absolute left-3 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input 
                    id="password" 
                    type="password" 
                    placeholder="••••••••" 
                    required 
                    className="pl-10 h-12 bg-background/40 border-border text-foreground placeholder-muted-foreground focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary transition-all rounded-xl shadow-inner"
                  />
                </div>
              </div>
            </div>
 
            <div className="flex items-center space-x-2 ml-1">
              <Checkbox id="remember" className="border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary" />
              <Label htmlFor="remember" className="text-sm font-medium text-muted-foreground cursor-pointer">Remember me</Label>
            </div>
 
            <Button type="submit" className="w-full h-12 relative overflow-hidden rounded-xl gradient-primary border-0 text-white shadow-lg transition-all hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(10,102,194,0.4)] group cursor-pointer">
              <span className="relative z-10 flex items-center gap-2 font-medium">
                Sign in to {role === 'candidate' ? 'Profile' : 'Dashboard'} 
                <ArrowRight className="h-4 w-4 opacity-70 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </span>
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 rounded-xl pointer-events-none" />
            </Button>
          </form>
 
          <div className="mt-8 flex w-full items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted-foreground font-bold tracking-widest">OR CONTINUE WITH</span>
            <div className="h-px flex-1 bg-border" />
          </div>
 
          <div className="mt-6 grid w-full grid-cols-2 gap-3">
            <Button variant="outline" className="h-11 bg-background/40 border-border hover:bg-muted hover:border-border transition-all rounded-xl text-foreground font-bold shadow-sm cursor-pointer">
              <Github className="mr-2 h-4 w-4 text-foreground animate-none" />
              GitHub
            </Button>
            <Button variant="outline" className="h-11 bg-background/40 border-border hover:bg-muted hover:border-border transition-all rounded-xl text-foreground font-bold shadow-sm cursor-pointer">
              <Chrome className="mr-2 h-4 w-4 text-foreground animate-none" />
              Google
            </Button>
          </div>
          
          <p className="mt-8 text-center text-sm text-muted-foreground font-medium">
            Don't have an account?{" "}
            <Link to="/signup" className="text-primary font-bold hover:text-primary-hover transition-colors">
              Sign up
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
