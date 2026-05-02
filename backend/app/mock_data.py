from .schemas import (
    Signal, Stat, Opportunity, Startup, Role,
    Paper, Post, Task, Person, ConvictionBet,
)

MARKET_PULSE = (
    "Market pulse: Edge AI inference spend up 38% QoQ. "
    "Physical AI talent war intensifying. "
    "Embedded startup exits averaging 4.2× — best in 5 years."
)

SIGNALS: list[Signal] = [
    Signal(label="Robotics M&A", delta="+3", color="cyan",
           text="Boston Dynamics licensing talks with Toyota signal $2B+ ecosystem play. Watch actuator IP."),
    Signal(label="Edge AI Funding", delta="+7", color="green",
           text="Hailo & Axelera both closing rounds this week. Edge inference silicon heating up post-NPU wars."),
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
    Opportunity(rank="01", title="Edge Inference SDK for Industrial Cameras", domain="Edge AI",
                signal="HIGH", fit=94, why="No dominant OSS player. $180M TAM in machine vision alone."),
    Opportunity(rank="02", title="Zephyr RTOS → Medical Device Stack", domain="Embedded",
                signal="HIGH", fit=88, why="FDA pathway clarified. 3 BD conversations this month."),
    Opportunity(rank="03", title="Humanoid Dexterity Fine-tuning API", domain="Physical AI",
                signal="MEDIUM", fit=81, why="Figure, Apptronik, Agility all need this. No API exists yet."),
    Opportunity(rank="04", title="ROS2 ↔ LLM Middleware Bridge", domain="Robotics",
                signal="MEDIUM", fit=76, why="Massive community demand. Seen in 47 Discord threads this week."),
    Opportunity(rank="05", title="Startup Radar: Sub-$5M Embedded AI Seed", domain="Startup",
                signal="LOW", fit=68, why="Pattern: 3 exits this qtr avg 4.1× in <18mo from seed."),
]

STARTUPS: list[Startup] = [
    Startup(name="Neuromesh AI", stage="Pre-Seed", domain="Edge AI", signal="Watch",
            note="Ex-Qualcomm team. NPU compiler for MCUs. 2 pilots live."),
    Startup(name="Axon Robotics", stage="Seed", domain="Physical AI", signal="Hot",
            note="Dexterous gripper + force-feedback loop. YC W25."),
    Startup(name="FirmWave", stage="Series A", domain="Embedded", signal="Track",
            note="$8M raised. OTA update infra for medical devices."),
    Startup(name="Morphic Systems", stage="Stealth", domain="Robotics", signal="Watch",
            note="Ex-Boston Dynamics. Legged robot perception stack."),
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
          venue="arXiv 2025", tags=["Physical AI", "Policy"], read=False),
    Paper(title="INT4 Quantization for Transformer Inference on MCUs",
          venue="MLSys 2025", tags=["Edge AI"], read=False),
    Paper(title="ROS2 Real-Time Guarantees: A Systematic Review",
          venue="ICRA 2025", tags=["Robotics"], read=True),
    Paper(title="Formal Verification of RTOS Scheduling Under Load",
          venue="EMSOFT 2024", tags=["Embedded"], read=True),
]

POSTS: list[Post] = [
    Post(
        angle="Take",
        text=(
            "Edge AI inference is hitting an inflection. Hailo, Axelera, Qualcomm AI Hub — "
            "the NPU war is moving down-stack to MCUs. Next 18 months: whoever owns the "
            "compiler layer owns the market. Watch INT4 quantization tooling."
        ),
        tags=["EdgeAI", "Embedded", "Semiconductors"],
    ),
    Post(
        angle="Thread",
        text=(
            "Humanoid robots are real this year — not hype. Here's what the market actually looks like:\n\n"
            "1/ Figure raised $675M. First commercial deployment this quarter.\n"
            "2/ Apptronik: NASA heritage + Apollo humanoid in warehouses.\n"
            "3/ Skild AI: Foundation model for robot policy. The \"GPT moment\" for manipulation."
        ),
        tags=["Robotics", "PhysicalAI", "Founder"],
    ),
    Post(
        angle="Contrarian",
        text=(
            "Hot take: ROS2 will not be the OS for commercial robotics at scale. It's a research tool. "
            "The real winners will be whoever solves deterministic real-time + OTA updates + fleet "
            "management in one stack. Nobody has it yet. That's a company."
        ),
        tags=["Robotics", "ROS2", "Startups"],
    ),
]

TASKS: list[Task] = [
    Task(id=1, priority="P0", task="Ship edge inference benchmarking harness", domain="Edge AI", time="4h"),
    Task(id=2, priority="P0", task="Draft ROS2–LLM bridge architecture doc", domain="Robotics", time="2h"),
    Task(id=3, priority="P1", task="Profile INT4 quantization on STM32H7", domain="Embedded", time="3h"),
    Task(id=4, priority="P1", task="Read: Diffusion Policies for Dexterous Manip.", domain="Research", time="1h"),
    Task(id=5, priority="P2", task="Explore Hailo-8 SDK & write impressions", domain="Edge AI", time="2h"),
]

PEOPLE: list[Person] = [
    Person(name="Priya Nair", handle="@priyanair_robotics",
           context="Discussed ROS2 bridge collab. Owes me a demo repo.", urgency="Overdue", days=8),
    Person(name="Marcus Chen", handle="@mchen_edgeai",
           context="Intro to Hailo BD team pending. Check in.", urgency="This week", days=3),
    Person(name="Lena Schwarz", handle="@lena_embedded",
           context="Zephyr RTOS medical stack — potential advisory.", urgency="This week", days=5),
    Person(name="Andres Vega", handle="@andres_physai",
           context="He's hiring ML infra at Figure. Resume sent.", urgency="Waiting", days=11),
]

WEEKLY_WINS = [
    "Published edge inference benchmarks — 240 impressions, 3 DMs from founders.",
    "Connected with Hailo BD lead via Marcus intro.",
    "Completed INT4 quantization prototype — 6ms on H7.",
]

WEEKLY_GAPS = [
    "No progress on humanoid dexterity API spec.",
    "Missed ICRA deadline for workshop abstract.",
]

CONVICTION_BETS: list[ConvictionBet] = [
    ConvictionBet(label="Edge compiler toolchain", conviction=90),
    ConvictionBet(label="Physical AI middleware", conviction=75),
    ConvictionBet(label="Embedded OS for medical", conviction=62),
]

NEXT_WEEK_FOCUS = (
    "Ship the ROS2↔LLM bridge prototype. Publish benchmark thread on X. "
    "Book 2 founder coffee chats in Edge AI. Read Diffusion Policies paper end-to-end."
)
