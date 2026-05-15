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
    Opportunity(rank="01", title="TinyML / INT4 Quantization",
                domain="Edge AI", signal="HIGH", fit=94,
                why="Target: Hailo, Axelera AI, Tenstorrent, Etched → Compiler / Inference Eng roles"),
    Opportunity(rank="02", title="ROS2 + Nav2 + Gazebo",
                domain="Robotics", signal="HIGH", fit=88,
                why="Target: Figure, Agility, Apptronik, Boston Dynamics → Robotics SW Eng"),
    Opportunity(rank="03", title="NVIDIA Isaac Lab / Sim-to-Real RL",
                domain="Physical AI", signal="HIGH", fit=85,
                why="Target: Physical Intelligence, Skild AI, 1X, Covariant → ML Policy Eng"),
    Opportunity(rank="04", title="Zephyr RTOS / Embedded Firmware",
                domain="Embedded", signal="MEDIUM", fit=79,
                why="Target: Memfault, Nordic Semi, medical device startups → Embedded SW Eng"),
    Opportunity(rank="05", title="Vision LLM / On-Device Multimodal",
                domain="Edge AI", signal="MEDIUM", fit=72,
                why="Target: Waymo, Motional, Wayve, Helsing → Perception / ML Eng roles"),
]

STARTUPS: list[Startup] = [
    Startup(name="Physical Intelligence", stage="Series B", domain="Physical AI", signal="Hot",
            note="Robot foundation models. $400M raised. Ex-Google Brain/DeepMind team.",
            website="https://physicalintelligence.company"),
    Startup(name="Skild AI", stage="Series A", domain="Physical AI", signal="Hot",
            note="Generalist robot brain — GPT moment for manipulation. CMU/Meta spinout.",
            website="https://skild.ai"),
    Startup(name="Hailo", stage="Series C", domain="Edge AI", signal="Hot",
            note="$136M Series C. Hailo-8L NPU shipping in cameras, drones, edge boxes.",
            website="https://hailo.ai"),
    Startup(name="Axelera AI", stage="Series B", domain="Edge AI", signal="Hot",
            note="In-memory compute chip, 214 TOPS/$. Closing round now. Amsterdam.",
            website="https://axelera.ai"),
    Startup(name="1X Technologies", stage="Series B", domain="Physical AI", signal="Watch",
            note="Humanoid NEO. OpenAI-backed. Commercial pilots in 2026.",
            website="https://1x.tech"),
    Startup(name="Covariant", stage="Series C", domain="Robotics", signal="Hot",
            note="Foundation model for pick-and-place. $75M Series C, Amazon partnership.",
            website="https://covariant.ai"),
    Startup(name="Memfault", stage="Series B", domain="Embedded", signal="Watch",
            note="Embedded observability + OTA platform. 250+ device companies on platform.",
            website="https://memfault.com"),
    Startup(name="Tenstorrent", stage="Series C", domain="Edge AI", signal="Watch",
            note="RISC-V AI chip. Jim Keller CEO. $693M raised. Edge + cloud inference.",
            website="https://tenstorrent.com"),
    Startup(name="Agility Robotics", stage="Series B", domain="Physical AI", signal="Track",
            note="Digit humanoid. 500 units ordered by Amazon. GXO warehouse pilots.",
            website="https://agilityrobotics.com"),
    Startup(name="Apptronik", stage="Series A", domain="Physical AI", signal="Track",
            note="Apollo humanoid. NASA heritage. GXO logistics deployment.",
            website="https://apptronik.com"),
    Startup(name="Etched", stage="Seed", domain="Edge AI", signal="Watch",
            note="Transformer-only ASIC (Sohu). 144M TOPS. Beats H100 for inference.",
            website="https://etched.com"),
    Startup(name="Neuromesh AI", stage="Pre-Seed", domain="Edge AI", signal="Watch",
            note="Ex-Qualcomm team. NPU compiler for MCUs. 2 pilots live.",
            website=""),
    Startup(name="FirmWave", stage="Series A", domain="Embedded", signal="Track",
            note="$8M raised. OTA update infra for medical devices.",
            website=""),
    Startup(name="Inferix", stage="Pre-Seed", domain="Edge AI", signal="Hot",
            note="Vision LLM on RISC-V with <5ms latency. Open beta.",
            website=""),
    # From Google Sheet watchlist — robotics & embedded companies
    Startup(name="Collaborative Robotics", stage="Series A", domain="Robotics", signal="Hot",
            note="Cobot platform for unstructured warehouse environments. Ex-Apple robotics team.",
            website="https://collaborativerobotics.com"),
    Startup(name="Gecko Robotics", stage="Series B", domain="Robotics", signal="Watch",
            note="Inspection robots for industrial infrastructure. $100M+ raised.",
            website="https://geckorobotics.com"),
    Startup(name="Field AI", stage="Seed", domain="Robotics", signal="Watch",
            note="AI for autonomous field robotics — oil & gas, mining, defense.",
            website="https://field.ai"),
    Startup(name="Dexterity", stage="Series B", domain="Physical AI", signal="Watch",
            note="AI-powered robotic arms for warehouse picking. $140M raised.",
            website="https://dexterity.ai"),
    Startup(name="Dusty Robotics", stage="Series B", domain="Robotics", signal="Track",
            note="Robotic layout printing for construction sites. $45M raised.",
            website="https://dustyrobotics.com"),
    Startup(name="Scythe Robotics", stage="Series B", domain="Robotics", signal="Track",
            note="Fully electric autonomous commercial mowers. $42M raised.",
            website="https://scytherobotics.com"),
    Startup(name="Built Robotics", stage="Series C", domain="Robotics", signal="Track",
            note="AI guidance for construction equipment. Excavators, bulldozers.",
            website="https://builtrobotics.com"),
    Startup(name="Carbon Robotics", stage="Series C", domain="Robotics", signal="Watch",
            note="Autonomous laser weeding robots for agriculture. $70M Series C.",
            website="https://carbonrobotics.com"),
    Startup(name="Robust.AI", stage="Series A", domain="Robotics", signal="Watch",
            note="Carter: warehouse cobot platform. Founded by Rodney Brooks (iRobot).",
            website="https://robust.ai"),
    Startup(name="Applied Intuition", stage="Series E", domain="Edge AI", signal="Hot",
            note="Simulation + toolchain for AV/robotics validation. $1.5B valuation.",
            website="https://appliedintuition.com"),
    Startup(name="Shield AI", stage="Series F", domain="Physical AI", signal="Watch",
            note="AI pilot for defense drones (Hivemind). $2.8B valuation.",
            website="https://shield.ai"),
    Startup(name="Skydio", stage="Series E", domain="Robotics", signal="Watch",
            note="Autonomous drone platform — defense + enterprise. $230M raised.",
            website="https://skydio.com"),
    Startup(name="Wayve", stage="Series C", domain="Edge AI", signal="Watch",
            note="Embodied AI for autonomous driving. $1.05B raised. NVIDIA-backed.",
            website="https://wayve.ai"),
    Startup(name="Gather AI", stage="Seed", domain="Robotics", signal="Watch",
            note="Drone-based inventory intelligence for warehouses.",
            website="https://gather.ai"),
    Startup(name="Formant", stage="Series B", domain="Robotics", signal="Track",
            note="Robot operations platform — fleet management + telemetry.",
            website="https://formant.io"),
    Startup(name="Polymath Robotics", stage="Seed", domain="Robotics", signal="Watch",
            note="Autonomy stack for off-highway vehicles (mining, ag, construction).",
            website="https://polymathrobotics.com"),
]

