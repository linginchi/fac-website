# FAC Platform V5.1 - Quick Start

## 架构
- **Frontend**: GitHub Pages (https://www.hkfac.com) ✅ 已部署
- **Backend API**: Cloudflare Workers + D1 ⏳ 需要部署

## 三步完成 V5.1 升级

### Step 1: 创建 Cloudflare 基础设施

```powershell
# 安装 Wrangler
npm install -g wrangler

# 登录
wrangler login

# 创建数据库
wrangler d1 create fac-platform-db-prod

# 创建 KV
wrangler kv namespace create "CACHE"

# 记录输出的 ID，更新 wrangler.toml 文件
```

### Step 2: 部署

```powershell
# 执行数据库迁移
wrangler d1 migrations apply fac-platform-db-prod

# 部署 Workers
wrangler deploy
```

### Step 3: 配置 GitHub

1. 访问: https://github.com/linginchi/fac-website/settings/secrets/actions
2. 添加 Secrets:
   - `CLOUDFLARE_API_TOKEN`
   - `CLOUDFLARE_ACCOUNT_ID`

3. 推送代码:
```powershell
git add .
git commit -m "V5.1 deployment"
git push origin main
```

## 验证

访问 https://www.hkfac.com，检查：
- V5.1-ALPHA 版本标记
- API 健康检查: `https://your-workers-domain/api/health`

## 详细文档

- [完整部署指南](docs/DEPLOYMENT-FINAL.md)
- [Windows 部署指南](docs/DEPLOY-MANUAL.md)
- [V5.1 更新日志](docs/V5.1-CHANGELOG.md)
