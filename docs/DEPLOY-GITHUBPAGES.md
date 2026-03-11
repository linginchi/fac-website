# FAC Platform V5.1 - GitHub Pages + Cloudflare Workers 混合部署

## 架构说明

```
GitHub: linginchi/fac-website
    │
    ├── GitHub Actions
    │   ├── Build Frontend (Vite) → GitHub Pages (https://www.hkfac.com)
    │   └── Deploy Workers → Cloudflare Workers (API)
    │
    └── Cloudflare
        ├── Workers (API: api-fac-platform.xxx.workers.dev)
        ├── D1 Database (fac-platform-db-prod)
        └── KV Namespace (CACHE)
```

## 当前状态

- ✅ **前端**: 已部署在 GitHub Pages (https://www.hkfac.com)
- ⏳ **后端 API**: 需要部署到 Cloudflare Workers
- ⏳ **数据库**: 需要创建 Cloudflare D1

---

## V5.1 升级步骤

### 第一步：创建 Cloudflare 基础设施

```powershell
# 登录 Cloudflare
wrangler login

# 1. 创建 D1 数据库
wrangler d1 create fac-platform-db-prod

# 2. 创建 KV Namespace
wrangler kv namespace create "CACHE"

# 3. 获取 ID 并更新 wrangler.toml
wrangler d1 list
wrangler kv namespace list
```

**更新 wrangler.toml**：
```toml
[[d1_databases]]
binding = "DB"
database_name = "fac-platform-db-prod"
database_id = "your-database-id-here"  # 替换

[[kv_namespaces]]
binding = "CACHE"
id = "your-kv-id-here"  # 替换
```

### 第二步：执行数据库迁移

```powershell
wrangler d1 migrations apply fac-platform-db-prod --local
wrangler d1 migrations apply fac-platform-db-prod
```

### 第三步：部署 Workers

```powershell
# 部署 API
wrangler deploy
```

Workers 将部署到类似 `api-fac-platform.xxx.workers.dev` 的地址。

### 第四步：配置前端 API 地址

有两个选择：

#### 方案 A：同域部署 (推荐)

如果你将 Workers 绑定到 `api.hkfac.com`：

编辑 `.github/workflows/deploy-v51.yml`：
```yaml
env:
  VITE_API_BASE: 'https://api.hkfac.com'
```

#### 方案 B：跨域部署 (当前方案)

使用 Workers 默认域名：

1. 部署 Workers 后，记录 Workers 域名
2. 更新 GitHub Actions 中的 `VITE_API_BASE`
3. 推送代码重新部署前端

### 第五步：配置 GitHub Secrets

访问：https://github.com/linginchi/fac-website/settings/secrets/actions

添加：
| Secret | Value |
|--------|-------|
| `CLOUDFLARE_API_TOKEN` | Cloudflare API Token |
| `CLOUDFLARE_ACCOUNT_ID` | `wrangler whoami` 输出 |

---

## 完整部署流程

### 首次部署 V5.1

```powershell
# 1. 创建基础设施
wrangler d1 create fac-platform-db-prod
wrangler kv namespace create "CACHE"

# 2. 更新 wrangler.toml (填入上面的 ID)
# 编辑 wrangler.toml

# 3. 执行迁移
wrangler d1 migrations apply fac-platform-db-prod

# 4. 部署 Workers
wrangler deploy

# 5. 记录 Workers 域名，更新 GitHub Actions
# 编辑 .github/workflows/deploy-v51.yml
# 修改 VITE_API_BASE

# 6. 提交并推送
git add .
git commit -m "V5.1: Add Cloudflare Workers API"
git push origin main
```

### 后续更新

```powershell
git push origin main
```

GitHub Actions 会自动：
1. 构建前端 → GitHub Pages
2. 部署 Workers → Cloudflare
3. 执行数据库迁移

---

## 验证部署

### 1. 检查前端
访问：https://www.hkfac.com
- 确认 V5.1-ALPHA 版本标记
- 确认 OmniBox 显示 Party A/B 选项

### 2. 检查 API
```bash
# 替换为你的 Workers 域名
curl https://api-fac-platform.xxx.workers.dev/api/health

# 预期输出
{
  "success": true,
  "data": {
    "status": "ok",
    "version": "V5.1-ALPHA"
  }
}
```

### 3. 检查数据库
```powershell
wrangler d1 execute fac-platform-db-prod --command="SELECT name FROM sqlite_master WHERE type='table'"
```

---

## 域名配置 (可选)

如果你想让 API 使用自定义域名 `api.hkfac.com`：

1. Cloudflare Dashboard → Workers & Pages
2. 找到 `fac-platform` Worker
3. Settings → Triggers → Custom Domains
4. Add Custom Domain: `api.hkfac.com`
5. 在 DNS 添加 CNAME: `api` → `fac-platform.xxx.workers.dev`

然后更新 GitHub Actions：
```yaml
VITE_API_BASE: 'https://api.hkfac.com'
```

---

## 故障排查

### GitHub Pages 部署失败
检查 Settings → Pages → Source 是否正确配置为 GitHub Actions

### Workers 部署失败
```powershell
wrangler deploy --dry-run  # 检查错误
wrangler tail              # 查看日志
```

### API 返回 404
确认 Workers 路由配置正确，检查 `wrangler.toml` 中的 routes 配置

### 跨域问题
Workers 中已配置 CORS 允许所有来源，如需限制，修改 `functions/api/[[path]].ts` 中的 `corsHeaders`

---

**版本**: V5.1-ALPHA  
**前端**: GitHub Pages (https://www.hkfac.com)  
**API**: Cloudflare Workers  
**数据库**: Cloudflare D1
