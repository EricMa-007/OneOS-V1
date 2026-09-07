/**
 * UniSci Platform V2 - 板块2: 计算任务系统
 * 包含: 任务管理/新建向导5步/详情5Tab/结果5Tab/实时日志/费用预估
 */

'use strict';

// ============================================================
// 一、任务管理器 (JobManager)
// ============================================================
const JobManager = {
  // 计算类型定义
  jobTypes: [
    { id: 'DFT', name: 'DFT 第一性原理', icon: 'atom', description: '电子结构、能带、态密度', software: ['VASP','Quantum ESPRESSO','ABACUS','CP2K'] },
    { id: 'MD', name: 'MD 分子动力学', icon: 'dna', description: '原子运动、热力学、扩散', software: ['GROMACS','LAMMPS','NAMD'] },
    { id: 'ML', name: 'ML 机器学习', icon: 'brain', description: '势函数训练、性质预测', software: ['DeepMD-kit','SchNetPack','MACE'] },
    { id: 'FEM', name: '有限元分析', icon: 'grid-3x3', description: '力学、热学、电磁仿真', software: ['COMSOL','Abaqus','ANSYS'] },
    { id: 'QC', name: '量子化学', icon: 'orbit', description: '分子轨道、光谱、反应能', software: ['Gaussian','ORCA','Q-Chem'] },
    { id: 'NUMERICAL', name: '数值计算', icon: 'calculator', description: '自定义脚本、数据分析', software: ['Python','Julia','MATLAB'] }
  ],
  
  // 软件版本
  softwareVersions: {
    'VASP': ['6.4.2','6.4.0','6.3.2'],
    'Quantum ESPRESSO': ['7.2','7.1','6.8'],
    'ABACUS': ['3.5.0','3.4.0','3.2.0'],
    'CP2K': ['2024.1','2023.2','2023.1'],
    'GROMACS': ['2024.2','2024.1','2023.4'],
    'LAMMPS': ['2024.06','2024.02','2023.12'],
    'NAMD': ['3.0','2.14','2.13'],
    'DeepMD-kit': ['2.2.1','2.2.0','2.1.5'],
    'SchNetPack': ['2.0','1.0'],
    'MACE': ['0.3.0','0.2.0'],
    'Gaussian': ['16 C.01','16 B.01'],
    'ORCA': ['5.0.4','5.0.3'],
    'Q-Chem': ['6.1','6.0'],
    'Python': ['3.12','3.11','3.10'],
    'Julia': ['1.10','1.9'],
    'MATLAB': ['R2024a','R2023b']
  },
  
  // 资源配置选项
  resourceOptions: {
    cpuCores: [8, 16, 32, 64, 128],
    gpuModels: [
      { id: null, name: '不使用GPU' },
      { id: 'A100-40G', name: 'A100 40G' },
      { id: 'A100-80G', name: 'A100 80G' },
      { id: 'H100-80G', name: 'H100 80G' }
    ],
    memory: ['auto','32G','64G','128G','256G'],
    maxDuration: ['1h','6h','12h','24h','72h'],
    priority: [
      { id: 'normal', name: '普通', multiplier: 1.0 },
      { id: 'priority', name: '优先', multiplier: 1.5 },
      { id: 'urgent', name: '加急', multiplier: 2.0 }
    ]
  },
  
  // 获取用户所有任务
  getAllJobs() {
    const user = UserManager.getCurrentUser();
    return [...(user.runningJobs || []), ...(user.completedJobs || [])];
  },
  
  // 按状态筛选任务
  getJobsByStatus(status) {
    const all = this.getAllJobs();
    if (status === 'all') return all;
    if (status === 'running') return all.filter(j => j.status === 'running' || j.status === 'queued');
    if (status === 'completed') return all.filter(j => j.status === 'completed' || j.status === 'failed' || j.status === 'cancelled');
    if (status === 'queued') return all.filter(j => j.status === 'queued');
    return all;
  },
  
  // 获取任务详情
  getJob(id) {
    return this.getAllJobs().find(j => j.id === id) || null;
  },
  
  // 创建任务
  createJob(config) {
    const user = UserManager.getCurrentUser();
    const job = {
      id: 'job_' + Date.now(),
      title: config.title || (config.type + ' ' + config.software + ' ' + new Date().toLocaleDateString()),
      type: config.type,
      software: config.software,
      softwareVersion: config.softwareVersion,
      status: 'queued',
      progress: 0,
      icon: this.jobTypes.find(t => t.id === config.type)?.icon || 'cpu',
      iconColor: 'blue',
      submitted: new Date().toLocaleString('zh-CN'),
      submittedAt: new Date().toISOString(),
      startedAt: null,
      completedAt: null,
      eta: '排队中...',
      duration: '-',
      config: config.resourceConfig,
      inputFiles: config.inputFiles || [],
      outputFiles: [],
      logs: [
        { timestamp: new Date().toISOString(), level: 'INFO', message: '任务已提交，正在排队等待调度...' }
      ],
      results: null,
      cost: 0,
      userId: user.id
    };
    
    if (!user.runningJobs) user.runningJobs = [];
    user.runningJobs.unshift(job);
    user.stats.totalJobs = (user.stats.totalJobs || 0) + 1;
    
    // 模拟任务开始
    setTimeout(() => this.startJob(job.id), 2000 + Math.random() * 3000);
    
    return job;
  },
  
  // 开始任务
  startJob(id) {
    const job = this.getJob(id);
    if (!job || job.status !== 'queued') return;
    job.status = 'running';
    job.startedAt = new Date().toISOString();
    job.eta = '约 ' + (5 + Math.floor(Math.random() * 20)) + ' 分钟';
    job.logs.push({ timestamp: new Date().toISOString(), level: 'INFO', message: '任务开始执行，加载输入文件...' });
    job.logs.push({ timestamp: new Date().toISOString(), level: 'INFO', message: `读取输入文件: ${job.inputFiles.length} 个文件` });
    job.logs.push({ timestamp: new Date().toISOString(), level: 'INFO', message: `软件: ${job.software} ${job.softwareVersion}` });
    
    // 模拟进度推进
    this.simulateProgress(id);
  },
  
  // 模拟进度
  simulateProgress(id) {
    const job = this.getJob(id);
    if (!job || job.status !== 'running') return;
    
    const interval = setInterval(() => {
      const currentJob = this.getJob(id);
      if (!currentJob || currentJob.status !== 'running') {
        clearInterval(interval);
        return;
      }
      
      currentJob.progress = Math.min(95, currentJob.progress + Math.random() * 3);
      
      // 随机添加日志
      if (Math.random() > 0.5) {
        const logMessages = [
          { level: 'INFO', msg: '电子自洽迭代中...' },
          { level: 'INFO', msg: '力收敛计算中...' },
          { level: 'INFO', msg: `SCF循环 ${Math.floor(currentJob.progress/10)+1}: 能量收敛中` },
          { level: 'WARN', msg: '电子步收敛较慢，已调整混合参数' },
          { level: 'INFO', msg: '正在写入中间结果...' }
        ];
        const log = logMessages[Math.floor(Math.random() * logMessages.length)];
        currentJob.logs.push({ timestamp: new Date().toISOString(), level: log.level, message: log.msg });
      }
      
      // 完成
      if (currentJob.progress >= 95) {
        clearInterval(interval);
        this.completeJob(id);
      }
    }, 1500);
  },
  
  // 完成任务
  completeJob(id) {
    const job = this.getJob(id);
    if (!job) return;
    job.status = 'completed';
    job.progress = 100;
    job.completedAt = new Date().toISOString();
    job.duration = (5 + Math.floor(Math.random() * 20)) + ' 分钟';
    job.eta = '已完成';
    job.logs.push({ timestamp: new Date().toISOString(), level: 'INFO', message: '计算完成，正在生成结果文件...' });
    job.logs.push({ timestamp: new Date().toISOString(), level: 'INFO', message: '任务执行完成！' });
    
    // 生成模拟结果
    job.results = {
      bandgap: (1.2 + Math.random() * 2).toFixed(2),
      totalEnergy: (-80 - Math.random() * 20).toFixed(2),
      fermiLevel: (-3 - Math.random() * 2).toFixed(2),
      magneticMoment: (Math.random() * 2).toFixed(2),
      latticeConstants: { a: (3.0 + Math.random()).toFixed(2), b: (3.0 + Math.random()).toFixed(2), c: (12 + Math.random() * 5).toFixed(2) }
    };
    
    job.outputFiles = [
      { name: 'OUTCAR', size: (2 + Math.random() * 5).toFixed(1) + ' MB', type: 'text' },
      { name: 'OSZICAR', size: (50 + Math.random() * 100) + ' KB', type: 'text' },
      { name: 'PROCAR', size: (1 + Math.random() * 3).toFixed(1) + ' MB', type: 'binary' },
      { name: 'CHGCAR', size: (500 + Math.random() * 500) + ' KB', type: 'binary' },
      { name: 'CONTCAR', size: (2 + Math.random() * 3) + ' KB', type: 'text' }
    ];
    
    job.cost = (Math.random() * 50 + 10).toFixed(2);
    
    // 从runningJobs移到completedJobs
    const user = UserManager.getCurrentUser();
    const idx = user.runningJobs.findIndex(j => j.id === id);
    if (idx >= 0) {
      user.runningJobs.splice(idx, 1);
      user.completedJobs.unshift(job);
    }
    
    // 发送通知
    if (typeof Notification !== 'undefined') {
      Notification.push({
        type: 'job',
        title: '计算任务完成',
        message: `${job.title} 已完成`,
        time: '刚刚'
      });
    }
    
    // 获得积分
    AchievementSystem.addPoints(user, 20, '完成计算任务');
    AchievementSystem.checkBadges(user);
  },
  
  // 取消任务
  cancelJob(id) {
    const job = this.getJob(id);
    if (!job) return false;
    if (job.status !== 'running' && job.status !== 'queued') return false;
    
    job.status = 'cancelled';
    job.logs.push({ timestamp: new Date().toISOString(), level: 'WARN', message: '任务已被用户取消' });
    
    const user = UserManager.getCurrentUser();
    const idx = user.runningJobs.findIndex(j => j.id === id);
    if (idx >= 0) {
      user.runningJobs.splice(idx, 1);
      user.completedJobs.unshift(job);
    }
    return true;
  },
  
  // 删除任务
  deleteJob(id) {
    const user = UserManager.getCurrentUser();
    user.completedJobs = (user.completedJobs || []).filter(j => j.id !== id);
    user.runningJobs = (user.runningJobs || []).filter(j => j.id !== id);
    user.stats.totalJobs = Math.max(0, (user.stats.totalJobs || 1) - 1);
  },
  
  // 费用预估
  estimateCost(config) {
    const cpuCost = config.cpuCores * 0.05;
    const gpuCost = config.gpuCount * 8;
    const hours = parseFloat(config.maxDuration) || 12;
    const priorityMultiplier = this.resourceOptions.priority.find(p => p.id === config.priority)?.multiplier || 1.0;
    const min = (cpuCost + gpuCost) * hours * priorityMultiplier * 0.8;
    const max = (cpuCost + gpuCost) * hours * priorityMultiplier * 1.2;
    return { min: min.toFixed(2), max: max.toFixed(2) };
  }
};

