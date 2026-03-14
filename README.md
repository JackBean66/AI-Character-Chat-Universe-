# AI角色对话系统

> 一个基于 Flask + MySQL 的全栈 Web 应用，支持用户与哲学家、作家、影视角色进行深度对话。

## 项目简介

本项目是一个人工智能角色对话系统，支持用户与不同领域的角色进行沉浸式对话体验，包括：

- **🎭 哲学家对话** - 与古今中外的伟大哲学家进行深度对话
- **📚 作家作品对话** - 与经典文学作品的作者进行交流
- **🎬 影视角色对话** - 与经典影视作品中的角色互动

系统采用前后端分离架构，提供完整的用户认证、对话管理和数据持久化功能。

### 核心功能

- **AI角色对话** - 支持哲学家、作家、影视角色三大类对话
- **用户认证** - 完整的登录/注册功能，支持 JWT 身份验证
- **对话历史** - 本地存储对话记录，支持历史回溯
- **角色分类** - 按时期、类型、作品等多维度分类展示
- **数据管理** - RESTful API 支持角色数据的增删改查

## 技术栈

### 后端
- **Flask** 2.3.3 - Python Web 框架
- **MySQL** - 关系型数据库
- **PyMySQL** - 数据库连接驱动
- **JWT** - JSON Web Token 身份验证
- **bcrypt** - 密码加密
- **python-dotenv** - 环境变量管理

### 前端
- **原生 HTML/CSS/JavaScript** - 无框架依赖
- **Font Awesome** - 图标库
- **LocalStorage API** - 本地数据持久化

## 项目结构

```
.
├── backend/                    # 后端目录
│   ├── app.py                 # 主应用（用户认证API）
│   ├── ai_app.py              # AI对话应用
│   ├── aichat_login_app.py    # 登录应用
│   ├── config.py              # 配置管理
│   ├── dao.py                 # 数据访问对象
│   ├── models.py              # 数据模型
│   ├── database.py            # 数据库连接管理
│   ├── requirements.txt       # Python依赖
│   ├── .env                   # 环境变量配置
│   └── users.db               # SQLite数据库（可选）
│
├── frontend/                   # 前端目录
│   ├── login.html             # 简易登录页
│   ├── login.js               # 登录逻辑
│   ├── index.html             # 哲学家对话主页
│   ├── aichat_login.html      # 完整登录页
│   ├── aichat_login.css       # 登录页样式
│   ├── aichat_root.html       # 系统首页（三大类入口）
│   ├── aichat_philosophers.html # 哲学家列表页
│   ├── aichat_write.html      # 作家作品列表页
│   ├── aichat_move.html       # 影视角色列表页
│   ├── aichat_profile.html    # 用户资料页
│   ├── aichat_profile.js      # 资料逻辑
│   ├── aichat_help.html       # 帮助页面
│   ├── chat.js                # 对话逻辑
│   ├── style.css              # 通用样式
│   └── my_imgs/               # 图片资源目录
│
└── README.md                   # 项目文档
```

## 快速开始

### 环境要求

- Python 3.7+
- MySQL 5.7+
- 现代浏览器（Chrome/Firefox/Edge）

### 后端设置

1. **克隆项目**

```bash
cd backend
```

2. **安装依赖**

```bash
pip install -r requirements.txt
```

3. **配置数据库**

创建 MySQL 数据库：

```sql
CREATE DATABASE philosophy_ai CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

4. **配置环境变量**

编辑 `.env` 文件：

```env
# 数据库配置
DB_HOST=localhost
DB_NAME=philosophy_ai
DB_USER=root
DB_PASSWORD=your_password

# JWT密钥
SECRET_KEY=your-secret-key-change-in-production
```

5. **初始化数据表**

运行 `app.py` 会自动创建 `users` 表：

```bash
python app.py
```

6. **启动后端服务**

```bash
python app.py
# 或
python ai_app.py
```

后端服务将运行在 `http://localhost:5000`

### 前端设置

1. **使用 Live Server**

在 VSCode 中安装 "Live Server" 扩展，然后右键 `index.html` 选择 "Open with Live Server"

2. **直接打开**

直接在浏览器中打开 `frontend/index.html`

## API 接口文档

### 用户认证

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/login` | 用户登录 |
| GET | `/api/protected` | 受保护的路由（需认证） |

### 哲学家管理

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/philosophers` | 获取所有哲学家 |
| GET | `/api/philosophers/<period>` | 按时期获取哲学家 |
| GET | `/api/search?q=<keyword>` | 搜索哲学家 |
| POST | `/api/philosophers` | 创建哲学家 |
| PUT | `/api/philosophers/<id>` | 更新哲学家 |
| DELETE | `/api/philosophers/<id>` | 删除哲学家 |

### 对话接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/philosophers` | 获取哲学家列表 |
| POST | `/chat` | 发送对话消息 |

## 数据模型

### Philosopher（哲学家）

