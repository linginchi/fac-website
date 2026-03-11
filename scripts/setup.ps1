# FAC Platform V5.1 - Cloudflare Setup Script (Windows)
# Simplified version without special characters

Write-Host "FAC Platform V5.1 - Cloudflare Setup" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan

# Check dependencies
$wrangler = Get-Command wrangler -ErrorAction SilentlyContinue
if (-not $wrangler) {
    Write-Host "ERROR: Wrangler CLI not installed" -ForegroundColor Red
    Write-Host "Please run: npm install -g wrangler" -ForegroundColor Yellow
    exit 1
}

# Check login status
$whoami = wrangler whoami 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "Please login to Cloudflare first" -ForegroundColor Yellow
    wrangler login
}

$ACCOUNT_ID = (wrangler whoami | Select-String "Account ID").ToString().Split()[2]
Write-Host "Logged in to Cloudflare Account: $ACCOUNT_ID" -ForegroundColor Green

# Step 1: Create D1 Databases
Write-Host ""
Write-Host "Step 1: Creating D1 Databases..." -ForegroundColor Cyan

wrangler d1 create fac-platform-db-prod 2>&1 | Out-Null
Write-Host "Production DB created or already exists" -ForegroundColor Green

wrangler d1 create fac-platform-db-dev 2>&1 | Out-Null
Write-Host "Development DB created or already exists" -ForegroundColor Green

# Get database ID
$D1_LIST = wrangler d1 list | Select-String "fac-platform-db-prod"
$PROD_DB_ID = ($D1_LIST -split "\s+")[3]
Write-Host "Production DB ID: $PROD_DB_ID" -ForegroundColor Green

# Run migrations
Write-Host "Running database migrations..." -ForegroundColor Yellow
wrangler d1 migrations apply fac-platform-db-prod --local 2>&1 | Out-Null

# Step 2: Create KV Namespace
Write-Host ""
Write-Host "Step 2: Creating KV Namespace..." -ForegroundColor Cyan

wrangler kv namespace create "CACHE" 2>&1 | Out-Null
Write-Host "KV Namespace created or already exists" -ForegroundColor Green

# Get KV ID
$KV_LIST = wrangler kv namespace list | ConvertFrom-Json
$KV_ID = $KV_LIST | Where-Object { $_.title -eq "CACHE" } | Select-Object -ExpandProperty id
Write-Host "KV Namespace ID: $KV_ID" -ForegroundColor Green

# Step 3: Create Pages Project
Write-Host ""
Write-Host "Step 3: Creating Pages Project..." -ForegroundColor Cyan

wrangler pages project create fac-platform 2>&1 | Out-Null
Write-Host "Pages project created or already exists" -ForegroundColor Green

# Step 4: Update wrangler.toml
Write-Host ""
Write-Host "Step 4: Updating wrangler.toml..." -ForegroundColor Cyan

Copy-Item wrangler.toml wrangler.toml.backup -ErrorAction SilentlyContinue

(Get-Content wrangler.toml) -replace 'database_id = "fac-platform-db-id"', "database_id = `"$PROD_DB_ID`" | Set-Content wrangler.toml
(Get-Content wrangler.toml) -replace 'id = "fac-platform-cache-id"', "id = `"$KV_ID`" | Set-Content wrangler.toml

Write-Host "wrangler.toml updated successfully" -ForegroundColor Green

# Step 5: Output configuration
Write-Host ""
Write-Host "Setup Complete!" -ForegroundColor Green
Write-Host "===============" -ForegroundColor Green
Write-Host ""
Write-Host "Account ID: $ACCOUNT_ID"
Write-Host "Production DB ID: $PROD_DB_ID"
Write-Host "KV Namespace ID: $KV_ID"
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "1. Add these GitHub Secrets:" -ForegroundColor Yellow
Write-Host "   - CLOUDFLARE_API_TOKEN"
Write-Host "   - CLOUDFLARE_ACCOUNT_ID = $ACCOUNT_ID"
Write-Host ""
Write-Host "2. Push code to GitHub:" -ForegroundColor Yellow
Write-Host "   git add ."
Write-Host "   git commit -m 'V5.1 deployment'"
Write-Host "   git push origin main"
Write-Host ""
Write-Host "3. Or deploy manually:" -ForegroundColor Yellow
Write-Host "   wrangler deploy"
Write-Host "   wrangler pages deploy dist"

# Save config
@"
CLOUDFLARE_ACCOUNT_ID=$ACCOUNT_ID
D1_DATABASE_ID=$PROD_DB_ID
KV_NAMESPACE_ID=$KV_ID
"@ | Out-File -FilePath ".deployment-config" -Encoding ASCII

Write-Host ""
Write-Host "Config saved to .deployment-config" -ForegroundColor Green
