# FAC Platform V5.1 - 快速开始 (Quick Start)

## 🚀 选择你的部署方式

### 💻 Windows 用户

```powershell
# 1. 安装 Wrangler
npm install -g wrangler

# 2. 登录 Cloudflare
wrangler login

# 3. 运行 Windows 脚本
cd "C:\Users\Mark Lin\Desktop\FAC-Platform"
.\scripts\setup-cloudflare.ps1

# 4. 按提示配置 GitHub Secrets，然后推送代码
git push origin main
```

详细说明: [README-DEPLOY-WINDOWS.md](./README-DEPLOY-WINDOWS.md)

---

### 🍎 macOS / Linux 用户

```bash
# 1. 安装 Wrangler
npm install -g wrangler

# 2. 登录 Cloudflare
wrangler login

# 3. 运行脚本
cd ~/FAC-Platform
chmod +x scripts/setup-cloudflare.sh
./scripts/setup-cloudflare.sh

# 4. 按提示配置 GitHub Secrets，然后推送代码
git push origin main
```

详细说明: [README-DEPLOY.md](./README-DEPLOY.md)

---

### 🐳 手动部署 (如果脚本不可用)

```bash
# 1. 创建基础设施
wrangler d1 create fac-platform-db-prod
wrangler kv namespace create "CACHE"
wrangler pages project create fac-platform

# 2. 更新 wrangler.toml (替换 database_id 和 kv id)
# 编辑 wrangler.toml 文件

# 3. 执行数据库迁移
wrangler d1 migrations apply fac-platform-db-prod --local

# 4. 部署
npm run build
wrangler deploy
wrangler pages deploy dist --project-name=fac-platform
```

---

## ⚙️ 必需配置

无论使用哪种方式，都需要在 GitHub 设置以下 Secrets：

| Secret Name | 获取方式 |
|------------|---------|
| `CLOUDFLARE_API_TOKEN` | Cloudflare Dashboard → My Profile → API Tokens → Create Token |
| `CLOUDFLARE_ACCOUNT_ID` | `wrangler whoami` |

**API Token 需要的权限**：
- ☑️ Cloudflare Pages:Edit
- ☑️ Cloudflare Workers Scripts:Edit
- ☑️ D1:Edit
- ☑️ KV:Edit
- ☑️ Account:Read

---

## ✅ 部署验证清单

部署完成后，请检查：

- [ ] 网站首页 `https://fac-platform.pages.dev` 正常访问
- [ ] V5.1-ALPHA 版本标记显示在页面顶部
- [ ] API 健康检查 `https://fac-platform.pages.dev/api/health` 返回 200
- [ ] Logo 点击能重置身份并返回首页
- [ ] OmniBox 搜索框能识别 Party A/B 身份

---

## 🆘 遇到问题？

| 问题 | 解决方案 |
|------|---------|
| PowerShell 禁止执行脚本 | `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser` |
| Wrangler 未安装 | `npm install -g wrangler` |
| 登录失败 | `wrangler logout && wrangler login` |
| 数据库迁移失败 | `wrangler d1 migrations apply fac-platform-db-prod --local` |
| GitHub Actions 失败 | 检查 Secrets 是否正确设置 |

---

## 📚 详细文档

- [完整部署指南](./DEPLOYMENT.md) - 包含架构说明、回滚策略等
- [Windows 部署指南](./README-DEPLOY-WINDOWS.md) - Windows 专用说明
- [部署检查清单](./DEPLOYMENT-CHECKLIST.md) - 部署前后检查项
- [V5.1 更新日志](./V5.1-CHANGELOG.md) - 技术变更说明

---

## 🎯 部署后访问地址

| 环境 | 地址 |
|------|------|
| 前端页面 | `https://fac-platform.pages.dev` |
| API 端点 | `https://fac-platform.pages.dev/api` |
| 健康检查 | `https://fac-platform.pages.dev/api/health` |

---

**版本**: V5.1-ALPHA  
**部署时间**: 约 5-10 分钟
