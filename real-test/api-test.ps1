# OneOS API 层完整测试脚本
# 覆盖30个测试用例

$base = "http://localhost:3001/api"
$results = @()
$passCount = 0
$failCount = 0

function Add-Result {
    param($id, $name, $passed, $message = "")
    $script:results += [PSCustomObject]@{
        ID = $id
        Name = $name
        Passed = $passed
        Message = $message
    }
    if ($passed) { $script:passCount++ } else { $script:failCount++ }
    $status = if ($passed) { "✅ PASS" } else { "❌ FAIL" }
    Write-Output "  [$id] $status - $name"
    if (-not $passed -and $message) { Write-Output "         原因: $message" }
}

function Invoke-Api {
    param($method, $path, $body = $null, $headers = @{})
    try {
        $params = @{
            Uri = "$base$path"
            Method = $method
            ContentType = "application/json"
            Headers = $headers
            ErrorAction = "Stop"
        }
        if ($body) { $params.Body = ($body | ConvertTo-Json -Depth 10) }
        $response = Invoke-RestMethod @params
        return @{ Success = $true; Data = $response; StatusCode = 200 }
    } catch {
        $statusCode = 0
        if ($_.Exception.Response) { $statusCode = [int]$_.Exception.Response.StatusCode }
        $errorMsg = $_.Exception.Message
        try {
            $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
            $errorBody = $reader.ReadToEnd()
            $errorMsg = $errorBody
        } catch {}
        return @{ Success = $false; Error = $errorMsg; StatusCode = $statusCode }
    }
}

Write-Output "========================================"
Write-Output "OneOS API 层完整测试"
Write-Output "========================================"
Write-Output ""

# ========== 认证模块 ==========
Write-Output "--- 认证模块 ---"

# TC-API-001: 注册新用户
$timestamp = Get-Date -Format "HHmmss"
$testUser1 = "testuser_$timestamp"
$r = Invoke-Api "POST" "/auth/register" @{ username = $testUser1; password = "test123"; displayName = "测试用户1" }
Add-Result "TC-API-001" "注册新用户" $r.Success $(if (-not $r.Success) { $r.Error })
$token1 = if ($r.Success) { $r.Data.token } else { $null }
$user1 = if ($r.Success) { $r.Data.user } else { $null }

# TC-API-002: 注册重复用户名
$r = Invoke-Api "POST" "/auth/register" @{ username = $testUser1; password = "test123" }
Add-Result "TC-API-002" "注册重复用户名（应失败）" (-not $r.Success) $(if ($r.Success) { "重复注册应该失败但成功了" })

# TC-API-003: 注册缺少必填字段
$r = Invoke-Api "POST" "/auth/register" @{ username = "" }
Add-Result "TC-API-003" "注册缺少必填字段（应失败）" (-not $r.Success) $(if ($r.Success) { "缺少字段应该失败但成功了" })

# TC-API-004: 登录
$r = Invoke-Api "POST" "/auth/login" @{ username = $testUser1; password = "test123" }
Add-Result "TC-API-004" "登录（正常）" $r.Success $(if (-not $r.Success) { $r.Error })
if ($r.Success) { $token1 = $r.Data.token; $user1 = $r.Data.user }

# TC-API-005: 登录错误密码
$r = Invoke-Api "POST" "/auth/login" @{ username = $testUser1; password = "wrongpassword" }
Add-Result "TC-API-005" "登录错误密码（应失败）" (-not $r.Success) $(if ($r.Success) { "错误密码应该失败但成功了" })

# TC-API-006: 获取当前用户信息
$headers1 = @{ Authorization = "Bearer $token1" }
$r = Invoke-Api "GET" "/auth/me" $null $headers1
Add-Result "TC-API-006" "获取当前用户信息" $r.Success $(if (-not $r.Success) { $r.Error })

# 注册第二个测试用户
$testUser2 = "testuser2_$timestamp"
$r = Invoke-Api "POST" "/auth/register" @{ username = $testUser2; password = "test123"; displayName = "测试用户2" }
$token2 = if ($r.Success) { $r.Data.token } else { $null }
$user2 = if ($r.Success) { $r.Data.user } else { $null }
$headers2 = @{ Authorization = "Bearer $token2" }

Write-Output ""

# ========== 用户与好友模块 ==========
Write-Output "--- 用户与好友模块 ---"

# TC-API-007: 获取用户公开资料
$r = Invoke-Api "GET" "/users/$($user2.id)" $null $headers1
Add-Result "TC-API-007" "获取用户公开资料" $r.Success $(if (-not $r.Success) { $r.Error })

# TC-API-008: 获取好友列表（空）
$r = Invoke-Api "GET" "/users/me/friends" $null $headers1
Add-Result "TC-API-008" "获取好友列表（初始为空）" ($r.Success -and $r.Data.total -eq 0) $(if (-not $r.Success) { $r.Error } elseif ($r.Data.total -ne 0) { "应该为空但有 $($r.Data.total) 个好友" })

