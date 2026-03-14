from flask import Flask, request, jsonify
from flask_cors import CORS
import openai
import os
from dotenv import load_dotenv#是什么意思
import pymysql
from config import config
from contextlib import contextmanager
import logging

app = Flask(__name__)
CORS(app)


# --- 重要：在这里填入你的DeepSeek API Key ================================
DEEPSEEK_API_KEY = "sk-32ae2f1a63d648b09d914ec002ffbb37"  # ← 替换这里！

# 配置DeepSeek API
client = openai.OpenAI(
    api_key=DEEPSEEK_API_KEY,
    base_url="https://api.deepseek.com"
)

# 哲学家人格定义（更详细）
philosopher_profiles = {
    "socrates": """你是苏格拉底，古希腊哲学家。你的教学方法是"助产术"（诘问法）。
你从不直接给出答案，而是通过不断提问引导对方发现自己认知中的矛盾。
你生活在公元前5世纪的雅典，不知道现代科技。
你说话温和但充满智慧，总是以问题回应问题。""",
    
    "zhuangzi": """你是庄子，战国时期道家思想的代表人物。
你的思想核心是"齐物"、"逍遥"与"无为"。
你善于用寓言（如庄周梦蝶、庖丁解牛）和比喻来阐述道理。
你幽默、洒脱，语言富有诗意。你生活在战国时代，不知道后世的事物。""",
    
    "nietzsche": """你是弗里德里希·尼采，德国哲学家。
你的核心思想包括"上帝已死"、"超人哲学"、"权力意志"和"永恒轮回"。
你言辞犀利、充满激情，喜欢用格言和悖论式的表达。
你批判传统道德，强调生命力的张扬。你生活在19世纪。"""
}

@app.route('/')
def home():
    return '''
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>哲学家AI对话系统</title>
        <style>
            body { font-family: Arial, sans-serif; max-width: 800px; margin: 40px auto; padding: 20px; }
            h1 { color: #333; }
            .api-test { background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0; }
            code { background: #eee; padding: 2px 5px; }
        </style>
    </head>
    <body>
        <h1>🧠 哲学家AI对话系统</h1>
        <p>✅ 后端服务运行正常！</p>
        
        <div class="api-test">
            <h3>📚 API 接口</h3>
            <p><strong>GET</strong> <a href="/philosophers">/philosophers</a> - 获取哲学家列表</p>
            <p><strong>POST</strong> /chat - 与哲学家对话</p>
            
            <h4>对话请求示例：</h4>
            <code>curl -X POST http://localhost:5000/chat \\
                 -H "Content-Type: application/json" \\
                 -d '{"philosopher": "socrates", "message": "什么是美德？"}'</code>
        </div>
        
        <p>🔄 使用说明：选择哲学家，发送消息即可开始对话</p>
        <p>⚙️ 技术栈：Flask + OpenAI API + DeepSeek模型</p>
    </body>
    </html>
    '''

@app.route('/philosophers', methods=['GET'])
def get_philosophers():
    philosophers = [
        {"id": "socrates", "name": "苏格拉底", "era": "古希腊", "desc": "提问的艺术"},
        {"id": "zhuangzi", "name": "庄子", "era": "战国时期", "desc": "逍遥的境界"},
        {"id": "nietzsche", "name": "尼采", "era": "19世纪德国", "desc": "超人的呼唤"}
    ]
    return jsonify({
        "status": "success",
        "count": len(philosophers),
        "philosophers": philosophers
    })

# 发送消息
@app.route('/chat', methods=['POST'])
def chat_with_philosopher():
    try:
        # 请求数据  # 1. 接收前端请求
        data = request.json
        if not data:
            return jsonify({"error": "请求体不能为空"}), 400
            # 2. 处理数据   
        philosopher = data.get('philosopher', 'socrates')
        # 从请求数据中获取用户消息，并去除两端空白字符
        user_message = data.get('message', '').strip()
        
        if not user_message:
            return jsonify({"error": "消息不能为空"}), 400
        # 获取系统提示词
        system_prompt = philosopher_profiles.get(philosopher)
        if not system_prompt:
            return jsonify({"error": "未知的哲学家"}), 400
        
        print(f"💭 用户向 {philosopher} 提问: {user_message}")
        
        # 调用DeepSeek API
        response = client.chat.completions.create(
            model="deepseek-chat",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_message}
            ],
            temperature=0.7,
            max_tokens=500
            # 限制ai回答的字数
        )
        
        ai_reply = response.choices[0].message.content
        print(f"🤖 {philosopher} 回复: {ai_reply[:50]}...")
         # 4. 返回JSON响应给前端 ✅
        return jsonify({
            "status": "success",
            "philosopher": philosopher,
            "reply": ai_reply,
            "tokens_used": response.usage.total_tokens
        })
        
    except openai.APIConnectionError as e:
        return jsonify({"error": f"API连接失败: {str(e)}"}), 500
    except openai.RateLimitError as e:
        return jsonify({"error": "API请求超限，请稍后再试"}), 429
    except openai.AuthenticationError as e:
        return jsonify({"error": "API密钥无效或过期"}), 401
    except Exception as e:
        return jsonify({"error": f"服务器错误: {str(e)}"}), 500

if __name__ == '__main__':
    print("=" * 60)
    print("🧠 哲学家AI对话系统启动成功！")
    print("📍 本地地址: http://localhost:5000")
    print("📚 获取哲学家: GET http://localhost:5000/philosophers")
    print("💬 对话接口: POST http://localhost:5000/chat")
    print("🔑 API Key状态: " + ("✅ 已设置" if DEEPSEEK_API_KEY and DEEPSEEK_API_KEY != "sk-1234567890abcdef1234567890abcdef" else "❌ 需要设置"))
    print("=" * 60)
    
    # 检查API Key
    if DEEPSEEK_API_KEY == "sk-1234567890abcdef1234567890abcdef":
        print("⚠️  警告：请先在代码中填入你的DeepSeek API Key！")
        print("   1. 访问 https://platform.deepseek.com")
        print("   2. 获取API Key")
        print("   3. 编辑app.py，替换第12行的API Key")
        print()
    
    app.run(debug=True, host='0.0.0.0', port=5000)