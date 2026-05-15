"use client";

import { useState, useEffect } from "react";
import { SfCard } from "@/components/ui/sf-card";
import { SectionLabel } from "@/components/ui/section-label";
import { SfTag } from "@/components/ui/sf-tag";
import type { Person, TagColor } from "@/lib/types";

// ── Full pool of 52 people ─────────────────────────────────────────────────
const FULL_POOL: Person[] = [
  { name: "Lerrel Pinto",      handle: "@lerrelpinto",      url: "https://x.com/lerrelpinto",      context: "NYU. Dexterous manipulation + robot learning. ACT paper author.",                        urgency: "This week", days: 0 },
  { name: "Pieter Abbeel",     handle: "@pabbeel",          url: "https://x.com/pabbeel",          context: "Berkeley AI Research + Covariant founder. Robot learning pioneer.",                     urgency: "This week", days: 0 },
  { name: "Russ Tedrake",      handle: "@RussTedrake",      url: "https://x.com/RussTedrake",      context: "MIT + Drake framework. Planning + manipulation. Must-follow for robotics.",              urgency: "This week", days: 0 },
  { name: "Georgi Gerganov",   handle: "@ggerganov",        url: "https://x.com/ggerganov",        context: "Creator of llama.cpp. Core follow for edge inference + on-device LLMs.",                urgency: "This week", days: 0 },
  { name: "Tim Dettmers",      handle: "@Tim_Dettmers",     url: "https://x.com/Tim_Dettmers",     context: "Quantization researcher (bitsandbytes, GPTQ). INT4/INT8 authority.",                    urgency: "This week", days: 0 },
  { name: "Jeremy Howard",     handle: "@jeremyphoward",    url: "https://x.com/jeremyphoward",    context: "fast.ai founder. Practical deep learning + on-device deployment.",                      urgency: "This week", days: 0 },
  { name: "Sergey Levine",     handle: "@svlevine",         url: "https://x.com/svlevine",         context: "Berkeley. Offline RL (IQL, CQL) + robot learning at scale. RT-2 co-author.",           urgency: "This week", days: 0 },
  { name: "Chelsea Finn",      handle: "@chelseabfinn",     url: "https://x.com/chelseabfinn",     context: "Stanford. MAML inventor. Meta-learning + few-shot robot policy research.",              urgency: "This week", days: 0 },
  { name: "Yann LeCun",        handle: "@ylecun",           url: "https://x.com/ylecun",           context: "Meta Chief AI Scientist. Self-supervised learning + world models for robotics.",        urgency: "This week", days: 0 },
  { name: "Fei-Fei Li",        handle: "@drfeifei",         url: "https://x.com/drfeifei",         context: "Stanford HAI. ImageNet + spatial intelligence. World Labs founder.",                    urgency: "This week", days: 0 },
  { name: "Deepak Pathak",     handle: "@pathak2206",       url: "https://x.com/pathak2206",       context: "CMU. Curiosity-driven exploration + world models. Generalist robot policies.",          urgency: "This week", days: 0 },
  { name: "Raquel Urtasun",    handle: "@rurtasun",         url: "https://x.com/rurtasun",         context: "Waabi CEO + Toronto professor. AV perception + neural map learning.",                   urgency: "This week", days: 0 },
  { name: "Ken Goldberg",      handle: "@ken_goldberg",     url: "https://x.com/ken_goldberg",     context: "Berkeley. Robot grasping + automation. Cloud robotics + AI for industry.",             urgency: "This week", days: 0 },
  { name: "Matei Zaharia",     handle: "@matei_zaharia",    url: "https://x.com/matei_zaharia",    context: "Databricks CTO + Stanford. MLflow, Spark, LLM infra. Key for ML systems.",            urgency: "This week", days: 0 },
  { name: "Sasha Rush",        handle: "@srush_nlp",        url: "https://x.com/srush_nlp",        context: "Cornell + HuggingFace. Annotated Transformer author. Edge-friendly LLM arch.",         urgency: "This week", days: 0 },
  { name: "Chris Lattner",     handle: "@clattner_llvm",    url: "https://x.com/clattner_llvm",    context: "LLVM + Swift creator, Modular CEO. MLIR + Mojo for AI compiler toolchains.",           urgency: "This week", days: 0 },
  { name: "Clem Delangue",     handle: "@ClementDelangue",  url: "https://x.com/ClementDelangue",  context: "HuggingFace CEO. Open-source models + on-device deployment ecosystem.",                urgency: "This week", days: 0 },
  { name: "Jim Keller",        handle: "@jimkxa",           url: "https://x.com/jimkxa",           context: "Tenstorrent CEO. Legendary chip architect (AMD K8, Apple A4, Tesla FSD). RISC-V AI.", urgency: "This week", days: 0 },
  { name: "Andrej Karpathy",   handle: "@karpathy",         url: "https://x.com/karpathy",         context: "Ex-OpenAI/Tesla. Neural nets for vision + autonomy. Educator + builder.",              urgency: "This week", days: 0 },
  { name: "Ilya Sutskever",    handle: "@ilyasut",          url: "https://x.com/ilyasut",          context: "SSI co-founder. GPT-4 co-creator. Safe superintelligence research.",                   urgency: "This week", days: 0 },
  { name: "George Hotz",       handle: "@realgeorgehotz",   url: "https://x.com/realgeorgehotz",   context: "comma.ai founder. Open-source autonomy (openpilot). Edge ML hacker.",                  urgency: "This week", days: 0 },
  { name: "Emad Mostaque",     handle: "@EMostaque",        url: "https://x.com/EMostaque",        context: "Stability AI founder. Open diffusion models + community AI infrastructure.",            urgency: "This week", days: 0 },
  { name: "Abigail Vieregg",   handle: "@abigailvieregg",   url: "https://x.com/abigailvieregg",   context: "CMU Robotics Institute. Mobile manipulation + whole-body loco-manipulation.",          urgency: "This week", days: 0 },
  { name: "Ben Recht",         handle: "@beenwrekt",        url: "https://x.com/beenwrekt",        context: "Berkeley. ML theory + control. Critical takes on benchmark generalization.",            urgency: "This week", days: 0 },
  { name: "Hao Zhang",         handle: "@HaoZhang_AI",      url: "https://x.com/HaoZhang_AI",      context: "CMU + Inf-ML. LLM efficiency, quantization, distributed training.",                    urgency: "This week", days: 0 },
  { name: "Song Han",          handle: "@songhan_mit",      url: "https://x.com/songhan_mit",      context: "MIT. Neural network compression, TinyML, MCUNet. Edge AI authority.",                  urgency: "This week", days: 0 },
  { name: "Pete Florence",     handle: "@peteflo",          url: "https://x.com/peteflo",          context: "Google DeepMind. RT-1, RT-2, SayCan. Robot learning from large models.",               urgency: "This week", days: 0 },
  { name: "Dorsa Sadigh",      handle: "@DorsaSadigh",      url: "https://x.com/DorsaSadigh",      context: "Stanford. Human-robot interaction + ILIAD. Safe autonomy + learning from humans.",     urgency: "This week", days: 0 },
  { name: "Marco Pavone",      handle: "@marco_pavone",     url: "https://x.com/marco_pavone",     context: "Stanford + NVIDIA Research. Robot autonomy, risk-aware planning, sim-to-real.",        urgency: "This week", days: 0 },
  { name: "Dieter Fox",        handle: "@DieterFox",        url: "https://x.com/DieterFox",        context: "UW + NVIDIA. Robot perception, SLAM, object tracking, manipulation.",                  urgency: "This week", days: 0 },
  { name: "Animesh Garg",      handle: "@animesh_garg",     url: "https://x.com/animesh_garg",     context: "Toronto + Vector Institute. Robot learning, imitation, surgical robotics.",            urgency: "This week", days: 0 },
  { name: "Emo Todorov",       handle: "@emotorov",         url: "https://x.com/emotorov",         context: "MuJoCo creator. Physics simulation + contact-rich manipulation.",                      urgency: "This week", days: 0 },
  { name: "Jeannette Bohg",    handle: "@JBohg",            url: "https://x.com/JBohg",            context: "Stanford. Perception for robot manipulation. Tactile sensing + grasping.",             urgency: "This week", days: 0 },
  { name: "Olivier Grisel",    handle: "@ogrisel",          url: "https://x.com/ogrisel",          context: "scikit-learn core dev. ML engineering practice + edge deployment.",                    urgency: "This week", days: 0 },
  { name: "Weights & Biases",  handle: "@weights_biases",   url: "https://x.com/weights_biases",   context: "ML experiment tracking. Robotics + RL training visibility tool.",                      urgency: "This week", days: 0 },
  { name: "Siqi Liu",          handle: "@siqiliu_ai",       url: "https://x.com/siqiliu_ai",       context: "Physical Intelligence (π) engineer. Robot learning + dexterous manipulation.",         urgency: "This week", days: 0 },
  { name: "Adithya Murali",    handle: "@adithyamurali",    url: "https://x.com/adithyamurali",    context: "Berkeley. Manipulation + contact planning. TAMP + learning-based methods.",           urgency: "This week", days: 0 },
  { name: "Tony Zhao",         handle: "@tonyzhaovsky",     url: "https://x.com/tonyzhaovsky",     context: "Stanford + Physical Intelligence. ACT author. Dexterous bimanual manipulation.",       urgency: "This week", days: 0 },
  { name: "Roboflow",          handle: "@RoboflowAI",       url: "https://x.com/RoboflowAI",       context: "Computer vision tooling for robotics. Dataset labeling + model deployment.",           urgency: "This week", days: 0 },
  { name: "Foxglove Studio",   handle: "@foxglovedev",      url: "https://x.com/foxglovedev",      context: "ROS2 visualization + robotics dev tools. Key for ROS2 debugging workflows.",           urgency: "This week", days: 0 },
  { name: "Luca Carlone",      handle: "@lucacarlone1",     url: "https://x.com/lucacarlone1",     context: "MIT. SLAM, scene understanding, spatial AI. Kimera SLAM author.",                     urgency: "This week", days: 0 },
  { name: "Louis Fortier",     handle: "@louis_fortier_",   url: "https://x.com/louis_fortier_",   context: "Wayve + AV + neural rendering. BEV perception for autonomous driving.",               urgency: "This week", days: 0 },
  { name: "Vikash Kumar",      handle: "@vikashplus",       url: "https://x.com/vikashplus",       context: "Meta AI. Dexterous hand manipulation (DAPG, RRL). Multi-finger control.",             urgency: "This week", days: 0 },
  { name: "Shuran Song",       handle: "@shuransong",       url: "https://x.com/shuransong",       context: "Stanford. Robotic manipulation + grasping. ZeroShot transfer + sim2real.",             urgency: "This week", days: 0 },
  { name: "Karol Hausman",     handle: "@karolhausman",     url: "https://x.com/karolhausman",     context: "Google DeepMind. Generalist policies, SayCan, robot-language grounding.",             urgency: "This week", days: 0 },
  { name: "Roberto Calandra",  handle: "@rcalandra90",      url: "https://x.com/rcalandra90",      context: "TU Dresden. Tactile sensing + model-based RL for dexterous manipulation.",            urgency: "This week", days: 0 },
  { name: "Aleksandra Faust",  handle: "@afaust_rl",        url: "https://x.com/afaust_rl",        context: "Google Brain. RL for navigation, safety, long-horizon robot planning.",               urgency: "This week", days: 0 },
  { name: "Akira Baruah",      handle: "@akira_baruah",     url: "https://x.com/akira_baruah",     context: "Embedded ML engineer. MCU firmware + TensorFlow Lite Micro practitioner.",            urgency: "This week", days: 0 },
  { name: "Jim Fan",           handle: "@DrJimFan",         url: "https://x.com/DrJimFan",         context: "NVIDIA. Foundation models for embodied AI. Groot + GROOT-N1 architect.",              urgency: "This week", days: 0 },
  { name: "Nvidia Isaac",      handle: "@NVIDIAIsaac",      url: "https://x.com/NVIDIAIsaac",      context: "NVIDIA Isaac Lab + Cosmos. Robot simulation + synthetic data generation.",             urgency: "This week", days: 0 },
  { name: "Theophile Gervet",  handle: "@tgervet",          url: "https://x.com/tgervet",          context: "CMU. Generative modeling for robot plans + contact-rich manipulation.",               urgency: "This week", days: 0 },
  { name: "Shreyas Skandan",   handle: "@ShreyasSkandan",   url: "https://x.com/ShreyasSkandan",   context: "UPenn. Aerial + ground robot navigation. GPU-accelerated SLAM + planning.",           urgency: "This week", days: 0 },
];

