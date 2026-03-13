#!/usr/bin/env node
/**
 * SendGrid DNS 记录自动化添加脚本
 * 为 hkfac.com 添加 SendGrid 域名验证所需的 DNS 记录
 * 
 * 使用方法:
 *   CF_API_TOKEN=xxx CF_ZONE_ID=yyy node add-sendgrid-dns.js
 */

const CF_API_TOKEN = process.env.CF_API_TOKEN;
const ZONE_ID = process.env.CF_ZONE_ID;

// SendGrid 提供的 DNS 记录（根据您的截图）
const RECORDS = [
  { type: 'CNAME', name: 'url5083.hkfac.com', content: 'sendgrid.net', proxied: false },
  { type: 'CNAME', name: '60952569.hkfac.com', content: 'sendgrid.net', proxied: false },
  { type: 'CNAME', name: 'em2282.hkfac.com', content: 'u60952569.wl070.sendgrid.net', proxied: false },
  { type: 'CNAME', name: 's1._domainkey.hkfac.com', content: 's1.domainkey.u60952569.wl070.sendgrid.net', proxied: false },
  { type: 'CNAME', name: 's2._domainkey.hkfac.com', content: 's2.domainkey.u60952569.wl070.sendgrid.net', proxied: false },
  { type: 'TXT', name: '_dmarc.hkfac.com', content: 'v=DMARC1; p=none;', proxied: false },
];

async function cloudflareAPI(endpoint, options = {}) {
  const url = `https://api.cloudflare.com/client/v4${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Authorization': `Bearer ${CF_API_TOKEN}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  return response.json();
}

async function listExistingRecords() {
  console.log('📋 正在获取现有 DNS 记录...\n');
  const data = await cloudflareAPI(`/zones/${ZONE_ID}/dns_records?per_page=100`);
  if (!data.success) {
    throw new Error(`获取记录失败: ${JSON.stringify(data.errors)}`);
  }
  return data.result;
}

async function addDNSRecord(record) {
  const body = {
    type: record.type,
    name: record.name,
    content: record.content,
    ttl: 1, // Auto TTL
    proxied: record.proxied,
  };

  const data = await cloudflareAPI(`/zones/${ZONE_ID}/dns_records`, {
    method: 'POST',
    body: JSON.stringify(body),
  });

  if (data.success) {
    console.log(`  ✅ ${record.type} ${record.name}`);
    return true;
  } else {
    // 检查是否已存在
    const exists = data.errors?.some(e => e.code === 81057);
    if (exists) {
      console.log(`  ⚠️  ${record.type} ${record.name} (已存在)`);
      return true;
    }
    console.error(`  ❌ ${record.type} ${record.name}`);
    console.error(`     错误: ${JSON.stringify(data.errors)}`);
    return false;
  }
}

async function main() {
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║     SendGrid DNS 记录自动化配置工具                   ║');
  console.log('║     域名: hkfac.com                                   ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');

  // 验证环境变量
  if (!CF_API_TOKEN || !ZONE_ID) {
    console.error('❌ 错误：缺少必要的环境变量\n');
    console.error('请设置以下变量：');
    console.error('  export CF_API_TOKEN="您的 Cloudflare API Token"');
    console.error('  export CF_ZONE_ID="您的 Zone ID"\n');
    console.error('获取方法见文档：docs/sendgrid-dns-setup.md');
    process.exit(1);
  }

  try {
    // 验证 API Token
    console.log('🔑 验证 API Token...');
    const userData = await cloudflareAPI('/user/tokens/verify');
    if (!userData.success) {
      console.error('❌ API Token 无效');
      process.exit(1);
    }
    console.log('  ✅ API Token 有效\n');

    // 获取现有记录
    const existingRecords = await listExistingRecords();

    // 检查重复
    console.log('🔍 检查重复记录...\n');
    const recordsToAdd = RECORDS.filter(r => {
      const exists = existingRecords.some(er => 
        er.type === r.type && er.name === r.name
      );
      return !exists;
    });

    if (recordsToAdd.length === 0) {
      console.log('✨ 所有记录已存在，无需添加！\n');
    } else {
      console.log(`📝 准备添加 ${recordsToAdd.length} 条 DNS 记录:\n`);
      
      let successCount = 0;
      for (const record of recordsToAdd) {
        const success = await addDNSRecord(record);
        if (success) successCount++;
        await new Promise(r => setTimeout(r, 300)); // 避免 rate limit
      }

      console.log(`\n📊 结果: ${successCount}/${recordsToAdd.length} 条记录添加成功`);
    }

    // 显示所有 SendGrid 相关记录
    console.log('\n📋 当前 SendGrid DNS 记录状态：');
    console.log('─────────────────────────────────────────────────────');
    RECORDS.forEach(r => {
      const existing = existingRecords.find(er => er.type === r.type && er.name === r.name);
      const status = existing ? '✅ 已添加' : '⏳ 待添加';
      console.log(`${status}  ${r.type.padEnd(5)} ${r.name.padEnd(30)} → ${r.content}`);
    });
    console.log('─────────────────────────────────────────────────────');

    console.log('\n✨ 配置完成！\n');
    console.log('下一步：');
    console.log('  1. 登录 SendGrid Dashboard');
    console.log('  2. Settings → Sender Authentication → Domain Authentication');
    console.log('  3. 点击 "Verify" 按钮验证域名');
    console.log('  4. 验证通过后，邮件将不再进入垃圾箱\n');

  } catch (error) {
    console.error('\n❌ 发生错误:', error.message);
    process.exit(1);
  }
}

main();
