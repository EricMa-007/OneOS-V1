/**
 * OneOS 笔记功能 E2E 测试
 */

describe('OneOS 笔记功能', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.navigateTo('notes');
  });

  it('应该显示笔记列表页面', () => {
    cy.get('[data-testid="notes-page"]').should('be.visible');
  });

  it('应该能够创建新笔记', () => {
    cy.get('[data-testid="new-note-button"]').click();
    cy.get('[data-testid="note-title-input"]').type('测试笔记标题');
    cy.get('[data-testid="note-content-editor"]').type('这是测试笔记的内容');
    cy.get('[data-testid="save-note-button"]').click();
    cy.contains('已保存').should('be.visible');
  });

  it('应该能够编辑笔记', () => {
    cy.createNote('待编辑笔记', '原始内容');
    cy.get('[data-testid="note-item"]').first().click();
    cy.get('[data-testid="note-content-editor"]').type('追加的内容');
    cy.get('[data-testid="save-note-button"]').click();
    cy.contains('已保存').should('be.visible');
  });

  it('应该能够删除笔记', () => {
    cy.createNote('待删除笔记', '内容');
    cy.get('[data-testid="note-item"]').first().find('[data-testid="delete-note-button"]').click();
    cy.get('[data-testid="confirm-delete"]').click();
    cy.contains('已删除').should('be.visible');
  });

  it('应该能够搜索笔记', () => {
    cy.createNote('搜索测试笔记', '特殊关键词12345');
    cy.get('[data-testid="search-input"]').type('特殊关键词12345');
    cy.get('[data-testid="search-results"]').should('contain', '搜索测试笔记');
  });

  it('应该能够使用Markdown格式', () => {
    cy.navigateTo('editor');
    cy.get('[data-testid="note-content-editor"]').type('# 标题\n\n**粗体** *斜体* `代码`');
    cy.get('[data-testid="preview-mode-button"]').click();
    cy.get('.markdown-preview h1').should('contain', '标题');
    cy.get('.markdown-preview strong').should('contain', '粗体');
    cy.get('.markdown-preview em').should('contain', '斜体');
    cy.get('.markdown-preview code').should('contain', '代码');
  });

  it('应该能够切换编辑/预览/分屏模式', () => {
    cy.navigateTo('editor');
    cy.get('[data-testid="mode-edit"]').should('have.class', 'active');
    cy.get('[data-testid="mode-preview"]').click();
    cy.get('[data-testid="mode-preview"]').should('have.class', 'active');
    cy.get('[data-testid="mode-split"]').click();
    cy.get('[data-testid="mode-split"]').should('have.class', 'active');
  });

  it('应该显示字数统计', () => {
    cy.navigateTo('editor');
    cy.get('[data-testid="note-content-editor"]').type('测试字数统计');
    cy.get('[data-testid="word-count"]').should('contain', '6');
  });

  it('应该能够使用快捷键保存', () => {
    cy.navigateTo('editor');
    cy.get('[data-testid="note-content-editor"]').type('快捷键测试');
    cy.get('[data-testid="note-content-editor"]').type('{ctrl+s}');
    cy.contains('已保存').should('be.visible');
  });
});
