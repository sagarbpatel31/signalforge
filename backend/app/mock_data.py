from .schemas import (
    Signal, Stat, Opportunity, Startup, Role,
    Paper, Post, Task, Person, ConvictionBet,
)

MARKET_PULSE = (
    "Edge AI inference spend up 38% QoQ. Physical AI talent war intensifying. "
    "Embedded startup exits averaging 4.2× — best in 5 years."
)

SIGNALS: list[Signal] = [
    Signal(label="Robotics M&A", delta="+3", color="cyan",
           text="Boston Dynamics licensing talks with Toyota signal $2B+ ecosystem play. Watch actuator IP."),
    Signal(label="Edge AI Funding", delta="+7", color="green",
           text="Hailo raised $136M Series C. Axelera closing round. NPU war moving down-stack to MCUs."),
    Signal(label="Physical AI", delta="+5", color="amber",
           text="Figure & Apptronik deployment contracts signal commercial humanoid inflection — 2026 is real."),
    Signal(label="Embedded OS", delta="+2", color="muted",
           text="Zephyr RTOS gaining traction in medical wearables. FDA 510(k) path clearer than expected."),
]

STATS: list[Stat] = [
    Stat(label="Signals Tracked", value="2,847", delta="+124 today", up=True),
    Stat(label="Opportunities", value="38", delta="6 new", up=True),
    Stat(label="Startups Flagged", value="142", delta="+19 this wk", up=True),
    Stat(label="Hiring Signals", value="91", delta="+8 roles", up=True),
    Stat(label="Research Papers", value="23", delta="unread", up=None),
]

OPPORTUNITIES: list[Opportunity] = [
    Opportunity(rank="01", title="Edge Inference SDK for Industrial Cameras",
                domain="Edge AI", signal="HIGH", fit=94,
                why="$180M TAM in machine vision. No dominant OSS player. 3 pilots asking now."),
    Opportunity(rank="02", title="Zephyr RTOS → Medical Device Stack",
                domain="Embedded", signal="HIGH", fit=88,
                why="FDA 510(k) pathway clarified Q1 2026. 3 active BD conversations this month."),
    Opportunity(rank="03", title="Humanoid Dexterity Fine-tuning API",
                domain="Physical AI", signal="MEDIUM", fit=81,
                why="Figure, Apptronik, Agility all need this — no API exists. $50M+ capex waiting."),
    Opportunity(rank="04", title="ROS2 ↔ LLM Middleware Bridge",
                domain="Robotics", signal="MEDIUM", fit=76,
                why="47 Discord threads this week. 12 GitHub issues open. Clear OSS gap."),
    Opportunity(rank="05", title="Sub-$5M Embedded AI Seed",
                domain="Startup", signal="LOW", fit=68,
                why="3 exits this quarter avg 4.1× in <18mo from seed. Pattern repeating."),
]

STARTUPS: list[Startup] = [
    Startup(name="Neuromesh AI", stage="Pre-Seed", domain="Edge AI", signal="Watch",
            note="Ex-Qualcomm team. NPU compiler for MCUs. 2 pilots live."),
    Startup(name="Axon Robotics", stage="Seed", domain="Physical AI", signal="Hot",
            note="Dexterous gripper + force-feedback loop. YC W25."),
    Startup(name="FirmWave", stage="Series A", domain="Embedded", signal="Track",
            note="$8M raised. OTA update infra for medical devices."),
    Startup(name="Inferix", stage="Pre-Seed", domain="Edge AI", signal="Hot",
            note="Vision LLM on RISC-V with <5ms latency. Open beta."),
]

ROLES: list[Role] = [
    Role(company="Figure", role="Staff ML Eng — Loco", type="Full-time", signal="↑ 3rd hire", color="amber"),
    Role(company="Hailo", role="Compiler Eng, Edge AI", type="Remote OK", signal="New", color="green"),
    Role(company="Apptronik", role="Embedded Systems Lead", type="Austin", signal="Urgent", color="red"),
    Role(company="Axelera AI", role="Sr. SoC Architect", type="Amsterdam", signal="New", color="green"),
    Role(company="Skild AI", role="Research Eng — Policy", type="Remote", signal="↑ 2nd hire", color="amber"),
]

PAPERS: list[Paper] = [
    Paper(title="Diffusion Policies for Dexterous Manipulation at Scale",
          venue="arXiv 2025", tags=["Physical AI", "Policy"], read=False,
          url="https://arxiv.org/search/?searchtype=all&query=diffusion+dexterous+manipulation"),
    Paper(title="INT4 Quantization for Transformer Inference on MCUs",
          venue="MLSys 2025", tags=["Edge AI"], read=False,
          url="https://arxiv.org/search/?searchtype=all&query=INT4+quantization+MCU+inference"),
    Paper(title="ROS2 Real-Time Guarantees: A Systematic Review",
          venue="ICRA 2025", tags=["Robotics"], read=True,
          url="https://arxiv.org/search/?searchtype=all&query=ROS2+real+time+guarantees"),
    Paper(title="Formal Verification of RTOS Scheduling Under Load",
          venue="EMSOFT 2024", tags=["Embedded"], read=True,
          url="https://arxiv.org/search/?searchtype=all&query=RTOS+scheduling+formal+verification"),
]

