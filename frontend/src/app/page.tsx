import { Nav } from "@/components/nav/Nav";
import { Hero } from "@/components/sections/Hero";
import { StatBar } from "@/components/sections/StatBar";
import { TodaysBrief } from "@/components/sections/TodaysBrief";
import { TopOpportunities } from "@/components/sections/TopOpportunities";
import { StartupRadar } from "@/components/sections/StartupRadar";
import { CareerRadar } from "@/components/sections/CareerRadar";
import { ResearchCorner } from "@/components/sections/ResearchCorner";
import { PostOnX } from "@/components/sections/PostOnX";
import { BuildThisWeek } from "@/components/sections/BuildThisWeek";
import { PeopleFollowUp } from "@/components/sections/PeopleFollowUp";
import { WeeklyStrategicReview } from "@/components/sections/WeeklyStrategicReview";
import { Footer } from "@/components/sections/Footer";
import { fetchPosts, fetchTasks, fetchProfile, fetchBrief, fetchPeople } from "@/lib/api";
import { readProfileFile } from "@/lib/server-cache";
import { redirect } from "next/navigation";
import type { UserProfile } from "@/lib/types";

const GAP = 20;

function formatNavDate(): string {
  return new Date().toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getGreeting(hour: number): string {
  if (hour >= 5 && hour < 12) return "Good morning,";
  if (hour >= 12 && hour < 17) return "Good afternoon,";
  if (hour >= 17 && hour < 21) return "Good evening,";
  return "Burning midnight oil,";
}

export default async function DashboardPage() {
  const now = new Date();
  const hour = now.getHours();
  const greeting = getGreeting(hour);
  const navDate = formatNavDate();

  const [profile, posts, tasks, brief, people] = await Promise.all([
    fetchProfile(),
    fetchPosts(),
    fetchTasks(),
    fetchBrief(),
    fetchPeople(),
  ]);

  const resolvedProfile: UserProfile | null = profile ?? readProfileFile<UserProfile>();
  if (!resolvedProfile) redirect("/onboarding");

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <Nav date={navDate} userName={resolvedProfile!.name} />

      {/* Subtle dot-grid background */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 0,
          pointerEvents: "none",
          backgroundImage:
            "radial-gradient(circle, var(--hairline) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
          opacity: 0.6,
        }}
      />

      <main
        style={{
          position: "relative",
          zIndex: 1,
          maxWidth: 1320,
          margin: "0 auto",
          padding: "32px 28px 0",
        }}
      >
        {/* Hero */}
        <div className="fade-up fade-up-1">
          <Hero userName={resolvedProfile!.name} brief={brief} greeting={greeting} />
        </div>

        {/* Stat bar */}
        <div className="fade-up fade-up-1">
          <StatBar />
        </div>

        {/* Today's Brief */}
        <div className="fade-up fade-up-2" style={{ marginBottom: GAP }}>
          <TodaysBrief initialBrief={brief} />
        </div>

        {/* Skills × Targets */}
        <div className="fade-up fade-up-2" style={{ marginBottom: GAP }}>
          <TopOpportunities />
        </div>

        {/* Row: Startup · Career · Research */}
        <div
          className="fade-up fade-up-3"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: GAP,
            marginBottom: GAP,
          }}
        >
          <StartupRadar />
          <CareerRadar />
          <ResearchCorner />
        </div>

        {/* Row: Post · Build · People */}
        <div
          className="fade-up fade-up-4"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: GAP,
            marginBottom: GAP,
          }}
        >
          <PostOnX posts={posts} />
          <BuildThisWeek tasks={tasks} />
          <PeopleFollowUp people={people} />
        </div>

        {/* Weekly Review */}
        <div className="fade-up fade-up-5" style={{ marginBottom: GAP }}>
          <WeeklyStrategicReview />
        </div>

        <Footer />
      </main>
    </div>
  );
}
