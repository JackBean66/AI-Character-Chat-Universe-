# Render/Railway 部署指南

本文档提供详细的 Render.com 和 Railway.app 部署步骤。

## 📋 前置准备

### 1. 代码检查清单

在部署前，请确保以下文件已经准备好：

```
项目根目录/
├── backend/
│   ├── app.py              # ✅ 已更新为生产环境版本
│   ├── config.py           # 配置管理
│   ├── dao.py              # 数据访问对象
│   ├── models.py           # 数据模型
│   ├── database.py         # 数据库连接
│   ├── requirements.txt    # ✅ 已添加 gunicorn
│   └── .env.example        # 环境变量示例
├── frontend/
│   ├── config.js           # ✅ 新增：API 配置文件
│   ├── aichat_root.html    # 系统首页
│   ├── aichat_philosophers.html
│   ├── aichat_write.html
│   ├── aichat_move.html
│   ├── chat.js             # ✅ 已更新：使用动态配置
│   └── index.html          # ✅ 已更新：引入 config.js
├── render.yaml             # ✅ Render 配置
├── railway.toml            # ✅ Railway 配置
└── README.md
```

### 2. 注册账号

- **Render**: 访问 [render.com](https://render.com) 注册（推荐使用 GitHub 登录）
- **Railway**: 访问 [railway.app](https://railway.app) 注册（推荐使用 GitHub 登录）

---

## 方案一：Render.com 部署（推荐）

### 第一步：推送代码到 GitHub

```bash
# 初始化 Git 仓库（如果还没有）
git init

# 添加所有文件
git add .

# 提交
git commit -m "准备部署到 Render"

# 添加远程仓库
git remote add origin https://github.com/your_username/your_repo.git

# 推送代码
git push -u origin main
```

### 第二步：部署后端服务

1. 登录 [Render Dashboard](https://dashboard.render.com)
2. 点击 **"New +"** → **"Web Service"**
3. 连接你的 GitHub 仓库
4. 配置服务：

| 配置项 | 值 |
|--------|-----|
| **Name** | `aichat-backend` |
| **Environment** | `Python 3` |
| **Branch** | `main` |
| **Root Directory** | `backend` |
| **Build Command** | `pip install -r requirements.txt` |
| **Start Command** | `gunicorn app:app` |

5. 配置环境变量（在 "Environment" 标签页）：

```env
# Flask 配置
FLASK_APP=app.py
FLASK_ENV=production
SECRET_KEY=your_random_secret_key_here

# 数据库配置（Render 会自动提供数据库 URL）
# 使用 Render 的内置 MySQL 服务时，这些会自动配置
```

6. 点击 **"Create Web Service"**

### 第三步：创建数据库

1. 在 Render Dashboard 点击 **"New +"** → **"Database"**
2. 选择 **"MySQL"**
3. 配置：

| 配置项 | 值 |
|--------|-----|
| **Name** | `aichat-mysql` |
| **Database** | `philosophy_ai` |
| **User** | `aichat_user` |

4. 点击 **"Create Database"**

5. 创建后，Render 会提供数据库连接信息。复制 **Internal Database URL**

6. 回到后端服务，添加环境变量：

```env
DB_HOST=your_database_host
DB_PORT=3306
DB_NAME=philosophy_ai
DB_USER=your_database_user
DB_PASSWORD=your_database_password
```

### 第四步：部署前端服务

1. 在 Render Dashboard 点击 **"New +"** → **"Static Site"**
2. 配置：

| 配置项 | 值 |
|--------|-----|
| **Name** | `aichat-frontend` |
| **Branch** | `main` |
| **Root Directory** | `frontend` |
| **Publish Directory** | `.` |
| **Build Command** | 留空 |

3. 在 **"Advanced"** 设置中添加 **Rewrite Rules**：

```json
[
  {
    "source": "/*",
    "destination": "/aichat_root.html"
  }
]
```

4. 点击 **"Create Static Site"**

### 第五步：配置前端 API 地址

前端部署完成后：

1. 获取后端服务 URL（例如：`https://aichat-backend.onrender.com`）
2. 编辑 `frontend/config.js`，修改 production 配置：

```javascript
production: {
  // 方式1：使用同一域名（推荐）
  BASE_URL: window.location.origin,

  // 方式2：使用后端实际 URL（如果前后端分离）
  // BASE_URL: 'https://aichat-backend.onrender.com',
}
```

3. 提交并推送代码更新

### 第六步：测试部署

1. 访问前端 URL（例如：`https://aichat-frontend.onrender.com`）
2. 检查页面是否正常加载
3. 打开浏览器控制台，检查 API 地址是否正确
4. 测试登录和对话功能

---

## 方案二：Railway.app 部署

### 第一步：导入项目

1. 登录 [Railway Dashboard](https://build.railway.app)
2. 点击 **"New Project"** → **"Deploy from GitHub repo"**
3. 选择你的仓库

### 第二步：配置后端服务

Railway 会自动检测 Python 项目并创建服务。配置：

1. 点击项目中的服务
2. 在 **"Settings"** 标签页：

| 配置项 | 值 |
|--------|-----|
| **Root Directory** | `backend` |
| **Build Command** | `pip install -r requirements.txt` |
| **Start Command** | `gunicorn app:app` |

3. 在 **"Variables"** 标签页添加环境变量：

```env
FLASK_APP=app.py
FLASK_ENV=production
SECRET_KEY=your_random_secret_key_here
```

### 第三步：添加数据库

1. 在项目中点击 **"New"** → **"Database"**
2. 选择 **"MySQL"**
3. Railway 会自动创建数据库并生成连接信息

4. 更新后端服务的环境变量：

```env
DB_HOST=your_railway_database_host
DB_PORT=3306
DB_NAME=philosophy_ai
DB_USER=your_railway_database_user
DB_PASSWORD=your_railway_database_password
```

### 第四步：部署前端

Railway 不直接支持静态站点，有两个选择：

**选项A：使用 Cloudflare Pages（推荐）**

1. 将代码推送到 GitHub
2. 在 [Cloudflare Dashboard](https://dash.cloudflare.com) 创建 Pages 项目
3. 连接 GitHub 仓库
4. 设置构建设置：
   - Build command: 留空
   - Build output directory: `frontend`
   - Root directory: `/`

**选项B：使用 Netlify**

1. 在 [Netlify](https://netlify.com) 创建站点
2. 导入 GitHub 仓库
3. 设置：
   - Build command: 留空
   - Publish directory: `frontend`

---

## 🔧 环境变量配置

### 生成安全密钥

```python
# 在 Python 中生成
import secrets
print(secrets.token_urlsafe(32))
```

### 必需的环境变量

| 变量名 | 说明 | 示例值 |
|--------|------|--------|
| `DB_HOST` | 数据库主机 | `localhost` 或 Render 提供的主机 |
| `DB_PORT` | 数据库端口 | `3306` |
| `DB_NAME` | 数据库名称 | `philosophy_ai` |
| `DB_USER` | 数据库用户 | `aichat_user` |
| `DB_PASSWORD` | 数据库密码 | `secure_password_here` |
| `SECRET_KEY` | Flask 密钥 | `random_32_char_string` |
| `FLASK_ENV` | 运行环境 | `production` |
| `FLASK_DEBUG` | 调试模式 | `false` |

---

## 🌐 自定义域名配置

### Render 域名配置

1. 在 Render Dashboard 进入服务设置
2. 点击 **"Custom Domains"**
3. 添加你的域名（例如：`aichat.yourdomain.com`）
4. 按照提示配置 DNS 记录：

```
类型    名称    值
CNAME   aichat  your-service.onrender.com
```

5. 等待 SSL 证书自动生成

### Railway 域名配置

1. 在服务设置中点击 **"Domains"**
2. 添加自定义域名
3. 配置 DNS 记录

---

## 🐛 故障排查

### 问题1：部署失败

**错误信息**：`ModuleNotFoundError: No module named 'dao'`

**解决方案**：
1. 检查 `Root Directory` 是否设置为 `backend`
2. 确保 `backend/dao.py` 和 `backend/models.py` 存在

### 问题2：数据库连接失败

**错误信息**：`Can't connect to MySQL server`

**解决方案**：
1. 检查环境变量是否正确配置
2. 确保 MySQL 服务已启动
3. 在 Render，确保后端服务和数据库在同一个区域

### 问题3：前端无法访问后端 API

**错误信息**：`CORS policy error` 或 `Network error`

**解决方案**：
1. 检查 `frontend/config.js` 中的 `BASE_URL`
2. 确保后端 CORS 配置正确
3. 检查防火墙规则

### 问题4：前端页面空白

**解决方案**：
1. 打开浏览器控制台（F12）查看错误
2. 检查 `config.js` 是否正确加载
3. 确保 JavaScript 文件路径正确

### 查看日志

**Render 日志**：
1. 进入服务页面
2. 点击 **"Logs"** 标签
3. 查看实时日志

**Railway 日志**：
1. 点击服务
2. 查看 **"Logs"** 面板

---

## 📊 监控和维护

### 性能监控

- **Render Metrics**: 查看服务 CPU、内存使用情况
- **Railway Metrics**: 查看请求量和响应时间

### 日志管理

定期导出日志以便分析：

```bash
# Render - 使用 render-cli
pip install render-cli
render logs --service aichat-backend --tail 100

# Railway - 在控制台查看和下载
```

---

## 💰 成本估算

### Render 免费套餐限制

- **Web Service**: 750 小时/月（约31天连续运行）
- **数据库**: 90 天免费试用期
- **静态站点**: 完全免费

### Railway 免费套餐限制

- $5 免费额度/月
- 按使用量计费，超出后收费

---

## 🚀 部署后检查清单

- [ ] 后端服务正常运行（绿色状态）
- [ ] 数据库连接成功
- [ ] 前端页面正常加载
- [ ] API 请求正常响应
- [ ] 登录功能正常
- [ ] 对话功能正常
- [ ] 配置了自定义域名（可选）
- [ ] SSL 证书正常（自动配置）
- [ ] 设置了环境变量
- [ ] 日志正常输出

---

## 📝 下一步

部署完成后，您可以：

1. **添加真实 AI 对话功能**
   - 申请 OpenAI API Key
   - 或使用 DeepSeek API（国内推荐）

2. **优化用户体验**
   - 添加加载动画
   - 优化错误提示
   - 添加更多角色

3. **性能优化**
   - 启用 CDN 加速
   - 实现数据缓存
   - 优化数据库查询

---

## 🆘 需要帮助？

如果遇到问题：

1. 查看 [Render 文档](https://render.com/docs)
2. 查看 [Railway 文档](https://docs.railway.app)
3. 检查 GitHub Issues
4. 查看项目 README.md

祝部署顺利！🎉