```python
{
    "id": int,              # 主键
    "name": str,            # 英文名
    "chinese_name": str,    # 中文名
    "era": str,             # 时代
    "period": str,          # 时期分类
    "description": str,     # 描述
    "image_url": str,       # 图片URL
    "school": str,          # 学派
    "country": str,         # 国家
    "created_at": datetime  # 创建时间
}
```

### User（用户）

```python
{
    "id": int,
    "username": str,
    "password_hash": str,   # 哈希密码
    "name": str,
    "email": str,
    "role": str,            # user/admin
    "created_at": datetime
}
```

## 支持的角色

### 🎭 哲学家对话

按历史时期分类：

- **古代哲学**（约公元前7世纪 — 公元5世纪）
  - 苏格拉底、柏拉图、亚里士多德、伊壁鸠鲁、马可·奥勒留

- **中世纪哲学**（约5世纪 — 14世纪）
  - 奥古斯丁、托马斯·阿奎那、安瑟伦、伊本·西那、奥卡姆的威廉

- **文艺复兴哲学**（约14世纪 — 16世纪）
  - 伊拉斯谟、马基雅维利、托马斯·莫尔、乔尔丹诺·布鲁诺、蒙田

- **近代哲学**（17世纪 — 19世纪初）
  - 笛卡尔、斯宾诺莎、洛克、休谟、康德

- **现代哲学**（19世纪中期 — 20世纪中期）
  - 卡尔·马克思、尼采、伯特兰·罗素、海德格尔

### 📚 作家作品对话

按文学类型分类：

- **中国经典文学**
  - 曹雪芹、余华、史铁生、三毛、余秋雨

- **科幻文学**
  - 刘慈欣、艾萨克·阿西莫夫、威廉·吉布森、弗兰克·赫伯特、乔治·奥威尔

- **侦探悬疑**
  - 阿加莎·克里斯蒂、阿瑟·柯南·道尔、雷蒙德·钱德勒、东野圭吾、丹·布朗

- **经典名著**
  - 列夫·托尔斯泰、加西亚·马尔克斯、维克多·雨果、简·奥斯汀、司汤达、詹姆斯·乔伊斯

- **现代文学**
  - 村上春树、米兰·昆德拉、卡勒德·胡赛尼、玛格丽特·阿特伍德、安托万·德·圣埃克苏佩里

### 🎬 影视角色对话

按影视作品分类：

- **美剧系列**
  - 《绝命毒师》：沃尔特·怀特、杰西·平克曼、古斯塔沃·弗林、汉克·施拉德、索尔·古德曼
  - 《风骚律师》：吉米·麦吉尔、金·韦克斯勒、查克·麦吉尔

- **国产剧集**
  - 《隐秘的角落》：张东升、朱朝阳、严良

- **电影作品**
  - 《切尔诺贝利》：瓦列里·列加索夫
  - 《加勒比海盗》：杰克·斯帕罗、威尔·特纳、伊丽莎白·斯旺
  - 《银翼杀手》：瑞克·戴克、罗伊·贝蒂、K（乔）
  - 《星际穿越》：库珀、墨菲、布兰德教授
  - 《杀人回忆》：朴斗满、苏泰允
  - 《哈利·波特》：哈利·波特、赫敏、罗恩、邓布利多、斯内普、伏地魔
  - 《流浪地球1/2》：刘培强、刘启、图恒宇、周喆直
  - 《霸王别姬》：程蝶衣、段小楼
  - 《我不是药神》：程勇、吕受益
  - 《周处除三害》：陈桂林

- **其他系列**
  - 《黄飞鸿系列》：黄飞鸿、十三姨
  - 《宇宙探索编辑部》：唐志军、秦彩蓉
  - 《憨豆先生》：憨豆先生
  - 《安德的游戏》：安德·维京

## 开发说明

### 配置管理

项目使用 `python-dotenv` 管理环境变量，所有敏感信息应存储在 `.env` 文件中。

### 数据库设计

 philosophers 表结构：

```sql
CREATE TABLE philosophers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    chinese_name VARCHAR(100),
    era VARCHAR(100) NOT NULL,
    period VARCHAR(50) NOT NULL,
    description TEXT,
    image_url VARCHAR(255),
    school VARCHAR(100),
    country VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 安全建议

1. 生产环境务必修改 `SECRET_KEY`
2. 使用 HTTPS 协议
3. 实施 CORS 策略限制
4. 定期更新依赖包

## 常见问题

**Q: 后端启动失败？**
A: 检查 MySQL 服务是否运行，确认 `.env` 配置正确

**Q: 前端无法连接后端？**
A: 确认后端运行在 `http://localhost:5000`，检查 CORS 配置

**Q: 登录后无法跳转？**
A: 确保有 `dashboard.html` 页面，或修改跳转路径

## 许可证

本项目为学习用途，请遵守相关法律法规。

## 作者

24213020470138 + 杨琳

## 更新日志

- **v1.0.0** - 初始版本，实现基础对话和用户认证功能
