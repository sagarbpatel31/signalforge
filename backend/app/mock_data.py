from .schemas import (
    CuratedSource, Signal, Stat, Opportunity, Startup, Role,
    Paper, Post, Task, ConvictionBet,
)

CURATED_SNAPSHOT_DATE = "2026-08-11"
LEGACY_WATCHLIST_DATE = "2026-07-01"

MARKET_PULSE = (
    "Verified August 11, 2026: Skild AI has raised $1.4B at a valuation above $14B, "
    "Apptronik has pushed Series A capital past $935M and is now emphasizing data-flywheel training for Apollo, "
    "Figure 03 has moved from BotQ manufacturing claims into active BMW Spartanburg deployment, "
    "and edge AI remains a commercial runtime story across robotics, security, and on-device GenAI."
)

SIGNALS: list[Signal] = [
    Signal(label="Skild AI Series C", delta="Jan 2026", color="cyan",
           text="Skild AI announced a $1.4B Series C led by SoftBank, pushing valuation above $14B and reinforcing the market for general-purpose robot foundation models."),
    Signal(label="Apptronik Apollo Scale", delta="Feb 2026", color="green",
           text="Apptronik added a $520M Series A-X extension, bringing total Series A to more than $935M and nearly $1B total capital as it scales Apollo deployments."),
    Signal(label="Figure 03 Production", delta="Apr 2026", color="amber",
           text="Figure says BotQ has delivered over 350 Figure 03 robots and improved output from one robot per day to one per hour in under 120 days."),
    Signal(label="Figure 03 In Deployment", delta="Jun 2026", color="amber",
           text="By June 30, 2026, BMW had begun deploying Figure 03 at Spartanburg, extending the story from pilot manufacturing claims into a concrete factory-floor logistics use case."),
    Signal(label="Edge AI Goes Mass Market", delta="Jul 2026", color="muted",
           text="Axelera announced more than $250M in new funding and Hailo used CES 2026 to position edge AI and on-device GenAI as mainstream across robotics and commercial systems."),
]

STATS: list[Stat] = [
    Stat(label="Signals Tracked", value="2,847", delta="demo snapshot · Jul 2026", up=True),
    Stat(label="Opportunities", value="38", delta="curated roles + infra themes", up=True),
    Stat(label="Startups Flagged", value="142", delta="humanoid + edge AI focus", up=True),
    Stat(label="Hiring Signals", value="91", delta="demo snapshot", up=True),
    Stat(label="Research Papers", value="23", delta="review queue", up=None),
]


def _src(label: str, url: str, published_at: str = "") -> CuratedSource:
    return CuratedSource(label=label, url=url, published_at=published_at)


def _fallback_editorial(domain: str, signal: str, subject: str) -> str:
    return (
        f"Interpretation: {subject} remains a {signal.lower()}-priority signal inside the {domain} map. "
        "Treat it as a watchlist item until a fresher source changes the thesis."
    )