ROLES: list[Role] = [
    Role(company="Figure", role="Staff ML Eng — Loco", type="Full-time", signal="↑ 3rd hire", color="amber",
         url="https://figure.ai/careers"),
    Role(company="Hailo", role="Compiler Eng, Edge AI", type="Remote OK", signal="New", color="green",
         url="https://hailo.ai/company/careers"),
    Role(company="Apptronik", role="Embedded Systems Lead", type="Austin", signal="Urgent", color="red",
         url="https://apptronik.com/careers"),
    Role(company="Axelera AI", role="Sr. SoC Architect", type="Amsterdam", signal="New", color="green",
         url="https://axelera.ai/careers"),
    Role(company="Skild AI", role="Research Eng — Policy", type="Remote", signal="↑ 2nd hire", color="amber",
         url="https://skild.ai/careers"),
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
            "NPU war moving down-stack to MCUs.\n\n"
            "INT4 on STM32H7 = 6ms inference on a $4 chip. "
            "Whoever owns the compiler layer owns edge AI.\n\n"
            "#EdgeAI #EmbeddedAI"
        ),
        tags=["EdgeAI", "EmbeddedAI"],
        source_ref="Hailo Series C · QC AI Hub 1M downloads",
    ),
    Post(
        angle="Thread",
        text=(
            "🧵 Humanoid robots hit commercial scale in 2026.\n\n"
            "Figure @ BMW. Agility @ Amazon. Apptronik @ GXO.\n\n"
            "The dexterity layer is still wide open — that's the gap.\n\n"
            "#Robotics #PhysicalAI"
        ),
        tags=["Robotics", "PhysicalAI"],
        source_ref="Figure/BMW · Agility/Amazon · Apptronik/GXO 2026",
    ),
    Post(
        angle="Contrarian",
        text=(
            "Hot take: ROS2 won't scale to commercial fleets.\n\n"
            "No deterministic OTA. No fleet telemetry. Jitter at 10kHz.\n\n"
            "The winner ships all three in one stack. Nobody has it yet.\n\n"
            "#Robotics #Founder"
        ),
        tags=["Robotics", "Founder"],
        source_ref="ROS2 latency benchmarks ICRA 2025",
    ),
]

