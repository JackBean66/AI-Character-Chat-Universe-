import psycopg2
import psycopg2.extras
from contextlib import contextmanager
import logging
from config import config

# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class Database:
    """PostgreSQL数据库连接管理器"""

    def __init__(self):
        self.connection_pool = []
        self.max_connections = 10

    @contextmanager
    def get_connection(self):
        """获取数据库连接（上下文管理器）"""
        connection = None
        try:
            # 1. 创建新连接（PostgreSQL）
            connection = psycopg2.connect(
                host=config.DB_HOST,
                port=config.DB_PORT,
                user=config.DB_USER,
                password=config.DB_PASSWORD,
                database=config.DB_NAME,
                cursorfactory=psycopg2.extras.RealDictCursor  # 返回字典格式
            )
            logger.debug("PostgreSQL数据库连接创建成功")

            # 2. 把连接交给调用者使用
            yield connection

        except psycopg2.Error as e:
            logger.error(f"PostgreSQL数据库连接错误: {e}")
            raise
        finally:
            # 3. 无论如何都会执行：关闭连接
            if connection:
                connection.close()
                logger.debug("PostgreSQL数据库连接已关闭")
    
    @contextmanager
    def get_cursor(self, connection=None):
        """获取游标（上下文管理器）"""
        if connection:
            # 情况A：使用外部传入的连接
            cursor = connection.cursor()
            try:
                yield cursor
            finally:
                cursor.close()
        else:
            # 情况B：创建新连接（自动管理）
            with self.get_connection() as conn:
                cursor = conn.cursor()
                try:
                    yield cursor
                    conn.commit()  # 自动提交事务
                except Exception as e:
                    conn.rollback()  # 出错时回滚
                    raise
                finally:
                    cursor.close()

# 创建全局数据库实例
db = Database()