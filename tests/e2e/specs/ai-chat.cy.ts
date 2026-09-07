/**
 * OneOS AI对话功能 E2E 测试
 */

describe('OneOS AI对话功能', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.navigateTo('ai');
  });

  it('应该显示AI对话页面', () => {
    cy.get('[data-testid="ai-page"]').should('be.visible');
    cy.get('[data-testid="ai-input"]').should('be.visible');
    cy.get('[data-testid="ai-send-button"]').should('be.visible');
  });

  it('应该能够发送消息', () => {
    cy.get('[data-testid="ai-input"]').type('你好');
    cy.get('[data-testid="ai-send-button"]').click();
    cy.get('[data-testid="user-message"]').should('contain', '你好');
  });

  it('应该能够接收AI回复', () => {
    cy.sendAIMessage('介绍一下你自己');
    cy.get('[data-testid="ai-message"]').should('have.length.greaterThan', 0);
    cy.get('[data-testid="ai-message"]').first().should('not.be.empty');
  });

  it('应该显示流式响应进度', () => {
    cy.get('[data-testid="ai-input"]').type('写一篇短文');
    cy.get('[data-testid="ai-send-button"]').click();
    cy.get('[data-testid="streaming-progress"]').should('be.visible');
  });

  it('应该能够切换AI人设', () => {
    cy.get('[data-testid="persona-selector"]').click();
    cy.get('[data-testid="persona-writer"]').click();
    cy.get('[data-testid="current-persona"]').should('contain', '写作伙伴');
  });

  it('应该能够搜索历史对话', () => {
    cy.sendAIMessage('这是一个搜索测试消息');
    cy.get('[data-testid="conversation-search"]').type('搜索测试');
    cy.get('[data-testid="search-results"]').should('contain', '搜索测试');
  });

  it('应该能够复制AI回复', () => {
    cy.sendAIMessage('说一句话');
    cy.get('[data-testid="ai-message"]').first().find('[data-testid="copy-button"]').click();
    cy.contains('已复制').should('be.visible');
  });

  it('应该能够重新生成回复', () => {
    cy.sendAIMessage('生成一个随机数');
    cy.get('[data-testid="ai-message"]').first().find('[data-testid="regenerate-button"]').click();
    cy.get('[data-testid="streaming-progress"]').should('be.visible');
  });

  it('应该显示快捷提示', () => {
    cy.get('[data-testid="quick-prompt"]').should('exist');
    cy.get('[data-testid="quick-prompt"]').first().click();
    cy.get('[data-testid="ai-input"]').should('not.be.empty');
  });

  it('应该能够使用Enter发送消息', () => {
    cy.get('[data-testid="ai-input"]').type('回车发送测试{enter}');
    cy.get('[data-testid="user-message"]').should('contain', '回车发送测试');
  });

  it('应该显示空状态引导', () => {
    cy.get('[data-testid="empty-state"]').should('be.visible');
    cy.get('[data-testid="empty-state"]').should('contain', '开始对话');
  });

  it('应该显示当前人设信息', () => {
    cy.get('[data-testid="persona-selector"]').click();
    cy.get('[data-testid="persona-programmer"]').click();
    cy.get('[data-testid="current-persona"]').should('contain', '编程专家');
    cy.get('[data-testid="persona-description"]').should('be.visible');
  });
});