TASKS: list[Task] = [
    Task(
        id=1, priority="P0",
        task="Apply to Physical Intelligence, Figure AI, Skild AI",
        domain="Job Applications", time="1.5h",
        description=(
            "1. Physical Intelligence (pi.ai) — Research Engineer / Robotics Software. "
            "Tailor resume: highlight sim-to-real, policy training, Isaac Lab. "
            "2. Figure AI (figure.ai/careers) — Software Engineer, Robot Learning. "
            "Lead with ROS2 experience + embedded systems. "
            "3. Skild AI (skild.ai) — Robot Foundation Models team. "
            "Mention transformer-based policy work. "
            "Tip: personalize each cover letter with the company's latest paper or deployment news."
        ),
    ),
    Task(
        id=2, priority="P0",
        task="NeetCode Blind 75 — Trees + Graphs (5 problems)",
        domain="Coding Practice", time="2h",
        description=(
            "Focus: Binary Tree Level Order Traversal, Word Ladder, Number of Islands, "
            "Course Schedule (cycle detect), Clone Graph. "
            "Platform: neetcode.io/roadmap → Graphs section. "
            "Tip: time yourself — aim for ≤20 min per medium. "
            "After: review the editorial for any you needed hints on. "
            "Goal: be fluent in BFS/DFS pattern recognition before FAANG-style interviews."
        ),
    ),
    Task(
        id=3, priority="P1",
        task="Run NVIDIA Isaac Lab locomotion policy on Jetson Orin",
        domain="Physical AI", time="3h",
        description=(
            "1. Clone Isaac Lab: github.com/isaac-sim/IsaacLab — follow Orbit migration guide. "
            "2. Run AnymalC locomotion example on local GPU first to verify setup. "
            "3. Export trained policy via ONNX: python scripts/export_policy.py. "
            "4. Deploy on Jetson Orin using TensorRT — measure inference latency (target <8ms). "
            "5. If Orin not available: use Isaac Gym preview in Colab. "
            "Bonus: log reward curves to W&B — screenshot for your portfolio."
        ),
    ),
    Task(
        id=4, priority="P1",
        task="Build ROS2 Nav2 autonomous navigation in Gazebo Harmonic",
        domain="Robotics", time="2h",
        description=(
            "1. Install ROS2 Jazzy + Gazebo Harmonic (Ubuntu 24.04 recommended). "
            "2. Clone Nav2 bringup: ros-planning/navigation2 — use turtlebot3 world. "
            "3. Tune DWB controller params: max_vel_x, min_vel_theta in nav2_params.yaml. "
            "4. Add a custom costmap layer (e.g. semantic obstacles). "
            "5. Record a rosbag of a full autonomous run → post clip to X/LinkedIn. "
            "Goal: show recruiters you can go from sim → tuned navigation stack."
        ),
    ),
    Task(
        id=5, priority="P1",
        task="Study NVIDIA Cosmos + Isaac Sim world model — implement one demo",
        domain="Physical AI", time="2h",
        description=(
            "1. Read Cosmos paper: arxiv.org/abs/2501.03575 (World Foundation Models). "
            "2. Watch NVIDIA GTC 2025 keynote segment on Physical AI (YouTube, 18 min). "
            "3. Run the Isaac Sim + Cosmos video generation demo from NGC catalog. "
            "4. Replicate a single task: generate a synthetic manipulation video using prompts. "
            "5. Note latency, resolution limits, downstream policy quality. "
            "Good talking point in interviews: 'I tested Cosmos for data augmentation in sim-to-real.'"
        ),
    ),
    Task(
        id=6, priority="P1",
        task="Benchmark INT4/INT8 quantization — llama.cpp on Jetson or M-series",
        domain="Edge AI", time="2h",
        description=(
            "1. Pull latest llama.cpp: github.com/ggml-org/llama.cpp — build with CUDA/Metal. "
            "2. Download Llama-3.1-8B-Instruct GGUF Q4_K_M from HuggingFace. "
            "3. Run: ./llama-bench -m model.gguf -p 512 -n 128 -r 5. "
            "4. Compare Q8_0 vs Q4_K_M vs Q4_0: tokens/sec, VRAM usage, perplexity. "
            "5. Post results as a table on X with #TinyML #EdgeAI — this gets engagement."
        ),
    ),
    Task(
        id=7, priority="P2",
        task="Read π0 (Physical Intelligence) + RT-2 papers — note architecture diffs",
        domain="Physical AI", time="1.5h",
        description=(
            "π0: arxiv.org/abs/2410.24164 — flow matching for generalist robot policy. "
            "RT-2: arxiv.org/abs/2307.15818 — VLM-based robot learning from internet data. "
            "Focus on: action representation, training data pipeline, sim-to-real gap handling. "
            "Write 3-5 bullet takeaways in your notes — use them in interviews when asked "
            "'what research are you following?'"
        ),
    ),
    Task(
        id=8, priority="P2",
        task="Apply to Covariant, Waymo, Helsing — research-focused roles",
        domain="Job Applications", time="1h",
        description=(
            "Covariant (covariant.ai) — Robot Foundation Model team. Remote-friendly. "
            "Waymo (waymo.com/careers) — Perception / Robotics ML roles. "
            "Helsing (helsing.ai) — Defense AI, embedded ML. EU-based but remote eng roles exist. "
            "Angle: all three care about production-grade ML on constrained hardware. "
            "Lead with edge inference + real-world deployment experience."
        ),
    ),
]

