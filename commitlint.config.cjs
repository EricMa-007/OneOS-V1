/**
 * OneOS Commitlint 配置
 * 维护者：A03 史密斯（代码审查官）
 * 
 * 提交信息格式：
 * <type>(<scope>): <subject>
 * 
 * 示例：
 * feat(editor): 添加Markdown实时预览功能
 * fix(graph): 修复知识图谱节点拖拽失效问题
 * docs(readme): 更新安装说明
 * style(ui): 统一按钮圆角风格
 * refactor(data): 重构数据适配层
 * test(search): 添加搜索服务单元测试
 * chore(build): 升级Vite到5.0
 */

module.exports = {
  extends: ['@commitlint/config-conventional'],
  
  rules: {
    // type 枚举
    'type-enum': [2, 'always', [
      'feat',     // 新功能
      'fix',      // Bug修复
      'docs',     // 文档更新
      'style',    // 代码格式（不影响功能）
      'refactor', // 代码重构（不是新功能也不是修bug）
      'perf',     // 性能优化
      'test',     // 测试相关
      'build',    // 构建系统或外部依赖变更
      'ci',       // CI/CD配置变更
      'chore',    // 杂项（不修改src或test）
      'revert',   // 回滚提交
      'wip',      // 进行中的工作（仅开发分支）
    ]],
    
    // type 不能为空
    'type-empty': [2, 'never'],
    
    // type 小写
    'type-case': [2, 'always', 'lower-case'],
    
    // scope 小写
    'scope-case': [2, 'always', 'lower-case'],
    
    // subject 不能为空
    'subject-empty': [2, 'never'],
    
    // subject 不以句号结尾
    'subject-full-stop': [2, 'never', '.'],
    
    // subject 首字母小写（中文不限制）
    'subject-case': [0, 'never'],
    
    // header 最大长度
    'header-max-length': [2, 'always', 100],
    
    // body 每行最大长度
    'body-max-line-length': [1, 'always', 120],
    
    // footer 每行最大长度
    'footer-max-line-length': [1, 'always', 120],
    
    // 必须有body（对于feat和fix）
    'body-empty': [0, 'never'],
    
    // 必须有footer（引用issue）
    'footer-empty': [0, 'never'],
  },
  
  // 忽略规则
  ignores: [
    (commit) => commit.startsWith('WIP:'),
    (commit) => commit.startsWith('Merge '),
    (commit) => commit.startsWith('Revert '),
  ],
  
  // 提示信息
  prompt: {
    questions: {
      type: {
        description: '选择提交类型',
        enum: {
          feat: { description: '新功能', title: 'Features' },
          fix: { description: 'Bug修复', title: 'Bug Fixes' },
          docs: { description: '文档更新', title: 'Documentation' },
          style: { description: '代码格式', title: 'Styles' },
          refactor: { description: '代码重构', title: 'Code Refactoring' },
          perf: { description: '性能优化', title: 'Performance Improvements' },
          test: { description: '测试相关', title: 'Tests' },
          build: { description: '构建系统', title: 'Builds' },
          ci: { description: 'CI/CD配置', title: 'Continuous Integrations' },
          chore: { description: '杂项', title: 'Chores' },
          revert: { description: '回滚', title: 'Reverts' },
        },
      },
      scope: {
        description: '影响范围（模块/组件）',
      },
      subject: {
        description: '简短描述（不超过100字符）',
      },
      body: {
        description: '详细描述（可选）',
      },
      isBreaking: {
        description: '是否有破坏性变更',
      },
      breakingBody: {
        description: '破坏性变更详情',
      },
      isIssueAffected: {
        description: '是否关联Issue',
      },
      issuesBody: {
        description: '关联的Issue编号（如 #123）',
      },
    },
  },
};
