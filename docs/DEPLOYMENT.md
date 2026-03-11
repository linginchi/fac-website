# FAC Platform V5.1 - 部署指南

## 部署架构概览

```
GitHub (linginchi/fac-website)
    │
    │ push to main
    ▼
GitHub Actions
    │
    ├── Build (Vite + TypeScript)
    │
    ├── Deploy to Cloudflare Pages
    │   └── dist/ → https://fac-platform.pages.dev
    │
    └── Deploy Workers + D1
        └── functions/api/* → Edge Functions

Cloudflare Infrastructure:
├── Pages (前端静态托管)
├── Workers (API 边缘函数)
├── D1 (SQLite 数据库)
└── KV (缓存/会话)
```

---

## 前置要求

### 1. 安装工具

```bash
# Node.js 20+
npm install -g wrangler

# 登录 Cloudflare
wrangler login
```

### 2. 获取 Cloudflare 账号信息

```bash
# 查看账号 ID
wrangler whoami

# 创建 API Token (需要以下权限):
# - Cloudflare Pages:Edit
# - Cloudflare Workers Scripts:Edit
# - D1:Edit
# - Account:Read
```

---

## 第一步：创建 Cloudflare D1 数据库

```bash
# 创建生产数据库
wrangler d1 create fac-platform-db-prod

# 输出示例：
# ✅ Successfully created DB 'fac-platform-db-prod'
# {
#   "uuid": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
#   "name": "fac-platform-db-prod"
# }

# 执行初始迁移
wrangler d1 migrations apply fac-platform-db-prod --local
wrangler d1 migrations apply fac-platform-db-prod

# 创建开发数据库 (可选)
wrangler d1 create fac-platform-db-dev
```

### 更新 wrangler.toml

将生成的数据库 ID 填入 `wrangler.toml`：

```toml
[[d1_databases]]
binding = "DB"
database_name = "fac-platform-db-prod"
database_id = "your-actual-database-uuid-here"
```

---

## 第二步：创建 KV Namespace

```bash
# 创建 KV 命名空间
wrangler kv namespace create "CACHE"

# 输出示例：
# ✅ Success!
# Add the following to your wrangler.toml:
# [[kv_namespaces]]
# binding = "CACHE"
# id = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
```

### 更新 wrangler.toml

```toml
[[kv_namespaces]]
binding = "CACHE"
id = "your-kv-namespace-id-here"
```

---

## 第三步：配置 GitHub Secrets

在 GitHub 仓库 `linginchi/fac-website` 中设置以下 Secrets：

### 必需的 Secrets

| Secret Name | 说明 | 获取方式 |
|------------|------|---------|
| `CLOUDFLARE_API_TOKEN` | Cloudflare API Token | Cloudflare Dashboard → My Profile → API Tokens |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare 账号 ID | `wrangler whoami` |

### 可选的 Variables

在 GitHub Settings → Security → Variables and secrets → Actions → Variables 中设置：

| Variable Name | 默认值 | 说明 |
|--------------|--------|------|
| `VITE_API_BASE` | `/api` | API 基础路径 |

---

## 第四步：创建 Cloudflare Pages 项目

### 方式一：通过 Dashboard 创建

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com)
2. 进入 Pages → Create a project
3. 选择 "Connect to Git"
4. 授权 GitHub 账号，选择 `linginchi/fac-website` 仓库
5. 构建设置：
   - Build command: `npm run build`
   - Build output directory: `dist`
6. 添加环境变量：
   - `NODE_VERSION`: `20`

### 方式二：通过 Wrangler CLI

```bash
# 创建 Pages 项目
wrangler pages project create fac-platform

# 配置自定义域名 (可选)
wrangler pages domain add fac-platform hkfac.com
```

---

## 第五步：本地测试

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 本地构建测试
npm run build

# 本地 Workers 测试
wrangler pages dev --d1=DB --kv=CACHE

