import os

from cryptography.fernet import Fernet
from typing import Optional, Tuple


def get_fernet() -> Fernet:
    """
    Returns a Fernet instance for encrypting/decrypting secrets.

    The key must be provided via env var `GALAGO_SECRETS_KEY` and should be a
    urlsafe-base64-encoded 32-byte key.

    Generate one with:
      python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
    """
    key = os.environ.get("GALAGO_SECRETS_KEY")
    if not key:
        raise RuntimeError(
            "Missing GALAGO_SECRETS_KEY (required to encrypt/decrypt secrets)."
        )
    try:
        return Fernet(key.encode("utf-8"))
    except Exception as e:
        raise RuntimeError(
            "Invalid GALAGO_SECRETS_KEY (must be a urlsafe-base64-encoded 32-byte Fernet key)."
        ) from e


def secrets_key_status() -> Tuple[bool, Optional[str]]:
    """
    Returns (configured, message). Never raises.
    """
    try:
        get_fernet()
        return True, None
    except Exception as e:
        return False, str(e)


def encrypt_secret(plaintext: str) -> str:
    f = get_fernet()
    token = f.encrypt(plaintext.encode("utf-8"))
    return token.decode("utf-8")


def decrypt_secret(token: str) -> str:
    f = get_fernet()
    plaintext = f.decrypt(token.encode("utf-8"))
    return plaintext.decode("utf-8")
