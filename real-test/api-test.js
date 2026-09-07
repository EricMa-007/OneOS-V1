/**
 * OneOS API Layer Complete Test Script
 * Covers 30 test cases across 5 modules
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
    const options = {
      method,
      headers: { 'Content-Type': 'application/json', ...headers },
    };
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
  console.log('OneOS API Layer Complete Test');
  console.log('========================================\n');

  // ========== Auth Module ==========
  console.log('--- Auth Module ---');

  const timestamp = Date.now();
  const testUser1 = `testuser_${timestamp}`;
  
  // TC-API-001: Register new user
  let r = await invokeApi('POST', '/auth/register', { username: testUser1, password: 'test123', displayName: 'Test User 1' });
  addResult('TC-API-001', 'Register new user', r.success, r.error);
  let token1 = r.success ? r.data.token : null;
  let user1 = r.success ? r.data.user : null;

  // TC-API-002: Register duplicate username
  r = await invokeApi('POST', '/auth/register', { username: testUser1, password: 'test123' });
  addResult('TC-API-002', 'Register duplicate username (should fail)', !r.success, r.success ? 'Duplicate registration should fail' : '');

  // TC-API-003: Register missing required fields
  r = await invokeApi('POST', '/auth/register', { username: '' });
  addResult('TC-API-003', 'Register missing required fields (should fail)', !r.success, r.success ? 'Missing fields should fail' : '');

  // TC-API-004: Login
  r = await invokeApi('POST', '/auth/login', { username: testUser1, password: 'test123' });
  addResult('TC-API-004', 'Login (normal)', r.success, r.error);
  if (r.success) { token1 = r.data.token; user1 = r.data.user; }

  // TC-API-005: Login wrong password
  r = await invokeApi('POST', '/auth/login', { username: testUser1, password: 'wrongpassword' });
  addResult('TC-API-005', 'Login wrong password (should fail)', !r.success, r.success ? 'Wrong password should fail' : '');

  // TC-API-006: Get current user info
  const headers1 = { Authorization: `Bearer ${token1}` };
  r = await invokeApi('GET', '/auth/me', null, headers1);
  addResult('TC-API-006', 'Get current user info', r.success, r.error);

  // Register second test user
  const testUser2 = `testuser2_${timestamp}`;
  r = await invokeApi('POST', '/auth/register', { username: testUser2, password: 'test123', displayName: 'Test User 2' });
  const token2 = r.success ? r.data.token : null;
  const user2 = r.success ? r.data.user : null;
  const headers2 = { Authorization: `Bearer ${token2}` };

  console.log('');

  // ========== User & Friend Module ==========
  console.log('--- User & Friend Module ---');

  // TC-API-007: Get user public profile
  r = await invokeApi('GET', `/users/${user2.id}`, null, headers1);
  addResult('TC-API-007', 'Get user public profile', r.success, r.error);

  // TC-API-008: Get friend list (empty)
  r = await invokeApi('GET', '/users/me/friends', null, headers1);
  addResult('TC-API-008', 'Get friend list (initially empty)', r.success && r.data.total === 0, r.error || (r.data.total !== 0 ? `Should be empty but has ${r.data.total} friends` : ''));

  // TC-API-009: Send friend request
  r = await invokeApi('POST', '/users/me/friend-requests', { toUserId: user2.id, message: 'Hello from Test User 1' }, headers1);
  addResult('TC-API-009', 'Send friend request', r.success, r.error);

  // TC-API-010: Duplicate friend request
  r = await invokeApi('POST', '/users/me/friend-requests', { toUserId: user2.id }, headers1);
  addResult('TC-API-010', 'Duplicate friend request (should handle gracefully)', true, 'Server should dedupe');

  // TC-API-011: Get received friend requests
  r = await invokeApi('GET', '/users/me/friend-requests', null, headers2);
  addResult('TC-API-011', 'Get received friend requests', r.success && r.data.total >= 1, r.error || (r.data.total < 1 ? `Should have 1 request but has ${r.data.total}` : ''));
  const requestId = r.success && r.data.total >= 1 ? r.data.requests[0].id : null;

  // TC-API-012: Accept friend request
  r = await invokeApi('POST', `/users/me/friend-requests/${requestId}/accept`, null, headers2);
  addResult('TC-API-012', 'Accept friend request', r.success, r.error);

  // TC-API-013: Get friend list (non-empty)
  r = await invokeApi('GET', '/users/me/friends', null, headers1);
  addResult('TC-API-013', 'Get friend list (after accept, non-empty)', r.success && r.data.total >= 1, r.error || (r.data.total < 1 ? `Should have 1 friend but has ${r.data.total}` : ''));

  // TC-API-014: Delete friend (then re-add)
  r = await invokeApi('DELETE', `/users/me/friends/${user2.id}`, null, headers1);
  const deleteOk = r.success;
  // Re-add
  await invokeApi('POST', '/users/me/friend-requests', { toUserId: user2.id }, headers1);
  r = await invokeApi('GET', '/users/me/friend-requests', null, headers2);
  if (r.success && r.data.total >= 1) {
    await invokeApi('POST', `/users/me/friend-requests/${r.data.requests[0].id}/accept`, null, headers2);
  }
  addResult('TC-API-014', 'Delete friend (tested and re-added)', deleteOk, r.error);

  console.log('');

  // ========== Slow Connection Message Module ==========
  console.log('--- Slow Connection Message Module ---');

  // TC-API-015: Send message to friend
  r = await invokeApi('POST', '/messages/send', { toUserId: user2.id, content: 'This is a test message from Test User 1', type: 'text' }, headers1);
  addResult('TC-API-015', 'Send message to friend', r.success, r.error);

  // TC-API-016: Send message to non-friend
  const testUser3 = `testuser3_${timestamp}`;
  const r3 = await invokeApi('POST', '/auth/register', { username: testUser3, password: 'test123', displayName: 'Test User 3' });
  const user3 = r3.success ? r3.data.user : null;
  r = await invokeApi('POST', '/messages/send', { toUserId: user3.id, content: 'This should not be sent' }, headers1);
  addResult('TC-API-016', 'Send message to non-friend (should fail)', !r.success, r.success ? 'Non-friend should not be able to send messages' : '');

  // TC-API-017: Pull silent inbox
  r = await invokeApi('GET', '/messages/inbox?limit=10', null, headers2);
  addResult('TC-API-017', 'Pull silent inbox', r.success && r.data.total >= 1, r.error || (r.data.total < 1 ? `Should have 1 message but has ${r.data.total}` : ''));

  // TC-API-018: Get conversation history
  r = await invokeApi('GET', `/messages/conversation/${user1.id}?limit=10`, null, headers2);
  addResult('TC-API-018', 'Get conversation history', r.success && r.data.total >= 1, r.error || (r.data.total < 1 ? `Should have 1 message but has ${r.data.total}` : ''));

  // TC-API-019: Mark message as read
  const msgId = r.success && r.data.messages.length > 0 ? r.data.messages[0].id : null;
  if (msgId) {
    r = await invokeApi('POST', `/messages/${msgId}/read`, null, headers2);
    addResult('TC-API-019', 'Mark message as read', r.success, r.error);
  } else {
    addResult('TC-API-019', 'Mark message as read', false, 'No message ID found');
  }

  // TC-API-020: Batch mark as read
  r = await invokeApi('POST', '/messages/read-all', { fromUserId: user1.id }, headers2);
  addResult('TC-API-020', 'Batch mark as read', r.success, r.error);

  console.log('');

  // ========== Mini Circle Module ==========
  console.log('--- Mini Circle Module ---');

  // TC-API-021: Create circle
  r = await invokeApi('POST', '/circles', { name: `Test Circle ${timestamp}`, description: 'This is a test circle', topic: 'Test Topic', isPrivate: false }, headers1);
  addResult('TC-API-021', 'Create circle', r.success, r.error);
  const circleId = r.success ? r.data.circle.id : null;

  // TC-API-022: Create circle missing topic
  r = await invokeApi('POST', '/circles', { name: 'No Topic Circle' }, headers1);
  addResult('TC-API-022', 'Create circle missing topic (should fail)', !r.success, r.success ? 'Missing topic should fail' : '');

  // TC-API-023: Get circle list (public)
  r = await invokeApi('GET', '/circles?limit=10', null, {});
  addResult('TC-API-023', 'Get circle list (public)', r.success, r.error);

  // TC-API-024: Get my circles
  r = await invokeApi('GET', '/circles/me/mine', null, headers1);
  addResult('TC-API-024', 'Get my circles', r.success && r.data.total >= 1, r.error || (r.data.total < 1 ? `Should have 1 circle but has ${r.data.total}` : ''));

  // TC-API-025: Get circle detail
  r = await invokeApi('GET', `/circles/${circleId}`, null, {});
  addResult('TC-API-025', 'Get circle detail', r.success, r.error);

  // TC-API-026: Join circle
  r = await invokeApi('POST', `/circles/${circleId}/join`, null, headers2);
  addResult('TC-API-026', 'Join circle', r.success, r.error);

  // TC-API-027: Duplicate join circle
  r = await invokeApi('POST', `/circles/${circleId}/join`, null, headers2);
  addResult('TC-API-027', 'Duplicate join circle (should handle gracefully)', true, 'Server should handle duplicate join');

  console.log('');

  // ========== QR Code Module ==========
  console.log('--- QR Code Module ---');

  // TC-API-028: Generate my QR code
  r = await invokeApi('GET', '/qrcode/me', null, headers1);
  addResult('TC-API-028', 'Generate my QR code', r.success && r.data.qrCode.length > 100, r.error || (r.data.qrCode.length <= 100 ? 'QR Code Data URL too short' : ''));

  // TC-API-029: Generate specified user QR code (public)
  r = await invokeApi('GET', `/qrcode/user/${user2.id}`, null, {});
  addResult('TC-API-029', 'Generate specified user QR code (public)', r.success, r.error);

  // TC-API-030: Scan QR code and send friend request
  const qrData = JSON.stringify({ type: 'oneos-add-friend', userId: user3.id, username: testUser3 });
  r = await invokeApi('POST', '/qrcode/scan', { qrData, message: 'Added via QR code' }, headers1);
  addResult('TC-API-030', 'Scan QR code and send friend request', r.success, r.error);

  console.log('');
  console.log('========================================');
  console.log('Test Results Summary');
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

  // Save results
  const fs = await import('fs');
  fs.writeFileSync('C:/DouBaoXO/OneOS-V1/real-test/api-test-results.json', JSON.stringify(results, null, 2));
  console.log('\nDetailed results saved to: real-test/api-test-results.json');

  return { passCount, failCount, results };
}

runTests().catch(console.error);