const BATCH_SIZE = 6; // show 6 people at a time
const ROTATION_DAYS = 2; // rotate every 2 days
const LS_KEY = "sf-followed-people"; // localStorage key

// Gradient presets for avatars
const GRADS = [
  "linear-gradient(135deg, var(--blue-soft), var(--purple-soft))",
  "linear-gradient(135deg, var(--green-soft), var(--blue-soft))",
  "linear-gradient(135deg, var(--orange-soft), var(--pink-soft))",
  "linear-gradient(135deg, var(--purple-soft), var(--pink-soft))",
];

function urgencyColor(u: string): TagColor {
  if (u === "Overdue") return "red";
  if (u === "This week") return "amber";
  return "muted";
}

function avatarInitials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

/** Day-of-year (1-366) */
function dayOfYear(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  return Math.floor(diff / 86_400_000);
}

/** Pick BATCH_SIZE people from pool, rotating every ROTATION_DAYS, skipping followed handles */
function pickBatch(followedHandles: Set<string>): Person[] {
  const available = FULL_POOL.filter((p) => !followedHandles.has(p.handle));
  if (available.length === 0) return [];
  const period = Math.floor(dayOfYear() / ROTATION_DAYS);
  const start = (period * BATCH_SIZE) % available.length;
  const batch: Person[] = [];
  for (let i = 0; i < BATCH_SIZE && batch.length < Math.min(BATCH_SIZE, available.length); i++) {
    batch.push(available[(start + i) % available.length]);
  }
  return batch;
}