# 或者使用 miniflare 模拟完整环境
npx wrangler dev --local
```

---

## 第六步：部署

### 自动部署 (推荐)

推送到 main 分支即可触发自动部署：

```bash
git add .
git commit -m "V5.1 deployment ready"
git push origin main
```

GitHub Actions 将自动：
1. 构建前端
2. 部署到 Cloudflare Pages
3. 部署 Workers 和 D1

### 手动部署

```bash
# 构建
npm run build

# 部署 Workers
wrangler deploy

# 部署 Pages (直接上传)
wrangler pages deploy dist --project-name=fac-platform
```

---

## 验证部署

### 1. 检查前端

访问 `https://fac-platform.pages.dev`，确认：
- ✅ 页面正常加载
- ✅ V5.1-ALPHA 版本标记显示
- ✅ 导航功能正常

### 2. 检查 API

```bash
# 健康检查
curl https://fac-platform.pages.dev/api/health

# 预期响应：
{
  "success": true,
  "data": {
    "status": "ok",
    "version": "V5.1-ALPHA",
    "name": "港匠匯 FAC"
  }
}
```

### 3. 检查数据库

```bash
# 查询用户表
wrangler d1 execute fac-platform-db-prod --command="SELECT COUNT(*) as total FROM users"
```

---

## 域名配置

### 自定义域名

1. Cloudflare Dashboard → Pages → fac-platform → Custom domains
2. Add custom domain: `www.hkfac.com`
3. 在 DNS 中添加 CNAME 记录：
   - Name: `www`
   - Target: `fac-platform.pages.dev`

### 根域名重定向

添加 Page Rule：
- URL: `hkfac.com/*`
- Forwarding URL: `https://www.hkfac.com/$1`

---

## 环境变量管理

### 开发环境

```bash
# .env.development
VITE_API_BASE=http://localhost:8788/api
```

### 生产环境

```bash
# 通过 wrangler secret 设置敏感信息
wrangler secret put JWT_SECRET
wrangler secret put STRIPE_API_KEY

# 通过 wrangler.toml [vars] 设置非敏感变量
```

---

## 常见问题

### Q1: D1 数据库连接失败

```bash
# 检查数据库 ID 是否正确
wrangler d1 list

# 重新执行迁移
wrangler d1 migrations apply fac-platform-db-prod
```

### Q2: Workers 部署失败

```bash
# 检查语法错误
wrangler deploy --dry-run

# 查看日志
wrangler tail
```

### Q3: GitHub Actions 部署失败

检查：
1. Secrets 是否正确设置
2. API Token 权限是否足够
3. 账号 ID 是否正确

### Q4: 前端 API 请求 404

确认 `wrangler.toml` 中：
```toml
[[routes]]
pattern = "/api/*"
```

---

## 回滚策略

### 前端回滚

Cloudflare Pages 保留最近 20 个部署版本：
- Dashboard → Pages → fac-platform → Deployments
- 选择旧版本 → Rollback

### 数据库回滚

```bash
# 创建备份
wrangler d1 export fac-platform-db-prod --output=backup.sql

# 恢复 (谨慎操作)
wrangler d1 execute fac-platform-db-prod --file=backup.sql
```

---

## 监控与日志

### 查看 Workers 日志

```bash
wrangler tail
```

### 查看 D1 查询日志

```bash
wrangler d1 insights fac-platform-db-prod
```

### 设置告警

Cloudflare Dashboard → Notifications → Add

---

## 安全建议

1. **API Token 权限最小化**：只授予必需的权限
2. **定期轮换 Secrets**：每 90 天更换一次
3. **启用 2FA**：Cloudflare 和 GitHub 都启用双重验证
4. **SQL 注入防护**：使用参数化查询（已实现）
5. **CORS 限制**：生产环境限制 `Access-Control-Allow-Origin`

---

## 联系方式

部署问题请联系：
- 技术负责人：mark@hkfac.com
- Cloudflare 支持：https://support.cloudflare.com

---

**文档版本**: V5.1-ALPHA  
**更新日期**: 2025-03-11
