# FAC Platform V5.1 - 快速部署指南

## 🚀 五分钟快速部署

### 环境信息
- **GitHub 仓库**: `linginchi/fac-website`
- **Cloudflare 账号**: `mark@hkfac.com`
- **Cloudflare 项目**: `fac-platform`

---

## 方式一：全自动部署 (推荐)

### 第一步：一键设置 Cloudflare 基础设施

```bash
# 在本地项目目录执行
chmod +x scripts/setup-cloudflare.sh
./scripts/setup-cloudflare.sh
```

此脚本会自动：
- ✅ 创建 D1 数据库 (生产 + 开发)
- ✅ 创建 KV Namespace
- ✅ 创建 Pages 项目
- ✅ 执行数据库迁移
- ✅ 更新 wrangler.toml

### 第二步：配置 GitHub Secrets

在 GitHub 仓库页面：
1. Settings → Secrets and variables → Actions
2. 添加以下 Secrets：

| Secret Name | Value | 获取方式 |
|------------|-------|---------|
| `CLOUDFLARE_API_TOKEN` | `your-api-token` | [创建 Token](https://dash.cloudflare.com/profile/api-tokens) |
| `CLOUDFLARE_ACCOUNT_ID` | `your-account-id` | `wrangler whoami` |

**API Token 需要的权限**：
- Cloudflare Pages:Edit
- Cloudflare Workers Scripts:Edit
- D1:Edit
- Account:Read

### 第三步：推送代码触发部署

```bash
git add .
git commit -m "V5.1 production deployment"
git push origin main
```

GitHub Actions 会自动：
1. 构建前端 (`npm run build`)
2. 部署到 Cloudflare Pages
3. 部署 Workers 和 D1

### 第四步：验证部署

```bash
# 检查健康端点
curl https://fac-platform.pages.dev/api/health

# 预期输出
{
  "success": true,
  "data": {
    "status": "ok",
    "version": "V5.1-ALPHA",
    "name": "港匠匯 FAC"
  }
}
```

---

## 方式二：手动部署

如果你不想使用 GitHub Actions，可以手动部署：

```bash
# 1. 构建
npm run build

# 2. 部署 Workers (API)
wrangler deploy

# 3. 部署 Pages (前端)
wrangler pages deploy dist --project-name=fac-platform

# 4. 执行数据库迁移
wrangler d1 migrations apply fac-platform-db-prod
```

---

## 📁 部署文件说明

```
.
├── .github/workflows/deploy.yml    # GitHub Actions 自动部署配置
├── functions/api/[[path]].ts       # Workers 路由入口
├── functions/api/users.ts          # Users API
├── functions/api/tasks.ts          # Tasks API (Smart Escrow)
├── functions/api/privacy.ts        # Privacy API
├── migrations/0001_initial.sql     # D1 数据库迁移
├── wrangler.toml                   # Cloudflare 配置
├── scripts/setup-cloudflare.sh     # 一键设置脚本
└── docs/DEPLOYMENT.md              # 详细部署文档
```

---

## 🔧 常用命令

```bash
# 本地开发
npm run dev

# 本地预览构建结果
npm run build && npm run preview

# 本地 Workers 开发
wrangler pages dev --d1=DB --kv=CACHE

# 查看部署日志
wrangler tail

# 数据库查询
wrangler d1 execute fac-platform-db-prod --command="SELECT * FROM users"

# 数据库备份
wrangler d1 export fac-platform-db-prod --output=backup.sql
```

---

## 🌐 访问地址

部署完成后，可以通过以下地址访问：

| 环境 | 地址 |
|------|------|
| 生产环境 | `https://fac-platform.pages.dev` |
| API 端点 | `https://fac-platform.pages.dev/api` |
| 健康检查 | `https://fac-platform.pages.dev/api/health` |

---

## ⚠️ 注意事项

1. **数据库 ID**: 运行 `setup-cloudflare.sh` 后会自动更新 `wrangler.toml`，请勿手动修改
2. **首次部署**: 需要先运行设置脚本创建基础设施，才能推送代码
3. **域名绑定**: 如需绑定自定义域名，请在 Cloudflare Dashboard → Pages → Custom domains 中配置

---

## 🆘 故障排查

### 问题 1: GitHub Actions 部署失败

**解决**: 检查 Secrets 是否正确设置
```bash
# 本地测试 API Token 是否有效
wrangler whoami
```

### 问题 2: D1 数据库连接失败

**解决**: 检查数据库 ID 并重新执行迁移
```bash
wrangler d1 list
wrangler d1 migrations apply fac-platform-db-prod
```

### 问题 3: API 返回 404

**解决**: 确保 Workers 已部署
```bash
wrangler deploy
```

---

## 📞 支持

部署问题请联系：
- 邮箱: mark@hkfac.com
- Cloudflare 文档: https://developers.cloudflare.com

---

**版本**: V5.1-ALPHA  
**更新时间**: 2025-03-11
