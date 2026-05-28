from .schemas import (
    Signal, Stat, Opportunity, Startup, Role,
    Paper, Post, Task, Person, ConvictionBet,
)

MARKET_PULSE = (
    "Humanoid deployments at commercial scale — 12 platforms shipping, $4.3B raised in 2026. "
    "Skild AI hits $14B valuation on generalist robot brain. "
    "Claude Code 78% SWE-bench + MCP-native; agentic infra becoming table stakes. "
    "Edge AI chip market up to $11.6B — Axelera $250M Series C, Jetson Thor 7.5× over Orin."
)

SIGNALS: list[Signal] = [
    Signal(label="Skild AI $1.4B Series C", delta="+11", color="cyan",
           text="Skild AI raises $1.4B at $14B valuation — generalist robot foundation model. CMU/Meta lineage. Biggest private robotics round of 2026. Hiring across policy learning, sim-to-real, and inference."),
    Signal(label="Humanoid Scale Tipping", delta="+9", color="green",
           text="12 commercial humanoid platforms shipping as of Q2 2026. Apptronik $520M Series A (Google-led), Apollo in Mercedes + GXO. Japan Airlines deploying at Haneda. $4.3B humanoid funding — 6× vs 2018."),
    Signal(label="Agentic AI + MCP Native", delta="+7", color="amber",
           text="Claude Code 78.4% SWE-bench, fully MCP-native. Cursor at 67.2%. MCP adoption accelerating across Cursor, Codex, Replit. Agentic toolchain infra now a core hiring signal at every AI lab."),
    Signal(label="Edge AI Chip War", delta="+5", color="muted",
           text="Axelera AI $250M Series C (Feb 2026), Europa chip benchmarked. MLPerf v6.0: industry at 200+ TOPS/watt. Edge AI market $9.5B → $11.6B in 12 months. Jetson Thor adopted by Amazon Robotics + Figure."),
]

STATS: list[Stat] = [
    Stat(label="Signals Tracked", value="2,847", delta="+124 today", up=True),
    Stat(label="Opportunities", value="38", delta="6 new", up=True),
    Stat(label="Startups Flagged", value="142", delta="+19 this wk", up=True),
    Stat(label="Hiring Signals", value="91", delta="+8 roles", up=True),
    Stat(label="Research Papers", value="23", delta="unread", up=None),
]

OPPORTUNITIES: list[Opportunity] = [
    Opportunity(rank="01", title="Generalist Robot Policy Engineer (VLA / Diffusion)",
                domain="Physical AI", signal="HIGH", fit=97,
                why="Skild $14B + PI + Covariant all hiring policy engineers. VLA (π0, RT-2), diffusion policy, and Isaac Lab experience = top-of-funnel instantly. 12 humanoid platforms need policy talent now."),
    Opportunity(rank="02", title="MCP Server / Agentic Infra Engineer",
                domain="Generative AI", signal="HIGH", fit=94,
                why="MCP is the standard agentic protocol — Claude Code native, Cursor/Codex adopting fast. Every AI product team building MCP servers. Target: Anthropic, Cursor, Replit, Modal, any AI-native startup."),
    Opportunity(rank="03", title="Edge Inference Compiler / NPU Optimization",
                domain="Edge AI", signal="HIGH", fit=91,
                why="Axelera $250M Series C, Jetson Thor, MLPerf 200+ TOPS/watt. Edge AI chip market $11.6B. Target: Hailo, Axelera AI, Tenstorrent, Groq, Qualcomm AI — Compiler / Inference Eng. INT4/INT8 fluency = hire."),
    Opportunity(rank="04", title="ROS2 + Gazebo Harmonic + Nav2 Stack",
                domain="Robotics", signal="HIGH", fit=88,
                why="Apptronik, Figure, Agility, Collaborative Robotics all scaling teams post-Series B/C. ROS2 fluency + real hardware experience = strong signal. Target: 12 humanoid platforms actively hiring SW."),
    Opportunity(rank="05", title="Sim-to-Real: Isaac Lab + Genesis Engine",
                domain="Physical AI", signal="HIGH", fit=85,
                why="Genesis (430k× realtime) + Isaac Lab dominating sim infra. Skild, Physical Intelligence, NVIDIA Research all hiring. Sim-to-real = the bottleneck everyone is racing to solve."),
    Opportunity(rank="06", title="Agentic Coding Tool / SWE-Agent Developer",
                domain="Generative AI", signal="MEDIUM", fit=80,
                why="Claude Code at 78.4%, Cursor at 67.2% SWE-bench — proving ground for agentic coding. Tooling, evals, and agent orchestration engineers in high demand. Target: Anthropic, Cognition, any coding-AI startup."),
    Opportunity(rank="07", title="Embedded Linux + Motor Control (Humanoid HW)",
                domain="Embedded", signal="MEDIUM", fit=76,
                why="Every humanoid robot has firmware under the policy layer. FOC motor control, CAN bus, Zephyr/FreeRTOS for actuators. Target: Figure HW, Apptronik HW, Unitree, 1X Technologies → Embedded SW Eng."),
    Opportunity(rank="08", title="On-Device Multimodal Perception (Camera + LiDAR)",
                domain="Edge AI", signal="MEDIUM", fit=71,
                why="AV + humanoid perception runs at the edge. Jetson Thor adoption by Amazon Robotics + Boston Dynamics. Target: Waymo, Luminar, Ouster, Wayve, Mobileye → Perception / ML Eng."),
]

