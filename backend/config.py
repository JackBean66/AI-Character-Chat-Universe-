import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    # 数据库配置
    # Mysql配置
    DB_HOST = os.getenv('DB_HOST', 'localhost')
    DB_PORT = int(os.getenv('DB_PORT', 3306))  # 字符串转整数
    DB_NAME = os.getenv('DB_NAME', 'philosophy_db')
    DB_USER = os.getenv('DB_USER', 'philo_user')
    DB_PASSWORD = os.getenv('DB_PASSWORD', 'philo_pass123')
    #Flask配置#TODO
    SECRET_KEY = os.getenv('SECRET_KEY','dev-secret-key')
    DEBUG = os.getenv('FLASK_DEBUG','false').lower() =='true'# 字符串转布尔
    ENV = os.getenv('FLASK_ENV','development')
    # JWT
    JWT_SECRET = os.getenv('JWT_SECRET',SECRET_KEY)
    JWT_EXPIRE_HOURS = int(os.getenv('JWT_EXPIRE_HOURS',24))
    @property#装饰器：把方法变成属性调用
    def mysql_config(self):
        return{
            'host':self.DB_HOST,
            'port':self.DB_PORT,
            'database':self.DB_NAME,
            'user':self.DB_USER,
            'password':self.DB_PASSWORD,
            'charset':'utf8mb4'
        }
# 创建配置实例,创建对象
config = Config()
# 测试配置加载
if __name__ == '__main__':
    print("配置加载测试:")
    print(f"数据库: {config.DB_HOST}:{config.DB_PORT}/{config.DB_NAME}")
    print(f"DEBUG 模式: {config.DEBUG}")
    

    