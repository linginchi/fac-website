# FAC Platform V5.1 - Windows 部署指南

## 🪟 Windows 用户专用部署步骤

### 前置要求

1. **安装 Node.js 20+**
   - 下载: https://nodejs.org/
   - 安装时勾选 "Add to PATH"

2. **安装 Wrangler CLI**
   ```powershell
   npm install -g wrangler
   ```

3. **登录 Cloudflare**
   ```powershell
   wrangler login
   ```

---

## 部署步骤

### 方法一：使用 PowerShell 脚本 (推荐)

```powershell
# 1. 打开 PowerShell (管理员权限)
# 2. 进入项目目录
cd "C:\Users\Mark Lin\Desktop\FAC-Platform"

# 3. 运行设置脚本
.\scripts\setup-cloudflare.ps1
```

脚本会自动：
- ✅ 创建 D1 数据库
- ✅ 创建 KV Namespace
- ✅ 创建 Pages 项目
- ✅ 更新 wrangler.toml
- ✅ 输出配置信息

### 方法二：使用批处理脚本

```cmd
# 1. 打开 CMD
# 2. 进入项目目录
cd "C:\Users\Mark Lin\Desktop\FAC-Platform"

# 3. 运行批处理脚本
scripts\setup-cloudflare.bat
```

### 方法三：手动执行

如果脚本无法运行，可以手动执行：

```powershell
# Step 1: 创建 D1 数据库
wrangler d1 create fac-platform-db-prod

# Step 2: 创建 KV Namespace
wrangler kv namespace create "CACHE"

# Step 3: 创建 Pages 项目
wrangler pages project create fac-platform

# Step 4: 获取数据库 ID 并更新 wrangler.toml
wrangler d1 list
# 复制 fac-platform-db-prod 的 ID，替换到 wrangler.toml 中的 database_id

# Step 5: 获取 KV ID
wrangler kv namespace list
# 复制 CACHE 的 ID，替换到 wrangler.toml 中的 id

# Step 6: 执行数据库迁移
wrangler d1 migrations apply fac-platform-db-prod --local
```

---

## 配置 GitHub Secrets

在 PowerShell 中获取账号信息：

```powershell
# 获取 Account ID
wrangler whoami

# 输出示例:
# Account ID: xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

然后到 GitHub 设置 Secrets：

1. 打开 https://github.com/linginchi/fac-website/settings/secrets/actions
2. 添加以下 Secrets：

| Secret Name | Value |
|------------|-------|
| `CLOUDFLARE_API_TOKEN` | 从 https://dash.cloudflare.com/profile/api-tokens 创建 |
| `CLOUDFLARE_ACCOUNT_ID` | 上面获取的 Account ID |

**创建 API Token 步骤：**
1. 登录 Cloudflare Dashboard
2. 点击右上角头像 → My Profile
3. 左侧菜单 → API Tokens
4. 点击 "Create Token"
5. 选择 "Custom token"
6. 权限设置：
   - Zone:Read (如果需要自定义域名)
   - Account:Read
   - Cloudflare Pages:Edit
   - Workers Scripts:Edit
   - D1:Edit
   - KV:Edit

---

## 部署

### 自动部署 (推荐)

```powershell
# 提交并推送代码
git add .
git commit -m "V5.1 production deployment"
git push origin main
```

GitHub Actions 会自动部署。

### 手动部署

```powershell
# 构建
npm run build

# 部署 Workers (API)
wrangler deploy

# 部署 Pages (前端)
wrangler pages deploy dist --project-name=fac-platform
```

---

## 常见问题

### 问题 1: PowerShell 执行策略阻止

**错误**: `无法加载文件，因为在此系统上禁止运行脚本`

**解决**:
```powershell
# 以管理员身份运行 PowerShell，执行：
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# 输入 Y 确认
```

### 问题 2: Wrangler 登录失败

**解决**:
```powershell
# 清除登录状态重新登录
wrangler logout
wrangler login
```

### 问题 3: 数据库迁移失败

**解决**:
```powershell
# 强制重新执行迁移
wrangler d1 migrations apply fac-platform-db-prod --local
```

### 问题 4: 端口被占用

**解决**:
```powershell
# 开发服务器使用其他端口
npm run dev -- --port 3001
```

---

## 验证部署

```powershell
# 检查健康端点
Invoke-RestMethod -Uri "https://fac-platform.pages.dev/api/health"

# 预期输出:
# success data
# ------- ----
# True    @{status=ok; version=V5.1-ALPHA; name=港匠匯 FAC}
```

---

## 常用命令

```powershell
# 本地开发
npm run dev

# 本地预览构建
npm run build
npx serve dist

# 查看日志
wrangler tail

# 数据库查询
wrangler d1 execute fac-platform-db-prod --command="SELECT COUNT(*) as total FROM users"

# 备份数据库
wrangler d1 export fac-platform-db-prod --output=backup-$(Get-Date -Format 'yyyyMMdd').sql
```

---

**版本**: V5.1-ALPHA  
**更新日期**: 2025-03-11
