import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Mail, Lock, ArrowRight, Github, Chrome, User, Building, GraduationCap, Briefcase, Linkedin, UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuthStore } from "@/store/useAuthStore";

export const Route = createFileRoute("/signup")({
  component: SignUp,
});

function SignUp() {
  const navigate = useNavigate();
  const [role, setRole] = useState<"candidate" | "recruiter">("candidate");
  const login = useAuthStore((s) => s.login);

  const handleSignUp = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get("fullName") as string;
    const email = formData.get("email") as string;
    
    login({ name, email, role });
    navigate({ to: role === "candidate" ? "/candidate" : "/recruiter" });
  };

  return (
    <div className="relative min-h-screen bg-background text-white selection:bg-[var(--cyan)] selection:text-black">
      {/* Cinematic Background */}
      <div className="fixed inset-0 gradient-mesh opacity-70" />
      <div className="fixed inset-0 grid-pattern opacity-30" />
      
      {/* Animated Glow Orbs */}
      <motion.div
        className="fixed -top-40 right-[-10%] h-[600px] w-[600px] rounded-full bg-[var(--purple)]/20 blur-[120px]"
        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.7, 0.5] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="fixed bottom-[-20%] left-[-10%] h-[500px] w-[500px] rounded-full bg-[var(--cyan)]/20 blur-[100px]"
        animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0.6, 0.4] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />

      {/* Main Content Area */}
      <div className="relative z-10 flex min-h-screen flex-col items-center py-12 px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center mb-10 text-center"
        >
          <Link to="/" className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl gradient-primary shadow-xl hover:scale-105 transition-transform duration-300">
            <Brain className="h-8 w-8 text-white" />
          </Link>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-[#1E1B4B] mb-3">
            Join the Elite
          </h1>
          <p className="text-[#5B6475] max-w-md text-sm sm:text-base font-medium">
            Create an account to access TrueSkill AI's verified hiring ecosystem.
          </p>
        </motion.div>

        {/* Form Container */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="w-full max-w-2xl"
        >
          <div className="rounded-[2rem] bg-white/70 backdrop-blur-2xl border border-white/40 p-6 sm:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.1)] relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent pointer-events-none" />
            
            <form onSubmit={handleSignUp} className="relative z-10 space-y-10">
              
              {/* Role Selection */}
              <div className="space-y-4">
                <Label className="text-sm font-bold text-[#334155] uppercase tracking-widest ml-1">Select Your Role</Label>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { id: "candidate", title: "Candidate", desc: "Build your verified profile", icon: User },
                    { id: "recruiter", title: "Recruiter", desc: "Find top engineers", icon: Briefcase }
                  ].map((r) => (
                    <div 
                      key={r.id}
                      onClick={() => setRole(r.id as any)}
                      className={`relative cursor-pointer rounded-2xl border p-5 transition-all duration-300 flex flex-col gap-3 overflow-hidden group ${
                        role === r.id 
                          ? 'border-[var(--indigo)]/60 bg-white shadow-lg' 
                          : 'border-black/5 bg-black/5 hover:bg-black/10'
                      }`}
                    >
                      {role === r.id && (
                        <motion.div layoutId="role-active" className="absolute inset-0 bg-gradient-to-br from-[var(--indigo)]/5 to-transparent pointer-events-none" />
                      )}
                      <div className={`h-10 w-10 rounded-xl flex items-center justify-center transition-colors ${role === r.id ? 'bg-[var(--indigo)] text-white' : 'bg-black/10 text-[#5B6475]'}`}>
                        <r.icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className={`font-bold transition-colors ${role === r.id ? 'text-[#1E1B4B]' : 'text-[#5B6475]'}`}>{r.title}</h3>
                        <p className={`text-xs mt-1 font-medium transition-colors ${role === r.id ? 'text-[#475569]' : 'text-[#94A3B8]'}`}>{r.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="h-px w-full bg-black/5" />

              {/* Basic Details */}
              <div className="space-y-5">
                <h3 className="text-lg font-bold text-[#1E1B4B]">Account Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5 relative group">
                    <Label htmlFor="fullName" className="text-xs font-bold text-[#334155] uppercase tracking-wider ml-1">Full Name</Label>
                    <div className="relative flex items-center">
                      <User className="absolute left-3 h-4 w-4 text-[#94A3B8] group-focus-within:text-[#1E1B4B] transition-colors" />
                      <Input id="fullName" name="fullName" placeholder="Jane Doe" required className="pl-10 h-12 bg-white/20 border-white/30 text-[#1E293B] placeholder-[#94A3B8] focus-visible:ring-[var(--indigo)] rounded-xl shadow-inner" />
                    </div>
                  </div>
                  <div className="space-y-1.5 relative group">
                    <Label htmlFor="email" className="text-xs font-bold text-[#334155] uppercase tracking-wider ml-1">Email</Label>
                    <div className="relative flex items-center">
                      <Mail className="absolute left-3 h-4 w-4 text-[#94A3B8] group-focus-within:text-[#1E1B4B] transition-colors" />
                      <Input id="email" name="email" type="email" placeholder="jane@example.com" required className="pl-10 h-12 bg-white/20 border-white/30 text-[#1E293B] placeholder-[#94A3B8] focus-visible:ring-[var(--indigo)] rounded-xl shadow-inner" />
                    </div>
                  </div>
                  <div className="space-y-1.5 relative group sm:col-span-2">
                    <Label htmlFor="password" className="text-xs font-bold text-[#334155] uppercase tracking-wider ml-1">Password</Label>
                    <div className="relative flex items-center">
                      <Lock className="absolute left-3 h-4 w-4 text-[#94A3B8] group-focus-within:text-[#1E1B4B] transition-colors" />
                      <Input id="password" type="password" placeholder="Create a strong password" required className="pl-10 h-12 bg-white/20 border-white/30 text-[#1E293B] placeholder-[#94A3B8] focus-visible:ring-[var(--indigo)] rounded-xl shadow-inner" />
                    </div>
                  </div>
                </div>
              </div>

              <AnimatePresence mode="popLayout">
                {role === 'candidate' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden space-y-10"
                  >
                    <div className="h-px w-full bg-black/5" />
                    
                    {/* Academic Profile */}
                    <div className="space-y-5">
                      <h3 className="text-lg font-bold text-[#1E1B4B]">Academic Profile</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div className="space-y-1.5 group sm:col-span-2">
                          <Label className="text-xs font-bold text-[#334155] uppercase tracking-wider ml-1">University / College</Label>
                          <Select>
                            <SelectTrigger className="h-12 bg-white/20 border-white/30 text-[#1E293B] rounded-xl focus:ring-[var(--indigo)] shadow-inner">
                              <SelectValue placeholder="Select your institution" />
                            </SelectTrigger>
                            <SelectContent className="bg-white/95 backdrop-blur-xl border-black/5 text-[#1E293B] rounded-xl font-medium">
                              <SelectItem value="stanford">Stanford University</SelectItem>
                              <SelectItem value="mit">Massachusetts Institute of Technology</SelectItem>
                              <SelectItem value="berkeley">UC Berkeley</SelectItem>
                              <SelectItem value="cmu">Carnegie Mellon University</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1.5 relative group">
                          <Label htmlFor="branch" className="text-xs font-bold text-[#334155] uppercase tracking-wider ml-1">Branch / Department</Label>
                          <div className="relative flex items-center">
                            <Building className="absolute left-3 h-4 w-4 text-[#94A3B8] group-focus-within:text-[#1E1B4B] transition-colors" />
                            <Input id="branch" placeholder="e.g. Computer Science" className="pl-10 h-12 bg-white/20 border-white/30 text-[#1E293B] placeholder-[#94A3B8] focus-visible:ring-[var(--indigo)] rounded-xl shadow-inner" />
                          </div>
                        </div>
                        <div className="space-y-1.5 relative group">
                          <Label htmlFor="gradYear" className="text-xs font-bold text-[#334155] uppercase tracking-wider ml-1">Graduation Year</Label>
                          <div className="relative flex items-center">
                            <GraduationCap className="absolute left-3 h-4 w-4 text-[#94A3B8] group-focus-within:text-[#1E1B4B] transition-colors" />
                            <Input id="gradYear" placeholder="2026" className="pl-10 h-12 bg-white/20 border-white/30 text-[#1E293B] placeholder-[#94A3B8] focus-visible:ring-[var(--indigo)] rounded-xl shadow-inner" />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="h-px w-full bg-black/5" />

                    {/* Professional Links */}
                    <div className="space-y-5">
                      <h3 className="text-lg font-bold text-[#1E1B4B]">Verification Sources</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div className="space-y-1.5 relative group">
                          <Label htmlFor="github" className="text-xs font-bold text-[#334155] uppercase tracking-wider ml-1">GitHub Profile</Label>
                          <div className="relative flex items-center">
                            <Github className="absolute left-3 h-4 w-4 text-[#94A3B8] group-focus-within:text-[#1E1B4B] transition-colors" />
                            <Input id="github" placeholder="github.com/username" className="pl-10 h-12 bg-white/20 border-white/30 text-[#1E293B] placeholder-[#94A3B8] focus-visible:ring-[var(--indigo)] rounded-xl shadow-inner" />
                          </div>
                        </div>
                        <div className="space-y-1.5 relative group">
                          <Label htmlFor="linkedin" className="text-xs font-bold text-[#334155] uppercase tracking-wider ml-1">LinkedIn URL</Label>
                          <div className="relative flex items-center">
                            <Linkedin className="absolute left-3 h-4 w-4 text-[#94A3B8] group-focus-within:text-[#1E1B4B] transition-colors" />
                            <Input id="linkedin" placeholder="linkedin.com/in/username" className="pl-10 h-12 bg-white/20 border-white/30 text-[#1E293B] placeholder-[#94A3B8] focus-visible:ring-[var(--indigo)] rounded-xl shadow-inner" />
                          </div>
                        </div>
                        <div className="sm:col-span-2 mt-2 border border-dashed border-[#94A3B8]/30 rounded-xl p-6 bg-black/[0.02] hover:bg-black/[0.05] transition-colors flex flex-col items-center justify-center cursor-pointer group shadow-sm">
                          <div className="h-12 w-12 rounded-full bg-black/5 border border-black/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                            <UploadCloud className="h-6 w-6 text-[#5B6475] group-hover:text-[var(--indigo)] transition-colors" />
                          </div>
                          <p className="text-sm font-bold text-[#24304A]">Upload Resume (Optional)</p>
                          <p className="text-xs text-[#94A3B8] mt-1 font-medium">PDF, DOCX up to 5MB</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit Button */}
              <div className="pt-4">
                <Button type="submit" className="w-full h-14 relative overflow-hidden rounded-xl gradient-primary border-0 text-white shadow-xl transition-all hover:scale-[1.02] hover:shadow-[0_0_25px_rgba(var(--indigo-rgb),0.5)] group text-lg font-medium">
                  <span className="relative z-10 flex items-center gap-2">
                    Complete Registration
                    <ArrowRight className="h-5 w-5 opacity-80 group-hover:opacity-100 group-hover:translate-x-1.5 transition-all" />
                  </span>
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 rounded-xl" />
                </Button>
                <p className="mt-6 text-center text-sm text-[#5B6475] font-medium">
                  Already have an account?{" "}
                  <Link to="/login" className="text-[var(--indigo)] font-bold hover:text-[var(--purple)] transition-colors">
                    Sign in here
                  </Link>
                </p>
              </div>

            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
