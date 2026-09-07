/**
 * OneOS 应用加载与导航 E2E 测试
 */

describe('OneOS 应用加载与导航', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('应该成功加载应用', () => {
    cy.get('[data-testid="app-container"]').should('exist');
    cy.get('[data-testid="sidebar"]').should('be.visible');
    cy.get('[data-testid="main-content"]').should('be.visible');
  });

  it('应该显示应用标题', () => {
    cy.get('[data-testid="app-title"]').should('contain', 'OneOS');
  });

  it('应该显示侧边栏导航', () => {
    cy.get('[data-testid="nav-dashboard"]').should('be.visible');
    cy.get('[data-testid="nav-notes"]').should('be.visible');
    cy.get('[data-testid="nav-ai"]').should('be.visible');
    cy.get('[data-testid="nav-calendar"]').should('be.visible');
    cy.get('[data-testid="nav-graph"]').should('be.visible');
  });

  it('应该能够导航到仪表盘', () => {
    cy.navigateTo('dashboard');
    cy.get('[data-testid="dashboard-page"]').should('be.visible');
    cy.get('[data-testid="stats-cards"]').should('exist');
  });

  it('应该能够导航到笔记列表', () => {
    cy.navigateTo('notes');
    cy.get('[data-testid="notes-page"]').should('be.visible');
  });

  it('应该能够导航到AI对话', () => {
    cy.navigateTo('ai');
    cy.get('[data-testid="ai-page"]').should('be.visible');
    cy.get('[data-testid="ai-input"]').should('be.visible');
  });

  it('应该能够导航到日历', () => {
    cy.navigateTo('calendar');
    cy.get('[data-testid="calendar-page"]').should('be.visible');
    cy.get('[data-testid="calendar-grid"]').should('exist');
  });

  it('应该能够导航到知识图谱', () => {
    cy.navigateTo('graph');
    cy.get('[data-testid="graph-page"]').should('be.visible');
    cy.get('canvas').should('exist');
  });

  it('应该能够导航到设置', () => {
    cy.navigateTo('settings');
    cy.get('[data-testid="settings-page"]').should('be.visible');
  });

  it('应该能够使用底部导航在移动端切换', () => {
    cy.viewport('iphone-12');
    cy.get('[data-testid="bottom-nav"]').should('be.visible');
    cy.get('[data-testid="bottom-nav-ai"]').click();
    cy.get('[data-testid="ai-page"]').should('be.visible');
  });

  it('应该响应式适配移动端', () => {
    cy.viewport('iphone-12');
    cy.get('[data-testid="sidebar"]').should('not.be.visible');
    cy.get('[data-testid="bottom-nav"]').should('be.visible');
  });

  it('应该响应式适配平板', () => {
    cy.viewport('ipad-2');
    cy.get('[data-testid="sidebar"]').should('be.visible');
  });
});
