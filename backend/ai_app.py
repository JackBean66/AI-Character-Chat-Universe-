from flask import Flask, jsonify, request
from flask_cors import CORS
from dao import PhilosopherDAO
from models import Philosopher
import logging
from config import config

# 配置日志
logging.basicConfig(
    level=logging.DEBUG if config.DEBUG else logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

app = Flask(__name__)
CORS(app)  # 允许跨域请求

# ====== 辅助函数 ======
def success_response(data=None, message="成功", code=200):
    """成功响应模板"""
    response = {
        "status": "success",
        "message": message,
        "timestamp": datetime.now().isoformat()
    }
    if data is not None:
        response["data"] = data
    return jsonify(response), code

def error_response(message="错误", code=400, details=None):
    """错误响应模板"""
    response = {
        "status": "error",
        "message": message,
        "timestamp": datetime.now().isoformat()
    }
    if details:
        response["details"] = details
    return jsonify(response), code

# ====== API路由 ======

@app.route('/')
def home():
    """首页"""
    return success_response({
        "service": "哲学大师API",
        "version": "1.0.0",
        "endpoints": [
            {"method": "GET", "path": "/api/philosophers", "desc": "所有哲学家"},
            {"method": "GET", "path": "/api/philosophers/<period>", "desc": "按时期获取"},
            {"method": "GET", "path": "/api/search?q=<keyword>", "desc": "搜索哲学家"},
            {"method": "POST", "path": "/api/philosophers", "desc": "创建哲学家"},
            {"method": "PUT", "path": "/api/philosophers/<id>", "desc": "更新哲学家"},
            {"method": "DELETE", "path": "/api/philosophers/<id>", "desc": "删除哲学家"}
        ]
    })

@app.route('/api/philosophers', methods=['GET'])
def get_philosophers():
    """获取所有哲学家"""
    try:
        philosophers = PhilosopherDAO.get_all()
        data = [p.to_dict() for p in philosophers]
        return success_response({
            "count": len(data),
            "philosophers": data
        })
    except Exception as e:
        app.logger.error(f"获取哲学家失败: {e}")
        return error_response("服务器内部错误", 500)

@app.route('/api/philosophers/<period>', methods=['GET'])
def get_philosophers_by_period(period):
    """按时期获取"""
    valid_periods = ['ancient', 'medieval', 'renaissance', 'modern', 'modern_20th', 'contemporary']
    
    if period not in valid_periods:
        return error_response(
            f"无效的时期参数，有效值: {', '.join(valid_periods)}",
            400
        )
    
    try:
        philosophers = PhilosopherDAO.get_by_period(period)
        data = [p.to_dict() for p in philosophers]
        return success_response({
            "period": period,
            "count": len(data),
            "philosophers": data
        })
    except Exception as e:
        app.logger.error(f"获取时期 {period} 的哲学家失败: {e}")
        return error_response("服务器内部错误", 500)

@app.route('/api/search', methods=['GET'])
def search_philosophers():
    """搜索哲学家"""
    keyword = request.args.get('q', '').strip()
    
    if not keyword:
        return error_response("请输入搜索关键词", 400)
    
    if len(keyword) < 2:
        return error_response("关键词至少2个字符", 400)
    
    try:
        philosophers = PhilosopherDAO.search(keyword)
        data = [p.to_dict() for p in philosophers]
        return success_response({
            "keyword": keyword,
            "count": len(data),
            "philosophers": data
        })
    except Exception as e:
        app.logger.error(f"搜索 '{keyword}' 失败: {e}")
        return error_response("服务器内部错误", 500)

@app.route('/api/philosophers', methods=['POST'])
def create_philosopher():
    """创建哲学家（需要管理员权限）"""
    try:
        # 1. 获取请求数据
        data = request.get_json()
        if not data:
            return error_response("请求体不能为空", 400)
        
        # 2. 创建模型对象
        philosopher = Philosopher.from_dict(data)
        
        # 3. 调用DAO创建
        philosopher_id = PhilosopherDAO.create(philosopher)
        if not philosopher_id:
            return error_response("创建失败", 400)
        
        # 4. 返回结果
        return success_response(
            {"id": philosopher_id},
            "哲学家创建成功",
            201
        )
        
    except Exception as e:
        app.logger.error(f"创建哲学家失败: {e}")
        return error_response("创建失败", 500)

@app.route('/api/philosophers/<int:philosopher_id>', methods=['PUT'])
def update_philosopher(philosopher_id):
    """更新哲学家"""
    try:
        data = request.get_json()
        if not data:
            return error_response("请求体不能为空", 400)
        
        # 确保ID一致
        data['id'] = philosopher_id
        philosopher = Philosopher.from_dict(data)
        
        success = PhilosopherDAO.update(philosopher)
        if not success:
            return error_response("哲学家不存在或更新失败", 404)
        
        return success_response(message="更新成功")
        
    except Exception as e:
        app.logger.error(f"更新哲学家失败: {e}")
        return error_response("更新失败", 500)

@app.route('/api/philosophers/<int:philosopher_id>', methods=['DELETE'])
def delete_philosopher(philosopher_id):
    """删除哲学家"""
    try:
        success = PhilosopherDAO.delete(philosopher_id)
        if not success:
            return error_response("哲学家不存在", 404)
        
        return success_response(message="删除成功")
        
    except Exception as e:
        app.logger.error(f"删除哲学家失败: {e}")
        return error_response("删除失败", 500)

# ====== 错误处理 ======
@app.errorhandler(404)
def not_found(error):
    return error_response("接口不存在", 404)

@app.errorhandler(405)
def method_not_allowed(error):
    return error_response("请求方法不允许", 405)

@app.errorhandler(500)
def internal_error(error):
    app.logger.error(f"服务器内部错误: {error}")
    return error_response("服务器内部错误", 500)

# ====== 启动应用 ======
if __name__ == '__main__':
    app.logger.info("🚀 启动哲学大师API服务...")
    app.logger.info(f"📁 数据库: {config.DB_HOST}:{config.DB_PORT}/{config.DB_NAME}")
    app.logger.info(f"🔧 调试模式: {config.DEBUG}")
    
    app.run(
        host='0.0.0.0',  # 允许外部访问
        port=5000,
        debug=config.DEBUG
    )