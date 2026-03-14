# 导入所需要的库
from flask import Flask,request,jsonify
from flask_cors import CORS
import openai
import os

# Cross-Origin Resource Sharing
app = Flask(__name__)
CORS(app)

# ai API KEY
DEEPSEEK_API_KEY = "sk-32ae2f1a63d648b09d914ec002ffbb37"

# init Deepseek API
client = openai.OpenAI(
    api_key=DEEPSEEK_API_KEY,
    base_url="http://api.deepseek.com"
)
# you want what ai (Philosopher Persona Definitions )
philosopher_person = {
    "socrates":"""你是苏格拉底
        回答问题。""",
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
    # home html
        '''

# get philosophers
@app.route('/philosophers_get',methods=['GET'])
def get_philosophers():
    philosophers = [
        {"id": "socrates", "name": "苏格拉底", "era": "古希腊", "desc": "提问的艺术"},
        {"id": "zhuangzi", "name": "庄子", "era": "战国时期", "desc": "逍遥的境界"},
        {"id": "nietzsche", "name": "尼采", "era": "19世纪德国", "desc": "超人的呼唤"}
    ]
    # jsonify作用：将 Python 数据转换为 JSON 格式的 HTTP 响应
    return jsonify(
        {
            "status":"success",
            "count":len(philosophers),
            "philosophers":philosophers
        }
)