/**
 * UniSci Platform - Mock Data for Testing
 * 3 virtual users with complete usage data
 */

const MOCK_USERS = [
  {
    id: "u001",
    username: "limingzhe",
    password: "lz123456",
    name: "李明哲",
    avatar: "🎓",
    role: "博士生",
    university: "清华大学",
    department: "材料科学与工程学院",
    major: "材料物理与化学",
    grade: "博士三年级",
    level: "专业版",
    levelColor: "purple",
    bio: "专注于二维材料的电子结构计算与拓扑性质研究",
    joinDate: "2024-03-15",
    stats: {
      totalJobs: 342,
      gpuHours: 1280.5,
      courses: 6,
      notebooks: 23,
      articles: 8,
      followers: 156,
      following: 42
    },
    runningJobs: [
      { id: "j001", title: "MoS₂ 能带结构计算", type: "DFT", software: "VASP", icon: "atom", iconColor: "primary", progress: 72, status: "running", submitted: "2026-08-23 08:30", eta: "2小时后" },
      { id: "j002", title: "石墨烯纳米带 输运性质", type: "DFT", software: "VASP", icon: "layers", iconColor: "blue", progress: 0, status: "queued", submitted: "2026-08-23 10:15", eta: "排队中" }
    ],
    completedJobs: [
      { id: "j003", title: "WTe₂ 拓扑表面态", type: "DFT", software: "VASP", icon: "magnet", iconColor: "purple", completed: "2026-08-22 16:40", duration: "6小时" },
      { id: "j004", title: "h-BN 声子谱计算", type: "DFT", software: "VASP", icon: "activity", iconColor: "green", completed: "2026-08-21 11:20", duration: "3.5小时" },
      { id: "j005", title: "石墨烯 分子动力学", type: "MD", software: "LAMMPS", icon: "dna", iconColor: "blue", completed: "2026-08-20 09:15", duration: "12小时" }
    ],
    notebooks: [
      { id: "nb001", title: "MoS₂ 能带分析与可视化", kernel: "Python 3.12", lastModified: "2026-08-23 09:45", cells: 34, icon: "trending-up" },
      { id: "nb002", title: "拓扑不变量计算流程", kernel: "Python 3.12", lastModified: "2026-08-22 14:30", cells: 28, icon: "git-branch" },
      { id: "nb003", title: "二维材料数据库筛选", kernel: "Python 3.12", lastModified: "2026-08-20 16:20", cells: 45, icon: "database" }
    ],
    courses: [
      { id: "c001", title: "密度泛函理论进阶", progress: 78, totalLessons: 16, currentLesson: "第13课：HSE06杂化泛函", icon: "atom", color: "orange" },
      { id: "c002", title: "第一性原理计算实战", progress: 100, totalLessons: 20, currentLesson: "已完成", icon: "flask-conical", color: "blue" },
      { id: "c003", title: "拓扑绝缘体导论", progress: 45, totalLessons: 12, currentLesson: "第6课：Z₂不变量", icon: "magnet", color: "purple" }
    ],
    articles: [
      { id: "a001", title: "MoS₂莫尔超晶格中的平带与强关联效应", likes: 89, comments: 23, views: 1240, date: "2026-08-18", tag: "拓扑材料" },
      { id: "a002", title: "VASP计算中k点网格收敛性的系统研究", likes: 156, comments: 45, views: 3200, date: "2026-08-10", tag: "计算方法" },
      { id: "a003", title: "二维铁电材料In₂Se₃的极化翻转机制", likes: 67, comments: 12, views: 890, date: "2026-07-28", tag: "铁电材料" }
    ],
    workflows: [
      { id: "wf001", name: "材料筛选→DFT验证→性质分析", status: "running", progress: 60, steps: 8, currentStep: "第5步：能带计算", icon: "workflow" },
      { id: "wf002", name: "缺陷形成能计算流水线", status: "completed", progress: 100, steps: 6, currentStep: "已完成", icon: "git-merge" }
    ]
  },
  {
    id: "u002",
    username: "wangxiaoyu",
    password: "wy123456",
    name: "王晓雨",
    avatar: "🔬",
    role: "硕士生",
    university: "复旦大学",
    department: "物理学系",
    major: "凝聚态物理",
    grade: "硕士二年级",
    level: "入门版",
    levelColor: "blue",
    bio: "研究方向为软物质物理与生物分子动力学模拟",
    joinDate: "2025-01-20",
    stats: {
      totalJobs: 89,
      gpuHours: 234.8,
      courses: 4,
      notebooks: 12,
      articles: 3,
      followers: 34,
      following: 58
    },
    runningJobs: [
      { id: "j010", title: "蛋白质折叠 MD 模拟", type: "MD", software: "GROMACS", icon: "dna", iconColor: "green", progress: 45, status: "running", submitted: "2026-08-23 06:00", eta: "8小时后" }
    ],
    completedJobs: [
      { id: "j011", title: "水合离子 径向分布函数", type: "MD", software: "GROMACS", icon: "activity", iconColor: "blue", completed: "2026-08-22 14:00", duration: "4小时" },
      { id: "j012", title: "磷脂双分子层 张力测试", type: "MD", software: "LAMMPS", icon: "layers", iconColor: "purple", completed: "2026-08-19 10:30", duration: "8小时" },
      { id: "j013", title: "聚合物 玻璃化转变温度", type: "MD", software: "LAMMPS", icon: "thermometer", iconColor: "orange", completed: "2026-08-15 16:45", duration: "16小时" }
    ],
    notebooks: [
      { id: "nb010", title: "RDF与MSD分析脚本", kernel: "Python 3.12", lastModified: "2026-08-23 08:15", cells: 22, icon: "bar-chart-3" },
      { id: "nb011", title: "蛋白质结构可视化", kernel: "Python 3.12", lastModified: "2026-08-21 13:40", cells: 18, icon: "eye" }
    ],
    courses: [
      { id: "c010", title: "分子动力学模拟入门", progress: 85, totalLessons: 14, currentLesson: "第12课：自由能计算", icon: "dna", color: "green" },
      { id: "c011", title: "Python科学计算", progress: 100, totalLessons: 18, currentLesson: "已完成", icon: "code-2", color: "blue" },
      { id: "c012", title: "统计物理基础", progress: 60, totalLessons: 16, currentLesson: "第10课：相变理论", icon: "activity", color: "orange" }
    ],
    articles: [
      { id: "a010", title: "GROMACS蛋白质模拟的力场选择指南", likes: 234, comments: 67, views: 5600, date: "2026-08-05", tag: "分子动力学" },
      { id: "a011", title: "MD模拟结果分析：从RDF到配位数", likes: 178, comments: 34, views: 4100, date: "2026-07-20", tag: "数据分析" }
    ],
    workflows: [
      { id: "wf010", name: "MD模拟→轨迹分析→可视化", status: "running", progress: 35, steps: 5, currentStep: "第2步：轨迹预处理", icon: "workflow" }
    ]
  },
  {
    id: "u003",
    username: "chensiyuan",
    password: "cs123456",
    name: "陈思远",
    avatar: "⚡",
    role: "本科生",
    university: "浙江大学",
    department: "物理学系",
    major: "应用物理学",
    grade: "本科三年级",
    level: "免费版",
    levelColor: "green",
    bio: "对量子计算和凝聚态物理充满热情的本科生",
    joinDate: "2025-09-01",
    stats: {
      totalJobs: 23,
      gpuHours: 45.2,
      courses: 8,
      notebooks: 5,
      articles: 1,
      followers: 12,
      following: 89
    },
    runningJobs: [],
    completedJobs: [
      { id: "j020", title: "一维谐振子 数值求解", type: "数值计算", software: "Python", icon: "activity", iconColor: "green", completed: "2026-08-20 15:30", duration: "10分钟" },
      { id: "j021", title: "氢原子 波函数可视化", type: "数值计算", software: "Python", icon: "orbit", iconColor: "blue", completed: "2026-08-18 11:20", duration: "5分钟" },
      { id: "j022", title: "简单立方晶格 声子谱", type: "DFT", software: "VASP", icon: "atom", iconColor: "primary", completed: "2026-08-10 09:45", duration: "2小时" }
    ],
    notebooks: [
      { id: "nb020", title: "量子力学作业：无限深势阱", kernel: "Python 3.12", lastModified: "2026-08-22 20:15", cells: 15, icon: "book-open" },
      { id: "nb021", title: "固体物理：布里渊区绘制", kernel: "Python 3.12", lastModified: "2026-08-15 14:30", cells: 12, icon: "grid-3x3" }
    ],
    courses: [
      { id: "c020", title: "量子力学奇妙之旅", progress: 90, totalLessons: 12, currentLesson: "第11课：量子纠缠", icon: "orbit", color: "blue" },
      { id: "c021", title: "Python编程入门", progress: 100, totalLessons: 20, currentLesson: "已完成", icon: "code-2", color: "green" },
      { id: "c022", title: "虚拟实验室：经典力学", progress: 70, totalLessons: 10, currentLesson: "第7课：碰撞与动量", icon: "microscope", color: "orange" },
      { id: "c023", title: "材料科学基础", progress: 35, totalLessons: 20, currentLesson: "第7课：晶体缺陷", icon: "flask-conical", color: "purple" }
    ],
    articles: [
      { id: "a020", title: "从零开始：我的第一次DFT计算经历", likes: 45, comments: 8, views: 680, date: "2026-08-12", tag: "学习笔记" }
    ],
    workflows: []
  }
];

// 当前登录用户
let currentUserIndex = 0;
let currentUser = MOCK_USERS[currentUserIndex];

function switchUser(index) {
  currentUserIndex = index;
  currentUser = MOCK_USERS[index];
  if (typeof renderAll === 'function') renderAll();
  if (window.lucide) lucide.createIcons();
}

function getCurrentUser() {
  return currentUser;
}

function getAllUsers() {
  return MOCK_USERS;
}
