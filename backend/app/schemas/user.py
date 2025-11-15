from pydantic import BaseModel, EmailStr, field_validator
from datetime import datetime


class UserBase(BaseModel):
    """Schema base para usuário"""
    email: EmailStr
    
    @field_validator("email")
    @classmethod
    def normalize_email(cls, email: str) -> str:
        """Normaliza o email para lowercase e remove espaços"""
        return email.strip().lower()


class UserCreate(UserBase):
    """Schema para criação de usuário"""
    password: str
    
    @field_validator("password")
    @classmethod
    def validate_password(cls, password: str) -> str:
        """Valida complexidade da senha"""
        if len(password) < 8:
            raise ValueError("Senha deve ter no mínimo 8 caracteres.")
        if not any(char.isdigit() for char in password):
            raise ValueError("Senha deve ter no mínimo 1 número.")
        if not any(char.isupper() for char in password):
            raise ValueError("Senha deve ter no mínimo 1 letra maiúscula.")
        if not any(char in ["!", "@", "#", "$", "%", "&", "*"] for char in password):
            raise ValueError("Senha deve ter no mínimo 1 caractere especial (!@#$%&*).")
        return password


class UserResponse(UserBase):
    """Schema de resposta de usuário"""
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True
