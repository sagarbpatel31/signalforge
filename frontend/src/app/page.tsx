import { Nav } from "@/components/nav/Nav";
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
import { fetchPosts, fetchTasks, fetchProfile } from "@/lib/api";
import { redirect } from "next/navigation";

const GAP = 18;

export default async function DashboardPage() {
  const [profile, posts, tasks] = await Promise.all([
    fetchProfile(),
    fetchPosts(),
    fetchTasks(),
  ]);

  if (!profile) redirect("/onboarding");

  return (
    <div style={{ minHeight: "100vh", background: "var(--sf-bg)" }}>
      <Nav date="May 1, 2026" userName={profile.name} />

      {/* Subtle background grid texture */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 0,
          pointerEvents: "none",
          backgroundImage:
            "linear-gradient(var(--sf-border-subtle) 1px, transparent 1px), linear-gradient(90deg, var(--sf-border-subtle) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          opacity: 0.3,
        }}
      />

      <main
        style={{
          position: "relative",
          zIndex: 1,
          maxWidth: 1280,
          margin: "0 auto",
          padding: `24px 24px 60px`,
        }}
      >
        {/* Stat bar */}
        <div className="fade-up fade-up-1">
          <StatBar />
        </div>

        {/* Row 1: Today's Brief */}
        <div className="fade-up fade-up-2" style={{ marginBottom: GAP }}>
          <TodaysBrief />
        </div>

        {/* Row 2: Top Opportunities */}
        <div className="fade-up fade-up-2" style={{ marginBottom: GAP }}>
          <TopOpportunities />
        </div>

        {/* Row 3: Startup Radar · Career Radar · Research Corner */}
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

        {/* Row 4: Post on X · Build This Week · People */}
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
          <PeopleFollowUp />
        </div>

        {/* Row 5: Weekly Strategic Review */}
        <div className="fade-up fade-up-5">
          <WeeklyStrategicReview />
        </div>
      </main>
    </div>
  );
}
