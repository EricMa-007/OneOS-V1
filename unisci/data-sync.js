/**
 * UniSci Platform V2 - 数据同步层
 * 在渲染前从API拉取数据更新本地缓存，渲染器继续使用同步接口
 * 支持双模式：API模式优先拉取，模拟模式使用本地数据
 *
 * 使用方式:
 *   await DataSync.jobs.syncList();  // 同步任务列表
 *   await DataSync.notebooks.syncList();
 *   await DataSync.workflows.syncList();
 *   await DataSync.materials.syncList();
 */

'use strict';

const DataSync = (function() {
  // 同步状态缓存
  const syncState = {
    jobs: { lastSync: 0, syncing: false },
    notebooks: { lastSync: 0, syncing: false },
    workflows: { lastSync: 0, syncing: false },
    materials: { lastSync: 0, syncing: false },
  };

  const SYNC_INTERVAL = 30000; // 30秒内不重复同步

  // =========================================================================
  // 工具函数
  // =========================================================================
  function isMockMode() {
    if (typeof APIIntegration !== 'undefined') {
      return APIIntegration.isMockMode();
    }
    return localStorage.getItem('unisci_mock_mode') !== 'false';
  }

  function shouldSync(module) {
    if (isMockMode()) return false;
    const state = syncState[module];
    if (!state) return false;
    if (state.syncing) return false;
    return Date.now() - state.lastSync > SYNC_INTERVAL;
  }

  function markSyncStart(module) {
    if (syncState[module]) {
      syncState[module].syncing = true;
    }
  }

  function markSyncEnd(module) {
    if (syncState[module]) {
      syncState[module].syncing = false;
      syncState[module].lastSync = Date.now();
    }
  }

  function log(module, action, data) {
    console.log(`[DataSync:${module}] ${action}`, data ? `(${data.length} items)` : '');
  }

  // =========================================================================
  // 计算任务同步
  // =========================================================================
  const jobs = {
    async syncList(force = false) {
      if (!force && !shouldSync('jobs')) return false;
      if (typeof APIIntegration === 'undefined') return false;

      markSyncStart('jobs');
      try {
        const result = await APIIntegration.jobs.list({ page: 1, page_size: 50 });
        if (result.success && result.data) {
          const apiJobs = result.data.items || result.data || [];
          this.mergeJobsToLocal(apiJobs);
          log('jobs', 'synced', apiJobs);
          markSyncEnd('jobs');
          return true;
        }
      } catch (e) {
        console.warn('[DataSync:jobs] sync failed, using local data:', e.message);
      }
      markSyncEnd('jobs');
      return false;
    },

    async syncDetail(jobId, force = false) {
      if (isMockMode() || typeof APIIntegration === 'undefined') return null;
      try {
        const result = await APIIntegration.jobs.get(jobId);
        if (result.success && result.data) {
          this.mergeJobToLocal(result.data);
          return result.data;
        }
      } catch (e) {
        console.warn('[DataSync:jobs] detail sync failed:', e.message);
      }
      return null;
    },

    mergeJobsToLocal(apiJobs) {
      if (typeof JobManager === 'undefined' || typeof UserManager === 'undefined') return;
      const user = UserManager.getCurrentUser();
      if (!user) return;

      const running = [];
      const completed = [];

      apiJobs.forEach(apiJob => {
        const job = this.adaptJob(apiJob);
        if (['running', 'queued', 'pending'].includes(job.status)) {
          running.push(job);
        } else {
          completed.push(job);
        }
      });

      if (running.length > 0) user.runningJobs = running;
      if (completed.length > 0) user.completedJobs = completed;
    },

    mergeJobToLocal(apiJob) {
      if (typeof JobManager === 'undefined' || typeof UserManager === 'undefined') return;
      const user = UserManager.getCurrentUser();
      if (!user) return;

      const job = this.adaptJob(apiJob);
      const allJobs = [...(user.runningJobs || []), ...(user.completedJobs || [])];
      const idx = allJobs.findIndex(j => j.id === job.id);
      if (idx >= 0) {
        // 更新现有任务
        if (user.runningJobs) {
          const ri = user.runningJobs.findIndex(j => j.id === job.id);
          if (ri >= 0) user.runningJobs[ri] = job;
        }
        if (user.completedJobs) {
          const ci = user.completedJobs.findIndex(j => j.id === job.id);
          if (ci >= 0) user.completedJobs[ci] = job;
        }
      } else {
        // 新增任务
        if (['running', 'queued'].includes(job.status)) {
          if (!user.runningJobs) user.runningJobs = [];
          user.runningJobs.unshift(job);
        } else {
          if (!user.completedJobs) user.completedJobs = [];
          user.completedJobs.unshift(job);
        }
      }
    },

    adaptJob(apiJob) {
      const statusMap = {
        'pending': 'queued', 'queued': 'queued', 'running': 'running',
        'completed': 'completed', 'failed': 'failed', 'cancelled': 'cancelled',
        'success': 'completed', 'error': 'failed',
      };
      return {
        id: apiJob.id || apiJob.job_id || ('job_' + Date.now()),
        title: apiJob.title || apiJob.name || '计算任务',
        type: apiJob.type || apiJob.job_type || 'dft',
        software: apiJob.software || apiJob.application || 'VASP',
        softwareVersion: apiJob.software_version || apiJob.version || '6.3.0',
        status: statusMap[apiJob.status] || apiJob.status || 'queued',
        progress: apiJob.progress !== undefined ? apiJob.progress : (apiJob.status === 'completed' ? 100 : 0),
        icon: 'cpu',
        iconColor: 'blue',
        submitted: apiJob.created_at ? new Date(apiJob.created_at).toLocaleString('zh-CN') : new Date().toLocaleString('zh-CN'),
        submittedAt: apiJob.created_at || new Date().toISOString(),
        startedAt: apiJob.started_at || null,
        completedAt: apiJob.completed_at || null,
        eta: apiJob.eta || (apiJob.status === 'running' ? '计算中...' : '排队中...'),
        duration: apiJob.duration || '-',
        config: apiJob.config || apiJob.resource_config || {},
        inputFiles: apiJob.input_files || [],
        outputFiles: apiJob.output_files || [],
        logs: apiJob.logs || [{ timestamp: new Date().toISOString(), level: 'INFO', message: '任务已提交' }],
        results: apiJob.results || null,
        cost: apiJob.cost || apiJob.estimated_cost || 0,
        userId: apiJob.user_id || null,
      };
    },
  };

  // =========================================================================
  // Notebook同步
  // =========================================================================
  const notebooks = {
    async syncList(force = false) {
      if (!force && !shouldSync('notebooks')) return false;
      if (typeof APIIntegration === 'undefined') return false;

      markSyncStart('notebooks');
      try {
        const result = await APIIntegration.notebooks.list({ page: 1, page_size: 50 });
        if (result.success && result.data) {
          const apiNotebooks = result.data.items || result.data || [];
          this.mergeToLocal(apiNotebooks);
          log('notebooks', 'synced', apiNotebooks);
          markSyncEnd('notebooks');
          return true;
        }
      } catch (e) {
        console.warn('[DataSync:notebooks] sync failed:', e.message);
      }
      markSyncEnd('notebooks');
      return false;
    },

    mergeToLocal(apiNotebooks) {
      if (typeof NotebookManager === 'undefined' || typeof UserManager === 'undefined') return;
      const user = UserManager.getCurrentUser();
      if (!user) return;

      const adapted = apiNotebooks.map(nb => this.adaptNotebook(nb));
      if (adapted.length > 0) {
        user.notebooks = adapted;
      }
    },

    adaptNotebook(apiNb) {
      const statusMap = { 'running': 'running', 'stopped': 'stopped', 'idle': 'idle', 'error': 'error' };
      return {
        id: apiNb.id || apiNb.notebook_id || ('nb_' + Date.now()),
        title: apiNb.title || apiNb.name || '未命名Notebook',
        kernel: apiNb.kernel || apiNb.kernel_type || 'python3',
        status: statusMap[apiNb.status] || apiNb.status || 'stopped',
        createdAt: apiNb.created_at || new Date().toISOString(),
        updatedAt: apiNb.updated_at || new Date().toISOString(),
        cellCount: apiNb.cell_count || apiNb.cells?.length || 0,
        lastOpened: apiNb.last_opened_at || null,
        description: apiNb.description || '',
        tags: apiNb.tags || [],
        size: apiNb.size || 0,
      };
    },
  };

  // =========================================================================
  // 工作流同步
  // =========================================================================
  const workflows = {
    async syncList(force = false) {
      if (!force && !shouldSync('workflows')) return false;
      if (typeof APIIntegration === 'undefined') return false;

      markSyncStart('workflows');
      try {
        const result = await APIIntegration.workflows.list({ page: 1, page_size: 50 });
        if (result.success && result.data) {
          const apiWorkflows = result.data.items || result.data || [];
          this.mergeToLocal(apiWorkflows);
          log('workflows', 'synced', apiWorkflows);
          markSyncEnd('workflows');
          return true;
        }
      } catch (e) {
        console.warn('[DataSync:workflows] sync failed:', e.message);
      }
      markSyncEnd('workflows');
      return false;
    },

    mergeToLocal(apiWorkflows) {
      if (typeof WorkflowManager === 'undefined' || typeof UserManager === 'undefined') return;
      const user = UserManager.getCurrentUser();
      if (!user) return;

      const adapted = apiWorkflows.map(wf => this.adaptWorkflow(wf));
      if (adapted.length > 0) {
        user.workflows = adapted;
      }
    },

    adaptWorkflow(apiWf) {
      return {
        id: apiWf.id || apiWf.workflow_id || ('wf_' + Date.now()),
        name: apiWf.name || apiWf.title || '未命名工作流',
        description: apiWf.description || '',
        status: apiWf.status || 'draft',
        nodeCount: apiWf.node_count || apiWf.nodes?.length || 0,
        edgeCount: apiWf.edge_count || apiWf.edges?.length || 0,
        createdAt: apiWf.created_at || new Date().toISOString(),
        updatedAt: apiWf.updated_at || new Date().toISOString(),
        lastRunAt: apiWf.last_run_at || null,
        runCount: apiWf.run_count || 0,
        tags: apiWf.tags || [],
        category: apiWf.category || 'custom',
        nodes: apiWf.nodes || [],
        edges: apiWf.edges || [],
      };
    },
  };

  // =========================================================================
  // 材料数据库同步
  // =========================================================================
  const materials = {
    async syncList(force = false, params = {}) {
      if (!force && !shouldSync('materials')) return false;
      if (typeof APIIntegration === 'undefined') return false;

      markSyncStart('materials');
      try {
        const result = await APIIntegration.materials.list({ page: 1, page_size: 100, ...params });
        if (result.success && result.data) {
          const apiMaterials = result.data.items || result.data || [];
          this.mergeToLocal(apiMaterials);
          log('materials', 'synced', apiMaterials);
          markSyncEnd('materials');
          return true;
        }
      } catch (e) {
        console.warn('[DataSync:materials] sync failed:', e.message);
      }
      markSyncEnd('materials');
      return false;
    },

    async syncDetail(materialId, force = false) {
      if (isMockMode() || typeof APIIntegration === 'undefined') return null;
      try {
        const result = await APIIntegration.materials.get(materialId);
        if (result.success && result.data) {
          return result.data;
        }
      } catch (e) {
        console.warn('[DataSync:materials] detail sync failed:', e.message);
      }
      return null;
    },

    mergeToLocal(apiMaterials) {
      if (typeof MaterialManager === 'undefined') return;
      // 材料数据通常较大，只在API模式下替换
      if (!isMockMode() && apiMaterials.length > 0) {
        // 尝试更新MaterialManager的内部数据
        if (MaterialManager._materials) {
          MaterialManager._materials = apiMaterials.map(m => this.adaptMaterial(m));
        }
      }
    },

    adaptMaterial(apiMat) {
      return {
        id: apiMat.id || apiMat.material_id || ('mat_' + Date.now()),
        formula: apiMat.formula || apiMat.chemical_formula || 'Unknown',
        name: apiMat.name || apiMat.common_name || apiMat.formula || 'Unknown',
        category: apiMat.category || apiMat.material_type || 'other',
        crystalSystem: apiMat.crystal_system || apiMat.crystal_structure || 'cubic',
        spaceGroup: apiMat.space_group || apiMat.spacegroup || '',
        bandGap: apiMat.band_gap !== undefined ? apiMat.band_gap : null,
        formationEnergy: apiMat.formation_energy !== undefined ? apiMat.formation_energy : null,
        totalEnergy: apiMat.total_energy !== undefined ? apiMat.total_energy : null,
        volume: apiMat.volume || null,
        density: apiMat.density || null,
        latticeConstants: apiMat.lattice_constants || apiMat.lattice || { a: 0, b: 0, c: 0 },
        elements: apiMat.elements || [],
        tags: apiMat.tags || [],
        description: apiMat.description || '',
        createdAt: apiMat.created_at || new Date().toISOString(),
        properties: apiMat.properties || {},
      };
    },
  };

  // =========================================================================
  // 全局同步
  // =========================================================================
  async function syncAll(force = false) {
    const results = await Promise.allSettled([
      jobs.syncList(force),
      notebooks.syncList(force),
      workflows.syncList(force),
      materials.syncList(force),
    ]);
    return {
      jobs: results[0].status === 'fulfilled' ? results[0].value : false,
      notebooks: results[1].status === 'fulfilled' ? results[1].value : false,
      workflows: results[2].status === 'fulfilled' ? results[2].value : false,
      materials: results[3].status === 'fulfilled' ? results[3].value : false,
    };
  }

  function resetSyncCache() {
    Object.keys(syncState).forEach(key => {
      syncState[key].lastSync = 0;
    });
  }

  // =========================================================================
  // 公开API
  // =========================================================================
  return {
    jobs,
    notebooks,
    workflows,
    materials,
    syncAll,
    resetSyncCache,
    isMockMode,
  };
})();

// 导出
if (typeof window !== 'undefined') {
  window.DataSync = DataSync;
}
