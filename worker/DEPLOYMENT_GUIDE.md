# FAC Platform V5.1 - Backend Deployment Guide

## Prerequisites

- Cloudflare account (mark@hkfac.com)
- Wrangler CLI installed: `npm install -g wrangler`
- LinkedIn Developer App credentials (Client ID: 86rh0n847vlmx9)

## Setup Steps

### 1. Install Dependencies

```bash
cd worker
npm install
```

### 2. Login to Cloudflare

```bash
wrangler login
# This will open browser to authenticate with your Cloudflare account
```

### 3. Create D1 Database

```bash
wrangler d1 create fac-platform-db
```

Note the database ID from the output and update `wrangler.toml`:

```toml
[[d1_databases]]
binding = "DB"
database_name = "fac-platform-db"
database_id = "YOUR_DATABASE_ID_HERE"
```

### 4. Run Database Migrations

```bash
wrangler d1 migrations apply fac-platform-db
```

### 5. Set Secrets

```bash
# LinkedIn Client Secret (get from LinkedIn Developer Console)
wrangler secret put LINKEDIN_CLIENT_SECRET

# JWT Secret (generate a random string)
wrangler secret put JWT_SECRET_KEY

# Encryption Key (generate a random string)
wrangler secret put ENCRYPTION_KEY
```

### 6. Deploy

```bash
# Deploy to staging
npm run deploy:staging

# Deploy to production
npm run deploy:production
```

## API Endpoints

### Authentication
- `GET /auth/linkedin` - Get LinkedIn OAuth URL
- `GET /auth/linkedin/callback` - OAuth callback

### User
- `GET /api/user/profile` - Get current user profile
- `PUT /api/user/profile` - Update profile
- `POST /api/user/wallet` - Create wallet
- `GET /api/user/transactions` - Get transaction history

### Referral
- `GET /api/referral/my` - Get my referral info
- `POST /api/referral/track` - Track referral click
- `GET /api/referral/config` - Get reward config

### Buyback
- `GET /api/buyback/history` - Get buyback history
- `GET /api/buyback/latest` - Get latest buyback
- `GET /api/buyback/metrics` - Get platform metrics
- `GET /api/buyback/next` - Get next buyback preview
- `GET /api/buyback/my-holdings` - Get user's holdings

### Public
- `GET /api/public/config` - Get public platform config
- `GET /health` - Health check

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| LINKEDIN_CLIENT_ID | LinkedIn App Client ID | Yes (in wrangler.toml) |
| LINKEDIN_CLIENT_SECRET | LinkedIn App Secret | Yes (secret) |
| LINKEDIN_REDIRECT_URI | OAuth callback URL | Yes (in wrangler.toml) |
| JWT_SECRET_KEY | JWT signing key | Yes (secret) |
| ENCRYPTION_KEY | Data encryption key | Yes (secret) |

## Monitoring

View logs:
```bash
wrangler tail
```

View production logs:
```bash
wrangler tail --env production
```

## Troubleshooting

### Database connection issues
- Verify database_id in wrangler.toml matches the created database
- Ensure D1 binding is correct

### LinkedIn OAuth errors
- Verify redirect_uri matches exactly in LinkedIn App settings
- Check Client ID and Secret are set correctly

### CORS errors
- Ensure frontend origin is allowed
- Check Access-Control-Allow-Origin headers

## Production Checklist

- [ ] Database migrated
- [ ] Secrets set (LINKEDIN_CLIENT_SECRET, JWT_SECRET_KEY, ENCRYPTION_KEY)
- [ ] LinkedIn App redirect_uri updated to production URL
- [ ] Rate limiting tested
- [ ] CORS origins configured for production
- [ ] SSL certificate active
- [ ] Monitoring enabled
