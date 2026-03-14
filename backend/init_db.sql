-- AI角色对话系统 - 数据库初始化脚本
-- 用于创建 philosophers 表和示例数据

-- 创建 philosophers 表
CREATE TABLE IF NOT EXISTS philosophers (
    id INT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    name VARCHAR(100) NOT NULL COMMENT '英文名称',
    chinese_name VARCHAR(100) DEFAULT NULL COMMENT '中文名称',
    era VARCHAR(100) NOT NULL COMMENT '时代/时期',
    period VARCHAR(50) NOT NULL COMMENT '时期分类: ancient,medieval,renaissance,modern,modern_20th,contemporary',
    description TEXT NOT NULL COMMENT '描述/简介',
    image_url VARCHAR(255) DEFAULT NULL COMMENT '图片URL',
    school VARCHAR(100) DEFAULT NULL COMMENT '学派',
    country VARCHAR(100) DEFAULT NULL COMMENT '国家',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    INDEX idx_period (period),
    INDEX idx_era (era)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='哲学家/角色信息表';

-- 插入示例数据（可选）
-- 古代哲学家
INSERT INTO philosophers (name, chinese_name, era, period, description, school, country) VALUES
('Socrates', '苏格拉底', '古希腊（约公元前470-前399）', 'ancient', '西方哲学奠基者，主张"认识你自己"，通过问答法追求真理与美德。', '苏格拉底学派', '古希腊'),
('Plato', '柏拉图', '古希腊（约公元前427-前347）', 'ancient', '创立理念论，认为理念是真实的世界；著有《理想国》，探讨正义与哲学王。', '学院派', '古希腊'),
('Aristotle', '亚里士多德', '古希腊（公元前384-前322）', 'ancient', '百科全书式哲学家，创立逻辑学与形而上学，提出"四因说"与中庸伦理学。', '逍遥学派', '古希腊'),
('Zhuangzi', '庄子', '战国时期', 'ancient', '道家学派代表人物，主张"逍遥"境界，追求精神自由，著有《庄子》。', '道家', '中国'),
('Confucius', '孔子', '春秋时期', 'ancient', '儒家学派创始人，主张"仁义礼智信"，编撰《春秋》，其思想对中国文化影响深远。', '儒家', '中国');

-- 中世纪哲学家
INSERT INTO philosophers (name, chinese_name, era, period, description, school, country) VALUES
('Augustine', '奥古斯丁', '教父哲学（公元354-430）', 'medieval', '融合柏拉图主义与基督教，著有《忏悔录》与《上帝之城》，深刻探讨原罪、恩典与时间。', '基督教哲学', '罗马帝国'),
('Thomas Aquinas', '托马斯·阿奎那', '经院哲学（约1225-1274）', 'medieval', '整合亚里士多德哲学与基督教神学，提出"五路证明"，构建庞大的神学哲学体系。', '经院哲学', '意大利');

-- 文艺复兴哲学家
INSERT INTO philosophers (name, chinese_name, era, period, description, school, country) VALUES
('Niccolò Machiavelli', '马基雅维利', '文艺复兴（1469-1527）', 'renaissance', '现代政治学之父，著有《君主论》，主张政治应脱离道德束缚，现实主义先驱。', '政治现实主义', '意大利'),
('Erasmus', '伊拉斯谟', '文艺复兴北方人文主义（1466-1536）', 'renaissance', '代表作《愚人颂》，批判教会腐败与社会愚昧，倡导人文主义与和平的宗教改革。', '人文主义', '荷兰');

-- 近代哲学家
INSERT INTO philosophers (name, chinese_name, era, period, description, school, country) VALUES
('René Descartes', '笛卡尔', '理性主义（1596-1650）', 'modern', '"近代哲学之父"，提出"我思故我在"，创立理性主义与 Cartesian 坐标系。', '理性主义', '法国'),
('John Locke', '洛克', '经验主义（1632-1704）', 'modern', '经验论奠基人，提出"白板说"，主张知识源于经验；自由主义政治哲学先驱。', '经验主义', '英国'),
('Immanuel Kant', '康德', '德国古典哲学（1724-1804）', 'modern', '发动"哥白尼式革命"，调和理性与经验，著有《纯粹理性批判》，奠定批判哲学。', '德国唯心主义', '德国');

-- 现代哲学家
INSERT INTO philosophers (name, chinese_name, era, period, description, school, country) VALUES
('Karl Marx', '卡尔·马克思', '马克思主义（1818-1883）', 'contemporary', '创立历史唯物主义与剩余价值理论，强调实践与阶级斗争，著作《资本论》。', '马克思主义', '德国'),
('Friedrich Nietzsche', '尼采', '存在主义先驱（1844-1900）', 'contemporary', '宣告"上帝已死"，批判传统道德，提出"权力意志"与"超人哲学"。', '存在主义', '德国'),
('Martin Heidegger', '海德格尔', '现象学与存在主义（1889-1976）', 'contemporary', '探讨"存在"问题，分析"此在"的生存结构，著有《存在与时间》。', '存在主义', '德国');

-- 创建 users 表（用于用户认证）
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY COMMENT '用户ID',
    username VARCHAR(50) UNIQUE NOT NULL COMMENT '用户名',
    password_hash VARCHAR(255) NOT NULL COMMENT '密码哈希',
    name VARCHAR(100) NOT NULL COMMENT '姓名',
    email VARCHAR(100) UNIQUE NOT NULL COMMENT '邮箱',
    role VARCHAR(20) DEFAULT 'user' COMMENT '角色: user/admin',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    INDEX idx_username (username),
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';

-- 插入测试用户（密码都是 'password123' 的哈希值，实际部署时请删除）
INSERT INTO users (username, password_hash, name, email, role) VALUES
('admin', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj9SjKEq7qLe', '系统管理员', 'admin@example.com', 'admin'),
('demo', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj9SjKEq7qLe', '演示用户', 'demo@example.com', 'user');

-- 查看插入的数据
SELECT COUNT(*) as total_philosophers FROM philosophers;
SELECT COUNT(*) as total_users FROM users;