STARTUPS: list[Startup] = [
    Startup(name="Physical Intelligence", stage="Series B", domain="Physical AI", signal="Hot",
            note="π0 VLA model — generalist robot policy. $400M raised. π0.5 shipping to partners Q2 2026.",
            website="https://physicalintelligence.company"),
    Startup(name="Skild AI", stage="Series C", domain="Physical AI", signal="Hot",
            note="$1.4B Series C at $14B valuation (2026). Generalist robot foundation model. CMU/Meta spinout. Largest private robotics round of 2026.",
            website="https://skild.ai"),
    Startup(name="Hailo", stage="Series C", domain="Edge AI", signal="Hot",
            note="$136M Series C. Hailo-8L NPU shipping in cameras, drones, edge boxes.",
            website="https://hailo.ai"),
    Startup(name="Axelera AI", stage="Series C", domain="Edge AI", signal="Hot",
            note="$250M+ Series C (Feb 2026). Europa chip — in-memory compute, competitive with Hailo on TOPS/watt. Amsterdam.",
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
    Startup(name="Apptronik", stage="Series A", domain="Physical AI", signal="Hot",
            note="$520M Series A at $5B valuation — Google-led (2026). Apollo humanoid in Mercedes + GXO. NASA heritage.",
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
    # 2025/2026 additions
    Startup(name="Neura Robotics", stage="Series B", domain="Physical AI", signal="Hot",
            note="MAiRA cognitive humanoid. €120M Series B. Europe's leading humanoid startup. Hiring SW + policy.",
            website="https://neura-robotics.com"),
    Startup(name="Fourier Intelligence", stage="Series C", domain="Physical AI", signal="Hot",
            note="GR-2 humanoid with 40-DOF hands. $100M+ raised. MIT + Stanford talent.",
            website="https://fftai.com"),
    Startup(name="Unitree Robotics", stage="Series C", domain="Physical AI", signal="Watch",
            note="G1 humanoid at $5,900 (2026) — commoditizing humanoid HW. 30k+ robots shipped.",
            website="https://unitree.com"),
    Startup(name="Viam Robotics", stage="Series B", domain="Robotics", signal="Watch",
            note="RDK platform — robotics dev kit as a service. $57M raised. Ex-MongoDB founders.",
            website="https://viam.com"),
    Startup(name="Machina Labs", stage="Series B", domain="Robotics", signal="Hot",
            note="Robotic sheet metal forming for aerospace/defense. $32M raised. Boeing + Northrop customers.",
            website="https://machinalabs.ai"),
    Startup(name="Groq", stage="Series D", domain="Edge AI", signal="Hot",
            note="LPU inference — 800 tok/s, $0.27/M tokens. $640M raised. Expanding enterprise + edge.",
            website="https://groq.com"),
    Startup(name="Cerebras Systems", stage="Pre-IPO", domain="Edge AI", signal="Watch",
            note="WSE-3 wafer-scale chip — 4 trillion transistors. 900B param models on-chip. IPO expected 2026.",
            website="https://cerebras.net"),
    Startup(name="d-Matrix", stage="Series B", domain="Edge AI", signal="Watch",
            note="In-memory compute for LLM inference. $110M raised. Targets data center + edge.",
            website="https://d-matrix.ai"),
    Startup(name="Shield AI", stage="Series G", domain="Physical AI", signal="Hot",
            note="$1.5B Series G at $12.7B valuation (2026). Hivemind AI pilot for autonomous drones. Defense.",
            website="https://shield.ai"),
    Startup(name="Mind Robotics", stage="Series A", domain="Physical AI", signal="Hot",
            note="$500M Series A (2026). Embodied AI platform — robot learning from human demonstration.",
            website="https://mindrobotics.ai"),
    Startup(name="Cognition AI", stage="Series B", domain="Generative AI", signal="Hot",
            note="Devin — world's first AI software engineer. $175M raised. SWE-bench leader alongside Claude Code.",
            website="https://cognition.ai"),
    Startup(name="Cursor", stage="Series B", domain="Generative AI", signal="Hot",
            note="AI-native IDE. $900M raised. 67.2% SWE-bench. Fastest-growing dev tool of 2026.",
            website="https://cursor.com"),
]

ROLES: list[Role] = [
    Role(company="Skild AI", role="Robot Learning Engineer — Foundation Models",
         type="Pittsburgh · Full-time", signal="↑ Series C · $14B val", color="cyan",
         url="https://skild.ai/careers", tags=["robotics", "physical-ai"]),
    Role(company="Apptronik", role="Robotics Software Engineer — Apollo",
         type="Austin TX · Full-time", signal="↑ $520M Series A", color="cyan",
         url="https://apptronik.com/careers", tags=["robotics", "physical-ai"]),
    Role(company="Physical Intelligence", role="Research Engineer — Robot Policies",
         type="SF · Full-time", signal="↑ Active · π0.5 launch", color="cyan",
         url="https://physicalintelligence.company/careers", tags=["robotics", "physical-ai"]),
    Role(company="Groq", role="ML Systems Engineer — LPU Inference",
         type="Mountain View / Remote", signal="↑ Series D · $640M", color="green",
         url="https://groq.com/careers", tags=["edge-ai"]),
    Role(company="Axelera AI", role="Compiler Engineer — Edge AI Chip",
         type="Amsterdam / Remote", signal="↑ $250M Series C", color="cyan",
         url="https://axelera.ai/careers", tags=["edge-ai"]),
    Role(company="Cognition AI", role="Software Engineer — Agentic Systems",
         type="NYC / Remote · Full-time", signal="↑ $175M · Devin team", color="green",
         url="https://cognition.ai/careers", tags=["llm", "agentic"]),
    Role(company="Covariant", role="Robot Learning Engineer — RFM-1",
         type="Berkeley CA · Full-time", signal="↑ Amazon deal", color="cyan",
         url="https://covariant.ai/careers", tags=["robotics", "physical-ai"]),
    Role(company="Hailo", role="Compiler Engineer — NPU Toolchain",
         type="Tel Aviv / Remote", signal="↑ MLPerf TOPS leader", color="cyan",
         url="https://hailo.ai/company/careers", tags=["edge-ai", "embedded"]),
    Role(company="Shield AI", role="Autonomy Software Engineer",
         type="San Diego · Full-time", signal="↑ $1.5B Series G", color="green",
         url="https://shield.ai/careers", tags=["robotics", "physical-ai"]),
    Role(company="Cursor", role="AI Engineer — IDE Agentic Features",
         type="SF · Full-time", signal="↑ $900M · 67% SWE-bench", color="green",
         url="https://cursor.com/careers", tags=["llm", "agentic"]),
    Role(company="Neura Robotics", role="Software Engineer — Humanoid",
         type="Metzingen, DE / Remote", signal="↑ Series B · EU launch", color="amber",
         url="https://neura-robotics.com/careers", tags=["robotics", "physical-ai"]),
    Role(company="Figure AI", role="Staff ML Engineer — Locomotion",
         type="Sunnyvale · Full-time", signal="↑ BMW deployment scale", color="amber",
         url="https://figure.ai/careers", tags=["robotics", "physical-ai"]),
]

PAPERS: list[Paper] = [
    Paper(title="π0: A Vision-Language-Action Flow Model for General Robot Control",
          venue="arXiv 2024", tags=["Physical AI", "VLA", "Policy"], read=False,
          url="https://arxiv.org/abs/2410.24164"),
    Paper(title="GROOT N1: Open Foundation Models for Humanoid Robots",
          venue="NVIDIA 2025", tags=["Physical AI", "Foundation Models"], read=False,
          url="https://arxiv.org/abs/2503.14734"),
    Paper(title="Cosmos World Foundation Model Technical Report",
          venue="NVIDIA 2025", tags=["Physical AI", "World Models"], read=False,
          url="https://arxiv.org/abs/2501.03575"),
    Paper(title="Genesis: A Generative and Universal Physics Engine for Robotics",
          venue="arXiv 2024", tags=["Robotics", "Simulation"], read=False,
          url="https://arxiv.org/abs/2412.04325"),
    Paper(title="HumanPlus: Humanoid Shadowing and Imitation from Humans",
          venue="CoRL 2024", tags=["Physical AI", "Imitation"], read=False,
          url="https://arxiv.org/abs/2406.10454"),
    Paper(title="GR-2: Generalizing Robot Policies with Video Prediction",
          venue="arXiv 2024", tags=["Robotics", "Policy", "VLA"], read=False,
          url="https://arxiv.org/abs/2408.11048"),
    Paper(title="ROS2 Real-Time Guarantees for Safety-Critical Robotics",
          venue="ICRA 2025", tags=["Robotics", "ROS2"], read=False,
          url="https://arxiv.org/search/?searchtype=all&query=ROS2+real+time+guarantees"),
    Paper(title="INT4 Weight Quantization for LLM Inference on Edge Devices",
          venue="MLSys 2025", tags=["Edge AI", "Quantization"], read=False,
          url="https://arxiv.org/search/?searchtype=all&query=INT4+quantization+edge+LLM"),
    Paper(title="LeRobot: Making Robot Learning Accessible",
          venue="HuggingFace 2025", tags=["Robotics", "Open Source"], read=False,
          url="https://arxiv.org/abs/2504.19442"),
    Paper(title="Diffusion Policies for Dexterous Manipulation at Scale",
          venue="arXiv 2025", tags=["Physical AI", "Manipulation"], read=False,
          url="https://arxiv.org/search/?searchtype=all&query=diffusion+dexterous+manipulation+scale"),
]

POSTS: list[Post] = [
    Post(
        angle="Take",
        text=(
            "GROOT N1 ships VLA policy at 200Hz on Jetson Thor.\n\n"
            "This is what the inflection point looks like. Not hype — production.\n\n"
            "#EdgeAI #Robotics"
        ),
        tags=["EdgeAI", "Robotics"],
        source_ref="NVIDIA GROOT N1 launch · GTC 2025",
    ),
    Post(
        angle="Thread",
        text=(
            "🧵 Humanoid robots hit commercial scale in 2026.\n\n"
            "What every Robotics engineer needs to know right now:"
        ),
        tags=["Robotics"],
        source_ref="Figure/BMW · Agility/Amazon · Apptronik/GXO 2026",
    ),
    Post(
        angle="Contrarian",
        text=(
            "Hot take: foundation model robots get all the attention.\n\n"
            "But the real moat is in the runtime layer. Nobody talks about that.\n\n"
            "#Robotics #EdgeAI"
        ),
        tags=["Robotics", "EdgeAI"],
        source_ref="ROS2 latency benchmarks ICRA 2025",
    ),
    Post(
        angle="Job Hunt",
        text=(
            "The companies hiring aggressively right now are all working on humanoid deployment.\n\n"
            "If you're a Robotics engineer, this is your moment. The wave is here.\n\n"
            "#Robotics #EdgeAI"
        ),
        tags=["Robotics", "EdgeAI"],
        source_ref="Figure · Physical Intelligence · Skild AI hiring 2025",
    ),
    Post(
        angle="Research",
        text=(
            "New research on diffusion policy for dexterous manipulation.\n\n"
            "Changes the baseline assumption everyone was working from. Read before your next system design.\n\n"
            "#Robotics #EdgeAI"
        ),
        tags=["Robotics", "EdgeAI"],
        source_ref="π0 paper · Physical Intelligence 2025",
    ),
    Post(
        angle="Founder Signal",
        text=(
            "Skild AI hits $14B valuation. Apptronik closes $520M (Google-led). Same quarter.\n\n"
            "When the market picks winners this fast, the infrastructure play is now. Physical AI + edge inference = the stack.\n\n"
            "#Robotics #PhysicalAI"
        ),
        tags=["Robotics", "PhysicalAI"],
        source_ref="Skild AI Series C · Apptronik Series A · Q2 2026",
    ),
]

TASKS: list[Task] = [
    Task(
        id=1, priority="P0",
        task="Apply to Skild AI, Apptronik, Physical Intelligence — policy/robot-learning roles",
        domain="Job Applications", time="1.5h",
        description=(
            "1. Skild AI (skild.ai) — $14B valuation post-Series C. Hiring policy engineers, sim-to-real ML. "
            "Lead with diffusion policy + Isaac Lab. Reference their generalist robot brain thesis. "
            "2. Apptronik (apptronik.com) — $520M Series A (Google-led). Apollo in Mercedes + GXO. "
            "Highlight ROS2 + embedded control + real hardware. NASA heritage = safety-critical mindset matters. "
            "3. Physical Intelligence (pi.ai) — π0.5 shipping to partners. Research Eng / Robot Learning. "
            "Tailor: VLA fine-tuning, flow matching, dataset curation pipeline. "
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
        task="Build MCP server for personal toolchain — add to GitHub portfolio",
        domain="Generative AI", time="1.5h",
        description=(
            "MCP (Model Context Protocol) is the standard agentic protocol — Claude Code natively uses it, "
            "Cursor + Codex adopting fast. Building an MCP server signals you understand agentic infra. "
            "1. Pick a tool you use: GitHub, Notion, linear, or your own script. "
            "2. Implement a basic MCP server in Python (anthropic MCP SDK). "
            "3. Register it in Claude Code / Cursor and demo a real workflow. "
            "4. Push to GitHub — write a README with demo GIF. "
            "This is a strong portfolio signal for any AI-native company: Anthropic, Cursor, Cognition, Modal."
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