export function PeopleFollowUp({ people: _initialPeople }: { people: Person[] }) {
  const [followedHandles, setFollowedHandles] = useState<Set<string>>(() => {
    if (typeof window === "undefined") return new Set();
    try {
      const stored = localStorage.getItem(LS_KEY);
      return stored ? new Set(JSON.parse(stored) as string[]) : new Set();
    } catch {
      return new Set();
    }
  });

  const [showFollowed, setShowFollowed] = useState(false);

  // Persist to localStorage whenever followedHandles changes
  useEffect(() => {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(Array.from(followedHandles)));
    } catch {
      // storage unavailable
    }
  }, [followedHandles]);

  function markFollowed(handle: string) {
    setFollowedHandles((prev) => {
      const next = new Set(prev);
      next.add(handle);
      return next;
    });
  }

  // Current batch and followed list
  const batch = pickBatch(followedHandles);
  const followedPeople = FULL_POOL.filter((p) => followedHandles.has(p.handle));

  const visible = showFollowed ? [...batch, ...followedPeople] : batch;

  return (
    <SfCard>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 4,
        }}
      >
        <SectionLabel icon="👥">People to Follow</SectionLabel>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {followedHandles.size > 0 && (
            <button
              onClick={() => setShowFollowed((v) => !v)}
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 10,
                color: "var(--text-3)",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                letterSpacing: "0.04em",
              }}
            >
              {showFollowed ? "hide followed" : `+${followedHandles.size} followed`}
            </button>
          )}
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              color: "var(--text-4)",
              letterSpacing: "0.04em",
            }}
          >
            rotates every 2d
          </span>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column" }}>
        {visible.map((p, idx) => {
          const isFollowed = followedHandles.has(p.handle);
          return (
            <div
              key={p.handle}
              style={{
                padding: "11px 0",
                borderBottom:
                  idx < visible.length - 1 ? "1px solid var(--hairline)" : "none",
                opacity: isFollowed ? 0.4 : 1,
                transition: "opacity 0.2s",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 3,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  {/* Gradient avatar */}
                  <div
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: "50%",
                      background: GRADS[idx % GRADS.length],
                      border: "1px solid var(--hairline-strong)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontFamily: "var(--font-mono)",
                      fontSize: 10,
                      fontWeight: 700,
                      color: "var(--blue)",
                      flexShrink: 0,
                    }}
                  >
                    {avatarInitials(p.name)}
                  </div>
                  <div>
                    {p.url ? (
                      <a
                        href={p.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          fontWeight: 600,
                          fontSize: 13,
                          color: "var(--text)",
                          textDecoration: isFollowed ? "line-through" : "none",
                          display: "block",
                        }}
                      >
                        {p.name}
                      </a>
                    ) : (
                      <span
                        style={{ fontWeight: 600, fontSize: 13, color: "var(--text)" }}
                      >
                        {p.name}
                      </span>
                    )}
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: 10,
                        color: "var(--blue)",
                      }}
                    >
                      {p.handle}
                    </span>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  {!isFollowed && (
                    <SfTag color={urgencyColor(p.urgency)}>{p.urgency}</SfTag>
                  )}
                  <button
                    onClick={() => !isFollowed && markFollowed(p.handle)}
                    disabled={isFollowed}
                    className="btn btn-blue"
                    style={{
                      padding: "3px 10px",
                      fontSize: 10,
                      borderRadius: 999,
                      background: isFollowed
                        ? "var(--green-soft)"
                        : "var(--blue-soft)",
                      border: isFollowed
                        ? "1px solid oklch(0.78 0.15 155 / 0.3)"
                        : "1px solid oklch(0.72 0.16 245 / 0.35)",
                      color: isFollowed ? "var(--green)" : "var(--blue)",
                      cursor: isFollowed ? "default" : "pointer",
                    }}
                  >
                    {isFollowed ? "✓ Followed" : "Follow →"}
                  </button>
                </div>
              </div>

              <div
                style={{
                  fontSize: 12,
                  color: "var(--text-2)",
                  lineHeight: 1.4,
                  paddingLeft: 44,
                }}
              >
                {p.context}
              </div>
            </div>
          );
        })}

        {batch.length === 0 && followedHandles.size > 0 && !showFollowed && (
          <div
            style={{
              padding: "20px 0",
              textAlign: "center",
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              color: "var(--text-4)",
            }}
          >
            You've followed everyone in the current batch.
            <br />
            New suggestions rotate in 2 days.
          </div>
        )}
      </div>
    </SfCard>
  );
}
