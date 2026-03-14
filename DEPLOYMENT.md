# AI角色对话系统 - 部署上线指南

本文档提供多种部署方案，适合不同的需求和预算。

## 📋 部署方案对比

| 方案 | 难度 | 成本 | 适用场景 |
|------|------|------|----------|
| **传统VPS部署** | ⭐⭐⭐ | $5-20/月 | 完全控制，适合长期运行 |
| **Render/ Railway** | ⭐⭐ | 免费-$20/月 | 快速部署，适合演示 |
| **Docker部署** | ⭐⭐⭐⭐ | $5-20/月 | 专业环境，便于扩展 |
| **腾讯云/阿里云** | ⭐⭐ | ¥50-200/月 | 国内用户访问快 |

---

## 方案一：云服务器部署（推荐新手）

### 1.1 购买云服务器

推荐选择：
- **腾讯云轻量应用服务器** - 2核2G，约 ¥50/月
- **阿里云ECS** - 1核2G，约 ¥60/月
- **Vultr** - 海外服务器，$5/月

### 1.2 服务器环境配置

```bash
# SSH连接服务器
ssh root@your_server_ip

# 更新系统
apt update && apt upgrade -y

# 安装必要软件
apt install -y python3 python3-pip nginx mysql-server git

# 安装 pipenv（Python虚拟环境管理）
pip3 install pipenv
```

### 1.3 上传项目代码

```bash
# 方式1：使用 git clone
cd /var/www
git clone https://github.com/your_username/your_repo.git aichat

# 方式2：使用 scp 上传（本地执行）
scp -r D:\24213020470138+杨琳\24213020470138+杨琳+期末代码 root@your_server_ip:/var/www/aichat
```

### 1.4 配置 MySQL 数据库

```bash
# 登录 MySQL
mysql -u root -p

# 创建数据库和用户
CREATE DATABASE philosophy_ai CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'aichat_user'@'localhost' IDENTIFIED BY 'your_secure_password';
GRANT ALL PRIVILEGES ON philosophy_ai.* TO 'aichat_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 1.5 配置后端环境

```bash
# 进入后端目录
cd /var/www/aichat/backend

# 创建虚拟环境
python3 -m venv venv
source venv/bin/activate

# 安装依赖
pip install -r requirements.txt

# 配置环境变量
nano .env
```

在 `.env` 文件中填写：

```env
# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_NAME=philosophy_ai
DB_USER=aichat_user
DB_PASSWORD=your_secure_password

# Flask配置
SECRET_KEY=your_random_secret_key_here_32_chars
FLASK_DEBUG=false
FLASK_ENV=production

# JWT配置
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE_HOURS=24
```

生成安全的密钥：

```bash
python3 -c "import secrets; print(secrets.token_urlsafe(32))"
```

### 1.6 安装 Gunicorn（生产级服务器）

```bash
pip install gunicorn

# 测试运行
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

### 1.7 配置 Nginx 反向代理

```bash
nano /etc/nginx/sites-available/aichat
```

添加以下配置：

```nginx
server {
    listen 80;
    server_name your_domain.com;

    # 前端静态文件
    location / {
        root /var/www/aichat/frontend;
        index aichat_root.html index.html;
        try_files $uri $uri/ /index.html;
    }

    # 后端 API
    location /api {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # 静态资源缓存
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

启用配置：

```bash
ln -s /etc/nginx/sites-available/aichat /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

### 1.8 配置 Systemd 服务（后端自动运行）

```bash
nano /etc/systemd/system/aichat.service
```

添加以下内容：

```ini
[Unit]
Description=AI Chat System Backend
After=network.target mysql.service

[Service]
User=www-data
Group=www-data
WorkingDirectory=/var/www/aichat/backend
Environment="PATH=/var/www/aichat/backend/venv/bin"
ExecStart=/var/www/aichat/backend/venv/bin/gunicorn -w 4 -b 127.0.0.1:5000 app:app
Restart=always

[Install]
WantedBy=multi-user.target
```

