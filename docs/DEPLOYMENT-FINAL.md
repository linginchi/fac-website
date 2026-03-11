# FAC Platform V5.1 - 最终部署指南

## 架构概览

```
┌─────────────────────────────────────────────────────────┐
│                     用户访问层                            │
│              https://www.hkfac.com                       │
│                    (GitHub Pages)                        │
└─────────────────────────────────────────────────────────┘
                           │
                           │ API 请求
                           ▼
┌─────────────────────────────────────────────────────────┐
│                     API 服务层                           │
│       api-fac-platform.xxx.workers.dev                  │
│                 (Cloudflare Workers)                     │
└─────────────────────────────────────────────────────────┘
                           │
           ┌───────────────┼───────────────┐
           ▼               ▼               ▼
┌───────────────┐ ┌───────────────┐ ┌───────────────┐
│  D1 Database  │ │   KV Cache    │ │  Workers KV   │
│  (SQLite)     │ │  (Session)    │ │   (Cache)     │
└───────────────┘ └───────────────┘ └───────────────┘
```

---

## 当前状态分析

### 已部署 ✅
- **前端**: GitHub Pages (https://www.hkfac.com)
- **域名**: www.hkfac.com 已配置
- **仓库**: linginchi/fac-website

### 需要部署 ⏳
- **后端 API**: Cloudflare Workers
- **数据库**: Cloudflare D1
- **缓存**: Cloudflare KV

---

## V5.1 升级步骤

### 第一步：本地准备

```powershell
# 1. 安装依赖
npm install

# 2. 安装 Wrangler
npm install -g wrangler

# 3. 登录 Cloudflare
wrangler login
```

### 第二步：创建 Cloudflare 基础设施

```powershell
# 1. 创建 D1 数据库
wrangler d1 create fac-platform-db-prod
# 记录输出的 database_id

# 2. 创建 KV Namespace  
wrangler kv namespace create "CACHE"
# 记录输出的 id

# 3. 更新 wrangler.toml
# 用记事本打开 wrangler.toml
# 替换 database_id 和 id 为上面获取的值
```

### 第三步：执行数据库迁移

```powershell
# 本地测试迁移
wrangler d1 migrations apply fac-platform-db-prod --local

# 生产环境迁移
wrangler d1 migrations apply fac-platform-db-prod
```

### 第四步：部署 Workers

```powershell
# 部署 API
wrangler deploy

# 部署后会显示 Workers 域名，例如：
# https://api-fac-platform.xxx.workers.dev
```

### 第五步：配置 GitHub Repository

1. **添加 GitHub Secrets**
   
   访问: https://github.com/linginchi/fac-website/settings/secrets/actions
   
   添加：
   - `CLOUDFLARE_API_TOKEN` - Cloudflare API Token
   - `CLOUDFLARE_ACCOUNT_ID` - `wrangler whoami` 的输出

2. **添加 GitHub Variable (可选)**
   
   访问: https://github.com/linginchi/fac-website/settings/variables/actions
   
   添加：
   - `VITE_API_BASE` - Workers 域名，例如 `https://api-fac-platform.xxx.workers.dev`
   
   > 如果不设置，默认使用 `/api` (同域部署)

### 第六步：推送代码触发部署

```powershell
git add .
git commit -m "V5.1: Add Cloudflare Workers API and D1 database"
git push origin main
```

GitHub Actions 将自动：
1. 构建前端 → 部署到 GitHub Pages
2. 部署 Workers → Cloudflare
3. 执行数据库迁移

---

## 验证部署

### 1. 检查前端
访问: https://www.hkfac.com
- [ ] 页面正常加载
- [ ] 显示 V5.1-ALPHA 版本标记
- [ ] OmniBox 显示 Party A/B 选项

### 2. 检查 API
```bash
# 替换为你的 Workers 域名
curl https://api-fac-platform.xxx.workers.dev/api/health

# 预期输出:
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
```powershell
wrangler d1 execute fac-platform-db-prod --command="SELECT name FROM sqlite_master WHERE type='table'"

# 预期输出: users, skill_tags, tasks, privacy_authorizations, transactions, contact_info
```

---

## 配置自定义 API 域名 (可选)

如果你想让 API 使用 `api.hkfac.com`：

1. Cloudflare Dashboard → Workers & Pages
2. 找到你的 Worker
3. Settings → Triggers → Custom Domains
4. Add Custom Domain: `api.hkfac.com`
5. 确保 DNS 中有记录指向 Workers

然后更新 GitHub Variable:
- `VITE_API_BASE` = `https://api.hkfac.com`

---

## 故障排查

### GitHub Actions 失败
- 检查 Secrets 是否正确设置
- 检查 Cloudflare API Token 权限

### Workers 部署失败
```powershell
wrangler deploy --dry-run  # 检查配置
wrangler tail              # 查看日志
```

### 前端无法调用 API
- 检查 CORS 设置 (Workers 中已配置允许所有来源)
- 检查 `VITE_API_BASE` 是否正确设置
- 浏览器开发者工具 → Network 查看请求

### 数据库连接失败
```powershell
# 检查数据库 ID
wrangler d1 list

# 重新执行迁移
wrangler d1 migrations apply fac-platform-db-prod
```

---

## 文件变更总结

### 新增/修改的文件

```
.github/workflows/deploy.yml          # 更新 - GitHub Pages + Workers 部署
functions/api/[[path]].ts              # 新增 - Workers 路由入口
functions/api/users.ts                 # 新增 - Users API
functions/api/tasks.ts                 # 新增 - Tasks API (Smart Escrow)
functions/api/privacy.ts               # 新增 - Privacy API
migrations/0001_initial.sql           # 新增 - D1 数据库迁移
wrangler.toml                          # 更新 - Cloudflare 配置
docs/DEPLOYMENT-FINAL.md              # 新增 - 本文档
```

### 类型定义更新

```
src/types/identity.ts                  # 更新 - Party A/B 身份系统
src/types/user.ts                      # 更新 - Skill Matrix + Smart Escrow
```

### 组件更新

```
src/contexts/IdentityContext.tsx       # 更新 - P0 Logo 导航修复
src/components/OmniBox.tsx             # 更新 - Party A/B 术语
src/sections/Navbar.tsx                # 更新 - V5.1-ALPHA 标记
src/sections/AdminPanelV51.tsx         # 新增 - 重构管理后台
src/pages/DashboardPage.tsx            # 更新 - 甲乙双方控制台
src/hooks/useApi.ts                    # 新增 - API hooks
```

---

## 部署后检查清单

- [ ] Cloudflare D1 数据库已创建
- [ ] Cloudflare KV Namespace 已创建
- [ ] Cloudflare Workers 已部署
- [ ] 数据库迁移已执行
- [ ] GitHub Secrets 已配置
- [ ] 前端部署成功 (GitHub Actions 绿色)
- [ ] Workers 部署成功
- [ ] API 健康检查通过
- [ ] 网站正常访问
- [ ] V5.1-ALPHA 标记显示

---

## 联系方式

- 技术负责人: mark@hkfac.com
- Cloudflare 文档: https://developers.cloudflare.com

---

**版本**: V5.1-ALPHA  
**部署时间**: 约 10-15 分钟  
**更新日期**: 2025-03-11
