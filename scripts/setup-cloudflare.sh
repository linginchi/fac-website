#!/bin/bash
# FAC Platform V5.1 - Cloudflare Setup Script
# 一键设置 Cloudflare 基础设施

set -e

echo "🚀 FAC Platform V5.1 - Cloudflare Setup"
echo "========================================"

# 检查依赖
if ! command -v wrangler &> /dev/null; then
    echo "❌ Wrangler CLI 未安装"
    echo "请运行: npm install -g wrangler"
    exit 1
fi

# 检查登录状态
if ! wrangler whoami &> /dev/null; then
    echo "🔑 请先登录 Cloudflare"
    wrangler login
fi

ACCOUNT_ID=$(wrangler whoami | grep "Account ID" | awk '{print $3}')
echo "✅ 已登录 Cloudflare 账号: $ACCOUNT_ID"

# ============================================
# 1. 创建 D1 数据库
# ============================================
echo ""
echo "📦 Step 1: Creating D1 Databases..."

# 生产数据库
echo "Creating production database..."
wrangler d1 create fac-platform-db-prod 2>/dev/null || echo "⚠️  Production DB already exists"

# 开发数据库
echo "Creating development database..."
wrangler d1 create fac-platform-db-dev 2>/dev/null || echo "⚠️  Development DB already exists"

# 获取数据库 ID
PROD_DB_ID=$(wrangler d1 list | grep "fac-platform-db-prod" | awk '{print $4}')
echo "✅ Production DB ID: $PROD_DB_ID"

# 执行迁移
echo "Running database migrations..."
wrangler d1 migrations apply fac-platform-db-prod --local 2>/dev/null || true

# ============================================
# 2. 创建 KV Namespace
# ============================================
echo ""
echo "📦 Step 2: Creating KV Namespace..."

wrangler kv namespace create "CACHE" 2>/dev/null || echo "⚠️  KV namespace already exists"

# 获取 KV ID
KV_ID=$(wrangler kv namespace list | grep "CACHE" | sed 's/.*"id": "\([^"]*\)".*/\1/')
echo "✅ KV Namespace ID: $KV_ID"

# ============================================
# 3. 创建 Pages 项目
# ============================================
echo ""
echo "📦 Step 3: Creating Pages Project..."

wrangler pages project create fac-platform 2>/dev/null || echo "⚠️  Pages project already exists"
echo "✅ Pages project created"

# ============================================
# 4. 更新 wrangler.toml
# ============================================
echo ""
echo "📝 Step 4: Updating wrangler.toml..."

# 备份原文件
cp wrangler.toml wrangler.toml.backup

# 替换数据库 ID
sed -i.bak "s/database_id = \"fac-platform-db-id\"/database_id = \"$PROD_DB_ID\"/g" wrangler.toml

# 替换 KV ID  
sed -i.bak "s/id = \"fac-platform-cache-id\"/id = \"$KV_ID\"/g" wrangler.toml

# 删除备份文件
rm -f wrangler.toml.bak

echo "✅ wrangler.toml updated"

# ============================================
# 5. 输出配置信息
# ============================================
echo ""
echo "📋 Setup Complete!"
echo "=================="
echo ""
echo "Account ID: $ACCOUNT_ID"
echo "Production DB ID: $PROD_DB_ID"
echo "KV Namespace ID: $KV_ID"
echo ""
echo "下一步:"
echo "1. 在 GitHub Secrets 中添加:"
echo "   - CLOUDFLARE_API_TOKEN"
echo "   - CLOUDFLARE_ACCOUNT_ID (值: $ACCOUNT_ID)"
echo ""
echo "2. 推送代码到 GitHub 触发自动部署:"
echo "   git add ."
echo "   git commit -m 'V5.1 ready for deployment'"
echo "   git push origin main"
echo ""
echo "3. 或者手动部署:"
echo "   wrangler deploy"
echo "   wrangler pages deploy dist"
