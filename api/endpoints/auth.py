from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
import logging

# Importér brugermodeller (skal implementeres i api/models/auth.py)
from api.models.auth import UserCreate, UserInDB, User, Token, TokenData

router = APIRouter()

# Opsætning af sikkerhed
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/token")

# I produktion bør disse værdier gemmes sikkert (f.eks. i miljøvariabler)
SECRET_KEY = "din_hemmelige_nøgle_her"  # Skal ændres i produktion!
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Brugere vil i produktionen blive gemt i databasen
# Denne dictionary er kun til demonstration
fake_users_db = {
    "testuser": {
        "username": "testuser",
        "full_name": "Test Bruger",
        "email": "test@example.com",
        "hashed_password": pwd_context.hash("password123"),
        "disabled": False,
    }
}

def verify_password(plain_password, hashed_password):
    """Verificerer om en adgangskode matcher den hashede version."""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    """Genererer en hash af adgangskoden."""
    return pwd_context.hash(password)

def get_user(db, username: str):
    """Henter bruger fra databasen."""
    if username in db:
        user_data = db[username]
        return UserInDB(**user_data)
    return None

def authenticate_user(db, username: str, password: str):
    """Autentificerer en bruger."""
    user = get_user(db, username)
    if not user:
        return False
    if not verify_password(password, user.hashed_password):
        return False
    return user

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Opretter et JWT access token."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme)):
    """Henter den nuværende bruger baseret på JWT token."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Kunne ikke validere legitimationsoplysninger",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = TokenData(username=username)
    except JWTError:
        raise credentials_exception
    user = get_user(fake_users_db, username=token_data.username)
    if user is None:
        raise credentials_exception
    return user

async def get_current_active_user(current_user: User = Depends(get_current_user)):
    """Verificerer at den nuværende bruger er aktiv."""
    if current_user.disabled:
        raise HTTPException(status_code=400, detail="Inaktiv bruger")
    return current_user

@router.post("/token", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    """
    Autentificerer en bruger og returnerer et JWT access token.
    """
    user = authenticate_user(fake_users_db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Forkert brugernavn eller adgangskode",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/register", response_model=User)
async def register_user(user: UserCreate):
    """
    Registrerer en ny bruger.
    I produktion vil dette gemme brugeren i databasen.
    """
    # Check om brugernavn allerede eksisterer
    if user.username in fake_users_db:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Brugernavn eksisterer allerede"
        )
    
    # Opret ny bruger og gem i "database"
    hashed_password = get_password_hash(user.password)
    fake_users_db[user.username] = {
        "username": user.username,
        "email": user.email,
        "full_name": user.full_name,
        "hashed_password": hashed_password,
        "disabled": False
    }
    
    # Returner den oprettede bruger (uden password)
    return {
        "username": user.username,
        "email": user.email,
        "full_name": user.full_name,
        "disabled": False
    }

@router.get("/users/me", response_model=User)
async def read_users_me(current_user: User = Depends(get_current_active_user)):
    """
    Returnerer information om den nuværende autentificerede bruger.
    """
    return current_user