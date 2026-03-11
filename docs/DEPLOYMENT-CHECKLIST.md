# FAC Platform V5.1 - 部署检查清单

## 部署前检查

### 代码层面
- [ ] 所有 TypeScript 类型检查通过 (`npm run build` 无错误)
- [ ] ESLint 检查通过 (`npm run lint`)
- [ ] 本地测试通过 (`npm run dev` 功能正常)
- [ ] V5.1-ALPHA 版本标记已显示在 UI 中

### 配置文件
- [ ] `wrangler.toml` 中的数据库 ID 已更新
- [ ] `wrangler.toml` 中的 KV ID 已更新
- [ ] `.github/workflows/deploy.yml` 配置正确

### Cloudflare 基础设施
- [ ] D1 数据库 `fac-platform-db-prod` 已创建
- [ ] KV Namespace `CACHE` 已创建
- [ ] Pages 项目 `fac-platform` 已创建
- [ ] 数据库迁移已执行 (`migrations/0001_initial.sql`)

### GitHub 配置
- [ ] Secret `CLOUDFLARE_API_TOKEN` 已添加
- [ ] Secret `CLOUDFLARE_ACCOUNT_ID` 已添加
- [ ] 仓库权限允许 GitHub Actions 写入

---

## 部署后验证

### 前端验证
- [ ] 网站首页正常加载
- [ ] V5.1-ALPHA 版本标记显示正确
- [ ] Logo 点击重置身份功能正常
- [ ] 导航栏甲乙双方模式切换正常
- [ ] OmniBox 搜索框 Party A/B 识别正常

### API 验证
- [ ] `GET /api/health` 返回 200
```bash
curl https://fac-platform.pages.dev/api/health
```
- [ ] Users API 正常工作
- [ ] Tasks API 正常工作
- [ ] Privacy API 正常工作

### 数据库验证
- [ ] 数据库表结构正确
```bash
wrangler d1 execute fac-platform-db-prod --command="SELECT name FROM sqlite_master WHERE type='table'"
```
预期输出：`users`, `skill_tags`, `tasks`, `privacy_authorizations`, `transactions`, `contact_info`

### 功能验证
- [ ] Party A 身份切换正常
- [ ] Party B 身份切换正常
- [ ] 能力矩阵标签显示正常
- [ ] 30% 订金计算显示正常

---

## 回滚准备

### 备份清单
- [ ] 数据库已备份
```bash
wrangler d1 export fac-platform-db-prod --output=backup-$(date +%Y%m%d).sql
```
- [ ] 上一个稳定版本的 commit hash 已记录
```bash
git log --oneline -1
```

### 回滚步骤 (紧急情况下)
1. 在 Cloudflare Dashboard → Pages → Deployments 中找到上一个稳定版本
2. 点击 "Rollback" 回滚前端
3. 如需回滚数据库，使用备份文件恢复

---

## 监控检查

### 日志查看
```bash
# Workers 实时日志
wrangler tail

# D1 查询性能
wrangler d1 insights fac-platform-db-prod
```

### 关键指标
- [ ] 页面加载时间 < 3s
- [ ] API 响应时间 < 500ms
- [ ] 无 5xx 错误

---

## 最终确认

部署完成后，请确认：

| 检查项 | 状态 |
|--------|------|
| 网站可正常访问 | ☐ |
| API 响应正常 | ☐ |
| 数据库连接正常 | ☐ |
| V5.1-ALPHA 标记显示 | ☐ |
| 甲乙双方身份切换正常 | ☐ |

**部署负责人**: _______________  
**部署日期**: _______________  
**备注**: _______________

---

**版本**: V5.1-ALPHA
