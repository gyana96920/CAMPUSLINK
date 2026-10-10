"use client";

import React, { useState, useEffect, useRef } from "react";
import { apiGet, apiPost } from "@/lib/api";
import { supabase } from "@/lib/supabase";

import {
  GraduationCap,
  Building2,
  BriefcaseBusiness,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  X,
  Mail,
  Lock,
  User,
  LayoutDashboard,
  Users,
  Building,
  Briefcase,
  Bot,
  Award,
  BarChart3,
  Search,
  Plus,
  LogOut,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  MapPin,
  DollarSign,
  Star,
  Calendar,
  Save,
  FileText,
  Code,
  Target,
  Zap,
  Clock,
  GitBranch,
  Trophy,
  Folder,
  Link as LinkIcon,
  Phone,
  BookOpen,
  ExternalLink,
} from "lucide-react";

type Portal = "student" | "placement" | "recruiter" | null;
type AuthMode = "login" | "signup";

/* =========================================================
   PLACEMENT TYPES
========================================================= */
type PlacementTab =
  | "dashboard"
  | "students"
  | "recruiters"
  | "drives"
  | "shortlists"
  | "offers"
  | "analytics";

interface MatchDetail {
  name: string;
  score: string;
  eligible: boolean;
  skills: string[];
  skillGap: string;
  recommendation: string;
}

/* =========================================================
   RECRUITER TYPES
========================================================= */
type RecruiterTab =
  | "dashboard"
  | "myjobs"
  | "candidates"
  | "shortlisted"
  | "offers";

interface RecruiterCandidate {
  name: string;
  role: string;
  skills: string[];
  match: string;
  status: "Reviewing" | "Interview" | "Offered" | "Rejected";
  cgpa: string;
  branch: string;
}

/* =========================================================
   STUDENT TYPES
========================================================= */
type StudentTab =
  | "dashboard"
  | "profile"
  | "skills"
  | "ai"
  | "jobs"
  | "calendar"
  | "assessments";

interface Skill {
  id?: string;
  name: string;
  category: string;
  score: number;
  verifiedBy: "Campus Assessment" | "GitHub Sync" | "Self-Reported";
  year: string;
}

interface CodingProfile {
  platform: string;
  handle: string;
  stats: string;
  link: string;
}

interface JobMatch {
  company: string;
  role: string;
  package: string;
  location: string;
  matchScore: number;
  matched: string[];
  missing: string[];
  explanation: string;
  deadline: string;
}

interface Drive {
  company: string;
  role: string;
  date: string;
  time: string;
  venue: string;
  conflictsWith?: string;
}

interface Assessment {
  name: string;
  score: number;
  max: number;
  date: string;
  trend: "up" | "down" | "stable";
}

