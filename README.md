# FAC (Hong Kong) Ltd. Website

香港中科創新中心有限公司官方网站

## 网站地址

- **官网**: https://www.hkfac.com
- **后台管理**: https://www.hkfac.com/admin

## 功能特性

### 前台展示
- 🌐 多语言支持（简体中文、繁体中文、英文）
- 🎨 Bloomberg 金黄色系设计风格
- ✨ GSAP 动画效果
- 📱 响应式设计

### 后台管理
- 🔐 安全的登录系统（验证码 + 密码）
- 👥 团队成员管理
- 📝 网站内容管理
- 📊 数据统计配置
- 📞 联系信息管理

## 允许登录的邮箱

- `mark@hkfac.com`
- `markgclin@gmail.com`

## 技术栈

- React 18 + TypeScript
- Tailwind CSS
- GSAP 动画库
- i18next 国际化
- shadcn/ui 组件库

## 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

## 部署

### GitHub Pages 自动部署

1. 推送代码到 GitHub 仓库
2. GitHub Actions 会自动构建并部署
3. 在仓库 Settings > Pages 中配置自定义域名

### 手动部署

```bash
# 构建
npm run build

# 复制 404.html 用于 SPA 路由
cp dist/index.html dist/404.html

# 创建 CNAME 文件
echo "www.hkfac.com" > dist/CNAME
```

## 目录结构

```
├── src/
│   ├── sections/        # 页面组件
│   │   ├── Hero.tsx
│   │   ├── About.tsx
│   │   ├── Services.tsx
│   │   ├── Team.tsx
│   │   ├── Contact.tsx
│   │   ├── AdminLogin.tsx
│   │   └── AdminPanel.tsx
│   ├── hooks/           # 自定义 Hooks
│   │   ├── useAuth.ts
│   │   ├── useTeamMembers.ts
│   │   └── useSiteConfig.ts
│   ├── i18n/            # 国际化配置
│   ├── App.tsx
│   └── main.tsx
├── public/              # 静态资源
├── .github/workflows/   # GitHub Actions
└── dist/                # 构建输出
```

## 许可证

© 2024 FAC (Hong Kong) Ltd. All rights reserved.
