from pydantic import BaseModel, EmailStr, Field
from typing import Optional

class Token(BaseModel):
    """
    Model for JWT token response.
    """
    access_token: str
    token_type: str

class TokenData(BaseModel):
    """
    Model for token data.
    """
    username: Optional[str] = None

class UserBase(BaseModel):
    """
    Base model for User.
    """
    username: str
    email: EmailStr
    full_name: Optional[str] = None
    disabled: Optional[bool] = None

class UserCreate(UserBase):
    """
    Model for user creation - includes password.
    """
    password: str = Field(..., min_length=8)

class User(UserBase):
    """
    Model for user information returned to client.
    """
    pass

class UserInDB(UserBase):
    """
    Model for user information stored in database.
    """
    hashed_password: str