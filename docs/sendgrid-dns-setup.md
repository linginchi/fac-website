# SendGrid DNS 配置指南

## 方案 A：自动化配置（需要 API Token）

### 1. 获取 Cloudflare API Token

1. 访问 https://dash.cloudflare.com/profile/api-tokens
2. 点击 "Create Token"
3. 使用模板 "Edit zone DNS"
4. 权限选择：
   - Zone:Read
   - DNS:Edit
5. 区域资源选择：Include - Specific zone - hkfac.com
6. 复制生成的 Token

### 2. 获取 Zone ID

1. 访问 https://dash.cloudflare.com
2. 选择 hkfac.com 域名
3. 在右侧栏找到 "Zone ID"

### 3. 运行自动化脚本

```powershell
# 设置环境变量
$env:CF_API_TOKEN = "您的API Token"
$env:CF_ZONE_ID = "您的Zone ID"

# 运行脚本
node scripts/add-sendgrid-dns.js
```

## 方案 B：手动添加 DNS 记录

登录 Cloudflare Dashboard，为 hkfac.com 添加以下记录：

| 类型 | 名称 | 目标/内容 | 代理状态 |
|------|------|-----------|----------|
| CNAME | url5083 | sendgrid.net | 仅DNS（关闭代理） |
| CNAME | 60952569 | sendgrid.net | 仅DNS（关闭代理） |
| CNAME | em2282 | u60952569.wl070.sendgrid.net | 仅DNS（关闭代理） |
| CNAME | s1._domainkey | s1.domainkey.u60952569.wl070.sendgrid.net | 仅DNS（关闭代理） |
| CNAME | s2._domainkey | s2.domainkey.u60952569.wl070.sendgrid.net | 仅DNS（关闭代理） |
| TXT | _dmarc | v=DMARC1; p=none; | 仅DNS（关闭代理） |

## 验证

添加完成后，在 SendGrid Dashboard 点击 "Verify" 按钮验证域名。

验证通过后：
- 邮件将不再进入垃圾箱
- 发件人显示为 noreply@hkfac.com
- SPF/DKIM/DMARC 全部通过
