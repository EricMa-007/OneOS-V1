// ***********************************************
// OneOS E2E 测试自定义命令
// ***********************************************

Cypress.Commands.add('login', (email: string, password: string) => {
  cy.session([email, password], () => {
    cy.visit('/login');
    cy.get('[data-testid="email-input"]').type(email);
    cy.get('[data-testid="password-input"]').type(password);
    cy.get('[data-testid="login-button"]').click();
    cy.url().should('not.include', '/login');
  });
});

Cypress.Commands.add('createNote', (title: string, content: string) => {
  cy.get('[data-testid="new-note-button"]').click();
  cy.get('[data-testid="note-title-input"]').type(title);
  cy.get('[data-testid="note-content-editor"]').type(content);
  cy.get('[data-testid="save-note-button"]').click();
  cy.contains('已保存').should('be.visible');
});

Cypress.Commands.add('sendAIMessage', (message: string) => {
  cy.get('[data-testid="ai-input"]').type(message);
  cy.get('[data-testid="ai-send-button"]').click();
  cy.get('[data-testid="ai-message"]').should('have.length.greaterThan', 0);
});

Cypress.Commands.add('search', (query: string) => {
  cy.get('[data-testid="search-input"]').type(query);
  cy.get('[data-testid="search-results"]').should('be.visible');
});

Cypress.Commands.add('navigateTo', (page: string) => {
  const navItems: Record<string, string> = {
    dashboard: '[data-testid="nav-dashboard"]',
    notes: '[data-testid="nav-notes"]',
    editor: '[data-testid="nav-editor"]',
    ai: '[data-testid="nav-ai"]',
    calendar: '[data-testid="nav-calendar"]',
    graph: '[data-testid="nav-graph"]',
    social: '[data-testid="nav-social"]',
    voice: '[data-testid="nav-voice"]',
    search: '[data-testid="nav-search"]',
    settings: '[data-testid="nav-settings"]',
  };
  cy.get(navItems[page]).click();
  cy.url().should('include', page);
});

declare global {
  namespace Cypress {
    interface Chainable {
      login(email: string, password: string): Chainable<void>;
      createNote(title: string, content: string): Chainable<void>;
      sendAIMessage(message: string): Chainable<void>;
      search(query: string): Chainable<void>;
      navigateTo(page: string): Chainable<void>;
    }
  }
}

export {};
