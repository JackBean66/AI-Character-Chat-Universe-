from database import db
from models import Philosopher
from typing import List, Optional
import logging

logger = logging.getLogger(__name__)

class PhilosopherDAO:
    """哲学家数据访问对象"""
    
    # ====== 查询操作 ======
    
    @staticmethod
    def get_all() -> List[Philosopher]:
        """获取所有哲学家"""
        try:
            with db.get_cursor() as cursor:
                # 1. 编写SQL
                sql = """
                SELECT id, name, chinese_name, era, period, 
                       description, image_url, school, country, created_at
                FROM philosophers
                ORDER BY 
                    CASE period
                        WHEN 'ancient' THEN 1
                        WHEN 'medieval' THEN 2
                        WHEN 'renaissance' THEN 3
                        WHEN 'modern' THEN 4
                        WHEN 'modern_20th' THEN 5
                        WHEN 'contemporary' THEN 6
                        ELSE 7
                    END,
                    era
                """
                
                # 2. 执行查询
                cursor.execute(sql)
                
                # 3. 获取结果
                rows = cursor.fetchall()
                
                # 4. 转换为模型对象
                philosophers = []
                for row in rows:
                    philosopher = Philosopher.from_dict(row)
                    philosophers.append(philosopher)
                
                logger.info(f"获取到 {len(philosophers)} 位哲学家")
                return philosophers
                
        except Exception as e:
            logger.error(f"获取所有哲学家失败: {e}")
            return []
    
    @staticmethod
    def get_by_period(period: str) -> List[Philosopher]:
        """按时期获取哲学家"""
        try:
            with db.get_cursor() as cursor:
                sql = """
                SELECT id, name, chinese_name, era, period, 
                       description, image_url, school, country, created_at
                FROM philosophers
                WHERE period = %s
                ORDER BY era
                """
                
                cursor.execute(sql, (period,))
                rows = cursor.fetchall()
                
                return [Philosopher.from_dict(row) for row in rows]
                
        except Exception as e:
            logger.error(f"获取时期 {period} 的哲学家失败: {e}")
            return []
    
    @staticmethod
    def search(keyword: str) -> List[Philosopher]:
        """搜索哲学家"""
        try:
            with db.get_cursor() as cursor:
                sql = """
                SELECT id, name, chinese_name, era, period, 
                       description, image_url, school, country, created_at
                FROM philosophers
                WHERE name LIKE %s 
                   OR chinese_name LIKE %s 
                   OR description LIKE %s
                   OR era LIKE %s
                ORDER BY period, era
                """
                
                search_term = f"%{keyword}%"
                cursor.execute(sql, (search_term, search_term, search_term, search_term))
                rows = cursor.fetchall()
                
                return [Philosopher.from_dict(row) for row in rows]
                
        except Exception as e:
            logger.error(f"搜索 '{keyword}' 失败: {e}")
            return []
    
    # ====== 增删改操作 ======
    
    @staticmethod
    def create(philosopher: Philosopher) -> Optional[int]:
        """创建哲学家"""
        # 1. 验证数据
        errors = philosopher.validate()
        if errors:
            logger.error(f"数据验证失败: {errors}")
            return None
        
        try:
            with db.get_cursor() as cursor:
                sql = """
                INSERT INTO philosophers 
                (name, chinese_name, era, period, description, image_url, school, country)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                """
                
                cursor.execute(sql, (
                    philosopher.name,
                    philosopher.chinese_name,
                    philosopher.era,
                    philosopher.period,
                    philosopher.description,
                    philosopher.image_url,
                    philosopher.school,
                    philosopher.country
                ))
                
                # 返回新创建的ID
                new_id = cursor.lastrowid
                logger.info(f"创建哲学家成功，ID: {new_id}")
                return new_id
                
        except Exception as e:
            logger.error(f"创建哲学家失败: {e}")
            return None
    
    @staticmethod
    def update(philosopher: Philosopher) -> bool:
        """更新哲学家"""
        if not philosopher.id:
            logger.error("更新失败：缺少ID")
            return False
        
        errors = philosopher.validate()
        if errors:
            logger.error(f"数据验证失败: {errors}")
            return False
        
        try:
            with db.get_cursor() as cursor:
                sql = """
                UPDATE philosophers 
                SET name = %s, chinese_name = %s, era = %s, 
                    period = %s, description = %s, image_url = %s,
                    school = %s, country = %s
                WHERE id = %s
                """
                
                cursor.execute(sql, (
                    philosopher.name,
                    philosopher.chinese_name,
                    philosopher.era,
                    philosopher.period,
                    philosopher.description,
                    philosopher.image_url,
                    philosopher.school,
                    philosopher.country,
                    philosopher.id
                ))
                
                success = cursor.rowcount > 0
                if success:
                    logger.info(f"更新哲学家 {philosopher.id} 成功")
                else:
                    logger.warning(f"哲学家 {philosopher.id} 不存在")
                
                return success
                
        except Exception as e:
            logger.error(f"更新哲学家失败: {e}")
            return False
    
    @staticmethod
    def delete(philosopher_id: int) -> bool:
        """删除哲学家"""
        try:
            with db.get_cursor() as cursor:
                sql = "DELETE FROM philosophers WHERE id = %s"
                cursor.execute(sql, (philosopher_id,))
                
                success = cursor.rowcount > 0
                if success:
                    logger.info(f"删除哲学家 {philosopher_id} 成功")
                else:
                    logger.warning(f"哲学家 {philosopher_id} 不存在")
                
                return success
                
        except Exception as e:
            logger.error(f"删除哲学家失败: {e}")
            return False