OPPORTUNITIES: list[Opportunity] = [
    Opportunity(rank="01", title="Generalist Robot Policy Engineer (VLA / Diffusion)",
                domain="Physical AI", signal="HIGH", fit=97,
                why="Skild, Physical Intelligence, and Figure have all raised or scaled aggressively into 2026. VLA policy work, diffusion policy, and Isaac Lab experience are directly legible signals."),
    Opportunity(rank="02", title="MCP Server / Agentic Infra Engineer",
                domain="Generative AI", signal="HIGH", fit=94,
                why="By July 2026, agentic developer tooling and MCP-style integrations have become a durable infra layer. Teams need engineers who can build tool-use runtimes, evals, and workflow integrations."),
    Opportunity(rank="03", title="Edge Inference Compiler / NPU Optimization",
                domain="Edge AI", signal="HIGH", fit=91,
                why="Axelera's February 2026 funding and Hailo's CES 2026 edge push keep compiler and low-power inference talent in demand. INT4/INT8 deployment fluency remains a high-signal skill."),
    Opportunity(rank="04", title="ROS2 + Gazebo Harmonic + Nav2 Stack",
                domain="Robotics", signal="HIGH", fit=88,
                why="Figure and Apptronik both spent 2026 scaling real deployments and production. ROS2, Gazebo Harmonic, and hardware-in-the-loop experience still map cleanly to deployment teams."),
    Opportunity(rank="05", title="Sim-to-Real: Isaac Lab + Genesis Engine",
                domain="Physical AI", signal="HIGH", fit=85,
                why="Genesis, Isaac Lab, and VLA training loops remain central to sim-to-real work. The bottleneck is still data efficiency and transfer, not generic model availability."),
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

_OPPORTUNITY_METADATA: dict[str, dict] = {
    "Generalist Robot Policy Engineer (VLA / Diffusion)": {
        "last_verified": CURATED_SNAPSHOT_DATE,
        "sourced_fact": "Skild AI closed a $1.4B Series C on January 14, 2026, while Figure and Physical Intelligence kept publishing or scaling around VLA-style robot policy work.",
        "editorial_take": "This is still the cleanest frontier for engineers who can connect policy learning, sim-to-real data, and deployment constraints instead of treating VLA work as a pure model problem.",
        "sources": [
            _src("Skild AI Series C", "https://www.skild.ai/blogs/series-c", "2026-01-14"),
            _src("π0.5 paper", "https://arxiv.org/abs/2504.16054", "2025-04-22"),
        ],
    },
    "MCP Server / Agentic Infra Engineer": {
        "last_verified": CURATED_SNAPSHOT_DATE,
        "sourced_fact": "Cognition raised a fresh $1B round on May 27, 2026, and AI-native developer tooling continues to concentrate around agent runtimes, evals, and tool integration layers.",
        "editorial_take": "The durable opportunity is not prompt wrappers. It is infrastructure that makes agentic workflows observable, testable, and operational inside real engineering teams.",
        "sources": [
            _src("Cognition funding coverage", "https://techcrunch.com/2026/05/27/ai-coding-startup-cognition-raises-1b-at-25b-pre-money-valuation/", "2026-05-27"),
        ],
    },
    "Edge Inference Compiler / NPU Optimization": {
        "last_verified": CURATED_SNAPSHOT_DATE,
        "sourced_fact": "Axelera announced more than $250M in new funding on February 24, 2026, and Hailo used CES 2026 to position on-device GenAI and edge inference as mainstream commercial priorities.",
        "editorial_take": "Compiler, quantization, and runtime optimization still have better scarcity economics than generic application-layer ML work because they gate whether edge deployments ship at all.",
        "sources": [
            _src("Axelera AI funding", "https://axelera.ai/news/axelera-ai-secures-more-than-250-million-funding-on-global-commercial-growth", "2026-02-24"),
            _src("Hailo CES 2026", "https://hailo.ai/company-overview/newsroom/news/hailo-accelerates-edge-ai-adoption-across-consumer-and-commercial-markets-demonstrated-live-at-ces-2026/", "2026-01-06"),
        ],
    },
    "ROS2 + Gazebo Harmonic + Nav2 Stack": {
        "last_verified": CURATED_SNAPSHOT_DATE,
        "sourced_fact": "Figure had moved Figure 03 into BMW Spartanburg deployment by June 30, 2026, while Apptronik had already pushed total Series A capital above $935M as Apollo commercialization expanded.",
        "editorial_take": "Middleware and deployment fluency matter even more now because the market is shifting from polished demos into real fleet behavior, uptime, and plant integration.",
        "sources": [
            _src("BMW deploys Figure 03", "https://timesofindia.indiatimes.com/technology/tech-news/bmw-deploys-figure-03-humanoid-robot-at-us-factory-to-transform-automotive-manufacturing/articleshow/132092781.cms", "2026-06-30"),
            _src("Apptronik Series A-X", "https://apptronik.com/news-collection/apptronik-closes-over-935-million-series-a", "2026-02-11"),
        ],
    },
    "Sim-to-Real: Isaac Lab + Genesis Engine": {
        "last_verified": CURATED_SNAPSHOT_DATE,
        "sourced_fact": "NVIDIA maintains Isaac Lab as an open-source framework for robot learning, while Genesis publishes a generative physics platform aimed at robotics simulation workflows.",
        "editorial_take": "Engineers who can connect simulation, policy training, and hardware validation remain more differentiated than practitioners who only tune models in an offline benchmark.",
        "sources": [
            _src("NVIDIA Isaac Lab", "https://developer.nvidia.com/isaac/lab"),
            _src("Genesis documentation", "https://genesis-world.readthedocs.io/en/latest/"),
        ],
    },
    "Agentic Coding Tool / SWE-Agent Developer": {
        "last_verified": CURATED_SNAPSHOT_DATE,
        "sourced_fact": "Cognition raised $1B in May 2026, while the Model Context Protocol documents a shared interface for connecting AI applications to tools and data sources.",
        "editorial_take": "The defensible engineering work is moving toward evals, tool reliability, permissions, and orchestration rather than another thin coding-chat interface.",
        "sources": [
            _src("Cognition funding coverage", "https://techcrunch.com/2026/05/27/ai-coding-startup-cognition-raises-1b-at-25b-pre-money-valuation/", "2026-05-27"),
            _src("Model Context Protocol", "https://modelcontextprotocol.io/docs/getting-started/intro"),
        ],
    },
    "Embedded Linux + Motor Control (Humanoid HW)": {
        "last_verified": CURATED_SNAPSHOT_DATE,
        "sourced_fact": "Figure reported rapid Figure 03 production scaling, and Apptronik described Robot Park as infrastructure for training and deploying Apollo systems.",
        "editorial_take": "That production push raises the value of engineers who can make actuator firmware, embedded control, field diagnostics, and safety behavior reliable at fleet scale.",
        "sources": [
            _src("Figure production update", "https://www.figure.ai/news/ramping-figure-03-production", "2026-04-29"),
            _src("Apptronik Robot Park", "https://www.businessinsider.com/apptroniks-humanoid-robots-are-practicing-for-their-first-real-jobs-2026-6", "2026-06-30"),
        ],
    },
    "On-Device Multimodal Perception (Camera + LiDAR)": {
        "last_verified": CURATED_SNAPSHOT_DATE,
        "sourced_fact": "Hailo demonstrated on-device generative AI across commercial edge systems at CES 2026, and Axelera raised more than $250M to expand edge-inference products and software.",
        "editorial_take": "The strongest opportunity is in the runtime path between sensor input and deployable multimodal inference: quantization, scheduling, memory movement, and hardware-aware evaluation.",
        "sources": [
            _src("Hailo CES 2026", "https://hailo.ai/company-overview/newsroom/news/hailo-accelerates-edge-ai-adoption-across-consumer-and-commercial-markets-demonstrated-live-at-ces-2026/", "2026-01-06"),
            _src("Axelera AI funding", "https://axelera.ai/news/axelera-ai-secures-more-than-250-million-funding-on-global-commercial-growth", "2026-02-24"),
        ],
    },
}

OPPORTUNITIES = [
    item.model_copy(update={
        "last_verified": _OPPORTUNITY_METADATA.get(item.title, {}).get("last_verified", CURATED_SNAPSHOT_DATE),
        "sources": _OPPORTUNITY_METADATA.get(item.title, {}).get("sources", []),
        "sourced_fact": _OPPORTUNITY_METADATA.get(item.title, {}).get("sourced_fact", item.why),
        "editorial_take": _OPPORTUNITY_METADATA.get(item.title, {}).get("editorial_take", item.why),
    })
    for item in OPPORTUNITIES
]

STARTUPS: list[Startup] = [
    Startup(name="Figure", stage="Series C", domain="Physical AI", signal="Hot",
            note="As of June 30, 2026, Figure 03 had moved into BMW Spartanburg deployment after earlier BotQ production scaling claims.",
            website="https://figure.ai"),
    Startup(name="Apptronik", stage="Series A", domain="Physical AI", signal="Hot",
            note="Apptronik announced a $520M Series A-X extension on February 11, 2026 and, by late June, was highlighting 'Robot Park' training infrastructure for Apollo data collection.",
            website="https://apptronik.com"),
    Startup(name="Skild AI", stage="Series C", domain="Physical AI", signal="Hot",
            note="Skild AI announced a $1.4B Series C on January 14, 2026, taking its valuation above $14B and doubling down on omni-bodied robot intelligence.",
            website="https://skild.ai"),
    Startup(name="Axelera AI", stage="Series C", domain="Edge AI", signal="Hot",
            note="Axelera announced more than $250M in funding on February 24, 2026, alongside continued push around Europa and Voyager SDK for edge inference.",
            website="https://axelera.ai"),
    Startup(name="Hailo", stage="Growth", domain="Edge AI", signal="Hot",
            note="Hailo used CES 2026 to position edge AI and on-device GenAI as mainstream across consumer devices, robotics, security, and retail.",
            website="https://hailo.ai"),
    Startup(name="Physical Intelligence", stage="Series B", domain="Physical AI", signal="Watch",
            note="Physical Intelligence's π0.5 paper remains one of the clearest public references for open-world VLA generalization in manipulation.",
            website="https://physicalintelligence.company"),
    Startup(name="1X Technologies", stage="Series B", domain="Physical AI", signal="Watch",
            note="1X remains one of the most watched OpenAI-backed humanoid teams as home and service robotics moves from demo to deployment.",
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
    Startup(name="Etched", stage="Seed", domain="Edge AI", signal="Watch",
            note="Transformer-only ASIC (Sohu). 144M TOPS. Beats H100 for inference.",
            website="https://etched.com"),
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
            note="Groq remains one of the clearest signals that inference-specialized hardware is now a first-class category alongside training-centric infrastructure.",
            website="https://groq.com"),
    Startup(name="Cerebras Systems", stage="Pre-IPO", domain="Edge AI", signal="Watch",
            note="WSE-3 wafer-scale chip — 4 trillion transistors. 900B param models on-chip. IPO expected 2026.",
            website="https://cerebras.net"),
    Startup(name="d-Matrix", stage="Series B", domain="Edge AI", signal="Watch",
            note="In-memory compute for LLM inference. $110M raised. Targets data center + edge.",
            website="https://d-matrix.ai"),
    Startup(name="Shield AI", stage="Series G", domain="Physical AI", signal="Hot",
            note="Shield AI remains a leading autonomy signal in defense robotics through Hivemind and broader autonomous flight deployment work.",
            website="https://shield.ai"),
    Startup(name="Mind Robotics", stage="Series A", domain="Physical AI", signal="Hot",
            note="$500M Series A (2026). Embodied AI platform — robot learning from human demonstration.",
            website="https://mindrobotics.ai"),
    Startup(name="Cognition AI", stage="Series D", domain="Generative AI", signal="Hot",
            note="Cognition raised a fresh $1B round in late May 2026 and remains one of the strongest signals for agentic coding infrastructure demand.",
            website="https://cognition.ai"),
    Startup(name="Cursor", stage="Series B", domain="Generative AI", signal="Hot",
            note="Cursor remains one of the fastest-moving AI-native IDEs, reinforcing demand for agentic tooling, evals, and MCP-adjacent workflow layers.",
            website="https://cursor.com"),
]

_STARTUP_METADATA: dict[str, dict] = {
    "Figure": {
        "last_verified": CURATED_SNAPSHOT_DATE,
        "sourced_fact": "By June 30, 2026, BMW had begun deploying Figure 03 at Spartanburg, following Figure's earlier April 29, 2026 BotQ production update.",
        "editorial_take": "Figure now matters as an operations signal, not just a flashy humanoid narrative: the conversation is moving toward customer-site deployment and factory logistics.",
        "sources": [
            _src("BMW deploys Figure 03", "https://timesofindia.indiatimes.com/technology/tech-news/bmw-deploys-figure-03-humanoid-robot-at-us-factory-to-transform-automotive-manufacturing/articleshow/132092781.cms", "2026-06-30"),
            _src("Figure production update", "https://www.figure.ai/news/ramping-figure-03-production", "2026-04-29"),
        ],
    },
    "Apptronik": {
        "last_verified": CURATED_SNAPSHOT_DATE,
        "sourced_fact": "Apptronik announced on February 11, 2026 that a $520M Series A-X extension pushed total Series A capital above $935M, and by June 30, 2026 it was showcasing Robot Park as training infrastructure for Apollo.",
        "editorial_take": "The read is now broader than fundraising: Apptronik is signaling that the real moat in humanoids is becoming data generation, customer pilots, and deployment learning loops.",
        "sources": [
            _src("Apptronik Series A-X", "https://apptronik.com/news-collection/apptronik-closes-over-935-million-series-a", "2026-02-11"),
            _src("Apptronik Robot Park", "https://www.businessinsider.com/apptroniks-humanoid-robots-are-practicing-for-their-first-real-jobs-2026-6", "2026-06-30"),
        ],
    },
    "Skild AI": {
        "last_verified": CURATED_SNAPSHOT_DATE,
        "sourced_fact": "Skild AI announced a $1.4B Series C on January 14, 2026, at a valuation above $14B.",
        "editorial_take": "Skild remains one of the clearest external signals that investors still believe a general-purpose robot intelligence platform can compound across embodiments.",
        "sources": [
            _src("Skild AI Series C", "https://www.skild.ai/blogs/series-c", "2026-01-14"),
        ],
    },
    "Axelera AI": {
        "last_verified": CURATED_SNAPSHOT_DATE,
        "sourced_fact": "Axelera announced more than $250M in funding on February 24, 2026 to support commercial growth in edge inference.",
        "editorial_take": "That is a strong market signal that efficient inference hardware and toolchains still have room to differentiate beyond hyperscaler AI spending.",
        "sources": [
            _src("Axelera AI funding", "https://axelera.ai/news/axelera-ai-secures-more-than-250-million-funding-on-global-commercial-growth", "2026-02-24"),
        ],
    },
    "Hailo": {
        "last_verified": CURATED_SNAPSHOT_DATE,
        "sourced_fact": "Hailo used CES 2026 to frame edge AI and on-device GenAI as mainstream across consumer and commercial markets.",
        "editorial_take": "Hailo matters as a distribution signal: edge inference is no longer being pitched as niche robotics infrastructure.",
        "sources": [
            _src("Hailo CES 2026", "https://hailo.ai/company-overview/newsroom/news/hailo-accelerates-edge-ai-adoption-across-consumer-and-commercial-markets-demonstrated-live-at-ces-2026/", "2026-01-06"),
        ],
    },
    "Physical Intelligence": {
        "last_verified": CURATED_SNAPSHOT_DATE,
        "sourced_fact": "Physical Intelligence's π0.5 paper remains a concrete public reference point for open-world VLA generalization in manipulation.",
        "editorial_take": "Even without a fresh financing headline here, the paper keeps the company relevant because it anchors technical expectations for embodied model capability.",
        "sources": [
            _src("π0.5 paper", "https://arxiv.org/abs/2504.16054", "2025-04-22"),
        ],
    },
    "Cognition AI": {
        "last_verified": CURATED_SNAPSHOT_DATE,
        "sourced_fact": "TechCrunch reported on May 27, 2026 that Cognition raised a fresh $1B round.",
        "editorial_take": "That keeps agentic coding infrastructure in the 'real budget, real urgency' category rather than speculative product theater.",
        "sources": [
            _src("Cognition funding coverage", "https://techcrunch.com/2026/05/27/ai-coding-startup-cognition-raises-1b-at-25b-pre-money-valuation/", "2026-05-27"),
        ],
    },
}

STARTUPS = [
    item.model_copy(update={
        "last_verified": _STARTUP_METADATA.get(item.name, {}).get("last_verified", LEGACY_WATCHLIST_DATE),
        "sources": _STARTUP_METADATA.get(item.name, {}).get(
            "sources",
            [_src(item.name, item.website, "")]
            if item.website
            else [],
        ),
        "sourced_fact": _STARTUP_METADATA.get(item.name, {}).get("sourced_fact", item.note),
        "editorial_take": _STARTUP_METADATA.get(item.name, {}).get(
            "editorial_take",
            _fallback_editorial(item.domain, item.signal, item.name),
        ),
    })
    for item in STARTUPS
]

ROLES: list[Role] = [
    Role(company="Skild AI", role="Robot Learning Engineer — Foundation Models",
         type="Pittsburgh · Full-time", signal="↑ Jan 2026 Series C", color="cyan",
         url="https://skild.ai/careers", tags=["robotics", "physical-ai"]),
    Role(company="Apptronik", role="Robotics Software Engineer — Apollo",
         type="Austin TX · Full-time", signal="↑ Feb 2026 extension", color="cyan",
         url="https://apptronik.com/careers", tags=["robotics", "physical-ai"]),
    Role(company="Physical Intelligence", role="Research Engineer — Robot Policies",
         type="SF · Full-time", signal="↑ Active · π0.5 launch", color="cyan",
         url="https://physicalintelligence.company/careers", tags=["robotics", "physical-ai"]),
    Role(company="Groq", role="ML Systems Engineer — LPU Inference",
         type="Mountain View / Remote", signal="↑ inference infra demand", color="green",
         url="https://groq.com/careers", tags=["edge-ai"]),
    Role(company="Axelera AI", role="Compiler Engineer — Edge AI Chip",
         type="Amsterdam / Remote", signal="↑ Feb 2026 funding", color="cyan",
         url="https://axelera.ai/careers", tags=["edge-ai"]),
    Role(company="Cognition AI", role="Software Engineer — Agentic Systems",
         type="NYC / Remote · Full-time", signal="↑ May 2026 round", color="green",
         url="https://cognition.ai/careers", tags=["llm", "agentic"]),
    Role(company="Covariant", role="Robot Learning Engineer — RFM-1",
         type="Berkeley CA · Full-time", signal="↑ Amazon deal", color="cyan",
         url="https://covariant.ai/careers", tags=["robotics", "physical-ai"]),
    Role(company="Hailo", role="Compiler Engineer — NPU Toolchain",
         type="Tel Aviv / Remote", signal="↑ MLPerf TOPS leader", color="cyan",
         url="https://hailo.ai/company/careers", tags=["edge-ai", "embedded"]),
    Role(company="Shield AI", role="Autonomy Software Engineer",
         type="San Diego · Full-time", signal="↑ autonomy programs", color="green",
         url="https://shield.ai/careers", tags=["robotics", "physical-ai"]),
    Role(company="Cursor", role="AI Engineer — IDE Agentic Features",
         type="SF · Full-time", signal="↑ AI-native IDE demand", color="green",
         url="https://cursor.com/careers", tags=["llm", "agentic"]),
    Role(company="Neura Robotics", role="Software Engineer — Humanoid",
         type="Metzingen, DE / Remote", signal="↑ EU humanoid push", color="amber",
         url="https://neura-robotics.com/careers", tags=["robotics", "physical-ai"]),
    Role(company="Figure AI", role="Staff ML Engineer — Locomotion",
         type="Sunnyvale · Full-time", signal="↑ 350+ robots built", color="amber",
         url="https://figure.ai/careers", tags=["robotics", "physical-ai"]),
]

ROLES = [
    item.model_copy(update={
        "last_verified": "2026-07-01",
        "sources": [_src(item.company, item.url, "")] if item.url else [],
    })
    for item in ROLES
]

PAPERS: list[Paper] = [
    Paper(title="Foundation Models in Robotics: A Comprehensive Review of Methods, Models, Datasets, Challenges and Future Research Directions",
          venue="arXiv 2026", tags=["Robotics", "Foundation Models"], read=False,
          url="https://arxiv.org/abs/2604.15395"),
    Paper(title="π0.5: a Vision-Language-Action Model with Open-World Generalization",
          venue="arXiv 2025", tags=["Physical AI", "VLA", "Policy"], read=False,
          url="https://arxiv.org/abs/2504.16054"),
    Paper(title="π0: A Vision-Language-Action Flow Model for General Robot Control",
          venue="arXiv 2024", tags=["Physical AI", "VLA", "Policy"], read=False,
          url="https://arxiv.org/abs/2410.24164"),
    Paper(title="Genesis: A Generative and Universal Physics Engine for Robotics",
          venue="arXiv 2024", tags=["Robotics", "Simulation"], read=False,
          url="https://arxiv.org/abs/2412.04325"),
    Paper(title="Ark: An Open-source Python-based Framework for Robot Learning",
          venue="arXiv 2025", tags=["Robotics", "Open Source"], read=False,
          url="https://arxiv.org/abs/2506.21628"),
    Paper(title="Humanoid World Models: Open World Foundation Models for Humanoid Robotics",
          venue="arXiv 2025", tags=["Physical AI", "World Models"], read=False,
          url="https://arxiv.org/abs/2506.01182"),
    Paper(title="Channel-Adaptive Edge AI: Maximizing Inference Throughput by Adapting Computational Complexity to Channel States",
          venue="arXiv 2026", tags=["Edge AI", "Inference"], read=False,
          url="https://arxiv.org/abs/2603.03146"),
]

PAPERS = [
    item.model_copy(update={
        "last_verified": "2026-07-01",
        "sources": [_src("Paper", item.url, item.venue)] if item.url else [],
    })
    for item in PAPERS
]

POSTS: list[Post] = [
    Post(
        angle="Take",
        text=(
            "July 2026 check-in: edge AI is no longer a lab-only story.\n\n"
            "Hailo's CES push, Axelera's funding, and the fact that deployment tooling still decides what actually ships all point the same direction.\n\n"
            "#EdgeAI #Robotics"
        ),
        tags=["EdgeAI", "Robotics"],
        source_ref="Hailo Jan 2026 CES signal · Axelera Feb 2026 funding",
    ),
    Post(
        angle="Thread",
        text=(
            "🧵 As of July 1, 2026, humanoid robotics has crossed from prototype theater into real deployment mode.\n\n"
            "What every Robotics engineer needs to know right now:"
        ),
        tags=["Robotics"],
        source_ref="Figure Jun 30 2026 BMW deployment · Apptronik Feb 2026 extension",
    ),
    Post(
        angle="Contrarian",
        text=(
            "Hot take: foundation model robots get all the attention.\n\n"
            "But the real moat is in the runtime layer. Nobody talks about that.\n\n"
            "#Robotics #EdgeAI"
        ),
        tags=["Robotics", "EdgeAI"],
        source_ref="ROS2 deployment reality · 2026 productization trend",
    ),
    Post(
        angle="Job Hunt",
        text=(
            "The companies hiring aggressively right now are the ones turning prototypes into production fleets and data loops.\n\n"
            "If you're a Robotics engineer, this is your moment. The wave is here.\n\n"
            "#Robotics #EdgeAI"
        ),
        tags=["Robotics", "EdgeAI"],
        source_ref="Figure · Apptronik · Skild AI hiring signals, Jul 1 2026",
    ),
    Post(
        angle="Research",
        text=(
            "If you're rebuilding your robotics reading list for July 2026, start with the new foundation-models-in-robotics review and then go straight into π0.5.\n\n"
            "That pair gives you both the map and the current frontier.\n\n"
            "#Robotics #EdgeAI"
        ),
        tags=["Robotics", "EdgeAI"],
        source_ref="arXiv 2604.15395 · π0.5 arXiv 2504.16054",
    ),
    Post(
        angle="Founder Signal",
        text=(
            "Skild closed a $1.4B Series C. Apptronik pushed total Series A past $935M. Figure says it has already delivered 350+ Figure 03 robots.\n\n"
            "When capital, deployment, and data all move at once, the enabling infrastructure layer becomes the real strategic position.\n\n"
            "#Robotics #PhysicalAI"
        ),
        tags=["Robotics", "PhysicalAI"],
        source_ref="Skild Jan 2026 · Apptronik Feb 2026 · Figure Jun 30 2026",
    ),
]

TASKS: list[Task] = [
    Task(
        id=1, priority="P0",
        task="Apply to Skild AI, Apptronik, Figure, and Physical Intelligence — policy / robot-learning roles",
        domain="Job Applications", time="1.5h",
        description=(
            "1. Skild AI — Jan 14, 2026 Series C: $1.4B raised, valuation above $14B. "
            "Lead with diffusion policy + Isaac Lab + robot-data flywheel intuition. "
            "2. Apptronik — Feb 11, 2026 extension took Series A past $935M. "
            "Highlight ROS2 + embedded control + deployment readiness for Apollo workflows. "
            "3. Figure — Apr 29, 2026 production update: 350+ Figure 03 robots delivered, one robot per hour pace. "
            "Tailor toward fleet scale, runtime reliability, and embodied data systems. "
            "4. Physical Intelligence — π0.5 remains a strong public signal for open-world VLA work. "
            "Tip: personalize each application with a dated 2026 milestone, not a generic company overview."
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
        task="Study the 2026 robotics FM review + π0.5 — extract one concrete system design takeaway",
        domain="Physical AI", time="2h",
        description=(
            "1. Read the April 2026 robotics foundation-models review: arxiv.org/abs/2604.15395. "
            "2. Read π0.5: arxiv.org/abs/2504.16054. "
            "3. Write a 1-page note comparing where the review says the field is heading vs. what π0.5 actually demonstrates today. "
            "4. Extract one implementation takeaway for your own stack: data mixture, action representation, or evaluation loop. "
            "Goal: turn reading into architecture judgment, not note-taking."
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

WEEKLY_WINS = [
    "Refreshed the fallback product narrative to July 1, 2026 so the site no longer reads like a June snapshot.",
    "Updated the startup and opportunity stack with newer Figure deployment context and fresher Apptronik commercialization detail.",
    "Kept the reading stack centered on the April 2026 FM review and π0.5 instead of drifting back to stale 2025-only references.",
]

WEEKLY_GAPS = [
    "The startup long tail still contains several older watchlist notes that have not been re-verified against July 2026 sources.",
    "Role and task counts are still curated demo numbers rather than live July 2026 aggregates.",
    "Coding-tool and agentic-infra company data will need another refresh if July product or funding moves change the market map.",
]

CONVICTION_BETS: list[ConvictionBet] = [
    ConvictionBet(label="Edge AI compiler toolchain gap", conviction=92),
    ConvictionBet(label="Isaac Lab sim-to-real pipeline", conviction=81),
    ConvictionBet(label="Zephyr RTOS for medical devices", conviction=67),
]

NEXT_WEEK_FOCUS = (
    "Re-verify the long-tail startup watchlist, tighten July 2026 company and role counts, and keep replacing soft relative language with explicit dates whenever curated fallback content is meant to look current."
)