// ============================================================
// 二、新建任务向导 (NewJobWizard)
// ============================================================
const NewJobWizard = {
  currentStep: 1,
  form: {
    selectedType: null,
    selectedSoftware: null,
    softwareVersion: null,
    resourceConfig: {
      cpuCores: 16,
      gpuModel: null,
      gpuCount: 0,
      memory: 'auto',
      maxDuration: '12h',
      priority: 'normal'
    },
    inputFiles: [],
    jobTitle: ''
  },
  
  // 初始化向导
  init(prefillData) {
    this.currentStep = 1;
    if (prefillData) {
      this.form = { ...this.form, ...prefillData };
    }
    this.render();
  },
  
  // 渲染当前步骤
  render() {
    const container = document.getElementById('job-new-content');
    if (!container) return;
    
    let content = '';
    switch(this.currentStep) {
      case 1: content = this.renderStep1(); break;
      case 2: content = this.renderStep2(); break;
      case 3: content = this.renderStep3(); break;
      case 4: content = this.renderStep4(); break;
      case 5: content = this.renderStep5(); break;
    }
    
    container.innerHTML = `
      <!-- 步骤指示器 -->
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:24px;padding:0 8px">
        ${[1,2,3,4,5].map(step => {
          const isCompleted = step < this.currentStep;
          const isCurrent = step === this.currentStep;
          const color = isCompleted ? 'var(--green)' : isCurrent ? 'var(--primary)' : 'var(--text3)';
          return `
            <div style="display:flex;align-items:center;flex:${step<5?1:'none'}">
              <div style="width:32px;height:32px;border-radius:50%;background:${color};display:flex;align-items:center;justify-content:center;color:#fff;font-size:13px;font-weight:700;flex-shrink:0;cursor:${isCompleted?'pointer':'default'}" ${isCompleted?`onclick="NewJobWizard.goToStep(${step})"`:''}>
                ${isCompleted ? '<i data-lucide="check" class="lucide" style="width:16px;height:16px"></i>' : step}
              </div>
              ${step < 5 ? `<div style="flex:1;height:2px;background:${step<this.currentStep?'var(--green)':'var(--border)'};margin:0 4px"></div>` : ''}
            </div>
          `;
        }).join('')}
      </div>
      ${content}
      <!-- 导航按钮 -->
      <div style="display:flex;gap:12px;margin-top:24px">
        ${this.currentStep > 1 ? `<button class="btn btn-secondary" style="flex:1" onclick="NewJobWizard.prevStep()"><i data-lucide="arrow-left" class="lucide"></i>上一步</button>` : ''}
        ${this.currentStep < 5 ? 
          `<button class="btn btn-primary" style="flex:1" onclick="NewJobWizard.nextStep()" ${this.canProceed()?'':'disabled opacity:50'}>下一步<i data-lucide="arrow-right" class="lucide icon-white"></i></button>` :
          `<button class="btn btn-primary" style="flex:1" onclick="NewJobWizard.submit()"><i data-lucide="rocket" class="lucide icon-white"></i>提交任务</button>`
        }
      </div>
    `;
    if (typeof renderIcons === 'function') renderIcons();
    // 增强术语解释 - 第三纵队全民可及
    if (typeof Terminology !== 'undefined') {
      const jtc = document.getElementById('job-tab-content');
      if (jtc) Terminology.enhanceTerms(jtc);
    }
  },
  
  // 步骤1: 计算类型
  renderStep1() {
    return `
      <div class="section-header"><div class="section-title" style="font-size:16px">选择计算类型</div></div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
        ${JobManager.jobTypes.map(type => `
          <div onclick="NewJobWizard.selectType('${type.id}')" style="padding:16px;border:2px solid ${this.form.selectedType===type.id?'var(--primary)':'var(--border)'};border-radius:14px;cursor:pointer;background:${this.form.selectedType===type.id?'var(--bg-secondary)':'#fff'};transition:all 0.2s">
            <div style="width:40px;height:40px;background:linear-gradient(135deg,var(--primary),var(--primary2));border-radius:12px;display:flex;align-items:center;justify-content:center;margin-bottom:10px">
              <i data-lucide="${type.icon}" class="lucide icon-white" style="width:20px;height:20px"></i>
            </div>
            <div style="font-size:14px;font-weight:700;margin-bottom:4px">${type.name}</div>
            <div style="font-size:11px;color:var(--text3);line-height:1.4">${type.description}</div>
          </div>
        `).join('')}
      </div>
    `;
  },
  
  // 步骤2: 计算软件
  renderStep2() {
    const type = JobManager.jobTypes.find(t => t.id === this.form.selectedType);
    const softwareList = type?.software || [];
    return `
      <div class="section-header"><div class="section-title" style="font-size:16px">选择计算软件</div><div class="section-more">${type?.name}</div></div>
      <div style="display:flex;flex-direction:column;gap:10px">
        ${softwareList.map(sw => `
          <div onclick="NewJobWizard.selectSoftware('${sw}')" style="padding:14px 16px;border:2px solid ${this.form.selectedSoftware===sw?'var(--primary)':'var(--border)'};border-radius:12px;cursor:pointer;background:${this.form.selectedSoftware===sw?'var(--bg-secondary)':'#fff'};display:flex;justify-content:space-between;align-items:center">
            <div>
              <div style="font-size:15px;font-weight:700">${sw}</div>
              <div style="font-size:11px;color:var(--text3);margin-top:2px">${(JobManager.softwareVersions[sw]||[])[0]||''} 最新版本</div>
            </div>
            <div style="display:flex;align-items:center;gap:8px">
              <select class="form-select" style="width:auto;padding:6px 10px;font-size:12px" onclick="event.stopPropagation()" onchange="NewJobWizard.form.softwareVersion=this.value">
                ${(JobManager.softwareVersions[sw]||[]).map(v => `<option ${this.form.softwareVersion===v?'selected':''}>${v}</option>`).join('')}
              </select>
              ${this.form.selectedSoftware===sw ? '<i data-lucide="check-circle" class="lucide" style="width:20px;height:20px;color:var(--primary)"></i>' : ''}
            </div>
          </div>
        `).join('')}
      </div>
    `;
  },
  
  // 步骤3: 资源配置
  renderStep3() {
    const rc = this.form.resourceConfig;
    const cost = JobManager.estimateCost(rc);
    const supportsGPU = this.form.selectedType === 'MD' || this.form.selectedType === 'ML';
    return `
      <div class="section-header"><div class="section-title" style="font-size:16px">配置计算资源</div></div>
      
      <div class="card">
        <div class="form-group"><label class="form-label">CPU 核数</label>
          <div class="chip-row">
            ${JobManager.resourceOptions.cpuCores.map(c => `<span class="chip ${rc.cpuCores===c?'selected':''}" onclick="NewJobWizard.form.resourceConfig.cpuCores=${c};NewJobWizard.render()">${c} 核</span>`).join('')}
          </div>
        </div>
        
        ${supportsGPU ? `
        <div class="form-group"><label class="form-label">GPU 型号</label>
          <div class="chip-row">
            ${JobManager.resourceOptions.gpuModels.map(g => `<span class="chip ${rc.gpuModel===g.id?'selected':''}" onclick="NewJobWizard.form.resourceConfig.gpuModel='${g.id}';NewJobWizard.form.resourceConfig.gpuCount=${g.id?1:0};NewJobWizard.render()">${g.name}</span>`).join('')}
          </div>
        </div>
        ` : '<div style="padding:10px 12px;background:#fff8e6;border-radius:8px;font-size:12px;color:#b8860b;margin-bottom:12px"><i data-lucide="info" class="lucide" style="width:14px;height:14px;vertical-align:middle"></i> 当前计算类型不支持GPU加速</div>'}
        
        <div class="form-group"><label class="form-label">内存</label>
          <div class="chip-row">
            ${JobManager.resourceOptions.memory.map(m => `<span class="chip ${rc.memory===m?'selected':''}" onclick="NewJobWizard.form.resourceConfig.memory='${m}';NewJobWizard.render()">${m==='auto'?'自动':m}</span>`).join('')}
          </div>
        </div>
        
        <div class="form-group"><label class="form-label">最大运行时长</label>
          <div class="chip-row">
            ${JobManager.resourceOptions.maxDuration.map(d => `<span class="chip ${rc.maxDuration===d?'selected':''}" onclick="NewJobWizard.form.resourceConfig.maxDuration='${d}';NewJobWizard.render()">${d}</span>`).join('')}
          </div>
        </div>
        
        <div class="form-group"><label class="form-label">队列优先级</label>
          <div class="chip-row">
            ${JobManager.resourceOptions.priority.map(p => `<span class="chip ${rc.priority===p.id?'selected':''}" onclick="NewJobWizard.form.resourceConfig.priority='${p.id}';NewJobWizard.render()">${p.name}</span>`).join('')}
          </div>
        </div>
      </div>
      
      <div class="card" style="background:linear-gradient(135deg,#fff0e8,#ffe8e0)">
        <div style="display:flex;justify-content:space-between;align-items:center">
          <div><div style="font-size:13px;color:var(--text3)">预估费用</div><div style="font-size:24px;font-weight:800;color:var(--primary);margin-top:4px">¥${cost.min} ~ ¥${cost.max}</div></div>
          <i data-lucide="credit-card" class="lucide" style="width:32px;height:32px;color:var(--primary);opacity:0.5"></i>
        </div>
      </div>
    `;
  },
  
  // 步骤4: 输入文件
  renderStep4() {
    return `
      <div class="section-header"><div class="section-title" style="font-size:16px">上传输入文件</div></div>
      
      <div onclick="NewJobWizard.addMockFile()" style="border:2px dashed var(--border);border-radius:14px;padding:32px;text-align:center;cursor:pointer;background:var(--bg-secondary);margin-bottom:16px">
        <i data-lucide="upload-cloud" class="lucide icon-2xl" style="color:var(--text3);width:40px;height:40px"></i>
        <div style="font-size:14px;font-weight:600;margin-top:12px">点击或拖拽上传文件</div>
        <div style="font-size:12px;color:var(--text3);margin-top:4px">支持 POSCAR / INCAR / KPOINTS / POTCAR 等</div>
      </div>
      
      <div class="chip-row" style="margin-bottom:16px">
        <span class="chip" onclick="NewJobWizard.addTemplateFile()"><i data-lucide="file-template" class="lucide" style="width:14px;height:14px"></i>从模板选择</span>
        <span class="chip" onclick="UI.toast.info('跳转到分子建模器')"><i data-lucide="atom" class="lucide" style="width:14px;height:14px"></i>分子建模</span>
        <span class="chip" onclick="NewJobWizard.addMockFile(true)"><i data-lucide="history" class="lucide" style="width:14px;height:14px"></i>历史任务</span>
      </div>
      
      ${this.form.inputFiles.length > 0 ? `
        <div class="section-header"><div class="section-title" style="font-size:14px">已上传文件 (${this.form.inputFiles.length})</div></div>
        <div class="card" style="padding:0">
          ${this.form.inputFiles.map((f,i) => `
            <div style="display:flex;justify-content:space-between;align-items:center;padding:12px 16px;border-bottom:1px solid var(--border)">
              <div style="display:flex;align-items:center;gap:10px">
                <i data-lucide="file-text" class="lucide" style="width:18px;height:18px;color:var(--blue)"></i>
                <div><div style="font-size:13px;font-weight:600">${f.name}</div><div style="font-size:11px;color:var(--text3)">${f.size}</div></div>
              </div>
              <button onclick="NewJobWizard.removeFile(${i})" style="background:none;border:none;cursor:pointer;color:var(--primary)"><i data-lucide="x" class="lucide" style="width:18px;height:18px"></i></button>
            </div>
          `).join('')}
        </div>
      ` : `
        <div class="card" style="background:#fff8e6;padding:16px">
          <div style="font-size:12px;color:#b8860b"><i data-lucide="alert-triangle" class="lucide" style="width:14px;height:14px;vertical-align:middle"></i> 提示：${this.form.selectedSoftware} 计算需要以下文件：POSCAR, INCAR, KPOINTS, POTCAR</div>
        </div>
      `}
    `;
  },
  
  // 步骤5: 确认提交
  renderStep5() {
    const type = JobManager.jobTypes.find(t => t.id === this.form.selectedType);
    const rc = this.form.resourceConfig;
    const cost = JobManager.estimateCost(rc);
    const defaultTitle = `${this.form.selectedType} ${this.form.selectedSoftware} ${new Date().toLocaleDateString('zh-CN')}`;
    return `
      <div class="section-header"><div class="section-title" style="font-size:16px">确认任务信息</div></div>
      
      <div class="card">
        <div class="form-group"><label class="form-label">任务名称</label>
          <input class="form-input" id="job-title-input" value="${this.form.jobTitle || defaultTitle}" oninput="NewJobWizard.form.jobTitle=this.value">
        </div>
      </div>
      
      <div class="card" style="padding:0">
        ${[
          {label:'计算类型', value:type?.name, step:1, icon:'atom'},
          {label:'计算软件', value:`${this.form.selectedSoftware} ${this.form.softwareVersion||''}`, step:2, icon:'cpu'},
          {label:'计算资源', value:`${rc.cpuCores}核 CPU${rc.gpuCount?` + ${rc.gpuCount}×${rc.gpuModel}`:''} · ${rc.memory==='auto'?'自动内存':rc.memory} · ${rc.maxDuration}`, step:3, icon:'server'},
          {label:'输入文件', value:`${this.form.inputFiles.length} 个文件`, step:4, icon:'file-text'}
        ].map(item => `
          <div style="display:flex;justify-content:space-between;align-items:center;padding:14px 16px;border-bottom:1px solid var(--border)">
            <div style="display:flex;align-items:center;gap:10px">
              <div style="width:32px;height:32px;background:var(--bg-secondary);border-radius:8px;display:flex;align-items:center;justify-content:center">
                <i data-lucide="${item.icon}" class="lucide" style="width:16px;height:16px;color:var(--text2)"></i>
              </div>
              <div><div style="font-size:12px;color:var(--text3)">${item.label}</div><div style="font-size:13px;font-weight:600;margin-top:2px">${item.value}</div></div>
            </div>
            <button onclick="NewJobWizard.goToStep(${item.step})" style="background:none;border:none;cursor:pointer;color:var(--primary);font-size:12px">修改</button>
          </div>
        `).join('')}
      </div>
      
      <div class="card" style="background:linear-gradient(135deg,#fff0e8,#ffe8e0)">
        <div style="display:flex;justify-content:space-between;align-items:center">
          <div><div style="font-size:12px;color:var(--text3)">预估费用</div><div style="font-size:20px;font-weight:800;color:var(--primary);margin-top:4px">¥${cost.min} ~ ¥${cost.max}</div></div>
          <div style="text-align:right"><div style="font-size:12px;color:var(--text3)">优先级</div><div style="font-size:14px;font-weight:700;margin-top:4px">${JobManager.resourceOptions.priority.find(p=>p.id===rc.priority)?.name||'普通'}</div></div>
        </div>
      </div>
      
      <label style="display:flex;align-items:flex-start;gap:8px;font-size:12px;color:var(--text2);margin-top:16px">
        <input type="checkbox" id="job-agree" checked style="margin-top:2px"> 我已阅读并同意 <span style="color:var(--primary)">计算服务协议</span> 和 <span style="color:var(--primary)">数据安全规范</span>
      </label>
    `;
  },
  
  // 选择类型
  selectType(typeId) {
    this.form.selectedType = typeId;
    this.form.selectedSoftware = null;
    this.form.softwareVersion = null;
    this.render();
  },
  
  // 选择软件
  selectSoftware(sw) {
    this.form.selectedSoftware = sw;
    this.form.softwareVersion = (JobManager.softwareVersions[sw]||[])[0] || null;
    this.render();
  },
  
  // 添加模拟文件
  addMockFile(multi) {
    const mockFiles = [
      { name: 'POSCAR', size: '2.3 KB' },
      { name: 'INCAR', size: '1.8 KB' },
      { name: 'KPOINTS', size: '0.5 KB' },
      { name: 'POTCAR', size: '156 KB' }
    ];
    if (multi) {
      this.form.inputFiles = [...mockFiles];
    } else {
      const nextFile = mockFiles[this.form.inputFiles.length % mockFiles.length];
      this.form.inputFiles.push({ ...nextFile });
    }
    UI.toast.success('文件上传成功');
    this.render();
  },
  
  addTemplateFile() {
    this.form.inputFiles = [
      { name: 'POSCAR (模板)', size: '2.1 KB' },
      { name: 'INCAR (模板)', size: '1.5 KB' },
      { name: 'KPOINTS (模板)', size: '0.3 KB' }
    ];
    UI.toast.success('已从模板加载文件');
    this.render();
  },
  
  removeFile(index) {
    this.form.inputFiles.splice(index, 1);
    this.render();
  },
  
  // 是否可以进入下一步
  canProceed() {
    switch(this.currentStep) {
      case 1: return !!this.form.selectedType;
      case 2: return !!this.form.selectedSoftware;
      case 3: return true;
      case 4: return this.form.inputFiles.length > 0;
      default: return true;
    }
  },
  
  // 下一步
  nextStep() {
    if (!this.canProceed()) {
      UI.toast.warning('请完成当前步骤的选择');
      return;
    }
    if (this.currentStep < 5) {
      this.currentStep++;
      this.render();
    }
  },
  
  // 上一步
  prevStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
      this.render();
    }
  },
  
  // 跳转到指定步骤
  goToStep(step) {
    if (step < this.currentStep) {
      this.currentStep = step;
      this.render();
    }
  },
  
  // 提交任务
  submit() {
    const agree = document.getElementById('job-agree');
    if (agree && !agree.checked) {
      UI.toast.warning('请先同意服务协议');
      return;
    }
    
    const job = JobManager.createJob({
      title: this.form.jobTitle || `${this.form.selectedType} ${this.form.selectedSoftware}`,
      type: this.form.selectedType,
      software: this.form.selectedSoftware,
      softwareVersion: this.form.softwareVersion,
      resourceConfig: this.form.resourceConfig,
      inputFiles: this.form.inputFiles
    });
    
    UI.toast.success('任务提交成功！');
    
    // 显示提交成功页面
    const container = document.getElementById('job-new-content');
    container.innerHTML = `
      <div style="text-align:center;padding:40px 20px">
        <div style="width:80px;height:80px;margin:0 auto;background:linear-gradient(135deg,var(--green),#7edda8);border-radius:50%;display:flex;align-items:center;justify-content:center;animation:pulse 1s ease-in-out">
          <i data-lucide="check" class="lucide icon-white" style="width:40px;height:40px"></i>
        </div>
        <h2 style="font-size:20px;font-weight:800;margin-top:20px">任务提交成功！</h2>
        <p style="font-size:13px;color:var(--text3);margin-top:8px">任务ID: ${job.id}</p>
        <p style="font-size:13px;color:var(--text3);margin-top:4px">预计开始时间: 排队中...</p>
        <div style="display:flex;gap:12px;margin-top:24px">
          <button class="btn btn-secondary" style="flex:1" onclick="switchTab('compute')">返回列表</button>
          <button class="btn btn-primary" style="flex:1" onclick="navigateTo('page-job-detail','${_store(job)}')">查看任务</button>
        </div>
      </div>
    `;
    if (typeof renderIcons === 'function') renderIcons();
    
    // 重置向导
    setTimeout(() => {
      this.currentStep = 1;
      this.form = {
        selectedType: null, selectedSoftware: null, softwareVersion: null,
        resourceConfig: { cpuCores: 16, gpuModel: null, gpuCount: 0, memory: 'auto', maxDuration: '12h', priority: 'normal' },
        inputFiles: [], jobTitle: ''
      };
    }, 100);
  }
};

