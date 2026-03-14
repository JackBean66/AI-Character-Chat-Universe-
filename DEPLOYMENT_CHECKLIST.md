# 部署前检查清单

在将代码推送到 GitHub 并部署到 Render/Railway 之前，请完成以下检查。

---

## ✅ 代码检查

### 后端文件检查

- [x] `backend/app.py` - 主应用文件，包含所有 API 路由
- [x] `backend/config.py` - 配置管理
- [x] `backend/dao.py` - 数据访问对象
- [x] `backend/models.py` - 数据模型
- [x] `backend/database.py` - 数据库连接管理
- [x] `backend/requirements.txt` - Python 依赖（包含 gunicorn）
- [x] `backend/.env.example` - 环境变量模板
- [x] `backend/init_db.sql` - 数据库初始化脚本

### 前端文件检查

- [x] `frontend/config.js` - API 配置文件（新增）
- [x] `frontend/aichat_root.html` - 系统首页
- [x] `frontend/aichat_philosophers.html` - 哲学家列表页
- [x] `frontend/aichat_write.html` - 作家列表页
- [x] `frontend/aichat_move.html` - 影视角色列表页
- [x] `frontend/chat.js` - 对话逻辑（已更新为使用动态配置）
- [x] `frontend/index.html` - 主页（已更新为引入 config.js）
- [x] `frontend/style.css` - 通用样式

### 配置文件检查

- [x] `render.yaml` - Render 部署配置
- [x] `railway.toml` - Railway 部署配置
- [x] `.gitignore` - Git 忽略文件配置

---

## 📋 本地测试清单

在部署前，请在本地完成以下测试：

### 1. 后端测试

```bash
# 进入后端目录
cd backend

# 创建虚拟环境（如果还没有）
python -m venv venv

# 激活虚拟环境
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# 安装依赖
pip install -r requirements.txt

# 复制环境变量模板
copy .env.example .env

# 编辑 .env 文件，配置数据库信息
# notepad .env  (Windows)
# nano .env     (Linux/Mac)

# 启动应用
python app.py
```

**预期结果：**
- ✅ 应用成功启动，显示 `🚀 启动AI角色对话系统API...`
- ✅ 访问 http://localhost:5000 显示 API 信息
- ✅ 访问 http://localhost:5000/health 显示 `{"status": "healthy"}`
- ✅ 访问 http://localhost:5000/api/philosophers 返回哲学家列表

### 2. 前端测试

```bash
# 在浏览器中打开
# 直接双击 frontend/aichat_root.html
# 或使用 Live Server
```

**预期结果：**
- ✅ 页面正常显示
- ✅ 打开浏览器控制台（F12），看到 `🔧 API 配置` 日志
- ✅ API 地址显示为 `http://localhost:5000`
- ✅ 页面样式正常加载

### 3. 数据库测试

```bash
# 连接 MySQL
mysql -u root -p

# 执行初始化脚本
source backend/init_db.sql

# 验证数据
USE philosophy_ai;
SELECT COUNT(*) FROM philosophers;
SELECT COUNT(*) FROM users;
```

**预期结果：**
- ✅ 表创建成功
- ✅ 插入了约 15 条哲学家数据
- ✅ 插入了 2 条测试用户数据

---

## 🔐 安全检查

### 环境变量检查

- [ ] `.env` 文件在 `.gitignore` 中（不会被提交）
- [ ] `.env.example` 已更新，包含所有必需的环境变量
- [ ] 生产环境使用强密码
- [ ] `SECRET_KEY` 和 `JWT_SECRET` 使用不同的随机值

生成安全密钥：
```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

### 密码检查

- [ ] 测试用户密码已修改或删除
- [ ] 生产环境不使用默认密码

---

## 🚀 Git 提交检查

### 检查当前状态

```bash
# 查看文件状态
git status