/* ============================================================
   MAIN COMPONENT
============================================================ */
export default function Home() {
  const [activePortal, setActivePortal] = useState<Portal>(null);
  const [loggedInPortal, setLoggedInPortal] = useState<Portal>(null);

  const [placementTab, setPlacementTab] = useState<PlacementTab>("dashboard");
  const [selectedMatch, setSelectedMatch] = useState<MatchDetail | null>(null);
  const [showCreateDrive, setShowCreateDrive] = useState(false);

  const [recruiterTab, setRecruiterTab] = useState<RecruiterTab>("dashboard");
  const [selectedCandidate, setSelectedCandidate] =
    useState<RecruiterCandidate | null>(null);
  const [showPostJob, setShowPostJob] = useState(false);

  const [authModal, setAuthModal] = useState<{
    isOpen: boolean;
    portal: Portal;
    mode: AuthMode;
  }>({
    isOpen: false,
    portal: null,
    mode: "login",
  });

  const openAuth = (portal: Portal, mode: AuthMode) => {
    setAuthModal({ isOpen: true, portal, mode });
  };

  const closeAuth = () => {
    setAuthModal((prev) => ({ ...prev, isOpen: false }));
  };

  const handleLogout = () => {
    setLoggedInPortal(null);
    setPlacementTab("dashboard");
    setRecruiterTab("dashboard");
  };

  if (loggedInPortal === "student") {
    return <StudentDashboard onLogout={handleLogout} />;
  }

  /* =========================================================
     RECRUITER PORTAL
  ========================================================= */
  if (loggedInPortal === "recruiter") {
    return (
      <div className="flex min-h-screen bg-[#030712] text-white">
        <aside className="w-64 flex-shrink-0 border-r border-white/10 bg-[#0c0914] p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-8">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-pink-500 shadow-lg shadow-orange-500/30">
                <BriefcaseBusiness size={22} />
              </div>
              <div>
                <h1 className="text-lg font-bold tracking-wide">
                  Campus<span className="text-orange-400">Link</span>
                </h1>
                <p className="text-[9px] uppercase tracking-widest text-slate-500">
                  Recruiter Hub
                </p>
              </div>
            </div>

            <nav className="space-y-1.5">
              <SidebarLink
                icon={<LayoutDashboard size={18} />}
                label="ðŸ“Š Dashboard"
                active={recruiterTab === "dashboard"}
                activeClass="bg-orange-600/20 text-orange-300 border-orange-500/30"
                onClick={() => setRecruiterTab("dashboard")}
              />
              <SidebarLink
                icon={<Briefcase size={18} />}
                label="ðŸ’¼ My Jobs"
                active={recruiterTab === "myjobs"}
                activeClass="bg-orange-600/20 text-orange-300 border-orange-500/30"
                onClick={() => setRecruiterTab("myjobs")}
              />
              <SidebarLink
                icon={<Users size={18} />}
                label="ðŸ‘¥ Candidates"
                active={recruiterTab === "candidates"}
                activeClass="bg-orange-600/20 text-orange-300 border-orange-500/30"
                onClick={() => setRecruiterTab("candidates")}
              />
              <SidebarLink
                icon={<Star size={18} />}
                label="â­ Shortlisted"
                active={recruiterTab === "shortlisted"}
                activeClass="bg-orange-600/20 text-orange-300 border-orange-500/30"
                onClick={() => setRecruiterTab("shortlisted")}
              />
              <SidebarLink
                icon={<Award size={18} />}
                label="ðŸŽ“ Offers"
                active={recruiterTab === "offers"}
                activeClass="bg-orange-600/20 text-orange-300 border-orange-500/30"
                onClick={() => setRecruiterTab("offers")}
              />
            </nav>
          </div>

          <div className="border-t border-white/10 pt-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-full bg-orange-500/20 border border-orange-500/40 flex items-center justify-center font-bold text-orange-300 text-sm">
                R
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-200">
                  recruiter@123
                </p>
                <p className="text-[10px] text-slate-500">Talent Acquisition</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Logout"
              className="p-2 text-slate-400 hover:text-red-400 transition rounded-lg hover:bg-white/5"
            >
              <LogOut size={18} />
            </button>
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto p-8">
          {recruiterTab === "dashboard" && (
            <RecruiterDashboardView onOpenPostJob={() => setShowPostJob(true)} />
          )}
          {recruiterTab === "myjobs" && (
            <RecruiterJobsView onOpenPostJob={() => setShowPostJob(true)} />
          )}
          {recruiterTab === "candidates" && (
            <RecruiterCandidatesView onSelectCandidate={setSelectedCandidate} />
          )}
          {recruiterTab === "shortlisted" && (
            <RecruiterShortlistedView onSelectCandidate={setSelectedCandidate} />
          )}
          {recruiterTab === "offers" && <RecruiterOffersView />}
        </main>

        {selectedCandidate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
            <div className="relative w-full max-w-lg rounded-3xl border border-orange-500/30 bg-[#0c0914] p-8 shadow-2xl">
              <button
                onClick={() => setSelectedCandidate(null)}
                className="absolute right-5 top-5 rounded-full p-2 text-slate-400 hover:bg-white/10 hover:text-white transition"
              >
                <X size={20} />
              </button>

              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                  {selectedCandidate.name[0]}
                </div>
                <div>
                  <h3 className="text-xl font-bold">{selectedCandidate.name}</h3>
                  <p className="text-xs text-orange-400 font-medium">
                    Applied for: {selectedCandidate.role}
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <div className="flex items-center justify-between rounded-xl bg-orange-500/10 border border-orange-500/20 p-4">
                  <div>
                    <span className="block text-xs text-slate-400">
                      AI Match Score
                    </span>
                    <span className="text-2xl font-bold text-orange-300">
                      {selectedCandidate.match}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="block text-xs text-slate-400">
                      Academic CGPA
                    </span>
                    <span className="text-lg font-semibold text-slate-200">
                      {selectedCandidate.cgpa} ({selectedCandidate.branch})
                    </span>
                  </div>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-2">
                    Verified Skills
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {selectedCandidate.skills.map((skill, i) => (
                      <span
                        key={i}
                        className="rounded-lg bg-white/5 border border-white/10 px-3 py-1 text-xs text-slate-300"
                      >
                        âœ“ {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="rounded-xl border border-white/10 bg-white/5 p-4 flex justify-between items-center">
                  <span className="text-xs text-slate-400">Application Stage</span>
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-orange-500/20 text-orange-300 border border-orange-500/30">
                    {selectedCandidate.status}
                  </span>
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    onClick={() => {
                      alert(`Interview Scheduled for ${selectedCandidate.name}`);
                      setSelectedCandidate(null);
                    }}
                    className="flex-1 rounded-xl bg-gradient-to-r from-orange-500 to-pink-500 py-2.5 text-xs font-semibold text-white shadow-lg transition hover:opacity-90"
                  >
                    Schedule Interview
                  </button>
                  <button
                    onClick={() => {
                      alert(`Offer Extended to ${selectedCandidate.name}`);
                      setSelectedCandidate(null);
                    }}
                    className="flex-1 rounded-xl border border-white/10 bg-white/10 py-2.5 text-xs font-semibold text-white transition hover:bg-white/20"
                  >
                    Extend Offer
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {showPostJob && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
            <div className="relative w-full max-w-md rounded-3xl border border-white/10 bg-[#0c0914] p-8 shadow-2xl">
              <button
                onClick={() => setShowPostJob(false)}
                className="absolute right-5 top-5 rounded-full p-2 text-slate-400 hover:bg-white/10 hover:text-white transition"
              >
                <X size={20} />
              </button>

              <h3 className="text-xl font-bold mb-4">Post New Job Opportunity</h3>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  alert("Job opening posted successfully!");
                  setShowPostJob(false);
                }}
                className="space-y-4 text-sm"
              >
                <div>
                  <label className="block text-xs text-slate-400 mb-1">
                    Job Title / Role
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Software Engineer"
                    className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 px-4 text-white outline-none focus:border-orange-400"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Bangalore"
                    className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 px-4 text-white outline-none focus:border-orange-400"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">
                    Package Offered
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 8 LPA"
                    className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 px-4 text-white outline-none focus:border-orange-400"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">
                    Required Skills (Comma separated)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Python, React, SQL"
                    className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 px-4 text-white outline-none focus:border-orange-400"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full rounded-xl bg-gradient-to-r from-orange-500 to-pink-500 py-3 font-semibold text-white shadow-lg transition hover:opacity-90 mt-2"
                >
                  Publish Job
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  /* =========================================================
     PLACEMENT PORTAL
  ========================================================= */
  if (loggedInPortal === "placement") {
    return (
      <div className="flex min-h-screen bg-[#030712] text-white">
        <aside className="w-64 flex-shrink-0 border-r border-white/10 bg-[#070d1d] p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-8">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg shadow-purple-500/30">
                <GraduationCap size={22} />
              </div>
              <div>
                <h1 className="text-lg font-bold tracking-wide">
                  Campus<span className="text-purple-400">Link</span>
                </h1>
                <p className="text-[9px] uppercase tracking-widest text-slate-500">
                  Placement Cell
                </p>
              </div>
            </div>

            <nav className="space-y-1.5">
              <SidebarLink
                icon={<LayoutDashboard size={18} />}
                label="ðŸ“Š Dashboard"
                active={placementTab === "dashboard"}
                activeClass="bg-purple-600/20 text-purple-300 border-purple-500/30"
                onClick={() => setPlacementTab("dashboard")}
              />
              <SidebarLink
                icon={<Users size={18} />}
                label="ðŸ‘¨â€ðŸŽ“ Students"
                active={placementTab === "students"}
                activeClass="bg-purple-600/20 text-purple-300 border-purple-500/30"
                onClick={() => setPlacementTab("students")}
              />
              <SidebarLink
                icon={<Building size={18} />}
                label="ðŸ¢ Recruiters"
                active={placementTab === "recruiters"}
                activeClass="bg-purple-600/20 text-purple-300 border-purple-500/30"
                onClick={() => setPlacementTab("recruiters")}
              />
              <SidebarLink
                icon={<Briefcase size={18} />}
                label="ðŸ’¼ Placement Drives"
                active={placementTab === "drives"}
                activeClass="bg-purple-600/20 text-purple-300 border-purple-500/30"
                onClick={() => setPlacementTab("drives")}
              />
              <SidebarLink
                icon={<Bot size={18} />}
                label="ðŸ¤– AI Shortlists"
                active={placementTab === "shortlists"}
                activeClass="bg-purple-600/20 text-purple-300 border-purple-500/30"
                onClick={() => setPlacementTab("shortlists")}
              />
              <SidebarLink
                icon={<Award size={18} />}
                label="ðŸŽ“ Offers"
                active={placementTab === "offers"}
                activeClass="bg-purple-600/20 text-purple-300 border-purple-500/30"
                onClick={() => setPlacementTab("offers")}
              />
              <SidebarLink
                icon={<BarChart3 size={18} />}
                label="ðŸ“ˆ Analytics"
                active={placementTab === "analytics"}
                activeClass="bg-purple-600/20 text-purple-300 border-purple-500/30"
                onClick={() => setPlacementTab("analytics")}
              />
            </nav>
          </div>

          <div className="border-t border-white/10 pt-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-full bg-purple-500/20 border border-purple-500/40 flex items-center justify-center font-bold text-purple-300 text-sm">
                S
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-200">sahoo@123</p>
                <p className="text-[10px] text-slate-500">Placement Officer</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Logout"
              className="p-2 text-slate-400 hover:text-red-400 transition rounded-lg hover:bg-white/5"
            >
              <LogOut size={18} />
            </button>
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto p-8">
          {placementTab === "dashboard" && <PlacementDashboardView />}
          {placementTab === "students" && <StudentsView />}
          {placementTab === "recruiters" && <RecruitersView />}
          {placementTab === "drives" && (
            <DrivesView onOpenCreate={() => setShowCreateDrive(true)} />
          )}
          {placementTab === "shortlists" && (
            <ShortlistsView onSelectMatch={setSelectedMatch} />
          )}
          {placementTab === "offers" && <OffersView />}
          {placementTab === "analytics" && <AnalyticsView />}
        </main>

        {selectedMatch && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
            <div className="relative w-full max-w-lg rounded-3xl border border-purple-500/30 bg-[#0b0f19] p-8 shadow-2xl">
              <button
                onClick={() => setSelectedMatch(null)}
                className="absolute right-5 top-5 rounded-full p-2 text-slate-400 hover:bg-white/10 hover:text-white transition"
              >
                <X size={20} />
              </button>

              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                  {selectedMatch.name[0]}
                </div>
                <div>
                  <h3 className="text-xl font-bold">{selectedMatch.name}</h3>
                  <p className="text-xs text-purple-400 font-medium">
                    AI Match Details
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <div className="flex items-center justify-between rounded-xl bg-purple-500/10 border border-purple-500/20 p-4">
                  <span className="text-sm font-medium text-slate-300">
                    Match Confidence
                  </span>
                  <span className="text-2xl font-bold text-purple-300">
                    {selectedMatch.score}
                  </span>
                </div>

                <div className="space-y-2">
                  <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
                    Key Highlights
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-2 text-emerald-400">
                      <CheckCircle2 size={15} /> CGPA Eligible
                    </div>
                    {selectedMatch.skills.map((skill, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2 text-slate-300"
                      >
                        <CheckCircle2 size={15} className="text-purple-400" />{" "}
                        {skill}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-amber-400 flex items-center gap-1.5 mb-1">
                    <AlertTriangle size={15} /> Skill Gap
                  </p>
                  <p className="text-xs text-amber-200">
                    âš  {selectedMatch.skillGap}
                  </p>
                </div>

                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-emerald-400 mb-1">
                    Recommendation
                  </p>
                  <p className="text-sm font-bold text-emerald-300">
                    {selectedMatch.recommendation}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {showCreateDrive && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
            <div className="relative w-full max-w-md rounded-3xl border border-white/10 bg-[#0b0f19] p-8 shadow-2xl">
              <button
                onClick={() => setShowCreateDrive(false)}
                className="absolute right-5 top-5 rounded-full p-2 text-slate-400 hover:bg-white/10 hover:text-white transition"
              >
                <X size={20} />
              </button>

              <h3 className="text-xl font-bold mb-4">Create Placement Drive</h3>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  alert("New placement drive created successfully!");
                  setShowCreateDrive(false);
                }}
                className="space-y-4 text-sm"
              >
                <div>
                  <label className="block text-xs text-slate-400 mb-1">
                    Company Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Microsoft"
                    className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 px-4 text-white outline-none focus:border-purple-400"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">
                    Role Title
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. SDE-1"
                    className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 px-4 text-white outline-none focus:border-purple-400"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">
                    Drive Date
                  </label>
                  <input
                    type="date"
                    required
                    className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 px-4 text-white outline-none focus:border-purple-400"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 py-3 font-semibold text-white shadow-lg transition hover:opacity-90 mt-2"
                >
                  Publish Drive
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  /* =========================================================
     LANDING PAGE
  ========================================================= */
  return (
    <main className="min-h-screen overflow-hidden bg-[#030712] text-white">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-[10%] top-[20%] h-96 w-96 rounded-full bg-blue-600/10 blur-[120px]" />
        <div className="absolute left-[45%] top-[10%] h-96 w-96 rounded-full bg-purple-600/10 blur-[120px]" />
        <div className="absolute right-[5%] bottom-[10%] h-96 w-96 rounded-full bg-cyan-500/10 blur-[120px]" />
      </div>

      <nav className="relative z-10 border-b border-white/10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-8 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 shadow-lg shadow-blue-500/30">
              <GraduationCap size={25} />
            </div>
            <div>
              <h1 className="text-xl font-bold">
                Campus<span className="text-cyan-400">Link</span>
              </h1>
              <p className="text-[9px] uppercase tracking-[0.25em] text-slate-500">
                Placement Intelligence
              </p>
            </div>
          </div>
          <div className="hidden items-center gap-2 text-sm text-slate-400 md:flex">
            <ShieldCheck size={16} className="text-emerald-400" />
            AI Powered Placement Platform
          </div>
        </div>
      </nav>

      <section className="relative z-10 px-6 pt-16 text-center">
        <div className="mx-auto flex w-fit items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-5 py-2 text-sm text-cyan-300">
          <Sparkles size={15} />
          One platform. Zero placement chaos.
        </div>

        <h2 className="mx-auto mt-7 max-w-5xl text-5xl font-bold leading-tight md:text-6xl">
          From{" "}
          <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-purple-400 bg-clip-text text-transparent">
            Campus
          </span>{" "}
          to{" "}
          <span className="bg-gradient-to-r from-cyan-300 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Corporate
          </span>
          <br />
          without the chaos.
        </h2>

        <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-400">
          One intelligent platform connecting students, placement cells and
          recruiters.
        </p>
      </section>

      <section
        className="relative z-10 mx-auto mt-12 flex min-h-[480px] max-w-7xl items-center justify-center gap-5 px-6"
        onMouseLeave={() => setActivePortal(null)}
      >
        <PortalCard
          type="student"
          active={activePortal}
          setActive={setActivePortal}
          icon={<GraduationCap size={42} />}
          title="Student"
          subtitle="Student Portal"
          description={[
            "Build your student profile",
            "Track your technical and soft skills",
            "Get an AI placement readiness score",
            "Identify your skill gaps",
            "Get personalized job recommendations",
          ]}
          color="student"
          onOpenAuth={openAuth}
        />

        <PortalCard
          type="placement"
          active={activePortal}
          setActive={setActivePortal}
          icon={<Building2 size={42} />}
          title="Placement"
          subtitle="Placement Cell"
          description={[
            "Manage student profiles",
            "Create and manage placement drives",
            "View recruiter requirements",
            "AI-assisted candidate shortlisting",
            "Track interviews and placement offers",
            "View placement analytics",
          ]}
          color="placement"
          onOpenAuth={openAuth}
        />

        <PortalCard
          type="recruiter"
          active={activePortal}
          setActive={setActivePortal}
          icon={<BriefcaseBusiness size={42} />}
          title="Recruiter"
          subtitle="Recruiter Portal"
          description={[
            "Create jobs and placement drives",
            "Define required skills and eligibility",
            "Find matching student candidates",
            "AI-assisted candidate matching",
            "Shortlist candidates for interviews",
            "Manage selection and offers",
          ]}
          color="recruiter"
          onOpenAuth={openAuth}
        />
      </section>

      <div className="relative z-10 mt-4 text-center text-sm text-slate-500">
        Choose your portal to continue
      </div>

      <footer className="relative z-10 mt-6 border-t border-white/10 px-6 py-5 text-center text-xs text-slate-600">
        Â© 2026 CampusLink â€¢ AI Powered Placement Intelligence
      </footer>

      {authModal.isOpen && authModal.portal && (
        <AuthModal
          portal={authModal.portal}
          initialMode={authModal.mode}
          onClose={closeAuth}
          onLoginSuccess={(portal) => {
            closeAuth();
            setLoggedInPortal(portal);
          }}
        />
      )}
    </main>
  );
}

/* ============================================================
   STUDENT DASHBOARD
============================================================ */
function StudentDashboard({ onLogout }: { onLogout: () => void }) {
  const [tab, setTab] = useState<StudentTab>("profile");
  const [studentName, setStudentName] = useState("Student");
  const [profileFocus, setProfileFocus] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [studentDbId, setStudentDbId] = useState<number | null>(null);
  

useEffect(() => {
  const loadStudentName = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const name =
      user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      user.email?.split("@")[0] ||
      "Student";

    setStudentName(name);
  };

  loadStudentName();
}, []);

  useEffect(() => {
    const loadStudentId = async () => {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) return;

      const { data, error } = await supabase
        .from("students")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        console.error("Student ID loading failed:", error);
        return;
      }

      if (data) setStudentDbId(Number(data.id));
    };

    loadStudentId();
  }, []);


  const navItems: { key: StudentTab; label: string }[] = [
    { key: "dashboard", label: "Dashboard" },
    { key: "profile", label: "Profile" },
    { key: "skills", label: "Skills & Projects" },
    { key: "ai", label: "Readiness & Gaps" },
    { key: "jobs", label: "Recommended Jobs" },
    { key: "calendar", label: "Drive Schedule" },
    { key: "assessments", label: "Offers" },
  ];

  const navigate = (t: StudentTab, focus?: string) => {
    setTab(t);
    setProfileFocus(focus ?? null);
  };

  return (
    <div className="min-h-screen bg-[#030712] text-white">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#030712]/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400">
              <GraduationCap size={18} />
            </div>
            <span className="font-bold text-lg tracking-wide hidden sm:block">
              CAMPUS<span className="text-cyan-400">LINK</span>
            </span>
          </div>

          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <button
                key={item.key}
                onClick={() => navigate(item.key)}
                className={`px-3 py-2 rounded-lg text-xs font-medium transition ${
                  tab === item.key
                    ? "bg-white/10 text-white"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 sm:gap-3">

            <button
              onClick={() => navigate("profile")}
              className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 pl-1 pr-3 py-1 hover:bg-white/10 transition"
            >
              <div className="h-7 w-7 rounded-full bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center font-bold text-cyan-300 text-xs">
                {studentName.charAt(0).toUpperCase()}
              </div>
              <span className="text-xs font-medium text-slate-200 hidden sm:block">
                {studentName}
              </span>
            </button>

            <button
              onClick={onLogout}
              title="Logout"
              className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-300 hover:bg-red-500/20 hover:border-red-500/50 transition"
            >
              <LogOut size={15} />
              <span className="hidden sm:inline">Logout</span>
            </button>

            <button
              className="md:hidden p-2 text-slate-400 hover:text-white"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={20} /> : <BookOpen size={20} />}
            </button>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-white/10 bg-[#030712] px-6 py-4 space-y-1">
            {navItems.map((item) => (
              <button
                key={item.key}
                onClick={() => {
                  navigate(item.key);
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition ${
                  tab === item.key ? "bg-white/10 text-white" : "text-slate-400"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        )}
      </nav>

      <main className="pt-20 pb-12 px-4 md:px-8 max-w-6xl mx-auto">
        {tab === "dashboard" && <DashboardTab onNavigate={navigate} />}
        {tab === "profile" && <ProfileTab focusArea={profileFocus} />}
        {tab === "skills" && <SkillsTab />}
        {tab === "ai" && <AIPlacementTab studentId={studentDbId} />}
        {tab === "jobs" && <JobsTab />}
        {tab === "calendar" && <CalendarTab />}
        {tab === "assessments" && <AssessmentsTab />}
      </main>
    </div>
  );
}

/* ============================================================
   STUDENT TAB 1: DASHBOARD
============================================================ */
function DashboardTab({
  onNavigate,
}: {
  onNavigate: (t: StudentTab, focus?: string) => void;
}) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => setLoading(false), 700);
  }, []);

  if (loading) return <SkeletonLoader />;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Welcome back, Student 👋
          </h2>
          <p className="text-xs text-slate-400">
            Here's your placement snapshot for this week.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-300">
          <Sparkles size={14} />
          Profile is 87% complete
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <MetricCard
          icon={<Target size={20} />}
          label="Readiness Score"
          value="82"
          suffix="/100"
          color="cyan"
          trend="+5 this month"
        />
        <MetricCard
          icon={<Briefcase size={20} />}
          label="Matched Jobs"
          value="12"
          color="purple"
          trend="3 new today"
        />
        <MetricCard
          icon={<FileText size={20} />}
          label="Applications"
          value="7"
          color="emerald"
          trend="2 in interview"
        />
        <MetricCard
          icon={<Trophy size={20} />}
          label="Offers"
          value="1"
          color="amber"
          trend="TCS . â‚¹7 LPA"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-[#0b1224] p-6 flex flex-col items-center justify-center">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
            Profile Completeness
          </p>
          <CompletenessRing percent={87} />
          <p className="mt-3 text-xs text-slate-500 text-center">
            Add{" "}
            <span className="text-amber-400 font-semibold">
              1 more project
            </span>{" "}
            to reach 100%
          </p>
        </div>

        <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-[#0b1224] p-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-4">
            Quick Actions
          </p>
          <div className="grid grid-cols-2 gap-3">
            <QuickAction
              icon={<FileText size={20} />}
              title="Update Resume"
              desc="Last updated 12 days ago"
              onClick={() => onNavigate("profile", "resume")}
            />
            <QuickAction
              icon={<Bot size={20} />}
              title="AI Analysis"
              desc="2 skill gaps detected"
              onClick={() => onNavigate("ai")}
            />
            <QuickAction
              icon={<Briefcase size={20} />}
              title="Browse Matches"
              desc="12 jobs waiting"
              onClick={() => onNavigate("jobs")}
            />
            <QuickAction
              icon={<Calendar size={20} />}
              title="Check Drives"
              desc="1 conflict warning"
              onClick={() => onNavigate("calendar")}
            />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-5 flex items-start gap-4">
        <div className="rounded-xl bg-amber-500/20 p-2.5 border border-amber-500/40">
          <AlertTriangle size={20} className="text-amber-400" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-amber-300 text-sm">
            Skill Gap Detected
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            You're missing{" "}
            <span className="text-amber-300 font-semibold">Spring Boot</span> for
            TCS SDE role and{" "}
            <span className="text-amber-300 font-semibold">Docker</span> for 4
            other jobs. Closing these could raise your match by ~9%.
          </p>
        </div>
        <button
          onClick={() => onNavigate("ai")}
          className="rounded-lg bg-amber-500/20 border border-amber-500/40 px-3 py-1.5 text-xs font-semibold text-amber-200 hover:bg-amber-500/30"
        >
          Fix Now â†’
        </button>
      </div>
    </div>
  );
}

/* ============================================================
   STUDENT TAB 2: PROFILE (with Coding Profiles + Centralized Edit)
============================================================ */
function ProfileTab({ focusArea }: { focusArea?: string | null }) {
  const [userId, setUserId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [highlightResume, setHighlightResume] = useState(false);

  const resumeSectionRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  
const [profile, setProfile] = useState({
  name: "",
  subtitle: "",
  email: "",
  phone: "",
  branch: "",
  cgpa: "",
  github: "",
  linkedin: "",
  skills: [] as string[],
  projects: [] as string[],
  certifications: [] as string[],
  codingProfiles: [] as CodingProfile[],
  resumeName: "",
});


  useEffect(() => {
    if (focusArea === "resume") {
      setHighlightResume(true);
      setTimeout(() => {
        resumeSectionRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }, 250);
      setTimeout(() => setHighlightResume(false), 3000);
    }
  }, [focusArea]);

  
useEffect(() => {
  const loadStudentProfile = async () => {
    const { data: { user }, error: authError } =
      await supabase.auth.getUser();

    if (authError || !user) {
      setUserId(null);
      return;
    }

    setUserId(user.id);

    const { data, error } = await supabase
      .from("students")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      console.error("Profile loading failed:", error);
      return;
    }

    if (!data) {
      setProfile((prev) => ({
        ...prev,
        name: user.user_metadata?.full_name || "",
        email: user.email || "",
      }));
      return;
    }

    setProfile((prev) => ({
      ...prev,
      name: data.name || user.user_metadata?.full_name || "",
      email: data.email || user.email || "",
      branch: data.branch || "",
      cgpa: data.cgpa != null ? String(data.cgpa) : "",
      subtitle: data.branch
        ? `${data.branch} • CGPA ${data.cgpa ?? ""}`
        : "",
      skills: Array.isArray(data.skills) ? data.skills : [],
      projects: Array.isArray(data.projects_list) ? data.projects_list : [],
      certifications: Array.isArray(data.certifications_list) ? data.certifications_list : [],
      codingProfiles: Array.isArray(data.coding_profiles) ? data.coding_profiles : [],
    }));
  };

  loadStudentProfile();
}, []);


  
const handleSave = async () => {
  setSaving(true);

  try {
    const { data: { user }, error: authError } =
      await supabase.auth.getUser();

    if (authError || !user) {
      alert("Please log in before saving your profile.");
      return;
    }

    const studentData = {
      user_id: user.id,
      name: profile.name.trim() || user.user_metadata?.full_name || "",
      email: user.email || profile.email.trim(),
      branch: profile.branch.trim(),
      cgpa: Number(profile.cgpa) || 0,
      skills: profile.skills.filter((skill) => skill.trim() !== ""),
      projects_list: profile.projects.filter((project) => project.trim() !== ""),
      certifications_list: profile.certifications.filter((cert) => cert.trim() !== ""),
      coding_profiles: profile.codingProfiles,
      projects: profile.projects.filter((project) => project.trim() !== "").length,
      certifications: profile.certifications.filter((cert) => cert.trim() !== "").length,
      aptitude_score: 0,
      interview_score: 0,
    };

    const { data: existing, error: lookupError } = await supabase
      .from("students")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (lookupError) throw lookupError;

    const { error: saveError } = existing
      ? await supabase
          .from("students")
          .update(studentData)
          .eq("user_id", user.id)
      : await supabase
          .from("students")
          .insert(studentData);

    if (saveError) throw saveError;

    setProfile((prev) => ({
      ...prev,
      name: studentData.name,
      email: studentData.email,
      subtitle: `${studentData.branch} • CGPA ${studentData.cgpa}`,
    }));

    alert("Student profile saved successfully!");
    setIsEditing(false);
  } catch (error) {
    console.error("Save failed:", error);
    alert("Could not save profile. Check the database permissions and backend.");
  } finally {
    setSaving(false);
  }
};


  const updateField = (field: keyof typeof profile, value: string) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const handleResumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      alert("âŒ Only PDF files are allowed!");
      e.target.value = "";
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("âŒ File size must be under 5 MB.");
      e.target.value = "";
      return;
    }
    setProfile((prev) => ({ ...prev, resumeName: file.name }));
    alert(`âœ… ${file.name} uploaded successfully.`);
  };

  /* ---------- Skills helpers ---------- */
  const updateSkill = (idx: number, value: string) => {
    setProfile((prev) => {
      const arr = [...prev.skills];
      arr[idx] = value;
      return { ...prev, skills: arr };
    });
  };
  const removeSkill = (idx: number) => {
    setProfile((prev) => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== idx),
    }));
  };
  const addSkill = () => {
    setProfile((prev) => ({ ...prev, skills: [...prev.skills, ""] }));
  };

  /* ---------- Project helpers ---------- */
  const updateProject = (idx: number, value: string) => {
    setProfile((prev) => {
      const arr = [...prev.projects];
      arr[idx] = value;
      return { ...prev, projects: arr };
    });
  };
  const removeProject = (idx: number) => {
    setProfile((prev) => ({
      ...prev,
      projects: prev.projects.filter((_, i) => i !== idx),
    }));
  };
  const addProject = () => {
    setProfile((prev) => ({ ...prev, projects: [...prev.projects, ""] }));
  };

  /* ---------- Certification helpers ---------- */
  const updateCert = (idx: number, value: string) => {
    setProfile((prev) => {
      const arr = [...prev.certifications];
      arr[idx] = value;
      return { ...prev, certifications: arr };
    });
  };
  const removeCert = (idx: number) => {
    setProfile((prev) => ({
      ...prev,
      certifications: prev.certifications.filter((_, i) => i !== idx),
    }));
  };
  const addCert = () => {
    setProfile((prev) => ({
      ...prev,
      certifications: [...prev.certifications, ""],
    }));
  };

  /* ---------- Coding Profile helpers ---------- */
  const updateCodingProfile = (
    idx: number,
    field: keyof CodingProfile,
    value: string
  ) => {
    setProfile((prev) => {
      const arr = [...prev.codingProfiles];
      arr[idx] = { ...arr[idx], [field]: value };
      return { ...prev, codingProfiles: arr };
    });
  };
  const removeCodingProfile = (idx: number) => {
    setProfile((prev) => ({
      ...prev,
      codingProfiles: prev.codingProfiles.filter((_, i) => i !== idx),
    }));
  };
  const addCodingProfile = () => {
    setProfile((prev) => ({
      ...prev,
      codingProfiles: [
        ...prev.codingProfiles,
        { platform: "", handle: "", stats: "", link: "" },
      ],
    }));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* ==================== HEADER ==================== */}
      <div className="flex items-center gap-6">
        <div className="h-20 w-20 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-3xl font-bold text-white shadow-lg shadow-cyan-500/20 flex-shrink-0">
          {profile.name?.[0] || "R"}
        </div>

        <div className="flex-1 min-w-0">
          {isEditing ? (
            <>
              <input
                value={profile.name}
                onChange={(e) => updateField("name", e.target.value)}
                placeholder="Full Name"
                className="text-3xl font-bold text-white bg-transparent outline-none border-b border-cyan-500/50 pb-1 w-full"
              />
              <div className="flex gap-3 mt-2">
                <input
                  value={profile.branch}
                  onChange={(e) => updateField("branch", e.target.value)}
                  placeholder="Branch"
                  className="text-sm text-slate-300 bg-transparent outline-none border-b border-cyan-500/40 pb-0.5 w-24"
                />
                <span className="text-sm text-slate-400">.</span>
                <input
                  value={profile.cgpa}
                  onChange={(e) => updateField("cgpa", e.target.value)}
                  placeholder="CGPA"
                  className="text-sm text-slate-300 bg-transparent outline-none border-b border-cyan-500/40 pb-0.5 w-16"
                />
              </div>
            </>
          ) : (
            <>
              <h1 className="text-3xl font-bold text-white truncate">
                {profile.name}
              </h1>
              <p className="text-sm text-slate-400 mt-1">
                {profile.branch} . CGPA {profile.cgpa}
              </p>
            </>
          )}
        </div>

        {/* CENTRAL EDIT/SAVE CONTROLS */}
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-400 px-5 py-2.5 text-sm font-semibold shadow-lg hover:scale-105 transition flex-shrink-0"
          >
            <User size={16} /> Edit Profile
          </button>
        ) : (
          <div className="flex gap-2 flex-shrink-0">
            <button
              onClick={() => setIsEditing(false)}
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-slate-300 hover:bg-white/10 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-400 px-5 py-2.5 text-sm font-semibold shadow-lg hover:scale-105 transition disabled:opacity-50"
            >
              <Save size={16} /> {saving ? "Saving..." : "Save"}
            </button>
          </div>
        )}
      </div>

      {/* ==================== CONTACT DETAILS ==================== */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6 rounded-2xl bg-[#0b1224] border border-white/10">
        <ProfileField
          icon={<Mail size={14} />}
          label="EMAIL"
          value={profile.email}
          isEditing={isEditing}
          onChange={(v) => updateField("email", v)}
        />
        <ProfileField
          icon={<Phone size={14} />}
          label="PHONE"
          value={profile.phone}
          isEditing={isEditing}
          onChange={(v) => updateField("phone", v)}
        />
        <ProfileField
          icon={<BookOpen size={14} />}
          label="BRANCH"
          value={profile.branch}
          isEditing={isEditing}
          onChange={(v) => updateField("branch", v)}
        />
        <ProfileField
          icon={<Trophy size={14} />}
          label="CGPA"
          value={profile.cgpa}
          isEditing={isEditing}
          onChange={(v) => updateField("cgpa", v)}
        />
        <ProfileField
          icon={<GitBranch size={14} />}
          label="GITHUB"
          value={profile.github}
          isEditing={isEditing}
          onChange={(v) => updateField("github", v)}
        />
        <ProfileField
          icon={<LinkIcon size={14} />}
          label="LINKEDIN"
          value={profile.linkedin}
          isEditing={isEditing}
          onChange={(v) => updateField("linkedin", v)}
        />
      </div>

      {/* ==================== RESUME ==================== */}
      <div
        ref={resumeSectionRef}
        className={`rounded-2xl border p-6 transition-all duration-500 ${
          highlightResume
            ? "border-cyan-400 bg-cyan-500/10 shadow-lg shadow-cyan-500/20"
            : "border-white/10 bg-[#0b1224]"
        }`}
      >
        <h3 className="text-xs font-semibold text-slate-400 mb-3 uppercase tracking-wider flex items-center gap-2">
          <FileText size={14} /> Resume
        </h3>

        <div className="flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-white/5 p-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="rounded-lg bg-red-500/20 p-2 border border-red-500/40 flex-shrink-0">
              <FileText size={18} className="text-red-300" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate">
                {profile.resumeName}
              </p>
              <p className="text-[10px] text-slate-500">
                PDF . Uploaded 12 days ago
              </p>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf,.pdf"
            onChange={handleResumeChange}
            className="hidden"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold hover:bg-white/10 transition flex-shrink-0"
          >
            <Plus size={14} /> {profile.resumeName ? "Replace" : "Upload"}
          </button>
        </div>

        <p className="mt-2 text-[10px] text-slate-500">
          Only <span className="text-cyan-400 font-semibold">PDF</span> files are
          accepted (max 5 MB).
        </p>
      </div>

      {/* ==================== SKILLS ==================== */}
      <div>
        <h3 className="text-xs font-semibold text-slate-400 mb-3 uppercase tracking-wider">
          Skills
        </h3>
        <div className="flex flex-wrap gap-2">
          {profile.skills.map((s, idx) =>
            isEditing ? (
              <div
                key={idx}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-cyan-500/40 rounded-full text-xs font-medium text-slate-200"
              >
                <input
                  value={s}
                  onChange={(e) => updateSkill(idx, e.target.value)}
                  placeholder="Skill"
                  className="bg-transparent text-xs font-medium text-white outline-none w-20"
                />
                <button
                  onClick={() => removeSkill(idx)}
                  title="Remove skill"
                  className="p-0.5 rounded text-red-400 hover:bg-red-500/20 transition"
                >
                  <X size={12} />
                </button>
              </div>
            ) : (
              <span
                key={idx}
                className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-xs font-medium text-slate-200"
              >
                {s}
              </span>
            )
          )}

          {isEditing && (
            <button
              onClick={addSkill}
              className="px-3 py-1.5 border border-dashed border-white/20 rounded-full text-xs text-slate-400 hover:border-cyan-400 hover:text-cyan-300 transition"
            >
              <Plus size={12} className="inline" /> Add Skill
            </button>
          )}
        </div>
      </div>

      {/* ==================== PROJECTS & CERTIFICATIONS ==================== */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* PROJECTS */}
        <div>
          <h3 className="text-xs font-semibold text-slate-400 mb-3 uppercase tracking-wider flex items-center gap-2">
            <Folder size={14} /> Projects
          </h3>
          <ul className="space-y-2">
            {profile.projects.map((p, idx) => (
              <li
                key={idx}
                className="flex items-center gap-3 text-sm text-slate-300 p-3 rounded-xl bg-white/5 border border-white/5"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 flex-shrink-0" />

                {isEditing ? (
                  <>
                    <input
                      value={p}
                      onChange={(e) => updateProject(idx, e.target.value)}
                      placeholder="Project name"
                      className="flex-1 bg-transparent text-sm font-medium text-white outline-none border-b border-cyan-500/40 pb-0.5"
                    />
                    <button
                      onClick={() => removeProject(idx)}
                      title="Remove"
                      className="p-1 rounded-md text-red-400 hover:bg-red-500/20 transition flex-shrink-0"
                    >
                      <X size={14} />
                    </button>
                  </>
                ) : (
                  <span>{p}</span>
                )}
              </li>
            ))}
            {isEditing && (
              <button
                onClick={addProject}
                className="w-full text-left p-3 border border-dashed border-white/20 rounded-xl text-xs text-slate-400 hover:border-cyan-400 hover:text-cyan-300 transition"
              >
                <Plus size={12} className="inline" /> Add Project
              </button>
            )}
          </ul>
        </div>

        {/* CERTIFICATIONS */}
        <div>
          <h3 className="text-xs font-semibold text-slate-400 mb-3 uppercase tracking-wider flex items-center gap-2">
            <Award size={14} /> Certifications
          </h3>
          <ul className="space-y-2">
            {profile.certifications.map((c, idx) => (
              <li
                key={idx}
                className="flex items-center gap-3 text-sm text-slate-300 p-3 rounded-xl bg-white/5 border border-white/5"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />

                {isEditing ? (
                  <>
                    <input
                      value={c}
                      onChange={(e) => updateCert(idx, e.target.value)}
                      placeholder="Certification name"
                      className="flex-1 bg-transparent text-sm font-medium text-white outline-none border-b border-amber-500/40 pb-0.5"
                    />
                    <button
                      onClick={() => removeCert(idx)}
                      title="Remove"
                      className="p-1 rounded-md text-red-400 hover:bg-red-500/20 transition flex-shrink-0"
                    >
                      <X size={14} />
                    </button>
                  </>
                ) : (
                  <span>{c}</span>
                )}
              </li>
            ))}
            {isEditing && (
              <button
                onClick={addCert}
                className="w-full text-left p-3 border border-dashed border-white/20 rounded-xl text-xs text-slate-400 hover:border-cyan-400 hover:text-cyan-300 transition"
              >
                <Plus size={12} className="inline" /> Add Certification
              </button>
            )}
          </ul>
        </div>
      </div>

      {/* ==================== CODING PROFILES (NEW) ==================== */}
      <div>
        <h3 className="text-xs font-semibold text-slate-400 mb-3 uppercase tracking-wider flex items-center gap-2">
          <Code size={14} /> Coding Profiles & Achievements
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {profile.codingProfiles.map((cp, idx) => {
            const accent = getCodingPlatformAccent(cp.platform);
            return (
              <div
                key={idx}
                className={`rounded-2xl border p-5 transition ${
                  isEditing
                    ? "border-cyan-500/40 bg-[#0b1224]"
                    : "border-white/10 bg-[#0b1224] hover:border-cyan-500/40"
                }`}
              >
                {/* HEADER */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div
                      className={`rounded-xl p-2 border ${accent.bg} ${accent.border} ${accent.text} flex-shrink-0`}
                    >
                      <Code size={18} />
                    </div>
                    <div className="min-w-0 flex-1">
                      {isEditing ? (
                        <input
                          value={cp.platform}
                          onChange={(e) =>
                            updateCodingProfile(idx, "platform", e.target.value)
                          }
                          placeholder="Platform name (e.g. LeetCode)"
                          className="font-bold text-base text-white bg-transparent outline-none border-b border-cyan-500/40 pb-0.5 w-full"
                        />
                      ) : (
                        <h4 className="font-bold text-base text-white truncate">
                          {cp.platform}
                        </h4>
                      )}
                      {isEditing ? (
                        <input
                          value={cp.handle}
                          onChange={(e) =>
                            updateCodingProfile(idx, "handle", e.target.value)
                          }
                          placeholder="Handle / Event name"
                          className="text-xs text-slate-400 bg-transparent outline-none border-b border-cyan-500/40 pb-0.5 w-full mt-1"
                        />
                      ) : (
                        <p className="text-xs text-slate-400 truncate">
                          @{cp.handle}
                        </p>
                      )}
                    </div>
                  </div>

                  {isEditing ? (
                    <button
                      onClick={() => removeCodingProfile(idx)}
                      title="Remove"
                      className="p-1 rounded-md text-red-400 hover:bg-red-500/20 transition flex-shrink-0"
                    >
                      <X size={14} />
                    </button>
                  ) : (
                    cp.link && (
                      <a
                        href={cp.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Open profile"
                        className="p-1.5 rounded-md text-slate-400 hover:text-cyan-300 hover:bg-white/10 transition flex-shrink-0"
                      >
                        <ExternalLink size={14} />
                      </a>
                    )
                  )}
                </div>

                {/* STATS */}
                {isEditing ? (
                  <div className="space-y-2">
                    <input
                      value={cp.stats}
                      onChange={(e) =>
                        updateCodingProfile(idx, "stats", e.target.value)
                      }
                      placeholder="Stats (e.g. 450 problems . 1850 rating)"
                      className="w-full text-xs text-slate-300 bg-white/5 border border-white/10 rounded-lg px-3 py-2 outline-none focus:border-cyan-400"
                    />
                    <input
                      value={cp.link}
                      onChange={(e) =>
                        updateCodingProfile(idx, "link", e.target.value)
                      }
                      placeholder="Profile URL (optional)"
                      className="w-full text-xs text-slate-300 bg-white/5 border border-white/10 rounded-lg px-3 py-2 outline-none focus:border-cyan-400"
                    />
                  </div>
                ) : (
                  <div
                    className={`text-xs font-medium rounded-lg px-3 py-2 ${accent.bg} ${accent.text} border ${accent.border}`}
                  >
                    {cp.stats}
                  </div>
                )}
              </div>
            );
          })}

          {isEditing && (
            <button
              onClick={addCodingProfile}
              className="rounded-2xl border border-dashed border-white/20 p-5 text-xs text-slate-400 hover:border-cyan-400 hover:text-cyan-300 transition flex items-center justify-center gap-2 min-h-[120px]"
            >
              <Plus size={16} /> Add Coding Profile
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* Helper: color accents per coding platform */
function getCodingPlatformAccent(platform: string) {
  const p = platform.toLowerCase();
  if (p.includes("leetcode"))
    return {
      bg: "bg-amber-500/10",
      border: "border-amber-500/30",
      text: "text-amber-300",
    };
  if (p.includes("hackerrank"))
    return {
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/30",
      text: "text-emerald-300",
    };
  if (p.includes("codechef"))
    return {
      bg: "bg-orange-500/10",
      border: "border-orange-500/30",
      text: "text-orange-300",
    };
  if (p.includes("github"))
    return {
      bg: "bg-cyan-500/10",
      border: "border-cyan-500/30",
      text: "text-cyan-300",
    };
  if (p.includes("hackathon"))
    return {
      bg: "bg-purple-500/10",
      border: "border-purple-500/30",
      text: "text-purple-300",
    };
  return {
    bg: "bg-slate-500/10",
    border: "border-slate-500/30",
    text: "text-slate-300",
  };
}

function ProfileField({
  icon,
  label,
  value,
  isEditing,
  onChange,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  isEditing: boolean;
  onChange: (v: string) => void;
}) {
  return (
    <div className="rounded-xl border border-white/5 bg-white/5 p-4">
      <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-1">
        {icon} {label}
      </div>
      {isEditing ? (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-transparent text-sm font-medium text-white outline-none border-b border-cyan-500/50 pb-1"
        />
      ) : (
        <p className="text-sm font-medium text-slate-200">{value}</p>
      )}
    </div>
  );
}

/* ============================================================
   STUDENT TAB 3: SKILLS
============================================================ */
function SkillsTab() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [skills] = useState<Skill[]>([
    {
      name: "Data Structures & Algorithms",
      category: "Core CS",
      score: 94,
      verifiedBy: "Campus Assessment",
      year: "2026",
    },
    {
      name: "Java (Core & OOP)",
      category: "Languages",
      score: 88,
      verifiedBy: "Campus Assessment",
      year: "2026",
    },
    {
      name: "React.js & TypeScript",
      category: "Frontend",
      score: 87,
      verifiedBy: "GitHub Sync",
      year: "2026",
    },
    {
      name: "Node.js & Express",
      category: "Backend",
      score: 85,
      verifiedBy: "GitHub Sync",
      year: "2026",
    },
    {
      name: "PostgreSQL & SQL",
      category: "Databases & Cloud",
      score: 86,
      verifiedBy: "Campus Assessment",
      year: "2026",
    },
    {
      name: "Python for Scripting",
      category: "Languages",
      score: 86,
      verifiedBy: "Self-Reported",
      year: "2026",
    },
    {
      name: "Docker & Containerization",
      category: "Databases & Cloud",
      score: 74,
      verifiedBy: "GitHub Sync",
      year: "2026",
    },
    {
      name: "Git & Version Control",
      category: "Core CS",
      score: 95,
      verifiedBy: "GitHub Sync",
      year: "2026",
    },
  ]);

  const categories = [
    "All",
    "Core CS",
    "Languages",
    "Frontend",
    "Backend",
    "Databases & Cloud",
  ];
  const filteredSkills =
    activeFilter === "All"
      ? skills
      : skills.filter((s) => s.category === activeFilter);

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white">
            Verified Skills & Project Portfolio
          </h2>
          <p className="text-sm text-slate-400 mt-2">
            Proctored campus skill assessments, automated GitHub repository sync,
            and verified student builds.
          </p>
        </div>
        <button className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 px-5 py-3 text-sm font-semibold shadow-lg hover:scale-105 transition">
          <Plus size={16} /> Add Verified Skill
        </button>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-white/10 pb-4">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveFilter(cat)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              activeFilter === cat
                ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredSkills.map((skill, idx) => (
          <SkillCard key={idx} skill={skill} />
        ))}
      </div>
    </div>
  );
}

function SkillCard({ skill }: { skill: Skill }) {
  const getVerificationIcon = () => {
    if (skill.verifiedBy === "Campus Assessment")
      return <CheckCircle2 size={14} className="text-emerald-400" />;
    if (skill.verifiedBy === "GitHub Sync")
      return <GitBranch size={14} className="text-cyan-400" />;
    return <User size={14} className="text-slate-400" />;
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-[#0b1224] p-6 hover:border-cyan-500/40 transition group">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-bold text-lg text-white group-hover:text-cyan-300 transition">
            {skill.name}
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">{skill.category}</p>
        </div>
        <span className="text-xl font-extrabold text-cyan-400">
          {skill.score}%
        </span>
      </div>
      <div className="h-2 w-full rounded-full bg-white/5 overflow-hidden mb-4">
        <div
          className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-1000"
          style={{ width: `${skill.score}%` }}
        />
      </div>
      <div className="flex items-center justify-between text-[11px] font-medium">
        <div className="flex items-center gap-1.5 text-slate-300">
          {getVerificationIcon()} <span>{skill.verifiedBy}</span>
        </div>
        <span className="text-slate-500">Verified {skill.year}</span>
      </div>
    </div>
  );
}

/* ============================================================
   STUDENT TAB 4: AI PLACEMENT
============================================================ */
function AIPlacementTab({ studentId }: { studentId: number | null }) {
    const [liveReadiness, setLiveReadiness] = useState<{
    score: number;
    level: string;
  } | null>(null);

  const [readinessError, setReadinessError] = useState("");

  useEffect(() => {
    if (studentId === null) return;

    const loadReadiness = async () => {
      try {
        setReadinessError("");

        const result = await apiPost(`/readiness/${studentId}`, {});

        setLiveReadiness({
          score: Number(result.score),
          level: String(result.level ?? ""),
        });
      } catch (error) {
        console.error("Readiness loading failed:", error);
        setReadinessError("Unable to load live readiness score.");
      }
    };

    loadReadiness();
  }, [studentId]);
  const readiness = [
    { label: "Technical Skills", score: 88, color: "cyan" },
    { label: "Aptitude", score: 78, color: "purple" },
    { label: "Communication", score: 75, color: "amber" },
    { label: "Projects & Portfolio", score: 82, color: "emerald" },
    { label: "DSA / Problem Solving", score: 85, color: "pink" },
  ];
  const skillGaps = [
    {
      skill: "Spring Boot",
      impact: "High",
      affectsJobs: 3,
      reason: "Required by TCS, Infosys, Wipro SDE roles",
    },
    {
      skill: "Docker",
      impact: "Medium",
      affectsJobs: 4,
      reason: "Common in cloud-native roles",
    },
    {
      skill: "System Design",
      impact: "Medium",
      affectsJobs: 2,
      reason: "Needed for senior SDE interviews",
    },
  ];
  const overall = liveReadiness?.score ?? null;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold">ðŸ¤– AI Placement Analysis</h2>
        <p className="text-xs text-slate-400">
          Powered by profile data, assessment scores, and market demand signals.
        </p>
      </div>
      <div className="rounded-2xl border border-cyan-500/30 bg-gradient-to-br from-cyan-500/10 via-transparent to-purple-500/10 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
              Overall Readiness
            </p>
            <div className="flex items-end gap-2 mt-2">
              <span className="text-5xl font-extrabold bg-gradient-to-r from-cyan-300 to-purple-300 bg-clip-text text-transparent">
                {overall ?? "—"}
              </span>
              <span className="text-slate-400 mb-1">/100</span>
            </div>
            <p className="text-xs text-slate-400 mt-2">
              You rank{" "}
              <span className="text-cyan-300 font-semibold">top 18%</span> among

              CSE students in your college.
            </p>
          </div>
          <Sparkles size={64} className="text-cyan-400/40 hidden md:block" />
        </div>
      </div>
      <div className="rounded-2xl border border-white/10 bg-[#0b1224] p-6">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-4">
          Readiness Breakdown
        </h3>
        <div className="space-y-4">
          {readiness.map((r) => (
            <DimensionBar
              key={r.label}
              label={r.label}
              score={r.score}
              color={r.color}
            />
          ))}
        </div>
      </div>
      <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-6">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-amber-400 mb-4 flex items-center gap-2">
          <AlertTriangle size={16} /> Skill Gap Analysis
        </h3>
        <div className="space-y-3">
          {skillGaps.map((g) => (
            <div
              key={g.skill}
              className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-4"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm">{g.skill}</span>
                  <span
                    className={`text-[10px] font-semibold rounded-full px-2 py-0.5 ${
                      g.impact === "High"
                        ? "bg-red-500/20 text-red-300 border border-red-500/30"
                        : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                    }`}
                  >
                    {g.impact} Impact
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">{g.reason}</p>
              </div>
              <div className="text-right ml-4">
                <p className="text-2xl font-bold text-amber-400">
                  {g.affectsJobs}
                </p>
                <p className="text-[10px] text-slate-500">jobs blocked</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   STUDENT TAB 5: JOBS
============================================================ */
function JobsTab() {
  const [jobs, setJobs] = useState<JobMatch[]>([]);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [jobsError, setJobsError] = useState("");

  useEffect(() => {
    const loadJobs = async () => {
      try {
        const data = await apiGet("/jobs/");

        const realJobs: JobMatch[] = (Array.isArray(data) ? data : []).map(
          (job: any) => ({
            company: job.company || job.company_name || "Employer",
            role: job.title || "Job Opening",
            package: job.package || job.salary || "Not specified",
            location: job.location || "Not specified",
            matchScore: 0,
            matched: [],
            missing: [],
            explanation:
              job.description || "No description provided by the employer.",
            deadline: job.deadline || job.application_deadline || "Not specified",
          })
        );

        setJobs(realJobs);
      } catch (error) {
        console.error("Loading jobs failed:", error);
        setJobsError("Could not load jobs. Check that the backend is running.");
      } finally {
        setJobsLoading(false);
      }
    };

    loadJobs();
  }, []);

  const applications = [
    {
      company: "TCS",
      role: "Software Engineer",
      stage: "Interview",
      applied: "2 Oct",
    },
    {
      company: "Infosys",
      role: "Systems Engineer",
      stage: "Shortlisted",
      applied: "28 Sep",
    },
    {
      company: "Wipro",
      role: "Project Engineer",
      stage: "Applied",
      applied: "25 Sep",
    },
    {
      company: "Accenture",
      role: "Associate",
      stage: "Rejected",
      applied: "20 Sep",
    },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold">ðŸ’¼ Jobs & Applications</h2>
        <p className="text-xs text-slate-400">
          Every match shows exactly{" "}
          <span className="text-cyan-300 font-semibold">why</span> you fit â€” no
          black boxes.
        </p>
      </div>
      <div className="space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
          AI Job Matches
        </h3>
        {jobsLoading && <p>Loading real jobs...</p>}

        {!jobsLoading && jobsError && (
          <p className="text-amber-300">{jobsError}</p>
        )}

        {!jobsLoading && !jobsError && jobs.length === 0 && (
          <p className="text-slate-400">
            No jobs found. Add job listings through the recruiter portal.
          </p>
        )}

        {!jobsLoading &&
          !jobsError &&
          jobs.map((job, index) => (
            <JobMatchCard key={`${job.company}-${index}`} job={job} />
          ))}
      </div>
      <div className="rounded-2xl border border-white/10 bg-[#0b1224] p-6">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-4">
          Application Tracker
        </h3>
        <div className="space-y-2">
          {applications.map((a) => (
            <div
              key={a.company}
              className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-4"
            >
              <div>
                <p className="text-sm font-semibold">{a.company}</p>
                <p className="text-[11px] text-slate-400">{a.role}</p>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-[11px] text-slate-500">{a.applied}</span>
                <StageBadge stage={a.stage} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function JobMatchCard({ job }: { job: JobMatch }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="rounded-2xl border border-white/10 bg-[#0b1224] p-5 transition hover:border-cyan-500/40">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h3 className="font-bold text-lg">{job.role}</h3>
            <span className="rounded-lg bg-cyan-500/10 border border-cyan-500/30 px-2 py-0.5 text-[10px] font-semibold text-cyan-300">
              {job.matchScore}% match
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {job.company} . {job.location} . {job.package}
          </p>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-slate-500 uppercase">Deadline</p>
          <p className="text-xs font-semibold text-amber-300">{job.deadline}</p>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3">
          <p className="text-[10px] uppercase tracking-wider text-emerald-400 font-semibold mb-2">
            âœ“ Matched
          </p>
          <div className="flex flex-wrap gap-1.5">
            {job.matched.map((s) => (
              <span
                key={s}
                className="rounded-md bg-emerald-500/20 border border-emerald-500/30 px-2 py-0.5 text-[11px] text-emerald-200"
              >
                {s}
              </span>
            ))}
          </div>
        </div>
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3">
          <p className="text-[10px] uppercase tracking-wider text-amber-400 font-semibold mb-2">
            âš  Missing
          </p>
          <div className="flex flex-wrap gap-1.5">
            {job.missing.map((s) => (
              <span
                key={s}
                className="rounded-md bg-amber-500/20 border border-amber-500/30 px-2 py-0.5 text-[11px] text-amber-200"
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      </div>
      <button
        onClick={() => setExpanded(!expanded)}
        className="mt-3 flex items-center gap-1.5 text-xs font-medium text-cyan-400 hover:text-cyan-300"
      >
        <Bot size={14} /> Why this match? {expanded ? "â–²" : "â–¼"}
      </button>
      {expanded && (
        <div className="mt-3 rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-3 text-xs text-slate-300 leading-relaxed">
          {job.explanation}
        </div>
      )}
      <div className="mt-4 flex gap-2">
        <button className="flex-1 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-400 py-2.5 text-xs font-semibold hover:opacity-90 transition">
          Apply Now
        </button>
        <button className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-semibold hover:bg-white/10">
          Save
        </button>
      </div>
    </div>
  );
}

/* ============================================================
   STUDENT TAB 6: CALENDAR
============================================================ */
function CalendarTab() {
  const drives: Drive[] = [
    {
      company: "TCS",
      role: "Software Engineer",
      date: "12 Oct 2026",
      time: "10:00 AM",
      venue: "Main Auditorium",
    },
    {
      company: "Infosys",
      role: "Systems Engineer",
      date: "12 Oct 2026",
      time: "02:00 PM",
      venue: "Block B, Hall 2",
    },
    {
      company: "Wipro",
      role: "Project Engineer",
      date: "14 Oct 2026",
      time: "10:00 AM",
      venue: "Block A, Hall 1",
      conflictsWith: "Deloitte drive on the same day at the same time",
    },
    {
      company: "Deloitte",
      role: "Analyst",
      date: "14 Oct 2026",
      time: "10:00 AM",
      venue: "Seminar Hall",
      conflictsWith: "Wipro drive on the same day at the same time",
    },
    {
      company: "Accenture",
      role: "Associate Software Engineer",
      date: "18 Oct 2026",
      time: "11:00 AM",
      venue: "Auditorium 2",
    },
  ];
  const conflicts = drives.filter((d) => d.conflictsWith);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold">ðŸ“… Drive Calendar</h2>
        <p className="text-xs text-slate-400">
          Conflict-aware view â€” we automatically detect overlapping drives.
        </p>
      </div>
      {conflicts.length > 0 && (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-5 flex items-start gap-4">
          <div className="rounded-xl bg-red-500/20 p-2.5 border border-red-500/40">
            <AlertTriangle size={20} className="text-red-400" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-red-300 text-sm">
              {conflicts.length / 2} Scheduling Conflict
              {conflicts.length / 2 > 1 ? "s" : ""} Detected
            </h3>
            <p className="text-xs text-slate-300 mt-1">
              <span className="font-semibold text-red-300">Wipro</span> and{" "}
              <span className="font-semibold text-red-300">Deloitte</span> drives
              overlap on{" "}
              <span className="font-semibold">14 Oct 2026 @ 10:00 AM</span>.
              Choose one â€” inform the placement cell.
            </p>
          </div>
        </div>
      )}
      <div className="space-y-3">
        {drives.map((d, i) => {
          const hasConflict = !!d.conflictsWith;
          return (
            <div
              key={i}
              className={`rounded-2xl border p-5 flex items-center gap-4 ${
                hasConflict
                  ? "border-red-500/40 bg-red-500/5"
                  : "border-white/10 bg-[#0b1224]"
              }`}
            >
              <div
                className={`rounded-xl px-4 py-3 text-center min-w-[80px] ${
                  hasConflict
                    ? "bg-red-500/20 border border-red-500/40"
                    : "bg-cyan-500/10 border border-cyan-500/30"
                }`}
              >
                <p className="text-[10px] uppercase font-semibold text-slate-400">
                  {d.date.split(" ")[1]}
                </p>
                <p
                  className={`text-2xl font-extrabold ${
                    hasConflict ? "text-red-300" : "text-cyan-300"
                  }`}
                >
                  {d.date.split(" ")[0]}
                </p>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold">{d.company}</h3>
                  {hasConflict && (
                    <span className="rounded-full bg-red-500/20 border border-red-500/40 px-2 py-0.5 text-[10px] font-semibold text-red-300">
                      âš  Conflict
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400">{d.role}</p>
                <div className="flex items-center gap-4 mt-2 text-[11px] text-slate-500">
                  <span className="flex items-center gap-1">
                    <Clock size={12} /> {d.time}
                  </span>
                  <span className="flex items-center gap-1">
                    <Target size={12} /> {d.venue}
                  </span>
                </div>
                {hasConflict && (
                  <p className="mt-2 text-[11px] text-red-300 italic">
                    {d.conflictsWith}
                  </p>
                )}
              </div>
              <button
                className={`rounded-xl px-4 py-2 text-xs font-semibold ${
                  hasConflict
                    ? "border border-red-500/40 bg-red-500/10 text-red-300 hover:bg-red-500/20"
                    : "bg-gradient-to-r from-blue-500 to-cyan-400 hover:opacity-90"
                }`}
              >
                {hasConflict ? "Resolve" : "Register"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ============================================================
   STUDENT TAB 7: ASSESSMENTS
============================================================ */
function AssessmentsTab() {
  const assessments: Assessment[] = [
    {
      name: "Aptitude Test #4",
      score: 78,
      max: 100,
      date: "05 Oct 2026",
      trend: "up",
    },
    {
      name: "Mock Interview â€” Technical",
      score: 82,
      max: 100,
      date: "02 Oct 2026",
      trend: "up",
    },
    {
      name: "Communication Assessment",
      score: 75,
      max: 100,
      date: "28 Sep 2026",
      trend: "stable",
    },
    {
      name: "DSA Contest â€” Medium",
      score: 85,
      max: 100,
      date: "25 Sep 2026",
      trend: "up",
    },
    {
      name: "Aptitude Test #3",
      score: 71,
      max: 100,
      date: "15 Sep 2026",
      trend: "down",
    },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold">ðŸ“ˆ Assessment History</h2>
        <p className="text-xs text-slate-400">
          Every test, interview, and communication score tracked over time.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <MiniStat label="Aptitude" value="78" trend="up" />
        <MiniStat label="Mock Interview" value="82" trend="up" />
        <MiniStat label="Communication" value="75" trend="stable" />
        <MiniStat label="DSA" value="85" trend="up" />
      </div>
      <div className="rounded-2xl border border-white/10 bg-[#0b1224] overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-white/10 bg-white/5 text-slate-400 uppercase tracking-wider text-xs">
            <tr>
              <th className="p-4">Assessment</th>
              <th className="p-4">Score</th>
              <th className="p-4">Trend</th>
              <th className="p-4">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {assessments.map((a, i) => (
              <tr key={i} className="hover:bg-white/[0.02]">
                <td className="p-4 font-medium text-slate-200">{a.name}</td>
                <td className="p-4">
                  <span className="font-bold text-cyan-300">{a.score}</span>
                  <span className="text-slate-500 text-xs"> / {a.max}</span>
                </td>
                <td className="p-4">
                  {a.trend === "up" && (
                    <span className="text-emerald-400 text-xs">â–² Improving</span>
                  )}
                  {a.trend === "down" && (
                    <span className="text-red-400 text-xs">â–¼ Declining</span>
                  )}
                  {a.trend === "stable" && (
                    <span className="text-slate-400 text-xs">â— Stable</span>
                  )}
                </td>
                <td className="p-4 text-xs text-slate-400">{a.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ============================================================
   STUDENT REUSABLE UI
============================================================ */
function MetricCard({
  icon,
  label,
  value,
  suffix,
  color,
  trend,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  suffix?: string;
  color: "cyan" | "purple" | "emerald" | "amber";
  trend?: string;
}) {
  const colorMap = {
    cyan: {
      bg: "bg-cyan-500/10",
      border: "border-cyan-500/30",
      text: "text-cyan-300",
    },
    purple: {
      bg: "bg-purple-500/10",
      border: "border-purple-500/30",
      text: "text-purple-300",
    },
    emerald: {
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/30",
      text: "text-emerald-300",
    },
    amber: {
      bg: "bg-amber-500/10",
      border: "border-amber-500/30",
      text: "text-amber-300",
    },
  }[color];

  return (
    <div className={`rounded-2xl border ${colorMap.border} ${colorMap.bg} p-5`}>
      <div
        className={`rounded-xl p-2 w-fit ${colorMap.bg} border ${colorMap.border} ${colorMap.text}`}
      >
        {icon}
      </div>
      <p className="mt-3 text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
        {label}
      </p>
      <p className="mt-1 flex items-end gap-1">
        <span className="text-3xl font-extrabold text-white">{value}</span>
        {suffix && <span className="text-sm text-slate-400 mb-1">{suffix}</span>}
      </p>
      {trend && <p className={`text-[11px] mt-2 ${colorMap.text}`}>{trend}</p>}
    </div>
  );
}

function CompletenessRing({ percent }: { percent: number }) {
  const radius = 52;
  const circ = 2 * Math.PI * radius;
  const offset = circ - (percent / 100) * circ;
  return (
    <div className="relative">
      <svg width="130" height="130" className="-rotate-90">
        <circle
          cx="65"
          cy="65"
          r={radius}
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="10"
          fill="none"
        />
        <circle
          cx="65"
          cy="65"
          r={radius}
          stroke="url(#ring-grad)"
          strokeWidth="10"
          fill="none"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000"
        />
        <defs>
          <linearGradient id="ring-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#22d3ee" />
            <stop offset="100%" stopColor="#a855f7" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-extrabold bg-gradient-to-r from-cyan-300 to-purple-300 bg-clip-text text-transparent">
          {percent}%
        </span>
        <span className="text-[10px] uppercase text-slate-500">Complete</span>
      </div>
    </div>
  );
}

function QuickAction({
  icon,
  title,
  desc,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="rounded-xl border border-white/10 bg-white/5 p-4 text-left hover:border-cyan-500/40 hover:bg-cyan-500/5 transition group"
    >
      <div className="flex items-start justify-between">
        <div className="rounded-lg bg-cyan-500/10 p-2 text-cyan-300 border border-cyan-500/20">
          {icon}
        </div>
        <ChevronRight
          size={16}
          className="text-slate-500 group-hover:text-cyan-400 transition"
        />
      </div>
      <p className="mt-3 font-semibold text-sm">{title}</p>
      <p className="text-[11px] text-slate-400">{desc}</p>
    </button>
  );
}

function DimensionBar({
  label,
  score,
  color,
}: {
  label: string;
  score: number;
  color: string;
}) {
  const gradients =
    {
      cyan: "from-blue-500 to-cyan-400",
      purple: "from-purple-500 to-pink-400",
      amber: "from-amber-500 to-orange-400",
      emerald: "from-emerald-500 to-cyan-400",
      pink: "from-pink-500 to-purple-400",
    }[color] || "from-cyan-500 to-blue-400";

  return (
    <div>
      <div className="flex justify-between text-xs font-medium mb-1.5">
        <span className="text-slate-300">{label}</span>
        <span className="text-slate-400">{score}%</span>
      </div>
      <div className="h-2.5 w-full rounded-full bg-white/5 overflow-hidden">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${gradients} transition-all duration-1000`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}

function StageBadge({ stage }: { stage: string }) {
  const styles: Record<string, string> = {
    Applied: "bg-slate-500/20 text-slate-300 border-slate-500/30",
    Shortlisted: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
    Interview: "bg-purple-500/20 text-purple-300 border-purple-500/30",
    Offered: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    Rejected: "bg-red-500/20 text-red-300 border-red-500/30",
  };
  return (
    <span
      className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold ${
        styles[stage] || styles.Applied
      }`}
    >
      {stage}
    </span>
  );
}

function MiniStat({
  label,
  value,
  trend,
}: {
  label: string;
  value: string;
  trend: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-[#0b1224] p-4">
      <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
        {label}
      </p>
      <p className="mt-1 text-2xl font-extrabold text-white">{value}</p>
      <p
        className={`text-[10px] mt-1 ${
          trend === "up"
            ? "text-emerald-400"
            : trend === "down"
            ? "text-red-400"
            : "text-slate-500"
        }`}
      >
        {trend === "up" ? "â–²" : trend === "down" ? "â–¼" : "â—"} {trend}
      </p>
    </div>
  );
}

function SkeletonLoader() {
  return (
    <div className="space-y-6 animate-pulse max-w-5xl mx-auto">
      <div className="h-8 w-64 rounded-lg bg-white/5" />
      <div className="grid grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 rounded-2xl bg-white/5" />
        ))}
      </div>
      <div className="h-64 rounded-2xl bg-white/5" />
      <div className="h-32 rounded-2xl bg-white/5" />
    </div>
  );
}

/* =========================================================
   RECRUITER SUB-VIEWS
========================================================= */
function RecruiterDashboardView({
  onOpenPostJob,
}: {
  onOpenPostJob: () => void;
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            RECRUITER COMMAND CENTER
          </h2>
          <p className="text-xs text-slate-400">
            Overview of active recruitment drives and student candidate matches.
          </p>
        </div>
        <button
          onClick={onOpenPostJob}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-pink-500 px-4 py-2.5 text-xs font-semibold text-white shadow-lg transition hover:scale-105"
        >
          <Plus size={16} /> Post New Job
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Active Jobs" value="4" color="text-orange-400" />
        <StatCard label="Candidates" value="128" color="text-cyan-400" />
        <StatCard label="Shortlisted" value="32" color="text-purple-400" />
        <StatCard label="Offers" value="8" color="text-emerald-400" />
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
          Recent Job Postings
        </h3>
        <div className="rounded-2xl border border-white/10 bg-[#0c0914] overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-white/10 bg-white/5 text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="p-4">Role / Title</th>
                <th className="p-4">Applicants</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              <tr className="hover:bg-white/[0.02]">
                <td className="p-4 font-semibold text-slate-200">
                  Software Engineer
                </td>
                <td className="p-4 text-slate-400">12 candidates</td>
                <td className="p-4">
                  <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-1 rounded-full text-[10px] font-semibold">
                    Active
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-white/[0.02]">
                <td className="p-4 font-semibold text-slate-200">Data Analyst</td>
                <td className="p-4 text-slate-400">28 candidates</td>
                <td className="p-4">
                  <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-1 rounded-full text-[10px] font-semibold">
                    Active
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-white/[0.02]">
                <td className="p-4 font-semibold text-slate-200">
                  Frontend Developer
                </td>
                <td className="p-4 text-slate-400">19 candidates</td>
                <td className="p-4">
                  <span className="bg-slate-500/20 text-slate-400 border border-slate-500/30 px-2.5 py-1 rounded-full text-[10px] font-semibold">
                    Closed
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function RecruiterJobsView({ onOpenPostJob }: { onOpenPostJob: () => void }) {
  const jobs = [
    {
      title: "Software Engineer",
      location: "Bangalore",
      package: "8 LPA",
      skills: ["Python", "React", "SQL"],
      status: "Active",
    },
    {
      title: "Data Analyst",
      location: "Hyderabad",
      package: "7 LPA",
      skills: ["SQL", "Python", "PowerBI"],
      status: "Active",
    },
    {
      title: "Frontend Developer",
      location: "Pune",
      package: "6.5 LPA",
      skills: ["React", "JavaScript", "Tailwind"],
      status: "Closed",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">My Job Openings</h2>
          <p className="text-xs text-slate-400">
            Manage your posted roles and criteria.
          </p>
        </div>
        <button
          onClick={onOpenPostJob}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-pink-500 px-4 py-2.5 text-xs font-semibold text-white shadow-lg transition hover:scale-105"
        >
          <Plus size={16} /> Post New Job
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {jobs.map((job, idx) => (
          <div
            key={idx}
            className="rounded-2xl border border-white/10 bg-[#0c0914] p-5 flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex justify-between items-start">
                <h3 className="font-bold text-lg text-slate-100">{job.title}</h3>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                    job.status === "Active"
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                      : "bg-slate-500/20 text-slate-400 border border-slate-500/30"
                  }`}
                >
                  {job.status}
                </span>
              </div>
              <div className="mt-2 space-y-1 text-xs text-slate-400">
                <p className="flex items-center gap-1.5">
                  <MapPin size={14} className="text-orange-400" /> {job.location}
                </p>
                <p className="flex items-center gap-1.5">
                  <DollarSign size={14} className="text-emerald-400" />{" "}
                  {job.package}
                </p>
              </div>
            </div>

            <div>
              <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-1.5">
                Required Skills
              </p>
              <div className="flex flex-wrap gap-1.5">
                {job.skills.map((s, i) => (
                  <span
                    key={i}
                    className="rounded-md bg-white/5 px-2 py-0.5 text-[10px] text-slate-300 border border-white/5"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function RecruiterCandidatesView({
  onSelectCandidate,
}: {
  onSelectCandidate: (candidate: RecruiterCandidate) => void;
}) {
  const candidates: RecruiterCandidate[] = [
    {
      name: "Rahul",
      role: "Software Engineer",
      skills: ["Python", "React", "SQL"],
      match: "94%",
      status: "Reviewing",
      cgpa: "8.4",
      branch: "CSE",
    },
    {
      name: "Priya",
      role: "Data Analyst",
      skills: ["Java", "SQL", "PowerBI"],
      match: "88%",
      status: "Reviewing",
      cgpa: "8.8",
      branch: "CSE",
    },
    {
      name: "Aman",
      role: "Software Engineer",
      skills: ["Python", "Django", "PostgreSQL"],
      match: "82%",
      status: "Reviewing",
      cgpa: "7.6",
      branch: "ECE",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Candidate Pool</h2>
        <p className="text-xs text-slate-400">
          AI matched applicants sorted by relevance to your active jobs.
        </p>
      </div>

      <div className="rounded-2xl border border-white/10 bg-[#0c0914] overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-white/10 bg-white/5 text-slate-400 uppercase tracking-wider">
            <tr>
              <th className="p-4">Candidate</th>
              <th className="p-4">Skills</th>
              <th className="p-4">AI Match</th>
              <th className="p-4">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {candidates.map((c, i) => (
              <tr key={i} className="hover:bg-white/[0.02]">
                <td className="p-4 font-semibold text-slate-200">{c.name}</td>
                <td className="p-4 text-slate-400">{c.skills.join(", ")}</td>
                <td className="p-4 text-orange-400 font-bold">{c.match}</td>
                <td className="p-4">
                  <button
                    onClick={() => onSelectCandidate(c)}
                    className="flex items-center gap-1 text-xs text-orange-400 hover:text-orange-300 font-medium underline"
                  >
                    View Details <ChevronRight size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function RecruiterShortlistedView({
  onSelectCandidate,
}: {
  onSelectCandidate: (candidate: RecruiterCandidate) => void;
}) {
  const shortlisted: RecruiterCandidate[] = [
    {
      name: "Rahul Sharma",
      role: "Software Engineer",
      skills: ["Python", "React", "SQL"],
      match: "94%",
      status: "Interview",
      cgpa: "8.4",
      branch: "CSE",
    },
    {
      name: "Priya Singh",
      role: "Data Analyst",
      skills: ["Java", "SQL", "PowerBI"],
      match: "91%",
      status: "Interview",
      cgpa: "8.8",
      branch: "CSE",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Shortlisted Candidates</h2>
        <p className="text-xs text-slate-400">
          Candidates selected for interview rounds.
        </p>
      </div>

      <div className="rounded-2xl border border-white/10 bg-[#0c0914] overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-white/10 bg-white/5 text-slate-400 uppercase tracking-wider">
            <tr>
              <th className="p-4">Candidate</th>
              <th className="p-4">Match Score</th>
              <th className="p-4">Interview Status</th>
              <th className="p-4">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {shortlisted.map((s, i) => (
              <tr key={i} className="hover:bg-white/[0.02]">
                <td className="p-4 font-semibold text-slate-200">{s.name}</td>
                <td className="p-4 text-orange-400 font-bold">{s.match}</td>
                <td className="p-4">
                  <span className="bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2.5 py-1 rounded-full text-[10px] font-semibold">
                    {s.status}
                  </span>
                </td>
                <td className="p-4">
                  <button
                    onClick={() => onSelectCandidate(s)}
                    className="flex items-center gap-1 text-xs text-orange-400 hover:text-orange-300 font-medium underline"
                  >
                    View Details <ChevronRight size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function RecruiterOffersView() {
  const offers = [
    { candidate: "Rahul", role: "Software Engineer", package: "8 LPA" },
    { candidate: "Priya", role: "Data Analyst", package: "7 LPA" },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Extended Offers</h2>
      <div className="rounded-2xl border border-white/10 bg-[#0c0914] overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-white/10 bg-white/5 text-slate-400 uppercase tracking-wider">
            <tr>
              <th className="p-4">Candidate</th>
              <th className="p-4">Offered Role</th>
              <th className="p-4">Package</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {offers.map((o, i) => (
              <tr key={i} className="hover:bg-white/[0.02]">
                <td className="p-4 font-semibold text-slate-200">
                  {o.candidate}
                </td>
                <td className="p-4 text-slate-400">{o.role}</td>
                <td className="p-4 text-emerald-400 font-bold">{o.package}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* =========================================================
   PLACEMENT SUB-VIEWS
========================================================= */
function PlacementDashboardView() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          PLACEMENT COMMAND CENTER
        </h2>
        <p className="text-xs text-slate-400">
          Real-time metrics and campus placement analytics overview.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Students" value="1250" />
        <StatCard label="Ready" value="730" color="text-emerald-400" />
        <StatCard label="Drives" value="12" color="text-cyan-400" />
        <StatCard label="Offers" value="86" color="text-purple-400" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-[#0b0f19] p-6 text-center flex flex-col items-center justify-center">
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
            Overall Placement Readiness
          </h3>
          <div className="relative mt-4 flex items-center justify-center">
            <div className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
              68%
            </div>
          </div>
          <p className="mt-2 text-xs text-slate-500">
            Based on student skill gap analyses and assessment scores
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#0b0f19] p-6">
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
            Branch Placement
          </h3>
          <div className="space-y-4">
            <BranchBar branch="CSE" percentage={72} color="bg-cyan-500" />
            <BranchBar branch="ECE" percentage={61} color="bg-purple-500" />
            <BranchBar branch="EEE" percentage={55} color="bg-pink-500" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6">
          <h3 className="text-sm font-bold text-red-400 uppercase tracking-wider">
            At Risk
          </h3>
          <p className="mt-2 text-3xl font-extrabold text-white">
            Students: 84
          </p>
          <p className="mt-1 text-xs text-slate-400">
            Students requiring immediate skill training before upcoming drives.
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#0b0f19] p-6">
          <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-2">
            Upcoming Drives
          </h3>
          <div className="flex items-center gap-4 text-sm font-semibold text-purple-300">
            <span className="rounded-lg bg-purple-500/20 px-3 py-1.5 border border-purple-500/30">
              TCS
            </span>
            <span className="rounded-lg bg-cyan-500/20 px-3 py-1.5 border border-cyan-500/30 text-cyan-300">
              Infosys
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function StudentsView() {
  const [searchTerm, setSearchTerm] = useState("");

  const students = [
    {
      name: "Rahul",
      branch: "CSE",
      cgpa: "8.4",
      readiness: "91%",
      status: "Ready",
    },
    {
      name: "Aman",
      branch: "ECE",
      cgpa: "7.6",
      readiness: "68%",
      status: "Developing",
    },
    {
      name: "Priya",
      branch: "CSE",
      cgpa: "8.8",
      readiness: "95%",
      status: "Ready",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Students Directory</h2>
        <div className="relative w-64">
          <Search size={16} className="absolute left-3 top-3 text-slate-500" />
          <input
            type="text"
            placeholder="Search Student..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-[#0b0f19] py-2 pl-9 pr-4 text-xs text-white outline-none focus:border-purple-400"
          />
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-[#0b0f19] overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-white/10 bg-white/5 text-slate-400 uppercase tracking-wider">
            <tr>
              <th className="p-4">Name</th>
              <th className="p-4">Branch</th>
              <th className="p-4">CGPA</th>
              <th className="p-4">Readiness</th>
              <th className="p-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {students.map((s, i) => (
              <tr key={i} className="hover:bg-white/[0.02]">
                <td className="p-4 font-semibold text-slate-200">{s.name}</td>
                <td className="p-4 text-slate-400">{s.branch}</td>
                <td className="p-4 text-slate-400">{s.cgpa}</td>
                <td className="p-4 text-purple-300 font-medium">
                  {s.readiness}
                </td>
                <td className="p-4">
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-semibold ${
                      s.status === "Ready"
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                        : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                    }`}
                  >
                    {s.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function RecruitersView() {
  const recruiters = [
    { company: "TCS", jobs: 2, candidates: 45, status: "Active" },
    { company: "Infosys", jobs: 1, candidates: 32, status: "Active" },
    { company: "Deloitte", jobs: 1, candidates: 25, status: "Active" },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Registered Recruiters</h2>
      <div className="rounded-2xl border border-white/10 bg-[#0b0f19] overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-white/10 bg-white/5 text-slate-400 uppercase tracking-wider">
            <tr>
              <th className="p-4">Company</th>
              <th className="p-4">Open Jobs</th>
              <th className="p-4">Candidates</th>
              <th className="p-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {recruiters.map((r, i) => (
              <tr key={i} className="hover:bg-white/[0.02]">
                <td className="p-4 font-semibold text-slate-200">
                  {r.company}
                </td>
                <td className="p-4 text-slate-400">{r.jobs}</td>
                <td className="p-4 text-slate-400">{r.candidates}</td>
                <td className="p-4">
                  <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-1 rounded-full text-[10px] font-semibold">
                    {r.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function DrivesView({ onOpenCreate }: { onOpenCreate: () => void }) {
  const drives = [
    {
      company: "TCS",
      role: "Software Dev",
      date: "12 Oct",
      status: "Upcoming",
    },
    {
      company: "Infosys",
      role: "System Engineer",
      date: "14 Oct",
      status: "Upcoming",
    },
    {
      company: "Deloitte",
      role: "Analyst",
      date: "16 Oct",
      status: "Ongoing",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Placement Drives</h2>
        <button
          onClick={onOpenCreate}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-2 text-xs font-semibold text-white shadow-lg transition hover:scale-105"
        >
          <Plus size={16} /> Create Drive
        </button>
      </div>

      <div className="rounded-2xl border border-white/10 bg-[#0b0f19] overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-white/10 bg-white/5 text-slate-400 uppercase tracking-wider">
            <tr>
              <th className="p-4">Company</th>
              <th className="p-4">Role</th>
              <th className="p-4">Date</th>
              <th className="p-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {drives.map((d, i) => (
              <tr key={i} className="hover:bg-white/[0.02]">
                <td className="p-4 font-semibold text-slate-200">
                  {d.company}
                </td>
                <td className="p-4 text-slate-300">{d.role}</td>
                <td className="p-4 text-slate-400">{d.date}</td>
                <td className="p-4">
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-semibold ${
                      d.status === "Ongoing"
                        ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                        : "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                    }`}
                  >
                    {d.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ShortlistsView({
  onSelectMatch,
}: {
  onSelectMatch: (match: MatchDetail) => void;
}) {
  const shortlists = [
    {
      student: "Rahul",
      company: "TCS",
      matchScore: "94%",
      details: {
        name: "Rahul Sharma",
        score: "94%",
        eligible: true,
        skills: ["Java", "SQL", "React", "2 Projects"],
        skillGap: "Spring Boot",
        recommendation: "Highly Suitable",
      },
    },
    {
      student: "Aman",
      company: "TCS",
      matchScore: "88%",
      details: {
        name: "Aman Verma",
        score: "88%",
        eligible: true,
        skills: ["C++", "Data Structures", "SQL"],
        skillGap: "System Design",
        recommendation: "Suitable with Training",
      },
    },
    {
      student: "Priya",
      company: "Infosys",
      matchScore: "91%",
      details: {
        name: "Priya Patel",
        score: "91%",
        eligible: true,
        skills: ["Python", "Machine Learning", "React"],
        skillGap: "Docker",
        recommendation: "Highly Suitable",
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">ðŸ¤– AI Recommended Candidates</h2>
        <p className="text-xs text-slate-400">
          Automated match scores based on candidate profile and job eligibility.
        </p>
      </div>

      <div className="rounded-2xl border border-white/10 bg-[#0b0f19] overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-white/10 bg-white/5 text-slate-400 uppercase tracking-wider">
            <tr>
              <th className="p-4">Student</th>
              <th className="p-4">Company</th>
              <th className="p-4">Match Score</th>
              <th className="p-4">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {shortlists.map((s, i) => (
              <tr key={i} className="hover:bg-white/[0.02]">
                <td className="p-4 font-semibold text-slate-200 font-medium">
                  {s.student}
                </td>
                <td className="p-4 text-slate-400">{s.company}</td>
                <td className="p-4 text-purple-300 font-bold">
                  {s.matchScore}
                </td>
                <td className="p-4">
                  <button
                    onClick={() => onSelectMatch(s.details)}
                    className="flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300 font-medium underline"
                  >
                    View Match <ChevronRight size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function OffersView() {
  const offers = [
    { student: "Rahul", company: "TCS", package: "â‚¹7 LPA", status: "Accepted" },
    {
      student: "Aman",
      company: "Infosys",
      package: "â‚¹6 LPA",
      status: "Pending",
    },
    {
      student: "Priya",
      company: "Deloitte",
      package: "â‚¹8 LPA",
      status: "Joined",
    },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Placement Offers</h2>
      <div className="rounded-2xl border border-white/10 bg-[#0b0f19] overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-white/10 bg-white/5 text-slate-400 uppercase tracking-wider">
            <tr>
              <th className="p-4">Student</th>
              <th className="p-4">Company</th>
              <th className="p-4">Package</th>
              <th className="p-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {offers.map((o, i) => (
              <tr key={i} className="hover:bg-white/[0.02]">
                <td className="p-4 font-semibold text-slate-200">{o.student}</td>
                <td className="p-4 text-slate-400">{o.company}</td>
                <td className="p-4 text-emerald-400 font-bold">{o.package}</td>
                <td className="p-4">
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-semibold ${
                      o.status === "Joined"
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                        : o.status === "Accepted"
                        ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                        : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                    }`}
                  >
                    {o.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AnalyticsView() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Placement Analytics</h2>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-[#0b0f19] p-6">
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
            Branch-wise Placement
          </h3>
          <div className="space-y-3">
            <BranchBar branch="CSE" percentage={72} color="bg-cyan-500" />
            <BranchBar branch="ECE" percentage={61} color="bg-purple-500" />
            <BranchBar branch="EEE" percentage={55} color="bg-pink-500" />
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#0b0f19] p-6">
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
            Package Distribution
          </h3>
          <div className="space-y-3">
            <BranchBar branch="3â€“5 LPA" percentage={40} color="bg-blue-500" />
            <BranchBar branch="5â€“8 LPA" percentage={35} color="bg-purple-500" />
            <BranchBar branch="8â€“12 LPA" percentage={18} color="bg-emerald-500" />
            <BranchBar branch="12+ LPA" percentage={7} color="bg-amber-500" />
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   SHARED UI
========================================================= */
function SidebarLink({
  icon,
  label,
  active,
  activeClass,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  activeClass: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition ${
        active
          ? `${activeClass} border font-semibold`
          : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

function StatCard({
  label,
  value,
  color = "text-white",
}: {
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#0b0f19] p-5">
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
        {label}
      </p>
      <p className={`mt-1 text-3xl font-extrabold ${color}`}>{value}</p>
    </div>
  );
}

function BranchBar({
  branch,
  percentage,
  color,
}: {
  branch: string;
  percentage: number;
  color: string;
}) {
  return (
    <div>
      <div className="flex justify-between text-xs font-medium mb-1.5">
        <span className="text-slate-300">{branch}</span>
        <span className="text-slate-400">{percentage}%</span>
      </div>
      <div className="h-2.5 w-full rounded-full bg-white/5 overflow-hidden">
        <div
          className={`h-full rounded-full ${color}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

function PortalCard({
  type,
  active,
  setActive,
  icon,
  title,
  subtitle,
  description,
  color,
  onOpenAuth,
}: {
  type: "student" | "placement" | "recruiter";
  active: Portal;
  setActive: (value: Portal) => void;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  description: string[];
  color: "student" | "placement" | "recruiter";
  onOpenAuth: (portal: Portal, mode: AuthMode) => void;
}) {
  const isActive = active === type;
  const isOther = active !== null && active !== type;

  const colors = {
    student: {
      border: "border-cyan-400/60",
      icon: "from-blue-500 to-cyan-400",
      glow: "bg-cyan-500/30",
      text: "text-cyan-300",
      bullet: "bg-cyan-300",
      button: "from-blue-500 to-cyan-400",
    },
    placement: {
      border: "border-purple-400/60",
      icon: "from-purple-500 to-pink-400",
      glow: "bg-purple-500/30",
      text: "text-purple-300",
      bullet: "bg-purple-300",
      button: "from-purple-500 to-pink-400",
    },
    recruiter: {
      border: "border-orange-400/60",
      icon: "from-orange-500 to-pink-400",
      glow: "bg-orange-500/30",
      text: "text-orange-300",
      bullet: "bg-orange-300",
      button: "from-orange-500 to-pink-400",
    },
  };

  const c = colors[color];

  return (
    <div
      onMouseEnter={() => setActive(type)}
      className={`
        relative flex flex-shrink-0 items-center justify-center
        overflow-hidden border transition-all duration-700
        ease-[cubic-bezier(.22,1,.36,1)]
        ${
          isActive
            ? `h-[440px] w-[560px] rounded-[3.5rem] ${c.border} bg-white/[0.07] shadow-2xl scale-100 z-20`
            : isOther
            ? `h-[180px] w-[140px] rounded-[3.5rem] border-white/5 bg-white/[0.015] opacity-20 scale-90`
            : `h-[280px] w-[280px] rounded-[4.5rem] border-white/10 bg-white/[0.035] hover:scale-105`
        }
      `}
    >
      <div
        className={`
          pointer-events-none absolute rounded-full blur-3xl transition-all duration-700
          ${c.glow} ${isActive ? "h-72 w-72 opacity-50" : "h-40 w-40 opacity-20"}
        `}
      />

      <div className="relative z-10 flex h-full w-full flex-col items-center justify-center px-8 text-center">
        <div
          className={`
            flex flex-shrink-0 items-center justify-center rounded-full
            bg-gradient-to-br ${c.icon} text-white shadow-2xl transition-all duration-700
            ${isActive ? "h-20 w-20" : isOther ? "h-14 w-14" : "h-20 w-20"}
          `}
        >
          {icon}
        </div>

        <h3
          className={`
            font-bold transition-all duration-700
            ${
              isActive
                ? "mt-3 text-3xl"
                : isOther
                ? "mt-4 text-sm"
                : "mt-5 text-2xl"
            }
          `}
        >
          {title}
        </h3>

        <div
          className={`
            w-full overflow-hidden transition-all duration-700
            ${isActive ? "mt-1 max-h-[300px] opacity-100" : "max-h-0 opacity-0"}
          `}
        >
          <p className={`text-sm font-medium ${c.text}`}>{subtitle}</p>

          <ul className="mx-auto mt-3 w-full max-w-[430px] space-y-1.5 text-left text-sm leading-5 text-slate-300">
            {description.map((item, index) => (
              <li key={index} className="flex items-start gap-3">
                <span
                  className={`mt-[7px] h-1.5 w-1.5 flex-shrink-0 rounded-full ${c.bullet}`}
                />
                <span>{item}</span>
              </li>
            ))}
          </ul>

          <div className="mt-4 flex justify-center gap-3">
            <button
              onClick={() => onOpenAuth(type, "login")}
              className="rounded-full border border-white/10 px-6 py-2.5 text-sm font-medium transition hover:bg-white/10"
            >
              Login
            </button>

            <button
              onClick={() => onOpenAuth(type, "signup")}
              className={`flex items-center gap-2 rounded-full bg-gradient-to-r ${c.button} px-6 py-2.5 text-sm font-semibold transition hover:scale-105`}
            >
              Sign Up
              <ArrowRight size={15} />
            </button>
          </div>
        </div>

        {!isActive && !isOther && (
          <p className="mt-3 text-xs text-slate-500">Hover to explore</p>
        )}
      </div>

      <div
        className={`
          pointer-events-none absolute inset-3 rounded-[3rem] border border-white/5 transition-all duration-700
          ${isActive ? "scale-100 opacity-100" : "scale-90 opacity-0"}
        `}
      />
    </div>
  );
}

/* =========================================================
   AUTH MODAL
========================================================= */
function AuthModal({
  portal,
  initialMode,
  onClose,
  onLoginSuccess,
}: {
  portal: NonNullable<Portal>;
  initialMode: AuthMode;
  onClose: () => void;
  onLoginSuccess: (portal: Portal) => void;
}) {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setErrorMsg("");

  const cleanEmail = email.trim().toLowerCase();
  console.log("Placement login check:", {
  portal,
  mode,
  email: cleanEmail,
  passwordLength: password.length,
  });
  
  
if (portal === "recruiter" && mode === "login") {
  if (
    cleanEmail === "recruiter123" &&
    password.trim() === "Recruiter@123"
  ) {
    onLoginSuccess("recruiter");
    onClose();
    return;
  } else {
    setErrorMsg("Invalid recruiter portal username or password.");
    return;
  }
}

  
  if (portal === "placement" && mode === "login") {
    console.log("Password match:", password.trim() === "Test123456");
    if (
      cleanEmail === "campus123" &&
      password.trim() === "Test123456"
    ) {
      onLoginSuccess("placement");
      onClose();
      return;
    } else {
      setErrorMsg("Invalid placement portal email or password.");
      return;
    }
  }


  if (!cleanEmail.includes("@")) {
    setErrorMsg("Please enter a valid email address.");
    return;
  }

  try {
    if (mode === "signup") {
      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: {
            full_name: fullName.trim(),
            portal,
          },
        },
      });

      if (error) {
        setErrorMsg(error.message);
        return;
      }

      if (data.session) {
        onLoginSuccess(portal);
        onClose();
      } else {
        setErrorMsg(
          "Account created. Check your email for confirmation, then log in."
        );
        setMode("login");
      }

      return;
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password,
    });

    if (error) {
      setErrorMsg(error.message);
      return;
    }

    const accountPortal = data.user.user_metadata?.portal;

    if (accountPortal && accountPortal !== portal) {
      await supabase.auth.signOut();
      setErrorMsg("Please select the portal you registered with.");
      return;
    }

    onLoginSuccess(portal);
    onClose();
  }
  catch {
    setErrorMsg("Unable to connect. Please try again.");
  }
  };


  const portalThemes = {
    student: {
      title: "Student Portal",
      accent: "from-blue-500 to-cyan-400",
      btnText: "text-cyan-400",
    },
    placement: {
      title: "Placement Cell",
      accent: "from-purple-500 to-pink-400",
      btnText: "text-purple-400",
    },
    recruiter: {
      title: "Recruiter Portal",
      accent: "from-orange-500 to-pink-400",
      btnText: "text-orange-400",
    },
  };

  const currentTheme = portalThemes[portal];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
      <div className="relative w-full max-w-md rounded-3xl border border-white/10 bg-[#0b0f19] p-8 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-5 top-5 rounded-full p-2 text-slate-400 transition hover:bg-white/10 hover:text-white"
        >
          <X size={20} />
        </button>

        <div className="text-center">
          <span className="text-xs uppercase tracking-widest text-slate-400">
            {currentTheme.title}
          </span>
          <h3 className="mt-1 text-2xl font-bold text-white">
            {mode === "login" ? "Welcome Back" : "Create Account"}
          </h3>
        </div>

        {errorMsg && (
          <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-center text-xs text-red-400 font-medium">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {mode === "signup" && (
            <div>
              <label className="block text-xs text-slate-400 mb-1">
                Full Name
              </label>
              <div className="relative">
                <User
                  size={18}
                  className="absolute left-3.5 top-3 text-slate-500"
                />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 outline-none focus:border-cyan-400"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs text-slate-400 mb-1">
              Email / Username
            </label>
            <div className="relative">
              <Mail
                size={18}
                className="absolute left-3.5 top-3 text-slate-500"
              />
              <input
                type="text"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={
                  portal === "placement"
                    ? "Username "
                    : portal === "recruiter"
                    ? "Username "
                    : portal === "student"
                    ? "Username "
                    : "name@example.com"
                }
                className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1">Password</label>
            <div className="relative">
              <Lock
                size={18}
                className="absolute left-3.5 top-3 text-slate-500"
              />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          <button
            type="submit"
            className={`w-full rounded-xl bg-gradient-to-r ${currentTheme.accent} py-3 text-sm font-semibold text-white shadow-lg transition hover:opacity-90`}
          >
            {mode === "login" ? "Login" : "Sign Up"}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-400">
          {mode === "login" ? (
            <>
              Don&apos;t have an account?{" "}
              <button
                type="button"
                onClick={() => setMode("signup")}
                className={`font-semibold underline ${currentTheme.btnText}`}
              >
                Sign Up
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => setMode("login")}
                className={`font-semibold underline ${currentTheme.btnText}`}
              >
                Login
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
