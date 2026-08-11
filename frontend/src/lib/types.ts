export type TagColor = "cyan" | "amber" | "green" | "red" | "muted";

export interface Signal {
  label: string;
  delta: string;
  color: TagColor;
  text: string;
}

export type SourceMode = "live" | "fallback";

export interface CuratedSource {
  label: string;
  url: string;
  published_at?: string;
}

export interface Stat {
  label: string;
  value: string;
  delta: string;
  up: boolean | null;
  /** Real daily counts from the ingest history, oldest first. Empty until two
   *  days of snapshots exist — render nothing rather than a fake line. */
  series?: number[];
}

export interface Opportunity {
  rank: string;
  title: string;
  domain: string;
  signal: "HIGH" | "MEDIUM" | "LOW";
  fit: number;
  why: string;
  sourced_fact: string;
  editorial_take: string;
  last_verified: string;
  sources: CuratedSource[];
}

export interface Startup {
  name: string;
  stage: string;
  domain: string;
  signal: "Hot" | "Watch" | "Track";
  note: string;
  website?: string;
  sourced_fact: string;
  editorial_take: string;
  last_verified: string;
  sources: CuratedSource[];
}

export interface Role {
  company: string;
  role: string;
  type: string;
  signal: string;
  color: TagColor;
  url?: string;
  tags?: string[];
  last_verified: string;
  sources: CuratedSource[];
}

export interface Paper {
  title: string;
  venue: string;
  tags: string[];
  read: boolean;
  url?: string;
  last_verified: string;
  sources: CuratedSource[];
}

export interface JobListing {
  title: string;
  company: string;
  location: string;
  url: string;
  job_type: string;
  tags: string[];
  source: string;
}

export interface NewsItem {
  title: string;
  url: string;
  source: string;
  published: string;
  tags: string[];
}

export interface Post {
  angle: string;
  text: string;
  tags: string[];
  source_ref?: string;
}

export interface Task {
  id: number | string;
  priority: "P0" | "P1" | "P2";
  task: string;
  domain: string;
  time: string;
  description?: string;
}

export interface Person {
  name: string;
  handle: string;
  url?: string;
  context: string;
  urgency: "Overdue" | "This week" | "Waiting";
  days: number;
}

export interface ConvictionBet {
  label: string;
  conviction: number;
}

export interface UserProfile {
  name: string;
  handle: string;
  domains: string[];
  experience: string;
  goal: string;
  current_projects: string;
}

export interface FlaggedCompany {
  name: string;
  job_count: number;
  tags: string[];
  source: string;
  is_new: boolean;
  roles_preview: string[];
}

export const DOMAINS = [
  "Robotics",
  "Edge AI",
  "Physical AI",
  "Embedded Systems",
  "Generative AI",
  "Startup Ecosystem",
] as const;

export const EXPERIENCE_LEVELS = [
  "Student / Early Career",
  "Mid-level Engineer",
  "Senior Engineer",
  "Staff / Principal",
  "Founder / CTO",
] as const;

export const GOALS = [
  "Land a top job",
  "Build a startup",
  "Stay ahead of the field",
  "Find co-founders / team",
  "Publish research",
] as const;
