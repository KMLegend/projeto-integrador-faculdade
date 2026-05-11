from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from sqlalchemy.orm import Session
from core.database import get_db
from core.security import SECRET_KEY, ALGORITHM
from infrastructure.models import Usuario

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")


def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> Usuario:
    """Retorna o usuario autenticado a partir do token JWT."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Credenciais invalidas ou token expirado",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = db.query(Usuario).filter(
        Usuario.email == email,
        Usuario.ativo == True
    ).first()
    if user is None:
        raise credentials_exception
    return user


def require_admin(current_user: Usuario = Depends(get_current_user)) -> Usuario:
    """Permite acesso somente a usuarios do tipo administrador."""
    if current_user.tipo != "administrador":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acesso restrito: apenas administradores podem realizar esta acao",
        )
    return current_user


def require_medico_or_admin(current_user: Usuario = Depends(get_current_user)) -> Usuario:
    """Permite acesso a medicos e administradores."""
    if current_user.tipo not in ("administrador", "medico"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acesso restrito: apenas medicos ou administradores podem realizar esta acao",
        )
    return current_user
