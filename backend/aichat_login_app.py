from flask import Flask, jsonify, request
from flask_cors import CORS
import pymysql
import pymysql.cursors

app = Flask(__name__)
CORS(app, supports_credentials=True)

# 数据库配置
DB_CONFIG = {
    'host': 'localhost',
    'database': 'philosophy_ai',
    'user': 'root',
    'password': '',
    'charset': 'utf8mb4',
    'cursorclass': pymysql.cursors.DictCursor,
    'autocommit': True
}

def get_db():
    return pymysql.connect(**DB_CONFIG)

@app.route('/api/auth/login', methods=['POST'])
def login():
    print("🔍 收到登录请求")
    
    try:
        data = request.get_json()
        username = data.get('username', '').strip()
        password = data.get('password', '').strip()
        
        print(f"用户名: {username}, 密码: {password}")
        
        if not username or not password:
            return jsonify({"status": "error", "error": "用户名和密码不能为空"})
        
        db = get_db()
        cursor = db.cursor()
        
        # 查询用户
        cursor.execute('''
            SELECT id, username, email, full_name, password 
            FROM users 
            WHERE username = %s OR email = %s
        ''', (username, username))
        
        user = cursor.fetchone()
        cursor.close()
        db.close()
        
        if not user:
            print("❌ 用户不存在")
            return jsonify({"status": "error", "error": "用户不存在"})
        
        print(f"✅ 找到用户: {user['username']}")
        print(f"🔑 数据库密码: {user['password']}")
        
        # 直接比较密码
        if password != user['password']:
            print(f"❌ 密码不匹配")
            return jsonify({"status": "error", "error": "密码错误"})
        
        # 移除密码字段
        user.pop('password', None)
        
        print(f"✅ 登录成功: {user}")
        
        return jsonify({
            "status": "success",
            "message": "登录成功",
            "token": f"simple_token_{user['id']}",
            "user": user
        })
        
    except Exception as e:
        print(f"❌ 错误: {e}")
        return jsonify({"status": "error", "error": str(e)})

@app.route('/api/test_db', methods=['GET'])
def test_db():
    """测试数据库连接"""
    try:
        db = get_db()
        cursor = db.cursor()
        cursor.execute("SELECT COUNT(*) as count FROM users")
        result = cursor.fetchone()
        cursor.close()
        db.close()
        
        return jsonify({
            "status": "success",
            "message": f"数据库连接正常，共有 {result['count']} 个用户",
            "timestamp": "现在"
        })
    except Exception as e:
        return jsonify({"status": "error", "error": str(e)})
@app.route('/api/auth/register', methods=['POST'])
def register():
    print("🔍 收到注册请求")
    
    try:
        data = request.get_json()
        username = data.get('username', '').strip()
        password = data.get('password', '').strip()
        email = data.get('email', '').strip()
        full_name = data.get('full_name', '').strip()
        
        print(f"注册信息 - 用户名: {username}, 邮箱: {email}, 姓名: {full_name}")
        
        # 验证输入
        if not username or not password:
            return jsonify({"status": "error", "error": "用户名和密码不能为空"})
        
        if len(username) < 3 or len(username) > 20:
            return jsonify({"status": "error", "error": "用户名长度必须在3-20位之间"})
        
        if len(password) < 6:
            return jsonify({"status": "error", "error": "密码长度至少6位"})
        
        if email and '@' not in email:
            return jsonify({"status": "error", "error": "邮箱格式不正确"})
        
        db = get_db()
        cursor = db.cursor()
        
        # 检查用户名是否已存在
        cursor.execute('SELECT id FROM users WHERE username = %s', (username,))
        if cursor.fetchone():
            cursor.close()
            db.close()
            return jsonify({"status": "error", "error": "用户名已存在"})
        
        # 检查邮箱是否已存在
        if email:
            cursor.execute('SELECT id FROM users WHERE email = %s', (email,))
            if cursor.fetchone():
                cursor.close()
                db.close()
                return jsonify({"status": "error", "error": "邮箱已被注册"})
        
        # 插入新用户
        cursor.execute('''
            INSERT INTO users (username, password, email, full_name, created_at, updated_at)
            VALUES (%s, %s, %s, %s, NOW(), NOW())
        ''', (username, password, email, full_name))
        
        user_id = cursor.lastrowid
        
        # 获取刚创建的用户信息
        cursor.execute('''
            SELECT id, username, email, full_name 
            FROM users 
            WHERE id = %s
        ''', (user_id,))
        
        new_user = cursor.fetchone()
        
        db.commit()
        cursor.close()
        db.close()
        
        print(f"✅ 注册成功: {new_user}")
        
        return jsonify({
            "status": "success",
            "message": "注册成功",
            "token": f"simple_token_{new_user['id']}",
            "user": new_user
        })
        
    except Exception as e:
        print(f"❌ 注册错误: {e}")
        return jsonify({"status": "error", "error": str(e)})

if __name__ == '__main__':
    print("🚀 启动后端服务...")
    print("📍 地址: http://localhost:5000")
    print("🔗 登录接口: POST /api/auth/login")
    print("🔗 测试接口: GET /api/test_db")
    print("🔑 测试账号: testuser / password123")
    app.run(debug=True, port=5000)