POSTS: list[Post] = [
    Post(
        angle="Take",
        text=(
            "Edge AI inference is hitting an inflection. Hailo raised $136M Series C. "
            "Axelera closing. Qualcomm AI Hub crossed 1M downloads.\n\n"
            "The NPU war is moving down-stack to MCUs. Next 18 months: whoever owns the "
            "compiler layer owns the market.\n\n"
            "INT4 quantization on STM32H7 hit 6ms — real-time on a $4 chip. "
            "This is not a research story anymore."
        ),
        tags=["EdgeAI", "Semiconductors", "EmbeddedAI"],
        source_ref="Hailo Series C Feb 2026 · Axelera round Mar 2026 · QC AI Hub 1M DL Apr 2026",
    ),
    Post(
        angle="Thread",
        text=(
            "Humanoid robots are commercially real in 2026. Here's what the market actually looks like:\n\n"
            "1/ Figure raised $675M. First commercial deployment with BMW this quarter.\n"
            "2/ Apptronik: NASA-heritage Apollo humanoid in warehouse pilots at GXO.\n"
            "3/ Agility Robotics: Digit at Amazon — 500 units ordered.\n"
            "4/ Skild AI: Foundation model for robot policy. The 'GPT moment' for manipulation.\n\n"
            "The dexterity API layer is still wide open. That's the gap."
        ),
        tags=["Robotics", "PhysicalAI", "Startups"],
        source_ref="Figure/BMW Jan 2026 · Agility/Amazon Oct 2025 · Skild raise Dec 2025",
    ),
    Post(
        angle="Contrarian",
        text=(
            "Hot take: ROS2 will not be the OS for commercial robotics at scale.\n\n"
            "It's a research tool — jitter at 10kHz, no deterministic OTA, fleet mgmt bolted on.\n\n"
            "The winner ships: deterministic real-time + secure OTA + fleet telemetry in one stack. "
            "Nobody has it yet. That's a company worth building right now."
        ),
        tags=["Robotics", "ROS2", "Founder"],
        source_ref="ROS2 latency benchmarks ICRA 2025 · Apex.OS vs ROS2 comparison 2025",
    ),
]

TASKS: list[Task] = [
    Task(id=1, priority="P0", task="Apply to Hailo + Inferix — send tailored resume today", domain="Edge AI", time="1h"),
    Task(id=2, priority="P0", task="Complete ROS2 Nav2 tutorial in Gazebo sim", domain="Robotics", time="2h"),
    Task(id=3, priority="P1", task="Run first Isaac Lab policy rollout on Jetson Orin", domain="Physical AI", time="3h"),
    Task(id=4, priority="P1", task="Deploy + benchmark Google Gemma 4 on-device (GGUF)", domain="Edge AI", time="2h"),
    Task(id=5, priority="P1", task="Submit Zephyr RTOS driver PR for medical OTA module", domain="Embedded", time="2h"),
    Task(id=6, priority="P2", task="Publish INT4 benchmark thread on X with data", domain="Edge AI", time="1h"),
]

PEOPLE: list[Person] = [
    Person(name="Priya Nair", handle="@priyanair_robotics", url="https://x.com/priyanair_robotics",
           context="Owes demo repo for ROS2 bridge collab. Send 1-pager first.", urgency="Overdue", days=0),
    Person(name="Marcus Chen", handle="@mchen_edgeai", url="https://x.com/mchen_edgeai",
           context="Hailo BD intro still pending — promised last week.", urgency="This week", days=0),
    Person(name="Lena Schwarz", handle="@lena_embedded", url="https://x.com/lena_embedded",
           context="Zephyr medical stack — confirm advisory interest before she commits elsewhere.", urgency="This week", days=0),
    Person(name="Andres Vega", handle="@andres_physai", url="https://x.com/andres_physai",
           context="ML infra role at Figure. Resume sent — follow up now.", urgency="Overdue", days=0),
]

WEEKLY_WINS = [
    "Completed ROS2 Nav2 stack tutorial — nav through sim obstacle course.",
    "Applied to Hailo Compiler Eng role — referral from Marcus confirmed.",
    "Benchmarked Gemma 4B GGUF on Jetson Orin: 18 tok/s — beats prior baseline.",
]

WEEKLY_GAPS = [
    "Isaac Lab policy rollout blocked — CUDA driver mismatch on Orin, unresolved.",
    "No cold outreach done — need to message 2 Edge AI founders this week.",
]

CONVICTION_BETS: list[ConvictionBet] = [
    ConvictionBet(label="Edge compiler toolchain", conviction=90),
    ConvictionBet(label="Isaac Lab sim-to-real pipeline", conviction=78),
    ConvictionBet(label="Embedded OS for medical devices", conviction=63),
]

NEXT_WEEK_FOCUS = (
    "Fix Isaac Lab CUDA issue + run first policy rollout. "
    "Message 2 Edge AI founders cold. Ship Zephyr OTA PR draft."
)