PEOPLE: list[Person] = [
    Person(name="Jim Fan", handle="@drjimfan", url="https://x.com/drjimfan",
           context="NVIDIA AI Research. Creator of Isaac Lab + Voyager. Core follow for Physical AI + sim-to-real.",
           urgency="This week", days=0),
    Person(name="Song Han", handle="@songhan_song", url="https://x.com/songhan_song",
           context="MIT professor. TinyML + EfficientML pioneer. Follow for edge inference + quantization research.",
           urgency="This week", days=0),
    Person(name="Pete Warden", handle="@petewarden", url="https://x.com/petewarden",
           context="TinyML creator, ex-Google. Follow for on-device ML, MCU deployment, edge AI trends.",
           urgency="This week", days=0),
    Person(name="Andrej Karpathy", handle="@karpathy", url="https://x.com/karpathy",
           context="Ex-Tesla/OpenAI. Best educator in AI. Follow for LLM internals + edge model intuition.",
           urgency="This week", days=0),
]

WEEKLY_WINS = [
    "Shipped INT4 quant demo on STM32H7 — 6ms latency, 40% better than baseline. 3 founder DMs.",
    "Applied to Hailo Compiler Eng + Inferix — referral from Marcus at Hailo BD confirmed.",
    "Completed ROS2 Nav2 + Gazebo sim — autonomous nav through dynamic obstacle course.",
]

WEEKLY_GAPS = [
    "Isaac Lab CUDA mismatch on Orin unresolved — driver rollback needed before any policy runs.",
    "Zero cold outreach sent — 2 Edge AI founders still not contacted. Non-negotiable this week.",
    "Zephyr OTA PR not drafted — blocked by missing FDA 510(k) scope clarity.",
]

CONVICTION_BETS: list[ConvictionBet] = [
    ConvictionBet(label="Edge AI compiler toolchain gap", conviction=92),
    ConvictionBet(label="Isaac Lab sim-to-real pipeline", conviction=81),
    ConvictionBet(label="Zephyr RTOS for medical devices", conviction=67),
]

NEXT_WEEK_FOCUS = (
    "Resolve Isaac Lab CUDA driver on Orin (rollback to 11.8), run first dexterous policy rollout. "
    "DM @kargarx + @DrJimFan cold — intro ask, not a pitch. "
    "Get Zephyr OTA PR into draft state — even 50% is progress. "
    "Post INT4 benchmark thread on X with real numbers."
)
