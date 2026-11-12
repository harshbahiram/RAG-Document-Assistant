
from functools import lru_cache
from uuid import UUID

import jwt
from jwt import PyJWKClient
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.core.config import SUPABASE_URL, SUPABASE_JWKS_URL


bearer_scheme = HTTPBearer(auto_error=False)


@lru_cache
def get_jwks_client():
    return PyJWKClient(
        SUPABASE_JWKS_URL,
        cache_keys=True,
        lifespan=3600,
        timeout=10,
    )


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
) -> UUID:

    unauthorized = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or expired authentication token.",
        headers={"WWW-Authenticate": "Bearer"},
    )

    if credentials is None or credentials.scheme.lower() != "bearer":
        raise unauthorized

    token = credentials.credentials

    try:
        signing_key = get_jwks_client().get_signing_key_from_jwt(token)

        payload = jwt.decode(
            token,
            signing_key.key,
            algorithms=["ES256", "RS256"],
            audience="authenticated",
            issuer=f"{SUPABASE_URL.rstrip('/')}/auth/v1",
            options={
                "require": ["exp", "sub", "iss", "aud"],
            },
            leeway=30,
        )

        user_id = UUID(payload["sub"])

        return user_id

    except (jwt.PyJWTError, ValueError, KeyError, TypeError):
        raise unauthorized
    except Exception:
        raise unauthorized
