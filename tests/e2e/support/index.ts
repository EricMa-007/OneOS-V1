// ***********************************************
// OneOS E2E 测试入口文件
// ***********************************************

import './commands';

// 全局测试配置
Cypress.config('defaultCommandTimeout', 10000);

// 全局钩子
beforeEach(() => {
  // 清除本地存储，确保测试隔离
  cy.clearLocalStorage();
  cy.clearCookies();
});

// 全局错误处理
Cypress.on('uncaught:exception', (err, runnable) => {
  // 忽略某些已知错误
  if (err.message.includes('ResizeObserver loop')) {
    return false;
  }
  // 让测试失败
  return true;
});

// 测试完成后截图
afterEach(() => {
  const testState = (cy as any).state?.();
  if (testState === 'failed') {
    cy.screenshot();
  }
});
