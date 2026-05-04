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
    Opportunity(rank="02", title="ROS2 + Nav2 + Gazebo Simulation",
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