启动服务：

```bash
systemctl daemon-reload
systemctl start aichat
systemctl enable aichat
systemctl status aichat
```

---

## 方案二：PaaS 平台部署（免费/低成本）

### 2.1 Render.com 部署（推荐）

**后端部署：**

1. 将代码推送到 GitHub
2. 访问 [Render.com](https://render.com)
3. 点击 "New +" → "Web Service"
4. 连接 GitHub 仓库
5. 配置如下：

```yaml
Environment: Python 3
Build Command: pip install -r requirements.txt
Start Command: gunicorn app:app
```

环境变量（在 Render 控制面板设置）：

```env
DB_HOST=your_mysql_host
DB_PORT=3306
DB_NAME=render_db_name
DB_USER=render_db_user
DB_PASSWORD=render_db_password
SECRET_KEY=your_secret_key
FLASK_DEBUG=false
FLASK_ENV=production
```

**前端部署（静态站点）：**

1. 在 Render 创建 "Static Site"
2. 连接同一个仓库
3. 设置根目录为 `frontend`
4. 构建命令留空

**数据库：**

在 Render 创建 "MySQL" 数据库服务，自动获取连接信息。

### 2.2 Railway 部署

1. 访问 [Railway.app](https://railway.app)
2. 点击 "New Project" → "Deploy from GitHub repo"
3. Railway 会自动检测 Python 项目
4. 添加 MySQL 插件
5. 配置环境变量

### 2.3 腾讯云 CloudBase

国内用户推荐：

1. 访问 [腾讯云 CloudBase](https://cloudbase.net)
2. 创建 "Web 应用"
3. 上传代码或连接 Git
4. 自动部署

---

## 方案三：Docker 部署（专业方案）

### 3.1 创建 Dockerfile

在项目根目录创建 `Dockerfile`：

```dockerfile
# 后端 Dockerfile
FROM python:3.9-slim

WORKDIR /app

COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/ .

EXPOSE 5000

CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:5000", "app:app"]
```

### 3.2 创建 docker-compose.yml

```yaml
version: '3.8'

services:
  mysql:
    image: mysql:8.0
    container_name: aichat_mysql
    environment:
      MYSQL_ROOT_PASSWORD: root_password
      MYSQL_DATABASE: philosophy_ai
      MYSQL_USER: aichat_user
      MYSQL_PASSWORD: aichat_password
    volumes:
      - mysql_data:/var/lib/mysql
    ports:
      - "3306:3306"

  backend:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: aichat_backend
    environment:
      DB_HOST: mysql
      DB_PORT: 3306
      DB_NAME: philosophy_ai
      DB_USER: aichat_user
      DB_PASSWORD: aichat_password
      SECRET_KEY: your_secret_key
      FLASK_DEBUG: "false"
    depends_on:
      - mysql
    ports:
      - "5000:5000"

  nginx:
    image: nginx:alpine
    container_name: aichat_nginx
    volumes:
      - ./frontend:/usr/share/nginx/html
      - ./nginx.conf:/etc/nginx/conf.d/default.conf
    ports:
      - "80:80"
    depends_on:
      - backend

volumes:
  mysql_data:
```

### 3.3 部署命令

```bash
# 构建并启动
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```

---

## 方案四：使用 AI 对话 API

如果您希望使用真实的 AI 对话功能，需要配置 AI API：

### OpenAI API 配置

```bash
# 安装 OpenAI SDK
pip install openai

# 在 .env 添加
OPENAI_API_KEY=sk-your-api-key-here
OPENAI_MODEL=gpt-3.5-turbo
```

### DeepSeek API（国内推荐）

```bash
# 安装
pip install openai

# 在 .env 添加
OPENAI_API_BASE=https://api.deepseek.com/v1
OPENAI_API_KEY=your_deepseek_key
OPENAI_MODEL=deepseek-chat
```

### 对话代码示例

```python
from openai import OpenAI
import os

client = OpenAI(
    api_key=os.getenv('OPENAI_API_KEY'),
    base_url=os.getenv('OPENAI_API_BASE', 'https://api.openai.com/v1')
)

def chat_with_character(character_name, user_message, character_prompt):
    """与角色对话"""
    messages = [
        {"role": "system", "content": f"你是{character_name}。{character_prompt}"},
        {"role": "user", "content": user_message}
    ]

    response = client.chat.completions.create(
        model=os.getenv('OPENAI_MODEL', 'gpt-3.5-turbo'),
        messages=messages,
        temperature=0.8,
        max_tokens=1000
    )

    return response.choices[0].message.content
```

---

## 域名和 SSL 配置

### 购买域名

- 阿里云：万网、阿里云 DNS
- 腾讯云：DNSPod
- Cloudflare：免费 DNS 服务

### 配置 DNS 解析

```
类型    主机记录    记录值                TTL
A       @          your_server_ip        600
A       www        your_server_ip        600
```

### 申请免费 SSL 证书（Let's Encrypt）

```bash
# 安装 Certbot
apt install certbot python3-certbot-nginx

# 自动配置 Nginx SSL
certbot --nginx -d your_domain.com -d www.your_domain.com

# 自动续期
certbot renew --dry-run
```

Nginx 会自动更新配置，启用 HTTPS。

---

## 部署检查清单

部署前请确认：

- [ ] 修改了所有默认密码
- [ ] 配置了生产环境的 SECRET_KEY
- [ ] 关闭了 DEBUG 模式
- [ ] 配置了正确的数据库连接
- [ ] 前端 API 地址指向生产域名
- [ ] 配置了 CORS 允许的域名
- [ ] 设置了防火墙规则（只开放 80/443 端口）
- [ ] 配置了日志记录
- [ ] 设置了自动备份

---

## 性能优化建议

### 后端优化

```python
# 使用缓存（Redis）
from flask_caching import Cache

cache = Cache(config={'CACHE_TYPE': 'RedisCache', 'CACHE_REDIS_URL': 'redis://localhost:6379/0'})

@app.route('/api/philosophers')
@cache.cached(timeout=3600)  # 缓存1小时
def get_philosophers():
    ...
```

### 前端优化

- 压缩图片资源
- 使用 CDN 加速静态资源
- 启用 Gzip 压缩

---

## 监控和维护

### 日志管理

```bash
# 查看应用日志
journalctl -u aichat -f

# Nginx 访问日志
tail -f /var/log/nginx/access.log

# 错误日志
tail -f /var/log/nginx/error.log
```

### 数据库备份

```bash
# 创建备份脚本
nano /root/backup.sh
```

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
mysqldump -u aichat_user -p'password' philosophy_ai > /backup/db_$DATE.sql
# 删除7天前的备份
find /backup -name "db_*.sql" -mtime +7 -delete
```

添加定时任务：

```bash
crontab -e

# 每天凌晨3点备份
0 3 * * * /root/backup.sh
```

---

## 常见问题排查

### 问题1：502 Bad Gateway

```bash
# 检查后端是否运行
systemctl status aichat

# 检查端口是否监听
netstat -tlnp | grep 5000
```

### 问题2：数据库连接失败

```bash
# 检查 MySQL 状态
systemctl status mysql

# 检查数据库权限
mysql -u aichat_user -p
```

### 问题3：前端无法访问 API

检查 CORS 配置和 API 地址是否正确。

---

## 费用估算

| 服务 | 配置 | 月费 |
|------|------|------|
| 腾讯云轻量服务器 | 2核2G | ¥50 |
| 阿里云ECS | 1核2G | ¥60 |
| Vultr | 1核1G | $5 |
| Render | 免费套餐 | $0 |
| Railway | 免费套餐 | $0 |
| 域名 | .com | ¥60/年 |

---

## 下一步

部署完成后，您可以：

1. 配置 AI API 实现真实对话
2. 添加更多角色和内容
3. 优化用户体验和性能
4. 添加用户反馈系统
5. 实现数据分析和统计

祝部署顺利！🚀
