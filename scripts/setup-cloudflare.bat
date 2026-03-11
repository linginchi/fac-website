@echo off
chcp 65001 >nul
echo 🚀 FAC Platform V5.1 - Cloudflare Setup (Windows CMD)
echo ========================================
echo.

REM 检查 Wrangler
where wrangler >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Wrangler CLI 未安装
    echo 请运行: npm install -g wrangler
    pause
    exit /b 1
)

echo ✅ Wrangler 已安装
echo.

REM 检查登录
wrangler whoami >nul 2>nul
if %errorlevel% neq 0 (
    echo 🔑 请先登录 Cloudflare
    wrangler login
)

echo ✅ 已登录 Cloudflare
echo.

REM 创建 D1 数据库
echo 📦 Step 1: Creating D1 Databases...
wrangler d1 create fac-platform-db-prod 2>nul
echo ✅ Production DB ready

REM 创建 KV
echo.
echo 📦 Step 2: Creating KV Namespace...
wrangler kv namespace create "CACHE" 2>nul
echo ✅ KV Namespace ready

REM 创建 Pages 项目
echo.
echo 📦 Step 3: Creating Pages Project...
wrangler pages project create fac-platform 2>nul
echo ✅ Pages project ready

echo.
echo 📋 Setup Complete!
echo ==================
echo.
echo 下一步:
echo 1. 在 GitHub Secrets 中添加 CLOUDFLARE_API_TOKEN 和 CLOUDFLARE_ACCOUNT_ID
echo 2. 推送代码到 GitHub 触发自动部署
echo.
pause
