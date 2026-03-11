# FAC Platform V5.1 - 手动部署指南 (无脚本)

如果 PowerShell 脚本遇到问题，请按以下步骤手动执行：

---

## Step 1: 安装 Wrangler

```powershell
npm install -g wrangler
```

---

## Step 2: 登录 Cloudflare

```powershell
wrangler login
```

浏览器会打开，登录 mark@hkfac.com 账号。

---

## Step 3: 获取 Account ID

```powershell
wrangler whoami
```

记录输出的 Account ID，例如：`1a2b3c4d5e6f7g8h9i0j`

---

## Step 4: 创建 D1 数据库

```powershell
wrangler d1 create fac-platform-db-prod
```

**记录输出的 database_id**（类似 UUID 格式）

---

## Step 5: 创建 KV Namespace

```powershell
wrangler kv namespace create "CACHE"
```

**记录输出的 id**

---

## Step 6: 更新 wrangler.toml

用记事本打开 `wrangler.toml` 文件，修改以下内容：

```toml
[[d1_databases]]
binding = "DB"
database_name = "fac-platform-db-prod"
database_id = "你的数据库ID"  # <-- 替换为 Step 4 获取的 ID

[[kv_namespaces]]
binding = "CACHE"
id = "你的KV-ID"  # <-- 替换为 Step 5 获取的 ID
```

---

## Step 7: 执行数据库迁移

```powershell
wrangler d1 migrations apply fac-platform-db-prod --local
```

---

## Step 8: 创建 Pages 项目

```powershell
wrangler pages project create fac-platform
```

---

## Step 9: 配置 GitHub Secrets

访问：https://github.com/linginchi/fac-website/settings/secrets/actions

添加两个 Secrets：

| Name | Value |
|------|-------|
| CLOUDFLARE_ACCOUNT_ID | Step 3 获取的 Account ID |
| CLOUDFLARE_API_TOKEN | 见下方获取步骤 |

### 获取 API Token：

1. 访问 https://dash.cloudflare.com/profile/api-tokens
2. 点击 "Create Token"
3. 选择 "Custom token"
4. 设置名称：GitHub Actions
5. 权限设置：
   - Account: Cloudflare Pages:Edit
   - Account: Workers Scripts:Edit  
   - Account: D1:Edit
   - Account: KV:Edit
   - Account: Account:Read
6. 点击 Continue → Create Token
7. **复制 Token 值到 GitHub Secret**

---

## Step 10: 推送代码触发部署

```powershell
git add .
git commit -m "V5.1 deployment"
git push origin main
```

---

## 备选：手动部署 (不用 GitHub Actions)

如果 GitHub Actions 有问题，可以直接手动部署：

```powershell
# 构建
npm run build

# 部署 API (Workers)
wrangler deploy

# 部署前端 (Pages)
wrangler pages deploy dist --project-name=fac-platform
```

---

## 验证部署

访问：https://fac-platform.pages.dev

检查：
1. 页面正常显示
2. 顶部有 V5.1-ALPHA 标记
3. 访问 https://fac-platform.pages.dev/api/health 返回 JSON

---

**完成！** 如有问题请联系 mark@hkfac.com