# 应该看到：
# new file: .gitignore
# new file: backend/.env.example
# new file: backend/init_db.sql
# modified: backend/app.py
# modified: backend/requirements.txt
# new file: frontend/config.js
# modified: frontend/chat.js
# modified: frontend/index.html
# new file: render.yaml
# new file: railway.toml
# new file: RENDER_RAILWAY_DEPLOY.md
# new file: DEPLOYMENT.md
```

### 确认 .gitignore 生效

```bash
# 检查这些文件是否被忽略
git check-ignore backend/.env
git check-ignore backend/venv/
git check-ignore backend/*.db
```

### 提交代码

```bash
# 添加所有文件
git add .

# 查看将要提交的文件
git status

# 提交（使用清晰的提交信息）
git commit -m "准备部署到 Render/Railway

- 更新后端代码适配生产环境
- 添加前端动态 API 配置
- 添加 Render/Railway 部署配置
- 添加数据库初始化脚本
- 更新部署文档"
```

---

## 📤 推送到 GitHub

### 第一次推送

```bash
# 添加远程仓库
git remote add origin https://github.com/your_username/your_repo.git

# 推送代码
git push -u origin main
```

### 后续更新

```bash
# 提交更改
git add .
git commit -m "描述你的更改"
git push
```

---

## 🎯 Render 部署检查

### 部署前准备

1. **GitHub 仓库**
   - [ ] 代码已推送到 GitHub
   - [ ] 仓库设置为 Public（Private 也行，但 Public 更方便）

2. **Render 账号**
   - [ ] 已注册 [render.com](https://render.com)
   - [ ] 已连接 GitHub 账号

### 部署步骤

1. **创建数据库**
   ```
   Dashboard → New (+) → Database → MySQL
   Name: aichat-mysql
   Database: philosophy_ai
   User: aichat_user
   ```

2. **创建后端服务**
   ```
   Dashboard → New (+) → Web Service
   连接 GitHub 仓库
   Name: aichat-backend
   Environment: Python 3
   Root Directory: backend
   Build Command: pip install -r requirements.txt
   Start Command: gunicorn app:app
   ```

3. **配置环境变量**
   ```
   进入后端服务 → Environment → Add Environment Variable

   FLASK_ENV=production
   FLASK_DEBUG=false
   SECRET_KEY=<生成的随机字符串>
   DB_HOST=<数据库内部地址>
   DB_PORT=3306
   DB_NAME=philosophy_ai
   DB_USER=<数据库用户名>
   DB_PASSWORD=<数据库密码>
   ```

4. **创建前端服务**
   ```
   Dashboard → New (+) → Static Site
   Name: aichat-frontend
   Root Directory: frontend
   Publish Directory: .
   ```

5. **部署后验证**
   - [ ] 后端服务显示绿色（运行中）
   - [ ] 前端服务显示绿色（运行中）
   - [ ] 访问前端 URL，页面正常显示
   - [ ] 控制台显示正确的 API 地址
   - [ ] API 请求正常响应

---

## 🚂 Railway 部署检查

### 部署步骤

1. **创建项目**
   ```
   访问 railway.app
   New Project → Deploy from GitHub repo
   选择你的仓库
   ```

2. **配置服务**
   ```
   点击服务 → Settings
   Root Directory: backend
   Start Command: gunicorn app:app
   ```

3. **添加数据库**
   ```
   New → Database → MySQL
   Railway 自动创建并配置
   ```

4. **配置环境变量**
   ```
   服务 → Variables
   添加与 Render 相同的环境变量
   ```

---

## 🧪 部署后测试

### 功能测试

- [ ] 首页正常加载
- [ ] 哲学家列表页正常显示
- [ ] 作家列表页正常显示
- [ ] 影视角色列表页正常显示
- [ ] API 请求正常（查看 Network 面板）
- [ ] 无 CORS 错误
- [ ] 无 404 错误

### 性能测试

- [ ] 页面加载时间 < 3 秒
- [ ] API 响应时间 < 1 秒
- [ ] 无内存泄漏

### 兼容性测试

- [ ] Chrome 浏览器正常
- [ ] Firefox 浏览器正常
- [ ] Safari 浏览器正常
- [ ] 移动端响应式正常

---

## 📊 监控设置

### 日志监控

- [ ] Render: 查看 Logs 标签
- [ ] Railway: 查看 Logs 面板

### 错误追踪

- [ ] 设置错误通知
- [ ] 配置日志导出

---

## 🔄 回滚计划

如果部署失败，可以：

1. **回滚到之前的版本**
   ```bash
   git revert HEAD
   git push
   ```

2. **切换到稳定的分支**
   ```bash
   git checkout stable
   git push -f origin main
   ```

---

## ✅ 最终确认

在点击部署按钮前，最后确认：

- [ ] 所有本地测试通过
- [ ] 代码已推送到 GitHub
- [ ] 环境变量已配置
- [ ] 数据库脚本已准备
- [ ] 已阅读部署文档
- [ ] 了解如何回滚

---

## 📞 需要帮助？

如果遇到问题：

1. 查看日志：Render Dashboard → Logs
2. 查看文档：`RENDER_RAILWAY_DEPLOY.md`
3. 检查配置：环境变量是否正确
4. 搜索错误：Google 错误信息

---

**准备好部署了吗？**

```bash
# 最后一次检查
git status
git log --oneline -5

# 如果一切正常，推送代码
git push
```

祝部署顺利！🎉