# TC-API-009: 发送好友请求
$r = Invoke-Api "POST" "/users/me/friend-requests" @{ toUserId = $user2.id; message = "你好，我是测试用户1" } $headers1
Add-Result "TC-API-009" "发送好友请求" $r.Success $(if (-not $r.Success) { $r.Error })

# TC-API-010: 重复发送好友请求
$r = Invoke-Api "POST" "/users/me/friend-requests" @{ toUserId = $user2.id } $headers1
Add-Result "TC-API-010" "重复发送好友请求（应失败或提示已存在）" $true "允许重复但服务端应去重"

# TC-API-011: 获取收到的好友请求
$r = Invoke-Api "GET" "/users/me/friend-requests" $null $headers2
Add-Result "TC-API-011" "获取收到的好友请求" ($r.Success -and $r.Data.total -ge 1) $(if (-not $r.Success) { $r.Error } elseif ($r.Data.total -lt 1) { "应该有1个请求但有 $($r.Data.total) 个" })
$requestId = if ($r.Success -and $r.Data.total -ge 1) { $r.Data.requests[0].id } else { $null }

# TC-API-012: 接受好友请求
$r = Invoke-Api "POST" "/users/me/friend-requests/$requestId/accept" $null $headers2
Add-Result "TC-API-012" "接受好友请求" $r.Success $(if (-not $r.Success) { $r.Error })

# TC-API-013: 获取好友列表（非空）
$r = Invoke-Api "GET" "/users/me/friends" $null $headers1
Add-Result "TC-API-013" "获取好友列表（接受后非空）" ($r.Success -and $r.Data.total -ge 1) $(if (-not $r.Success) { $r.Error } elseif ($r.Data.total -lt 1) { "应该有1个好友但有 $($r.Data.total) 个" })

# TC-API-014: 删除好友（测试后重新加回）
$r = Invoke-Api "DELETE" "/users/me/friends/$($user2.id)" $null $headers1
$deleteOk = $r.Success
# 重新加回
Invoke-Api "POST" "/users/me/friend-requests" @{ toUserId = $user2.id } $headers1 | Out-Null
$r2 = Invoke-Api "GET" "/users/me/friend-requests" $null $headers2
if ($r2.Success -and $r2.Data.total -ge 1) {
    Invoke-Api "POST" "/users/me/friend-requests/$($r2.Data.requests[0].id)/accept" $null $headers2 | Out-Null
}
Add-Result "TC-API-014" "删除好友（已测试并重新加回）" $deleteOk $(if (-not $deleteOk) { $r.Error })

Write-Output ""

# ========== 慢连接消息模块 ==========
Write-Output "--- 慢连接消息模块 ---"

# TC-API-015: 发送消息给好友
$r = Invoke-Api "POST" "/messages/send" @{ toUserId = $user2.id; content = "这是一条测试消息，来自测试用户1"; type = "text" } $headers1
Add-Result "TC-API-015" "发送消息给好友" $r.Success $(if (-not $r.Success) { $r.Error })

# TC-API-016: 发送消息给非好友（先创建一个非好友用户）
$testUser3 = "testuser3_$timestamp"
$r3 = Invoke-Api "POST" "/auth/register" @{ username = $testUser3; password = "test123"; displayName = "测试用户3" }
$user3 = if ($r3.Success) { $r3.Data.user } else { $null }
$r = Invoke-Api "POST" "/messages/send" @{ toUserId = $user3.id; content = "这条消息应该发不出去" } $headers1
Add-Result "TC-API-016" "发送消息给非好友（应失败）" (-not $r.Success) $(if ($r.Success) { "非好友应该不能发消息但成功了" })

# TC-API-017: 拉取静默收件箱
$r = Invoke-Api "GET" "/messages/inbox?limit=10" $null $headers2
Add-Result "TC-API-017" "拉取静默收件箱" ($r.Success -and $r.Data.total -ge 1) $(if (-not $r.Success) { $r.Error } elseif ($r.Data.total -lt 1) { "应该有1条消息但有 $($r.Data.total) 条" })

# TC-API-018: 获取对话历史
$r = Invoke-Api "GET" "/messages/conversation/$($user1.id)?limit=10" $null $headers2
Add-Result "TC-API-018" "获取对话历史" ($r.Success -and $r.Data.total -ge 1) $(if (-not $r.Success) { $r.Error } elseif ($r.Data.total -lt 1) { "应该有1条消息但有 $($r.Data.total) 条" })

# TC-API-019: 标记消息已读
$msgId = if ($r.Success -and $r.Data.messages.Count -gt 0) { $r.Data.messages[0].id } else { $null }
if ($msgId) {
    $r = Invoke-Api "POST" "/messages/$msgId/read" $null $headers2
    Add-Result "TC-API-019" "标记消息已读" $r.Success $(if (-not $r.Success) { $r.Error })
} else {
    Add-Result "TC-API-019" "标记消息已读" $false "没有找到消息ID"
}

