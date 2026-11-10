"""AES-256-GCM authenticated encryption for vote data and results."""

import os

from cryptography.exceptions import InvalidTag
from cryptography.hazmat.primitives.ciphers.aead import AESGCM

KEY_SIZE = 32    # 256-bit key
NONCE_SIZE = 12  # 96-bit nonce, the size GCM is designed for
TAG_SIZE = 16    # 128-bit authentication tag, appended by AESGCM

__all__ = ["generate_key", "encrypt_data", "decrypt_data", "InvalidTag"]


def generate_key() -> bytes:
    """Return a fresh random 32-byte key."""
    return AESGCM.generate_key(bit_length=256)


def _check_key(key: bytes) -> None:
    if len(key) != KEY_SIZE:
        raise ValueError("Key must be 32 bytes.")


def encrypt_data(data: bytes, key: bytes) -> bytes:
    """
    Encrypts data with AES-256-GCM.

    Returns:
        nonce (12 bytes) + ciphertext + tag (16 bytes).

    A fresh random nonce is used for every call, so the same key can
    encrypt many messages safely.
    """
    _check_key(key)
    nonce = os.urandom(NONCE_SIZE)
    return nonce + AESGCM(key).encrypt(nonce, data, None)


def decrypt_data(encrypted_data: bytes, key: bytes) -> bytes:
    """
    Decrypts AES-256-GCM data produced by encrypt_data().

    Raises:
        InvalidTag: if the key is wrong or any byte was changed.
        ValueError: if the key length is wrong or the input is too short.
    """
    _check_key(key)
    if len(encrypted_data) < NONCE_SIZE + TAG_SIZE:
        raise ValueError("Encrypted data is too short.")
    nonce = encrypted_data[:NONCE_SIZE]
    return AESGCM(key).decrypt(nonce, encrypted_data[NONCE_SIZE:], None)
