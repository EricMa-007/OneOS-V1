/**
 * OneOS 双用户交互模拟测试
 * 模拟两个真实用户的完整交互流程
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
  console.log('OneOS 双用户交互模拟测试');
  console.log('========================================\n');

  const timestamp = Date.now();

  // ========== 初始化：注册两个用户 ==========
  console.log('--- 初始化：注册两个用户 ---');

  const userAName = `alice_e2e_${timestamp}`;
  const userBName = `bob_e2e_${timestamp}`;

  let r = await invokeApi('POST', '/auth/register', {
    username: userAName, password: 'test123', displayName: '爱丽丝(E2E)', bio: '热爱哲学和AI的研究者', topicTags: ['AI', '哲学', '物理']
  });
  const tokenA = r.data.token;
  const userA = r.data.user;
  const headersA = { Authorization: `Bearer ${tokenA}` };
  addResult('E2E-001', '用户A注册成功', r.success, r.error);

  r = await invokeApi('POST', '/auth/register', {
    username: userBName, password: 'test123', displayName: '鲍勃(E2E)', bio: '全栈工程师，喜欢开源', topicTags: ['编程', 'AI', '音乐']
  });
  const tokenB = r.data.token;
  const userB = r.data.user;
  const headersB = { Authorization: `Bearer ${tokenB}` };
  addResult('E2E-002', '用户B注册成功', r.success, r.error);

  console.log('');

  // ========== 流程1：通过二维码建立好友关系 ==========
  console.log('--- 流程1：通过二维码建立好友关系 ---');

  // 1.1 用户A生成二维码
  r = await invokeApi('GET', '/qrcode/me', null, headersA);
  addResult('E2E-101', '用户A生成二维码', r.success && r.data.qrCode.length > 100, r.error);
  const qrDataA = r.data.qrData;

  // 1.2 用户B扫码用户A的二维码，发送好友请求
  r = await invokeApi('POST', '/qrcode/scan', {
    qrData: JSON.stringify(qrDataA),
    message: '你好爱丽丝，我是鲍勃，看到我们都对AI感兴趣'
  }, headersB);
  addResult('E2E-102', '用户B扫码并发送好友请求', r.success, r.error);

  // 1.3 用户A查看收到的好友请求
  r = await invokeApi('GET', '/users/me/friend-requests', null, headersA);
  addResult('E2E-103', '用户A收到好友请求', r.success && r.data.total >= 1, r.error || `应有1个请求，实际${r.data?.total}`);
  const requestId = r.data.requests[0].id;

  // 1.4 验证请求内容
  const requestContent = r.data.requests[0].message.includes('AI');
  addResult('E2E-104', '好友请求内容正确', requestContent, '请求消息应包含AI话题');

  // 1.5 用户A接受好友请求
  r = await invokeApi('POST', `/users/me/friend-requests/${requestId}/accept`, null, headersA);
  addResult('E2E-105', '用户A接受好友请求', r.success, r.error);

  // 1.6 验证用户A的好友列表
  r = await invokeApi('GET', '/users/me/friends', null, headersA);
  const aHasB = r.data.friends.some(f => f.id === userB.id);
  addResult('E2E-106', '用户A好友列表包含用户B', aHasB, '用户A好友列表应包含用户B');

  // 1.7 验证用户B的好友列表
  r = await invokeApi('GET', '/users/me/friends', null, headersB);
  const bHasA = r.data.friends.some(f => f.id === userA.id);
  addResult('E2E-107', '用户B好友列表包含用户A', bHasA, '用户B好友列表应包含用户A');

  console.log('');

  // ========== 流程2：慢连接消息交互 ==========
  console.log('--- 流程2：慢连接消息交互 ---');

  // 2.1 用户A给用户B发送第一条消息
  const msg1 = '你好鲍勃！很高兴认识你。我最近在研究AI的哲学意义，你有什么看法？';
  r = await invokeApi('POST', '/messages/send', { toUserId: userB.id, content: msg1, type: 'text' }, headersA);
  addResult('E2E-201', '用户A发送第一条消息', r.success, r.error);

  // 2.2 用户B拉取静默收件箱（模拟用户主动查看）
  r = await invokeApi('GET', '/messages/inbox?limit=10', null, headersB);
  addResult('E2E-202', '用户B拉取静默收件箱', r.success && r.data.total >= 1, r.error || `应有1条消息，实际${r.data?.total}`);

  // 2.3 验证消息未读状态
  const unreadCount = r.data.unreadCount;
  addResult('E2E-203', '消息显示为未读', unreadCount >= 1, `应有至少1条未读，实际${unreadCount}`);

  // 2.4 验证消息内容正确
  const latestMsg = r.data.messages[0];
  const contentCorrect = latestMsg.content === msg1;
  addResult('E2E-204', '消息内容正确', contentCorrect, '消息内容应与发送的一致');

  // 2.5 验证发送者信息正确
  const senderCorrect = latestMsg.fromUser.id === userA.id;
  addResult('E2E-205', '发送者信息正确', senderCorrect, '发送者应为用户A');

  // 2.6 用户B打开对话，标记已读
  r = await invokeApi('POST', '/messages/read-all', { fromUserId: userA.id }, headersB);
  addResult('E2E-206', '用户B标记消息已读', r.success, r.error);

  // 2.7 用户B回复消息
  const msg2 = '你好爱丽丝！AI的哲学意义确实是个深刻的话题。我认为AI更像是一面镜子，反映出人类对智能的理解。你觉得呢？';
  r = await invokeApi('POST', '/messages/send', { toUserId: userA.id, content: msg2, type: 'text' }, headersB);
  addResult('E2E-207', '用户B回复消息', r.success, r.error);

  // 2.8 用户A拉取收件箱，看到回复
  r = await invokeApi('GET', '/messages/inbox?limit=10', null, headersA);
  const aHasReply = r.data.messages.some(m => m.content === msg2);
  addResult('E2E-208', '用户A收到回复', aHasReply, '用户A应收到用户B的回复');

  // 2.9 验证对话历史完整性
  r = await invokeApi('GET', `/messages/conversation/${userB.id}?limit=10`, null, headersA);
  const convHasBoth = r.data.messages.some(m => m.content === msg1) && r.data.messages.some(m => m.content === msg2);
  addResult('E2E-209', '对话历史包含双方消息', convHasBoth, '对话历史应包含双方的消息');

  console.log('');

  // ========== 流程3：极小圈子互动 ==========
  console.log('--- 流程3：极小圈子互动 ---');

  // 3.1 用户A创建圈子
  const circleName = `AI哲学讨论组_${timestamp}`;
  r = await invokeApi('POST', '/circles', {
    name: circleName,
    description: '探讨AI的哲学意义和未来发展',
    topic: 'AI哲学',
    isPrivate: false
  }, headersA);
  addResult('E2E-301', '用户A创建极小圈子', r.success, r.error);
  const circleId = r.data.circle.id;

  // 3.2 验证圈子创建者是用户A
  r = await invokeApi('GET', `/circles/${circleId}`, null, {});
  const ownerCorrect = r.data.circle.ownerId === userA.id;
  addResult('E2E-302', '圈子创建者正确', ownerCorrect, '圈子创建者应为用户A');

  // 3.3 验证圈子最大人数限制
  const maxMembersCorrect = r.data.circle.maxMembers === 10;
  addResult('E2E-303', '圈子最大人数为10', maxMembersCorrect, `最大人数应为10，实际${r.data.circle.maxMembers}`);

  // 3.4 用户B发现并加入圈子
  r = await invokeApi('POST', `/circles/${circleId}/join`, null, headersB);
  addResult('E2E-304', '用户B加入圈子', r.success, r.error);

  // 3.5 验证圈子成员数
  r = await invokeApi('GET', `/circles/${circleId}`, null, {});
  const memberCountCorrect = r.data.circle.memberCount === 2;
  addResult('E2E-305', '圈子成员数为2', memberCountCorrect, `成员数应为2，实际${r.data.circle.memberCount}`);

  // 3.6 验证用户B在成员列表中
  const bInMembers = r.data.members.some(m => m.id === userB.id);
  addResult('E2E-306', '用户B在圈子成员列表中', bInMembers, '用户B应在圈子成员列表中');

  // 3.7 用户A创建共享文档（讨论自动沉淀）
  r = await invokeApi('POST', `/circles/${circleId}/documents`, {
    title: 'AI哲学讨论纪要 - 第一次',
    content: '# AI哲学讨论纪要\n\n## 议题\nAI的哲学意义是什么？\n\n## 观点\n- AI是人类智能的镜子\n- AI引发了对意识本质的思考\n\n## 待讨论\n- AI是否可能拥有意识？\n- 人类与AI的关系应该是什么？',
    contentType: 'markdown'
  }, headersA);
  addResult('E2E-307', '用户A创建共享文档', r.success, r.error);

  // 3.8 验证圈子文档列表
  r = await invokeApi('GET', `/circles/${circleId}/documents`, null, headersA);
  addResult('E2E-308', '圈子文档列表包含新文档', r.success && r.data.total >= 1, r.error || `应有1个文档，实际${r.data?.total}`);

  console.log('');

  // ========== 流程4：人类节点发现 ==========
  console.log('--- 流程4：人类节点发现 ---');

  // 创建第三个用户（用户C），设置与用户B相同的话题标签
  const userCName = `charlie_e2e_${timestamp}`;
  r = await invokeApi('POST', '/auth/register', {
    username: userCName, password: 'test123', displayName: '查理(E2E)', bio: '音乐人，对AI艺术感兴趣', topicTags: ['音乐', 'AI', '艺术']
  });
  const tokenC = r.data.token;
  const userC = r.data.user;
  const headersC = { Authorization: `Bearer ${tokenC}` };
  addResult('E2E-400', '用户C注册成功（用于推荐测试）', r.success, r.error);

  // 4.1 用户B查看人类节点发现（基于话题推荐）
  r = await invokeApi('GET', '/users/discover/humans?limit=10', null, headersB);
  addResult('E2E-401', '用户B查看人类节点发现', r.success, r.error);

  // 4.2 验证推荐列表中包含用户C（因为有共同话题AI和音乐）
  const cInRecommendations = r.data.recommendations.some(rec => rec.id === userC.id);
  addResult('E2E-402', '推荐列表包含用户C（共同话题AI/音乐）', cInRecommendations, '用户C应出现在推荐列表中（共同话题AI和音乐）');

  // 4.3 验证共同话题计算正确
  const recC = r.data.recommendations.find(rec => rec.id === userC.id);
  const commonTagsCorrect = recC && recC.commonTags.includes('AI') && recC.commonTags.includes('音乐') && recC.commonCount >= 2;
  addResult('E2E-403', '共同话题计算正确（包含AI和音乐）', commonTagsCorrect, '共同话题应包含AI和音乐，至少2个');

  console.log('');

  // ========== 流程5：数据一致性验证 ==========
  console.log('--- 流程5：数据一致性验证 ---');

  // 5.1 验证用户A的资料
  r = await invokeApi('GET', '/auth/me', null, headersA);
  const profileCorrect = r.data.username === userAName && r.data.displayName === '爱丽丝(E2E)';
  addResult('E2E-501', '用户A资料一致性', profileCorrect, '用户A资料应与注册时一致');

  // 5.2 验证用户A的话题标签
  const tagsCorrect = r.data.topicTags.includes('AI') && r.data.topicTags.includes('哲学');
  addResult('E2E-502', '用户A话题标签一致性', tagsCorrect, '用户A话题标签应包含AI和哲学');

  // 5.3 验证好友关系双向一致
  r = await invokeApi('GET', '/users/me/friends', null, headersA);
  const aFriends = r.data.total;
  r = await invokeApi('GET', '/users/me/friends', null, headersB);
  const bFriends = r.data.total;
  addResult('E2E-503', '好友关系双向一致', aFriends === bFriends, `用户A有${aFriends}个好友，用户B有${bFriends}个好友，应一致`);

  // 5.4 验证圈子成员双向可见
  r = await invokeApi('GET', '/circles/me/mine', null, headersA);
  const aInCircle = r.data.circles.some(c => c.id === circleId);
  r = await invokeApi('GET', '/circles/me/mine', null, headersB);
  const bInCircle = r.data.circles.some(c => c.id === circleId);
  addResult('E2E-504', '圈子成员双向可见', aInCircle && bInCircle, '双方都应能看到自己加入的圈子');

  console.log('');
  console.log('========================================');
  console.log('双用户交互模拟测试结果');
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
  fs.writeFileSync('C:/DouBaoXO/OneOS-V1/real-test/e2e-test-results.json', JSON.stringify(results, null, 2));
  console.log('\nDetailed results saved to: real-test/e2e-test-results.json');

  return { passCount, failCount, results };
}

runTests().catch(console.error);
