import type {
  Signal, Stat, Opportunity, Startup, Role,
  Paper, Post, Task, Person, ConvictionBet,
} from "./types";

export const signals: Signal[] = [
  { label: "Robotics M&A", delta: "+3", color: "cyan", text: "Boston Dynamics licensing talks with Toyota signal $2B+ ecosystem play. Watch actuator IP." },
  { label: "Edge AI Funding", delta: "+7", color: "green", text: "Hailo & Axelera both closing rounds this week. Edge inference silicon heating up post-NPU wars." },
  { label: "Physical AI", delta: "+5", color: "amber", text: "Figure & Apptronik deployment contracts signal commercial humanoid inflection — 2026 is real." },
  { label: "Embedded OS", delta: "+2", color: "muted", text: "Zephyr RTOS gaining traction in medical wearables. FDA 510(k) path clearer than expected." },
];

export const marketPulse =
  "Market pulse: Edge AI inference spend up 38% QoQ. Physical AI talent war intensifying. Embedded startup exits averaging 4.2× — best in 5 years.";

export const stats: Stat[] = [
  { label: "Signals Tracked", value: "2,847", delta: "+124 today", up: true },
  { label: "Opportunities", value: "38", delta: "6 new", up: true },
  { label: "Startups Flagged", value: "142", delta: "+19 this wk", up: true },
  { label: "Hiring Signals", value: "91", delta: "+8 roles", up: true },
  { label: "Research Papers", value: "23", delta: "unread", up: null },
];

export const opportunities: Opportunity[] = [
  { rank: "01", title: "Edge Inference SDK for Industrial Cameras", domain: "Edge AI", signal: "HIGH", fit: 94, why: "No dominant OSS player. $180M TAM in machine vision alone." },
  { rank: "02", title: "Zephyr RTOS → Medical Device Stack", domain: "Embedded", signal: "HIGH", fit: 88, why: "FDA pathway clarified. 3 BD conversations this month." },
  { rank: "03", title: "Humanoid Dexterity Fine-tuning API", domain: "Physical AI", signal: "MEDIUM", fit: 81, why: "Figure, Apptronik, Agility all need this. No API exists yet." },
  { rank: "04", title: "ROS2 ↔ LLM Middleware Bridge", domain: "Robotics", signal: "MEDIUM", fit: 76, why: "Massive community demand. Seen in 47 Discord threads this week." },
  { rank: "05", title: "Startup Radar: Sub-$5M Embedded AI Seed", domain: "Startup", signal: "LOW", fit: 68, why: "Pattern: 3 exits this qtr avg 4.1× in <18mo from seed." },
];

export const startups: Startup[] = [
  { name: "Neuromesh AI", stage: "Pre-Seed", domain: "Edge AI", signal: "Watch", note: "Ex-Qualcomm team. NPU compiler for MCUs. 2 pilots live." },
  { name: "Axon Robotics", stage: "Seed", domain: "Physical AI", signal: "Hot", note: "Dexterous gripper + force-feedback loop. YC W25." },
  { name: "FirmWave", stage: "Series A", domain: "Embedded", signal: "Track", note: "$8M raised. OTA update infra for medical devices." },
  { name: "Morphic Systems", stage: "Stealth", domain: "Robotics", signal: "Watch", note: "Ex-Boston Dynamics. Legged robot perception stack." },
  { name: "Inferix", stage: "Pre-Seed", domain: "Edge AI", signal: "Hot", note: "Vision LLM on RISC-V with <5ms latency. Open beta." },
];

export const roles: Role[] = [
  { company: "Figure", role: "Staff ML Eng — Loco", type: "Full-time", signal: "↑ 3rd hire", color: "amber" },
  { company: "Hailo", role: "Compiler Eng, Edge AI", type: "Remote OK", signal: "New", color: "green" },
  { company: "Apptronik", role: "Embedded Systems Lead", type: "Austin", signal: "Urgent", color: "red" },
  { company: "Axelera AI", role: "Sr. SoC Architect", type: "Amsterdam", signal: "New", color: "green" },
  { company: "Skild AI", role: "Research Eng — Policy", type: "Remote", signal: "↑ 2nd hire", color: "amber" },
];

