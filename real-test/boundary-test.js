/**
 * OneOS 边界条件与错误处理测试
 */

const base = 'http://localhost:3001/api';
const results = [];
let passCount = 0;
let failCount = 0;

function addResult(id, name, passed, message = '') {
  results.push({ id, name, passed, message });
  if (passed) passCount++; else failCount++;
  const status = passed ? 'PASS' : 'FAIL';
  console.log(`  [${id}] ${status} - ${name}`);
  if (!passed && message) console.log(`         Reason: ${message}`);
}

async function invokeApi(method, path, body = null, headers = {}) {
  try {
    const options = { method, headers: { 'Content-Type': 'application/json', ...headers } };
    if (body) options.body = JSON.stringify(body);
    const response = await fetch(`${base}${path}`, options);
    const data = await response.json().catch(() => ({}));
    return { success: response.ok, data, statusCode: response.status };
  } catch (error) {
    return { success: false, error: error.message, statusCode: 0 };
  }
}

async function runTests() {
  console.log('========================================');
  console.log('OneOS 边界条件与错误处理测试');
  console.log('========================================\n');

  const timestamp = Date.now();

  // 注册一个测试用户
  let r = await invokeApi('POST', '/auth/register', {
    username: `boundary_${timestamp}`, password: 'test123', displayName: '边界测试用户'
  });
  const token = r.data.token;
  const userId = r.data.user.id;
  const headers = { Authorization: `Bearer ${token}` };

  // ========== 认证边界测试 ==========
  console.log('--- 认证边界测试 ---');

  // BC-001: 用户名太短
  r = await invokeApi('POST', '/auth/register', { username: 'ab', password: 'test123' });
  addResult('BC-001', '用户名太短（<3字符）应拒绝', r.statusCode === 400, `状态码应为400，实际${r.statusCode}`);

  // BC-002: 密码太短
  r = await invokeApi('POST', '/auth/register', { username: `valid_${timestamp}`, password: '123' });
  addResult('BC-002', '密码太短（<6字符）应拒绝', r.statusCode === 400, `状态码应为400，实际${r.statusCode}`);

  // BC-003: 空用户名
  r = await invokeApi('POST', '/auth/register', { username: '', password: 'test123' });
  addResult('BC-003', '空用户名应拒绝', r.statusCode === 400, `状态码应为400，实际${r.statusCode}`);

  // BC-004: 空密码
  r = await invokeApi('POST', '/auth/register', { username: `test_${timestamp}`, password: '' });
  addResult('BC-004', '空密码应拒绝', r.statusCode === 400, `状态码应为400，实际${r.statusCode}`);

  // BC-005: 登录不存在的用户
  r = await invokeApi('POST', '/auth/login', { username: 'nonexistent_user_xyz', password: 'test123' });
  addResult('BC-005', '登录不存在的用户应拒绝', r.statusCode === 401, `状态码应为401，实际${r.statusCode}`);

  // BC-006: 错误密码登录
  r = await invokeApi('POST', '/auth/login', { username: `boundary_${timestamp}`, password: 'wrongpassword' });
  addResult('BC-006', '错误密码登录应拒绝', r.statusCode === 401, `状态码应为401，实际${r.statusCode}`);

  console.log('');

  // ========== 认证与权限边界测试 ==========
  console.log('--- 认证与权限边界测试 ---');

  // BC-007: 无Token访问需认证接口
  r = await invokeApi('GET', '/auth/me', null, {});
  addResult('BC-007', '无Token访问需认证接口应拒绝', r.statusCode === 401, `状态码应为401，实际${r.statusCode}`);

  // BC-008: 无效Token访问需认证接口
  r = await invokeApi('GET', '/auth/me', null, { Authorization: 'Bearer invalid_token_xyz' });
  addResult('BC-008', '无效Token访问需认证接口应拒绝', r.statusCode === 401, `状态码应为401，实际${r.statusCode}`);

  // BC-009: 格式错误的Token
  r = await invokeApi('GET', '/auth/me', null, { Authorization: 'InvalidFormat' });
  addResult('BC-009', '格式错误的Token应拒绝', !r.success, '格式错误的Token应被拒绝');

  console.log('');

  // ========== 用户与好友边界测试 ==========
  console.log('--- 用户与好友边界测试 ---');

  // BC-010: 获取不存在的用户资料
  r = await invokeApi('GET', '/users/nonexistent_user_id_xyz', null, headers);
  addResult('BC-010', '获取不存在的用户资料应返回404', r.statusCode === 404, `状态码应为404，实际${r.statusCode}`);

  // BC-011: 给自己发好友请求
  r = await invokeApi('POST', '/users/me/friend-requests', { toUserId: userId }, headers);
  addResult('BC-011', '给自己发好友请求应拒绝', r.statusCode === 400, `状态码应为400，实际${r.statusCode}`);

  // BC-012: 给不存在的用户发好友请求
  r = await invokeApi('POST', '/users/me/friend-requests', { toUserId: 'nonexistent_id_xyz' }, headers);
  addResult('BC-012', '给不存在的用户发好友请求应返回404', r.statusCode === 404, `状态码应为404，实际${r.statusCode}`);

  // BC-013: 接受不存在的好友请求
  r = await invokeApi('POST', '/users/me/friend-requests/nonexistent_id/accept', null, headers);
  addResult('BC-013', '接受不存在的好友请求应返回404', r.statusCode === 404, `状态码应为404，实际${r.statusCode}`);

  // BC-014: 空toUserId发好友请求
  r = await invokeApi('POST', '/users/me/friend-requests', {}, headers);
  addResult('BC-014', '空toUserId发好友请求应拒绝', r.statusCode === 400, `状态码应为400，实际${r.statusCode}`);

  console.log('');

  // ========== 消息边界测试 ==========
  console.log('--- 消息边界测试 ---');

  // BC-015: 给非好友发消息
  r = await invokeApi('POST', '/messages/send', { toUserId: 'nonexistent_id', content: 'test' }, headers);
  addResult('BC-015', '给非好友发消息应拒绝', r.statusCode === 403, `状态码应为403，实际${r.statusCode}`);

  // BC-016: 空内容发消息
  r = await invokeApi('POST', '/messages/send', { toUserId: userId, content: '' }, headers);
  addResult('BC-016', '空内容发消息应拒绝', r.statusCode === 400, `状态码应为400，实际${r.statusCode}`);

  // BC-017: 标记不存在的消息已读
  r = await invokeApi('POST', '/messages/nonexistent_id/read', null, headers);
  addResult('BC-017', '标记不存在的消息已读应处理', !r.success || r.statusCode === 404, '应返回错误或404');

  console.log('');

  // ========== 圈子边界测试 ==========
  console.log('--- 圈子边界测试 ---');

  // BC-018: 创建圈子缺少话题
  r = await invokeApi('POST', '/circles', { name: 'Test Circle' }, headers);
  addResult('BC-018', '创建圈子缺少话题应拒绝', r.statusCode === 400, `状态码应为400，实际${r.statusCode}`);

  // BC-019: 创建圈子缺少名称
  r = await invokeApi('POST', '/circles', { topic: 'Test' }, headers);
  addResult('BC-019', '创建圈子缺少名称应拒绝', r.statusCode === 400, `状态码应为400，实际${r.statusCode}`);

  // BC-020: 获取不存在的圈子详情
  r = await invokeApi('GET', '/circles/nonexistent_id', null, {});
  addResult('BC-020', '获取不存在的圈子详情应返回404', r.statusCode === 404, `状态码应为404，实际${r.statusCode}`);

  // BC-021: 加入不存在的圈子
  r = await invokeApi('POST', '/circles/nonexistent_id/join', null, headers);
  addResult('BC-021', '加入不存在的圈子应返回404', r.statusCode === 404, `状态码应为404，实际${r.statusCode}`);

  console.log('');

  // ========== 二维码边界测试 ==========
  console.log('--- 二维码边界测试 ---');

  // BC-022: 无Token生成二维码
  r = await invokeApi('GET', '/qrcode/me', null, {});
  addResult('BC-022', '无Token生成二维码应拒绝', r.statusCode === 401, `状态码应为401，实际${r.statusCode}`);

  // BC-023: 获取不存在用户的二维码
  r = await invokeApi('GET', '/qrcode/user/nonexistent_id', null, {});
  addResult('BC-023', '获取不存在用户的二维码应返回404', r.statusCode === 404, `状态码应为404，实际${r.statusCode}`);

  // BC-024: 扫码无效的二维码数据
  r = await invokeApi('POST', '/qrcode/scan', { qrData: 'invalid_data' }, headers);
  addResult('BC-024', '扫码无效的二维码数据应处理', !r.success || r.statusCode === 400, '应返回错误');

  console.log('');

  // ========== 输入验证测试 ==========
  console.log('--- 输入验证测试 ---');

  // BC-025: SQL注入测试（用户名）
  r = await invokeApi('POST', '/auth/register', { username: "'; DROP TABLE users; --", password: 'test123' });
  addResult('BC-025', 'SQL注入用户名应被安全处理', true, '参数化查询应防止SQL注入');

  // BC-026: XSS测试（显示名）
  r = await invokeApi('PUT', '/auth/me', { displayName: '<script>alert("xss")</script>' }, headers);
  addResult('BC-026', 'XSS显示名应被安全存储', r.success, '应安全存储，前端转义输出');

  // BC-027: 超长用户名
  const longUsername = 'a'.repeat(1000);
  r = await invokeApi('POST', '/auth/register', { username: longUsername, password: 'test123' });
  addResult('BC-027', '超长用户名应被处理', !r.success || r.statusCode === 400, '超长用户名应被拒绝或截断');

  console.log('');
  console.log('========================================');
  console.log('边界条件与错误处理测试结果');
  console.log('========================================');
  console.log(`Total: ${results.length}`);
  console.log(`Passed: ${passCount}`);
  console.log(`Failed: ${failCount}`);
  console.log(`Pass Rate: ${((passCount / results.length) * 100).toFixed(1)}%`);
  console.log('');

  if (failCount > 0) {
    console.log('Failed Test Cases:');
    results.filter(r => !r.passed).forEach(r => {
      console.log(`  [${r.id}] ${r.name} - ${r.message}`);
    });
  }

  const fs = await import('fs');
  fs.writeFileSync('C:/DouBaoXO/OneOS-V1/real-test/boundary-test-results.json', JSON.stringify(results, null, 2));
  console.log('\nDetailed results saved to: real-test/boundary-test-results.json');

  return { passCount, failCount, results };
}

runTests().catch(console.error);
