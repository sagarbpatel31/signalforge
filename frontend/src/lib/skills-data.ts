export interface SkillResource {
  label: string;
  url: string;
  type: "course" | "repo" | "doc" | "paper" | "tool";
}

export interface SkillTarget {
  company: string;
  role: string;
  url?: string;
}

export interface SkillData {
  slug: string;
  title: string;
  domain: string;
  why: string;
  concepts: string[];
  resources: SkillResource[];
  targets: SkillTarget[];
}

export const SKILLS: SkillData[] = [
  {
    slug: "tinyml-int4-quantization",
    title: "TinyML / INT4 Quantization",
    domain: "Edge AI",
    why: "The NPU war is moving to MCUs. Whoever owns the compiler + quantization layer owns edge inference. INT4/INT8 quantization is the core skill that lets you deploy transformer models on $4 chips — this is the differentiator for every Edge AI role.",
    concepts: [
      "Post-Training Quantization (PTQ) vs Quantization-Aware Training (QAT)",
      "INT4 / INT8 / FP16 weight formats and compute trade-offs",
      "GGUF format (llama.cpp) — practical on-device deployment",
      "NPU architecture: dataflow vs systolic arrays",
      "ONNX → TFLite → model compilation pipeline",
      "Hailo Dataflow Compiler + Hailo Model Zoo",
      "TensorRT for Jetson / edge NVIDIA targets",
      "STM32H7 + MCU inference with X-CUBE-AI",
      "Benchmarking: latency, throughput, power (mW), TOPS/W",
    ],
    resources: [
      { label: "MIT EfficientML (Song Han) — Free Course", url: "https://efficientml.ai", type: "course" },
      { label: "llama.cpp — GGUF quantized inference", url: "https://github.com/ggerganov/llama.cpp", type: "repo" },
      { label: "Hailo Model Zoo + Dataflow Compiler Docs", url: "https://github.com/hailo-ai/hailo_model_zoo", type: "repo" },
      { label: "TinyML Book (Pete Warden) — Free PDF", url: "https://tinymlbook.com", type: "doc" },
      { label: "bitsandbytes — INT4/INT8 quantization lib", url: "https://github.com/TimDettmers/bitsandbytes", type: "repo" },
      { label: "arXiv: INT4 Quantization Survey 2025", url: "https://arxiv.org/search/?searchtype=all&query=INT4+quantization+edge+inference+2025", type: "paper" },
      { label: "X-CUBE-AI — STM32 inference toolkit", url: "https://www.st.com/en/embedded-software/x-cube-ai.html", type: "tool" },
      { label: "TensorRT-LLM — NVIDIA edge inference", url: "https://github.com/NVIDIA/TensorRT-LLM", type: "repo" },
    ],
    targets: [
      { company: "Hailo", role: "Compiler Eng, Edge AI", url: "https://hailo.ai/company/careers" },
      { company: "Axelera AI", role: "Sr. SoC Architect", url: "https://axelera.ai/careers" },
      { company: "Tenstorrent", role: "Inference SW Engineer", url: "https://tenstorrent.com/careers" },
      { company: "Etched", role: "Systems Engineer", url: "https://etched.com/careers" },
      { company: "Qualcomm", role: "AI Inference Engineer", url: "https://careers.qualcomm.com" },
      { company: "NVIDIA", role: "Edge AI / TensorRT Engineer", url: "https://nvidia.wd5.myworkdayjobs.com/NVIDIAExternalCareerSite" },
      { company: "SiFive", role: "ML Software Engineer", url: "https://sifive.com/careers" },
    ],
  },
  {
    slug: "ros2-nav2-gazebo",
    title: "ROS2 + Nav2 + Gazebo",
    domain: "Robotics",
    why: "ROS2 is the lingua franca of commercial robotics. Every robotics company — Figure, Agility, Apptronik, Boston Dynamics, Gecko — runs on ROS2 stacks. Nav2 + Gazebo simulation is how you prove you can ship. Without this, you can't pass a robotics interview.",
    concepts: [
      "ROS2 node / topic / service / action architecture",
      "DDS middleware — FastDDS vs Cyclone DDS",
      "Nav2 stack: BT Navigator, Costmap2D, AMCL, SLAM Toolbox",
      "Gazebo Classic vs Gazebo Ignition (Fortress / Ionic)",
      "URDF / SDF robot modeling",
      "TF2 transform tree and coordinate frames",
      "ros2_control — hardware abstraction layer",
      "MoveIt2 — motion planning for manipulators",
      "Real-time guarantees: rlimit, DDS QoS, executor types",
      "ROS2 → Docker containerization for deployment",
    ],
    resources: [
      { label: "Nav2 Official Docs + Tutorials", url: "https://docs.nav2.org", type: "doc" },
      { label: "Articulated Robotics — ROS2 YouTube series", url: "https://www.youtube.com/@ArticulatedRobotics", type: "course" },
      { label: "ros2_control — hardware interface docs", url: "https://control.ros.org/master/doc/getting_started/getting_started.html", type: "doc" },
      { label: "MoveIt2 Tutorials", url: "https://moveit.picknik.ai/main/doc/tutorials/tutorials.html", type: "doc" },
      { label: "Gazebo Tutorials (Ionic)", url: "https://gazebosim.org/docs/latest/tutorials", type: "doc" },
      { label: "arXiv: ROS2 Real-Time Guarantees (ICRA 2025)", url: "https://arxiv.org/search/?searchtype=all&query=ROS2+real+time+guarantees", type: "paper" },
      { label: "SLAM Toolbox — mapping + localization", url: "https://github.com/SteveMacenski/slam_toolbox", type: "repo" },
    ],
    targets: [
      { company: "Figure", role: "Staff ML Eng / Robotics SW", url: "https://figure.ai/careers" },
      { company: "Agility Robotics", role: "Robotics SW Engineer", url: "https://agilityrobotics.com/careers" },
      { company: "Apptronik", role: "Embedded Systems Lead", url: "https://apptronik.com/careers" },
      { company: "Boston Dynamics", role: "Robotics Software Eng", url: "https://bostondynamics.com/careers" },
      { company: "Gecko Robotics", role: "Robotics Engineer", url: "https://geckorobotics.com/careers" },
      { company: "Collaborative Robotics", role: "Robotics SW Engineer", url: "https://collaborativerobotics.com/careers" },
      { company: "Polymath Robotics", role: "Autonomy Engineer", url: "https://polymathrobotics.com/careers" },
    ],
  },
  {
    slug: "isaac-lab-sim-to-real",
    title: "NVIDIA Isaac Lab / Sim-to-Real RL",
    domain: "Physical AI",
    why: "Sim-to-real is how physical AI companies train robot policies without millions of real-world samples. Isaac Lab (Isaac Gym successor) is the industry-standard GPU-accelerated RL environment. Physical Intelligence, Skild AI, 1X, Covariant all train policies in simulation first.",
    concepts: [
      "Isaac Lab architecture: environments, tasks, robots",
      "GPU-parallelized RL: thousands of envs in parallel on one GPU",
      "Domain randomization — closing the sim-to-real gap",
      "Reinforcement Learning from Human Feedback (RLHF) for robots",
      "PPO / SAC / TD3 — policy gradient methods for locomotion",
      "Diffusion policy — imitation learning for manipulation",
      "Whole-body control (WBC) for humanoid robots",
      "CUDA driver setup for Jetson Orin / edge deployment",
      "Isaac ROS — connecting Isaac Lab policies to ROS2",
    ],
    resources: [
      { label: "Isaac Lab Official Docs + Tutorials", url: "https://isaac-sim.github.io/IsaacLab/", type: "doc" },
      { label: "IsaacLab GitHub — environments + examples", url: "https://github.com/isaac-sim/IsaacLab", type: "repo" },
      { label: "Legged Gym — ETH Zurich locomotion baseline", url: "https://github.com/leggedrobotics/legged_gym", type: "repo" },
      { label: "Diffusion Policy paper + code", url: "https://diffusion-policy.cs.columbia.edu", type: "paper" },
      { label: "Jim Fan (@drjimfan) — Isaac Lab threads on X", url: "https://x.com/drjimfan", type: "doc" },
      { label: "arXiv: Sim-to-Real Transfer for Humanoids", url: "https://arxiv.org/search/?searchtype=all&query=sim+to+real+humanoid+2025", type: "paper" },
      { label: "Isaac ROS — ROS2 integration", url: "https://github.com/NVIDIA-ISAAC-ROS", type: "repo" },
    ],
    targets: [
      { company: "Physical Intelligence", role: "ML Research Eng", url: "https://physicalintelligence.company/careers" },
      { company: "Skild AI", role: "Research Eng — Policy", url: "https://skild.ai/careers" },
      { company: "1X Technologies", role: "Robot Learning Eng", url: "https://1x.tech/careers" },
      { company: "Covariant", role: "ML Engineer — Policy", url: "https://covariant.ai/careers" },
      { company: "Apptronik", role: "Robot Learning Eng", url: "https://apptronik.com/careers" },
      { company: "Figure", role: "Staff ML Eng — Locomotion", url: "https://figure.ai/careers" },
    ],
  },
  {
    slug: "zephyr-rtos-embedded",
    title: "Zephyr RTOS / Embedded Firmware",
    domain: "Embedded",
    why: "Zephyr is the fastest-growing RTOS for medical, industrial, and consumer embedded devices. FDA 510(k) pathway acceptance of Zephyr-based stacks opened a multi-billion dollar market. Memfault, Nordic, and every medical device startup is moving here.",
    concepts: [
      "Zephyr kernel: threads, scheduling, IPC, memory domains",
      "Devicetree — hardware description and configuration",
      "Zephyr west build system + module system",
      "BLE stack (BlueZ / Zephyr BLE) — profiles and GATT",
      "OTA updates — MCUboot + Zephyr DFU",
      "Memfault SDK — embedded observability and crash reporting",
      "Safety-critical development: IEC 62443, ISO 13485",
      "MISRA C / C++ compliance for medical firmware",
      "Nordic nRF52 / nRF9160 development with Zephyr",
      "CMake / Kconfig / west — build toolchain mastery",
    ],
    resources: [
      { label: "Zephyr Project Docs — Official", url: "https://docs.zephyrproject.org", type: "doc" },
      { label: "Nordic Developer Academy — Zephyr Course (Free)", url: "https://academy.nordicsemi.com", type: "course" },
      { label: "Memfault Docs — embedded observability", url: "https://docs.memfault.com", type: "doc" },
      { label: "MCUboot — secure bootloader for OTA", url: "https://docs.mcuboot.com", type: "doc" },
      { label: "Zephyr GitHub — kernel + drivers", url: "https://github.com/zephyrproject-rtos/zephyr", type: "repo" },
      { label: "Interrupt Blog (Memfault) — embedded systems deep dives", url: "https://interrupt.memfault.com", type: "doc" },
      { label: "arXiv: Formal Verification of RTOS Scheduling", url: "https://arxiv.org/search/?searchtype=all&query=RTOS+scheduling+formal+verification", type: "paper" },
    ],
    targets: [
      { company: "Memfault", role: "Embedded SW Engineer", url: "https://memfault.com/careers" },
      { company: "Nordic Semiconductor", role: "Firmware Engineer", url: "https://nordicsemi.com/careers" },
      { company: "Microchip", role: "Embedded Systems Engineer", url: "https://careers.microchip.com" },
      { company: "NXP", role: "Embedded SW Engineer", url: "https://careers.nxp.com" },
      { company: "Texas Instruments", role: "Embedded Systems Engineer", url: "https://careers.ti.com" },
      { company: "Alif Semiconductor", role: "Firmware Engineer", url: "https://alifsemi.com/careers" },
    ],
  },
  {
    slug: "vision-llm-on-device",
    title: "Vision LLM / On-Device Multimodal",
    domain: "Edge AI",
    why: "Vision-language models running on-device are the next frontier — autonomous vehicles, drones, robots all need to understand scenes without cloud round-trips. Moondream, Gemma, Llava running on Jetson/MCU is where perception meets edge inference.",
    concepts: [
      "Vision Transformer (ViT) architecture internals",
      "CLIP / SigLIP — vision-language pretraining",
      "Moondream / LLaVA / Gemma 3 — small multimodal models",
      "Speculative decoding for low-latency edge inference",
      "Camera-LiDAR fusion for 3D perception",
      "BEV (Bird's Eye View) representation for autonomy",
      "ONNX Runtime on ARM — cross-platform inference",
      "Jetson Orin: CUDA + TensorRT + DeepStream pipeline",
      "Streaming inference — token-by-token on edge GPU",
    ],
    resources: [
      { label: "Moondream — 1.86B vision model, runs on Raspberry Pi", url: "https://moondream.ai", type: "tool" },
      { label: "Google Gemma 3 — on-device multimodal (GGUF)", url: "https://ai.google.dev/gemma", type: "doc" },
      { label: "Jetson AI Lab — NVIDIA edge inference tutorials", url: "https://www.jetson-ai-lab.com", type: "course" },
      { label: "LLaVA — visual instruction tuning", url: "https://llava-vl.github.io", type: "paper" },
      { label: "ONNX Runtime — edge deployment", url: "https://onnxruntime.ai", type: "tool" },
      { label: "arXiv: Efficient Vision-Language Models 2025", url: "https://arxiv.org/search/?searchtype=all&query=efficient+vision+language+model+edge+2025", type: "paper" },
      { label: "DeepStream SDK — NVIDIA video analytics pipeline", url: "https://developer.nvidia.com/deepstream-sdk", type: "tool" },
    ],
    targets: [
      { company: "Waymo", role: "Perception Engineer", url: "https://waymo.com/careers" },
      { company: "Wayve", role: "ML Engineer — Perception", url: "https://wayve.ai/careers" },
      { company: "Skydio", role: "Perception / AI Engineer", url: "https://skydio.com/careers" },
      { company: "Applied Intuition", role: "ML Engineer", url: "https://appliedintuition.com/careers" },
      { company: "Shield AI", role: "ML Engineer — Perception", url: "https://shield.ai/careers" },
      { company: "Motional", role: "Perception Engineer", url: "https://motional.com/careers" },
      { company: "moondream", role: "Research Engineer", url: "https://moondream.ai" },
    ],
  },
];

export function getSkill(slug: string): SkillData | undefined {
  return SKILLS.find((s) => s.slug === slug);
}