// ============================================================
// 三、任务详情渲染器 (JobDetailRenderer)
// ============================================================
const JobDetailRenderer = {
  currentTab: 'overview',
  autoRefreshInterval: null,
  
  render(job) {
    if (!job) return;
    this.currentJob = job;
    this.renderHeader(job);
    this.renderTabs();
    this.renderTabContent(job);
    
    // 运行中任务自动刷新
    if (this.autoRefreshInterval) clearInterval(this.autoRefreshInterval);
    if (job.status === 'running' || job.status === 'queued') {
      this.autoRefreshInterval = setInterval(() => {
        const currentJob = JobManager.getJob(job.id);
        if (currentJob && (currentJob.status === 'running' || currentJob.status === 'queued')) {
          this.currentJob = currentJob;
          if (this.currentTab === 'overview') this.renderOverview(currentJob);
          if (this.currentTab === 'logs') this.renderLogs(currentJob);
        } else {
          clearInterval(this.autoRefreshInterval);
          this.render(currentJob || job);
        }
      }, 3000);
    }
  },
  
  renderHeader(job) {
    const titleEl = document.getElementById('job-detail-title');
    if (titleEl) titleEl.textContent = job.title;
  },
  
  renderTabs() {
    const container = document.getElementById('job-detail-content');
    if (!container) return;
    container.innerHTML = `
      <div class="tab-bar" style="margin-bottom:16px">
        ${[
          {id:'overview',name:'概览',icon:'layout-dashboard'},
          {id:'logs',name:'日志',icon:'terminal'},
          {id:'config',name:'配置',icon:'settings'},
          {id:'results',name:'结果',icon:'bar-chart-3'},
          {id:'files',name:'文件',icon:'folder'}
        ].map(tab => `
          <button class="tab-item ${this.currentTab===tab.id?'active':''}" onclick="JobDetailRenderer.switchTab('${tab.id}')">
            <i data-lucide="${tab.icon}" class="lucide" style="width:14px;height:14px"></i>${tab.name}
          </button>
        `).join('')}
      </div>
      <div id="job-tab-content"></div>
      <div id="job-detail-actions" style="margin-top:20px"></div>
    `;
  },
  
  switchTab(tab) {
    this.currentTab = tab;
    this.renderTabs();
    this.renderTabContent(this.currentJob);
    if (typeof renderIcons === 'function') renderIcons();
  },
  
  renderTabContent(job) {
    const content = document.getElementById('job-tab-content');
    if (!content) return;
    switch(this.currentTab) {
      case 'overview': this.renderOverview(job); break;
      case 'logs': this.renderLogs(job); break;
      case 'config': this.renderConfig(job); break;
      case 'results': this.renderResults(job); break;
      case 'files': this.renderFiles(job); break;
    }
    this.renderActions(job);
    if (typeof renderIcons === 'function') renderIcons();
  },
  
  renderOverview(job) {
    const content = document.getElementById('job-tab-content');
    const isRunning = job.status === 'running' || job.status === 'queued';
    content.innerHTML = `
      <div class="card">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
          <div style="display:flex;align-items:center;gap:10px">
            <div style="width:40px;height:40px;background:linear-gradient(135deg,var(--blue),var(--blue2));border-radius:12px;display:flex;align-items:center;justify-content:center">
              <i data-lucide="${job.icon||'cpu'}" class="lucide icon-white" style="width:20px;height:20px"></i>
            </div>
            <div><div style="font-size:16px;font-weight:700">${job.title}</div><div style="font-size:12px;color:var(--text3)">${job.software} ${job.softwareVersion||''} · ${job.type}</div></div>
          </div>
          <span class="card-badge ${job.status==='running'?'badge-running':job.status==='completed'?'badge-completed':job.status==='failed'?'badge-running':'badge-queued'}">${job.status==='running'?'运行中':job.status==='completed'?'已完成':job.status==='failed'?'失败':job.status==='cancelled'?'已取消':'排队中'}</span>
        </div>
        
        ${isRunning ? `
          <div style="margin-bottom:16px">
            <div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:8px">
              <span style="font-weight:600">计算进度</span>
              <span style="color:var(--primary);font-weight:700">${job.progress}%</span>
            </div>
            <div class="progress-track" style="height:10px"><div class="progress-fill pf-blue" style="width:${job.progress}%"></div></div>
            <div style="font-size:12px;color:var(--text3);margin-top:8px">预计完成: ${job.eta}</div>
          </div>
        ` : ''}
        
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
          <div style="background:var(--bg-secondary);padding:12px;border-radius:10px">
            <div style="font-size:11px;color:var(--text3)">提交时间</div>
            <div style="font-size:13px;font-weight:700;margin-top:4px">${job.submitted||job.submittedAt||'-'}</div>
          </div>
          <div style="background:var(--bg-secondary);padding:12px;border-radius:10px">
            <div style="font-size:11px;color:var(--text3)">${isRunning?'预计完成':'计算时长'}</div>
            <div style="font-size:13px;font-weight:700;margin-top:4px">${isRunning?job.eta:job.duration}</div>
          </div>
          <div style="background:var(--bg-secondary);padding:12px;border-radius:10px">
            <div style="font-size:11px;color:var(--text3)">CPU核数</div>
            <div style="font-size:13px;font-weight:700;margin-top:4px">${job.config?.cpuCores||16} 核</div>
          </div>
          <div style="background:var(--bg-secondary);padding:12px;border-radius:10px">
            <div style="font-size:11px;color:var(--text3)">任务ID</div>
            <div style="font-size:11px;font-weight:600;margin-top:4px;font-family:monospace">${job.id}</div>
          </div>
        </div>
      </div>
      
      <!-- 状态时间线 -->
      <div class="card">
        <div class="card-title" style="margin-bottom:12px"><i data-lucide="clock" class="lucide" style="width:16px;height:16px;color:var(--blue)"></i>任务状态</div>
        <div style="position:relative;padding-left:24px">
          <div style="position:absolute;left:7px;top:4px;bottom:4px;width:2px;background:var(--border)"></div>
          ${[
            {status:'submitted',label:'任务提交',time:job.submitted,active:true},
            {status:'started',label:'开始执行',time:job.startedAt?'已开始':'等待中',active:!!job.startedAt},
            {status:'completed',label:'计算完成',time:job.completedAt?'已完成':'进行中',active:job.status==='completed'}
          ].map((step,i) => `
            <div style="position:relative;margin-bottom:16px">
              <div style="position:absolute;left:-24px;top:2px;width:16px;height:16px;border-radius:50%;background:${step.active?'var(--green)':'var(--border)'};display:flex;align-items:center;justify-content:center">
                ${step.active?'<i data-lucide="check" class="lucide icon-white" style="width:10px;height:10px"></i>':''}
              </div>
              <div style="font-size:13px;font-weight:600;color:${step.active?'var(--text)':'var(--text3)'}">${step.label}</div>
              <div style="font-size:11px;color:var(--text3);margin-top:2px">${step.time}</div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  },
  
  renderLogs(job) {
    const content = document.getElementById('job-tab-content');
    const logs = job.logs || [];
    content.innerHTML = `
      <div style="display:flex;gap:8px;margin-bottom:12px">
        <input class="form-input" style="flex:1;padding:8px 12px;font-size:12px" placeholder="搜索日志..." oninput="JobDetailRenderer.filterLogs(this.value)">
        <select class="form-select" style="width:auto;padding:8px 10px;font-size:12px" onchange="JobDetailRenderer.filterLogLevel(this.value)">
          <option value="all">全部级别</option>
          <option value="INFO">INFO</option>
          <option value="WARN">WARN</option>
          <option value="ERROR">ERROR</option>
        </select>
      </div>
      <div id="log-container" style="background:#1e293b;color:#e2e8f0;padding:14px;border-radius:12px;font-family:monospace;font-size:11px;line-height:1.8;max-height:400px;overflow-y:auto">
        ${logs.map(log => `
          <div style="margin-bottom:4px">
            <span style="color:#64748b">[${new Date(log.timestamp).toLocaleTimeString()}]</span>
            <span style="color:${log.level==='ERROR'?'#f87171':log.level==='WARN'?'#fbbf24':'#6ee7b7'}">[${log.level}]</span>
            <span style="color:#e2e8f0">${log.message}</span>
          </div>
        `).join('')}
        ${job.status==='running'?'<div style="color:#64748b;font-style:italic">... 日志实时更新中 ...</div>':''}
      </div>
      <button class="btn btn-secondary" style="width:100%;margin-top:12px" onclick="UI.toast.success('日志已下载')"><i data-lucide="download" class="lucide"></i>下载日志</button>
    `;
  },
  
  filterLogs(keyword) {
    const container = document.getElementById('log-container');
    if (!container || !this.currentJob) return;
    const logs = this.currentJob.logs.filter(l => l.message.includes(keyword));
    container.innerHTML = logs.map(log => `
      <div style="margin-bottom:4px"><span style="color:#64748b">[${new Date(log.timestamp).toLocaleTimeString()}]</span><span style="color:${log.level==='ERROR'?'#f87171':log.level==='WARN'?'#fbbf24':'#6ee7b7'}">[${log.level}]</span><span style="color:#e2e8f0">${log.message}</span></div>
    `).join('');
  },
  
  filterLogLevel(level) {
    const container = document.getElementById('log-container');
    if (!container || !this.currentJob) return;
    const logs = level==='all' ? this.currentJob.logs : this.currentJob.logs.filter(l => l.level === level);
    container.innerHTML = logs.map(log => `
      <div style="margin-bottom:4px"><span style="color:#64748b">[${new Date(log.timestamp).toLocaleTimeString()}]</span><span style="color:${log.level==='ERROR'?'#f87171':log.level==='WARN'?'#fbbf24':'#6ee7b7'}">[${log.level}]</span><span style="color:#e2e8f0">${log.message}</span></div>
    `).join('');
  },
  
  renderConfig(job) {
    const content = document.getElementById('job-tab-content');
    const rc = job.config || {};
    content.innerHTML = `
      <div class="card">
        <div class="card-title" style="margin-bottom:12px"><i data-lucide="settings" class="lucide" style="width:16px;height:16px;color:var(--blue)"></i>计算配置</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
          ${[
            {label:'计算类型',value:job.type},
            {label:'计算软件',value:job.software},
            {label:'软件版本',value:job.softwareVersion||'-'},
            {label:'CPU核数',value:(rc.cpuCores||16)+' 核'},
            {label:'GPU',value:rc.gpuCount?`${rc.gpuCount}×${rc.gpuModel}`:'不使用'},
            {label:'内存',value:rc.memory==='auto'?'自动':rc.memory},
            {label:'最大时长',value:rc.maxDuration||'12h'},
            {label:'优先级',value:rc.priority||'普通'}
          ].map(item => `
            <div style="background:var(--bg-secondary);padding:10px 12px;border-radius:8px">
              <div style="font-size:11px;color:var(--text3)">${item.label}</div>
              <div style="font-size:13px;font-weight:700;margin-top:4px">${item.value}</div>
            </div>
          `).join('')}
        </div>
      </div>
      
      <div class="card">
        <div class="card-title" style="margin-bottom:12px"><i data-lucide="file-text" class="lucide" style="width:16px;height:16px;color:var(--green)"></i>输入文件 (${job.inputFiles?.length||0})</div>
        ${(job.inputFiles||[]).map(f => `
          <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid var(--border)">
            <div style="display:flex;align-items:center;gap:8px">
              <i data-lucide="file" class="lucide" style="width:16px;height:16px;color:var(--blue)"></i>
              <span style="font-size:13px;font-weight:600">${f.name}</span>
            </div>
            <span style="font-size:12px;color:var(--text3)">${f.size}</span>
          </div>
        `).join('') || '<div style="text-align:center;padding:20px;color:var(--text3);font-size:13px">无输入文件</div>'}
      </div>
    `;
  },
  
  renderResults(job) {
    const content = document.getElementById('job-tab-content');
    if (job.status !== 'completed' || !job.results) {
      content.innerHTML = `<div class="empty-state"><div class="empty-icon">📊</div><div class="empty-text">${job.status==='running'?'计算进行中，完成后可查看结果':'暂无计算结果'}</div></div>`;
      return;
    }
    const r = job.results;
    // AI智能解释
    const bg = parseFloat(r.bandgap) || 0;
    let matType = bg === 0 ? '金属' : (bg < 0.5 ? '窄带隙半导体' : (bg < 2.5 ? '半导体' : (bg < 4 ? '宽带隙半导体' : '绝缘体')));
    let matColor = bg === 0 ? '#ff6b4a' : (bg < 0.5 ? '#ffa94d' : (bg < 2.5 ? '#4ecdc4' : (bg < 4 ? '#5ba3d9' : '#9b7ed8')));
    let matDesc = bg === 0 ? '带隙为0，电子可自由移动，具有良好导电性。' : (bg < 0.5 ? '带隙较窄，适合红外探测和热电应用。' : (bg < 2.5 ? '带隙适中，是电子器件和光电器件的理想材料。' : (bg < 4 ? '带隙较宽，适合高压、高频和高温应用。' : '带隙很宽，电子难以激发，通常用作绝缘材料。')));

    content.innerHTML = `
      <div class="card" style="margin-bottom:16px;padding:16px;background:linear-gradient(135deg,#f0f9ff,#e0f2fe);border:1px solid #bae6fd;border-radius:16px">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">
          <div style="width:32px;height:32px;border-radius:10px;background:linear-gradient(135deg,#0ea5e9,#0284c7);display:flex;align-items:center;justify-content:center">
            <i data-lucide="sparkles" class="lucide icon-white" style="width:16px;height:16px"></i>
          </div>
          <div style="font-size:14px;font-weight:700;color:#0369a1">AI 智能解读</div>
          <span style="margin-left:auto;font-size:10px;color:#0284c7;background:#0ea5e922;padding:3px 8px;border-radius:6px">自动生成</span>
        </div>
        <div style="font-size:13px;line-height:1.7;color:#0c4a6e">该材料带隙为 <b style="color:${matColor}">${r.bandgap} eV</b>，属于<b>${matType}</b>。${matDesc}总能量 <b>${r.totalEnergy} eV</b>，费米能级 <b>${r.fermiLevel} eV</b>。</div>
        <div style="display:flex;gap:8px;margin-top:12px;flex-wrap:wrap">
          <span style="background:#fff;color:#0284c7;border:1px solid #bae6fd;font-size:11px;padding:4px 10px;border-radius:8px;cursor:pointer" onclick="navigateTo('page-knowledge-graph')">知识图谱</span>
          <span style="background:#fff;color:#0284c7;border:1px solid #bae6fd;font-size:11px;padding:4px 10px;border-radius:8px;cursor:pointer" onclick="navigateTo('page-materials')">相关材料</span>
          <span style="background:#fff;color:#0284c7;border:1px solid #bae6fd;font-size:11px;padding:4px 10px;border-radius:8px;cursor:pointer" onclick="navigateTo('page-courses')">学习课程</span>
        </div>
      </div>
      <!-- 📚 学习推荐区域 - 第二纵队：计算即学习 -->
      <div class="card" style="margin-bottom:16px;padding:16px;background:linear-gradient(135deg,#fefce8,#fef9c3);border:1px solid #fde68a;border-radius:16px">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px">
          <div style="width:32px;height:32px;border-radius:10px;background:linear-gradient(135deg,#f59e0b,#d97706);display:flex;align-items:center;justify-content:center">
            <i data-lucide="graduation-cap" class="lucide icon-white" style="width:16px;height:16px"></i>
          </div>
          <div style="font-size:14px;font-weight:700;color:#92400e">基于本次计算，为你推荐</div>
        </div>
        
        <!-- 推荐课程 -->
        <div style="margin-bottom:14px">
          <div style="font-size:12px;font-weight:600;color:#a16207;margin-bottom:8px">📖 相关课程</div>
          <div id="recommended-courses" style="display:flex;flex-direction:column;gap:8px"></div>
        </div>
        
        <!-- 推荐文章 -->
        <div style="margin-bottom:14px">
          <div style="font-size:12px;font-weight:600;color:#a16207;margin-bottom:8px">📝 相关文章</div>
          <div id="recommended-articles" style="display:flex;flex-direction:column;gap:8px"></div>
        </div>
        
        <!-- 知识图谱节点 -->
        <div>
          <div style="font-size:12px;font-weight:600;color:#a16207;margin-bottom:8px">🕸️ 知识图谱关联</div>
          <div id="knowledge-nodes" style="display:flex;flex-wrap:wrap;gap:6px"></div>
        </div>
      </div>

      <div class="card" style="background:linear-gradient(135deg,#f0f7ff,#e8f0f8);margin-bottom:16px">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
          <div class="card-title" style="margin:0"><i data-lucide="bar-chart-3" class="lucide" style="width:16px;height:16px;color:var(--primary)"></i>关键结果</div>
          <button class="btn btn-primary" style="padding:6px 12px;font-size:12px" onclick="navigateTo('page-results','${_store(job)}')">查看完整结果</button>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
          ${[
            {label:'带隙',value:r.bandgap,unit:'eV',color:'var(--primary)'},
            {label:'总能量',value:r.totalEnergy,unit:'eV',color:'var(--blue)'},
            {label:'费米能级',value:r.fermiLevel,unit:'eV',color:'var(--green)'},
            {label:'磁矩',value:r.magneticMoment,unit:'μB',color:'var(--purple)'}
          ].map(item => `
            <div style="background:#fff;padding:12px;border-radius:10px">
              <div style="font-size:11px;color:var(--text3)">${item.label}</div>
              <div style="font-size:18px;font-weight:800;color:${item.color};margin-top:4px">${item.value}<span style="font-size:11px;font-weight:500;color:var(--text3)"> ${item.unit}</span></div>
            </div>
          `).join('')}
        </div>
      </div>
      
      <div class="card">
        <div class="card-title" style="margin-bottom:12px"><i data-lucide="file-output" class="lucide" style="width:16px;height:16px;color:var(--green)"></i>结果文件 (${job.outputFiles?.length||0})</div>
        ${(job.outputFiles||[]).map(f => `
          <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid var(--border)">
            <div style="display:flex;align-items:center;gap:8px">
              <i data-lucide="${f.type==='text'?'file-text':'file-binary'}" class="lucide" style="width:16px;height:16px;color:${f.type==='text'?'var(--blue)':'var(--purple)'}"></i>
              <span style="font-size:13px;font-weight:600">${f.name}</span>
            </div>
            <div style="display:flex;align-items:center;gap:12px">
              <span style="font-size:12px;color:var(--text3)">${f.size}</span>
              <button onclick="JobDetailRenderer.downloadFile('${f.name}')" style="background:none;border:none;cursor:pointer;color:var(--primary)"><i data-lucide="download" class="lucide" style="width:16px;height:16px"></i></button>
            </div>
          </div>
        `).join('')}
      </div>
    `;
    // 渲染学习推荐内容
    this.renderLearningRecommendations(job, r);
  },

  // 渲染学习推荐 - 第二纵队
  renderLearningRecommendations(job, r) {
    const bg = parseFloat(r.bandgap) || 0;
    const jobType = job.type || 'DFT';
    const title = job.title || '';
    const courseLib = [
      { id: 'c001', title: '密度泛函理论进阶', icon: 'atom', match: ['DFT','VASP','能带'] },
      { id: 'c002', title: '第一性原理计算实战', icon: 'flask-conical', match: ['DFT','VASP','结构优化'] },
      { id: 'c003', title: '拓扑绝缘体导论', icon: 'magnet', match: ['拓扑','能带'] },
      { id: 'c010', title: '分子动力学模拟入门', icon: 'dna', match: ['MD','GROMACS'] }
    ];
    const articleLib = [
      { id: 'a001', title: 'MoS₂莫尔超晶格中的平带与强关联效应', tag: '拓扑材料', match: ['MoS₂','二维','能带'] },
      { id: 'a002', title: 'VASP计算中k点网格收敛性的系统研究', tag: '计算方法', match: ['VASP','k点','收敛'] },
      { id: 'a004', title: '石墨烯纳米带的能带工程与输运性质', tag: '低维材料', match: ['石墨烯','纳米带'] }
    ];
    const nodeLib = {
      semiconductor: ['半导体物理','能带理论','费米能级','载流子浓度','光电器件'],
      metal: ['金属键','自由电子气','费米面','电导率','超导'],
      dft: ['密度泛函理论','Kohn-Sham方程','交换关联泛函','赝势','自洽场迭代'],
      md: ['分子动力学','势函数','系综','采样方法','自由能计算']
    };
    const matchedCourses = courseLib.filter(c => c.match.some(k => title.includes(k) || jobType.includes(k))).slice(0,2);
    if (matchedCourses.length === 0) matchedCourses.push(courseLib[0], courseLib[1]);
    const matchedArticles = articleLib.filter(a => a.match.some(k => title.includes(k) || jobType.includes(k))).slice(0,2);
    if (matchedArticles.length === 0) matchedArticles.push(articleLib[0], articleLib[1]);
    let nodeKey = 'dft';
    if (jobType.includes('MD')) nodeKey = 'md';
    else if (bg === 0) nodeKey = 'metal';
    else if (bg > 0) nodeKey = 'semiconductor';
    const nodes = nodeLib[nodeKey] || nodeLib['dft'];

    const cc = document.getElementById('recommended-courses');
    if (cc) {
      cc.innerHTML = matchedCourses.map(c => '<div onclick="navigateTo(' + "'" + 'page-courses' + "'" + ')" style="display:flex;align-items:center;gap:10px;padding:10px 12px;background:#fff;border-radius:10px;cursor:pointer;border:1px solid #fde68a"><div style="width:32px;height:32px;border-radius:8px;background:linear-gradient(135deg,#3b82f6,#2563eb);display:flex;align-items:center;justify-content:center;flex-shrink:0"><i data-lucide="' + c.icon + '" class="lucide icon-white" style="width:16px;height:16px"></i></div><div style="flex:1;min-width:0"><div style="font-size:13px;font-weight:600;color:#1f2937;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + c.title + '</div><div style="font-size:11px;color:#92400e;margin-top:2px">点击继续学习 →</div></div></div>').join('');
    }

    const ac = document.getElementById('recommended-articles');
    if (ac) {
      ac.innerHTML = matchedArticles.map(a => '<div onclick="navigateTo(' + "'" + 'page-article-detail' + "'" + ',' + "'" + a.id + "'" + ')" style="display:flex;align-items:center;gap:10px;padding:10px 12px;background:#fff;border-radius:10px;cursor:pointer;border:1px solid #fde68a"><div style="width:32px;height:32px;border-radius:8px;background:linear-gradient(135deg,#f59e0b,#d97706);display:flex;align-items:center;justify-content:center;flex-shrink:0"><i data-lucide="file-text" class="lucide icon-white" style="width:16px;height:16px"></i></div><div style="flex:1;min-width:0"><div style="font-size:13px;font-weight:600;color:#1f2937;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + a.title + '</div><div style="font-size:11px;color:#92400e;margin-top:2px">' + a.tag + ' · 点击阅读 →</div></div></div>').join('');
    }

    const nc = document.getElementById('knowledge-nodes');
    if (nc) {
      nc.innerHTML = nodes.map(n => '<span onclick="navigateTo(' + "'" + 'page-knowledge-graph' + "'" + ')" style="padding:5px 10px;background:#fff;border:1px solid #fde68a;border-radius:12px;font-size:11px;color:#92400e;cursor:pointer;font-weight:500">' + n + '</span>').join('');
    }

    if (typeof renderIcons === 'function') renderIcons();
  },
  

  // 下载文件（真实功能 - 生成模拟内容下载）
  downloadFile(name) {
    const content = `# UniSci 计算结果文件\n# 文件名: ${name}\n# 生成时间: ${new Date().toLocaleString()}\n\n这是模拟的计算结果文件内容。\n在真实部署环境中，这里将下载实际的计算输出文件。\n`;
    const blob = new Blob([content], {type: 'text/plain'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = name;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
    if (typeof UI !== 'undefined') UI.toast.success('已下载: ' + name);
  },

  renderFiles(job) {
    const content = document.getElementById('job-tab-content');
    const allFiles = [...(job.inputFiles||[]).map(f=>({...f,category:'输入'})), ...(job.outputFiles||[]).map(f=>({...f,category:'输出'}))];
    content.innerHTML = `
      <div class="tab-bar" style="margin-bottom:12px">
        <button class="tab-item active">全部 (${allFiles.length})</button>
        <button class="tab-item">输入 (${job.inputFiles?.length||0})</button>
        <button class="tab-item">输出 (${job.outputFiles?.length||0})</button>
      </div>
      <div class="card" style="padding:0">
        ${allFiles.map(f => `
          <div style="display:flex;justify-content:space-between;align-items:center;padding:12px 16px;border-bottom:1px solid var(--border)">
            <div style="display:flex;align-items:center;gap:10px">
              <div style="width:36px;height:36px;background:${f.category==='输入'?'linear-gradient(135deg,#a0d0f0,#80bde0)':'linear-gradient(135deg,#a0e8c0,#80dca8)'};border-radius:10px;display:flex;align-items:center;justify-content:center">
                <i data-lucide="file-text" class="lucide icon-white" style="width:18px;height:18px"></i>
              </div>
              <div><div style="font-size:13px;font-weight:600">${f.name}</div><div style="font-size:11px;color:var(--text3)">${f.category}文件 · ${f.size}</div></div>
            </div>
            <div style="display:flex;gap:8px">
              <button onclick="UI.toast.info('预览 ${f.name}')" style="background:none;border:none;cursor:pointer;color:var(--blue)"><i data-lucide="eye" class="lucide" style="width:18px;height:18px"></i></button>
              <button onclick="UI.toast.success('下载 ${f.name}')" style="background:none;border:none;cursor:pointer;color:var(--primary)"><i data-lucide="download" class="lucide" style="width:18px;height:18px"></i></button>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  },
  
  renderActions(job) {
    const actions = document.getElementById('job-detail-actions');
    if (!actions) return;
    const isRunning = job.status === 'running' || job.status === 'queued';
    const isCompleted = job.status === 'completed';
    const isFailed = job.status === 'failed';
    
    let buttons = '';
    if (isRunning) {
      buttons = `<button class="btn btn-secondary" style="flex:1;color:var(--primary)" onclick="JobDetailRenderer.cancelJob('${job.id}')"><i data-lucide="x-circle" class="lucide"></i>取消任务</button>`;
    }
    if (isCompleted) {
      buttons = `
        <button class="btn btn-primary" style="flex:1" onclick="navigateTo('page-results','${_store(job)}')"><i data-lucide="bar-chart-3" class="lucide icon-white"></i>查看结果</button>
        <button class="btn btn-secondary" style="flex:1" onclick="JobDetailRenderer.resubmitJob('${job.id}')"><i data-lucide="refresh-cw" class="lucide"></i>重新提交</button>
      `;
    }
    if (isFailed) {
      buttons = `<button class="btn btn-primary" style="flex:1" onclick="JobDetailRenderer.resubmitJob('${job.id}')"><i data-lucide="refresh-cw" class="lucide icon-white"></i>重新提交</button>`;
    }
    if (!isRunning) {
      buttons += `<button class="btn btn-secondary" style="flex:1;color:var(--primary)" onclick="JobDetailRenderer.deleteJob('${job.id}')"><i data-lucide="trash-2" class="lucide"></i>删除</button>`;
    }
    
    actions.innerHTML = `<div style="display:flex;gap:12px">${buttons}</div>`;
  },
  
  cancelJob(id) {
    UI.dialog.confirm({
      title: '取消任务',
      message: '确定要取消此任务吗？取消后已计算的部分结果可能丢失，已用资源费用正常收取。',
      confirmText: '确认取消',
      cancelText: '再想想',
      onConfirm: () => {
        JobManager.cancelJob(id);
        UI.toast.success('任务已取消');
        const job = JobManager.getJob(id);
        if (job) this.render(job);
      }
    });
  },
  
  deleteJob(id) {
    UI.dialog.confirm({
      title: '删除任务',
      message: '删除后任务记录和结果文件将被清除，无法恢复。确定删除吗？',
      confirmText: '确认删除',
      cancelText: '取消',
      onConfirm: () => {
        JobManager.deleteJob(id);
        UI.toast.success('任务已删除');
        goBack();
      }
    });
  },
  
  resubmitJob(id) {
    const job = JobManager.getJob(id);
    if (!job) return;
    NewJobWizard.init({
      selectedType: job.type,
      selectedSoftware: job.software,
      softwareVersion: job.softwareVersion,
      resourceConfig: job.config,
      inputFiles: job.inputFiles || [],
      jobTitle: job.title + ' (重新提交)'
    });
    navigateTo('page-job-new');
    UI.toast.info('已从历史任务预填配置');
  },
  
  refresh() {
    if (!this.currentJob) return;
    const job = JobManager.getJob(this.currentJob.id);
    if (job) {
      this.render(job);
      UI.toast.success('状态已刷新');
    }
  }
};

// ============================================================
// 四、计算结果渲染器 (ResultsRenderer)
// ============================================================
const ResultsRenderer = {
  currentTab: 'band',
  
  render(job) {
    this.currentJob = job;
    const container = document.getElementById('results-content');
    if (!container) return;
    
    container.innerHTML = `
      <div class="tab-bar" style="margin-bottom:16px">
        ${[
          {id:'band',name:'能带结构',icon:'activity'},
          {id:'dos',name:'态密度',icon:'bar-chart-2'},
          {id:'key',name:'关键数据',icon:'database'},
          {id:'structure',name:'结构',icon:'atom'},
          {id:'files',name:'全部文件',icon:'folder'}
        ].map(tab => `
          <button class="tab-item ${this.currentTab===tab.id?'active':''}" onclick="ResultsRenderer.switchTab('${tab.id}')">
            <i data-lucide="${tab.icon}" class="lucide" style="width:14px;height:14px"></i>${tab.name}
          </button>
        `).join('')}
      </div>
      <div id="results-tab-content"></div>
    `;
    this.renderTabContent();
    if (typeof renderIcons === 'function') renderIcons();
  },
  
  switchTab(tab) {
    this.currentTab = tab;
    this.render(this.currentJob);
  },
  

  // 🤖 AI自动解释 - 让计算结果会说话（第一纵队）
  renderAIExplanation() {
    const r = this.currentJob?.results || {};
    const job = this.currentJob || {};
    const bg = parseFloat(r.bandgap) || 0;
    const energy = parseFloat(r.totalEnergy) || 0;
    const fermi = parseFloat(r.fermiLevel) || 0;

    // 根据带隙判断材料类型
    let materialType = '';
    let typeColor = '';
    let typeDesc = '';
    if (bg === 0) {
      materialType = '金属'; typeColor = '#ff6b4a';
      typeDesc = '带隙为0，电子可以自由移动，具有良好的导电性。';
    } else if (bg < 0.5) {
      materialType = '窄带隙半导体'; typeColor = '#ffa94d';
      typeDesc = '带隙较窄，适合红外探测和热电应用。';
    } else if (bg < 2.5) {
      materialType = '半导体'; typeColor = '#4ecdc4';
      typeDesc = '带隙适中，是电子器件和光电器件的理想材料。';
    } else if (bg < 4) {
      materialType = '宽带隙半导体'; typeColor = '#5ba3d9';
      typeDesc = '带隙较宽，适合高压、高频和高温应用。';
    } else {
      materialType = '绝缘体'; typeColor = '#9b7ed8';
      typeDesc = '带隙很宽，电子难以激发，通常用作绝缘材料。';
    }

    // 生成AI解释文本
    const explanation = `你的${job.title || '计算任务'}已完成。该材料的带隙为 <b style="color:${typeColor}">${bg} eV</b>，属于<b>${materialType}</b>。${typeDesc}总能量为 <b>${energy} eV</b>，费米能级为 <b>${fermi} eV</b>。`;

    return `
      <div class="card" style="margin-bottom:16px;padding:16px;background:linear-gradient(135deg,#f0f9ff,#e0f2fe);border:1px solid #bae6fd;border-radius:16px">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">
          <div style="width:32px;height:32px;border-radius:10px;background:linear-gradient(135deg,#0ea5e9,#0284c7);display:flex;align-items:center;justify-content:center">
            <i data-lucide="sparkles" class="lucide icon-white" style="width:16px;height:16px"></i>
          </div>
          <div style="font-size:14px;font-weight:700;color:#0369a1">AI 智能解读</div>
          <span class="badge" style="margin-left:auto;background:#0ea5e922;color:#0284c7;font-size:10px;padding:3px 8px">自动生成</span>
        </div>
        <div style="font-size:13px;line-height:1.7;color:#0c4a6e">${explanation}</div>
        <div style="display:flex;gap:8px;margin-top:12px;flex-wrap:wrap">
          <span class="chip" style="background:#fff;color:#0284c7;border:1px solid #bae6fd;font-size:11px;padding:4px 10px;cursor:pointer" onclick="navigateTo('page-knowledge-graph')"><i data-lucide="network" class="lucide" style="width:12px;height:12px"></i>查看知识图谱</span>
          <span class="chip" style="background:#fff;color:#0284c7;border:1px solid #bae6fd;font-size:11px;padding:4px 10px;cursor:pointer" onclick="navigateTo('page-materials')"><i data-lucide="flask-conical" class="lucide" style="width:12px;height:12px"></i>相关材料</span>
          <span class="chip" style="background:#fff;color:#0284c7;border:1px solid #bae6fd;font-size:11px;padding:4px 10px;cursor:pointer" onclick="navigateTo('page-courses')"><i data-lucide="graduation-cap" class="lucide" style="width:12px;height:12px"></i>学习课程</span>
        </div>
      </div>
    `;
  },


  // 导出SVG为文件（真实功能）
  exportSVG(btn) {
    const svg = btn.closest('.card')?.querySelector('svg');
    if (!svg) { if (typeof UI !== 'undefined') UI.toast.error('未找到SVG图表'); return; }
    const svgData = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([svgData], {type: 'image/svg+xml'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = (this.currentJob?.title || 'result') + '_' + this.currentTab + '.svg';
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
    if (typeof UI !== 'undefined') UI.toast.success('SVG已导出');
  },

  renderTabContent() {
    const content = document.getElementById('results-tab-content');
    if (!content) return;
    switch(this.currentTab) {
      case 'band': this.renderBandStructure(content); break;
      case 'dos': this.renderDOS(content); break;
      case 'key': this.renderKeyData(content); break;
      case 'structure': this.renderStructure(content); break;
      case 'files': this.renderFiles(content); break;
    }
  },
  
  renderBandStructure(container) {
    const r = this.currentJob?.results || {};
    container.innerHTML = `
      <div class="card">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
          <div class="card-title" style="margin:0"><i data-lucide="activity" class="lucide" style="width:16px;height:16px;color:var(--primary)"></i>能带结构</div>
          <div style="display:flex;gap:6px">
            <button class="btn btn-secondary" style="padding:4px 8px;font-size:11px" onclick="UI.toast.info('放大')"><i data-lucide="zoom-in" class="lucide" style="width:14px;height:14px"></i></button>
            <button class="btn btn-secondary" style="padding:4px 8px;font-size:11px" onclick="UI.toast.info('导出PNG')"><i data-lucide="download" class="lucide" style="width:14px;height:14px"></i></button>
          </div>
        </div>
        <div style="height:240px;background:linear-gradient(180deg,#f0f7ff,#e8f0f8);border-radius:12px;position:relative;overflow:hidden">
          <svg width="100%" height="100%" viewBox="0 0 400 240">
            <!-- 网格线 -->
            ${[0,1,2,3,4].map(i => `<line x1="0" y1="${i*60}" x2="400" y2="${i*60}" stroke="#d0d8e0" stroke-width="0.5" stroke-dasharray="4"/>`).join('')}
            <!-- 费米能级 -->
            <line x1="0" y1="120" x2="400" y2="120" stroke="#ff6b4a" stroke-width="1" stroke-dasharray="6"/>
            <text x="395" y="115" text-anchor="end" fill="#ff6b4a" font-size="10">E<tspan baseline-shift="sub">F</tspan></text>
            <!-- 导带 -->
            <polyline points="0,80 40,60 80,50 120,55 160,40 200,35 240,45 280,50 320,42 360,55 400,60" fill="none" stroke="#ff6b4a" stroke-width="2"/>
            <!-- 价带 -->
            <polyline points="0,160 40,170 80,180 120,175 160,190 200,200 240,185 280,175 320,182 360,170 400,165" fill="none" stroke="#5ba3d9" stroke-width="2"/>
            <!-- 高对称点标注 -->
            <text x="0" y="235" text-anchor="middle" fill="#666" font-size="10">Γ</text>
            <text x="100" y="235" text-anchor="middle" fill="#666" font-size="10">M</text>
            <text x="200" y="235" text-anchor="middle" fill="#666" font-size="10">K</text>
            <text x="300" y="235" text-anchor="middle" fill="#666" font-size="10">Γ</text>
            <text x="400" y="235" text-anchor="middle" fill="#666" font-size="10">X</text>
          </svg>
        </div>
        <div style="display:flex;justify-content:space-between;margin-top:12px;font-size:12px">
          <span style="color:var(--text3)">带隙: <span style="color:var(--primary);font-weight:700">${r.bandgap||'1.8'} eV</span> (直接带隙, K点)</span>
          <span style="color:var(--text3)">Γ → M → K → Γ → X</span>
        </div>
      </div>
      <div class="card" style="margin-top:12px">
        <div class="card-title" style="margin-bottom:8px;font-size:13px"><i data-lucide="info" class="lucide" style="width:14px;height:14px;color:var(--blue)"></i>图表操作</div>
        <div class="chip-row">
          <span class="chip" onclick="UI.toast.info('双指缩放')">缩放</span>
          <span class="chip" onclick="UI.toast.info('拖拽平移')">平移</span>
          <span class="chip" onclick="UI.toast.info('双击重置视图')">重置</span>
          <span class="chip" onclick="UI.toast.success('已导出PNG')">导出PNG</span>
          <span class="chip" onclick="ResultsRenderer.exportSVG(this)" style="cursor:pointer">导出SVG</span>
          <span class="chip" onclick="UI.toast.info('全屏查看')">全屏</span>
        </div>
      </div>
    `;
  },
  
  renderDOS(container) {
    const r = this.currentJob?.results || {};
    container.innerHTML = `
      <div class="card">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
          <div class="card-title" style="margin:0"><i data-lucide="bar-chart-2" class="lucide" style="width:16px;height:16px;color:var(--green)"></i>态密度 (DOS)</div>
          <div class="chip-row">
            <span class="chip selected" onclick="UI.toast.info('TDOS+PDOS')">全部</span>
            <span class="chip" onclick="UI.toast.info('仅TDOS')">TDOS</span>
            <span class="chip" onclick="UI.toast.info('仅PDOS')">PDOS</span>
          </div>
        </div>
        <div style="height:200px;background:linear-gradient(180deg,#f0faf4,#e8f5ee);border-radius:12px;position:relative;overflow:hidden">
          <svg width="100%" height="100%" viewBox="0 0 400 200">
            <line x1="200" y1="0" x2="200" y2="200" stroke="#ff6b4a" stroke-width="1" stroke-dasharray="6"/>
            <text x="205" y="15" fill="#ff6b4a" font-size="10">E<tspan baseline-shift="sub">F</tspan> = ${r.fermiLevel||'-3.2'} eV</text>
            <!-- TDOS -->
            <path d="M0,100 Q50,30 100,50 T200,40 T300,60 T400,50 L400,200 L0,200 Z" fill="rgba(92,207,142,0.3)"/>
            <path d="M0,100 Q50,30 100,50 T200,40 T300,60 T400,50" fill="none" stroke="#5ccf8e" stroke-width="2"/>
            <!-- s轨道 PDOS -->
            <path d="M0,120 Q50,80 100,90 T200,85 T300,95 T400,88" fill="none" stroke="#5ba3d9" stroke-width="1.5" stroke-dasharray="4"/>
            <!-- p轨道 PDOS -->
            <path d="M0,140 Q50,100 100,110 T200,105 T300,115 T400,108" fill="none" stroke="#9b7ed8" stroke-width="1.5" stroke-dasharray="2"/>
            <!-- d轨道 PDOS -->
            <path d="M0,160 Q50,130 100,140 T200,135 T300,145 T400,138" fill="none" stroke="#ff6b4a" stroke-width="1.5"/>
          </svg>
        </div>
        <div style="display:flex;gap:16px;margin-top:12px;font-size:11px;flex-wrap:wrap">
          <span style="display:flex;align-items:center;gap:4px"><span style="width:12px;height:2px;background:#5ccf8e"></span>TDOS</span>
          <span style="display:flex;align-items:center;gap:4px"><span style="width:12px;height:2px;background:#5ba3d9"></span>s轨道</span>
          <span style="display:flex;align-items:center;gap:4px"><span style="width:12px;height:2px;background:#9b7ed8"></span>p轨道</span>
          <span style="display:flex;align-items:center;gap:4px"><span style="width:12px;height:2px;background:#ff6b4a"></span>d轨道</span>
        </div>
      </div>
    `;
  },
  
  renderKeyData(container) {
    const r = this.currentJob?.results || {};
    const lc = r.latticeConstants || {a:'3.16',b:'3.16',c:'12.30'};
    container.innerHTML = `
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px">
        ${[
          {label:'带隙',value:r.bandgap||'1.8',unit:'eV',icon:'zap',color:'var(--primary)'},
          {label:'总能量',value:r.totalEnergy||'-89.2',unit:'eV',icon:'energy',color:'var(--blue)'},
          {label:'费米能级',value:r.fermiLevel||'-3.2',unit:'eV',icon:'gauge',color:'var(--green)'},
          {label:'磁矩',value:r.magneticMoment||'0.0',unit:'μB',icon:'magnet',color:'var(--purple)'}
        ].map(item => `
          <div class="card" style="margin:0">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
              <div style="width:32px;height:32px;background:${item.color}22;border-radius:8px;display:flex;align-items:center;justify-content:center">
                <i data-lucide="${item.icon}" class="lucide" style="width:16px;height:16px;color:${item.color}"></i>
              </div>
              <span style="font-size:12px;color:var(--text3)">${item.label}</span>
            </div>
            <div style="font-size:24px;font-weight:800;color:${item.color}">${item.value}<span style="font-size:12px;font-weight:500;color:var(--text3)"> ${item.unit}</span></div>
          </div>
        `).join('')}
      </div>
      
      <div class="card">
        <div class="card-title" style="margin-bottom:12px"><i data-lucide="box" class="lucide" style="width:16px;height:16px;color:var(--teal)"></i>晶格参数</div>
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px">
          ${[
            {label:'a',value:lc.a,unit:'Å'},
            {label:'b',value:lc.b,unit:'Å'},
            {label:'c',value:lc.c,unit:'Å'}
          ].map(item => `
            <div style="background:var(--bg-secondary);padding:12px;border-radius:10px;text-align:center">
              <div style="font-size:11px;color:var(--text3)">${item.label}</div>
              <div style="font-size:18px;font-weight:800;margin-top:4px">${item.value}<span style="font-size:11px;color:var(--text3)"> ${item.unit}</span></div>
            </div>
          `).join('')}
        </div>
        <div style="margin-top:12px;padding:10px;background:var(--bg-secondary);border-radius:8px;font-size:12px;color:var(--text2)">
          <i data-lucide="info" class="lucide" style="width:14px;height:14px;vertical-align:middle"></i> 空间群: P6₃/mmc · 原子数: 9 · 体积: ${(parseFloat(lc.a)*parseFloat(lc.b)*parseFloat(lc.c)*0.866).toFixed(2)} Å³
        </div>
      </div>
      
      <button class="btn btn-primary" style="width:100%;margin-top:16px" onclick="UI.toast.success('已创建分析Notebook')"><i data-lucide="notebook-pen" class="lucide icon-white"></i>在 Notebook 中分析结果</button>
    `;
  },
  
  renderStructure(container) {
    container.innerHTML = `
      <div class="card" style="padding:0;margin-bottom:16px">
        <div style="height:280px;background:linear-gradient(135deg,#1a1a2e,#16213e);position:relative;overflow:hidden;display:flex;align-items:center;justify-content:center">
          <div style="text-align:center">
            <div style="position:relative;width:160px;height:160px;margin:0 auto;animation:spin 20s linear infinite">
              <!-- 模拟3D分子结构 -->
              <div style="position:absolute;top:20px;left:50%;transform:translateX(-50%);width:24px;height:24px;background:#5ba3d9;border-radius:50%;box-shadow:0 0 20px rgba(91,163,217,0.5)"></div>
              <div style="position:absolute;top:70px;left:20px;width:20px;height:20px;background:#ffc857;border-radius:50%;box-shadow:0 0 15px rgba(255,200,87,0.5)"></div>
              <div style="position:absolute;top:70px;right:20px;width:20px;height:20px;background:#ffc857;border-radius:50%;box-shadow:0 0 15px rgba(255,200,87,0.5)"></div>
              <div style="position:absolute;bottom:20px;left:30px;width:22px;height:22px;background:#5ba3d9;border-radius:50%;box-shadow:0 0 20px rgba(91,163,217,0.5)"></div>
              <div style="position:absolute;bottom:20px;right:30px;width:22px;height:22px;background:#5ba3d9;border-radius:50%;box-shadow:0 0 20px rgba(91,163,217,0.5)"></div>
              <!-- 键 -->
              <svg style="position:absolute;top:0;left:0;width:100%;height:100%"><line x1="80" y1="32" x2="40" y2="80" stroke="#666" stroke-width="2"/><line x1="80" y1="32" x2="120" y2="80" stroke="#666" stroke-width="2"/><line x1="40" y1="80" x2="50" y2="130" stroke="#666" stroke-width="2"/><line x1="120" y1="80" x2="110" y2="130" stroke="#666" stroke-width="2"/></svg>
            </div>
            <div style="color:#fff;font-size:14px;font-weight:600;margin-top:16px">MoS₂ · 二硫化钼</div>
            <div style="color:#888;font-size:11px;margin-top:4px">9 atoms · P6₃/mmc</div>
          </div>
        </div>
        <div style="display:flex;gap:8px;padding:12px;border-top:1px solid #333">
          <span class="chip" style="background:#333;color:#fff;font-size:11px" onclick="UI.toast.info('球棍模型')">球棍</span>
          <span class="chip" style="background:#333;color:#fff;font-size:11px" onclick="UI.toast.info('空间填充')">空间填充</span>
          <span class="chip" style="background:#333;color:#fff;font-size:11px" onclick="UI.toast.info('线框模式')">线框</span>
          <span class="chip" style="background:#333;color:#fff;font-size:11px;margin-left:auto" onclick="UI.toast.success('结构已导出')"><i data-lucide="download" class="lucide" style="width:12px;height:12px"></i>导出</span>
        </div>
      </div>
      
      <div class="card">
        <div class="card-title" style="margin-bottom:12px"><i data-lucide="list" class="lucide" style="width:16px;height:16px;color:var(--blue)"></i>原子坐标</div>
        <div style="overflow-x:auto">
          <table style="width:100%;font-size:12px;border-collapse:collapse">
            <thead><tr style="background:var(--bg-secondary)"><th style="padding:8px;text-align:left">元素</th><th style="padding:8px;text-align:left">x</th><th style="padding:8px;text-align:left">y</th><th style="padding:8px;text-align:left">z</th></tr></thead>
            <tbody>
              ${[
                {el:'Mo',x:'0.000',y:'0.000',z:'0.250'},
                {el:'Mo',x:'0.333',y:'0.667',z:'0.750'},
                {el:'S',x:'0.333',y:'0.667',z:'0.125'},
                {el:'S',x:'0.667',y:'0.333',z:'0.375'},
                {el:'S',x:'0.000',y:'0.000',z:'0.625'}
              ].map(atom => `<tr style="border-bottom:1px solid var(--border)"><td style="padding:8px;font-weight:600;color:var(--blue)">${atom.el}</td><td style="padding:8px">${atom.x}</td><td style="padding:8px">${atom.y}</td><td style="padding:8px">${atom.z}</td></tr>`).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },
  
  renderFiles(container) {
    const job = this.currentJob;
    const allFiles = [...(job?.inputFiles||[]).map(f=>({...f,category:'输入'})), ...(job?.outputFiles||[]).map(f=>({...f,category:'输出'}))];
    container.innerHTML = `
      <div class="card" style="padding:0">
        ${allFiles.map(f => `
          <div style="display:flex;justify-content:space-between;align-items:center;padding:14px 16px;border-bottom:1px solid var(--border)">
            <div style="display:flex;align-items:center;gap:12px">
              <div style="width:40px;height:40px;background:${f.category==='输入'?'linear-gradient(135deg,#a0d0f0,#80bde0)':'linear-gradient(135deg,#a0e8c0,#80dca8)'};border-radius:10px;display:flex;align-items:center;justify-content:center">
                <i data-lucide="${f.type==='text'?'file-text':'file-binary'}" class="lucide icon-white" style="width:20px;height:20px"></i>
              </div>
              <div><div style="font-size:14px;font-weight:600">${f.name}</div><div style="font-size:11px;color:var(--text3)">${f.category}文件 · ${f.size}</div></div>
            </div>
            <div style="display:flex;gap:8px">
              <button onclick="UI.toast.info('预览 ${f.name}')" style="background:none;border:none;cursor:pointer;color:var(--blue)"><i data-lucide="eye" class="lucide" style="width:20px;height:20px"></i></button>
              <button onclick="UI.toast.success('下载 ${f.name}')" style="background:none;border:none;cursor:pointer;color:var(--primary)"><i data-lucide="download" class="lucide" style="width:20px;height:20px"></i></button>
            </div>
          </div>
        `).join('')}
      </div>
      <button class="btn btn-secondary" style="width:100%;margin-top:16px" onclick="UI.toast.success('已打包下载全部文件')"><i data-lucide="download" class="lucide"></i>打包下载全部文件</button>
    `;
  },
  
  exportResults(format) {
    const formats = {
      pdf: 'PDF报告',
      csv: 'CSV数据',
      json: 'JSON原始数据',
      zip: '图片打包'
    };
    UI.toast.success(`正在生成${formats[format]||format}...`);
    setTimeout(() => UI.toast.success('导出完成，开始下载'), 1500);
  },
  
  shareResults() {
    UI.dialog.alert({
      title: '分享计算结果',
      message: '分享链接已生成：\nhttps://unisci.app/results/job_xxx\n\n访问权限：公开查看\n\n可通过微信、二维码或复制链接分享。',
      confirmText: '复制链接'
    });
  }
};

// ============================================================
// 五、任务列表渲染器 (JobListRenderer)
// ============================================================
const JobListRenderer = {
  currentFilter: 'all',
  
  render() {
    this.renderFilters();
    this.renderList();
  },
  
  renderFilters() {
    const container = document.getElementById('compute-filters');
    if (!container) return;
    const counts = {
      all: JobManager.getJobsByStatus('all').length,
      running: JobManager.getJobsByStatus('running').length,
      completed: JobManager.getJobsByStatus('completed').length,
      queued: JobManager.getJobsByStatus('queued').length
    };
    container.innerHTML = `
      <div class="tab-bar">
        ${[
          {id:'all',name:'全部',count:counts.all},
          {id:'running',name:'进行中',count:counts.running},
          {id:'completed',name:'已完成',count:counts.completed},
          {id:'queued',name:'排队中',count:counts.queued}
        ].map(tab => `
          <button class="tab-item ${this.currentFilter===tab.id?'active':''}" onclick="JobListRenderer.setFilter('${tab.id}')">${tab.name}${tab.count>0?` (${tab.count})`:''}</button>
        `).join('')}
      </div>
    `;
  },
  
  setFilter(filter) {
    this.currentFilter = filter;
    this.render();
  },
  
  renderList() {
    const container = document.getElementById('compute-job-list');
    if (!container) return;
    const jobs = JobManager.getJobsByStatus(this.currentFilter);
    
    if (jobs.length === 0) {
      const emptyMessages = {
        all: '暂无计算任务，点击下方按钮新建',
        running: '暂无进行中的任务',
        completed: '暂无已完成的任务',
        queued: '暂无排队中的任务'
      };
      container.innerHTML = `<div class="empty-state"><div class="empty-icon">📭</div><div class="empty-text">${emptyMessages[this.currentFilter]}</div></div>`;
      return;
    }
    
    container.innerHTML = jobs.map(job => {
      const isRunning = job.status === 'running' || job.status === 'queued';
      const badge = job.status==='running'?'<span class="card-badge badge-running"><span class="badge-dot-icon"></span>运行中</span>':
                    job.status==='queued'?'<span class="card-badge badge-queued"><i data-lucide="clock" class="lucide" style="width:11px;height:11px"></i>排队中</span>':
                    job.status==='failed'?'<span class="card-badge badge-running" style="background:#fee2e2;color:#dc2626">失败</span>':
                    job.status==='cancelled'?'<span class="card-badge" style="background:#f3f4f6;color:#6b7280">已取消</span>':
                    '<span class="card-badge badge-completed">已完成</span>';
      return `
        <div class="card" onclick="navigateTo('page-job-detail','${_store(job)}')">
          <div class="card-header">
            <div class="card-title"><i data-lucide="${job.icon||'cpu'}" class="lucide" style="width:16px;height:16px;color:var(--blue)"></i>${job.title}</div>
            ${badge}
          </div>
          <div class="job-meta">
            <span><i data-lucide="flask-conical" class="lucide" style="width:13px;height:13px"></i>${job.software} · ${job.type}</span>
            <span>${isRunning?(job.progress+'%'):(job.completed||job.duration||'-')}</span>
          </div>
          ${isRunning?`<div class="progress-track"><div class="progress-fill pf-blue" style="width:${job.progress}%"></div></div>`:''}
        </div>
      `;
    }).join('');
    if (typeof renderIcons === 'function') renderIcons();
  }
};

console.log('[UniSci] 板块2 计算任务系统已加载');
