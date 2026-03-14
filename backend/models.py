from dataclasses import dataclass, asdict
from typing import Optional
from datetime import datetime

@dataclass
class Philosopher:
    """哲学家数据模型"""
    
    # ====== 数据库字段 ======
    id: Optional[int] = None  # 主键，新增时为空
    name: str = ""  # 英文名，必填
    chinese_name: Optional[str] = None  # 中文名，可选
    era: str = ""  # 时代，必填
    period: str = ""  # 时期分类，必填
    description: str = ""  # 描述，必填
    image_url: Optional[str] = None  # 图片URL，可选
    school: Optional[str] = None  # 学派，可选
    country: Optional[str] = None  # 国家，可选
    created_at: Optional[datetime] = None  # 创建时间，自动生成
    
    # ====== 业务方法 ======
    def to_dict(self) -> dict:
        """转换为字典（用于JSON响应）"""
        data = asdict(self)
        
        # 处理特殊类型
        if self.created_at:
            data['created_at'] = self.created_at.isoformat()
        
        # 移除None值（可选）
        data = {k: v for k, v in data.items() if v is not None}
        return data
    
    @classmethod
    def from_dict(cls, data: dict) -> 'Philosopher':
        """从字典创建模型实例"""
        # 处理时间字符串
        if 'created_at' in data and isinstance(data['created_at'], str):
            try:
                data['created_at'] = datetime.fromisoformat(data['created_at'])
            except ValueError:
                data['created_at'] = None
        
        return cls(**data)
    
    def validate(self) -> list:
        """验证数据"""
        errors = []
        
        if not self.name.strip():
            errors.append("姓名不能为空")
        
        if not self.era.strip():
            errors.append("时代不能为空")
            
        if not self.period.strip():
            errors.append("时期不能为空")
            
        if not self.description.strip():
            errors.append("描述不能为空")
            
        if self.period not in ['ancient', 'medieval', 'renaissance', 'modern', 'modern_20th', 'contemporary']:
            errors.append(f"无效的时期: {self.period}")
            
        return errors

# 用户模型
@dataclass
class User:
    """用户数据模型"""
    id: Optional[int] = None
    username: str = ""
    password_hash: str = ""  # 存储哈希值，不是明文密码
    name: str = ""
    email: str = ""
    role: str = "user"  # user 或 admin
    created_at: Optional[datetime] = None