export const papers: Paper[] = [
  { title: "Diffusion Policies for Dexterous Manipulation at Scale", venue: "arXiv 2025", tags: ["Physical AI", "Policy"], read: false },
  { title: "INT4 Quantization for Transformer Inference on MCUs", venue: "MLSys 2025", tags: ["Edge AI"], read: false },
  { title: "ROS2 Real-Time Guarantees: A Systematic Review", venue: "ICRA 2025", tags: ["Robotics"], read: true },
  { title: "Formal Verification of RTOS Scheduling Under Load", venue: "EMSOFT 2024", tags: ["Embedded"], read: true },
];

export const posts: Post[] = [
  {
    angle: "Take",
    text: "Edge AI inference is hitting an inflection. Hailo, Axelera, Qualcomm AI Hub — the NPU war is moving down-stack to MCUs. Next 18 months: whoever owns the compiler layer owns the market. Watch INT4 quantization tooling.",
    tags: ["EdgeAI", "Embedded", "Semiconductors"],
  },
  {
    angle: "Thread",
    text: "Humanoid robots are real this year — not hype. Here's what the market actually looks like:\n\n1/ Figure raised $675M. First commercial deployment this quarter.\n2/ Apptronik: NASA heritage + Apollo humanoid in warehouses.\n3/ Skild AI: Foundation model for robot policy. The \"GPT moment\" for manipulation.",
    tags: ["Robotics", "PhysicalAI", "Founder"],
  },
  {
    angle: "Contrarian",
    text: "Hot take: ROS2 will not be the OS for commercial robotics at scale. It's a research tool. The real winners will be whoever solves deterministic real-time + OTA updates + fleet management in one stack. Nobody has it yet. That's a company.",
    tags: ["Robotics", "ROS2", "Startups"],
  },
];

export const tasks: Task[] = [
  { id: 1, priority: "P0", task: "Ship edge inference benchmarking harness", domain: "Edge AI", time: "4h" },
  { id: 2, priority: "P0", task: "Draft ROS2–LLM bridge architecture doc", domain: "Robotics", time: "2h" },
  { id: 3, priority: "P1", task: "Profile INT4 quantization on STM32H7", domain: "Embedded", time: "3h" },
  { id: 4, priority: "P1", task: "Read: Diffusion Policies for Dexterous Manip.", domain: "Research", time: "1h" },
  { id: 5, priority: "P2", task: "Explore Hailo-8 SDK & write impressions", domain: "Edge AI", time: "2h" },
];

export const people: Person[] = [
  { name: "Priya Nair", handle: "@priyanair_robotics", context: "Discussed ROS2 bridge collab. Owes me a demo repo.", urgency: "Overdue", days: 8 },
  { name: "Marcus Chen", handle: "@mchen_edgeai", context: "Intro to Hailo BD team pending. Check in.", urgency: "This week", days: 3 },
  { name: "Lena Schwarz", handle: "@lena_embedded", context: "Zephyr RTOS medical stack — potential advisory.", urgency: "This week", days: 5 },
  { name: "Andres Vega", handle: "@andres_physai", context: "He's hiring ML infra at Figure. Resume sent.", urgency: "Waiting", days: 11 },
];

export const weeklyWins = [
  "Published edge inference benchmarks — 240 impressions, 3 DMs from founders.",
  "Connected with Hailo BD lead via Marcus intro.",
  "Completed INT4 quantization prototype — 6ms on H7.",
];

export const weeklyGaps = [
  "No progress on humanoid dexterity API spec.",
  "Missed ICRA deadline for workshop abstract.",
];

export const convictionBets: ConvictionBet[] = [
  { label: "Edge compiler toolchain", conviction: 90 },
  { label: "Physical AI middleware", conviction: 75 },
  { label: "Embedded OS for medical", conviction: 62 },
];

export const nextWeekFocus =
  "Ship the ROS2↔LLM bridge prototype. Publish benchmark thread on X. Book 2 founder coffee chats in Edge AI. Read Diffusion Policies paper end-to-end.";
