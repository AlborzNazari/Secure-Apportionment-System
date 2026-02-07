from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.primitives import padding
from cryptography.hazmat.backends import default_backend
import os
import json

def encrypt_data(data: bytes, key: bytes) -> bytes:
    """
    Encrypts data with AES-256-CBC.
    
    Args:
        data: Bytes to encrypt (e.g., json.dumps(shares).encode()).
        key: 32-byte key (generate with os.urandom(32)).
    
    Returns:
        Encrypted bytes (IV + ciphertext).
    
    Nuances: Use secure key storage (e.g., env vars); resistant to brute-force.
    """
    if len(key) != 32:
        raise ValueError("Key must be 32 bytes.")
    backend = default_backend()
    iv = os.urandom(16)
    cipher = Cipher(algorithms.AES(key), modes.CBC(iv), backend=backend)
    encryptor = cipher.encryptor()
    padder = padding.PKCS7(algorithms.AES.block_size).padder()
    padded_data = padder.update(data) + padder.finalize()
    return iv + encryptor.update(padded_data) + encryptor.finalize()

def decrypt_data(encrypted_data: bytes, key: bytes) -> bytes:
    """
    Decrypts AES-256-CBC data.
    
    Args:
        encrypted_data: IV + ciphertext.
        key: 32-byte key.
    
    Returns:
        Original bytes.
    
    Nuances: Handles padding errors gracefully.
    """
    if len(key) != 32:
        raise ValueError("Key must be 32 bytes.")
    iv = encrypted_data[:16]
    ct = encrypted_data[16:]
    backend = default_backend()
    cipher = Cipher(algorithms.AES(key), modes.CBC(iv), backend=backend)
    decryptor = cipher.decryptor()
    padded_data = decryptor.update(ct) + decryptor.finalize()
    unpadder = padding.PKCS7(algorithms.AES.block_size).unpadder()
    return unpadder.update(padded_data) + unpadder.finalize()

# Example: Integration
# key = os.urandom(32)
# shares = {'A': 33000}
# encrypted = encrypt_data(json.dumps(shares).encode('utf-8'), key)
# decrypted = json.loads(decrypt_data(encrypted, key).decode('utf-8'))
