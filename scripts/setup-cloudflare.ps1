# FAC Platform V5.1 - Cloudflare Setup Script (Windows PowerShell)
# 一键设置 Cloudflare 基础设施

Write-Host "🚀 FAC Platform V5.1 - Cloudflare Setup (Windows)" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# 检查依赖
$wrangler = Get-Command wrangler -ErrorAction SilentlyContinue
if (-not $wrangler) {
    Write-Host "❌ Wrangler CLI 未安装" -ForegroundColor Red
    Write-Host "请运行: npm install -g wrangler" -ForegroundColor Yellow
    exit 1
}

# 检查登录状态
$whoami = wrangler whoami 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "🔑 请先登录 Cloudflare" -ForegroundColor Yellow
    wrangler login
}

$ACCOUNT_ID = (wrangler whoami | Select-String "Account ID").ToString().Split()[2]
Write-Host "✅ 已登录 Cloudflare 账号: $ACCOUNT_ID" -ForegroundColor Green

# ============================================
# 1. 创建 D1 数据库
# ============================================
Write-Host ""
Write-Host "📦 Step 1: Creating D1 Databases..." -ForegroundColor Cyan

# 生产数据库
Write-Host "Creating production database..."
wrangler d1 create fac-platform-db-prod 2>&1 | Out-Null
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Production DB created" -ForegroundColor Green
} else {
    Write-Host "⚠️  Production DB already exists" -ForegroundColor Yellow
}

# 开发数据库
Write-Host "Creating development database..."
wrangler d1 create fac-platform-db-dev 2>&1 | Out-Null
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Development DB created" -ForegroundColor Green
} else {
    Write-Host "⚠️  Development DB already exists" -ForegroundColor Yellow
}

# 获取数据库 ID
$D1_LIST = wrangler d1 list | Select-String "fac-platform-db-prod"
$PROD_DB_ID = ($D1_LIST -split "\s+")[3]
Write-Host "✅ Production DB ID: $PROD_DB_ID" -ForegroundColor Green

# 执行迁移
Write-Host "Running database migrations..."
wrangler d1 migrations apply fac-platform-db-prod --local 2>&1 | Out-Null

# ============================================
# 2. 创建 KV Namespace
# ============================================
Write-Host ""
Write-Host "📦 Step 2: Creating KV Namespace..." -ForegroundColor Cyan

wrangler kv namespace create "CACHE" 2>&1 | Out-Null
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ KV Namespace created" -ForegroundColor Green
} else {
    Write-Host "⚠️  KV Namespace already exists" -ForegroundColor Yellow
}

# 获取 KV ID
$KV_LIST = wrangler kv namespace list | ConvertFrom-Json
$KV_ID = $KV_LIST | Where-Object { $_.title -eq "CACHE" } | Select-Object -ExpandProperty id
Write-Host "✅ KV Namespace ID: $KV_ID" -ForegroundColor Green

# ============================================
# 3. 创建 Pages 项目
# ============================================
Write-Host ""
Write-Host "📦 Step 3: Creating Pages Project..." -ForegroundColor Cyan

wrangler pages project create fac-platform 2>&1 | Out-Null
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Pages project created" -ForegroundColor Green
} else {
    Write-Host "⚠️  Pages project already exists" -ForegroundColor Yellow
}

# ============================================
# 4. 更新 wrangler.toml
# ============================================
Write-Host ""
Write-Host "📝 Step 4: Updating wrangler.toml..." -ForegroundColor Cyan

# 备份原文件
Copy-Item wrangler.toml wrangler.toml.backup -ErrorAction SilentlyContinue

# 替换数据库 ID
(Get-Content wrangler.toml) -replace 'database_id = "fac-platform-db-id"', "database_id = `"$PROD_DB_ID`" | Set-Content wrangler.toml

# 替换 KV ID  
(Get-Content wrangler.toml) -replace 'id = "fac-platform-cache-id"', "id = `"$KV_ID`" | Set-Content wrangler.toml

Write-Host "✅ wrangler.toml updated" -ForegroundColor Green

# ============================================
# 5. 输出配置信息
# ============================================
Write-Host ""
Write-Host "📋 Setup Complete!" -ForegroundColor Green
Write-Host "==================" -ForegroundColor Green
Write-Host ""
Write-Host "Account ID: $ACCOUNT_ID" -ForegroundColor White
Write-Host "Production DB ID: $PROD_DB_ID" -ForegroundColor White
Write-Host "KV Namespace ID: $KV_ID" -ForegroundColor White
Write-Host ""
Write-Host "下一步:" -ForegroundColor Cyan
Write-Host "1. 在 GitHub Secrets 中添加:" -ForegroundColor Yellow
Write-Host "   - CLOUDFLARE_API_TOKEN" -ForegroundColor White
Write-Host "   - CLOUDFLARE_ACCOUNT_ID (值: $ACCOUNT_ID)" -ForegroundColor White
Write-Host ""
Write-Host "2. 推送代码到 GitHub 触发自动部署:" -ForegroundColor Yellow
Write-Host "   git add ." -ForegroundColor White
Write-Host "   git commit -m 'V5.1 ready for deployment'" -ForegroundColor White
Write-Host "   git push origin main" -ForegroundColor White
Write-Host ""
Write-Host "3. 或者手动部署:" -ForegroundColor Yellow
Write-Host "   wrangler deploy" -ForegroundColor White
Write-Host "   wrangler pages deploy dist" -ForegroundColor White

# 保存配置到文件
$CONFIG = @"
# FAC Platform V5.1 - Deployment Config
# Generated: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")

CLOUDFLARE_ACCOUNT_ID=$ACCOUNT_ID
D1_DATABASE_ID=$PROD_DB_ID
KV_NAMESPACE_ID=$KV_ID
"@

$CONFIG | Out-File -FilePath ".deployment-config" -Encoding UTF8
Write-Host ""
Write-Host "💾 配置已保存到 .deployment-config" -ForegroundColor Green