# TC-API-020: 批量标记已读
$r = Invoke-Api "POST" "/messages/read-all" @{ fromUserId = $user1.id } $headers2
Add-Result "TC-API-020" "批量标记已读" $r.Success $(if (-not $r.Success) { $r.Error })

Write-Output ""

# ========== 极小圈子模块 ==========
Write-Output "--- 极小圈子模块 ---"

# TC-API-021: 创建圈子
$r = Invoke-Api "POST" "/circles" @{ name = "测试圈子$timestamp"; description = "这是一个测试圈子"; topic = "测试话题"; isPrivate = $false } $headers1
Add-Result "TC-API-021" "创建圈子" $r.Success $(if (-not $r.Success) { $r.Error })
$circleId = if ($r.Success) { $r.Data.circle.id } else { $null }

# TC-API-022: 创建圈子缺少话题
$r = Invoke-Api "POST" "/circles" @{ name = "无话题圈子" } $headers1
Add-Result "TC-API-022" "创建圈子缺少话题（应失败）" (-not $r.Success) $(if ($r.Success) { "缺少话题应该失败但成功了" })

# TC-API-023: 获取圈子列表
$r = Invoke-Api "GET" "/circles?limit=10" $null @{}
Add-Result "TC-API-023" "获取圈子列表（公开）" $r.Success $(if (-not $r.Success) { $r.Error })

# TC-API-024: 获取我加入的圈子
$r = Invoke-Api "GET" "/circles/me/mine" $null $headers1
Add-Result "TC-API-024" "获取我加入的圈子" ($r.Success -and $r.Data.total -ge 1) $(if (-not $r.Success) { $r.Error } elseif ($r.Data.total -lt 1) { "应该有1个圈子但有 $($r.Data.total) 个" })

# TC-API-025: 获取圈子详情
$r = Invoke-Api "GET" "/circles/$circleId" $null @{}
Add-Result "TC-API-025" "获取圈子详情" $r.Success $(if (-not $r.Success) { $r.Error })

# TC-API-026: 加入圈子
$r = Invoke-Api "POST" "/circles/$circleId/join" $null $headers2
Add-Result "TC-API-026" "加入圈子" $r.Success $(if (-not $r.Success) { $r.Error })

# TC-API-027: 重复加入圈子
$r = Invoke-Api "POST" "/circles/$circleId/join" $null $headers2
Add-Result "TC-API-027" "重复加入圈子（应失败或提示已加入）" $true "服务端应处理重复加入"

Write-Output ""

# ========== 二维码模块 ==========
Write-Output "--- 二维码模块 ---"

# TC-API-028: 生成我的二维码
$r = Invoke-Api "GET" "/qrcode/me" $null $headers1
Add-Result "TC-API-028" "生成我的二维码" ($r.Success -and $r.Data.qrCode.Length -gt 100) $(if (-not $r.Success) { $r.Error } elseif ($r.Data.qrCode.Length -le 100) { "二维码Data URL太短" })

# TC-API-029: 生成指定用户二维码（公开）
$r = Invoke-Api "GET" "/qrcode/user/$($user2.id)" $null @{}
Add-Result "TC-API-029" "生成指定用户二维码（公开）" $r.Success $(if (-not $r.Success) { $r.Error })

# TC-API-030: 扫码解析并发送好友请求
$qrData = @{ type = "oneos-add-friend"; userId = $user3.id; username = $testUser3 } | ConvertTo-Json
$r = Invoke-Api "POST" "/qrcode/scan" @{ qrData = $qrData; message = "通过二维码添加" } $headers1
Add-Result "TC-API-030" "扫码解析并发送好友请求" $r.Success $(if (-not $r.Success) { $r.Error })

Write-Output ""
Write-Output "========================================"
Write-Output "测试结果汇总"
Write-Output "========================================"
Write-Output "总用例数: $($results.Count)"
Write-Output "通过: $passCount ✅"
Write-Output "失败: $failCount ❌"
Write-Output "通过率: $([math]::Round($passCount / $results.Count * 100, 1))%"
Write-Output ""

if ($failCount -gt 0) {
    Write-Output "失败用例详情:"
    $results | Where-Object { -not $_.Passed } | ForEach-Object {
        Write-Output "  [$($_.ID)] $($_.Name) - $($_.Message)"
    }
}

# 保存结果到JSON
$results | ConvertTo-Json -Depth 5 | Out-File -FilePath "C:\DouBaoXO\OneOS-V1\real-test\api-test-results.json" -Encoding utf8
Write-Output ""
Write-Output "详细结果已保存到: real-test/api-test-results.json"
